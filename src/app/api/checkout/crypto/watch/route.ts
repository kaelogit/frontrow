import { NextResponse } from "next/server";
import { z } from "zod";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";
import { getReceiveAddressForPayment } from "@/lib/crypto/config";
import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";
import { quoteCryptoPayment } from "@/lib/crypto/prices";
import { getLatestCryptoWatch, registerCryptoWatch } from "@/lib/crypto/watch/store";
import { processCryptoWatches } from "@/lib/crypto/watch/process";

const registerSchema = z.object({
  reference: z.string().min(4),
  offerToken: z.string().optional(),
  paymentId: z.enum(CRYPTO_PAYMENT_IDS),
  totalUsd: z.number().positive(),
  expiresAt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { reference, offerToken, paymentId, totalUsd } = parsed.data;
    const option = getCryptoPaymentOption(paymentId);
    if (!option) {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }

    const receiveAddress = getReceiveAddressForPayment(paymentId);
    if (!receiveAddress) {
      return NextResponse.json({ error: "Receive address not configured" }, { status: 503 });
    }

    const quote = await quoteCryptoPayment(option, totalUsd);
    const expiresAt =
      parsed.data.expiresAt ??
      new Date(Date.now() + 25 * 60 * 1000).toISOString();

    const watch = await registerCryptoWatch({
      kind: offerToken ? "offer" : "order",
      orderReference: reference,
      offerToken: offerToken ?? null,
      paymentId,
      expectedAmountRaw: quote.amountRaw,
      expectedUsd: totalUsd,
      receiveAddress: String(receiveAddress),
      chainId: option.chainId ?? null,
      expiresAt,
    });

    // Opportunistic scan when customer opens pay screen
    await processCryptoWatches();

    return NextResponse.json({
      watching: true,
      status: watch.status,
      paymentId: watch.payment_id,
      amount: quote.amount,
      symbol: quote.symbol,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start watch" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const offerToken = searchParams.get("offerToken");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  await processCryptoWatches();

  const watch = await getLatestCryptoWatch({
    orderReference: reference,
    offerToken,
  });

  if (!watch) {
    return NextResponse.json({ status: "none" });
  }

  if (watch.status === "paid") {
    return NextResponse.json({
      status: "paid",
      externalId: watch.matched_tx_id,
      paymentId: watch.payment_id,
    });
  }

  if (new Date(watch.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({
    status: "watching",
    paymentId: watch.payment_id,
    lastScannedAt: watch.last_scanned_at,
  });
}
