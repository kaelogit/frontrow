"use client";

import { useActionState } from "react";
import type { SocialProofSettings } from "@/lib/social-proof/settings";
import { updateSocialProofAction } from "./actions";

interface SocialProofSettingsFormProps {
  settings: SocialProofSettings;
}

export function SocialProofSettingsForm({ settings }: SocialProofSettingsFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) =>
      updateSocialProofAction(formData),
    null
  );

  return (
    <form action={action} className="mt-6 space-y-5 rounded-xl border border-card-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Social proof (browse pages)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Estimated viewer and follower counts on homepage, events browse, and World Cup hub.
          Jitter varies slightly each hour — label shown as estimated on site.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={settings.enabled}
          className="rounded border-zinc-600"
        />
        Show social proof bars
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-400">Viewer count base</span>
          <input
            type="number"
            name="viewersBase"
            defaultValue={settings.viewersBase}
            min={0}
            className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-400">Viewer jitter ±%</span>
          <input
            type="number"
            name="viewersJitterPct"
            defaultValue={settings.viewersJitterPct}
            min={0}
            max={20}
            step={0.5}
            className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-zinc-400">Viewer label (e.g. World Cup events)</span>
          <input
            type="text"
            name="viewersLabel"
            defaultValue={settings.viewersLabel}
            className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-400">Followers base</span>
          <input
            type="number"
            name="followersBase"
            defaultValue={settings.followersBase}
            min={0}
            className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-400">Followers jitter ±%</span>
          <input
            type="number"
            name="followersJitterPct"
            defaultValue={settings.followersJitterPct}
            min={0}
            max={20}
            step={0.5}
            className="mt-1 w-full rounded-lg border border-card-border bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
      </div>

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
        {pending ? "Saving…" : "Save social proof"}
      </button>
    </form>
  );
}
