/**
 * Generates supabase/seed/world-cup-2026-full.sql from fixtures JSON.
 * Run: node scripts/generate-world-cup-2026-seed.mjs
 *
 * Source: scripts/data/wc2026-fixtures.json (TheStatsAPI / FIFA schedule)
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(join(__dirname, "data/wc2026-fixtures.json"), "utf8")
).fixtures;

const FRONTROWLY_DISCOUNT = 0.1;
function frontrowlyPrice(n) {
  return Math.round(n * (1 - FRONTROWLY_DISCOUNT) * 100) / 100;
}

/** Matches with viagogo inventory + interactive seat map in mock/seed */
const SEAT_MAP_MATCHES = new Set([63, 64, 65, 66, 68, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104]);

const SLUG_OVERRIDES = {
  64: "new-zealand-vs-belgium",
  98: "world-cup-qf-match-98",
  104: "world-cup-final-match-104",
  ...Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [80 + i, `world-cup-match-${80 + i}`])
  ),
};

const IMAGE_OVERRIDES = {
  "new-zealand-vs-belgium": "/images/event-new-zealand-belgium.jpg",
  "world-cup-final-match-104": "/images/events/match-104.jpg",
  "world-cup-qf-match-98": "/images/category-world-cup.jpg",
  ...Object.fromEntries(
    Array.from({ length: 25 }, (_, i) => [
      `world-cup-match-${80 + i}`,
      `/images/events/match-${80 + i}.jpg`,
    ])
  ),
};

const TEAM_SLUGS = {
  Algeria: "algeria",
  Argentina: "argentina",
  Australia: "australia",
  Austria: "austria",
  Belgium: "belgium",
  "Bosnia and Herzegovina": "bosnia-herzegovina",
  Brazil: "brazil",
  "Cabo Verde": "cabo-verde",
  Canada: "canada",
  Colombia: "colombia",
  "Congo DR": "congo-dr",
  "Cote d'Ivoire": "cote-divoire",
  Croatia: "croatia",
  Curacao: "curacao",
  Czechia: "czechia",
  Ecuador: "ecuador",
  Egypt: "egypt",
  England: "england",
  France: "france",
  Germany: "germany",
  Ghana: "ghana",
  Haiti: "haiti",
  "IR Iran": "iran",
  Iraq: "iraq",
  Japan: "japan",
  Jordan: "jordan",
  "Korea Republic": "south-korea",
  Mexico: "mexico",
  Morocco: "morocco",
  Netherlands: "netherlands",
  "New Zealand": "new-zealand",
  Norway: "norway",
  Panama: "panama",
  Paraguay: "paraguay",
  Portugal: "portugal",
  Qatar: "qatar",
  "Saudi Arabia": "saudi-arabia",
  Scotland: "scotland",
  Senegal: "senegal",
  "South Africa": "south-africa",
  Spain: "spain",
  Sweden: "sweden",
  Switzerland: "switzerland",
  Tunisia: "tunisia",
  Turkiye: "turkiye",
  "United States": "usa",
  Uruguay: "uruguay",
  Uzbekistan: "uzbekistan",
};

const TEAM_COUNTRIES = {
  Algeria: "Algeria",
  Argentina: "Argentina",
  Australia: "Australia",
  Austria: "Austria",
  Belgium: "Belgium",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina",
  Brazil: "Brazil",
  "Cabo Verde": "Cabo Verde",
  Canada: "Canada",
  Colombia: "Colombia",
  "Congo DR": "DR Congo",
  "Cote d'Ivoire": "Côte d'Ivoire",
  Croatia: "Croatia",
  Curacao: "Curaçao",
  Czechia: "Czechia",
  Ecuador: "Ecuador",
  Egypt: "Egypt",
  England: "England",
  France: "France",
  Germany: "Germany",
  Ghana: "Ghana",
  Haiti: "Haiti",
  "IR Iran": "Iran",
  Iraq: "Iraq",
  Japan: "Japan",
  Jordan: "Jordan",
  "Korea Republic": "South Korea",
  Mexico: "Mexico",
  Morocco: "Morocco",
  Netherlands: "Netherlands",
  "New Zealand": "New Zealand",
  Norway: "Norway",
  Panama: "Panama",
  Paraguay: "Paraguay",
  Portugal: "Portugal",
  Qatar: "Qatar",
  "Saudi Arabia": "Saudi Arabia",
  Scotland: "Scotland",
  Senegal: "Senegal",
  "South Africa": "South Africa",
  Spain: "Spain",
  Sweden: "Sweden",
  Switzerland: "Switzerland",
  Tunisia: "Tunisia",
  Turkiye: "Türkiye",
  "United States": "United States",
  Uruguay: "Uruguay",
  Uzbekistan: "Uzbekistan",
};

