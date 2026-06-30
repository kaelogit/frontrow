"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Upload } from "lucide-react";
import { PaymentCountdown } from "@/components/payments/PaymentCountdown";
import {
  PaymentOfferCrypto,
  PaymentOfferCryptoSuccess,
} from "@/components/payments/PaymentOfferCrypto";
import { SUPPORT_EMAIL, expiredMessage } from "@/lib/payments/instructions";
import type { PaymentOfferPublicView } from "@/lib/payments/types";
import { formatExpiryDuration } from "@/lib/payments/types";
import { formatPrice } from "@/lib/utils";

interface PaymentOfferClientProps {
  initial: PaymentOfferPublicView;
}

export function PaymentOfferClient({ initial }: PaymentOfferClientProps) {
  const [view, setView] = useState(initial);
  const [expired, setExpired] = useState(initial.expired);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(view.status === "submitted");
  const [credentialStep, setCredentialStep] = useState<"instructions" | "receipt">(
    "instructions"
  );

  const handleExpired = useCallback(() => setExpired(true), []);

  const beginPayment = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await fetch(`/api/pay/${view.token}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");
      setView(data);
      setExpired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setStarting(false);
    }
  };

  const submit = async () => {
    if (!receipt) {
      setError("Upload your receipt or screenshot first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("receipt", receipt);
      if (note.trim()) form.append("note", note.trim());
      const res = await fetch(`/api/pay/${view.token}/submit`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Payment received</h1>
        <p className="mt-2 text-slate-600">
          We&apos;re verifying your payment for {view.orderReference}.
        </p>
      </div>
    );
  }

  if (expired || view.status === "expired" || view.status === "revoked") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Link expired</h1>
        <p className="mt-3 text-slate-600">{expiredMessage(view.methodType)}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=New payment link — ${view.orderReference}`}
          className="mt-6 inline-block text-sm font-semibold text-sky-600 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    );
  }

  if (!view.started) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-500">{view.eventTitle}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{view.methodLabel}</h1>
        <p className="mt-1 font-mono text-sm text-slate-500">{view.orderReference}</p>
        <p className="mt-4 text-3xl font-bold text-slate-900">
          {formatPrice(view.amount, view.currency)}
        </p>
        <p className="mt-4 text-sm text-slate-600">
          When you begin, you&apos;ll have{" "}
          <strong>{formatExpiryDuration(view.expiryMinutes)}</strong> to complete payment.
        </p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={starting}
          onClick={beginPayment}
          className="mt-6 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {starting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </span>
          ) : (
            "Begin payment"
          )}
        </button>
      </div>
    );
  }

  if (view.methodType === "crypto") {
    if (submitted) {
      return <PaymentOfferCryptoSuccess orderReference={view.orderReference} />;
    }
    return (
      <PaymentOfferCrypto
        view={view}
        onExpired={handleExpired}
        expired={expired}
        onPaid={() => setSubmitted(true)}
      />
    );
  }

  if (credentialStep === "receipt") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => {
            setError("");
            setCredentialStep("instructions");
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to payment details
        </button>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Upload proof of payment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Send {formatPrice(view.amount, view.currency)} via {view.methodLabel}, then upload a
          screenshot or receipt so we can verify your payment.
        </p>
        <p className="mt-1 font-mono text-xs text-slate-500">{view.orderReference}</p>

        {view.expiresAt ? (
          <PaymentCountdown
            expiresAt={view.expiresAt}
            onExpired={handleExpired}
            variant="badge"
            className="mt-4"
          />
        ) : null}

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Receipt or screenshot <span className="text-red-600">*</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Required — photo or PDF from your bank app, Cash App, Apple Pay, etc.
            </p>
            <div className="mt-3">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-sky-300 hover:bg-sky-50/50">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {receipt ? receipt.name : "Tap to choose file"}
                </span>
                <span className="text-xs text-slate-400">PNG, JPG, or PDF · max 10 MB</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setReceipt(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                />
              </label>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Reference on your receipt"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={loading || !receipt}
            onClick={submit}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </span>
            ) : (
              "Submit payment proof"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm text-slate-500">{view.eventTitle}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{view.methodLabel}</h1>
      <p className="mt-1 font-mono text-sm text-slate-500">{view.orderReference}</p>
      <p className="mt-4 text-3xl font-bold text-slate-900">
        {formatPrice(view.amount, view.currency)}
      </p>

      {view.expiresAt ? (
        <PaymentCountdown
          expiresAt={view.expiresAt}
          onExpired={handleExpired}
          variant="badge"
          className="mt-4"
        />
      ) : null}

      <dl className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        {view.instructions.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {row.label}
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-slate-600">
        Send the amount above using these details. On the next step you&apos;ll upload proof of
        payment — that&apos;s required to complete your order.
      </p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={() => {
          setError("");
          setCredentialStep("receipt");
        }}
        className="mt-6 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700"
      >
        I&apos;ve sent payment →
      </button>
    </div>
  );
}
