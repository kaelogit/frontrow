import { z } from "zod";
import { NextResponse } from "next/server";
import { getReceiveAddressForPayment } from "@/lib/crypto/config";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";
import { enforceRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

export async function GET(request: Request) {
  const gate = await enforceRateLimit({ request, ...RATE_LIMITS.cryptoQuote });
  if (!gate.ok) return gate.response;

  const paymentId = new URL(request.url).searchParams.get("paymentId");
  const parsed = z
    .object({ paymentId: z.enum(CRYPTO_PAYMENT_IDS) })
    .safeParse({ paymentId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment option" }, { status: 400 });
  }

  const address = getReceiveAddressForPayment(parsed.data.paymentId);
  if (!address) {
    return NextResponse.json(
      { error: "Receive address not configured for this coin" },
      { status: 404 }
    );
  }

  return NextResponse.json({ address });
}
