-- Frontrowly seed data: World Cup 2026 sample events
-- Run after migrations 001–008
-- For all 104 matches: supabase/seed/world-cup-2026-full.sql
-- Safe to re-run: skips rows that already exist

INSERT INTO competitions (slug, name, sport, country, description, featured) VALUES
  ('world-cup-2026', 'FIFA World Cup 2026', 'football', 'International', 'The 23rd FIFA World Cup — USA, Canada & Mexico', true),
  ('premier-league', 'Premier League', 'football', 'England', 'English top-flight football', false),
  ('nba', 'NBA', 'basketball', 'USA', 'National Basketball Association', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO teams (slug, name, country) VALUES
  ('brazil', 'Brazil', 'Brazil'),
  ('scotland', 'Scotland', 'Scotland'),
  ('germany', 'Germany', 'Germany'),
  ('usa', 'USA', 'United States'),
  ('mexico', 'Mexico', 'Mexico'),
  ('england', 'England', 'England'),
  ('new-zealand', 'New Zealand', 'New Zealand'),
  ('belgium', 'Belgium', 'Belgium')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO venues (slug, name, city, country, capacity) VALUES
  ('hard-rock-stadium', 'Hard Rock Stadium', 'Miami', 'United States', 65326),
  ('metlife-stadium', 'MetLife Stadium', 'New Jersey', 'United States', 82500),
  ('estadio-azteca', 'Estadio Azteca', 'Mexico City', 'Mexico', 87523),
  ('sofi-stadium', 'SoFi Stadium', 'Los Angeles', 'United States', 70240),
  ('bc-place-stadium', 'BC Place Stadium', 'Vancouver', 'Canada', 54500)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (slug, competition_id, home_team_id, away_team_id, venue_id, title, subtitle, event_date, event_time, min_price, featured, description)
SELECT
  'brazil-vs-scotland',
  c.id,
  ht.id,
  at.id,
  v.id,
  'Brazil vs Scotland',
  'Match 49 · Group C · World Cup 2026',
  '2026-06-24',
  '18:00',
  360.00,
  true,
  'World Cup 2026 group stage clash at Hard Rock Stadium, Miami.'
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'brazil'
  AND at.slug = 'scotland'
  AND v.slug = 'hard-rock-stadium'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (slug, competition_id, home_team_id, away_team_id, venue_id, title, subtitle, event_date, event_time, min_price, featured)
SELECT
  'mexico-vs-usa',
  c.id,
  ht.id,
  at.id,
  v.id,
  'Mexico vs USA',
  'Match 59 · Group D · World Cup 2026',
  '2026-06-25',
  '19:00',
  315.00,
  true
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'mexico'
  AND at.slug = 'usa'
  AND v.slug = 'sofi-stadium'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (slug, competition_id, home_team_id, away_team_id, venue_id, title, subtitle, event_date, event_time, min_price, featured)
SELECT
  'germany-vs-england',
  c.id,
  ht.id,
  at.id,
  v.id,
  'Germany vs England',
  'Round of 16 · World Cup 2026',
  '2026-07-04',
  '20:00',
  540.00,
  true
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = 'germany'
  AND at.slug = 'england'
  AND v.slug = 'metlife-stadium'
ON CONFLICT (slug) DO NOTHING;

-- Ticket categories for Brazil vs Scotland
INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'VIP Hospitality', 'Premium hospitality package with lounge access', 'VIP', 2250.00, 20, 20, 1
FROM events e
WHERE e.slug = 'brazil-vs-scotland'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'VIP Hospitality'
  );

INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'Category 1', 'Prime sideline seating', 'Cat 1', 1080.00, 50, 50, 2
FROM events e
WHERE e.slug = 'brazil-vs-scotland'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'Category 1'
  );

INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'Category 2', 'Excellent stadium views', 'Cat 2', 585.00, 100, 100, 3
FROM events e
WHERE e.slug = 'brazil-vs-scotland'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'Category 2'
  );

INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'Category 3', 'Standard seating', 'Cat 3', 360.00, 200, 200, 4
FROM events e
WHERE e.slug = 'brazil-vs-scotland'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'Category 3'
  );

-- TBD bracket matches (teams confirmed later)
INSERT INTO events (
  slug, competition_id, home_team_id, away_team_id,
  home_team_label, away_team_label,
  venue_id, title, subtitle, event_date, event_time, min_price, featured, description
)
SELECT
  'world-cup-qf-match-98',
  c.id,
  NULL,
  NULL,
  'Winner Match 93',
  'Winner Match 94',
  v.id,
  'Winner Match 93 vs Winner Match 94',
  'Quarterfinal · Match 98 · World Cup 2026',
  '2026-07-11',
  '18:00',
  405.00,
  true,
  'Quarterfinal at MetLife Stadium — teams confirmed after Round of 16.'
FROM competitions c, venues v
WHERE c.slug = 'world-cup-2026'
  AND v.slug = 'metlife-stadium'
ON CONFLICT (slug) DO UPDATE SET
  home_team_label = EXCLUDED.home_team_label,
  away_team_label = EXCLUDED.away_team_label,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  min_price = EXCLUDED.min_price,
  description = EXCLUDED.description;

INSERT INTO events (
  slug, competition_id, home_team_id, away_team_id,
  home_team_label, away_team_label,
  venue_id, title, subtitle, event_date, event_time, min_price, featured, description
)
SELECT
  'world-cup-final-match-104',
  c.id,
  NULL,
  NULL,
  NULL,
  NULL,
  v.id,
  'World Cup Final',
  'Match 104 · TBD vs TBD · FIFA World Cup 2026',
  '2026-07-19',
  '15:00',
  10104.30,
  true,
  'FIFA World Cup 2026 Final at MetLife Stadium.'
FROM competitions c, venues v
WHERE c.slug = 'world-cup-2026'
  AND v.slug = 'metlife-stadium'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  min_price = EXCLUDED.min_price,
  description = EXCLUDED.description;

INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'Category 3', 'Upper-mid bowl', 'Cat 3', 11826.90, 30, 30, 1
FROM events e
WHERE e.slug = 'world-cup-final-match-104'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'Category 3'
  );

INSERT INTO ticket_categories (event_id, name, description, section, price, quantity_total, quantity_available, sort_order)
SELECT e.id, 'Category 1', 'Lower bowl sideline', 'Cat 1', 25380.90, 10, 10, 2
FROM events e
WHERE e.slug = 'world-cup-final-match-104'
  AND NOT EXISTS (
    SELECT 1 FROM ticket_categories tc WHERE tc.event_id = e.id AND tc.name = 'Category 1'
  );
