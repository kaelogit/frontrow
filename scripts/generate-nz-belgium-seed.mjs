/**
 * Generates supabase/seed/new-zealand-vs-belgium-full.sql
 * Run: node scripts/generate-nz-belgium-seed.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROWS = ["A", "B", "D", "E", "G", "K", "M", "P", "CC", "FF", "HH", "UU", "SS"];

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

function sqlStr(s) {
  return s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`;
}

function sqlArr(arr) {
  if (!arr?.length) return "ARRAY[]::TEXT[]";
  return `ARRAY[${arr.map((x) => sqlStr(x)).join(", ")}]`;
}

function makeListing(id, section, row, qty, price, opts = {}) {
  return {
    id,
    section,
    row,
    qty,
    price,
    compareAt: opts.compareAt ?? null,
    perks: opts.perks ?? ["Clear view", `${qty} ticket${qty !== 1 ? "s" : ""} together`],
    badges: opts.badges ?? [],
    viewScore: opts.viewScore ?? null,
    viewLabel: opts.viewLabel ?? null,
    productName: opts.productName ?? null,
    type: opts.type ?? (section ? "seat" : "zone"),
    qtyAvailable: opts.qtyAvailable ?? qty,
  };
}

const anchors = [
  makeListing("l1", "342", "E", 2, 404, { compareAt: 512, badges: ["Last tickets"], viewScore: 9.8, viewLabel: "Amazing", perks: ["Limited view", "2 tickets together"] }),
  makeListing("l2", "217", "K", 2, 420, { compareAt: 531, badges: ["Fan favorite"], viewScore: 8.9, viewLabel: "Amazing" }),
  makeListing("l3", "442", "E", 2, 354, { compareAt: 449, badges: ["Last tickets"], viewScore: 8.6, viewLabel: "Amazing" }),
  makeListing("l4", "413", null, 2, 355, { compareAt: 449, viewScore: 8.3, viewLabel: "Great", perks: ["Limited view", "2 tickets together"] }),
  makeListing("l5", "209", "CC", 2, 420, { compareAt: 531, badges: ["Last tickets"], viewScore: 7.7, viewLabel: "Great" }),
  makeListing("l6", "415", "HH", 2, 363, { compareAt: 689, viewScore: 8.5, viewLabel: "Amazing", perks: ["Limited view", "2 tickets together"] }),
  makeListing("l7", "225", "FF", 2, 400, { compareAt: 702, badges: ["Last tickets"], viewScore: 7.0, viewLabel: "Great" }),
  makeListing("l8", "346", "G", 2, 404, { compareAt: 511, badges: ["Last tickets"], viewScore: 7.9, viewLabel: "Great" }),
  makeListing("l9", "248", "P", 2, 417, { compareAt: 528, viewScore: 7.5, viewLabel: "Great" }),
  makeListing("l10", "421", "A", 2, 507, { badges: ["Last tickets"], viewScore: 8.6, viewLabel: "Amazing" }),
  makeListing("l11", "241", "A", 1, 471, { compareAt: 596, viewScore: 10.0, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Clear view", "1 ticket"] }),
  makeListing("l12", "243", "EE", 1, 427, { compareAt: 540, badges: ["Last tickets", "Fan favorite"], viewScore: 8.3, viewLabel: "Great", qtyAvailable: 1, perks: ["Clear view", "1 ticket"] }),
  makeListing("l13", "412", "ZZ", 1, 296, { compareAt: 441, badges: ["Last tickets"], viewScore: 8.5, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Limited view", "1 ticket"] }),
  makeListing("l14", "415", "ZZ", 1, 296, { compareAt: 441, badges: ["Last tickets"], viewScore: 8.8, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Limited view", "1 ticket"] }),
  makeListing("l15", "433", "E", 1, 296, { compareAt: 375, badges: ["Last tickets"], viewScore: 8.8, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Limited view", "1 ticket"] }),
  makeListing("gen-h1", null, null, 2, 890, { productName: "Trophy Lounge Hospitality", type: "hospitality", compareAt: 1200, viewScore: 9.5, viewLabel: "Amazing", perks: ["Hospitality package", "2 tickets together"] }),
  makeListing("gen-bel", "431", "E", 1, 316, { compareAt: 400, badges: ["Last tickets"], viewScore: 8.7, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Clear view", "Belgium Supporters Seats", "1 ticket"] }),
  makeListing("gen-nz", "451", "SS", 1, 316, { compareAt: 455, viewScore: 8.6, viewLabel: "Amazing", qtyAvailable: 1, perks: ["Clear view", "New Zealand Supporters Seats", "1 ticket"] }),
];

const bulk = [];
for (let i = 0; i < 115; i++) {
  const sec = ALL_SECTIONS[i % ALL_SECTIONS.length];
  const row = ROWS[i % ROWS.length];
  const base = sec.level === "200" ? 420 : sec.level === "300" ? 380 : 340;
  const price = base + (i % 17) * 12 + (parseInt(sec.n, 10) % 7) * 3;
  const compareAt = Math.round(price * (1.15 + (i % 5) * 0.05));
  const qty = i % 9 === 0 ? 1 : 2;
  const badges = [];
  if (i % 11 === 0) badges.push("Last tickets");
  if (i % 13 === 0) badges.push("Fan favorite");
  const viewScore = Math.round((6.5 + (i % 35) / 10) * 10) / 10;
  const viewLabel = viewScore >= 8.5 ? "Amazing" : viewScore >= 7 ? "Great" : "Good";
  let perks = i % 4 === 0 ? ["Limited view", `${qty} ticket${qty !== 1 ? "s" : ""} together`] : ["Clear view", `${qty} ticket${qty !== 1 ? "s" : ""} together`];
  if (i % 23 === 0) perks = [...perks, "Belgium Supporters Seats"];
  if (i % 29 === 0) perks = [...perks, "New Zealand Supporters Seats"];
  bulk.push(makeListing(`gen-${100 + i}`, sec.n, row, qty, price, { compareAt, badges, viewScore, viewLabel, perks, qtyAvailable: i % 7 === 0 ? 2 : qty }));
}

const allListings = [...anchors, ...bulk];

const listingInserts = allListings
  .map(
    (l, i) => `  (
    e.id, ${sqlStr(l.section)}, ${sqlStr(l.row)}, ${sqlStr(l.productName)}, ${sqlStr(l.type)},
    ${l.qty}, ${l.qtyAvailable}, ${l.price.toFixed(2)}, ${l.compareAt != null ? l.compareAt.toFixed(2) : "NULL"},
    'USD', ${sqlArr(l.perks)}, ${sqlArr(l.badges)},
    ${l.viewScore ?? "NULL"}, ${sqlStr(l.viewLabel)}, ${i}
  )`
  )
  .join(",\n");

const sql = `-- New Zealand vs Belgium @ BC Place — full match seed
-- Safe to re-run (ON CONFLICT / NOT EXISTS guards)
-- Requires migrations 001–007 + 005 (compare_at_price)
-- Generated by scripts/generate-nz-belgium-seed.mjs

-- Teams
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
  296.00,
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
  image_url = EXCLUDED.image_url;

-- Stadium map record
INSERT INTO stadium_maps (venue_id, slug, name)
SELECT v.id, 'bc-place', 'BC Place Stadium'
FROM venues v
WHERE v.slug = 'bc-place-stadium'
ON CONFLICT (venue_id, slug) DO NOTHING;

-- Stadium sections (109 sections)
INSERT INTO stadium_sections (venue_id, section_number, level, zone)
SELECT v.id, s.num, s.lvl, s.zone
FROM venues v
CROSS JOIN (VALUES
${ALL_SECTIONS.map(({ n, level }) => {
  const zone =
    level === "300"
      ? "cat-3"
      : level === "400"
        ? parseInt(n, 10) >= 433
          ? "cat-4"
          : "cat-3"
        : parseInt(n, 10) >= 236 && parseInt(n, 10) <= 246
          ? "cat-1"
          : "cat-2";
  return `  ('${n}', '${level}', '${zone}')`;
}).join(",\n")}
) AS s(num, lvl, zone)
WHERE v.slug = 'bc-place-stadium'
ON CONFLICT (venue_id, section_number) DO NOTHING;

-- Ticket listings (${allListings.length} rows)
INSERT INTO ticket_listings (
  event_id, section_number, row_label, product_name, listing_type,
  quantity, quantity_available, price, compare_at_price,
  currency, perks, badges, view_score, view_label, sort_order
)
SELECT * FROM (VALUES
${listingInserts}
) AS t(
  event_id, section_number, row_label, product_name, listing_type,
  quantity, quantity_available, price, compare_at_price,
  currency, perks, badges, view_score, view_label, sort_order
)
WHERE false; -- placeholder replaced below
`;

// Fix listing insert - need proper SELECT from event
const listingSql = `-- Ticket listings (${allListings.length} rows)
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
${allListings
  .map(
    (l, i) =>
      `(${sqlStr(l.section)}, ${sqlStr(l.row)}, ${sqlStr(l.productName)}, ${sqlStr(l.type)}, ${l.qty}, ${l.qtyAvailable}, ${l.price.toFixed(2)}::DECIMAL, ${l.compareAt != null ? `${l.compareAt.toFixed(2)}::DECIMAL` : "NULL"}, 'USD', ${sqlArr(l.perks)}, ${sqlArr(l.badges)}, ${l.viewScore ?? "NULL"}, ${sqlStr(l.viewLabel)}, ${i})`
  )
  .join(",\n")}
) AS v(section_number, row_label, product_name, listing_type, quantity, quantity_available, price, compare_at_price, currency, perks, badges, view_score, view_label, sort_order)
WHERE e.slug = 'new-zealand-vs-belgium'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_listings tl
    WHERE tl.event_id = e.id
      AND tl.section_number IS NOT DISTINCT FROM v.section_number
      AND tl.row_label IS NOT DISTINCT FROM v.row_label
      AND tl.price = v.price
      AND tl.sort_order = v.sort_order
  );
`;

const finalSql = sql.split("-- Ticket listings")[0] + listingSql;

const outPath = join(__dirname, "..", "supabase", "seed", "new-zealand-vs-belgium-full.sql");
writeFileSync(outPath, finalSql, "utf8");
console.log(`Wrote ${allListings.length} listings to ${outPath}`);
