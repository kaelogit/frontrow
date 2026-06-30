import { NextResponse } from "next/server";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";
import {
  cryptoConfirmSchema,
  externalIdFromConfirm,
} from "@/lib/crypto/confirm-schema";
import { verifyCryptoPayment } from "@/lib/crypto/verify-payment";
import { sendPaymentSubmittedEmails } from "@/lib/email";
import { getDemoOrder } from "@/lib/orders/demo-store";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import {
  buildPublicOfferView,
  getOfferByToken,
  markOfferSubmitted,
} from "@/lib/payments/store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    if (!isCryptoPaymentsEnabled()) {
      return NextResponse.json({ error: "Crypto payments are not configured" }, { status: 503 });
    }

    const { token } = await params;
    const view = await buildPublicOfferView(token);
    const offer = await getOfferByToken(token);

    if (!view || !offer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (offer.method_type !== "crypto") {
      return NextResponse.json({ error: "Not a crypto payment link" }, { status: 400 });
    }

    if (offer.status !== "active" || view.expired || !view.started) {
      return NextResponse.json({ error: "Payment link is not active" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = cryptoConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid confirmation data" }, { status: 400 });
    }

    const gate = await enforceRateLimit({ request, ...RATE_LIMITS.cryptoConfirm });
    if (!gate.ok) return gate.response;

    const { paymentId, txHash, chainId, signature, txid } = parsed.data;
    const externalId = externalIdFromConfirm(parsed.data);

    const verification = await verifyCryptoPayment({
      paymentId,
      expectedUsd: offer.amount,
      txHash: txHash as `0x${string}` | undefined,
      chainId,
      signature,
      txid,
    });

    if (!verification.ok) {
      return NextResponse.json(
        { error: verification.error ?? "Payment verification failed" },
        { status: 400 }
      );
    }

    await markOfferSubmitted(offer.id, {
      receipt_url: `crypto://${externalId}`,
      receipt_filename: null,
      customer_note: `${paymentId} · ${externalId}`,
    });

    const order =
      (await getAdminOrderByReference(offer.order_reference)) ??
      getDemoOrder(offer.order_reference);

    if (order) {
      await sendPaymentSubmittedEmails({
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderReference: order.reference,
        methodLabel: offer.method_label,
        amount: offer.amount,
        currency: offer.currency,
        receiptUrl: `crypto://${externalId}`,
        customerNote: `${paymentId} · ${externalId}`,
      });
    }

    return NextResponse.json({ ok: true, status: "submitted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
