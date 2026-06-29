"use client";



import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { getTonReceiveAddress } from "@/lib/crypto/config";

import { buildTonPaymentUri } from "@/lib/crypto/payment-uri";

import type { CryptoQuote } from "@/lib/crypto/prices";

import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";



interface TonCryptoPayProps {

  reference: string;

  totalUsd: number;

  onPaid: () => void;

}



export function TonCryptoPay({ reference, totalUsd, onPaid }: TonCryptoPayProps) {

  const address = getTonReceiveAddress();

  const [quote, setQuote] = useState<CryptoQuote | null>(null);

  const [txid, setTxid] = useState("");

  const [phase, setPhase] = useState<"idle" | "verifying">("idle");

  const [error, setError] = useState("");



  useEffect(() => {

    let cancelled = false;

    async function loadQuote() {

      const res = await fetch(`/api/checkout/crypto/quote?paymentId=ton-toncoin&usd=${totalUsd}`);

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

      setError("Paste your TON transaction hash after sending.");

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

          paymentId: "ton-toncoin",

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

    quote?.amount != null ? buildTonPaymentUri(address, quote.amount) : address;



  return (

    <div className="space-y-4">

      <CryptoReceiveAddressCard

        address={address}

        qrValue={qrValue}

        title="TON receive address"

        amountLabel={quote ? `${quote.amount} TON` : undefined}

        hint="Send TON via Tonkeeper, Trust Wallet, or any TON-compatible wallet."

      />



      <div>

        <label className="block text-sm font-medium text-slate-700">TON transaction hash</label>

        <input

          value={txid}

          onChange={(e) => setTxid(e.target.value)}

          placeholder="Transaction hash from your wallet"

          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"

        />

      </div>



      <button

        type="button"

        onClick={() => void verify()}

        disabled={phase === "verifying"}

        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-slate-800 disabled:opacity-60"

      >

        {phase === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}

        I&apos;ve sent TON — verify payment

      </button>



      {error && (

        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </p>

      )}

    </div>

  );

}


