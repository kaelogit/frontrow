import { stagePageHref } from "@/lib/marketing/world-cup-stages";
import {
  WORLD_CUP_CITY_CARDS,
  WORLD_CUP_STAGE_CARDS,
  WORLD_CUP_TEAM_CARDS,
  type MarketingGridCard,
} from "@/lib/marketing/world-cup-cards";

export type WorldCupHubTab =
  | "all"
  | "teams"
  | "cities"
  | "final"
  | "quarterfinals"
  | "round-of-16"
  | "round-of-32";

export const WORLD_CUP_HUB_TABS: { id: WorldCupHubTab; label: string }[] = [
  { id: "all", label: "All games" },
  { id: "teams", label: "National teams" },
  { id: "cities", label: "Cities" },
  { id: "final", label: "Final" },
  { id: "quarterfinals", label: "Quarterfinals" },
  { id: "round-of-16", label: "Round of 16" },
  { id: "round-of-32", label: "Round of 32" },
];

/** @deprecated Use MarketingGridCard from world-cup-cards.ts */
export type HubGridItem = MarketingGridCard;

export const WORLD_CUP_CITIES = WORLD_CUP_CITY_CARDS;
export const WORLD_CUP_TEAMS = WORLD_CUP_TEAM_CARDS;
export { WORLD_CUP_STAGE_CARDS };

export const WORLD_CUP_STAGES: Record<
  Exclude<WorldCupHubTab, "all" | "teams" | "cities">,
  { title: string; description: string; href: string; searchTerms: RegExp }
> = {
  final: {
    title: "World Cup Final 2026",
    description:
      "Match 104 · MetLife Stadium, New Jersey · 19 July 2026. The biggest match in football.",
    href: stagePageHref("final"),
    searchTerms: /\bfinal\b/i,
  },
  quarterfinals: {
    title: "Quarterfinals",
    description: "Eight teams. Four matches. A place in the semifinals on the line.",
    href: stagePageHref("quarterfinals"),
    searchTerms: /quarterfinal|QF/i,
  },
  "round-of-16": {
    title: "Round of 16",
    description: "Knockout football begins — win or go home.",
    href: stagePageHref("round-of-16"),
    searchTerms: /round of 16|R16|round of sixteen/i,
  },
  "round-of-32": {
    title: "Round of 32",
    description: "The expanded knockout bracket — 48 teams, 32 places in the Round of 16.",
    href: stagePageHref("round-of-32"),
    searchTerms: /round of 32|R32/i,
  },
};

export function filterEventsByHubTab<T extends { title: string; subtitle: string | null }>(
  events: T[],
  tab: WorldCupHubTab
): T[] {
  if (tab === "all" || tab === "teams" || tab === "cities") {
    return events;
  }

  const stage = WORLD_CUP_STAGES[tab];
  return events.filter(
    (e) =>
      stage.searchTerms.test(e.title) ||
      stage.searchTerms.test(e.subtitle ?? "")
  );
}
