import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

interface ConfirmPayload {
  paymentId: CryptoPaymentId;
  txHash?: string;
  chainId?: number;
  signature?: string;
  txid?: string;
}

/** POST on-chain confirmation for checkout orders or admin payment links. */
export async function postCryptoConfirmation(
  reference: string,
  payload: ConfirmPayload,
  offerToken?: string
): Promise<void> {
  const url = offerToken
    ? `/api/pay/${encodeURIComponent(offerToken)}/crypto-confirm`
    : "/api/checkout/crypto/confirm";

  const body = offerToken ? payload : { reference, ...payload };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not confirm payment");
}
