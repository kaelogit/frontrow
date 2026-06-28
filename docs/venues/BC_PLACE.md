# BC Place Stadium — seat map reference

**Venue:** BC Place Stadium, Vancouver, British Columbia, Canada  
**Capacity:** ~54,000 (soccer configuration)  
**Reference image:** `public/stadiums/bc-place-reference.png` (official-style chart from FIFA/venue)  
**Anchor event:** New Zealand vs Belgium — World Cup 2026, Match 64, Group G

Use this doc when building the interactive SVG (`public/stadiums/bc-place.svg`), seeding sections in Supabase, and adding listings in admin.

---

## Bowl layout (top-down)

```
                    [300s: 336–346]
              ┌─────────────────────────┐
    [400s     │                         │     400s]
    420–432   │      ┌───────────┐      │   401–407
              │      │  200s     │      │   450–454
    [200s     │      │  pitch    │      │   [200s
    221–234]  │      │  (green)  │      │   248–254]
              │      └───────────┘      │
              │   209–219    236–246    │
              └─────────────────────────┘
                    [400s: 408–419, 433–449]
```

---

## Section inventory (all numbered blocks)

### 200 level — inner ring (closest to pitch)

| Side | Sections |
|------|----------|
| East (right goal area) | 201, 202, 203, 204, 206, 207 |
| South (long side, bottom) | 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219 |
| West (left) | 221, 222, 224, 225, 226, 227, 228, 229, 230, 231, 233, 234 |
| North (long side, top) | 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246 |
| East (right, upper curve) | 248, 249, 251, 252, 253, 254 |

**Count:** 44 sections (note gaps: no 205, 208, 220, 223, 232, 235, 247, 250 in chart)

### 300 level — mid tier (north long side only on chart)

336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346

**Count:** 11 sections

### 400 level — outer ring

| Side | Sections |
|------|----------|
| East | 401, 402, 403, 404, 405, 406, 407 |
| South | 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419 |
| West | 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432 |
| North | 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449 |
| East (curve) | 450, 451, 452, 453, 454 |

**Count:** 54 sections

**Total numbered sections on chart:** ~109

---

## Ticket categories (FIFA standard)

From chart legend — map sections to zones in admin:

| Zone | Typical view | Notes |
|------|--------------|-------|
| **Category 1** | Prime sideline, center | Highest demand; 200-level center blocks |
| **Category 2** | Good sideline / corner premium | |
| **Category 3** | Upper 200s / lower 400s | |
| **Category 4** | Upper 400s / ends | Value tier |

### Premium / hospitality (not numbered sections)

| Product | Admin slug |
|---------|------------|
| Lounge 1000 | `lounge-1000` |
| FIFA Pavilion | `fifa-pavilion` |
| Trophy Lounge | `trophy-lounge` |
| Pitchside Lounge | `pitchside-lounge` |
| Champions Club | `champions-club` |

---

## Supporter sections (team-specific)

For NZ vs Belgium and similar matches:

| Team | Tiers |
|------|-------|
| **New Zealand** | Premium Tier, Standard Tier, Value Tier |
| **Belgium** | Premium Tier, Standard Tier, Value Tier |

Admin: link supporter blocks to section ranges or dedicated inventory flags (`supporter_team`, `supporter_tier`).

---

## Row labels (from viagogo listings)

Rows are **per section** — not global. Examples seen on resale market for BC Place:

| Pattern | Examples |
|---------|----------|
| Single letters | A, B, D, E, F, G, J, M |
| Double letters | SS, PP, LL |

**Admin workflow:** When adding a listing → pick **Section** → pick/create **Row** → set **quantity** (1–4 typical) → **price** → perks.

Suggested row sort: A=1 (front), Z=26, AA=27… (standard theatre ordering).

---

## Listing example (viagogo shape)

```
Section 203, Row M · 2 tickets · $537 · Fan favorite · Last tickets
Section 411, Row SS · 2 tickets · $542 · Clear view · 7.4 Great
Section 421, Row A · 2 tickets · $507 · Aisle seat · Last tickets
```

Each row = one `ticket_listing` record (see backlog item 19).

---

## SVG build checklist

When tracing `bc-place.svg` from reference image:

1. One `<path>` or `<polygon>` per section with `id="section-203"` / `data-section="203"`
2. Center pitch: green rect, white markings
3. Unavailable sections: `fill="#e2e8f0"` (grey)
4. Available: `fill="#93c5fd"` (blue) or `#86efac` (green) on hover
5. Category zone: `data-zone="cat-1"` on path for filter chips
6. Price bubble anchor: `data-label-x` / `data-label-y` or compute centroid

---

## SQL seed snippet (sections only)

```sql
-- After venue + stadium_map exist (migration 002)
INSERT INTO stadium_sections (venue_id, section_number, level, zone)
SELECT v.id, n.section_number, n.level, n.zone
FROM venues v
CROSS JOIN (VALUES
  ('209', '200', 'cat-2'), ('210', '200', 'cat-2'), -- ... all sections
  ('336', '300', 'cat-3'),
  ('411', '400', 'cat-3')
) AS n(section_number, level, zone)
WHERE v.slug = 'bc-place-stadium';
```

Full seed file to be generated in `supabase/seed/bc-place-sections.sql` when item 19 ships.

---

## Related backlog items

- **19** — Database schema (sections, rows, listings)
- **20** — `STADIUM_SEAT_MODEL.md` (general model)
- **23** — BC Place interactive SVG
- **18** — NZ vs Belgium event + 50+ listings
