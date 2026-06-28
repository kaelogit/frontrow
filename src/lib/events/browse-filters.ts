import type { EventWithRelations, Team } from "@/types/database";

export type EventRoundFilter =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarterfinals"
  | "semifinals"
  | "final";

export interface EventBrowseFilters {
  competition?: string;
  search?: string;
  city?: string;
  team?: string;
  group?: string;
  round?: EventRoundFilter;
  month?: "june" | "july";
  date?: string;
  priceMin?: number;
  priceMax?: number;
  parking?: boolean;
}

export interface BrowseFilterOption {
  value: string;
  label: string;
}

export interface BrowseFilterOptions {
  cities: BrowseFilterOption[];
  teams: BrowseFilterOption[];
  groups: BrowseFilterOption[];
  rounds: BrowseFilterOption[];
  months: BrowseFilterOption[];
  priceRange: { min: number; max: number };
}

const ROUND_PATTERNS: Record<EventRoundFilter, RegExp> = {
  final: /\bfinal\b/i,
  semifinals: /semifinal|semi-final/i,
  quarterfinals: /quarterfinal|QF/i,
  "round-of-16": /round of 16|R16|round of sixteen/i,
  "round-of-32": /round of 32|R32/i,
  group: /group [a-l]/i,
};

export const ROUND_FILTER_OPTIONS: BrowseFilterOption[] = [
  { value: "group", label: "Group stage" },
  { value: "round-of-32", label: "Round of 32" },
  { value: "round-of-16", label: "Round of 16" },
  { value: "quarterfinals", label: "Quarterfinals" },
  { value: "semifinals", label: "Semifinals" },
  { value: "final", label: "Final" },
];

function slugifyCity(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export function extractGroupLetter(event: EventWithRelations): string | null {
  const text = `${event.title} ${event.subtitle ?? ""}`;
  const match = text.match(/Group\s+([A-L])/i);
  return match ? match[1].toUpperCase() : null;
}

export function eventMatchesRound(
  event: EventWithRelations,
  round: EventRoundFilter
): boolean {
  const text = `${event.title} ${event.subtitle ?? ""}`;
  return ROUND_PATTERNS[round].test(text);
}

export function eventHasParking(event: EventWithRelations): boolean {
  const haystack = [
    event.title,
    event.subtitle ?? "",
    event.description ?? "",
    ...(event.ticket_categories?.map((c) => `${c.name} ${c.section ?? ""}`) ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes("parking");
}

function collectTeams(event: EventWithRelations): Team[] {
  const teams: Team[] = [];
  if (event.home_team) teams.push(event.home_team);
  if (event.away_team) teams.push(event.away_team);
  return teams;
}

export function parseBrowseFilters(
  params: Record<string, string | undefined>
): EventBrowseFilters {
  const round = params.round as EventRoundFilter | undefined;
  const month = params.month as "june" | "july" | undefined;

  return {
    competition: params.competition,
    search: params.search ?? params.q,
    city: params.city,
    team: params.team,
    group: params.group?.toUpperCase(),
    round: round && ROUND_PATTERNS[round] ? round : undefined,
    month: month === "june" || month === "july" ? month : undefined,
    date: params.date,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    parking: params.parking === "1",
  };
}

export function buildBrowseFilterOptions(
  events: EventWithRelations[]
): BrowseFilterOptions {
  const cityMap = new Map<string, string>();
  const teamMap = new Map<string, string>();
  const groupSet = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const event of events) {
    if (event.venue?.city) {
      const slug = slugifyCity(event.venue.city);
      cityMap.set(slug, event.venue.city);
    }

    for (const team of collectTeams(event)) {
      teamMap.set(team.slug, team.name);
    }

    const group = extractGroupLetter(event);
    if (group) groupSet.add(group);

    if (event.min_price != null) {
      minPrice = Math.min(minPrice, event.min_price);
      maxPrice = Math.max(maxPrice, event.min_price);
    }
  }

  const cities = [...cityMap.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const teams = [...teamMap.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const groups = [...groupSet]
    .sort()
    .map((g) => ({ value: g, label: `Group ${g}` }));

  const rounds = ROUND_FILTER_OPTIONS.filter((round) =>
    events.some((event) => eventMatchesRound(event, round.value as EventRoundFilter))
  );

  const months: BrowseFilterOption[] = [];
  if (events.some((e) => e.event_date.startsWith("2026-06"))) {
    months.push({ value: "june", label: "June 2026" });
  }
  if (events.some((e) => e.event_date.startsWith("2026-07"))) {
    months.push({ value: "july", label: "July 2026" });
  }

  return {
    cities,
    teams,
    groups,
    rounds,
    months,
    priceRange: {
      min: Number.isFinite(minPrice) ? Math.floor(minPrice) : 0,
      max: maxPrice > 0 ? Math.ceil(maxPrice) : 5000,
    },
  };
}

export function applyBrowseFilters(
  events: EventWithRelations[],
  filters: EventBrowseFilters
): EventWithRelations[] {
  return events.filter((event) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        event.title,
        event.subtitle ?? "",
        event.description ?? "",
        event.home_team_label ?? "",
        event.away_team_label ?? "",
        event.venue?.name ?? "",
        event.venue?.city ?? "",
        event.venue?.country ?? "",
        event.competition?.name ?? "",
        ...collectTeams(event).map((t) => t.name),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (filters.city && event.venue) {
      if (slugifyCity(event.venue.city) !== filters.city) return false;
    }

    if (filters.team) {
      const slugs = collectTeams(event).map((t) => t.slug);
      if (!slugs.includes(filters.team)) return false;
    }

    if (filters.group) {
      if (extractGroupLetter(event) !== filters.group) return false;
    }

    if (filters.round && !eventMatchesRound(event, filters.round)) {
      return false;
    }

    if (filters.date && event.event_date !== filters.date) {
      return false;
    }

    if (filters.month === "june" && !event.event_date.startsWith("2026-06")) {
      return false;
    }

    if (filters.month === "july" && !event.event_date.startsWith("2026-07")) {
      return false;
    }

    if (filters.priceMin != null && event.min_price != null) {
      if (event.min_price < filters.priceMin) return false;
    }

    if (filters.priceMax != null && event.min_price != null) {
      if (event.min_price > filters.priceMax) return false;
    }

    if (filters.parking && !eventHasParking(event)) {
      return false;
    }

    return true;
  });
}

export function countActiveBrowseFilters(filters: EventBrowseFilters): number {
  let count = 0;
  if (filters.city) count++;
  if (filters.team) count++;
  if (filters.group) count++;
  if (filters.round) count++;
  if (filters.month || filters.date) count++;
  if (filters.priceMin != null || filters.priceMax != null) count++;
  if (filters.parking) count++;
  if (filters.search) count++;
  return count;
}

export function browseFiltersToQuery(
  filters: EventBrowseFilters
): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.competition) query.competition = filters.competition;
  if (filters.search) query.search = filters.search;
  if (filters.city) query.city = filters.city;
  if (filters.team) query.team = filters.team;
  if (filters.group) query.group = filters.group;
  if (filters.round) query.round = filters.round;
  if (filters.month) query.month = filters.month;
  if (filters.date) query.date = filters.date;
  if (filters.priceMin != null) query.priceMin = String(filters.priceMin);
  if (filters.priceMax != null) query.priceMax = String(filters.priceMax);
  if (filters.parking) query.parking = "1";
  return query;
}
