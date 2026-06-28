-- Egypt vs IR Iran — full match seed
-- Match 63 · 2026-06-26 · 20:00
-- 105 ticket listings · Frontrowly prices = 10% below reference market
-- Safe to re-run (clears prior listings for this event, then inserts)

ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);

INSERT INTO teams (slug, name, country) VALUES
  ('egypt', 'Egypt', 'Egypt'),
  ('iran', 'IR Iran', 'Iran')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (
  slug, competition_id, home_team_id, away_team_id, venue_id,
  title, subtitle, description, event_date, event_time,
  min_price, currency, featured, seat_map_enabled, scarcity_override, match_number, image_url
)
SELECT
  'egypt-vs-iran',
  c.id,
  ht.id,
  at.id,
  v.id,
  'Egypt vs IR Iran',
  'Match 63 · Group G · World Cup 2026',
  'FIFA World Cup 2026 group stage at Lumen Field, Seattle. Marketplace listings from reference inventory.',
  '2026-06-26',
  '20:00',
  425.70,
  'USD',
  false,
  true,
  2,
  '63',
  '/images/events/match-63.jpg'
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'egypt'
  AND at.slug = 'iran'
  AND v.slug = 'lumen-field'
ON CONFLICT (slug) DO UPDATE SET
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  scarcity_override = EXCLUDED.scarcity_override,
  min_price = EXCLUDED.min_price,
  subtitle = EXCLUDED.subtitle,
  match_number = EXCLUDED.match_number;

