# Admin SQL templates

Copy-paste SQL for common tasks. Run in the Supabase SQL editor (or `psql`). Safe to re-run where noted.

## List matches with unknown teams

Knockout fixtures from July onward often use bracket labels until teams are confirmed.

```sql
SELECT
  match_number,
  slug,
  title,
  home_team_label,
  away_team_label,
  event_date,
  event_time
FROM events
WHERE home_team_id IS NULL OR away_team_id IS NULL
ORDER BY event_date, event_time;
```

## Assign both teams when bracket is resolved

Replace slugs and match metadata. **Labels are cleared** when team IDs are set.

```sql
-- Example: Croatia vs Ghana (Match 68, group stage — adjust for your fixture)
UPDATE events e
SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'croatia'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'ghana'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Croatia vs Ghana',
  subtitle = 'Match 68 · Group L · World Cup 2026'
WHERE e.slug = 'croatia-vs-ghana';
```

### Round of 32 / knockout example

```sql
-- Winner Match 73 vs Winner Match 75 (Match 90)
UPDATE events e
SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'france'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'argentina'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'France vs Argentina',
  subtitle = 'Round of 16 · Match 90 · World Cup 2026'
WHERE e.slug = 'world-cup-match-90';
```

## Assign one side only (other still TBD)

```sql
UPDATE events e
SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'spain'),
  home_team_label = NULL,
  title = 'Spain vs Winner Match 94'
WHERE e.slug = 'world-cup-qf-match-98';
```

## Set bracket labels only (teams unknown)

```sql
UPDATE events
SET
  home_team_id = NULL,
  away_team_id = NULL,
  home_team_label = 'Group G winners',
  away_team_label = 'Group A/E/H/I/J third place',
  title = 'Group G winners vs Group A/E/H/I/J third place',
  subtitle = 'Round of 32 · Match 82 · World Cup 2026'
WHERE slug = 'world-cup-match-82';
```

## Team slug reference

```sql
SELECT slug, name FROM teams ORDER BY name;
```

## Refresh listings after viagogo paste

Re-run the match seed file (idempotent — deletes + re-inserts listings for that event):

```sql
-- Paste contents of supabase/seed/croatia-vs-ghana-full.sql
```

Or regenerate locally:

```bash
npm run seed:croatia-ghana
```

## Update event min price from listings

```sql
UPDATE events e
SET min_price = sub.min_p
FROM (
  SELECT event_id, MIN(price) AS min_p
  FROM ticket_listings
  WHERE status = 'available'
  GROUP BY event_id
) sub
WHERE e.id = sub.event_id;
```

## Enable seat map + scarcity for a match

```sql
UPDATE events
SET
  seat_map_enabled = true,
  scarcity_override = 1
WHERE slug = 'croatia-vs-ghana';
```

---

**Admin UI:** You can also assign teams under **Admin → Events → Edit** — pick teams from the dropdowns; bracket labels clear on save when a team is selected.
