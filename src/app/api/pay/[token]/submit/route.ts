import { NextResponse } from "next/server";
import { sendPaymentSubmittedEmails } from "@/lib/email";
import { getDemoOrder } from "@/lib/orders/demo-store";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import {
  buildPublicOfferView,
  getOfferByToken,
  markOfferSubmitted,
  uploadPaymentReceipt,
} from "@/lib/payments/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const view = await buildPublicOfferView(token);
  const offer = await getOfferByToken(token);

  if (!view || !offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!view.canSubmit) {
    return NextResponse.json({ error: "Cannot submit payment" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("receipt");
  const customerNote = String(form.get("note") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Receipt required" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const receiptUrl = await uploadPaymentReceipt(token, file);
  const { offer: updated } = await markOfferSubmitted(offer.id, {
    receipt_url: receiptUrl,
    receipt_filename: file.name,
    customer_note: customerNote,
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
      receiptUrl,
      customerNote,
    });
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
