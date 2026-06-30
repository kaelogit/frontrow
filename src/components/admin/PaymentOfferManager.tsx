"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Pencil, X } from "lucide-react";
import {
  EXPIRY_PRESETS,
  formatExpiryDuration,
  PAYMENT_CREDENTIAL_TYPE_LABELS,
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
}

export function PaymentOfferManager({
  reference,
  defaultAmount,
  currency,
}: PaymentOfferManagerProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [mode, setMode] = useState<"credential" | "crypto">("credential");
  const [credentialId, setCredentialId] = useState("");
  const [amount, setAmount] = useState(String(defaultAmount));
  const [expiryMinutes, setExpiryMinutes] = useState(14 * 60);
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editExpiry, setEditExpiry] = useState(14 * 60);
  const [editLoading, setEditLoading] = useState(false);

  const load = async () => {
    const [credRes, offerRes] = await Promise.all([
      fetch("/api/admin/payment-credentials"),
      fetch(`/api/admin/orders/${encodeURIComponent(reference)}/payment-offers`),
    ]);
    const credData = await credRes.json();
    const offerData = await offerRes.json();
    setCredentials(credData.credentials ?? []);
    setOffers(offerData.offers ?? []);
    if (credData.credentials?.[0]) setCredentialId(credData.credentials[0].id);
  };

  useEffect(() => {
    load();
  }, [reference]);

  const createLink = async () => {
    setLoading(true);
    setError("");
    try {
      const body =
        mode === "crypto"
          ? {
              kind: "crypto",
              amount: Number(amount),
              expiry_minutes: expiryMinutes,
              send_email: sendEmail,
            }
          : {
              kind: "credential",
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

  const patchOffer = async (
    id: string,
    body: Record<string, unknown>
  ) => {
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Payment link</h2>
        <p className="mt-1 text-xs text-zinc-500">
          After the customer picks a method (A–H), create one link for that method only.
          Paste the link in your reply email — do not auto-send unless you check the box below.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("credential")}
            className={`rounded-lg px-3 py-1.5 text-sm ${mode === "credential" ? "bg-accent text-black" : "border border-card-border"}`}
          >
            Bank / Cash App / etc.
          </button>
          <button
            type="button"
            onClick={() => setMode("crypto")}
            className={`rounded-lg px-3 py-1.5 text-sm ${mode === "crypto" ? "bg-accent text-black" : "border border-card-border"}`}
          >
            Crypto
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {mode === "credential" ? (
            <label className="block sm:col-span-2">
              <span className="text-xs text-zinc-500">Account</span>
              <select
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card-border bg-black/20 px-3 py-2 text-sm"
              >
                {credentials
                  .filter((c) => c.type !== "crypto")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({PAYMENT_CREDENTIAL_TYPE_LABELS[c.type]})
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <p className="sm:col-span-2 rounded-lg border border-card-border/50 bg-black/10 px-3 py-2 text-xs text-zinc-400">
              Customer chooses BTC, ETH, USDC, etc. on the payment page. You only set amount
              and timer.
            </p>
          )}

          <label className="block">
            <span className="text-xs text-zinc-500">Amount ({currency})</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-black/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-zinc-500">Timer (starts when customer begins)</span>
            <select
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-card-border bg-black/20 px-3 py-2 text-sm"
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
          Email customer
        </label>

        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        {copied ? <p className="mt-2 text-sm text-emerald-400">Link copied</p> : null}

        <button
          type="button"
          disabled={loading || (mode === "credential" && !credentialId)}
          onClick={createLink}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating…
            </span>
          ) : (
            "Create & copy link"
          )}
        </button>
      </div>

      {offers.length > 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-5">
          <h3 className="font-semibold">Links</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {offers.map((o) => (
              <li
                key={o.id}
                className="border-b border-card-border/50 pb-3"
              >
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
                  <div className="mt-3 rounded-lg border border-card-border/50 bg-black/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs text-zinc-500">Amount</span>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-card-border bg-black/20 px-2 py-1.5 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-zinc-500">Timer duration</span>
                        <select
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-card-border bg-black/20 px-2 py-1.5 text-sm"
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
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
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
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400"
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
    </div>
  );
}
