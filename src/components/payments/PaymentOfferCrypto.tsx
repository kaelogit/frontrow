"use client";

import { PaymentCountdown } from "@/components/payments/PaymentCountdown";
import { CryptoCheckoutPanel } from "@/components/crypto/CryptoCheckoutPanel";
import { SUPPORT_EMAIL, expiredMessage } from "@/lib/payments/instructions";
import type { PaymentOfferPublicView } from "@/lib/payments/types";
import { formatPrice } from "@/lib/utils";

interface PaymentOfferCryptoProps {
  view: PaymentOfferPublicView;
  expired: boolean;
  onExpired: () => void;
}

export function PaymentOfferCrypto({
  view,
  expired,
  onExpired,
}: PaymentOfferCryptoProps) {
  if (expired || !view.cryptoPaymentId || !view.expiresAt) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Link expired</h1>
        <p className="mt-3 text-slate-600">{expiredMessage("crypto")}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=New crypto payment link — ${view.orderReference}`}
          className="mt-6 inline-block text-sm font-semibold text-sky-600 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">{view.eventTitle}</p>
        <h1 className="text-xl font-bold text-slate-900">Crypto payment</h1>
        <p className="font-mono text-sm text-slate-500">{view.orderReference}</p>
        <p className="mt-3 text-2xl font-bold text-slate-900">
          {formatPrice(view.amount, view.currency)}
        </p>
        <PaymentCountdown expiresAt={view.expiresAt} onExpired={onExpired} className="mt-3" />
      </div>

      <CryptoCheckoutPanel
        reference={view.orderReference}
        totalUsd={view.amount}
        expiresAt={view.expiresAt}
        lockedPaymentId={view.cryptoPaymentId}
        onPaid={() => {}}
      />
    </div>
  );
}