const VENUES = {
  "Estadio Azteca": {
    slug: "estadio-azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87523,
    tier: 1,
  },
  "Estadio BBVA": {
    slug: "estadio-bbva",
    name: "Estadio BBVA",
    city: "Monterrey",
    country: "Mexico",
    capacity: 53500,
    tier: 2,
  },
  "Estadio Akron": {
    slug: "estadio-akron",
    name: "Estadio Akron",
    city: "Guadalajara",
    country: "Mexico",
    capacity: 49850,
    tier: 2,
  },
  "BMO Field": {
    slug: "bmo-field",
    name: "BMO Field",
    city: "Toronto",
    country: "Canada",
    capacity: 45736,
    tier: 2,
  },
  "BC Place": {
    slug: "bc-place-stadium",
    name: "BC Place Stadium",
    city: "Vancouver",
    country: "Canada",
    capacity: 54500,
    tier: 2,
    stadium_map_slug: "bc-place",
  },
  "MetLife Stadium": {
    slug: "metlife-stadium",
    name: "MetLife Stadium",
    city: "East Rutherford",
    country: "United States",
    capacity: 82500,
    tier: 1,
    stadium_map_slug: "metlife",
  },
  "SoFi Stadium": {
    slug: "sofi-stadium",
    name: "SoFi Stadium",
    city: "Inglewood",
    country: "United States",
    capacity: 70240,
    tier: 1,
    stadium_map_slug: "sofi",
  },
  "Hard Rock Stadium": {
    slug: "hard-rock-stadium",
    name: "Hard Rock Stadium",
    city: "Miami Gardens",
    country: "United States",
    capacity: 65326,
    tier: 2,
  },
  "Gillette Stadium": {
    slug: "gillette-stadium",
    name: "Gillette Stadium",
    city: "Foxborough",
    country: "United States",
    capacity: 65878,
    tier: 2,
  },
  "AT&T Stadium": {
    slug: "att-stadium",
    name: "AT&T Stadium",
    city: "Arlington",
    country: "United States",
    capacity: 80000,
    tier: 1,
  },
  "Mercedes-Benz Stadium": {
    slug: "mercedes-benz-stadium",
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    country: "United States",
    capacity: 71000,
    tier: 2,
  },
  "Lumen Field": {
    slug: "lumen-field",
    name: "Lumen Field",
    city: "Seattle",
    country: "United States",
    capacity: 69000,
    tier: 2,
  },
  "Levi's Stadium": {
    slug: "levis-stadium",
    name: "Levi's Stadium",
    city: "Santa Clara",
    country: "United States",
    capacity: 68500,
    tier: 2,
    stadium_map_slug: "levis",
  },
  "Lincoln Financial Field": {
    slug: "lincoln-financial-field",
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    country: "United States",
    capacity: 69596,
    tier: 2,
  },
  "NRG Stadium": {
    slug: "nrg-stadium",
    name: "NRG Stadium",
    city: "Houston",
    country: "United States",
    capacity: 72220,
    tier: 2,
  },
  "Arrowhead Stadium": {
    slug: "arrowhead-stadium",
    name: "Arrowhead Stadium",
    city: "Kansas City",
    country: "United States",
    capacity: 76416,
    tier: 2,
  },
};

const HOST_CITY_TZ = {
  "mexico-city": "America/Mexico_City",
  monterrey: "America/Monterrey",
  guadalajara: "America/Mexico_City",
  toronto: "America/Toronto",
  vancouver: "America/Vancouver",
  "new-york": "America/New_York",
  "los-angeles": "America/Los_Angeles",
  miami: "America/New_York",
  boston: "America/New_York",
  dallas: "America/Chicago",
  atlanta: "America/New_York",
  seattle: "America/Los_Angeles",
  philadelphia: "America/New_York",
  houston: "America/Chicago",
  "kansas-city": "America/Chicago",
  "san-francisco": "America/Los_Angeles",
};

