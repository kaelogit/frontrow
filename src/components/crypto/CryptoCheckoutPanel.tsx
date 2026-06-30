"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import {
  groupOptionsByCurrency,
  getCryptoPaymentOption,
  type CryptoAddressConfig,
  type CryptoPaymentId,
  type CryptoPaymentOption,
} from "@/lib/crypto/payment-options";
import { cryptoIconUrl, QUICK_CURRENCY_SYMBOLS } from "@/lib/crypto/currency-meta";
import type { CryptoQuote } from "@/lib/crypto/prices";
import { formatPrice, cn } from "@/lib/utils";
import { PaymentCountdown } from "@/components/payments/PaymentCountdown";
import { CRYPTO_CHECKOUT_MINUTES } from "@/lib/payments/types";
import { EvmCryptoPay } from "@/components/crypto/EvmCryptoPay";
import { SolanaCryptoPay } from "@/components/crypto/SolanaCryptoPay";
import { UtxoCryptoPay } from "@/components/crypto/UtxoCryptoPay";
import { TronCryptoPay } from "@/components/crypto/TronCryptoPay";
import { TonCryptoPay } from "@/components/crypto/TonCryptoPay";

interface CryptoCheckoutPanelProps {
  reference: string;
  totalUsd: number;
  onPaid: () => void;
  expiresAt?: string;
  onExpired?: () => void;
  offerToken?: string;
  lockedPaymentId?: CryptoPaymentId;
  mode?: "checkout" | "offer";
  currency?: string;
  header?: {
    eventTitle: string;
    orderReference: string;
  };
}

interface CryptoStatusResponse {
  enabled: boolean;
  walletConnect: boolean;
  addresses: CryptoAddressConfig;
  options: { id: CryptoPaymentId; label: string; symbol: string }[];
}

