/**
 * Generates supabase/seed/new-zealand-vs-belgium-full.sql from viagogo reference listings.
 * Run: node scripts/generate-nz-belgium-viagogo-seed.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { LISTINGS } from "./data/nz-belgium-viagogo-listings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Frontrowly sells 10% below reference market "Now" prices. */
function frontrowlyPrice(marketNow) {
  return Math.round(marketNow * 90) / 100;
}

const SCHEMA_GUARDS = `-- Schema guards (no-op if migrations 003–005 already applied)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS stadium_map_slug TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS queue_enabled BOOLEAN DEFAULT false;
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);

`;

const BC200 = [
  201, 202, 203, 204, 206, 207, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
  221, 222, 224, 225, 226, 227, 228, 229, 230, 231, 233, 234, 236, 237, 238, 239, 240,
  241, 242, 243, 244, 245, 246, 248, 249, 251, 252, 253, 254,
];
const BC300 = [336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346];
const BC400 = [
  401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417,
  418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434,
  435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451,
  452, 453, 454,
];
const ALL_SECTIONS = [
  ...BC200.map((n) => ({ n: String(n), level: "200" })),
  ...BC300.map((n) => ({ n: String(n), level: "300" })),
  ...BC400.map((n) => ({ n: String(n), level: "400" })),
];

function zoneFor(n, level) {
  if (level === "300") return "cat-3";
  if (level === "400") return parseInt(n, 10) >= 433 ? "cat-4" : "cat-3";
  return parseInt(n, 10) >= 236 && parseInt(n, 10) <= 246 ? "cat-1" : "cat-2";
}

function sqlStr(s) {
  return s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`;
}

function sqlArr(arr) {
  if (!arr?.length) return "ARRAY[]::TEXT[]";
  return `ARRAY[${arr.map((x) => sqlStr(x)).join(", ")}]`;
}

const marketMin = Math.min(...LISTINGS.map((l) => l[5]));
const minPrice = frontrowlyPrice(marketMin);

const listingRows = LISTINGS.map(
  (l, i) => {
    const [section, product, row, qty, qtyAvail, marketNow, , perks, badges, viewScore, viewLabel, type] = l;
    const price = frontrowlyPrice(marketNow);
    const compareAt = marketNow;
    return `(${sqlStr(section)}, ${sqlStr(row)}, ${sqlStr(product)}, ${sqlStr(type)}, ${qty}, ${qtyAvail}, ${price.toFixed(2)}::DECIMAL, ${compareAt.toFixed(2)}::DECIMAL, 'USD', ${sqlArr(perks)}, ${sqlArr(badges)}, ${viewScore ?? "NULL"}, ${sqlStr(viewLabel)}, ${i})`;
  }
).join(",\n");

const finalSql = `-- New Zealand vs Belgium @ BC Place — full match seed
-- Match 64 · Group G · Fri Jun 26 2026 · 8:00 PM · Vancouver
-- ${LISTINGS.length} ticket listings · Frontrowly prices = 10% below reference market
-- Safe to re-run (clears prior listings for this event, then inserts)
-- Requires migrations 001–007

${SCHEMA_GUARDS}-- Teams
INSERT INTO teams (slug, name, country) VALUES
  ('new-zealand', 'New Zealand', 'New Zealand'),
  ('belgium', 'Belgium', 'Belgium')
ON CONFLICT (slug) DO NOTHING;

-- Venue
INSERT INTO venues (slug, name, city, country, capacity, stadium_map_slug) VALUES
  ('bc-place-stadium', 'BC Place Stadium', 'Vancouver', 'Canada', 54500, 'bc-place')
ON CONFLICT (slug) DO UPDATE SET
  stadium_map_slug = EXCLUDED.stadium_map_slug;

-- Event
INSERT INTO events (
  slug, competition_id, home_team_id, away_team_id, venue_id,
  title, subtitle, description, event_date, event_time,
  min_price, currency, featured, seat_map_enabled, scarcity_override, image_url
)
SELECT
  'new-zealand-vs-belgium',
  c.id,
  ht.id,
  at.id,
  v.id,
  'New Zealand vs Belgium',
  'Match 64 · Group G · World Cup 2026',
  'FIFA World Cup 2026 group stage at BC Place Stadium, Vancouver. Interactive seat map with section-level inventory.',
  '2026-06-26',
  '20:00',
  ${minPrice.toFixed(2)},
  'USD',
  true,
  true,
  2,
  '/images/event-new-zealand-belgium.jpg'
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'new-zealand'
  AND at.slug = 'belgium'
  AND v.slug = 'bc-place-stadium'
ON CONFLICT (slug) DO UPDATE SET
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  scarcity_override = EXCLUDED.scarcity_override,
  min_price = EXCLUDED.min_price,
  image_url = EXCLUDED.image_url,
  subtitle = EXCLUDED.subtitle;

-- Stadium map record
INSERT INTO stadium_maps (venue_id, slug, name)
SELECT v.id, 'bc-place', 'BC Place Stadium'
FROM venues v
WHERE v.slug = 'bc-place-stadium'
ON CONFLICT (venue_id, slug) DO NOTHING;

-- Stadium sections (${ALL_SECTIONS.length} numbered sections)
INSERT INTO stadium_sections (venue_id, section_number, level, zone)
SELECT v.id, s.num, s.lvl, s.zone
FROM venues v
CROSS JOIN (VALUES
${ALL_SECTIONS.map(({ n, level }) => `  ('${n}', '${level}', '${zoneFor(n, level)}')`).join(",\n")}
) AS s(num, lvl, zone)
WHERE v.slug = 'bc-place-stadium'
ON CONFLICT (venue_id, section_number) DO NOTHING;

-- Replace listings for this event (idempotent full refresh)
DELETE FROM ticket_listings
WHERE event_id = (SELECT id FROM events WHERE slug = 'new-zealand-vs-belgium');

-- Ticket listings (${LISTINGS.length} rows)
INSERT INTO ticket_listings (
  event_id, section_number, row_label, product_name, listing_type,
  quantity, quantity_available, price, compare_at_price,
  currency, perks, badges, view_score, view_label, sort_order
)
SELECT
  e.id,
  v.section_number,
  v.row_label,
  v.product_name,
  v.listing_type,
  v.quantity,
  v.quantity_available,
  v.price,
  v.compare_at_price,
  v.currency,
  v.perks,
  v.badges,
  v.view_score,
  v.view_label,
  v.sort_order
FROM events e
CROSS JOIN (VALUES
${listingRows}
) AS v(section_number, row_label, product_name, listing_type, quantity, quantity_available, price, compare_at_price, currency, perks, badges, view_score, view_label, sort_order)
WHERE e.slug = 'new-zealand-vs-belgium';
`;

const outPath = join(__dirname, "..", "supabase", "seed", "new-zealand-vs-belgium-full.sql");
writeFileSync(outPath, finalSql, "utf8");
console.log(`Wrote ${LISTINGS.length} listings (min $${minPrice}) to ${outPath}`);
