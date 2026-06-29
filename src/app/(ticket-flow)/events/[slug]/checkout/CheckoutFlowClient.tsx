"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Bitcoin, CalendarCheck, Loader2, Lock } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import { PAYMENT_METHODS } from "@/lib/constants";
import type { ActivePaymentMethod } from "@/lib/constants";
import { TicketFlowHeader } from "@/components/tickets/TicketFlowHeader";
import { TicketFlowFooter } from "@/components/tickets/TicketFlowFooter";
import { PriceLockBanner } from "@/components/tickets/PriceLockBanner";
import { OrderSummaryCard } from "@/components/tickets/OrderSummaryCard";
import { MobileCheckoutBar } from "@/components/tickets/MobileCheckoutBar";
import { CryptoCheckoutPanel } from "@/components/crypto/CryptoCheckoutPanel";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import {
  clearCheckoutSession,
  readCheckoutSession,
  type CheckoutSession,
} from "@/lib/checkout/storage";

const paymentIcons = {
  card: CreditCard,
  crypto: Bitcoin,
  reservation: CalendarCheck,
} as const;

interface CheckoutFlowClientProps {
  event: EventWithRelations;
}

export function CheckoutFlowClient({ event }: CheckoutFlowClientProps) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [step, setStep] = useState<"email" | "details" | "payment">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<ActivePaymentMethod>("reservation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cryptoOrder, setCryptoOrder] = useState<{
    reference: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    const session = readCheckoutSession();
    if (!session || session.eventSlug !== event.slug) {
      router.replace(getEventTicketHref(event));
      return;
    }
    setCheckout(session);
  }, [event.slug, router]);

  if (!checkout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDetailsContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: checkout.eventId,
          eventSlug: checkout.eventSlug,
          items: checkout.items,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      if (paymentMethod === "crypto" && data.crypto) {
        setCryptoOrder({
          reference: data.reference as string,
          total: data.total as number,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      clearCheckoutSession();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      router.push(`/order/${data.reference}/confirmation`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const mobileBarLabel = cryptoOrder
    ? "Pay in wallet"
    : step === "payment"
      ? paymentMethod === "reservation"
        ? "Submit reservation"
        : "Continue to payment"
      : "Continue";

  const mobileFormId =
    step === "email"
      ? "checkout-email-form"
      : step === "details"
        ? "checkout-details-form"
        : "checkout-payment-form";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <TicketFlowHeader event={event} showBackToTickets compact />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:flex-row lg:pb-8">
        <div className="flex-1 lg:order-1">
          <div className="mb-4 lg:hidden">
            <PriceLockBanner />
          </div>

          {step === "email" ? (
            <form
              id="checkout-email-form"
              onSubmit={handleEmailContinue}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900">Enter email</h2>
              <p className="mt-2 text-sm text-slate-600">
                Not sure if you have an account? Enter your email and we&apos;ll check for you.
              </p>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={!email.trim()}
                className="mt-8 hidden w-full rounded-lg bg-slate-900 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
              >
                Continue
              </button>
            </form>
          ) : step === "details" ? (
            <form
              id="checkout-details-form"
              onSubmit={handleDetailsContinue}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                ← Edit email
              </button>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">Your details</h2>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;ll use this information for your order and ticket delivery.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="John Smith"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Phone <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="+1 555 000 0000"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 hidden w-full rounded-lg bg-slate-900 py-3.5 font-semibold text-white hover:bg-slate-800 lg:block"
              >
                Continue
              </button>
            </form>
          ) : cryptoOrder ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Complete crypto payment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your order is on hold. Connect your wallet and send USDC to secure your seats.
              </p>
              <CryptoCheckoutPanel
                reference={cryptoOrder.reference}
                totalUsd={cryptoOrder.total}
                onPaid={() => {
                  clearCheckoutSession();
                  router.push(`/order/${cryptoOrder.reference}/confirmation`);
                }}
              />
            </div>
          ) : (
            <form
              id="checkout-payment-form"
              onSubmit={handlePaymentSubmit}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                ← Edit your details
              </button>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">Payment method</h2>
              <p className="mt-2 text-sm text-slate-600">
                Choose how you&apos;d like to complete your order.
              </p>

              <div className="mt-6 space-y-3">
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const Icon = paymentIcons[method.id];
                  const isDisabled = !method.enabled;
                  const isSelected = !isDisabled && paymentMethod === method.id;
                  const disabledLabel =
                    "disabledLabel" in method ? method.disabledLabel : "Unavailable";

                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          setPaymentMethod(method.id as ActivePaymentMethod);
                        }
                      }}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                        isDisabled
                          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-70"
                          : isSelected
                            ? "border-sky-400 bg-sky-50"
                            : "border-slate-200 hover:border-sky-200"
                      }`}
                    >
                      <Icon className="h-6 w-6 shrink-0 text-sky-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{method.label}</p>
                          {isDisabled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                              <Lock className="h-3 w-3" />
                              {disabledLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{method.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 hidden w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 lg:flex"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {mobileBarLabel}
              </button>
            </form>
          )}
        </div>

        <aside className="hidden w-full shrink-0 space-y-4 lg:block lg:w-[380px]">
          <PriceLockBanner />
          <OrderSummaryCard items={checkout.items} currency={checkout.currency} />
        </aside>
      </div>

      <MobileCheckoutBar
        items={checkout.items}
        currency={checkout.currency}
        primaryLabel={mobileBarLabel}
        formId={cryptoOrder ? undefined : mobileFormId}
        primaryDisabled={cryptoOrder ? true : step === "email" && !email.trim()}
        loading={loading}
      />

      <TicketFlowFooter />
    </div>
  );
}
