import { getBtcReceiveAddress } from "@/lib/crypto/config";
import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";
import { quoteCryptoPayment } from "@/lib/crypto/prices";

interface BlockstreamTx {
  txid: string;
  status?: { confirmed?: boolean };
  vout: { scriptpubkey_address?: string; value: number }[];
}

export async function verifyBtcPayment(input: {
  txid: string;
  expectedUsd: number;
}) {
  const receiveAddress = getBtcReceiveAddress();
  if (!receiveAddress) {
    return { ok: false as const, error: "Bitcoin receive address is not configured" };
  }

  const option = getCryptoPaymentOption("btc-bitcoin");
  if (!option) {
    return { ok: false as const, error: "BTC payments are not configured" };
  }

  const quote = await quoteCryptoPayment(option, input.expectedUsd);
  const expectedSats = BigInt(quote.amountRaw);

  const res = await fetch(`https://blockstream.info/api/tx/${input.txid}`);
  if (!res.ok) {
    return { ok: false as const, error: "Bitcoin transaction not found" };
  }

  const tx = (await res.json()) as BlockstreamTx;
  if (!tx.status?.confirmed) {
    return { ok: false as const, error: "Bitcoin transaction not confirmed yet" };
  }

  let received = BigInt(0);
  for (const out of tx.vout) {
    if (out.scriptpubkey_address === receiveAddress) {
      received += BigInt(out.value);
    }
  }

  if (received < expectedSats) {
    return { ok: false as const, error: "BTC amount is below order total" };
  }

  return { ok: true as const };
}
