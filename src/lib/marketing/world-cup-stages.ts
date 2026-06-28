import { getCategoryImage } from "@/lib/images";
import type { EventWithRelations } from "@/types/database";

export type WorldCupStageSlug =
  | "final"
  | "semifinals"
  | "quarterfinals"
  | "round-of-16"
  | "round-of-32";

export interface StagePricingTier {
  zone: string;
  sections: string;
  fromPrice: number;
  avgPrice: number;
}

export interface WorldCupStage {
  slug: WorldCupStageSlug;
  title: string;
  shortTitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
  searchTerms: RegExp;
  pricingTiers?: StagePricingTier[];
  sectionSamples?: { section: string; fromPrice: number; avgPrice: number; note?: string }[];
}

export const WORLD_CUP_STAGE_PAGES: WorldCupStage[] = [
  {
    slug: "final",
    title: "World Cup Final 2026",
    shortTitle: "Final",
    description:
      "Match 104 · MetLife Stadium, East Rutherford · Sunday 19 July 2026. The pinnacle of world football — premium demand across every bowl level.",
    seoTitle: "World Cup 2026 Final Tickets — MetLife Stadium Prices",
    seoDescription:
      "World Cup Final 2026 tickets at MetLife Stadium. From $11,227 for pairs in the 300s to premium 100-level and hospitality from $48k+.",
    image: getCategoryImage("world-cup-2026"),
    searchTerms: /\bfinal\b/i,
    pricingTiers: [
      { zone: "Cat 4 / Value", sections: "Upper 300s far corners", fromPrice: 11227, avgPrice: 13141 },
      { zone: "Cat 3", sections: "300s center & corners", fromPrice: 13141, avgPrice: 16500 },
      { zone: "Cat 2", sections: "200s / lower 300s", fromPrice: 18000, avgPrice: 25400 },
      { zone: "Cat 1", sections: "100s sideline", fromPrice: 25021, avgPrice: 42000 },
      { zone: "Hospitality", sections: "Lounges & pitchside", fromPrice: 48606, avgPrice: 80632 },
    ],
    sectionSamples: [
      { section: "321", fromPrice: 11227, avgPrice: 11227, note: "Map bubble · 2 tickets" },
      { section: "349", fromPrice: 13141, avgPrice: 13141 },
      { section: "303", fromPrice: 13195, avgPrice: 13200 },
      { section: "131", fromPrice: 26116, avgPrice: 54977, note: "Premium listing" },
      { section: "104", fromPrice: 22561, avgPrice: 28201 },
      { section: "Trophy Lounge", fromPrice: 48606, avgPrice: 48606, note: "Hospitality" },
      { section: "Pitchside Lounge", fromPrice: 112167, avgPrice: 112167, note: "Hospitality" },
    ],
  },
  {
    slug: "semifinals",
    title: "World Cup Semifinals 2026",
    shortTitle: "Semifinals",
    description:
      "Four teams remain. Two semifinal matches decide who reaches the Final at MetLife Stadium.",
    seoTitle: "World Cup 2026 Semifinal Tickets",
    seoDescription:
      "Buy FIFA World Cup 2026 semifinal tickets. Premium knockout matches across US host cities.",
    image: getCategoryImage("world-cup-2026"),
    searchTerms: /semifinal|semi-final/i,
    pricingTiers: [
      { zone: "Cat 3", sections: "Upper bowl", fromPrice: 800, avgPrice: 1200 },
      { zone: "Cat 2", sections: "Mid bowl", fromPrice: 1500, avgPrice: 2200 },
      { zone: "Cat 1", sections: "Lower sideline", fromPrice: 3500, avgPrice: 5500 },
    ],
  },
  {
    slug: "quarterfinals",
    title: "World Cup Quarterfinals 2026",
    shortTitle: "Quarterfinals",
    description:
      "Eight teams. Four matches. A place in the semifinals on the line — the knockout stage at its most intense.",
    seoTitle: "World Cup 2026 Quarterfinal Tickets — Prices & Schedule",
    seoDescription:
      "World Cup 2026 quarterfinal tickets by venue and date. Compare from-prices across host stadiums.",
    image: getCategoryImage("world-cup-2026"),
    searchTerms: /quarterfinal|QF/i,
    pricingTiers: [
      { zone: "Cat 3", sections: "Upper bowl", fromPrice: 450, avgPrice: 650 },
      { zone: "Cat 2", sections: "Mid bowl", fromPrice: 900, avgPrice: 1400 },
      { zone: "Cat 1", sections: "Lower premium", fromPrice: 2000, avgPrice: 3200 },
    ],
  },
  {
    slug: "round-of-16",
    title: "World Cup Round of 16 — 2026",
    shortTitle: "Round of 16",
    description:
      "The first knockout round of the expanded 48-team World Cup. Win or go home.",
    seoTitle: "World Cup 2026 Round of 16 Tickets",
    seoDescription:
      "Round of 16 World Cup 2026 tickets — every match, venue, and from-price in one schedule.",
    image: getCategoryImage("world-cup-2026"),
    searchTerms: /round of 16|R16|round of sixteen/i,
    pricingTiers: [
      { zone: "Cat 3", sections: "Upper bowl", fromPrice: 350, avgPrice: 500 },
      { zone: "Cat 2", sections: "Mid bowl", fromPrice: 550, avgPrice: 800 },
      { zone: "Cat 1", sections: "Lower bowl", fromPrice: 600, avgPrice: 1200 },
    ],
  },
  {
    slug: "round-of-32",
    title: "World Cup Round of 32 — 2026",
    shortTitle: "Round of 32",
    description:
      "The new knockout bracket — 32 teams battle for a place in the Round of 16 across North America.",
    seoTitle: "World Cup 2026 Round of 32 Tickets",
    seoDescription:
      "Round of 32 tickets for FIFA World Cup 2026. Browse group winners and third-place qualifiers.",
    image: getCategoryImage("world-cup-2026"),
    searchTerms: /round of 32|R32|group stage|group [a-l]/i,
    pricingTiers: [
      { zone: "Cat 4", sections: "Upper corners", fromPrice: 250, avgPrice: 380 },
      { zone: "Cat 3", sections: "Upper sideline", fromPrice: 350, avgPrice: 480 },
      { zone: "Cat 2", sections: "Mid bowl", fromPrice: 400, avgPrice: 650 },
      { zone: "Cat 1", sections: "Lower premium", fromPrice: 650, avgPrice: 1200 },
    ],
  },
];

export function getWorldCupStage(slug: string): WorldCupStage | undefined {
  return WORLD_CUP_STAGE_PAGES.find((s) => s.slug === slug);
}

export function getAllWorldCupStageSlugs(): WorldCupStageSlug[] {
  return WORLD_CUP_STAGE_PAGES.map((s) => s.slug);
}

export function filterEventsForStage(
  events: EventWithRelations[],
  stage: WorldCupStage
): EventWithRelations[] {
  return events
    .filter(
      (e) =>
        stage.searchTerms.test(e.title) ||
        stage.searchTerms.test(e.subtitle ?? "")
    )
    .sort((a, b) => {
      const da = `${a.event_date}T${a.event_time ?? "00:00"}`;
      const db = `${b.event_date}T${b.event_time ?? "00:00"}`;
      return da.localeCompare(db);
    });
}

export function estimateAvgPrice(event: EventWithRelations): number | null {
  if (event.min_price == null) return null;

  return Math.round(event.min_price * 1.15);
}

export function stagePageHref(slug: WorldCupStageSlug): string {
  return `/world-cup-2026/stages/${slug}`;
}
