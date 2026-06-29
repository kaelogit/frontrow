"use client";

import { useActionState } from "react";
import type { FxSettings } from "@/lib/fx/settings";
import { updateFxSettingsAction } from "./actions-fx";

export function FxSettingsForm({ settings }: { settings: FxSettings }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) =>
      updateFxSettingsAction(formData),
    null
  );

  return (
    <form action={action} className="mt-6 space-y-5 rounded-xl border border-card-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">FX conversion (display only)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Converts prices shown on the site based on the visitor&apos;s selected currency. Checkout stays in USD.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={settings.enabled}
          className="rounded border-zinc-600"
        />
        Enable FX conversion on site
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        {(["EUR", "GBP", "CAD", "AED", "BRL"] as const).map((code) => (
          <label key={code} className="block text-sm">
            <span className="text-zinc-400">USD → {code}</span>
            <input
              type="number"
              name={`rate_${code}`}
              defaultValue={settings.rates[code] ?? ""}
              min={0}
              step={0.0001}
              className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
        ))}
      </div>

      <label className="block text-sm">
        <span className="text-zinc-400">Disclaimer text</span>
        <input
          type="text"
          name="disclaimer"
          defaultValue={settings.disclaimer}
          className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400" role="status">
          Saved. Changes appear on the site within a few seconds.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save FX settings"}
      </button>
    </form>
  );
}

