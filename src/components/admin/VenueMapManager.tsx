"use client";

import { useMemo, useState, useTransition } from "react";
import type { StadiumMap, StadiumSection, Venue } from "@/types/database";
import { countSvgSectionIds } from "@/lib/stadium/parse-svg-sections";
import {
  deleteOrphanSectionsAction,
  deleteSectionAction,
  saveStadiumMapAction,
  syncSectionsFromSvgAction,
  updateSectionAction,
} from "@/app/admin/(dashboard)/venues/[id]/map/actions";

const ZONES = [
  { value: "cat-1", label: "Category 1" },
  { value: "cat-2", label: "Category 2" },
  { value: "cat-3", label: "Category 3" },
  { value: "cat-4", label: "Category 4" },
];

interface VenueMapManagerProps {
  venue: Venue;
  stadiumMap: StadiumMap | null;
  sections: StadiumSection[];
  supabaseReady: boolean;
}

export function VenueMapManager({
  venue,
  stadiumMap,
  sections,
  supabaseReady,
}: VenueMapManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [mapSlug, setMapSlug] = useState(stadiumMap?.slug ?? venue.stadium_map_slug ?? "");
  const [mapName, setMapName] = useState(stadiumMap?.name ?? venue.name);
  const [venueMapSlug, setVenueMapSlug] = useState(venue.stadium_map_slug ?? stadiumMap?.slug ?? "");
  const [svgContent, setSvgContent] = useState(stadiumMap?.svg_content ?? "");

  const parsedCount = useMemo(() => countSvgSectionIds(svgContent), [svgContent]);

  const run = (fn: () => Promise<{ error?: string; success?: boolean; synced?: number; removed?: number }>) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.synced != null) {
        setMessage(`Synced ${result.synced} section(s) from SVG.`);
      } else if (result.removed != null) {
        setMessage(`Removed ${result.removed} orphan section(s).`);
      } else {
        setMessage("Saved.");
      }
    });
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSvgContent(reader.result);
      }
    };
    reader.readAsText(file);
  };

  if (!supabaseReady) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Connect Supabase to manage venue maps and sections.
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
        <h2 className="text-lg font-semibold text-zinc-900">Map setup</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload or paste an SVG with section path ids (e.g.{" "}
          <code className="text-zinc-700">id=&quot;section-227&quot;</code>). Sync
          populates <code className="text-zinc-700">stadium_sections</code> for listing
          entry.
        </p>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => saveStadiumMapAction(venue.id, fd));
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Map slug</span>
            <input
              name="map_slug"
              value={mapSlug}
              onChange={(e) => setMapSlug(e.target.value)}
              placeholder="bc-place"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Venue map slug</span>
            <input
              name="stadium_map_slug"
              value={venueMapSlug}
              onChange={(e) => setVenueMapSlug(e.target.value)}
              placeholder="bc-place"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              Stored on venue — used by ticket map registry
            </span>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-700">Map name</span>
            <input
              name="map_name"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">SVG file</label>
            <input
              type="file"
              accept=".svg,image/svg+xml"
              className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700"
              onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
            />
          </div>

          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-700">SVG content</span>
            <textarea
              name="svg_content"
              value={svgContent}
              onChange={(e) => setSvgContent(e.target.value)}
              rows={10}
              placeholder='<svg viewBox="0 0 800 600">...</svg>'
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              {parsedCount > 0
                ? `${parsedCount} section id(s) detected in current SVG`
                : "No section ids detected yet"}
            </span>
          </label>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Save map
            </button>
            <button
              type="button"
              disabled={pending || !svgContent.trim()}
              onClick={() => run(() => syncSectionsFromSvgAction(venue.id))}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Sync sections from SVG
            </button>
            <button
              type="button"
              disabled={pending || sections.length === 0}
              onClick={() => run(() => deleteOrphanSectionsAction(venue.id))}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Remove orphans
            </button>
          </div>
        </form>

        {svgContent.trim() && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Preview
            </p>
            <div
              className="mx-auto max-h-72 overflow-auto [&_svg]:mx-auto [&_svg]:max-h-64 [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-card-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Sections</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {sections.length} section(s) in database for this venue
            </p>
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No sections yet. Save an SVG and click &quot;Sync sections from SVG&quot;.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Section</th>
                  <th className="px-3 py-2 font-medium">Level</th>
                  <th className="px-3 py-2 font-medium">Zone</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.id} className="border-b border-slate-100">
                    <form
                      className="contents"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        run(() => updateSectionAction(venue.id, section.id, fd));
                      }}
                    >
                      <td className="px-3 py-2 font-medium text-zinc-900">
                        {section.section_number}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          name="level"
                          defaultValue={section.level}
                          className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          name="zone"
                          defaultValue={section.zone ?? "cat-2"}
                          className="rounded border border-slate-200 px-2 py-1 text-sm"
                        >
                          {ZONES.map((z) => (
                            <option key={z.value} value={z.value}>
                              {z.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="submit"
                          disabled={pending}
                          className="mr-3 text-xs font-semibold text-sky-600 hover:underline disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() => deleteSectionAction(venue.id, section.id))
                          }
                          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </form>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
