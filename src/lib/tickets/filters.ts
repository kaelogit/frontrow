import type { TicketListing } from "@/types/database";
import type { SectionZone } from "@/lib/stadium/bc-place-sections";
import {
  listingMatchesFeature,
  listingMatchesZones,
  type FeatureFilter,
  type ViagogoZoneFilter,
} from "@/lib/tickets/zone-filters";

export type { FeatureFilter, ViagogoZoneFilter, SectionZone };

export type SortOption = "recommended" | "price" | "best_deal" | "best_view";
export type QuickFind = "top_value" | "cheapest" | "most_discounted" | null;

export function discountPercent(listing: TicketListing): number {
  const was = listing.compare_at_price;
  if (!was || was <= listing.price) return 0;
  return Math.round(((was - listing.price) / was) * 100);
}

export function filterListings(
  listings: TicketListing[],
  opts: {
    ticketCount: number;
    sectionNumber?: string | null;
    minPrice?: number;
    maxPrice?: number;
    viagogoZones?: ViagogoZoneFilter[];
    features?: FeatureFilter[];
    perks?: string[];
    quickFind?: QuickFind;
  }
): TicketListing[] {
  let result = listings.filter((l) => {
    if (l.quantity_available < opts.ticketCount) return false;
    if (opts.sectionNumber && l.section_number !== opts.sectionNumber) return false;
    if (opts.minPrice != null && l.price < opts.minPrice) return false;
    if (opts.maxPrice != null && l.price > opts.maxPrice) return false;

    if (opts.viagogoZones?.length && !listingMatchesZones(l, opts.viagogoZones)) {
      return false;
    }

    if (opts.features?.length) {
      const hasAll = opts.features.every((f) => listingMatchesFeature(l, f));
      if (!hasAll) return false;
    }

    if (opts.perks?.length) {
      const hasPerk = opts.perks.some((p) => l.perks.includes(p));
      if (!hasPerk) return false;
    }

    return true;
  });

  if (opts.quickFind === "cheapest") {
    const min = Math.min(...result.map((l) => l.price));
    result = result.filter((l) => l.price <= min * 1.05);
  } else if (opts.quickFind === "most_discounted") {
    result = result.filter((l) => discountPercent(l) >= 15);
  } else if (opts.quickFind === "top_value") {
    result = result.filter((l) => (l.view_score ?? 0) >= 8.5);
  }

  return result;
}

export function sortListings(
  listings: TicketListing[],
  sort: SortOption
): TicketListing[] {
  const copy = [...listings];

  switch (sort) {
    case "price":
      return copy.sort((a, b) => a.price - b.price);
    case "best_view":
      return copy.sort(
        (a, b) => (b.view_score ?? 0) - (a.view_score ?? 0) || a.price - b.price
      );
    case "best_deal":
      return copy.sort(
        (a, b) =>
          discountPercent(b) - discountPercent(a) || a.price - b.price
      );
    default:
      return copy.sort((a, b) => {
        const scoreA = (a.view_score ?? 5) * 15 - a.price / 80 + discountPercent(a);
        const scoreB = (b.view_score ?? 5) * 15 - b.price / 80 + discountPercent(b);
        return scoreB - scoreA;
      });
  }
}

export function listingMinMax(listings: TicketListing[]): { min: number; max: number } | null {
  if (!listings.length) return null;
  const prices = listings.map((l) => l.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function priceHistogram(
  listings: TicketListing[],
  min: number,
  max: number,
  bins = 14
): number[] {
  if (max <= min || !listings.length) {
    return Array(bins).fill(0);
  }

  const counts = Array(bins).fill(0);
  const step = (max - min) / bins;

  for (const l of listings) {
    const idx = Math.min(bins - 1, Math.floor((l.price - min) / step));
    counts[idx]++;
  }

  return counts;
}

export function scarcityPercent(listings: TicketListing[]): number {
  const available = listings.reduce((s, l) => s + l.quantity_available, 0);
  const assumedTotal = Math.max(available * 50, 180);
  return Math.max(1, Math.min(99, Math.round((available / assumedTotal) * 100)));
}

export function sectionsWithStock(listings: TicketListing[]): Set<string> {
  return new Set(
    listings
      .filter((l) => l.section_number && l.quantity_available > 0)
      .map((l) => l.section_number as string)
  );
}

export function minPriceBySection(listings: TicketListing[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const l of listings) {
    if (!l.section_number) continue;
    const cur = map.get(l.section_number);
    if (cur == null || l.price < cur) map.set(l.section_number, l.price);
  }
  return map;
}

export const COMMON_PERK_FILTERS = [
  "Clear view",
  "Limited view",
  "Aisle seat",
  "2 tickets together",
  "1 ticket",
] as const;

export const ZONE_FILTERS: { value: SectionZone; label: string }[] = [
  { value: "cat-1", label: "Category 1" },
  { value: "cat-2", label: "Category 2" },
  { value: "cat-3", label: "Category 3" },
  { value: "cat-4", label: "Category 4" },
];
