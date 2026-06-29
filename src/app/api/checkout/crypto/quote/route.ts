import { z } from "zod";
import { NextResponse } from "next/server";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";
import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";
import { quoteCryptoPayment } from "@/lib/crypto/prices";
import { enforceRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

export async function GET(request: Request) {
  const gate = await enforceRateLimit({ request, ...RATE_LIMITS.cryptoQuote });
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const usdRaw = searchParams.get("usd");

  const parsed = z
    .object({
      paymentId: z.enum(CRYPTO_PAYMENT_IDS),
      usd: z.coerce.number().positive(),
    })
    .safeParse({ paymentId, usd: usdRaw });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote request" }, { status: 400 });
  }

  const option = getCryptoPaymentOption(parsed.data.paymentId);
  if (!option) {
    return NextResponse.json({ error: "Unknown payment option" }, { status: 400 });
  }

  try {
    const quote = await quoteCryptoPayment(option, parsed.data.usd);
    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Quote failed" },
      { status: 502 }
    );
  }
}
