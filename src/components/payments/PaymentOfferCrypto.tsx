"use client";

import { CheckCircle2 } from "lucide-react";
import { CryptoCheckoutPanel } from "@/components/crypto/CryptoCheckoutPanel";
import { SUPPORT_EMAIL, expiredMessage } from "@/lib/payments/instructions";
import type { PaymentOfferPublicView } from "@/lib/payments/types";

interface PaymentOfferCryptoProps {
  view: PaymentOfferPublicView;
  expired: boolean;
  onExpired: () => void;
  onPaid: () => void;
}

export function PaymentOfferCrypto({
  view,
  expired,
  onExpired,
  onPaid,
}: PaymentOfferCryptoProps) {
  if (expired || !view.expiresAt) {
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
    <CryptoCheckoutPanel
      mode="offer"
      reference={view.orderReference}
      offerToken={view.token}
      totalUsd={view.amount}
      currency={view.currency}
      expiresAt={view.expiresAt}
      onExpired={onExpired}
      onPaid={onPaid}
      header={{
        eventTitle: view.eventTitle,
        orderReference: view.orderReference,
      }}
    />
  );
}

export function PaymentOfferCryptoSuccess({ orderReference }: { orderReference: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
      <h1 className="mt-4 text-xl font-bold text-slate-900">Payment submitted</h1>
      <p className="mt-2 text-slate-600">
        We&apos;re verifying your crypto payment for{" "}
        <span className="font-mono text-sm">{orderReference}</span>.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        You&apos;ll receive a confirmation email once verified.
      </p>
    </div>
  );
}
