-- Uruguay vs Spain — full match seed
-- Match 66 · 2026-06-26 · 18:00
-- 80 ticket listings · Frontrowly prices = 10% below reference market
-- Safe to re-run (clears prior listings for this event, then inserts)

ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);

INSERT INTO teams (slug, name, country) VALUES
  ('uruguay', 'Uruguay', 'Uruguay'),
  ('spain', 'Spain', 'Spain')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (
  slug, competition_id, home_team_id, away_team_id, venue_id,
  title, subtitle, description, event_date, event_time,
  min_price, currency, featured, seat_map_enabled, scarcity_override, match_number, image_url
)
SELECT
  'uruguay-vs-spain',
  c.id,
  ht.id,
  at.id,
  v.id,
  'Uruguay vs Spain',
  'Match 66 · Group H · World Cup 2026',
  'FIFA World Cup 2026 group stage at Estadio Akron, Guadalajara. Marketplace listings from reference inventory.',
  '2026-06-26',
  '18:00',
  831.60,
  'USD',
  false,
  true,
  1,
  '66',
  '/images/events/match-66.jpg'
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'uruguay'
  AND at.slug = 'spain'
  AND v.slug = 'estadio-akron'
ON CONFLICT (slug) DO UPDATE SET
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  scarcity_override = EXCLUDED.scarcity_override,
  min_price = EXCLUDED.min_price,
  subtitle = EXCLUDED.subtitle,
  match_number = EXCLUDED.match_number;

