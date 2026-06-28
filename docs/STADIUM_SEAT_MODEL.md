# Stadium seat model

How Frontrowly maps real venue seating to interactive maps and checkout.

## Hierarchy

```
Venue (BC Place Stadium)
  └── StadiumMap (bc-place)
        └── StadiumSection (203, 411, 337…)
              └── StadiumRow (A, M, SS…)     [optional per listing]
                    └── TicketListing (qty + price + perks for one event)
```

## Entities

| Table | Purpose |
|-------|---------|
| `stadium_maps` | SVG / layout slug per venue |
| `stadium_sections` | Numbered bowl blocks (201–454 at BC Place) |
| `stadium_rows` | Row labels within a section (admin bulk A–Z) |
| `ticket_listings` | Sellable inventory: section + row + qty + price |

## Listing types

| `listing_type` | Example |
|----------------|---------|
| `seat` | Section 203, Row M · 2 tickets · $537 |
| `zone` | Lower Level · 2 tickets · $507 |
| `hospitality` | Trophy Lounge · 1 ticket · $48,606 |

## Checkout

- User picks **quantity** (1–4) → listings filtered where `quantity_available >= qty`
- User picks **listing** → checkout item includes `listingId`, `sectionNumber`, `rowLabel`
- Order holds listing stock; `order_items.listing_id` links the sale

## Map UI

Three display modes (`getMapDisplayMode` in `src/lib/stadium/registry.ts`):

| Mode | When | Component |
|------|------|-----------|
| **section** | Venue has traced/programmatic map (`bc-place`, `metlife`, `sofi`, `levis`) | `StadiumMap` — per-section SVG wedges |
| **zone** | `seat_map_enabled` but no venue SVG yet (e.g. Mercedes-Benz, NRG) | `ZoneOverviewMap` — level bands + category chips from listings |
| **none** | `seat_map_enabled = false` | List-only browse |

### Section maps (BC Place, MetLife, SoFi, Levi's)

- Each section = SVG wedge (`id="section-203"`)
- Blue = has available listings; grey = none
- **Price labels only on hover or selected section** (not every wedge — avoids clutter)
- Click section → filter right panel; hover listing → highlight section

### Zone overview (all other venues)

- Groups inventory by level (100/200/300), FIFA category, hospitality
- Clickable bands filter the listing panel
- Accurate section maps added per venue via backlog items 23–26 (trace official charts → `public/stadiums/*.svg`)

## Venue references

- BC Place: `docs/venues/BC_PLACE.md` · `public/stadiums/bc-place-reference.png`
- MetLife: `docs/venues/METLIFE.md`

## Admin workflow (backlog item 55)

1. Venue has `stadium_map_slug`
2. Sections seeded from SVG or SQL
3. Per event: add listings (section → row → qty → price → perks → badges)
4. Event `seat_map_enabled = true` → `/events/[slug]/tickets` route
