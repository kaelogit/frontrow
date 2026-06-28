"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  COMMON_PERK_FILTERS,
  type QuickFind,
  type SortOption,
} from "@/lib/tickets/filters";
import {
  FEATURE_FILTER_OPTIONS,
  VIAGOGO_ZONE_OPTIONS,
  countListingsByZone,
  type FeatureFilter,
  type ViagogoZoneFilter,
} from "@/lib/tickets/zone-filters";
import type { TicketListing } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TicketFiltersProps {
  ticketCount: number;
  onTicketCountChange: (n: number) => void;
  minPrice: number;
  maxPrice: number;
  priceMin: number;
  priceMax: number;
  onPriceRangeChange: (min: number, max: number) => void;
  histogram: number[];
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  viagogoZones: ViagogoZoneFilter[];
  onViagogoZonesChange: (z: ViagogoZoneFilter[]) => void;
  features: FeatureFilter[];
  onFeaturesChange: (f: FeatureFilter[]) => void;
  perks: string[];
  onPerksChange: (p: string[]) => void;
  allListings: TicketListing[];
  resultCount: number;
  currency: string;
  onReset: () => void;
  quickFind?: QuickFind;
  onQuickFindChange?: (v: QuickFind) => void;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price", label: "Price" },
  { value: "best_deal", label: "Best deal" },
  { value: "best_view", label: "Best view" },
];

const QUICK_FIND_OPTIONS: { value: QuickFind; label: string; hint: string }[] = [
  { value: "top_value", label: "Top value", hint: "Best view scores" },
  { value: "cheapest", label: "Cheapest", hint: "Lowest prices" },
  { value: "most_discounted", label: "Most discounted", hint: "Biggest savings" },
];

export function TicketFilters({
  ticketCount,
  onTicketCountChange,
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  onPriceRangeChange,
  histogram,
  sort,
  onSortChange,
  viagogoZones,
  onViagogoZonesChange,
  features,
  onFeaturesChange,
  perks,
  onPerksChange,
  allListings,
  resultCount,
  currency,
  onReset,
  quickFind = null,
  onQuickFindChange,
  className,
}: TicketFiltersProps) {
  const maxHist = Math.max(...histogram, 1);
  const zoneCounts = countListingsByZone(allListings, ticketCount);

  const toggleZone = (z: ViagogoZoneFilter) => {
    onViagogoZonesChange(
      viagogoZones.includes(z) ? viagogoZones.filter((x) => x !== z) : [...viagogoZones, z]
    );
  };

  const toggleFeature = (f: FeatureFilter) => {
    onFeaturesChange(
      features.includes(f) ? features.filter((x) => x !== f) : [...features, f]
    );
  };

  const togglePerk = (p: string) => {
    onPerksChange(perks.includes(p) ? perks.filter((x) => x !== p) : [...perks, p]);
  };

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white lg:w-[300px] xl:w-[320px]",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <h2 className="font-semibold text-slate-900">Filters</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4">
        {onQuickFindChange && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick find
            </h3>
            <div className="mt-2 space-y-2">
              {QUICK_FIND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onQuickFindChange(quickFind === opt.value ? null : opt.value)
                  }
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-xs transition",
                    quickFind === opt.value
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="mt-0.5 block text-slate-500">{opt.hint}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Number of tickets
          </h3>
          <select
            value={ticketCount}
            onChange={(e) => onTicketCountChange(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} ticket{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Seats are guaranteed to be next to each other.
          </p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Price per ticket
          </h3>
          <p className="mt-2 text-sm text-slate-700">
            {formatPrice(priceMin, currency)} – {formatPrice(priceMax, currency)}+
          </p>

          <div className="mt-3 flex h-12 items-end gap-0.5">
            {histogram.map((count, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-sky-200"
                style={{ height: `${Math.max(8, (count / maxHist) * 100)}%` }}
              />
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceMin}
              onChange={(e) =>
                onPriceRangeChange(Math.min(Number(e.target.value), priceMax - 1), priceMax)
              }
              className="w-full accent-sky-600"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceMax}
              onChange={(e) =>
                onPriceRangeChange(priceMin, Math.max(Number(e.target.value), priceMin + 1))
              }
              className="w-full accent-sky-600"
            />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sort by
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium",
                  sort === opt.value
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Features
          </h3>
          <div className="mt-2 space-y-2">
            {FEATURE_FILTER_OPTIONS.map((f) => (
              <label key={f.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={features.includes(f.value)}
                  onChange={() => toggleFeature(f.value)}
                  className="rounded accent-sky-600"
                />
                {f.label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Zones
          </h3>
          <div className="mt-2 space-y-1">
            {VIAGOGO_ZONE_OPTIONS.map((z) => {
              const count = zoneCounts[z.value];
              if (count === 0) return null;
              return (
                <label
                  key={z.value}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={viagogoZones.includes(z.value)}
                      onChange={() => toggleZone(z.value)}
                      className="rounded accent-sky-600"
                    />
                    {z.label}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {count} listing{count !== 1 ? "s" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Perks
          </h3>
          <div className="mt-2 space-y-2">
            {COMMON_PERK_FILTERS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={perks.includes(p)}
                  onChange={() => togglePerk(p)}
                  className="rounded accent-sky-600"
                />
                {p}
              </label>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-sky-600 hover:underline"
        >
          Reset filters
        </button>
      </div>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <p className="text-center text-sm font-semibold text-slate-900">
          View {resultCount} ticket{resultCount !== 1 ? "s" : ""}
        </p>
      </div>
    </aside>
  );
}
