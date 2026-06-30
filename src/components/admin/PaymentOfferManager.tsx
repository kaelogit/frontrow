"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, Pencil, X } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import {
  EXPIRY_PRESETS,
  formatExpiryDuration,
  PAY_MENU_METHODS,
  PAYMENT_CREDENTIAL_TYPE_LABELS,
  CRYPTO_CHECKOUT_MINUTES,
  type PaymentCredentialType,
} from "@/lib/payments/types";
import { formatPrice } from "@/lib/utils";

interface Credential {
  id: string;
  label: string;
  type: PaymentCredentialType;
}

interface OfferRow {
  id: string;
  token: string;
  url: string;
  method_label: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string | null;
  expiry_minutes: number;
  expires_at: string | null;
  credential_id: string | null;
}

interface PaymentOfferManagerProps {
  reference: string;
  defaultAmount: number;
  currency: string;
  orderPaymentMethod?: string;
  orderStatus?: string;
  paymentExternalId?: string | null;
}

type SelectedMethod = PaymentCredentialType | "crypto";

function defaultExpiryForMethod(method: SelectedMethod): number {
  if (method === "wire_us" || method === "swift") return 48 * 60;
  if (method === "crypto") return CRYPTO_CHECKOUT_MINUTES;
  return 14 * 60;
}

function orderPaymentStatusLabel(status?: string, paymentExternalId?: string | null): string {
  if (status === "paid" || status === "ticket_issued" || status === "completed") {
    return "Paid";
  }
  if (status === "pending_payment") {
    return paymentExternalId ? "Payment detected — verify" : "Pending payment";
  }
  if (status === "reservation_requested") return "Reservation — awaiting PAY MENU reply";
  return status?.replace(/_/g, " ") ?? "Unknown";
}

