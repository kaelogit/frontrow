"use client";

import { useEffect, useState } from "react";
import {
  PAYMENT_CREDENTIAL_TYPE_LABELS,
  type PaymentCredentialType,
} from "@/lib/payments/types";

const FIELD_TEMPLATES: Record<PaymentCredentialType, string[]> = {
  wire_us: ["bankName", "accountName", "accountNumber", "routingNumber", "referenceNote"],
  swift: ["bankName", "swiftCode", "iban", "beneficiary", "bankAddress", "referenceNote"],
  cashapp: ["cashtag", "displayName"],
  apple_pay: ["phone", "note"],
  zelle: ["email", "phone", "displayName"],
  paypal: ["email", "displayName"],
  crypto: ["note"],
  other: ["instructions"],
};

const FIELD_LABELS: Record<string, string> = {
  bankName: "Bank name",
  accountName: "Account name",
  accountNumber: "Account number",
  routingNumber: "Routing number",
  swiftCode: "SWIFT / BIC",
  iban: "IBAN",
  beneficiary: "Beneficiary",
  bankAddress: "Bank address",
  cashtag: "Cashtag",
  displayName: "Display name",
  phone: "Phone",
  email: "Email",
  username: "Username",
  referenceNote: "Reference note",
  note: "Note",
  instructions: "Instructions",
};

type CredentialRow = {
  id: string;
  label: string;
  type: PaymentCredentialType;
  details: Record<string, string>;
  is_active: boolean;
};

export function PaymentCredentialsManager() {
  const [rows, setRows] = useState<CredentialRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<PaymentCredentialType>("wire_us");
  const [label, setLabel] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/payment-credentials");
    const data = await res.json();
    setRows(data.credentials ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editingId) return;
    const next: Record<string, string> = {};
    for (const key of FIELD_TEMPLATES[type]) next[key] = details[key] ?? "";
    setDetails(next);
  }, [type, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setType("wire_us");
    setDetails({});
  };

  const startEdit = (row: CredentialRow) => {
    setEditingId(row.id);
    setLabel(row.label);
    setType(row.type);
    setDetails({ ...row.details });
  };

  const save = async () => {
    setLoading(true);
    await fetch("/api/admin/payment-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId ?? undefined,
        label,
        type,
        details,
        is_active: true,
      }),
    });
    resetForm();
    setLoading(false);
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/payment-credentials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (editingId === id) resetForm();
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">
          {editingId ? "Edit payment account" : "Add payment account"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-zinc-500">Label (internal)</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"
              placeholder="Chase wire #1"
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentCredentialType)}
              disabled={Boolean(editingId)}
              className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              {(Object.keys(PAYMENT_CREDENTIAL_TYPE_LABELS) as PaymentCredentialType[])
                .filter((t) => t !== "crypto")
                .map((t) => (
                  <option key={t} value={t}>
                    {PAYMENT_CREDENTIAL_TYPE_LABELS[t]}
                  </option>
                ))}
            </select>
          </label>
          {FIELD_TEMPLATES[type].map((key) => (
            <label key={key} className="block sm:col-span-2">
              <span className="text-xs text-zinc-500">{FIELD_LABELS[key] ?? key}</span>
              <input
                value={details[key] ?? ""}
                onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !label.trim()}
            onClick={save}
            className="admin-btn-primary disabled:opacity-50"
          >
            {editingId ? "Update" : "Save"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-card-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Saved accounts</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 border-b border-card-border/50 pb-2"
            >
              <span>
                {r.label}{" "}
                <span className="text-zinc-500">({PAYMENT_CREDENTIAL_TYPE_LABELS[r.type]})</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
