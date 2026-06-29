"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { getBtcReceiveAddress } from "@/lib/crypto/config";
import type { CryptoQuote } from "@/lib/crypto/prices";

interface BtcCryptoPayProps {
  reference: string;
  totalUsd: number;
  onPaid: () => void;
}

export function BtcCryptoPay({ reference, totalUsd, onPaid }: BtcCryptoPayProps) {
  const address = getBtcReceiveAddress();
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [txid, setTxid] = useState("");
  const [phase, setPhase] = useState<"idle" | "verifying">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadQuote() {
      const res = await fetch(`/api/checkout/crypto/quote?paymentId=btc-bitcoin&usd=${totalUsd}`);
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

  if (!address) return null;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verify = async () => {
    if (!txid.trim()) {
      setError("Paste your Bitcoin transaction ID after sending.");
      return;
    }
    setError("");
    setPhase("verifying");
    try {
      const res = await fetch("/api/checkout/crypto/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          paymentId: "btc-bitcoin",
          txid: txid.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      onPaid();
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="text-slate-500">Send exactly</p>
        <p className="mt-1 text-lg font-bold text-slate-900">
          {quote ? `${quote.amount} BTC` : "…"}
        </p>
        <p className="mt-3 text-slate-500">To this Bitcoin address</p>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 break-all text-xs text-slate-800">{address}</code>
          <button
            type="button"
            onClick={() => void copyAddress()}
            className="shrink-0 rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
            aria-label="Copy address"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        {copied && <p className="mt-1 text-xs text-emerald-600">Copied</p>}
        <p className="mt-3 text-xs text-slate-400">
          Use Trust Wallet or any Bitcoin wallet. After sending, paste the transaction ID below.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Bitcoin transaction ID</label>
        <input
          value={txid}
          onChange={(e) => setTxid(e.target.value)}
          placeholder="64-character txid"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <button
        type="button"
        onClick={() => void verify()}
        disabled={phase === "verifying"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {phase === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}
        I&apos;ve sent BTC — verify payment
      </button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