function sqlStr(s) {
  if (s == null) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isPlaceholderTeam(name) {
  return /^(Winner|Runner-up|Loser|Group )/i.test(name);
}

function teamSlug(name) {
  return TEAM_SLUGS[name] ?? slugify(name);
}

function eventSlug(f) {
  if (SLUG_OVERRIDES[f.matchNumber]) return SLUG_OVERRIDES[f.matchNumber];
  if (isPlaceholderTeam(f.homeTeam) || isPlaceholderTeam(f.awayTeam)) {
    return `world-cup-match-${f.matchNumber}`;
  }
  return `${teamSlug(f.homeTeam)}-vs-${teamSlug(f.awayTeam)}`;
}

function stageLabel(stage) {
  switch (stage) {
    case "group-stage":
      return "Group stage";
    case "round-of-32":
      return "Round of 32";
    case "round-of-16":
      return "Round of 16";
    case "quarter-finals":
      return "Quarterfinal";
    case "semi-finals":
      return "Semifinal";
    case "third-place":
      return "Third Place";
    case "final":
      return "Final";
    default:
      return stage;
  }
}

function subtitle(f) {
  const stage = stageLabel(f.stage);
  if (f.stage === "group-stage") {
    return `Match ${f.matchNumber} · Group ${f.group} · World Cup 2026`;
  }
  if (f.stage === "final") {
    return `Match ${f.matchNumber} · TBD vs TBD · FIFA World Cup 2026`;
  }
  return `${stage} · Match ${f.matchNumber} · World Cup 2026`;
}

function title(f) {
  if (f.stage === "final") return "World Cup Final";
  if (f.stage === "third-place") return "World Cup Third Place Playoff";
  return `${f.homeTeam} vs ${f.awayTeam}`;
}

function localKickoffTime(f) {
  const tz = HOST_CITY_TZ[f.hostCity] ?? "America/New_York";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(f.kickoffUtc));
  const h = parts.find((p) => p.type === "hour")?.value ?? "12";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

function minPrice(f) {
  const venue = VENUES[f.stadium];
  const tier = venue?.tier ?? 2;
  const market = {
    "group-stage": tier === 1 ? 450 : tier === 2 ? 400 : 350,
    "round-of-32": 450,
    "round-of-16": 600,
    "quarter-finals": 900,
    "semi-finals": 1500,
    "third-place": 800,
    final: 11227,
  }[f.stage];
  return frontrowlyPrice(market ?? 400);
}

function isFeatured(f) {
  if (f.matchNumber >= 97) return true;
  if ([1, 4, 6, 64, 98].includes(f.matchNumber)) return true;
  if (["United States", "Mexico", "Canada"].includes(f.homeTeam)) return true;
  if (f.homeTeam === "Brazil" || f.awayTeam === "Brazil") return f.stage === "group-stage";
  return false;
}

function eventDescription(f) {
  const venue = VENUES[f.stadium];
  return `FIFA World Cup 2026 — ${stageLabel(f.stage)} at ${venue?.name ?? f.stadium}, ${venue?.city ?? f.hostCity}.`;
}

function localKickoff(f) {
  return { date: f.date, time: localKickoffTime(f) };
}

// --- Build rows ---

const teamRows = Object.entries(TEAM_SLUGS).map(([name, slug]) => ({
  slug,
  name,
  country: TEAM_COUNTRIES[name],
}));

const venueRows = Object.values(VENUES);

const eventRows = fixtures.map((f) => {
  const slug = eventSlug(f);
  const venue = VENUES[f.stadium];
  const { date, time } = localKickoff(f);
  const placeholder = isPlaceholderTeam(f.homeTeam);

  return {
    slug,
    matchNumber: String(f.matchNumber),
    homeSlug: placeholder ? null : teamSlug(f.homeTeam),
    awaySlug: placeholder ? null : isPlaceholderTeam(f.awayTeam) ? null : teamSlug(f.awayTeam),
    homeLabel: placeholder ? f.homeTeam : null,
    awayLabel: isPlaceholderTeam(f.awayTeam) ? f.awayTeam : null,
    venueSlug: venue.slug,
    title: title(f),
    subtitle: subtitle(f),
    description: eventDescription(f),
    date,
    time,
    minPrice: minPrice(f),
    featured: isFeatured(f),
    seatMap: SEAT_MAP_MATCHES.has(f.matchNumber),
    queue: f.matchNumber === 104,
    image: IMAGE_OVERRIDES[slug] ?? "/images/category-world-cup.jpg",
  };
});

// --- SQL ---

const schemaGuards = `-- Schema guards
ALTER TABLE venues ADD COLUMN IF NOT EXISTS stadium_map_slug TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS queue_enabled BOOLEAN DEFAULT false;

`;

const teamsSql = `-- Teams (${teamRows.length})
INSERT INTO teams (slug, name, country) VALUES
${teamRows.map((t) => `  (${sqlStr(t.slug)}, ${sqlStr(t.name)}, ${sqlStr(t.country)})`).join(",\n")}
ON CONFLICT (slug) DO NOTHING;

`;

const venuesSql = `-- Venues (${venueRows.length})
INSERT INTO venues (slug, name, city, country, capacity, stadium_map_slug) VALUES
${venueRows
  .map(
    (v) =>
      `  (${sqlStr(v.slug)}, ${sqlStr(v.name)}, ${sqlStr(v.city)}, ${sqlStr(v.country)}, ${v.capacity}, ${sqlStr(v.stadium_map_slug ?? null)})`
  )
  .join(",\n")}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  capacity = EXCLUDED.capacity,
  stadium_map_slug = COALESCE(EXCLUDED.stadium_map_slug, venues.stadium_map_slug);

`;

const eventValues = eventRows
  .map(
    (e) =>
      `(${sqlStr(e.slug)}, ${sqlStr(e.homeSlug)}, ${sqlStr(e.awaySlug)}, ${sqlStr(e.homeLabel)}, ${sqlStr(e.awayLabel)}, ${sqlStr(e.venueSlug)}, ${sqlStr(e.title)}, ${sqlStr(e.subtitle)}, ${sqlStr(e.description)}, ${sqlStr(e.date)}, ${sqlStr(e.time)}, ${e.minPrice.toFixed(2)}::DECIMAL, ${e.featured}, ${sqlStr(e.matchNumber)}, ${e.seatMap}, ${e.queue}, ${sqlStr(e.image)})`
  )
  .join(",\n");

const eventsSql = `-- Events (${eventRows.length} matches)
INSERT INTO events (
  slug, home_team_id, away_team_id, home_team_label, away_team_label,
  venue_id, title, subtitle, description, event_date, event_time,
  min_price, currency, featured, match_number, seat_map_enabled, queue_enabled, image_url,
  competition_id
)
SELECT
  e.slug,
  ht.id,
  at.id,
  e.home_label,
  e.away_label,
  v.id,
  e.title,
  e.subtitle,
  e.description,
  e.event_date::DATE,
  e.event_time::TIME,
  e.min_price,
  'USD',
  e.featured,
  e.match_number,
  e.seat_map_enabled,
  e.queue_enabled,
  e.image_url,
  c.id
FROM competitions c
CROSS JOIN (VALUES
${eventValues}
) AS e(slug, home_slug, away_slug, home_label, away_label, venue_slug, title, subtitle, description, event_date, event_time, min_price, featured, match_number, seat_map_enabled, queue_enabled, image_url)
LEFT JOIN teams ht ON ht.slug = e.home_slug
LEFT JOIN teams at ON at.slug = e.away_slug
JOIN venues v ON v.slug = e.venue_slug
WHERE c.slug = 'world-cup-2026'
ON CONFLICT (slug) DO UPDATE SET
  home_team_id = EXCLUDED.home_team_id,
  away_team_id = EXCLUDED.away_team_id,
  home_team_label = EXCLUDED.home_team_label,
  away_team_label = EXCLUDED.away_team_label,
  venue_id = EXCLUDED.venue_id,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  event_time = EXCLUDED.event_time,
  min_price = EXCLUDED.min_price,
  featured = EXCLUDED.featured,
  match_number = EXCLUDED.match_number,
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  queue_enabled = EXCLUDED.queue_enabled,
  image_url = EXCLUDED.image_url;

`;

const sql = `-- FIFA World Cup 2026 — full match catalogue (${eventRows.length} matches)
-- Generated by scripts/generate-world-cup-2026-seed.mjs
-- Source: scripts/data/wc2026-fixtures.json (FIFA / TheStatsAPI schedule)
-- Safe to re-run (ON CONFLICT upserts)
-- Requires: competition world-cup-2026 (run supabase/seed.sql first)
-- Listings: run supabase/seed/new-zealand-vs-belgium-full.sql for Match 64 inventory

${schemaGuards}
${teamsSql}
${venuesSql}
${eventsSql}
`;

const outPath = join(__dirname, "..", "supabase", "seed", "world-cup-2026-full.sql");
writeFileSync(outPath, sql, "utf8");

console.log(`Wrote ${teamRows.length} teams, ${venueRows.length} venues, ${eventRows.length} events`);
console.log(`→ ${outPath}`);

// Summary stats
const byVenue = {};
eventRows.forEach((e) => {
  byVenue[e.venueSlug] = (byVenue[e.venueSlug] ?? 0) + 1;
});
console.log("Matches per venue:", byVenue);

// --- Mock TypeScript (dev mode without Supabase) ---

const mockTeamsObj = Object.fromEntries(
  teamRows.map((t) => [
    t.slug,
    { id: `t-${t.slug}`, slug: t.slug, name: t.name, country: t.country, logo_url: null },
  ])
);

const mockVenuesObj = Object.fromEntries(
  venueRows.map((v) => [
    v.slug,
    {
      id: `v-${v.slug}`,
      slug: v.slug,
      name: v.name,
      city: v.city,
      country: v.country,
      capacity: v.capacity,
      image_url: null,
      stadium_map_slug: v.stadium_map_slug ?? null,
    },
  ])
);

const worldCupCompetition = {
  id: "c1",
  slug: "world-cup-2026",
  name: "FIFA World Cup 2026",
  sport: "football",
  country: "International",
  logo_url: null,
  description: "USA, Canada & Mexico",
  featured: true,
};

const mockEventsArr = eventRows.map((e, i) => {
  const homeTeam = e.homeSlug ? mockTeamsObj[e.homeSlug] : null;
  const awayTeam = e.awaySlug ? mockTeamsObj[e.awaySlug] : null;
  const venue = mockVenuesObj[e.venueSlug];

  return {
    id: `wc-${e.matchNumber}`,
    slug: e.slug,
    competition_id: "c1",
    home_team_id: homeTeam?.id ?? null,
    away_team_id: awayTeam?.id ?? null,
    home_team_label: e.homeLabel,
    away_team_label: e.awayLabel,
    venue_id: venue.id,
    title: e.title,
    subtitle: e.subtitle,
    description: e.description,
    event_date: e.date,
    event_time: e.time,
    status: "scheduled",
    image_url: e.image,
    min_price: e.minPrice,
    currency: "USD",
    featured: e.featured,
    match_number: e.matchNumber,
    seat_map_enabled: e.seatMap,
    queue_enabled: e.queue,
    scarcity_override: e.seatMap ? 2 : null,
    competition: worldCupCompetition,
    home_team: homeTeam,
    away_team: awayTeam,
    venue,
    ticket_categories: [],
  };
});

const mockTs = `/** @generated by scripts/generate-world-cup-2026-seed.mjs — do not edit */
import type { Competition, EventWithRelations, Team, Venue } from "@/types/database";

export const worldCupMockTeams: Record<string, Team> = ${JSON.stringify(mockTeamsObj, null, 2)};

export const worldCupMockVenues: Record<string, Venue> = ${JSON.stringify(mockVenuesObj, null, 2)};

export const worldCupMockCompetition: Competition = ${JSON.stringify(worldCupCompetition, null, 2)};

export const worldCupMockEvents: EventWithRelations[] = ${JSON.stringify(mockEventsArr, null, 2)};
`;

const mockOut = join(__dirname, "..", "src", "lib", "data", "world-cup-2026-schedule.generated.ts");
writeFileSync(mockOut, mockTs, "utf8");
console.log(`→ ${mockOut}`);