function CurrencyIcon({ symbol, className }: { symbol: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cryptoIconUrl(symbol)}
      alt=""
      className={cn("h-6 w-6 rounded-full", className)}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function PayRail({
  option,
  reference,
  offerToken,
  totalUsd,
  onPaid,
}: {
  option: CryptoPaymentOption;
  reference: string;
  offerToken?: string;
  totalUsd: number;
  onPaid: () => void;
}) {
  const shared = { reference, offerToken, totalUsd, onPaid };

  if (option.rail === "evm") {
    return <EvmCryptoPay option={option} {...shared} />;
  }
  if (option.rail === "solana") {
    return <SolanaCryptoPay {...shared} />;
  }
  if (option.rail === "utxo") {
    return (
      <UtxoCryptoPay
        paymentId={option.id as "btc-bitcoin" | "ltc-litecoin" | "doge-dogecoin"}
        {...shared}
      />
    );
  }
  if (option.rail === "tron") {
    return (
      <TronCryptoPay
        paymentId={option.id as "trx-tron" | "usdt-tron"}
        {...shared}
      />
    );
  }
  if (option.rail === "ton") {
    return <TonCryptoPay {...shared} />;
  }
  return null;
}

export function CryptoCheckoutPanel({
  reference,
  totalUsd,
  onPaid,
  expiresAt: expiresAtProp,
  onExpired,
  offerToken,
  lockedPaymentId,
  mode = "checkout",
  currency = "USD",
  header,
}: CryptoCheckoutPanelProps) {
  const [status, setStatus] = useState<CryptoStatusResponse | null>(null);
  const [phase, setPhase] = useState<"select" | "pay">(lockedPaymentId ? "pay" : "select");
  const [paymentId, setPaymentId] = useState<CryptoPaymentId | null>(lockedPaymentId ?? null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const expiresAt =
    expiresAtProp ?? new Date(Date.now() + CRYPTO_CHECKOUT_MINUTES * 60 * 1000).toISOString();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [quote, setQuote] = useState<CryptoQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const handleExpired = () => {
    setSessionExpired(true);
    onExpired?.();
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/checkout/crypto/status")
      .then((r) => r.json())
      .then((data: CryptoStatusResponse) => {
        if (!cancelled) {
          setStatus(data);
          if (lockedPaymentId) {
            setPaymentId(lockedPaymentId);
          } else if (data.options[0]) {
            setPaymentId(data.options[0].id);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lockedPaymentId]);

  const availableOptions = useMemo(() => {
    if (!status?.options) return [];
    return status.options
      .map((o) => getCryptoPaymentOption(o.id))
      .filter((o): o is CryptoPaymentOption => Boolean(o));
  }, [status]);

  const currencyGroups = useMemo(
    () => groupOptionsByCurrency(availableOptions),
    [availableOptions]
  );

  const selectedOption = paymentId ? getCryptoPaymentOption(paymentId) : null;

  const selectedCurrency = useMemo(() => {
    if (!selectedOption) return currencyGroups[0] ?? null;
    return currencyGroups.find((g) => g.symbol === selectedOption.symbol) ?? null;
  }, [currencyGroups, selectedOption]);

  const networkOptions = selectedCurrency?.options ?? [];

  useEffect(() => {
    if (!selectedOption || networkOptions.length === 0) return;
    if (!networkOptions.find((o) => o.id === paymentId)) {
      setPaymentId(networkOptions[0].id);
    }
  }, [networkOptions, paymentId, selectedOption]);

  useEffect(() => {
    if (!paymentId) return;
    let cancelled = false;
    setQuoteLoading(true);
    fetch(`/api/checkout/crypto/quote?paymentId=${paymentId}&usd=${totalUsd}`)
      .then((r) => r.json())
      .then((data: CryptoQuote) => {
        if (!cancelled) setQuote(data);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paymentId, totalUsd]);

  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase();
    if (!q) return currencyGroups;
    return currencyGroups.filter(
      (g) => g.symbol.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)
    );
  }, [currencyGroups, currencySearch]);

  const quickChips = QUICK_CURRENCY_SYMBOLS.filter((symbol) =>
    currencyGroups.some((g) => g.symbol === symbol)
  );

  const cardClass = "mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

  if (sessionExpired) {
    return (
      <div className={cn(cardClass, "text-center")}>
        <p className="font-semibold text-red-800">Payment window expired</p>
        <p className="mt-2 text-sm text-red-700">
          {mode === "offer"
            ? "Email us to request a new payment link."
            : "Start checkout again to get a new quote."}
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (availableOptions.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Crypto payments are not configured yet. Receive addresses must be set in Vercel env, then
        redeploy.
      </p>
    );
  }

  const headerBlock = header ? (
    <div className="mb-6 border-b border-slate-100 pb-5">
      <p className="text-sm text-slate-500">{header.eventTitle}</p>
      <h1 className="mt-1 text-xl font-bold text-slate-900">Crypto payment</h1>
      <p className="mt-1 font-mono text-xs text-slate-500">{header.orderReference}</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {formatPrice(totalUsd, currency)}
      </p>
      <div className="mt-4 flex justify-center">
        <PaymentCountdown expiresAt={expiresAt} onExpired={handleExpired} />
      </div>
    </div>
  ) : null;

  if (phase === "pay" && selectedOption) {
    return (
      <div className={cardClass}>
        {headerBlock}
        {!headerBlock ? (
          <div className="mb-4 flex justify-center">
            <PaymentCountdown expiresAt={expiresAt} onExpired={handleExpired} />
          </div>
        ) : null}

        {!lockedPaymentId ? (
          <button
            type="button"
            onClick={() => setPhase("select")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Change coin
          </button>
        ) : null}

        <div className="mb-5 text-center">
          <p className="text-sm text-slate-500">{formatPrice(totalUsd, currency)}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {quote ? `${quote.amount} ${quote.symbol}` : quoteLoading ? "…" : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-400">{selectedOption.networkLabel}</p>
        </div>

        <PayRail
          option={selectedOption}
          reference={reference}
          offerToken={offerToken}
          totalUsd={totalUsd}
          onPaid={onPaid}
        />
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {headerBlock}

      {!headerBlock ? (
        <>
          <div className="mb-4 text-center">
            <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Pay with crypto
            </span>
          </div>
          <div className="mb-4 flex justify-center">
            <PaymentCountdown expiresAt={expiresAt} onExpired={handleExpired} />
          </div>
        </>
      ) : null}

      <div className="mb-6 text-center">
        <p className="text-sm text-slate-500">{formatPrice(totalUsd, currency)}</p>
        {quoteLoading ? (
          <Loader2 className="mx-auto mt-3 h-8 w-8 animate-spin text-slate-300" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {quote ? `${quote.amount} ${quote.symbol}` : "—"}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Choose your coin — you&apos;ll get the exact amount and our address
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Currency
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCurrencyOpen((v) => !v);
                setNetworkOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
            >
              {selectedCurrency && <CurrencyIcon symbol={selectedCurrency.symbol} />}
              <span className="flex-1 text-sm font-medium text-slate-900">
                {selectedCurrency
                  ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
                  : "Select currency"}
              </span>
              {currencyOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {currencyOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Search currency"
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filteredCurrencies.map((group) => (
                    <li key={group.symbol}>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentId(group.options[0].id);
                          setCurrencyOpen(false);
                          setCurrencySearch("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50",
                          selectedCurrency?.symbol === group.symbol && "bg-slate-50"
                        )}
                      >
                        <CurrencyIcon symbol={group.symbol} />
                        <span className="text-sm font-medium text-slate-900">{group.name}</span>
                        <span className="text-sm text-slate-400">{group.symbol}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {quickChips.map((symbol) => {
              const group = currencyGroups.find((g) => g.symbol === symbol);
              if (!group) return null;
              const active = selectedCurrency?.symbol === symbol;
              return (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => setPaymentId(group.options[0].id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  )}
                >
                  <CurrencyIcon symbol={symbol} className="h-4 w-4" />
                  {symbol}
                </button>
              );
            })}
          </div>
        </div>

        {networkOptions.length > 1 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Network
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNetworkOpen((v) => !v);
                  setCurrencyOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
              >
                {selectedOption && <CurrencyIcon symbol={selectedOption.symbol} />}
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {selectedOption?.networkLabel ?? "Select network"}
                </span>
                {networkOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {networkOpen && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {networkOptions.map((opt) => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentId(opt.id);
                          setNetworkOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50",
                          paymentId === opt.id && "bg-slate-50 font-medium"
                        )}
                      >
                        {opt.networkLabel}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {networkOptions.map((opt) => {
                const active = paymentId === opt.id;
                const chipLabel =
                  opt.chainName ?? opt.networkLabel.replace(/ Network.*/, "");
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentId(opt.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-sky-400 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    )}
                  >
                    {chipLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {networkOptions.length === 1 && selectedOption && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Network
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
              {selectedOption.networkLabel}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!paymentId || quoteLoading}
        onClick={() => setPhase("pay")}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
      >
        Continue to payment
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
