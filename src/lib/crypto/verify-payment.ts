import {
  createPublicClient,
  decodeEventLog,
  erc20Abi,
  http,
  type Hash,
} from "viem";
import { base, mainnet } from "viem/chains";
import {
  getCryptoPaymentToken,
  getCryptoReceiveAddress,
  usdToTokenAmount,
  type CryptoPaymentTokenId,
} from "@/lib/crypto/config";

function getChainClient(chainId: number) {
  if (chainId === base.id) {
    return createPublicClient({ chain: base, transport: http() });
  }
  if (chainId === mainnet.id) {
    return createPublicClient({ chain: mainnet, transport: http() });
  }
  return null;
}

export interface VerifyCryptoPaymentInput {
  txHash: Hash;
  chainId: number;
  tokenId: CryptoPaymentTokenId;
  expectedUsd: number;
}

export interface VerifyCryptoPaymentResult {
  ok: boolean;
  error?: string;
  receivedAmount?: bigint;
}

export async function verifyCryptoPayment(
  input: VerifyCryptoPaymentInput
): Promise<VerifyCryptoPaymentResult> {
  const receiveAddress = getCryptoReceiveAddress();
  if (!receiveAddress) {
    return { ok: false, error: "Crypto receive address is not configured" };
  }

  const token = getCryptoPaymentToken(input.tokenId);
  if (!token || token.chainId !== input.chainId) {
    return { ok: false, error: "Unsupported token or chain" };
  }

  const client = getChainClient(input.chainId);
  if (!client) {
    return { ok: false, error: "Unsupported chain" };
  }

  const receipt = await client.getTransactionReceipt({ hash: input.txHash });
  if (!receipt || receipt.status !== "success") {
    return { ok: false, error: "Transaction not found or failed" };
  }

  const expectedMin = usdToTokenAmount(input.expectedUsd, token.decimals);
  let received = BigInt(0);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== token.contractAddress.toLowerCase()) {
      continue;
    }
    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        eventName: "Transfer",
        data: log.data,
        topics: log.topics,
      });
      if (
        decoded.args.to?.toLowerCase() === receiveAddress.toLowerCase()
      ) {
        received += decoded.args.value ?? BigInt(0);
      }
    } catch {
      // Not a Transfer log — skip.
    }
  }

  if (received < expectedMin) {
    return {
      ok: false,
      error: "Payment amount is below order total",
      receivedAmount: received,
    };
  }

  return { ok: true, receivedAmount: received };
}