export function PaymentOfferManager({
  reference,
  defaultAmount,
  currency,
  orderPaymentMethod,
  orderStatus,
  paymentExternalId,
}: PaymentOfferManagerProps) {
  const isWebsiteCrypto = orderPaymentMethod === "crypto";

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<SelectedMethod>(
    isWebsiteCrypto ? "crypto" : "zelle"
  );
  const [credentialId, setCredentialId] = useState("");
  const [amount, setAmount] = useState(String(defaultAmount));
  const [expiryMinutes, setExpiryMinutes] = useState(defaultExpiryForMethod("zelle"));
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editExpiry, setEditExpiry] = useState(14 * 60);
  const [editLoading, setEditLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(!isWebsiteCrypto);

  const load = async () => {
    const [credRes, offerRes] = await Promise.all([
      fetch("/api/admin/payment-credentials"),
      fetch(`/api/admin/orders/${encodeURIComponent(reference)}/payment-offers`),
    ]);
    const credData = await credRes.json();
    const offerData = await offerRes.json();
    const creds = (credData.credentials ?? []) as Credential[];
    const loadedOffers = (offerData.offers ?? []) as OfferRow[];
    setCredentials(creds);
    setOffers(loadedOffers);
    if (isWebsiteCrypto) {
      setShowCreateForm(loadedOffers.length === 0);
    }
  };

  useEffect(() => {
    load();
  }, [reference]);

  const filteredCredentials = useMemo(
    () =>
      selectedMethod === "crypto"
        ? []
        : credentials.filter((c) => c.type === selectedMethod),
    [credentials, selectedMethod]
  );

  useEffect(() => {
    if (selectedMethod === "crypto") return;
    const match = filteredCredentials[0];
    setCredentialId(match?.id ?? "");
  }, [selectedMethod, filteredCredentials]);

  useEffect(() => {
    setExpiryMinutes(defaultExpiryForMethod(selectedMethod));
  }, [selectedMethod]);

  const createLink = async () => {
    setLoading(true);
    setError("");
    try {
      const body =
        selectedMethod === "crypto"
          ? {
              kind: "crypto" as const,
              amount: Number(amount),
              expiry_minutes: expiryMinutes,
              send_email: sendEmail,
            }
          : {
              kind: "credential" as const,
              credential_id: credentialId,
              amount: Number(amount),
              expiry_minutes: expiryMinutes,
              send_email: sendEmail,
            };

      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(reference)}/payment-offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      await load();
      if (data.offer?.url) {
        await navigator.clipboard.writeText(data.offer.url);
        setCopied(data.offer.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const startEdit = (offer: OfferRow) => {
    setEditingId(offer.id);
    setEditAmount(String(offer.amount));
    setEditExpiry(offer.expiry_minutes);
  };

  const patchOffer = async (id: string, body: Record<string, unknown>) => {
    setEditLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/payment-offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const offerStatusLabel = (o: OfferRow) => {
    if (o.status !== "active") return o.status;
    if (!o.started_at) return "waiting for customer";
    if (o.expires_at) {
      return `timer · expires ${new Date(o.expires_at).toLocaleString()}`;
    }
    return "active";
  };

  const activeCryptoOffer = offers.find(
    (o) => o.method_label === "Crypto" && o.status === "active"
  );

  return (
    <div className="space-y-6">
      {isWebsiteCrypto ? (
        <div className="admin-callout-info p-4">
          <h2 className="font-semibold">Website crypto checkout</h2>
          <p className="mt-1 text-sm text-sky-800/80">
            Customer chose crypto on the site — no need to pick a method again.
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-sky-700/70">Payment status</dt>
              <dd className="font-medium capitalize text-sky-950">
                {orderPaymentStatusLabel(orderStatus, paymentExternalId)}
              </dd>
            </div>
            {activeCryptoOffer ? (
              <div>
                <dt className="text-sky-700/70">Pay link</dt>
                <dd className="font-medium text-emerald-800">
                  Created · {offerStatusLabel(activeCryptoOffer)}
                </dd>
              </div>
            ) : null}
            {paymentExternalId ? (
              <div className="sm:col-span-2">
                <dt className="text-sky-700/70">Transaction</dt>
                <dd className="break-all font-mono text-xs text-sky-900">{paymentExternalId}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {offers.length > 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-5">
          <h3 className="font-semibold">Payment links</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {offers.map((o) => (
              <li key={o.id} className="border-b border-card-border/50 pb-3 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{o.method_label}</p>
                    <p className="text-zinc-500">
                      {formatPrice(o.amount, o.currency)} · {offerStatusLabel(o)}
                    </p>
                    {!o.started_at ? (
                      <p className="text-xs text-zinc-500">
                        Timer: {formatExpiryDuration(o.expiry_minutes)} after customer begins
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {o.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => startEdit(o)}
                        className="inline-flex items-center gap-1 rounded-lg border border-card-border px-2 py-1 text-xs"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => copyUrl(o.url)}
                      className="inline-flex items-center gap-1 rounded-lg border border-card-border px-2 py-1 text-xs"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                </div>

                {editingId === o.id ? (
                  <div className="mt-3 rounded-lg border border-card-border bg-slate-50 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs text-zinc-500">Amount</span>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-card-border bg-white px-2 py-1.5 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-zinc-500">Timer duration</span>
                        <select
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-card-border bg-white px-2 py-1.5 text-sm"
                        >
                          {EXPIRY_PRESETS.map((p) => (
                            <option key={p.id} value={p.minutes}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={editLoading}
                        onClick={() =>
                          patchOffer(o.id, {
                            amount: Number(editAmount),
                            expiry_minutes: editExpiry,
                          })
                        }
                        className="admin-btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                      >
                        Save
                      </button>
                      {o.credential_id ? (
                        <button
                          type="button"
                          disabled={editLoading}
                          onClick={() => patchOffer(o.id, { sync_credential: true })}
                          className="rounded-lg border border-card-border px-3 py-1.5 text-xs"
                        >
                          Sync account details
                        </button>
                      ) : null}
                      {o.started_at ? (
                        <button
                          type="button"
                          disabled={editLoading}
                          onClick={() => patchOffer(o.id, { reset_timer: true })}
                          className="rounded-lg border border-card-border px-3 py-1.5 text-xs"
                        >
                          Reset timer
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={editLoading}
                        onClick={() => patchOffer(o.id, { revoke: true })}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-800"
                      >
                        Revoke
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-xs"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isWebsiteCrypto && offers.length > 0 && !showCreateForm ? (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          Create a new crypto link
        </button>
      ) : null}

      {showCreateForm ? (
        <div className="rounded-xl border border-card-border bg-card p-5">
          <h2 className="font-semibold">
            {isWebsiteCrypto ? "New crypto link" : "Create payment link"}
          </h2>
          {!isWebsiteCrypto ? (
            <p className="mt-1 text-xs text-zinc-500">
              Customer replied with a PAY MENU letter — pick that method only, then create the
              link and paste it in your email.
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">
              Only needed if you want a fresh link (e.g. expired). Website checkout already
              created one above.
            </p>
          )}

          {!isWebsiteCrypto ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Customer&apos;s method
              </p>
              <div className="flex flex-wrap gap-2">
                {PAY_MENU_METHODS.map((m) => {
                  const isCrypto = "isCrypto" in m && m.isCrypto;
                  const methodKey = isCrypto ? "crypto" : m.type;
                  const active = selectedMethod === methodKey;
                  return (
                    <button
                      key={m.letter}
                      type="button"
                      onClick={() => setSelectedMethod(methodKey)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        active
                          ? "admin-chip-active"
                          : "border border-card-border text-zinc-700 hover:border-sky-400 hover:bg-sky-50"
                      }`}
                    >
                      <span className="font-mono text-xs opacity-70">{m.letter}</span>{" "}
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {selectedMethod !== "crypto" ? (
              <>
                {filteredCredentials.length === 0 ? (
                  <p className="sm:col-span-2 admin-callout-warning px-3 py-2 text-xs">
                    No {PAYMENT_CREDENTIAL_TYPE_LABELS[selectedMethod]} account saved.{" "}
                    <Link href="/admin/payment-methods" className="underline">
                      Add one in Payment methods
                    </Link>
                    .
                  </p>
                ) : filteredCredentials.length === 1 ? (
                  <p className="sm:col-span-2 rounded-lg border border-card-border bg-slate-50 px-3 py-2 text-xs text-zinc-700">
                    Account: <strong className="text-zinc-900">{filteredCredentials[0].label}</strong>
                  </p>
                ) : (
                  <label className="block sm:col-span-2">
                    <span className="text-xs text-zinc-500">
                      {PAYMENT_CREDENTIAL_TYPE_LABELS[selectedMethod]} account
                    </span>
                    <select
                      value={credentialId}
                      onChange={(e) => setCredentialId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"
                    >
                      {filteredCredentials.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            ) : (
              <p className="sm:col-span-2 rounded-lg border border-card-border bg-slate-50 px-3 py-2 text-xs text-zinc-700">
                Customer picks BTC, ETH, USDC, etc. on the payment page. You only set amount and
                timer.
              </p>
            )}

            <label className="block">
              <span className="text-xs text-zinc-500">Amount ({currency})</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs text-zinc-500">Timer (starts when customer begins)</span>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"
              >
                {EXPIRY_PRESETS.map((p) => (
                  <option key={p.id} value={p.minutes}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            Email customer (usually leave off — paste link yourself)
          </label>

          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          {copied ? <p className="mt-2 text-sm text-emerald-700">Link copied</p> : null}

          <LoadingButton
            type="button"
            disabled={
              loading ||
              (selectedMethod !== "crypto" && (!credentialId || filteredCredentials.length === 0))
            }
            loading={loading}
            loadingLabel="Creating…"
            onClick={createLink}
            className="mt-4 admin-btn-primary disabled:opacity-50"
          >
            Create & copy link
          </LoadingButton>
        </div>
      ) : null}
    </div>
  );
}
