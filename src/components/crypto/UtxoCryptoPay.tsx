"use client";



import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { getReceiveAddressForPayment } from "@/lib/crypto/config";

import {

  buildBtcPaymentUri,

  buildDogePaymentUri,

  buildLtcPaymentUri,

} from "@/lib/crypto/payment-uri";

import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

import type { CryptoQuote } from "@/lib/crypto/prices";

import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";



const UTXO_PAYMENT_IDS = ["btc-bitcoin", "ltc-litecoin", "doge-dogecoin"] as const;



type UtxoPaymentId = (typeof UTXO_PAYMENT_IDS)[number];



function isUtxoPaymentId(id: CryptoPaymentId): id is UtxoPaymentId {

  return (UTXO_PAYMENT_IDS as readonly string[]).includes(id);

}



function buildUtxoUri(paymentId: UtxoPaymentId, address: string, amount: string): string {

  if (paymentId === "btc-bitcoin") return buildBtcPaymentUri(address, amount);

  if (paymentId === "ltc-litecoin") return buildLtcPaymentUri(address, amount);

  return buildDogePaymentUri(address, amount);

}



const LABELS: Record<UtxoPaymentId, { title: string; symbol: string; hint: string }> = {

  "btc-bitcoin": {

    title: "Bitcoin receive address",

    symbol: "BTC",

    hint: "Scan the QR in Trust Wallet or any Bitcoin app.",

  },

  "ltc-litecoin": {

    title: "Litecoin receive address",

    symbol: "LTC",

    hint: "Scan the QR in Trust Wallet or any Litecoin app.",

  },

  "doge-dogecoin": {

    title: "Dogecoin receive address",

    symbol: "DOGE",

    hint: "Scan the QR in Trust Wallet or any Dogecoin app.",

  },

};



interface UtxoCryptoPayProps {

  reference: string;

  paymentId: UtxoPaymentId;

  totalUsd: number;

  onPaid: () => void;

}



export function UtxoCryptoPay({ reference, paymentId, totalUsd, onPaid }: UtxoCryptoPayProps) {

  const address = getReceiveAddressForPayment(paymentId);

  const [quote, setQuote] = useState<CryptoQuote | null>(null);

  const [txid, setTxid] = useState("");

  const [phase, setPhase] = useState<"idle" | "verifying">("idle");

  const [error, setError] = useState("");



  useEffect(() => {

    let cancelled = false;

    async function loadQuote() {

      const res = await fetch(

        `/api/checkout/crypto/quote?paymentId=${paymentId}&usd=${totalUsd}`

      );

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

  }, [paymentId, totalUsd]);



  if (!address || !isUtxoPaymentId(paymentId)) return null;



  const meta = LABELS[paymentId];



  const verify = async () => {

    if (!txid.trim()) {

      setError(`Paste your ${meta.symbol} transaction ID after sending.`);

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

          paymentId,

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

    quote?.amount != null ? buildUtxoUri(paymentId, address, quote.amount) : address;



  return (

    <div className="space-y-4">

      <CryptoReceiveAddressCard

        address={address}

        qrValue={qrValue}

        title={meta.title}

        amountLabel={quote ? `${quote.amount} ${meta.symbol}` : undefined}

        hint={meta.hint}

      />



      <div>

        <label className="block text-sm font-medium text-slate-700">

          {meta.symbol} transaction ID

        </label>

        <input

          value={txid}

          onChange={(e) => setTxid(e.target.value)}

          placeholder="Transaction hash"

          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"

        />

        <p className="mt-1.5 text-xs text-slate-400">

          After sending, paste your transaction ID so we can confirm on-chain.

        </p>

      </div>



      <button

        type="button"

        onClick={() => void verify()}

        disabled={phase === "verifying"}

        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-slate-800 disabled:opacity-60"

      >

        {phase === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}

        I&apos;ve sent {meta.symbol} — verify payment

      </button>



      {error && (

        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </p>

      )}

    </div>

  );

}



/** @deprecated Use UtxoCryptoPay */

export function BtcCryptoPay(props: Omit<UtxoCryptoPayProps, "paymentId">) {

  return <UtxoCryptoPay {...props} paymentId="btc-bitcoin" />;

}


