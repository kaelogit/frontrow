import { z } from "zod";
import { NextResponse } from "next/server";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";
import { verifyCryptoPayment } from "@/lib/crypto/verify-payment";
import { hasSupabaseConfig, createAdminClient } from "@/lib/supabase/admin";
import { getDemoOrder, updateDemoOrder } from "@/lib/orders/demo-store";
import { enforceRateLimit } from "@/lib/rate-limit";

const EVM_PAYMENTS = [
  "usdc-base",
  "usdc-ethereum",
  "usdt-ethereum",
  "eth-ethereum",
  "bnb-bsc",
  "usdt-bsc",
] as const;

const confirmSchema = z
  .object({
    reference: z.string().min(4),
    paymentId: z.enum(CRYPTO_PAYMENT_IDS),
    txHash: z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .optional(),
    chainId: z.number().int().positive().optional(),
    signature: z.string().min(32).max(128).optional(),
    txid: z
      .string()
      .regex(/^[a-fA-F0-9]{64}$/)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if ((EVM_PAYMENTS as readonly string[]).includes(data.paymentId)) {
      if (!data.txHash) ctx.addIssue({ code: "custom", message: "txHash required", path: ["txHash"] });
      if (!data.chainId) ctx.addIssue({ code: "custom", message: "chainId required", path: ["chainId"] });
    }
    if (data.paymentId === "sol-solana" && !data.signature) {
      ctx.addIssue({ code: "custom", message: "signature required", path: ["signature"] });
    }
    if (data.paymentId === "btc-bitcoin" && !data.txid) {
      ctx.addIssue({ code: "custom", message: "txid required", path: ["txid"] });
    }
  });

async function loadPendingCryptoOrder(reference: string) {
  if (hasSupabaseConfig()) {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, payment_method, total_amount, payment_external_id")
      .eq("reference", reference)
      .single();

    if (error || !order) return null;
    return {
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

export async function POST(request: Request) {
  try {
    if (!isCryptoPaymentsEnabled()) {
      return NextResponse.json({ error: "Crypto payments are not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid confirmation data" }, { status: 400 });
    }

    const gate = await enforceRateLimit({
      request,
      id: "crypto_confirm",
      scope: "ip",
      windowSeconds: 60,
      limit: 20,
    });
    if (!gate.ok) return gate.response;

    const { reference, paymentId, txHash, chainId, signature, txid } = parsed.data;
    const externalId = txHash ?? signature ?? txid!;

    const order = await loadPendingCryptoOrder(reference);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentMethod !== "crypto") {
      return NextResponse.json({ error: "Order is not a crypto checkout" }, { status: 400 });
    }
    if (order.status === "paid" || order.status === "ticket_issued" || order.status === "completed") {
      return NextResponse.json({ ok: true, status: order.status });
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: "Order cannot accept payment" }, { status: 409 });
    }
    if (order.paymentExternalId === externalId) {
      return NextResponse.json({ ok: true, status: "paid" });
    }

    const verification = await verifyCryptoPayment({
      paymentId,
      expectedUsd: order.totalUsd,
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

    await order.markPaid(externalId);
    return NextResponse.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
