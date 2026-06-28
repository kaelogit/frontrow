/**
 * Generates supabase/seed/metlife-final-listings.sql
 * Run: node scripts/generate-metlife-final-seed.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { METLIFE_FINAL_LISTINGS, METLIFE_SECTIONS } from "./data/metlife-final-listings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function frontrowlyPrice(marketNow) {
  return Math.round(marketNow * 90) / 100;
}

function sqlStr(s) {
  return s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`;
}

function sqlArr(arr) {
  if (!arr?.length) return "ARRAY[]::TEXT[]";
  return `ARRAY[${arr.map((x) => sqlStr(x)).join(", ")}]`;
}

const minMarket = Math.min(...METLIFE_FINAL_LISTINGS.map((l) => l[5]));
const minPrice = frontrowlyPrice(minMarket);

const listingRows = METLIFE_FINAL_LISTINGS.map((l, i) => {
  const [section, product, row, qty, qtyAvail, marketNow, perks, badges, viewScore, viewLabel, type] = l;
  const price = frontrowlyPrice(marketNow);
  return `(${sqlStr(section)}, ${sqlStr(row)}, ${sqlStr(product)}, ${sqlStr(type)}, ${qty}, ${qtyAvail}, ${price.toFixed(2)}::DECIMAL, ${marketNow.toFixed(2)}::DECIMAL, 'USD', ${sqlArr(perks)}, ${sqlArr(badges)}, ${viewScore ?? "NULL"}, ${sqlStr(viewLabel)}, ${i})`;
}).join(",\n");

const sectionsSql = METLIFE_SECTIONS.map(
  (s) => `  ('${s.num}', '${s.level}', '${s.zone}')`
).join(",\n");

const sql = `-- World Cup Final @ MetLife Stadium — Match 104
-- ${METLIFE_FINAL_LISTINGS.length} ticket listings · Frontrowly prices = 10% below reference market
-- Safe to re-run (clears prior Final listings, upserts event + venue map)
-- Requires: world-cup-2026-full.sql (event world-cup-final-match-104)

ALTER TABLE venues ADD COLUMN IF NOT EXISTS stadium_map_slug TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS queue_enabled BOOLEAN DEFAULT false;
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);

-- Venue map slug
UPDATE venues SET stadium_map_slug = 'metlife' WHERE slug = 'metlife-stadium';

-- Final event flags
UPDATE events SET
  seat_map_enabled = true,
  queue_enabled = true,
  scarcity_override = 2,
  min_price = ${minPrice.toFixed(2)},
  image_url = '/images/event-world-cup-final.jpg'
WHERE slug = 'world-cup-final-match-104';

INSERT INTO stadium_maps (venue_id, slug, name)
SELECT v.id, 'metlife', 'MetLife Stadium'
FROM venues v WHERE v.slug = 'metlife-stadium'
ON CONFLICT (venue_id, slug) DO NOTHING;

INSERT INTO stadium_sections (venue_id, section_number, level, zone)
SELECT v.id, s.num, s.lvl, s.zone
FROM venues v
CROSS JOIN (VALUES
${sectionsSql}
) AS s(num, lvl, zone)
WHERE v.slug = 'metlife-stadium'
ON CONFLICT (venue_id, section_number) DO NOTHING;

DELETE FROM ticket_listings
WHERE event_id = (SELECT id FROM events WHERE slug = 'world-cup-final-match-104');

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
WHERE e.slug = 'world-cup-final-match-104';
`;

const outPath = join(__dirname, "..", "supabase", "seed", "metlife-final-listings.sql");
writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${METLIFE_FINAL_LISTINGS.length} listings (min $${minPrice}) → ${outPath}`);
