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
import { CheckoutTrustLinks } from "@/components/trust/CheckoutTrustLinks";
import { Web3Provider } from "@/components/crypto/Web3Provider";
import { trackCheckoutStart, trackReservationSubmit } from "@/lib/analytics/funnel";
import { buildEventBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { CRYPTO_CHECKOUT_MINUTES } from "@/lib/payments/types";
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
    expiresAt: string;
  } | null>(null);
  const [cryptoPaymentsLive, setCryptoPaymentsLive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/checkout/crypto/status")
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => {
        if (!cancelled) setCryptoPaymentsLive(Boolean(data.enabled));
      })
      .catch(() => {
        if (!cancelled) setCryptoPaymentsLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cryptoPaymentsLive === false && paymentMethod === "crypto") {
      setPaymentMethod("reservation");
    }
  }, [cryptoPaymentsLive, paymentMethod]);

  useEffect(() => {
    const session = readCheckoutSession();
    if (!session || session.eventSlug !== event.slug) {
      router.replace(getEventTicketHref(event));
      return;
    }
    setCheckout(session);

    const total = session.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    trackCheckoutStart({
      slug: event.slug,
      matchNumber: event.match_number,
      competitionSlug: event.competition?.slug ?? null,
      itemCount: session.items.reduce((n, item) => n + item.quantity, 0),
      total,
      currency: session.currency,
    });
  }, [event, router]);

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
    const trimmedPhone = phone.trim();
    if (!name.trim() || trimmedPhone.length < 8) {
      setError("Enter your full name and phone number with country code.");
      return;
    }
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
          customerPhone: phone.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      if (paymentMethod === "crypto" && data.crypto) {
        trackReservationSubmit({
          slug: event.slug,
          matchNumber: event.match_number,
          competitionSlug: event.competition?.slug ?? null,
          reference: data.reference as string,
          paymentMethod: "crypto",
          total: data.total as number,
          currency: checkout.currency,
        });
        setCryptoOrder({
          reference: data.reference as string,
          total: data.total as number,
          expiresAt: new Date(
            Date.now() + CRYPTO_CHECKOUT_MINUTES * 60 * 1000
          ).toISOString(),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      clearCheckoutSession();

      if (data.checkoutUrl) {
        trackReservationSubmit({
          slug: event.slug,
          matchNumber: event.match_number,
          competitionSlug: event.competition?.slug ?? null,
          reference: data.reference as string,
          paymentMethod,
          total: data.total as number | undefined,
          currency: checkout.currency,
        });
        window.location.href = data.checkoutUrl;
        return;
      }

      trackReservationSubmit({
        slug: event.slug,
        matchNumber: event.match_number,
        competitionSlug: event.competition?.slug ?? null,
        reference: data.reference as string,
        paymentMethod,
        total: data.total as number | undefined,
        currency: checkout.currency,
      });

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

  const breadcrumbs = buildEventBreadcrumbs(event, "checkout");

  return (
    <Web3Provider>
    <div className="flex min-h-screen flex-col bg-slate-100">
      <TicketFlowHeader event={event} breadcrumbs={breadcrumbs} showBackToTickets compact />

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
              

              <div className="mt-6">
                <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="checkout-email"
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
                  <label htmlFor="checkout-full-name" className="block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    id="checkout-full-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="John Smith"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-slate-700">
                    Mobile phone <span className="font-normal text-slate-500">(with country code)</span>
                  </label>
                  <input
                    id="checkout-phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="+19177430001"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Include your country code so we can reach you about payment and ticket delivery.
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!name.trim() || phone.trim().length < 8}
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
                expiresAt={cryptoOrder.expiresAt}
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
                  const isCrypto = method.id === "crypto";
                  const cryptoReady = cryptoPaymentsLive === true;
                  const cryptoChecking = isCrypto && cryptoPaymentsLive === null;
                  const isDisabled = isCrypto ? !cryptoReady : !method.enabled;
                  const isSelected = !isDisabled && paymentMethod === method.id;
                  const disabledLabel = cryptoChecking
                    ? "Checking…"
                    : "disabledLabel" in method
                      ? method.disabledLabel
                      : "Unavailable";

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

              <CheckoutTrustLinks className="mt-6" />

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
          {!cryptoOrder && step === "payment" && <CheckoutTrustLinks />}
        </aside>
      </div>

      <MobileCheckoutBar
        items={checkout.items}
        currency={checkout.currency}
        primaryLabel={mobileBarLabel}
        formId={cryptoOrder ? undefined : mobileFormId}
        primaryDisabled={
          cryptoOrder
            ? true
            : step === "email"
              ? !email.trim()
              : step === "details"
                ? !name.trim() || phone.trim().length < 8
                : false
        }
        loading={loading}
      />

      <TicketFlowFooter />
    </div>
    </Web3Provider>
  );
}
