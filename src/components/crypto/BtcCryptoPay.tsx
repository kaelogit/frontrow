"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getBtcReceiveAddress } from "@/lib/crypto/config";
import { buildBtcPaymentUri } from "@/lib/crypto/payment-uri";
import type { CryptoQuote } from "@/lib/crypto/prices";
import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";

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

  const qrValue =
    quote?.amount != null ? buildBtcPaymentUri(address, quote.amount) : address;

  return (
    <div className="space-y-4">
      <CryptoReceiveAddressCard
        address={address}
        qrValue={qrValue}
        title="Bitcoin receive address"
        amountLabel={quote ? `${quote.amount} BTC` : undefined}
        hint="Scan the QR in Trust Wallet or any Bitcoin app. QR includes the amount when your wallet supports it."
      />

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Bitcoin transaction ID
        </label>
        <input
          value={txid}
          onChange={(e) => setTxid(e.target.value)}
          placeholder="64-character txid"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          After sending, paste your txid here so we can confirm on-chain.
        </p>
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
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