DELETE FROM ticket_listings
WHERE event_id = (SELECT id FROM events WHERE slug = 'egypt-vs-iran');

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
('147', 'N', NULL, 'seat', 2, 2, 608.40::DECIMAL, 676.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 7, 'Great', 0),
('147', 'M', NULL, 'seat', 2, 2, 639.90::DECIMAL, 711.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 1),
('Category 4', NULL, 'Category 4', 'zone', 2, 2, 447.30::DECIMAL, 497.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Under 15s accompanied by an adult', 'Egypt Supporters Seats'], ARRAY['Last tickets'], 8.8, 'Amazing', 2),
('311', 'BB', NULL, 'seat', 2, 2, 483.30::DECIMAL, 537.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 3),
('337', 'W', NULL, 'seat', 2, 2, 501.30::DECIMAL, 557.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat'], ARRAY['Last tickets'], NULL, NULL, 4),
('309', 'MM', NULL, 'seat', 2, 2, 466.20::DECIMAL, 518.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.3, 'Great', 5),
('303', NULL, NULL, 'seat', 2, 2, 452.70::DECIMAL, 503.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Egypt Supporters Seats'], ARRAY['Last tickets'], NULL, NULL, 6),
('310', 'I', NULL, 'seat', 2, 2, 492.30::DECIMAL, 547.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 7.4, 'Great', 7),
('310', 'B', NULL, 'seat', 2, 2, 495.00::DECIMAL, 550.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY['Fan favorite'], 7.5, 'Great', 8),
('304', 'CC', NULL, 'seat', 2, 2, 447.30::DECIMAL, 497.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Under 15s accompanied by an adult', 'Egypt Supporters Seats'], ARRAY['Fan favorite'], NULL, NULL, 9),
('300', 'P', NULL, 'seat', 2, 2, 462.60::DECIMAL, 514.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 10),
('317', 'F', NULL, 'seat', 2, 2, 425.70::DECIMAL, 473.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 11),
('317', 'G', NULL, 'seat', 2, 2, 425.70::DECIMAL, 473.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Best price'], NULL, NULL, 12),
('315', 'F', NULL, 'seat', 2, 2, 472.50::DECIMAL, 525.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Limited view'], ARRAY['Last tickets'], NULL, NULL, 13),
('342', 'Z', NULL, 'seat', 2, 2, 513.00::DECIMAL, 570.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 14),
('327', 'G', NULL, 'seat', 2, 2, 530.10::DECIMAL, 589.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Under 15s accompanied by an adult'], ARRAY['Last tickets'], NULL, NULL, 15),
('304', 'X', NULL, 'seat', 2, 2, 497.70::DECIMAL, 553.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 16),
('328', 'CC', NULL, 'seat', 2, 2, 524.70::DECIMAL, 583.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite', 'Last tickets'], NULL, NULL, 17),
('325', 'Z', NULL, 'seat', 2, 2, 508.50::DECIMAL, 565.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 18),
('325', 'Y', NULL, 'seat', 2, 2, 516.60::DECIMAL, 574.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 19),
('334', 'E1', NULL, 'seat', 2, 2, 531.90::DECIMAL, 591.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat'], ARRAY['Fan favorite'], NULL, NULL, 20),
('339', 'R', NULL, 'seat', 2, 2, 536.40::DECIMAL, 596.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 21),
('312', 'BB', NULL, 'seat', 2, 2, 536.40::DECIMAL, 596.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 22),
('306', 'HH', NULL, 'seat', 2, 2, 536.40::DECIMAL, 596.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 23),
('334', 'M', NULL, 'seat', 2, 2, 547.20::DECIMAL, 608.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 24),
('309', 'D', NULL, 'seat', 2, 2, 565.20::DECIMAL, 628.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.6, 'Great', 25),
('333', 'B', NULL, 'seat', 2, 2, 566.10::DECIMAL, 629.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY['Fan favorite', 'Last tickets'], NULL, NULL, 26),
('319', 'I', NULL, 'seat', 2, 2, 574.20::DECIMAL, 638.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 27),
('319', 'H', NULL, 'seat', 2, 2, 575.10::DECIMAL, 639.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 28),
('124', 'II', NULL, 'seat', 2, 2, 577.80::DECIMAL, 642.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 29),
('326', 'R', NULL, 'seat', 2, 2, 578.70::DECIMAL, 643.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 30),
('307', 'C', NULL, 'seat', 2, 2, 578.70::DECIMAL, 643.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY['Fan favorite', 'Last tickets'], NULL, NULL, 31),
('230', 'C', NULL, 'seat', 2, 2, 583.20::DECIMAL, 648.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY[]::TEXT[], 7.7, 'Great', 32),
('147', 'II', NULL, 'seat', 2, 2, 583.20::DECIMAL, 648.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 33),
('149', 'KK', NULL, 'seat', 2, 2, 583.20::DECIMAL, 648.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 34),
('325', 'H', NULL, 'seat', 2, 2, 585.00::DECIMAL, 650.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat'], ARRAY[]::TEXT[], NULL, NULL, 35),
('330', 'I', NULL, 'seat', 2, 2, 585.90::DECIMAL, 651.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Under 16s accompanied by an adult'], ARRAY[]::TEXT[], NULL, NULL, 36),
('118', 'F', NULL, 'seat', 2, 2, 596.70::DECIMAL, 663.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY['Last tickets'], 7, 'Great', 37),
('324', 'AA', NULL, 'seat', 2, 2, 601.20::DECIMAL, 668.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 38),
('308', 'C', NULL, 'seat', 2, 2, 601.20::DECIMAL, 668.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY['Fan favorite', 'Last tickets'], NULL, NULL, 39),
('203', 'L', NULL, 'seat', 2, 2, 603.00::DECIMAL, 670.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 7.4, 'Great', 40),
('149', 'HH', NULL, 'seat', 2, 2, 607.50::DECIMAL, 675.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 41),
('CLB210', 'U', NULL, 'seat', 2, 2, 608.40::DECIMAL, 676.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.2, 'Great', 42),
('238', 'D', NULL, 'seat', 2, 2, 608.40::DECIMAL, 676.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 8.7, 'Amazing', 43),
('124', 'H', NULL, 'seat', 2, 2, 608.40::DECIMAL, 676.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.8, 'Great', 44),
('230', 'B', NULL, 'seat', 2, 2, 608.40::DECIMAL, 676.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], 7.5, 'Great', 45),
('149', 'V', NULL, 'seat', 2, 2, 614.70::DECIMAL, 683.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 46),
('149', 'M', NULL, 'seat', 2, 2, 621.00::DECIMAL, 690.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], NULL, NULL, 47),
('126', 'T', NULL, 'seat', 2, 2, 621.90::DECIMAL, 691.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 48),
('232', 'C', NULL, 'seat', 2, 2, 623.70::DECIMAL, 693.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY['Last tickets'], 8.7, 'Amazing', 49),
('146', 'G', NULL, 'seat', 2, 2, 623.70::DECIMAL, 693.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 7.9, 'Great', 50),
('105', 'Z1', NULL, 'seat', 2, 2, 623.70::DECIMAL, 693.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 7.6, 'Great', 51),
('128', 'EE', NULL, 'seat', 2, 2, 626.40::DECIMAL, 696.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 52),
('318', 'EE', NULL, 'seat', 2, 2, 626.40::DECIMAL, 696.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 53),
('214', 'V', NULL, 'seat', 2, 2, 639.90::DECIMAL, 711.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 54),
('125', 'Q', NULL, 'seat', 2, 2, 642.60::DECIMAL, 714.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 55),
('100', 'BB', NULL, 'seat', 2, 2, 653.40::DECIMAL, 726.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Limited view'], ARRAY['Last tickets'], NULL, NULL, 56),
('127', 'KK', NULL, 'seat', 2, 2, 657.00::DECIMAL, 730.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat'], ARRAY['Last tickets'], NULL, NULL, 57),
('111', 'V', NULL, 'seat', 2, 2, 661.50::DECIMAL, 735.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.2, 'Great', 58),
('111', 'U', NULL, 'seat', 2, 2, 661.50::DECIMAL, 735.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.2, 'Great', 59),
('111', 'W', NULL, 'seat', 2, 2, 661.50::DECIMAL, 735.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.1, 'Great', 60),
('313', 'X', NULL, 'seat', 2, 2, 670.50::DECIMAL, 745.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], NULL, NULL, 61),
('112', 'G', NULL, 'seat', 2, 2, 670.50::DECIMAL, 745.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.5, 'Amazing', 62),
('233', 'W', NULL, 'seat', 2, 2, 670.50::DECIMAL, 745.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.6, 'Great', 63),
('123', 'M', NULL, 'seat', 2, 2, 670.50::DECIMAL, 745.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 64),
('144', 'W', NULL, 'seat', 2, 2, 685.80::DECIMAL, 762.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Limited view'], ARRAY[]::TEXT[], NULL, NULL, 65),
('131', 'V', NULL, 'seat', 2, 2, 687.60::DECIMAL, 764.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 7.2, 'Great', 66),
('313', 'B', NULL, 'seat', 2, 2, 695.70::DECIMAL, 773.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], NULL, NULL, 67),
('330', 'A', NULL, 'seat', 2, 2, 711.90::DECIMAL, 791.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Front row of section'], ARRAY[]::TEXT[], NULL, NULL, 68),
('112', 'E', NULL, 'seat', 2, 2, 712.80::DECIMAL, 792.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.5, 'Great', 69),
('305', 'KK', NULL, 'seat', 2, 2, 713.70::DECIMAL, 793.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 70),
('138', 'N', NULL, 'seat', 2, 2, 714.60::DECIMAL, 794.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 8.7, 'Amazing', 71),
('144', 'V', NULL, 'seat', 2, 2, 718.20::DECIMAL, 798.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Limited view'], ARRAY[]::TEXT[], NULL, NULL, 72),
('110', 'I', NULL, 'seat', 2, 2, 723.60::DECIMAL, 804.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.2, 'Amazing', 73),
('133', 'R', NULL, 'seat', 2, 2, 738.00::DECIMAL, 820.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.4, 'Great', 74),
('144', 'U', NULL, 'seat', 2, 2, 750.60::DECIMAL, 834.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Limited view'], ARRAY[]::TEXT[], NULL, NULL, 75),
('332', 'FF', NULL, 'seat', 2, 2, 756.00::DECIMAL, 840.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 76),
('Category 3', NULL, 'Category 3', 'zone', 2, 2, 758.70::DECIMAL, 843.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite', 'Last tickets'], 9.4, 'Amazing', 77),
('231', 'X', NULL, 'seat', 2, 2, 770.40::DECIMAL, 856.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 78),
('116', 'GG', NULL, 'seat', 2, 2, 773.10::DECIMAL, 859.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 79),
('138', 'L', NULL, 'seat', 2, 2, 778.50::DECIMAL, 865.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 8.6, 'Amazing', 80),
('133', 'J', NULL, 'seat', 2, 2, 786.60::DECIMAL, 874.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.7, 'Amazing', 81),
('110', 'H', NULL, 'seat', 2, 2, 787.50::DECIMAL, 875.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 9.1, 'Amazing', 82),
('111', 'R', NULL, 'seat', 2, 2, 804.60::DECIMAL, 894.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Under 15s accompanied by an adult'], ARRAY[]::TEXT[], 7.7, 'Great', 83),
('108', 'X', NULL, 'seat', 2, 2, 822.60::DECIMAL, 914.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 8.8, 'Amazing', 84),
('138', 'J', NULL, 'seat', 2, 2, 827.10::DECIMAL, 919.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Fan favorite'], 8.5, 'Amazing', 85),
('233', 'D', NULL, 'seat', 2, 2, 834.30::DECIMAL, 927.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.6, 'Great', 86),
('CLB210', 'D', NULL, 'seat', 2, 2, 848.70::DECIMAL, 943.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY[]::TEXT[], 7.7, 'Great', 87),
('139', 'Q', NULL, 'seat', 2, 2, 874.80::DECIMAL, 972.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 88),
('137', 'B', NULL, 'seat', 2, 2, 875.70::DECIMAL, 973.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY['Fan favorite', 'Last tickets'], 9.1, 'Amazing', 89),
('136', 'K', NULL, 'seat', 2, 2, 875.70::DECIMAL, 973.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Food and Beverage Included'], ARRAY[]::TEXT[], 8.8, 'Amazing', 90),
('236', 'A', NULL, 'seat', 2, 2, 892.80::DECIMAL, 992.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Aisle seat', 'Front row of section'], ARRAY['Last tickets'], 8, 'Great', 91),
('135', 'Q', NULL, 'seat', 2, 2, 920.70::DECIMAL, 1023.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], 8.2, 'Great', 92),
('110', 'B', NULL, 'seat', 2, 2, 924.30::DECIMAL, 1027.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY[]::TEXT[], 9.1, 'Amazing', 93),
('136', 'H', NULL, 'seat', 2, 2, 924.30::DECIMAL, 1027.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Food and Beverage Included'], ARRAY[]::TEXT[], 8.9, 'Amazing', 94),
('136', 'G', NULL, 'seat', 2, 2, 972.90::DECIMAL, 1081.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section', 'Food and Beverage Included'], ARRAY[]::TEXT[], 8.9, 'Amazing', 95),
('108', 'C', NULL, 'seat', 2, 2, 978.30::DECIMAL, 1087.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Third row of section'], ARRAY[]::TEXT[], 9.5, 'Amazing', 96),
('109', 'B', NULL, 'seat', 2, 2, 1071.00::DECIMAL, 1190.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section'], ARRAY['Last tickets'], 8.9, 'Amazing', 97),
('136', 'F', NULL, 'seat', 2, 2, 1166.40::DECIMAL, 1296.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Second row of section', 'Food and Beverage Included'], ARRAY[]::TEXT[], 8.5, 'Great', 98),
('136', 'E', NULL, 'seat', 2, 2, 1312.20::DECIMAL, 1458.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Front row of section', 'Food and Beverage Included'], ARRAY[]::TEXT[], 8.1, 'Great', 99),
('Category 2', NULL, 'Category 2', 'zone', 2, 2, 1330.20::DECIMAL, 1478.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 100),
('Category 1', NULL, 'Category 1', 'zone', 2, 2, 1521.00::DECIMAL, 1690.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 101),
('110', 'A', NULL, 'seat', 2, 2, 1776.60::DECIMAL, 1974.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view', 'Front row of section'], ARRAY[]::TEXT[], NULL, NULL, 102),
(NULL, 'Q', 'Iran Supporters Standard Tier', 'zone', 2, 2, 1784.70::DECIMAL, 1983.00::DECIMAL, 'USD', ARRAY['Iran Supporters Standard Tier', '2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 103),
('107', NULL, NULL, 'seat', 2, 2, 7851.60::DECIMAL, 8724.00::DECIMAL, 'USD', ARRAY['2 tickets together', 'Clear view'], ARRAY['Last tickets'], NULL, NULL, 104)
) AS v(section_number, row_label, product_name, listing_type, quantity, quantity_available, price, compare_at_price, currency, perks, badges, view_score, view_label, sort_order)
WHERE e.slug = 'egypt-vs-iran';
