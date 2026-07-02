import type { CryptoPaymentId } from "@/lib/crypto/payment-options";
import { sendCryptoPaidEmails, sendPaymentSubmittedEmails } from "@/lib/email";
import { getDemoOrder, updateDemoOrder } from "@/lib/orders/demo-store";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import { hasSupabaseConfig, createAdminClient } from "@/lib/supabase/admin";
import { markOfferSubmitted } from "@/lib/payments/store";
import type { CryptoPaymentWatch } from "@/lib/crypto/watch/types";

export async function finalizeOrderCryptoPayment(input: {
  reference: string;
  paymentId: CryptoPaymentId;
  externalId: string;
}): Promise<"paid" | "already_paid" | "not_found" | "invalid"> {
  const order = await loadPendingCryptoOrder(input.reference);
  if (!order) return "not_found";
  if (order.paymentMethod !== "crypto") return "invalid";

  if (order.status === "paid" || order.status === "ticket_issued" || order.status === "completed") {
    return "already_paid";
  }
  if (order.status !== "pending_payment") return "invalid";
  if (order.paymentExternalId === input.externalId) return "already_paid";

  await order.markPaid(input.externalId);
  await sendCryptoPaidEmails({
    reference: order.reference,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.totalUsd,
    currency: order.currency,
    paymentId: input.paymentId,
    externalId: input.externalId,
  });
  return "paid";
}

export async function finalizeOfferCryptoPayment(input: {
  offerToken: string;
  orderReference: string;
  paymentId: CryptoPaymentId;
  externalId: string;
}): Promise<"submitted" | "already" | "not_found"> {
  const { getOfferByToken } = await import("@/lib/payments/store");
  const offer = await getOfferByToken(input.offerToken);
  if (!offer || offer.method_type !== "crypto") return "not_found";
  if (offer.status === "submitted" || offer.status === "paid") return "already";

  await markOfferSubmitted(offer.id, {
    receipt_url: `crypto://${input.externalId}`,
    receipt_filename: null,
    customer_note: `${input.paymentId} · ${input.externalId} (auto-detected)`,
  });

  const order =
    (await getAdminOrderByReference(input.orderReference)) ??
    getDemoOrder(input.orderReference);

  if (order) {
    await sendPaymentSubmittedEmails({
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      orderReference: order.reference,
      methodLabel: offer.method_label,
      amount: offer.amount,
      currency: offer.currency,
      receiptUrl: `crypto://${input.externalId}`,
      customerNote: `${input.paymentId} · auto-detected`,
    });
  }

  return "submitted";
}

async function loadPendingCryptoOrder(reference: string) {
  if (hasSupabaseConfig()) {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, reference, status, payment_method, total_amount, payment_external_id, customer_name, customer_email, currency"
      )
      .eq("reference", reference)
      .single();

    if (error || !order) return null;
    return {
      reference: order.reference as string,
      customerName: order.customer_name as string,
      customerEmail: order.customer_email as string,
      currency: (order.currency as string) ?? "USD",
      totalUsd: Number(order.total_amount),
      status: order.status as string,
      paymentMethod: order.payment_method as string,
      paymentExternalId: order.payment_external_id as string | null,
      markPaid: async (externalId: string) => {
        const paidAt = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "paid", payment_external_id: externalId, paid_at: paidAt })
          .eq("id", order.id);
        if (updateError) throw updateError;
      },
    };
  }

  const demo = getDemoOrder(reference);
  if (!demo) return null;
  return {
    reference: demo.reference,
    customerName: demo.customer_name,
    customerEmail: demo.customer_email,
    currency: demo.currency,
    totalUsd: demo.total_amount,
    status: demo.status,
    paymentMethod: demo.payment_method,
    paymentExternalId: demo.payment_external_id,
    markPaid: async (externalId: string) => {
      updateDemoOrder(reference, {
        status: "paid",
        payment_external_id: externalId,
        paid_at: new Date().toISOString(),
      });
    },
  };
}

export async function finalizeCryptoWatch(watch: CryptoPaymentWatch, txId: string) {
  if (watch.kind === "offer" && watch.offer_token) {
    return finalizeOfferCryptoPayment({
      offerToken: watch.offer_token,
      orderReference: watch.order_reference,
      paymentId: watch.payment_id,
      externalId: txId,
    });
  }

  return finalizeOrderCryptoPayment({
    reference: watch.order_reference,
    paymentId: watch.payment_id,
    externalId: txId,
  });
}
