# Levi's Stadium — seat map reference

**Venue:** Levi's Stadium, Santa Clara, California, United States  
**Capacity:** ~68,500 (soccer configuration)  
**Anchor event:** World Cup 2026 Round of 32 — Match 81 (`world-cup-match-81`)

Reference chart: `public/stadiums/levis-reference.png` (viagogo screenshot).  
Interactive wedges: `src/lib/stadium/levis-layout.ts` (pill-shaped elliptical arcs).  
Static trace export: `public/stadiums/levis.svg` (generated from layout).

---

## Bowl layout (viagogo top-down)

```
         [300s: 301–328 — north band only]
    ┌────────────────────────────────────┐
    │  [100 NW]    [400 outer ring]      │
    │  101–112     401–422               │
    │         ┌──────────────┐           │
 [200 west]  │    pitch     │  [200 east]│
  201–211    │   (green)    │   221–235  │
    │         └──────────────┘           │
    │  [100 east 118–140]  [200 S 243–6] │
    └────────────────────────────────────┘
```

Club lettered sections (C138, etc.) and party suites omitted from full trace — C138 included as MVP wedge.

---

## Section inventory (Match 81 map)

| Level | Sections |
|-------|----------|
| 100 | 101–112, 113–140 (gaps), 142–146 |
| 200 | 201–232, 240, 243–246 |
| 300 | 301–328 (north arc) |
| 400 | 401–422 (outer pill ring) |
| Club | C138 (listings) |

---

## World Cup R32 pricing reference (Match 81)

Frontrowly sells **10% below** viagogo “Now” prices.

| Tier | Typical sections | Market “Now” (from) | Frontrowly |
|------|------------------|---------------------|------------|
| Cat 3 | Upper 400 corners | ~$1,679 | ~$1,511 |
| Cat 2 | 200 east, mid 400s | $1,900–$2,500 | $1,710–$2,250 |
| Cat 1 | 200 midfield, 300 center | $2,400–$4,000 | $2,160–$3,600 |
| Premium 100 | 127, midfield lower | $3,000+ | $2,700+ |

---

## Premium / hospitality (not numbered on map)

| Product | Notes |
|---------|-------|
| Champions Club | Club level hospitality |
| Field suites | C-section lettered inventory |
| FIFA Pavilion | Zone product |

---

## Related backlog

- **Item 26** — hand-polished `levis.svg` traced from reference (current file is geometry export)
- Match 81 listings seeded in `supabase/seed/world-cup-match-81-full.sql`

### Existing Supabase DBs

If `venues.stadium_map_slug` for Levi's is still `NULL`:

```sql
UPDATE venues SET stadium_map_slug = 'levis' WHERE slug = 'levis-stadium';
```
