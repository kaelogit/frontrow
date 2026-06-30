import { NextResponse } from "next/server";
import { z } from "zod";
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

  try {
    let offer;
    if (parsed.data.kind === "crypto") {
      offer = await createCryptoOffer({
        order_id: order.id,
        order_reference: order.reference,
        amount: parsed.data.amount,
        currency: order.currency,
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
  } catch (err) {
    console.error("payment-offer create:", err);
    const message = err instanceof Error ? err.message : "Failed to create link";
    if (message.includes("payment_offers") || message.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Payment links table not found. Run Supabase migrations 014 and 015, then try again.",
        },
        { status: 500 }
      );
    }
    if (message.includes("Payment credential not found")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
