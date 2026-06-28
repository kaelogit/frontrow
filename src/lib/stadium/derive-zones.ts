import type { TicketListing } from "@/types/database";

export interface DerivedZone {
  id: string;
  label: string;
  minPrice: number | null;
  listingCount: number;
  /** Match against listing section_number prefix or product_name */
  match: (listing: TicketListing) => boolean;
}

function levelFromSection(section: string): string | null {
  const digits = section.replace(/\D/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (n >= 100 && n < 200) return "100";
  if (n >= 200 && n < 300) return "200";
  if (n >= 300 && n < 400) return "300";
  if (n >= 400 && n < 500) return "400";
  if (n >= 500) return "500";
  return null;
}

function categoryFromProduct(name: string | null | undefined): string | null {
  if (!name) return null;
  const m = name.match(/category\s*(\d)/i);
  if (m) return `cat-${m[1]}`;
  if (/hospitality|lounge|club|suite/i.test(name)) return "hospitality";
  if (/300-level|upper/i.test(name)) return "upper";
  if (/lower|field/i.test(name)) return "lower";
  return null;
}

/**
 * Build clickable zone regions from listing inventory when no traced SVG exists.
 * Works for any venue — groups by FIFA category, level band, or product zone.
 */
export function deriveZonesFromListings(listings: TicketListing[]): DerivedZone[] {
  const zoneMap = new Map<
    string,
    { label: string; minPrice: number | null; count: number; match: DerivedZone["match"] }
  >();

  function addZone(
    id: string,
    label: string,
    listing: TicketListing,
    match: DerivedZone["match"]
  ) {
    const existing = zoneMap.get(id);
    const price = listing.price;
    if (existing) {
      existing.count += 1;
      existing.minPrice =
        existing.minPrice == null ? price : Math.min(existing.minPrice, price);
    } else {
      zoneMap.set(id, { label, minPrice: price, count: 1, match });
    }
  }

  for (const listing of listings) {
    if (listing.listing_type === "hospitality") {
      const label = listing.product_name ?? "Hospitality";
      const id = `hospitality-${label.toLowerCase().replace(/\s+/g, "-").slice(0, 24)}`;
      addZone(id, label, listing, (l) => l.listing_type === "hospitality");
      continue;
    }

    if (listing.listing_type === "zone" && listing.product_name) {
      const cat = categoryFromProduct(listing.product_name);
      const id = cat ?? `zone-${listing.product_name.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`;
      const label = listing.product_name;
      addZone(
        id,
        label,
        listing,
        (l) =>
          l.product_name === listing.product_name ||
          (cat != null && categoryFromProduct(l.product_name) === cat)
      );
      continue;
    }

    if (listing.section_number) {
      const sec = listing.section_number;
      const level = levelFromSection(sec);
      if (level) {
        const id = `level-${level}`;
        const label =
          level === "100"
            ? "100 Level · Lower bowl"
            : level === "200"
              ? "200 Level · Club & sideline"
              : level === "300"
                ? "300 Level · Upper bowl"
                : level === "400"
                  ? "400 Level"
                  : `${level} Level`;
        addZone(id, label, listing, (l) => {
          if (!l.section_number) return false;
          return levelFromSection(l.section_number) === level;
        });
      } else {
        const id = `section-${sec.replace(/\s+/g, "")}`;
        addZone(id, `Section ${sec}`, listing, (l) => l.section_number === sec);
      }
    }
  }

  const order = ["cat-1", "cat-2", "cat-3", "cat-4", "hospitality", "lower", "upper", "level-100", "level-200", "level-300", "level-400", "level-500"];

  return [...zoneMap.entries()]
    .map(([id, data]) => ({
      id,
      label: data.label,
      minPrice: data.minPrice,
      listingCount: data.count,
      match: data.match,
    }))
    .sort((a, b) => {
      const ai = order.findIndex((k) => a.id.startsWith(k));
      const bi = order.findIndex((k) => b.id.startsWith(k));
      const aRank = ai === -1 ? 99 : ai;
      const bRank = bi === -1 ? 99 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.label.localeCompare(b.label);
    });
}

export function filterListingsByDerivedZone(
  listings: TicketListing[],
  zone: DerivedZone | null
): TicketListing[] {
  if (!zone) return listings;
  return listings.filter(zone.match);
}
