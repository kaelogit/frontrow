"use client";

import { useMemo, useState } from "react";
import type { TicketListing } from "@/types/database";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { getStadiumMapDefinition } from "@/lib/stadium/registry";

interface AdminStadiumMapProps {
  mapSlug: string;
  sectionNumbers: string[];
  listings: TicketListing[];
  selectedSection: string | null;
  onSectionSelect: (section: string) => void;
}

export function AdminStadiumMap({
  mapSlug,
  sectionNumbers,
  listings,
  selectedSection,
  onSectionSelect,
}: AdminStadiumMapProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const definition = getStadiumMapDefinition(mapSlug);

  const availableSections = useMemo(() => {
    if (definition) {
      return new Set(definition.geometry.map((g) => g.number));
    }
    return new Set(sectionNumbers);
  }, [definition, sectionNumbers]);

  const priceBySection = useMemo(() => {
    const map = new Map<string, number>();
    for (const listing of listings) {
      if (!listing.section_number) continue;
      const current = map.get(listing.section_number);
      if (current == null || listing.price < current) {
        map.set(listing.section_number, listing.price);
      }
    }
    return map;
  }, [listings]);

  if (!definition) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No interactive map for slug <strong>{mapSlug}</strong>. Use the form below, or
        upload an SVG on the venue map page.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-zinc-900">Click section to add listing</h2>
          <p className="text-xs text-zinc-500">
            {definition.name} · blue = on map · darker blue = selected
            {selectedSection ? ` · Section ${selectedSection}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-xs text-zinc-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.75, z + 0.15))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className="h-[min(420px,55vh)] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <StadiumMap
          mapSlug={mapSlug}
          availableSections={availableSections}
          priceBySection={priceBySection}
          selectedSection={selectedSection}
          highlightedSection={hoveredSection}
          onSectionClick={onSectionSelect}
          onSectionHover={setHoveredSection}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
