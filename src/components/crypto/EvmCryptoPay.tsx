"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCryptoReceiveAddress } from "@/lib/crypto/use-receive-address";
import { buildEthPaymentUri } from "@/lib/crypto/payment-uri";
import type { CryptoPaymentOption } from "@/lib/crypto/payment-options";
import type { CryptoQuote } from "@/lib/crypto/prices";
import { CryptoReceiveAddressCard } from "@/components/crypto/CryptoReceiveAddressCard";
import { Web3Provider } from "@/components/crypto/Web3Provider";
import { EvmCryptoPayWallet } from "@/components/crypto/EvmCryptoPayWallet";

interface EvmCryptoPayProps {
  reference: string;
  offerToken?: string;
  option: CryptoPaymentOption;
  totalUsd: number;
  onPaid: () => void;
}

const walletConnectEnabled = Boolean(
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()
);

export function EvmCryptoPay({
  reference,
  offerToken,
  option,
  totalUsd,
  onPaid,
}: EvmCryptoPayProps) {
  const { address: receiveAddress, loading: addressLoading, error: addressError } =
    useCryptoReceiveAddress(option.id);
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");

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
          setQuoteError(err instanceof Error ? err.message : "Could not load price");
        }
      }
    }
    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [option.id, totalUsd]);

  if (addressLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!receiveAddress || !option.chainId) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {addressError ?? `${option.symbol} receive address is not configured.`}
      </p>
    );
  }

  const evmAddress = receiveAddress as `0x${string}`;

  return (
    <div className="space-y-4">
      {quote && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
            Send exactly
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {quote.amount} {quote.symbol}
          </p>
          {quote.priceUsd && quote.priceUsd !== 1 ? (
            <p className="mt-1 text-xs text-slate-500">
              ~${quote.priceUsd.toLocaleString()} / {quote.symbol}
            </p>
          ) : null}
        </div>
      )}

      <CryptoReceiveAddressCard
        address={evmAddress}
        qrValue={
          option.evmKind === "native" && quote
            ? buildEthPaymentUri(evmAddress, quote.amountRaw)
            : evmAddress
        }
        title={`${option.symbol} on ${option.chainName}`}
        amountLabel={quote ? `${quote.amount} ${option.symbol}` : undefined}
        hint={
          option.evmKind === "erc20"
            ? `Copy the address and send ${option.symbol} on ${option.chainName} only.`
            : "Scan the QR in your wallet app — amount is prefilled when supported."
        }
      />

      {quoteError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {quoteError}
        </p>
      ) : null}

      {walletConnectEnabled ? (
        <div className="border-t border-slate-200 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Or pay from wallet
          </p>
          <Web3Provider>
            <EvmCryptoPayWallet
              reference={reference}
              offerToken={offerToken}
              option={option}
              receiveAddress={evmAddress}
              quote={quote}
              onPaid={onPaid}
            />
          </Web3Provider>
        </div>
      ) : null}
    </div>
  );
}
