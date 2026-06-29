import { verifyUtxoPayment } from "@/lib/crypto/verify-utxo";

/** @deprecated Use verifyUtxoPayment */
export async function verifyBtcPayment(input: { txid: string; expectedUsd: number }) {
  return verifyUtxoPayment({
    paymentId: "btc-bitcoin",
    txid: input.txid,
    expectedUsd: input.expectedUsd,
  });
}
