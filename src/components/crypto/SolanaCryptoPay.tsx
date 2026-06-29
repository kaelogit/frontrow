"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { getSolanaReceiveAddress } from "@/lib/crypto/config";
import type { CryptoQuote } from "@/lib/crypto/prices";

interface SolanaPayInnerProps {
  reference: string;
  totalUsd: number;
  onPaid: () => void;
}

interface InjectedSolana {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signAndSendTransaction: (
    transaction: Transaction
  ) => Promise<{ signature: string }>;
}

function getInjectedSolana(): InjectedSolana | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    solana?: InjectedSolana;
    phantom?: { solana?: InjectedSolana };
  };
  return w.solana ?? w.phantom?.solana ?? null;
}

export function SolanaCryptoPay({ reference, totalUsd, onPaid }: SolanaPayInnerProps) {
  const receiveAddress = getSolanaReceiveAddress();
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [walletKey, setWalletKey] = useState<PublicKey | null>(null);
  const [phase, setPhase] = useState<"idle" | "signing" | "confirming" | "verifying">("idle");
  const [error, setError] = useState("");

  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");

  useEffect(() => {
    let cancelled = false;
    async function loadQuote() {
      const res = await fetch(`/api/checkout/crypto/quote?paymentId=sol-solana&usd=${totalUsd}`);
      const data = (await res.json()) as CryptoQuote & { error?: string };
      if (!cancelled) {
        if (res.ok) setQuote(data);
        else setError(data.error ?? "Quote failed");
      }
    }
    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [totalUsd]);

  if (!receiveAddress) return null;

  const connectWallet = async () => {
    setError("");
    const provider = getInjectedSolana();
    if (!provider) {
      setError(
        "No Solana wallet found. Open Trust Wallet or Phantom, or use the in-app browser."
      );
      return;
    }
    const { publicKey } = await provider.connect();
    setWalletKey(publicKey);
  };

  const handlePay = async () => {
    if (!walletKey || !quote) return;
    const provider = getInjectedSolana();
    if (!provider) return;

    setError("");
    setPhase("signing");

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletKey,
          toPubkey: new PublicKey(receiveAddress),
          lamports: Number(quote.amountRaw),
        })
      );

      const connection = new Connection(endpoint, "confirmed");
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletKey;

      const { signature } = await provider.signAndSendTransaction(tx);
      setPhase("confirming");
      await connection.confirmTransaction(signature, "confirmed");
      setPhase("verifying");

      const res = await fetch("/api/checkout/crypto/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          paymentId: "sol-solana",
          signature,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Confirmation failed");
      onPaid();
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "SOL payment failed");
    }
  };

  const busy = phase !== "idle";

  return (
    <div className="space-y-3">
      {!walletKey ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Connect Solana wallet
        </button>
      ) : (
        <p className="text-xs text-slate-500">
          Connected: {walletKey.toBase58().slice(0, 4)}…{walletKey.toBase58().slice(-4)}
        </p>
      )}
      {walletKey && (
        <button
          type="button"
          onClick={() => void handlePay()}
          disabled={busy || !quote}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {phase === "signing"
            ? "Confirm in wallet…"
            : phase === "confirming"
              ? "Waiting for Solana…"
              : phase === "verifying"
                ? "Verifying payment…"
                : "Pay SOL"}
        </button>
      )}
      {quote && (
        <p className="text-sm text-slate-600">
          Send <span className="font-semibold">{quote.amount} SOL</span>
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
