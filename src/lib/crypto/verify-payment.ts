import type { Hash } from "viem";
import type { CryptoPaymentId } from "@/lib/crypto/payment-options";
import { verifyBtcPayment } from "@/lib/crypto/verify-btc";
import { verifyEvmPayment } from "@/lib/crypto/verify-evm";
import { verifySolanaPayment } from "@/lib/crypto/verify-solana";

export async function verifyCryptoPayment(input: {
  paymentId: CryptoPaymentId;
  expectedUsd: number;
  txHash?: Hash;
  chainId?: number;
  signature?: string;
  txid?: string;
}) {
  const option = input.paymentId;

  if (
    option === "usdc-base" ||
    option === "usdc-ethereum" ||
    option === "usdt-ethereum" ||
    option === "eth-ethereum" ||
    option === "bnb-bsc" ||
    option === "usdt-bsc"
  ) {
    if (!input.txHash || !input.chainId) {
      return { ok: false as const, error: "Missing EVM transaction" };
    }
    return verifyEvmPayment({
      txHash: input.txHash,
      chainId: input.chainId,
      paymentId: option,
      expectedUsd: input.expectedUsd,
    });
  }

  if (option === "sol-solana") {
    if (!input.signature) {
      return { ok: false as const, error: "Missing Solana transaction signature" };
    }
    return verifySolanaPayment({
      signature: input.signature,
      expectedUsd: input.expectedUsd,
    });
  }

  if (option === "btc-bitcoin") {
    if (!input.txid) {
      return { ok: false as const, error: "Missing Bitcoin transaction ID" };
    }
    return verifyBtcPayment({ txid: input.txid, expectedUsd: input.expectedUsd });
  }

  return { ok: false as const, error: "Unsupported payment method" };
}
