import {
  createPublicClient,
  decodeEventLog,
  erc20Abi,
  http,
  type Hash,
} from "viem";
import { base, bsc, mainnet } from "viem/chains";
import { getEvmReceiveAddress } from "@/lib/crypto/config";
import {
  getCryptoPaymentOption,
  usdToStablecoinAmount,
  type CryptoPaymentId,
} from "@/lib/crypto/payment-options";
import { quoteCryptoPayment } from "@/lib/crypto/prices";

function getChainClient(chainId: number) {
  if (chainId === base.id) {
    return createPublicClient({ chain: base, transport: http() });
  }
  if (chainId === mainnet.id) {
    return createPublicClient({ chain: mainnet, transport: http() });
  }
  if (chainId === bsc.id) {
    return createPublicClient({ chain: bsc, transport: http() });
  }
  return null;
}

export async function verifyEvmPayment(input: {
  txHash: Hash;
  chainId: number;
  paymentId: CryptoPaymentId;
  expectedUsd: number;
}) {
  const receiveAddress = getEvmReceiveAddress();
  if (!receiveAddress) {
    return { ok: false as const, error: "EVM receive address is not configured" };
  }

  const option = getCryptoPaymentOption(input.paymentId);
  if (!option || option.rail !== "evm" || option.chainId !== input.chainId) {
    return { ok: false as const, error: "Unsupported EVM payment option" };
  }

  const client = getChainClient(input.chainId);
  if (!client) {
    return { ok: false as const, error: "Unsupported chain" };
  }

  const receipt = await client.getTransactionReceipt({ hash: input.txHash });
  if (!receipt || receipt.status !== "success") {
    return { ok: false as const, error: "Transaction not found or failed" };
  }

  const quote = await quoteCryptoPayment(option, input.expectedUsd);
  const expectedMin = BigInt(quote.amountRaw);

  if (option.evmKind === "native") {
    const tx = await client.getTransaction({ hash: input.txHash });
    if (
      tx.to?.toLowerCase() === receiveAddress.toLowerCase() &&
      tx.value >= expectedMin
    ) {
      return { ok: true as const };
    }
    return { ok: false as const, error: "Native transfer amount or recipient mismatch" };
  }

  if (!option.contractAddress) {
    return { ok: false as const, error: "Token contract missing" };
  }

  let received = BigInt(0);
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== option.contractAddress.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        eventName: "Transfer",
        data: log.data,
        topics: log.topics,
      });
      if (decoded.args.to?.toLowerCase() === receiveAddress.toLowerCase()) {
        received += decoded.args.value ?? BigInt(0);
      }
    } catch {
      // skip
    }
  }

  if (received < expectedMin) {
    return { ok: false as const, error: "Payment amount is below order total" };
  }

  return { ok: true as const };
}
