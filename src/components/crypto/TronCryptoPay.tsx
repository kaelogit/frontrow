"use client";



import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { useCryptoReceiveAddress } from "@/lib/crypto/use-receive-address";

import { buildTronPaymentUri } from "@/lib/crypto/payment-uri";

import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

import type { CryptoQuote } from "@/lib/crypto/prices";
import { postCryptoConfirmation } from "@/lib/crypto/post-confirmation";

import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";



interface TronCryptoPayProps {
  reference: string;
  offerToken?: string;
  paymentId: Extract<CryptoPaymentId, "trx-tron" | "usdt-tron">;
  totalUsd: number;
  onPaid: () => void;
}



export function TronCryptoPay({
  reference,
  offerToken,
  paymentId,
  totalUsd,
  onPaid,
}: TronCryptoPayProps) {
  const { address, loading: addressLoading, error: addressError } =
    useCryptoReceiveAddress(paymentId);

  const [quote, setQuote] = useState<CryptoQuote | null>(null);

  const [txid, setTxid] = useState("");

  const [phase, setPhase] = useState<"idle" | "verifying">("idle");

  const [error, setError] = useState("");



  const symbol = paymentId === "usdt-tron" ? "USDT" : "TRX";

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



  if (addressLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!address) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {addressError ?? `${symbol} receive address is not configured.`}
      </p>
    );
  }

  const verify = async () => {

    if (!txid.trim()) {

      setError(`Paste your Tron transaction ID after sending ${symbol}.`);

      return;

    }

    setError("");

    setPhase("verifying");

    try {

      await postCryptoConfirmation(
        reference,
        { paymentId, txid: txid.trim() },
        offerToken
      );

      onPaid();

    } catch (err) {

      setPhase("idle");

      setError(err instanceof Error ? err.message : "Verification failed");

    }

  };



  const qrValue =

    quote?.amount != null && paymentId === "trx-tron"

      ? buildTronPaymentUri(address, quote.amount)

      : address;



  return (
    <div className="space-y-4">
      {quote && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
            Send exactly
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {quote.amount} {symbol}
          </p>
        </div>
      )}

      <CryptoReceiveAddressCard

        address={address}

        qrValue={qrValue}

        title="Tron receive address"

        amountLabel={quote ? `${quote.amount} ${symbol}` : undefined}

        hint={`Send ${symbol} on the Tron network (TRC-20 for USDT) via Trust Wallet or TronLink.`}

      />



      <div>

        <label className="block text-sm font-medium text-slate-700">Tron transaction ID</label>

        <input

          value={txid}

          onChange={(e) => setTxid(e.target.value)}

          placeholder="64-character transaction hash"

          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"

        />

        <p className="mt-1.5 text-xs text-slate-400">
          Optional fallback if auto-detect is slow.
        </p>

      </div>

      <button
        type="button"
        onClick={() => void verify()}
        disabled={phase === "verifying"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {phase === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}
        I&apos;ve sent {symbol} — verify manually
      </button>

      {error && (

        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </p>

      )}

    </div>

  );

}


