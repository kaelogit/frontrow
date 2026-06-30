"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2 } from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "viem";
import type { CryptoPaymentOption } from "@/lib/crypto/payment-options";
import type { CryptoQuote } from "@/lib/crypto/prices";
import { postCryptoConfirmation } from "@/lib/crypto/post-confirmation";

interface EvmCryptoPayWalletProps {
  reference: string;
  offerToken?: string;
  option: CryptoPaymentOption;
  receiveAddress: `0x${string}`;
  quote: CryptoQuote | null;
  onPaid: () => void;
}

type PayPhase = "idle" | "signing" | "confirming" | "verifying";

export function EvmCryptoPayWallet({
  reference,
  offerToken,
  option,
  receiveAddress,
  quote,
  onPaid,
}: EvmCryptoPayWalletProps) {
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const chainId = option.chainId!;

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  useEffect(() => {
    if (!txConfirmed || !txHash || phase !== "confirming") return;
    let cancelled = false;

    async function confirmOnServer() {
      setPhase("verifying");
      setError("");
      try {
        await postCryptoConfirmation(
          reference,
          {
            paymentId: option.id,
            txHash,
            chainId,
          },
          offerToken
        );
        if (!cancelled) onPaid();
      } catch (err) {
        if (!cancelled) {
          setPhase("idle");
          setError(err instanceof Error ? err.message : "Confirmation failed");
        }
      }
    }

    void confirmOnServer();
    return () => {
      cancelled = true;
    };
  }, [txConfirmed, txHash, phase, reference, offerToken, option.id, chainId, onPaid]);

  const busy = phase !== "idle";
  const wrongChain = isConnected && chain?.id !== chainId;

  const handlePay = async () => {
    setError("");
    if (!address || !quote) {
      setError("Connect your wallet and wait for the quote.");
      return;
    }

    try {
      if (chain?.id !== chainId) {
        await switchChainAsync({ chainId });
      }
      setPhase("signing");

      let hash: `0x${string}`;
      if (option.evmKind === "native") {
        hash = await sendTransactionAsync({
          to: receiveAddress,
          value: BigInt(quote.amountRaw),
          chainId,
        });
      } else if (option.contractAddress) {
        hash = await writeContractAsync({
          address: option.contractAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [receiveAddress, BigInt(quote.amountRaw)],
          chainId,
        });
      } else {
        throw new Error("Invalid token configuration");
      }

      setTxHash(hash);
      setPhase("confirming");
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ConnectButton chainStatus="icon" showBalance={false} />
        {isConnected && (
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={busy || wrongChain || !quote}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "signing"
              ? "Confirm in wallet…"
              : phase === "confirming"
                ? "Waiting for blockchain…"
                : phase === "verifying"
                  ? "Verifying payment…"
                  : `Pay ${option.symbol}`}
          </button>
        )}
      </div>
      {wrongChain && (
        <p className="text-sm text-amber-700">Switch to {option.chainName} in your wallet.</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
