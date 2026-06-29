import { getTeamFlagPath, getTeamIsoBySlug } from "@/lib/teams/flags";
import { stagePageHref } from "@/lib/marketing/world-cup-stages";

/** Hellotickets-style hub grid card — config-driven, used on World Cup hub */
export interface MarketingGridCard {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  /** Photo hero; omit to use flag gradient fallback */
  image?: string;
  /** ISO flag code for badge + fallback background */
  flagIso?: string;
  badge?: string;
}

function teamIso(slug: string): string | undefined {
  return getTeamIsoBySlug(slug) ?? undefined;
}

function teamHref(name: string): string {
  return `/events?competition=world-cup-2026&search=${encodeURIComponent(name)}`;
}

const MATCH = (n: number) => `/images/events/match-${n}.jpg`;

/** R32 match hero per team (matches 80–88) */
const R32_TEAM_MATCH: Record<string, number> = {
  england: 80,
  "congo-dr": 80,
  usa: 81,
  "bosnia-herzegovina": 81,
  belgium: 82,
  senegal: 82,
  portugal: 83,
  croatia: 83,
  spain: 84,
  austria: 84,
  switzerland: 85,
  algeria: 85,
  argentina: 86,
  "cabo-verde": 86,
  colombia: 87,
  ghana: 87,
  australia: 88,
  egypt: 88,
};

const HOST_SLUGS = new Set(["usa", "mexico", "canada"]);

function mkTeam(
  slug: string,
  title: string,
  subtitle: string,
  badge?: string
): MarketingGridCard {
  const matchNum = R32_TEAM_MATCH[slug];
  return {
    slug,
    title,
    subtitle,
    href: teamHref(title),
    ...(matchNum ? { image: MATCH(matchNum) } : {}),
    flagIso: teamIso(slug),
    ...(badge ? { badge } : {}),
  };
}

/** Knockout stage browse cards — shown on hub “All games” */
export const WORLD_CUP_STAGE_CARDS: MarketingGridCard[] = [
  {
    slug: "round-of-32",
    title: "Round of 32",
    subtitle: "32 teams · win or go home",
    href: stagePageHref("round-of-32"),
    image: MATCH(80),
    badge: "Jul 1–3",
  },
  {
    slug: "round-of-16",
    title: "Round of 16",
    subtitle: "The knockout stage heats up",
    href: stagePageHref("round-of-16"),
    image: MATCH(91),
    badge: "Jul 4–7",
  },
  {
    slug: "quarterfinals",
    title: "Quarterfinals",
    subtitle: "Eight teams left",
    href: stagePageHref("quarterfinals"),
    image: MATCH(97),
    badge: "Jul 9–11",
  },
  {
    slug: "semifinals",
    title: "Semifinals",
    subtitle: "Four teams · two tickets to the Final",
    href: stagePageHref("semifinals"),
    image: MATCH(102),
    badge: "Jul 14–15",
  },
  {
    slug: "final",
    title: "World Cup Final",
    subtitle: "MetLife Stadium · Jul 19",
    href: stagePageHref("final"),
    image: MATCH(104),
    badge: "Match 104",
  },
];

/** Host cities — one hero per city landing page */
export const WORLD_CUP_CITY_CARDS: MarketingGridCard[] = [
  {
    slug: "new-york",
    title: "New York / New Jersey",
    subtitle: "MetLife Stadium · Final host",
    href: "/world-cup-2026/new-york",
    image: MATCH(104),
    badge: "Final",
  },
  {
    slug: "los-angeles",
    title: "Los Angeles",
    subtitle: "SoFi Stadium",
    href: "/world-cup-2026/los-angeles",
    image: MATCH(98),
    badge: "USA",
  },
  {
    slug: "miami",
    title: "Miami",
    subtitle: "Hard Rock Stadium",
    href: "/world-cup-2026/miami",
    image: MATCH(99),
    badge: "USA",
  },
  {
    slug: "mexico-city",
    title: "Mexico City",
    subtitle: "Estadio Azteca",
    href: "/world-cup-2026/mexico-city",
    image: MATCH(92),
    badge: "Mexico",
  },
  {
    slug: "dallas",
    title: "Dallas",
    subtitle: "AT&T Stadium",
    href: "/world-cup-2026/dallas",
    image: MATCH(88),
    badge: "USA",
  },
  {
    slug: "atlanta",
    title: "Atlanta",
    subtitle: "Mercedes-Benz Stadium",
    href: "/world-cup-2026/atlanta",
    image: MATCH(80),
    badge: "USA",
  },
  {
    slug: "seattle",
    title: "Seattle",
    subtitle: "Lumen Field",
    href: "/world-cup-2026/seattle",
    image: MATCH(82),
    badge: "USA",
  },
  {
    slug: "vancouver",
    title: "Vancouver",
    subtitle: "BC Place Stadium",
    href: "/world-cup-2026/vancouver",
    image: MATCH(85),
    badge: "Canada",
  },
];

