import type { TicketListing } from "@/types/database";
import { BC_PLACE_SECTION_MAP } from "@/lib/stadium/bc-place-sections";
import { METLIFE_SECTION_MAP } from "@/lib/stadium/metlife-sections";
import { SOFI_SECTION_MAP } from "@/lib/stadium/sofi-sections";
import { LEVIS_SECTION_MAP } from "@/lib/stadium/levis-sections";
import type { SectionZone } from "@/lib/stadium/bc-place-sections";

/** Viagogo-style zone taxonomy for BC Place */
export type ViagogoZoneFilter =
  | "upper"
  | "lower"
  | "mid"
  | "hospitality"
  | "cat-1"
  | "cat-2"
  | "cat-3"
  | "cat-4"
  | "club"
  | "belgium-supporters"
  | "nz-supporters";

export const VIAGOGO_ZONE_OPTIONS: {
  value: ViagogoZoneFilter;
  label: string;
}[] = [
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
  { value: "mid", label: "Mid bowl" },
  { value: "hospitality", label: "Hospitality" },
  { value: "cat-1", label: "Category 1" },
  { value: "cat-2", label: "Category 2" },
  { value: "cat-3", label: "Category 3" },
  { value: "cat-4", label: "Category 4" },
  { value: "club", label: "Club" },
  { value: "belgium-supporters", label: "Belgium Supporters" },
  { value: "nz-supporters", label: "New Zealand Supporters" },
];

export type FeatureFilter =
  | "front-row"
  | "second-row"
  | "third-row"
  | "ada";

export const FEATURE_FILTER_OPTIONS: { value: FeatureFilter; label: string }[] = [
  { value: "front-row", label: "Front row of section" },
  { value: "second-row", label: "Second row of section" },
  { value: "third-row", label: "Third row of section" },
  { value: "ada", label: "ADA Accessible" },
];

function perkIncludes(listing: TicketListing, text: string): boolean {
  return listing.perks.some((p) => p.toLowerCase().includes(text.toLowerCase()));
}

export function classifyListingZones(listing: TicketListing): ViagogoZoneFilter[] {
  const zones = new Set<ViagogoZoneFilter>();

  if (
    listing.listing_type === "hospitality" ||
    listing.product_name?.toLowerCase().includes("lounge") ||
    listing.product_name?.toLowerCase().includes("hospitality")
  ) {
    zones.add("hospitality");
  }

  if (perkIncludes(listing, "belgium supporters") || listing.product_name?.includes("Belgium")) {
    zones.add("belgium-supporters");
  }

  if (perkIncludes(listing, "new zealand supporters") || listing.product_name?.includes("New Zealand")) {
    zones.add("nz-supporters");
  }

  if (perkIncludes(listing, "club") || listing.section_number?.startsWith("CL")) {
    zones.add("club");
  }

  if (listing.section_number) {
    const meta =
      BC_PLACE_SECTION_MAP.get(listing.section_number) ??
      METLIFE_SECTION_MAP.get(listing.section_number) ??
      SOFI_SECTION_MAP.get(listing.section_number) ??
      LEVIS_SECTION_MAP.get(listing.section_number);
    if (meta) {
      zones.add(meta.zone);
      if ("level" in meta && meta.level === "400") zones.add("upper");
      if ("level" in meta && meta.level === "200") zones.add("lower");
      if ("level" in meta && meta.level === "300") zones.add("mid");
      if ("level" in meta && meta.level === "100") zones.add("lower");
      if ("level" in meta && meta.level === "500") zones.add("upper");
      if ("level" in meta && meta.level === "club") zones.add("club");
    }
  }

  if (zones.size === 0 && listing.listing_type === "zone") {
    zones.add("hospitality");
  }

  return [...zones];
}

export function listingMatchesFeature(
  listing: TicketListing,
  feature: FeatureFilter
): boolean {
  const row = listing.row_label?.toUpperCase() ?? "";

  switch (feature) {
    case "front-row":
      return row === "A" || perkIncludes(listing, "front row");
    case "second-row":
      return row === "B" || perkIncludes(listing, "second row");
    case "third-row":
      return row === "C" || row === "D" || perkIncludes(listing, "third row");
    case "ada":
      return perkIncludes(listing, "ada") || perkIncludes(listing, "accessible");
  }
}

export function listingMatchesZones(
  listing: TicketListing,
  selected: ViagogoZoneFilter[]
): boolean {
  if (!selected.length) return true;
  const zones = classifyListingZones(listing);
  return selected.some((z) => zones.includes(z));
}

export function countListingsByZone(
  listings: TicketListing[],
  ticketCount: number
): Record<ViagogoZoneFilter, number> {
  const eligible = listings.filter((l) => l.quantity_available >= ticketCount);
  const counts = Object.fromEntries(
    VIAGOGO_ZONE_OPTIONS.map((o) => [o.value, 0])
  ) as Record<ViagogoZoneFilter, number>;

  for (const listing of eligible) {
    for (const zone of classifyListingZones(listing)) {
      counts[zone]++;
    }
  }

  return counts;
}

/** @deprecated use ViagogoZoneFilter — kept for category chips on map */
export type { SectionZone };
