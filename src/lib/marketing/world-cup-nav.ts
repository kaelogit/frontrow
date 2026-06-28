import { getCategoryImage } from "@/lib/images";
import { stagePageHref } from "@/lib/marketing/world-cup-stages";

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

export interface HubGridItem {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
}

/** Host cities — dedicated city landing pages (item 9) */
export const WORLD_CUP_CITIES: HubGridItem[] = [
  {
    slug: "vancouver",
    title: "Vancouver",
    subtitle: "BC Place Stadium",
    href: "/world-cup-2026/vancouver",
    image: getCategoryImage("world-cup-2026"),
    badge: "Canada",
  },
  {
    slug: "los-angeles",
    title: "Los Angeles",
    subtitle: "SoFi Stadium",
    href: "/world-cup-2026/los-angeles",
    image: getCategoryImage("world-cup-2026"),
    badge: "USA",
  },
  {
    slug: "new-york",
    title: "New York / New Jersey",
    subtitle: "MetLife Stadium · Final host",
    href: "/world-cup-2026/new-york",
    image: getCategoryImage("world-cup-2026"),
    badge: "Final",
  },
  {
    slug: "miami",
    title: "Miami",
    subtitle: "Hard Rock Stadium",
    href: "/world-cup-2026/miami",
    image: getCategoryImage("world-cup-2026"),
    badge: "USA",
  },
  {
    slug: "mexico-city",
    title: "Mexico City",
    subtitle: "Estadio Azteca",
    href: "/world-cup-2026/mexico-city",
    image: getCategoryImage("world-cup-2026"),
    badge: "Mexico",
  },
  {
    slug: "dallas",
    title: "Dallas",
    subtitle: "AT&T Stadium",
    href: "/world-cup-2026/dallas",
    image: getCategoryImage("world-cup-2026"),
    badge: "USA",
  },
  {
    slug: "atlanta",
    title: "Atlanta",
    subtitle: "Mercedes-Benz Stadium",
    href: "/world-cup-2026/atlanta",
    image: getCategoryImage("world-cup-2026"),
    badge: "USA",
  },
  {
    slug: "seattle",
    title: "Seattle",
    subtitle: "Lumen Field",
    href: "/world-cup-2026/seattle",
    image: getCategoryImage("world-cup-2026"),
    badge: "USA",
  },
];

export const WORLD_CUP_TEAMS: HubGridItem[] = [
  {
    slug: "brazil",
    title: "Brazil",
    subtitle: "Seleção tickets",
    href: "/events?competition=world-cup-2026&search=Brazil",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇧🇷",
  },
  {
    slug: "belgium",
    title: "Belgium",
    subtitle: "Red Devils",
    href: "/events?competition=world-cup-2026&search=Belgium",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇧🇪",
  },
  {
    slug: "new-zealand",
    title: "New Zealand",
    subtitle: "All Blacks football",
    href: "/events?competition=world-cup-2026&search=New+Zealand",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇳🇿",
  },
  {
    slug: "usa",
    title: "USA",
    subtitle: "Host nation",
    href: "/events?competition=world-cup-2026&search=USA",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇺🇸",
  },
  {
    slug: "mexico",
    title: "Mexico",
    subtitle: "Host nation",
    href: "/events?competition=world-cup-2026&search=Mexico",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇲🇽",
  },
  {
    slug: "england",
    title: "England",
    subtitle: "Three Lions",
    href: "/events?competition=world-cup-2026&search=England",
    image: getCategoryImage("world-cup-2026"),
    badge: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  {
    slug: "germany",
    title: "Germany",
    subtitle: "Die Mannschaft",
    href: "/events?competition=world-cup-2026&search=Germany",
    image: getCategoryImage("world-cup-2026"),
    badge: "🇩🇪",
  },
  {
    slug: "scotland",
    title: "Scotland",
    subtitle: "Tartan Army",
    href: "/events?competition=world-cup-2026&search=Scotland",
    image: getCategoryImage("world-cup-2026"),
    badge: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  },
];

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
    searchTerms: /round of 32|R32|group stage|group [a-l]/i,
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
