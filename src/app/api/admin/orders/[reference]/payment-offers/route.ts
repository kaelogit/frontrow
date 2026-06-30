import { NextResponse } from "next/server";
import { z } from "zod";
import { CRYPTO_PAYMENT_IDS, type CryptoPaymentId } from "@/lib/crypto/payment-options";
import { getAdminSession } from "@/lib/auth/session";
import { sendPaymentOfferEmail } from "@/lib/email";
import { getDemoOrder } from "@/lib/orders/demo-store";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import {
  createCryptoOffer,
  createOfferFromCredential,
  listOffersForOrder,
} from "@/lib/payments/store";
import { paymentOfferUrl } from "@/lib/payments/tokens";

const createSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("credential"),
    credential_id: z.string(),
    amount: z.number().positive(),
    expiry_minutes: z.number().int().positive(),
    send_email: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("crypto"),
    crypto_payment_id: z.enum(CRYPTO_PAYMENT_IDS as unknown as [CryptoPaymentId, ...CryptoPaymentId[]]),
    amount: z.number().positive(),
    expiry_minutes: z.number().int().positive(),
    send_email: z.boolean().optional(),
  }),
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference } = await params;
  const offers = await listOffersForOrder(reference);
  return NextResponse.json({
    offers: offers.map((o) => ({
      ...o,
      url: paymentOfferUrl(o.token),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference } = await params;
  const order =
    (await getAdminOrderByReference(reference)) ?? getDemoOrder(reference);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }


  let offer;
  if (parsed.data.kind === "crypto") {
    offer = await createCryptoOffer({
      order_id: order.id,
      order_reference: order.reference,
      amount: parsed.data.amount,
      currency: order.currency,
      crypto_payment_id: parsed.data.crypto_payment_id,
      expiry_minutes: parsed.data.expiry_minutes,
      created_by: session.email,
    });
  } else {
    offer = await createOfferFromCredential({
      order_id: order.id,
      order_reference: order.reference,
      credential_id: parsed.data.credential_id,
      amount: parsed.data.amount,
      currency: order.currency,
      expiry_minutes: parsed.data.expiry_minutes,
      created_by: session.email,
    });
  }

  if (parsed.data.send_email) {
    await sendPaymentOfferEmail({
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      orderReference: order.reference,
      amount: offer.amount,
      currency: offer.currency,
      methodLabel: offer.method_label,
      token: offer.token,
      expiryMinutes: offer.expiry_minutes,
    });
  }

  return NextResponse.json({
    offer: { ...offer, url: paymentOfferUrl(offer.token) },
  });
}
