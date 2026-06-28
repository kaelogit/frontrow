import { getCategoryImage } from "@/lib/images";
import type { EventWithRelations } from "@/types/database";

export interface WorldCupCity {
  slug: string;
  name: string;
  country: string;
  venue: string;
  venueSlug: string;
  dateRangeLabel: string;
  dateStart: string;
  dateEnd: string;
  description: string;
  venueBlurb: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
  /** Match venue slug, city name, or venue name (case-insensitive) */
  matchTerms: string[];
  hostsFinal?: boolean;
}

export const WORLD_CUP_CITY_PAGES: WorldCupCity[] = [
  {
    slug: "vancouver",
    name: "Vancouver",
    country: "Canada",
    venue: "BC Place Stadium",
    venueSlug: "bc-place-stadium",
    dateRangeLabel: "13 June – 2 July 2026",
    dateStart: "2026-06-13",
    dateEnd: "2026-07-02",
    description:
      "World Cup 2026 comes to the Pacific Northwest. BC Place hosts group stage matches in downtown Vancouver with a retractable roof and iconic atmosphere.",
    venueBlurb:
      "BC Place seats 54,500 fans and hosted the 2015 Women's World Cup Final. Interactive seat maps available for every match.",
    seoTitle: "World Cup 2026 Vancouver Tickets — BC Place Stadium",
    seoDescription:
      "Buy FIFA World Cup 2026 tickets in Vancouver at BC Place Stadium. Group stage matches with section-level seating and instant confirmation.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["vancouver", "bc place", "bc-place"],
  },
  {
    slug: "new-york",
    name: "New York / New Jersey",
    country: "United States",
    venue: "MetLife Stadium",
    venueSlug: "metlife-stadium",
    dateRangeLabel: "13 June – 19 July 2026",
    dateStart: "2026-06-13",
    dateEnd: "2026-07-19",
    description:
      "The New York metro area hosts some of the biggest matches of World Cup 2026 — including the Final at MetLife Stadium on 19 July.",
    venueBlurb:
      "MetLife Stadium in East Rutherford, New Jersey holds 82,500 and will host the World Cup Final (Match 104). Premium hospitality and 100-level seats available.",
    seoTitle: "World Cup 2026 New York Tickets — MetLife Stadium Final",
    seoDescription:
      "World Cup 2026 tickets in New York and New Jersey. MetLife Stadium hosts the Final plus knockout matches — from $600.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["metlife", "new jersey", "east rutherford"],
    hostsFinal: true,
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    country: "United States",
    venue: "SoFi Stadium",
    venueSlug: "sofi-stadium",
    dateRangeLabel: "14 June – 12 July 2026",
    dateStart: "2026-06-14",
    dateEnd: "2026-07-12",
    description:
      "Los Angeles welcomes the world to SoFi Stadium in Inglewood — a state-of-the-art venue built for the biggest stages in sport.",
    venueBlurb:
      "SoFi Stadium seats 70,240 under a translucent canopy. Expect quarterfinal action and blockbuster group matches in Southern California.",
    seoTitle: "World Cup 2026 Los Angeles Tickets — SoFi Stadium",
    seoDescription:
      "FIFA World Cup 2026 tickets in Los Angeles at SoFi Stadium. Group and knockout matches with verified resale inventory.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["los angeles", "sofi", "inglewood"],
  },
  {
    slug: "miami",
    name: "Miami",
    country: "United States",
    venue: "Hard Rock Stadium",
    venueSlug: "hard-rock-stadium",
    dateRangeLabel: "15 June – 7 July 2026",
    dateStart: "2026-06-15",
    dateEnd: "2026-07-07",
    description:
      "Sun, football, and World Cup energy in Miami Gardens. Hard Rock Stadium brings South Florida's party atmosphere to the global stage.",
    venueBlurb:
      "Hard Rock Stadium holds 65,326 and regularly hosts major international fixtures. Cat 1–4 seating across the bowl.",
    seoTitle: "World Cup 2026 Miami Tickets — Hard Rock Stadium",
    seoDescription:
      "Buy World Cup 2026 Miami tickets at Hard Rock Stadium. Group stage matches from $400 with seat map selection.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["miami", "hard rock"],
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    venue: "Estadio Azteca",
    venueSlug: "estadio-azteca",
    dateRangeLabel: "11 June – 5 July 2026",
    dateStart: "2026-06-11",
    dateEnd: "2026-07-05",
    description:
      "The legendary Estadio Azteca opens the tournament — the only stadium to have hosted two World Cup Finals.",
    venueBlurb:
      "Azteca's 87,523 capacity and altitude make it one of the most intimidating venues in world football. Opening match host city.",
    seoTitle: "World Cup 2026 Mexico City Tickets — Estadio Azteca",
    seoDescription:
      "World Cup 2026 tickets in Mexico City at Estadio Azteca. Opening matches and knockout football in the heart of Mexico.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["mexico city", "azteca"],
  },
  {
    slug: "dallas",
    name: "Dallas",
    country: "United States",
    venue: "AT&T Stadium",
    venueSlug: "att-stadium",
    dateRangeLabel: "14 June – 10 July 2026",
    dateStart: "2026-06-14",
    dateEnd: "2026-07-10",
    description:
      "Everything's bigger in Texas — including World Cup 2026 at AT&T Stadium in Arlington.",
    venueBlurb:
      "AT&T Stadium's retractable roof and massive HD board make it a premier World Cup venue with 80,000+ capacity.",
    seoTitle: "World Cup 2026 Dallas Tickets — AT&T Stadium",
    seoDescription:
      "FIFA World Cup 2026 tickets in Dallas at AT&T Stadium. Group and knockout matches in North Texas.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["dallas", "arlington", "at&t", "att stadium"],
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    country: "United States",
    venue: "Mercedes-Benz Stadium",
    venueSlug: "mercedes-benz-stadium",
    dateRangeLabel: "15 June – 8 July 2026",
    dateStart: "2026-06-15",
    dateEnd: "2026-07-08",
    description:
      "Atlanta's Mercedes-Benz Stadium hosts World Cup 2026 with a unique retractable pitch and passionate southern crowd.",
    venueBlurb:
      "Home to Atlanta United, the stadium seats 71,000 and features a halo video board — a modern World Cup experience.",
    seoTitle: "World Cup 2026 Atlanta Tickets — Mercedes-Benz Stadium",
    seoDescription:
      "Buy World Cup 2026 tickets in Atlanta at Mercedes-Benz Stadium. Verified seats for every match.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["atlanta", "mercedes"],
  },
  {
    slug: "seattle",
    name: "Seattle",
    country: "United States",
    venue: "Lumen Field",
    venueSlug: "lumen-field",
    dateRangeLabel: "13 June – 4 July 2026",
    dateStart: "2026-06-13",
    dateEnd: "2026-07-04",
    description:
      "Seattle's Lumen Field brings Pacific Northwest passion to World Cup 2026 with an intimate, loud atmosphere.",
    venueBlurb:
      "Lumen Field is known for record-breaking crowd noise. World Cup matches here will feel like a cauldron.",
    seoTitle: "World Cup 2026 Seattle Tickets — Lumen Field",
    seoDescription:
      "World Cup 2026 Seattle tickets at Lumen Field. Group stage matches in the Emerald City.",
    image: getCategoryImage("world-cup-2026"),
    matchTerms: ["seattle", "lumen"],
  },
];

