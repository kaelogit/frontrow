"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import {
  getOptionsForConfiguredAddresses,
  getCryptoPaymentOption,
  type CryptoPaymentId,
} from "@/lib/crypto/payment-options";
import {
  getBtcReceiveAddress,
  getEvmReceiveAddress,
  getSolanaReceiveAddress,
} from "@/lib/crypto/config";
import { formatPrice } from "@/lib/utils";
import { EvmCryptoPay } from "@/components/crypto/EvmCryptoPay";
import { SolanaCryptoPay } from "@/components/crypto/SolanaCryptoPay";
import { BtcCryptoPay } from "@/components/crypto/BtcCryptoPay";

interface CryptoCheckoutPanelProps {
  reference: string;
  totalUsd: number;
  onPaid: () => void;
}

export function CryptoCheckoutPanel({
  reference,
  totalUsd,
  onPaid,
}: CryptoCheckoutPanelProps) {
  const availableOptions = useMemo(
    () =>
      getOptionsForConfiguredAddresses({
        evm: Boolean(getEvmReceiveAddress()),
        solana: Boolean(getSolanaReceiveAddress()),
        bitcoin: Boolean(getBtcReceiveAddress()),
      }),
    []
  );

  const [paymentId, setPaymentId] = useState<CryptoPaymentId>(
    availableOptions[0]?.id ?? "usdc-base"
  );

  useEffect(() => {
    if (!availableOptions.find((o) => o.id === paymentId) && availableOptions[0]) {
      setPaymentId(availableOptions[0].id);
    }
  }, [availableOptions, paymentId]);

  const option = getCryptoPaymentOption(paymentId);

  if (availableOptions.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Add your Trust Wallet receive addresses in <code>.env.local</code> to enable crypto
        checkout.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
        <div>
          <p className="font-semibold text-slate-900">Pay with crypto</p>
          <p className="mt-1 text-sm text-slate-600">
            BTC, ETH, USDT, USDC, BNB, and SOL — sent directly to our Trust Wallet addresses.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Asset</label>
        <select
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value as CryptoPaymentId)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          {availableOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Order total</span>
          <span className="font-semibold text-slate-900">{formatPrice(totalUsd, "USD")}</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Reference: {reference}</p>
      </div>

      {option?.rail === "evm" && (
        <EvmCryptoPay
          reference={reference}
          option={option}
          totalUsd={totalUsd}
          onPaid={onPaid}
        />
      )}
      {option?.rail === "solana" && (
        <SolanaCryptoPay reference={reference} totalUsd={totalUsd} onPaid={onPaid} />
      )}
      {option?.rail === "bitcoin" && (
        <BtcCryptoPay reference={reference} totalUsd={totalUsd} onPaid={onPaid} />
      )}
    </div>
  );
}
