import { z } from "zod";
import { NextResponse } from "next/server";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";
import { verifyCryptoPayment } from "@/lib/crypto/verify-payment";
import { hasSupabaseConfig, createAdminClient } from "@/lib/supabase/admin";
import { getDemoOrder, updateDemoOrder } from "@/lib/orders/demo-store";
import { enforceRateLimit } from "@/lib/rate-limit";

const confirmSchema = z.object({
  reference: z.string().min(4),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chainId: z.number().int().positive(),
  tokenId: z.enum(["usdc-base", "usdc-ethereum"]),
});

export async function POST(request: Request) {
  try {
    if (!isCryptoPaymentsEnabled()) {
      return NextResponse.json(
        { error: "Crypto payments are not configured" },
        { status: 503 }
      );
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

    const { reference, txHash, chainId, tokenId } = parsed.data;

    if (hasSupabaseConfig()) {
      const supabase = createAdminClient();

      const { data: order, error } = await supabase
        .from("orders")
        .select("id, status, payment_method, total_amount, payment_external_id")
        .eq("reference", reference)
        .single();

      if (error || !order) {
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

      if (order.payment_external_id === txHash) {
        return NextResponse.json({ ok: true, status: "paid" });
      }

      const verification = await verifyCryptoPayment({
        txHash: txHash as `0x${string}`,
        chainId,
        tokenId,
        expectedUsd: Number(order.total_amount),
      });

      if (!verification.ok) {
        return NextResponse.json(
          { error: verification.error ?? "Payment verification failed" },
          { status: 400 }
        );
      }

      const paidAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_external_id: txHash,
          paid_at: paidAt,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(updateError);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, status: "paid" });
    }

    const demoOrder = getDemoOrder(reference);
    if (!demoOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (demoOrder.payment_method !== "crypto") {
      return NextResponse.json({ error: "Order is not a crypto checkout" }, { status: 400 });
    }

    if (demoOrder.payment_external_id === txHash) {
      return NextResponse.json({ ok: true, status: demoOrder.status });
    }

    const verification = await verifyCryptoPayment({
      txHash: txHash as `0x${string}`,
      chainId,
      tokenId,
      expectedUsd: demoOrder.total_amount,
    });

    if (!verification.ok) {
      return NextResponse.json(
        { error: verification.error ?? "Payment verification failed" },
        { status: 400 }
      );
    }

    updateDemoOrder(reference, {
      status: "paid",
      payment_external_id: txHash,
      paid_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
