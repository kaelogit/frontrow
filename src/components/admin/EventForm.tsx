"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { EventWithRelations } from "@/types/database";
import type { AdminLookups } from "@/lib/events/admin-events";
import { slugify } from "@/lib/utils";
import {
  createEventAction,
  updateEventAction,
} from "@/app/admin/(dashboard)/events/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface EventFormProps {
  mode: "create" | "edit";
  lookups: AdminLookups;
  event?: EventWithRelations;
  supabaseReady: boolean;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "sold_out", label: "Sold out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export function EventForm({ mode, lookups, event, supabaseReady }: EventFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched && mode === "create") {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEventAction(formData)
          : await updateEventAction(event!.id, formData);

      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }

      if (mode === "edit") {
        setSuccess(true);
      }
    });
  };

  if (!supabaseReady) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        <p className="font-medium">Supabase required</p>
        <p className="mt-2 text-amber-200/80">
          Add your Supabase keys to <code>.env.local</code>, run migrations, then
          seed competitions, teams, and venues before creating events.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Event saved.
        </p>
      )}

      <section className="space-y-4 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Basics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm text-zinc-400">
              Title *
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              placeholder="Brazil vs Scotland"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm text-zinc-400">
              URL slug *
            </label>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm font-mono"
              placeholder="brazil-vs-scotland"
            />
          </div>

          <div>
            <label htmlFor="match_number" className="block text-sm text-zinc-400">
              Match number
            </label>
            <input
              id="match_number"
              name="match_number"
              defaultValue={event?.match_number ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              placeholder="Match 49"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="subtitle" className="block text-sm text-zinc-400">
              Subtitle
            </label>
            <input
              id="subtitle"
              name="subtitle"
              defaultValue={event?.subtitle ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              placeholder="Match 49 · Group C · World Cup 2026"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm text-zinc-400">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={event?.description ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Teams & venue</h2>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          <p className="font-medium text-amber-50">Knockout / TBD matches</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
            Leave team dropdowns on <strong>TBD</strong> and use bracket labels (e.g.{" "}
            <em>Winner Match 93</em>). When teams are confirmed, pick them below — labels
            clear automatically on save. You can also bulk-assign via SQL — see{" "}
            <code className="text-amber-50">docs/ADMIN_SQL_TEMPLATES.md</code>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="competition_id" className="block text-sm text-zinc-400">
              Competition
            </label>
            <select
              id="competition_id"
              name="competition_id"
              defaultValue={event?.competition_id ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {lookups.competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="venue_id" className="block text-sm text-zinc-400">
              Venue
            </label>
            <select
              id="venue_id"
              name="venue_id"
              defaultValue={event?.venue_id ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {lookups.venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="home_team_id" className="block text-sm text-zinc-400">
              Home team
            </label>
            <select
              id="home_team_id"
              name="home_team_id"
              defaultValue={event?.home_team_id ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              <option value="">TBD</option>
              {lookups.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <label htmlFor="home_team_label" className="mt-2 block text-xs text-zinc-500">
              Home label (if TBD)
            </label>
            <input
              id="home_team_label"
              name="home_team_label"
              type="text"
              placeholder="e.g. Winner Match 93"
              defaultValue={event?.home_team_label ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="away_team_id" className="block text-sm text-zinc-400">
              Away team
            </label>
            <select
              id="away_team_id"
              name="away_team_id"
              defaultValue={event?.away_team_id ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              <option value="">TBD</option>
              {lookups.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <label htmlFor="away_team_label" className="mt-2 block text-xs text-zinc-500">
              Away label (if TBD)
            </label>
            <input
              id="away_team_label"
              name="away_team_label"
              type="text"
              placeholder="e.g. Winner Match 94"
              defaultValue={event?.away_team_label ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Schedule & pricing</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event_date" className="block text-sm text-zinc-400">
              Date *
            </label>
            <input
              id="event_date"
              name="event_date"
              type="date"
              required
              defaultValue={event?.event_date ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="event_time" className="block text-sm text-zinc-400">
              Kickoff time
            </label>
            <input
              id="event_time"
              name="event_time"
              type="time"
              defaultValue={event?.event_time?.slice(0, 5) ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="min_price" className="block text-sm text-zinc-400">
              From price
            </label>
            <input
              id="min_price"
              name="min_price"
              type="number"
              min={0}
              step={1}
              defaultValue={event?.min_price ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm text-zinc-400">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={event?.currency ?? "USD"}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              {["USD", "EUR", "GBP", "CAD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <ImageUploadField
            initialUrl={event?.image_url}
            folder={slug ? `events/${slug}` : "events"}
            placeholder="https://… or /images/events/match-97.jpg"
          />

          <div>
            <label htmlFor="status" className="block text-sm text-zinc-400">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={event?.status ?? "scheduled"}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scarcity_override" className="block text-sm text-zinc-400">
              Scarcity override (%)
            </label>
            <input
              id="scarcity_override"
              name="scarcity_override"
              type="number"
              min={0}
              max={100}
              defaultValue={event?.scarcity_override ?? ""}
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              placeholder="Auto from inventory"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Flags</h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={event?.featured ?? false}
            className="rounded"
          />
          Featured on homepage
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="seat_map_enabled"
            defaultChecked={event?.seat_map_enabled ?? false}
            className="rounded"
          />
          Enable stadium map ticket flow
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="queue_enabled"
            defaultChecked={event?.queue_enabled ?? false}
            className="rounded"
          />
          Enable waiting room (high-demand events)
        </label>

        <label className="block text-sm">
          <span className="text-zinc-400">Queue admission rate (fans per minute)</span>
          <input
            type="number"
            name="queue_admission_rate"
            min={1}
            max={120}
            defaultValue={event?.queue_admission_rate ?? 10}
            className="mt-1 w-full max-w-xs rounded-lg border border-card-border bg-background px-3 py-2"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saving…" : mode === "create" ? "Create event" : "Save changes"}
        </button>

        {event?.slug && (
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="rounded-lg border border-card-border px-4 py-2.5 text-sm hover:bg-card"
          >
            Preview public page ↗
          </Link>
        )}

        <Link
          href="/admin/events"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