/** All 48 World Cup 2026 finalists — hosts first, then A–Z */
const ALL_TEAMS: { slug: string; title: string; subtitle: string }[] = [
  { slug: "canada", title: "Canada", subtitle: "Host nation" },
  { slug: "mexico", title: "Mexico", subtitle: "Host nation" },
  { slug: "usa", title: "USA", subtitle: "Host nation" },
  { slug: "algeria", title: "Algeria", subtitle: "Les Fennecs" },
  { slug: "argentina", title: "Argentina", subtitle: "Defending champions" },
  { slug: "australia", title: "Australia", subtitle: "Socceroos" },
  { slug: "austria", title: "Austria", subtitle: "Das Team" },
  { slug: "belgium", title: "Belgium", subtitle: "Red Devils" },
  { slug: "bosnia-herzegovina", title: "Bosnia and Herzegovina", subtitle: "Zmajevi" },
  { slug: "brazil", title: "Brazil", subtitle: "Seleção" },
  { slug: "cabo-verde", title: "Cabo Verde", subtitle: "Tubarões Azuis" },
  { slug: "colombia", title: "Colombia", subtitle: "Los Cafeteros" },
  { slug: "congo-dr", title: "Congo DR", subtitle: "Les Léopards" },
  { slug: "cote-divoire", title: "Côte d'Ivoire", subtitle: "Les Éléphants" },
  { slug: "croatia", title: "Croatia", subtitle: "Vatreni" },
  { slug: "curacao", title: "Curaçao", subtitle: "Kòrsou" },
  { slug: "czechia", title: "Czechia", subtitle: "Národní tým" },
  { slug: "ecuador", title: "Ecuador", subtitle: "La Tri" },
  { slug: "egypt", title: "Egypt", subtitle: "Pharaohs" },
  { slug: "england", title: "England", subtitle: "Three Lions" },
  { slug: "france", title: "France", subtitle: "Les Bleus" },
  { slug: "germany", title: "Germany", subtitle: "Die Mannschaft" },
  { slug: "ghana", title: "Ghana", subtitle: "Black Stars" },
  { slug: "haiti", title: "Haiti", subtitle: "Les Grenadiers" },
  { slug: "iran", title: "IR Iran", subtitle: "Team Melli" },
  { slug: "iraq", title: "Iraq", subtitle: "Usood Al-Rafidain" },
  { slug: "japan", title: "Japan", subtitle: "Samurai Blue" },
  { slug: "jordan", title: "Jordan", subtitle: "Al-Nashama" },
  { slug: "south-korea", title: "Korea Republic", subtitle: "Taegeuk Warriors" },
  { slug: "morocco", title: "Morocco", subtitle: "Atlas Lions" },
  { slug: "netherlands", title: "Netherlands", subtitle: "Oranje" },
  { slug: "new-zealand", title: "New Zealand", subtitle: "All Whites" },
  { slug: "norway", title: "Norway", subtitle: "Løvene" },
  { slug: "panama", title: "Panama", subtitle: "Los Canaleros" },
  { slug: "paraguay", title: "Paraguay", subtitle: "Albirroja" },
  { slug: "portugal", title: "Portugal", subtitle: "A Seleção" },
  { slug: "qatar", title: "Qatar", subtitle: "Al-Annabi" },
  { slug: "saudi-arabia", title: "Saudi Arabia", subtitle: "Green Falcons" },
  { slug: "scotland", title: "Scotland", subtitle: "Tartan Army" },
  { slug: "senegal", title: "Senegal", subtitle: "Lions of Teranga" },
  { slug: "south-africa", title: "South Africa", subtitle: "Bafana Bafana" },
  { slug: "spain", title: "Spain", subtitle: "La Roja" },
  { slug: "sweden", title: "Sweden", subtitle: "Blågult" },
  { slug: "switzerland", title: "Switzerland", subtitle: "Nati" },
  { slug: "tunisia", title: "Tunisia", subtitle: "Eagles of Carthage" },
  { slug: "turkiye", title: "Türkiye", subtitle: "Ay-Yıldızlılar" },
  { slug: "uruguay", title: "Uruguay", subtitle: "La Celeste" },
  { slug: "uzbekistan", title: "Uzbekistan", subtitle: "White Wolves" },
];

export const WORLD_CUP_TEAM_CARDS: MarketingGridCard[] = ALL_TEAMS.map(({ slug, title, subtitle }) =>
  mkTeam(slug, title, subtitle, HOST_SLUGS.has(slug) ? "Host" : undefined)
);

export function getMarketingCardFlagSrc(card: MarketingGridCard): string | null {
  if (card.flagIso) return getTeamFlagPath(card.flagIso);
  const iso = getTeamIsoBySlug(card.slug);
  return iso ? getTeamFlagPath(iso) : null;
}
