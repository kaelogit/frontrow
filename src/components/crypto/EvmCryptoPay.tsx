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
import { getEvmReceiveAddress } from "@/lib/crypto/config";
import { buildEthPaymentUri } from "@/lib/crypto/payment-uri";
import type { CryptoPaymentOption } from "@/lib/crypto/payment-options";
import type { CryptoQuote } from "@/lib/crypto/prices";
import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";

interface EvmCryptoPayProps {
  reference: string;
  option: CryptoPaymentOption;
  totalUsd: number;
  onPaid: () => void;
}

type PayPhase = "idle" | "signing" | "confirming" | "verifying";

export function EvmCryptoPay({ reference, option, totalUsd, onPaid }: EvmCryptoPayProps) {
  const receiveAddress = getEvmReceiveAddress();
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [quote, setQuote] = useState<CryptoQuote | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: option.chainId,
  });

  useEffect(() => {
    let cancelled = false;
    async function loadQuote() {
      try {
        const res = await fetch(
          `/api/checkout/crypto/quote?paymentId=${option.id}&usd=${totalUsd}`
        );
        const data = (await res.json()) as CryptoQuote & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Quote failed");
        if (!cancelled) setQuote(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load price");
        }
      }
    }
    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [option.id, totalUsd]);

  useEffect(() => {
    if (!txConfirmed || !txHash || phase !== "confirming") return;
    let cancelled = false;

    async function confirmOnServer() {
      setPhase("verifying");
      setError("");
      try {
        const res = await fetch("/api/checkout/crypto/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference,
            paymentId: option.id,
            txHash,
            chainId: option.chainId,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not confirm payment");
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
  }, [txConfirmed, txHash, phase, reference, option.id, option.chainId, onPaid]);

  if (!receiveAddress || !option.chainId) return null;

  const chainId = option.chainId;
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
      {quote && (
        <p className="text-sm text-slate-600">
          Send <span className="font-semibold text-slate-900">{quote.amount} {quote.symbol}</span>
          {quote.priceUsd && quote.priceUsd !== 1 ? (
            <span className="text-slate-400"> · ~${quote.priceUsd.toLocaleString()} / {quote.symbol}</span>
          ) : null}
        </p>
      )}
      {wrongChain && (
        <p className="text-sm text-amber-700">Switch to {option.chainName} in your wallet.</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="border-t border-slate-200 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Or scan &amp; send manually
        </p>
        <CryptoReceiveAddressCard
          address={receiveAddress}
          qrValue={
            option.evmKind === "native" && quote
              ? buildEthPaymentUri(receiveAddress, quote.amountRaw)
              : receiveAddress
          }
          title={`${option.symbol} on ${option.chainName}`}
          amountLabel={
            quote ? `${quote.amount} ${option.symbol}` : undefined
          }
          hint={
            option.evmKind === "erc20"
              ? `Scan or copy, then send ${option.symbol} on ${option.chainName} only.`
              : "Scan in Trust Wallet — QR prefills amount for ETH when supported."
          }
        />
      </div>
    </div>
  );
}