DELETE FROM ticket_listings
WHERE event_id = (SELECT id FROM events WHERE slug = 'uruguay-vs-spain');

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
('T1-20', 'A', NULL, 'seat', 1, 1, 926.10::DECIMAL, 1029.00::DECIMAL, 'USD', ARRAY['Clear view', 'Third row of section', 'Under 15s accompanied by an adult'], ARRAY[]::TEXT[], 10, 'Amazing', 0),
('T1-17', 'J', NULL, 'seat', 1, 1, 966.60::DECIMAL, 1074.00::DECIMAL, 'USD', ARRAY['Clear view', 'Under 15s accompanied by an adult'], ARRAY[]::TEXT[], 8.5, 'Amazing', 1),
('T1-36', 'D', NULL, 'seat', 1, 1, 972.90::DECIMAL, 1081.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 9.2, 'Amazing', 2),
('T2-46', NULL, NULL, 'seat', 1, 1, 937.80::DECIMAL, 1042.00::DECIMAL, 'USD', ARRAY['1 ticket together', 'Clear view'], ARRAY[]::TEXT[], 7.1, 'Great', 3),
('T1-23', 'U', NULL, 'seat', 1, 1, 972.90::DECIMAL, 1081.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], 8.2, 'Great', 4),
('T2-43', '>', NULL, 'seat', 1, 1, 831.60::DECIMAL, 924.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Best price'], NULL, NULL, 5),
('T1-08', 'P', NULL, 'seat', 1, 1, 969.30::DECIMAL, 1077.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.9, 'Great', 6),
('T1-13', 'V', NULL, 'seat', 1, 1, 959.40::DECIMAL, 1066.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.3, 'Great', 7),
('T1-11', 'Y', NULL, 'seat', 1, 1, 995.40::DECIMAL, 1106.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], 7.4, 'Great', 8),
('T2-45', 'V', NULL, 'seat', 1, 1, 963.90::DECIMAL, 1071.00::DECIMAL, 'USD', ARRAY['Clear view', 'Under 15s accompanied by an adult'], ARRAY[]::TEXT[], NULL, NULL, 9),
('T2-17', 'M', NULL, 'seat', 1, 1, 831.60::DECIMAL, 924.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], NULL, NULL, 10),
('T1-27', 'AA', NULL, 'seat', 1, 1, 972.90::DECIMAL, 1081.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7, 'Great', 11),
('T2-15', 'B', NULL, 'seat', 1, 1, 868.50::DECIMAL, 965.00::DECIMAL, 'USD', ARRAY['Clear view', 'Second row of section'], ARRAY[]::TEXT[], 7.3, 'Great', 12),
('T2-08', 'V', NULL, 'seat', 1, 1, 836.10::DECIMAL, 929.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], NULL, NULL, 13),
('T2-33', 'H', NULL, 'seat', 1, 1, 868.50::DECIMAL, 965.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], NULL, NULL, 14),
('T2-07', 'L', NULL, 'seat', 1, 1, 963.90::DECIMAL, 1071.00::DECIMAL, 'USD', ARRAY['Clear view', 'Aisle seat', 'Under 15s accompanied by an adult'], ARRAY[]::TEXT[], NULL, NULL, 15),
('T2-18', 'L', NULL, 'seat', 1, 1, 959.40::DECIMAL, 1066.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.1, 'Great', 16),
('T2-38', 'D', NULL, 'seat', 1, 1, 866.70::DECIMAL, 963.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.1, 'Great', 17),
('T2-06', 'N', NULL, 'seat', 1, 1, 862.20::DECIMAL, 958.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], NULL, NULL, 18),
('T1-30', 'Z', NULL, 'seat', 1, 1, 995.40::DECIMAL, 1106.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.3, 'Great', 19),
('T1-30', 'AA', NULL, 'seat', 1, 1, 995.40::DECIMAL, 1106.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.2, 'Great', 20),
('T1-27', 'Y', NULL, 'seat', 1, 1, 995.40::DECIMAL, 1106.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7, 'Great', 21),
('T2-48', 'K', NULL, 'seat', 1, 1, 1005.30::DECIMAL, 1117.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], 7.7, 'Great', 22),
('T2-12', 'S', NULL, 'seat', 4, 4, 1011.60::DECIMAL, 1124.00::DECIMAL, 'USD', ARRAY['1 - 4 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 23),
('Category 3', NULL, 'Category 3', 'zone', 1, 1, 1014.30::DECIMAL, 1127.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], 7.9, 'Great', 24),
('T1-30', 'W', NULL, 'seat', 1, 1, 1031.40::DECIMAL, 1146.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.3, 'Great', 25),
('T2-39', 'J', NULL, 'seat', 2, 2, 1041.30::DECIMAL, 1157.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat'], ARRAY[]::TEXT[], NULL, NULL, 26),
('T1-18', 'D', NULL, 'seat', 1, 1, 1046.70::DECIMAL, 1163.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 8.9, 'Amazing', 27),
('T2-23', 'D', NULL, 'seat', 1, 1, 1053.90::DECIMAL, 1171.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.3, 'Great', 28),
('T1-27', 'Q', NULL, 'seat', 2, 2, 1057.50::DECIMAL, 1175.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.2, 'Great', 29),
('T2-46', 'A', NULL, 'seat', 1, 1, 1062.00::DECIMAL, 1180.00::DECIMAL, 'USD', ARRAY['Clear view', 'Front row of section'], ARRAY[]::TEXT[], 7.2, 'Great', 30),
('T1-10', 'A', NULL, 'seat', 1, 1, 1066.50::DECIMAL, 1185.00::DECIMAL, 'USD', ARRAY['Clear view', 'Front row of section'], ARRAY[]::TEXT[], 8.4, 'Great', 31),
('T1-27', 'B', NULL, 'seat', 1, 1, 1066.50::DECIMAL, 1185.00::DECIMAL, 'USD', ARRAY['Clear view', 'Second row of section'], ARRAY[]::TEXT[], 7.9, 'Great', 32),
('T1-26', 'G', NULL, 'seat', 1, 1, 1066.50::DECIMAL, 1185.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.5, 'Great', 33),
('T1-29', 'K', NULL, 'seat', 2, 2, 1085.40::DECIMAL, 1206.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.6, 'Great', 34),
('T1-07', 'Y', NULL, 'seat', 2, 2, 1101.60::DECIMAL, 1224.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 35),
('T2-34', 'R', NULL, 'seat', 1, 1, 1112.40::DECIMAL, 1236.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY['Fan favorite'], NULL, NULL, 36),
('Category 1', NULL, 'Category 1', 'zone', 1, 1, 1131.30::DECIMAL, 1257.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.2, 'Great', 37),
('T2-13', 'T', NULL, 'seat', 1, 1, 1135.80::DECIMAL, 1262.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], NULL, NULL, 38),
('T1-19', 'G', NULL, 'seat', 2, 2, 1142.10::DECIMAL, 1269.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.3, 'Amazing', 39),
('T1-12', NULL, NULL, 'seat', 2, 2, 1162.80::DECIMAL, 1292.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 40),
('T2-16', NULL, NULL, 'seat', 2, 2, 1170.90::DECIMAL, 1301.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 41),
('T1-38', NULL, NULL, 'seat', 2, 2, 1177.20::DECIMAL, 1308.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.2, 'Great', 42),
('T1-35', 'W', NULL, 'seat', 2, 2, 1177.20::DECIMAL, 1308.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 43),
('T2-13', 'S', NULL, 'seat', 1, 1, 1179.00::DECIMAL, 1310.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], NULL, NULL, 44),
('T1-23', 'T', NULL, 'seat', 2, 2, 1196.10::DECIMAL, 1329.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 7.4, 'Great', 45),
('T1-19', 'F', NULL, 'seat', 2, 2, 1200.60::DECIMAL, 1334.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.2, 'Amazing', 46),
('T1-20', 'M', NULL, 'seat', 2, 2, 1211.40::DECIMAL, 1346.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 9.6, 'Amazing', 47),
('T2-25', 'N', NULL, 'seat', 2, 2, 1211.40::DECIMAL, 1346.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 48),
('T2-26', 'U', NULL, 'seat', 4, 4, 1215.90::DECIMAL, 1351.00::DECIMAL, 'USD', ARRAY['4 tickets together', 'Clear view', 'Aisle seat'], ARRAY[]::TEXT[], NULL, NULL, 49),
('Category 2', NULL, 'Category 2', 'zone', 1, 1, 1219.50::DECIMAL, 1355.00::DECIMAL, 'USD', ARRAY['Clear view'], ARRAY[]::TEXT[], 7.7, 'Great', 50),
('T1-23', 'S', NULL, 'seat', 4, 4, 1224.90::DECIMAL, 1361.00::DECIMAL, 'USD', ARRAY['1 - 4 tickets together', 'Clear view', 'Aisle seat'], ARRAY['Fan favorite'], 7.3, 'Great', 51),
('T1-23', 'R', NULL, 'seat', 4, 4, 1250.10::DECIMAL, 1389.00::DECIMAL, 'USD', ARRAY['1 - 4 tickets together', 'Clear view'], ARRAY['Fan favorite'], 7.2, 'Great', 52),
(NULL, NULL, 'Spain Supporters', 'zone', 2, 2, 1251.90::DECIMAL, 1391.00::DECIMAL, 'USD', ARRAY['Spain Supporters', '1 - 2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 53),
('T2-11', 'Q', NULL, 'seat', 2, 2, 1254.60::DECIMAL, 1394.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 54),
('T2-14', 'N', NULL, 'seat', 2, 2, 1256.40::DECIMAL, 1396.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 55),
('T1-01', 'K', NULL, 'seat', 2, 2, 1303.20::DECIMAL, 1448.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.5, 'Amazing', 56),
('T1-01', 'J', NULL, 'seat', 4, 4, 1316.70::DECIMAL, 1463.00::DECIMAL, 'USD', ARRAY['1 - 4 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.6, 'Amazing', 57),
('T2-47', 'K', NULL, 'seat', 2, 2, 1332.90::DECIMAL, 1481.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 58),
('T1-04', 'B', NULL, 'seat', 2, 2, 1351.80::DECIMAL, 1502.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], 7.8, 'Great', 59),
('T1-20', 'A', NULL, 'seat', 1, 1, 1359.00::DECIMAL, 1510.00::DECIMAL, 'USD', ARRAY['Clear view', 'Aisle seat', 'Front row of section'], ARRAY['Fan favorite'], 10, 'Amazing', 60),
('T1-15', 'H', NULL, 'seat', 1, 1, 1421.10::DECIMAL, 1579.00::DECIMAL, 'USD', ARRAY['VIP packages', 'Club access', 'Clear view', 'Food and Beverage Included'], ARRAY[]::TEXT[], NULL, NULL, 61),
('T2-20', 'A', NULL, 'seat', 1, 1, 1422.00::DECIMAL, 1580.00::DECIMAL, 'USD', ARRAY['Clear view', 'Front row of section'], ARRAY[]::TEXT[], NULL, NULL, 62),
('T1-23', 'M', NULL, 'seat', 3, 3, 1446.30::DECIMAL, 1607.00::DECIMAL, 'USD', ARRAY['3 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 63),
(NULL, NULL, 'Spain Supporters Value Tier', 'zone', 2, 2, 1454.40::DECIMAL, 1616.00::DECIMAL, 'USD', ARRAY['Spain Supporters Value Tier', '1 - 2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 64),
('T2-08', 'B', NULL, 'seat', 2, 2, 1507.50::DECIMAL, 1675.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], NULL, NULL, 65),
('T2-24', 'A', NULL, 'seat', 2, 2, 1542.60::DECIMAL, 1714.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Front row of section'], ARRAY[]::TEXT[], NULL, NULL, 66),
('T1-03', 'U', NULL, 'seat', 2, 2, 1615.50::DECIMAL, 1795.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 67),
('T1-09', 'A', NULL, 'seat', 1, 1, 1650.60::DECIMAL, 1834.00::DECIMAL, 'USD', ARRAY['Clear view', 'Aisle seat', 'Front row of section'], ARRAY[]::TEXT[], NULL, NULL, 68),
(NULL, NULL, 'FIFA Pavilion', 'hospitality', 2, 2, 1734.30::DECIMAL, 1927.00::DECIMAL, 'USD', ARRAY['FIFA Pavilion', '2 tickets together', 'Food & beverages', 'Clear view', 'Includes Offsite Hospitality'], ARRAY[]::TEXT[], NULL, NULL, 69),
(NULL, NULL, 'Section VIP', 'hospitality', 2, 2, 1777.50::DECIMAL, 1975.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 70),
('T2-41', NULL, NULL, 'seat', 3, 3, 1896.30::DECIMAL, 2107.00::DECIMAL, 'USD', ARRAY['3 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 71),
('T1-21', 'A', NULL, 'seat', 1, 1, 1924.20::DECIMAL, 2138.00::DECIMAL, 'USD', ARRAY['Clear view', 'Front row of section'], ARRAY[]::TEXT[], 8.3, 'Great', 72),
(NULL, 'F', 'FIFA Pavilion', 'hospitality', 4, 4, 2007.00::DECIMAL, 2230.00::DECIMAL, 'USD', ARRAY['FIFA Pavilion', '1 - 4 tickets together', 'Food & beverages', 'Clear view', 'Includes Offsite Hospitality'], ARRAY[]::TEXT[], NULL, NULL, 73),
('T1-22', 'B', NULL, 'seat', 2, 2, 2029.50::DECIMAL, 2255.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], NULL, NULL, 74),
(NULL, NULL, 'Inferior T1', 'seat', 2, 2, 2133.00::DECIMAL, 2370.00::DECIMAL, 'USD', ARRAY['1 - 2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 75),
('Champions Club', 'V1P', NULL, 'hospitality', 1, 1, 2232.90::DECIMAL, 2481.00::DECIMAL, 'USD', ARRAY['Champions Club', 'VIP packages', 'Suite access', 'Club access', 'Food & beverages', 'Clear view', 'VIP Suite'], ARRAY[]::TEXT[], NULL, NULL, 76),
('Champions Club', 'SU1T3', NULL, 'hospitality', 1, 1, 2232.90::DECIMAL, 2481.00::DECIMAL, 'USD', ARRAY['Champions Club', 'VIP packages', 'Suite access', 'Club access', 'Food & beverages', 'Clear view', 'VIP Suite'], ARRAY[]::TEXT[], NULL, NULL, 77),
(NULL, NULL, 'Hospitality', 'hospitality', 1, 1, 2232.90::DECIMAL, 2481.00::DECIMAL, 'USD', ARRAY['Hospitality', 'VIP packages', 'Suite access', 'Club access', 'Food & beverages', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 78),
('T1-23', 'B', NULL, 'seat', 1, 1, 2435.40::DECIMAL, 2706.00::DECIMAL, 'USD', ARRAY['Clear view', 'Second row of section'], ARRAY['Fan favorite'], NULL, NULL, 79)
) AS v(section_number, row_label, product_name, listing_type, quantity, quantity_available, price, compare_at_price, currency, perks, badges, view_score, view_label, sort_order)
WHERE e.slug = 'uruguay-vs-spain';