export function getWorldCupCity(slug: string): WorldCupCity | undefined {
  return WORLD_CUP_CITY_PAGES.find((c) => c.slug === slug);
}

export function getAllWorldCupCitySlugs(): string[] {
  return WORLD_CUP_CITY_PAGES.map((c) => c.slug);
}

export function filterEventsForCity(
  events: EventWithRelations[],
  city: WorldCupCity
): EventWithRelations[] {
  return events
    .filter((event) => {
      const venue = event.venue;
      if (!venue) return false;

      const haystack = [
        venue.slug,
        venue.name,
        venue.city,
        venue.country,
        event.title,
        event.subtitle ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return city.matchTerms.some((term) => haystack.includes(term.toLowerCase()));
    })
    .sort((a, b) => {
      const da = `${a.event_date}T${a.event_time ?? "00:00"}`;
      const db = `${b.event_date}T${b.event_time ?? "00:00"}`;
      return da.localeCompare(db);
    });
}

export type UrgencyLabel = "Limited tickets" | "Best-seller" | "On sale soon" | "High demand";

export function getEventUrgency(event: EventWithRelations): UrgencyLabel | null {
  if (event.scarcity_override != null && event.scarcity_override <= 5) {
    return "Limited tickets";
  }
  if (event.featured && (event.min_price ?? 0) >= 500) {
    return "Best-seller";
  }
  if (event.seat_map_enabled) {
    return "High demand";
  }
  const categories = event.ticket_categories ?? [];
  const available = categories.reduce((s, c) => s + c.quantity_available, 0);
  if (available > 0 && available <= 20) {
    return "Limited tickets";
  }
  if (event.featured) {
    return "Best-seller";
  }
  return null;
}

export function urgencyBadgeClass(label: UrgencyLabel): string {
  switch (label) {
    case "Limited tickets":
      return "bg-pink-100 text-pink-800";
    case "Best-seller":
      return "bg-amber-100 text-amber-900";
    case "High demand":
      return "bg-violet-100 text-violet-800";
    case "On sale soon":
      return "bg-slate-100 text-slate-600";
  }
}
