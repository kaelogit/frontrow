# World Cup 2026 — full match seed

Seed all **104 FIFA World Cup 2026 matches** (48 teams · 16 venues · Jun 11 – Jul 19 2026).

## Files

| File | Purpose |
|------|---------|
| `scripts/data/wc2026-fixtures.json` | Source schedule (match numbers, teams, venues, UTC kickoffs) |
| `scripts/generate-world-cup-2026-seed.mjs` | Generator script |
| `supabase/seed/world-cup-2026-full.sql` | **Run this** in Supabase |
| `src/lib/data/world-cup-2026-schedule.generated.ts` | Dev mock data (auto-generated) |

## Run order

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for full migration and env setup.

1. Migrations `001`–`011` (includes queue, stadium map admin, media storage)
2. `supabase/seed.sql` — competitions + sample categories
3. **`supabase/seed/world-cup-2026-full.sql`** — 48 teams, 16 venues, 104 events
4. `supabase/seed/new-zealand-vs-belgium-full.sql` — Match 64 listings + seat map inventory
5. **`supabase/seed/metlife-final-listings.sql`** — Match 104 Final listings (77) + MetLife map flags
6. **`supabase/seed/sofi-qf-listings.sql`** — Match 98 QF listings (127) + SoFi map flags

```bash
# Regenerate after editing fixtures JSON
npm run seed:wc2026

# Regenerate Final inventory from docs/venues/METLIFE.md data
npm run seed:metlife-final

# Regenerate SoFi QF inventory from docs/venues/SOFI.md data
npm run seed:sofi-qf
```

## Anchor events (custom slugs)

| Match | Slug | Notes |
|-------|------|-------|
| 64 | `new-zealand-vs-belgium` | BC Place · `seat_map_enabled` |
| 98 | `world-cup-qf-match-98` | SoFi Stadium quarterfinal · `seat_map_enabled` · 127 listings |
| 104 | `world-cup-final-match-104` | MetLife Final · `seat_map_enabled` · `queue_enabled` · 77 listings |

Knockout placeholders use `home_team_label` / `away_team_label` (e.g. *Winner Match 93*).

## Venue coverage

All 16 host stadiums are represented (4–9 matches each): Azteca, BBVA, Akron, BMO Field, BC Place, MetLife, SoFi, Gillette, AT&T, Mercedes-Benz, Lumen, Levi's, Lincoln Financial, NRG, Arrowhead, Hard Rock.

## Pricing

`min_price` on each event uses stage + venue tier, with Frontrowly’s **10% below market** rule baked in. Full listing inventory for the Final is in `metlife-final-listings.sql` (run after step 3).

## Source attribution

Fixture data from [TheStatsAPI World Cup 2026 fixtures](https://www.thestatsapi.com/world-cup/data/fixtures.json) (FIFA schedule). Regenerate if FIFA updates kickoff times.
