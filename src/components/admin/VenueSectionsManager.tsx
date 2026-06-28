"use client";

import { useState, useTransition } from "react";
import type { Venue } from "@/types/database";
import { ROW_PRESETS, type RowPreset } from "@/lib/stadium/row-labels";
import type { StadiumSectionWithRows } from "@/lib/venues/admin-venues";
import {
  addSectionAction,
  bulkAddRowsAction,
  bulkUpdateSectionZoneAction,
  clearSectionRowsAction,
  deleteRowAction,
} from "@/app/admin/(dashboard)/venues/[id]/sections/actions";

const ZONES = [
  { value: "cat-1", label: "Category 1" },
  { value: "cat-2", label: "Category 2" },
  { value: "cat-3", label: "Category 3" },
  { value: "cat-4", label: "Category 4" },
];

interface VenueSectionsManagerProps {
  venue: Venue;
  sections: StadiumSectionWithRows[];
  supabaseReady: boolean;
}

export function VenueSectionsManager({
  venue,
  sections,
  supabaseReady,
}: VenueSectionsManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const [preset, setPreset] = useState<RowPreset>("A-T");
  const [customLabels, setCustomLabels] = useState("");
  const [applyAllSections, setApplyAllSections] = useState(false);

  const run = (
    fn: () => Promise<{
      error?: string;
      success?: boolean;
      inserted?: number;
      updated?: number;
      sections?: number;
    }>
  ) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.inserted != null) {
        setMessage(
          `Added ${result.inserted} row label(s) across ${result.sections ?? 1} section(s).`
        );
      } else if (result.updated != null) {
        setMessage(`Updated ${result.updated} section(s).`);
      } else {
        setMessage("Done.");
      }
    });
  };

  if (!supabaseReady) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Connect Supabase to manage sections and rows.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {(error || message) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Add section</h2>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addSectionAction(venue.id, new FormData(e.currentTarget)));
          }}
        >
          <label className="text-sm">
            <span className="font-medium text-zinc-700">Section #</span>
            <input
              name="section_number"
              placeholder="227"
              className="mt-1 block w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700">Level</span>
            <input
              name="level"
              placeholder="200"
              className="mt-1 block w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700">Zone</span>
            <select
              name="zone"
              defaultValue="cat-2"
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Add section
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Bulk zone update</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Set category zone for all sections, or filter by level (e.g. all 300-level → cat-3).
        </p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => bulkUpdateSectionZoneAction(venue.id, new FormData(e.currentTarget)));
          }}
        >
          <label className="text-sm">
            <span className="font-medium text-zinc-700">Zone</span>
            <select
              name="zone"
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-700">Level filter (optional)</span>
            <input
              name="level_prefix"
              placeholder="300"
              className="mt-1 block w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={pending || sections.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Apply zone
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Bulk add rows</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Generate row labels for one section or every section at once — e.g. A–T for section 227.
        </p>

        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No sections yet. Add sections here or sync from the{" "}
            <a href={`/admin/venues/${venue.id}/map`} className="text-sky-600 hover:underline">
              map page
            </a>
            .
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("preset", preset);
              if (applyAllSections) fd.set("apply_all", "on");
              run(() => bulkAddRowsAction(venue.id, fd));
            }}
          >
            <div className="flex flex-wrap gap-4">
              <label className="text-sm">
                <span className="font-medium text-zinc-700">Section</span>
                <select
                  name="section_id"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={applyAllSections}
                  className="mt-1 block min-w-[140px] rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.section_number}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="font-medium text-zinc-700">Preset</span>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as RowPreset)}
                  className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {ROW_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.example})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={applyAllSections}
                onChange={(e) => setApplyAllSections(e.target.checked)}
                className="rounded border-slate-300"
              />
              Apply to all {sections.length} sections
            </label>

            {preset === "custom" && (
              <label className="block text-sm">
                <span className="font-medium text-zinc-700">Custom labels</span>
                <textarea
                  name="custom_labels"
                  value={customLabels}
                  onChange={(e) => setCustomLabels(e.target.value)}
                  rows={2}
                  placeholder="SS, PP, VIP"
                  className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Add rows
            </button>
          </form>
        )}
      </section>

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">
          Sections & rows ({sections.length})
        </h2>

        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No sections configured.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {sections.map((section) => {
              const open = expandedSection === section.id;
              const rowCount = section.stadium_rows?.length ?? 0;
              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-lg border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSection(open ? null : section.id)}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-100"
                  >
                    <span className="font-semibold text-zinc-900">
                      Section {section.section_number}
                    </span>
                    <span className="text-zinc-500">
                      Level {section.level} · {section.zone ?? "no zone"} · {rowCount} row
                      {rowCount === 1 ? "" : "s"}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-slate-200 px-4 py-3">
                      {rowCount === 0 ? (
                        <p className="text-sm text-zinc-500">No rows yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {section.stadium_rows.map((row) => (
                            <span
                              key={row.id}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-zinc-700"
                            >
                              {row.row_label}
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                  run(() => deleteRowAction(venue.id, row.id))
                                }
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                aria-label={`Delete row ${row.row_label}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {rowCount > 0 && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() => clearSectionRowsAction(venue.id, section.id))
                          }
                          className="mt-3 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          Clear all rows in this section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
