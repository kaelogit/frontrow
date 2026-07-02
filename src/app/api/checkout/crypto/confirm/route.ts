import { z } from "zod";
import { NextResponse } from "next/server";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";
import { verifyCryptoPayment } from "@/lib/crypto/verify-payment";
import { finalizeOrderCryptoPayment } from "@/lib/crypto/watch/finalize";
import { getDemoOrder } from "@/lib/orders/demo-store";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import { enforceRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

const EVM_PAYMENTS = [
  "usdc-base",
  "usdc-ethereum",
  "usdt-ethereum",
  "eth-ethereum",
  "bnb-bsc",
  "usdt-bsc",
] as const;

const TXID_PAYMENTS = [
  "btc-bitcoin",
  "ltc-litecoin",
  "doge-dogecoin",
  "trx-tron",
  "usdt-tron",
  "ton-toncoin",
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
    txid: z.string().min(32).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    if ((EVM_PAYMENTS as readonly string[]).includes(data.paymentId)) {
      if (!data.txHash) ctx.addIssue({ code: "custom", message: "txHash required", path: ["txHash"] });
      if (!data.chainId) ctx.addIssue({ code: "custom", message: "chainId required", path: ["chainId"] });
    }
    if (data.paymentId === "sol-solana" && !data.signature) {
      ctx.addIssue({ code: "custom", message: "signature required", path: ["signature"] });
    }
    if ((TXID_PAYMENTS as readonly string[]).includes(data.paymentId) && !data.txid) {
      ctx.addIssue({ code: "custom", message: "txid required", path: ["txid"] });
    }
  });

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

    const gate = await enforceRateLimit({ request, ...RATE_LIMITS.cryptoConfirm });
    if (!gate.ok) return gate.response;

    const { reference, paymentId, txHash, chainId, signature, txid } = parsed.data;
    const externalId = txHash ?? signature ?? txid!;

    const order =
      (await getAdminOrderByReference(reference)) ?? getDemoOrder(reference);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_method !== "crypto") {
      return NextResponse.json({ error: "Order is not a crypto checkout" }, { status: 400 });
    }
    if (order.status === "paid" || order.status === "ticket_issued" || order.status === "completed") {
      return NextResponse.json({ ok: true, status: order.status });
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: "Order cannot accept payment" }, { status: 409 });
    }
    if (order.payment_external_id === externalId) {
      return NextResponse.json({ ok: true, status: "paid" });
    }

    const verification = await verifyCryptoPayment({
      paymentId,
      expectedUsd: order.total_amount,
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

    const result = await finalizeOrderCryptoPayment({
      reference,
      paymentId,
      externalId,
    });

    if (result === "not_found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (result === "invalid") {
      return NextResponse.json({ error: "Order cannot accept payment" }, { status: 409 });
    }

    return NextResponse.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
