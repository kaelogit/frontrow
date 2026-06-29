"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Wallet } from "lucide-react";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "viem";
import {
  CRYPTO_PAYMENT_TOKENS,
  getCryptoReceiveAddress,
  usdToTokenAmount,
  type CryptoPaymentTokenId,
} from "@/lib/crypto/config";
import { formatPrice } from "@/lib/utils";

interface CryptoCheckoutPanelProps {
  reference: string;
  totalUsd: number;
  onPaid: () => void;
}

type PayPhase = "idle" | "signing" | "confirming" | "verifying" | "done";

export function CryptoCheckoutPanel({
  reference,
  totalUsd,
  onPaid,
}: CryptoCheckoutPanelProps) {
  const receiveAddress = getCryptoReceiveAddress();
  const [tokenId, setTokenId] = useState<CryptoPaymentTokenId>("usdc-base");
  const [phase, setPhase] = useState<PayPhase>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const token = useMemo(
    () => CRYPTO_PAYMENT_TOKENS.find((t) => t.id === tokenId)!,
    [tokenId]
  );

  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: token.chainId,
  });

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
            txHash,
            chainId: token.chainId,
            tokenId,
          }),
        });

        const data = (await res.json()) as { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? "Could not confirm payment");
        }

        if (!cancelled) {
          setPhase("done");
          onPaid();
        }
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
  }, [txConfirmed, txHash, phase, reference, token.chainId, tokenId, onPaid]);

  if (!receiveAddress) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Crypto payments are not configured on this environment.
      </p>
    );
  }

  const tokenAmount = usdToTokenAmount(totalUsd, token.decimals);
  const wrongChain = isConnected && chain?.id !== token.chainId;
  const busy = phase === "signing" || phase === "confirming" || phase === "verifying";

  const handlePay = async () => {
    setError("");

    if (!address) {
      setError("Connect your wallet first.");
      return;
    }

    try {
      if (chain?.id !== token.chainId) {
        await switchChainAsync({ chainId: token.chainId });
      }

      setPhase("signing");

      const hash = await writeContractAsync({
        address: token.contractAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [receiveAddress, tokenAmount],
        chainId: token.chainId,
      });

      setTxHash(hash);
      setPhase("confirming");
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
        <div>
          <p className="font-semibold text-slate-900">Pay with crypto</p>
          <p className="mt-1 text-sm text-slate-600">
            Send {token.symbol} directly to our wallet. Trust Wallet, MetaMask, and
            other wallets work via WalletConnect.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Token &amp; network</label>
        <select
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value as CryptoPaymentTokenId)}
          disabled={busy}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          {CRYPTO_PAYMENT_TOKENS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.symbol} on {t.chainName}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Order total</span>
          <span className="font-semibold text-slate-900">{formatPrice(totalUsd, "USD")}</span>
        </div>
        <div className="mt-2 flex justify-between gap-4 border-t border-slate-100 pt-2">
          <span className="text-slate-500">You send</span>
          <span className="font-medium text-slate-900">
            {(Number(tokenAmount) / 10 ** token.decimals).toFixed(2)} {token.symbol}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Reference: {reference}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ConnectButton chainStatus="icon" showBalance={false} />
        {isConnected && (
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={busy || wrongChain}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "signing"
              ? "Confirm in wallet…"
              : phase === "confirming"
                ? "Waiting for blockchain…"
                : phase === "verifying"
                  ? "Verifying payment…"
                  : `Pay ${token.symbol}`}
          </button>
        )}
      </div>

      {wrongChain && (
        <p className="text-sm text-amber-700">
          Switch to {token.chainName} in your wallet, or we&apos;ll prompt you when you pay.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
