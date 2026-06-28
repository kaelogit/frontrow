import type { Competition } from "@/types/database";
import {
  worldCupMockCompetition,
  worldCupMockEvents,
  worldCupMockTeams,
  worldCupMockVenues,
} from "@/lib/data/world-cup-2026-schedule.generated";

export const mockEvents = worldCupMockEvents;

export const mockCompetitions: Competition[] = [
  worldCupMockCompetition,
  {
    id: "c2",
    slug: "premier-league",
    name: "Premier League",
    sport: "football",
    country: "England",
    logo_url: null,
    description: null,
    featured: false,
  },
  {
    id: "c3",
    slug: "nba",
    name: "NBA",
    sport: "basketball",
    country: "USA",
    logo_url: null,
    description: null,
    featured: false,
  },
];

export function getMockEventBySlug(slug: string) {
  return mockEvents.find((e) => e.slug === slug) ?? null;
}

export function getMockFeaturedEvents() {
  return mockEvents.filter((e) => e.featured);
}

/** Re-export for components that need team/venue lookups in mock mode */
export { worldCupMockTeams, worldCupMockVenues };
