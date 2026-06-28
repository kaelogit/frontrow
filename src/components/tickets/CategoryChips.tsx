"use client";

import type { SectionZone } from "@/lib/stadium/bc-place-sections";
import { ZONE_FILTERS } from "@/lib/tickets/filters";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  selected: SectionZone | null;
  onSelect: (zone: SectionZone | null) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden xl:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Other ticket options
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ZONE_FILTERS.map((z) => (
          <button
            key={z.value}
            type="button"
            onClick={() => onSelect(selected === z.value ? null : z.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              selected === z.value
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
            )}
          >
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
}
