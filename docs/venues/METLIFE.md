# MetLife Stadium — seat map reference

**Venue:** MetLife Stadium, East Rutherford, New Jersey (marketed as New York)  
**Capacity:** ~82,500  
**Reference image:** `public/stadiums/metlife-reference.png` (Hellotickets Final UI + map)  
**Anchor event:** World Cup Final — Match 104 · Sun Jul 19, 2026 · 3:00 PM

Highest-value inventory on the platform. Enable **waiting room** (backlog item 37) when this goes live.

---

## Event record (admin seed)

| Field | Value |
|-------|-------|
| `slug` | `world-cup-final-match-104` |
| `title` | World Cup Final |
| `subtitle` | Match 104 · FIFA World Cup 2026 |
| `event_date` | 2026-07-19 |
| `event_time` | 15:00 |
| `venue` | metlife-stadium |
| `queue_enabled` | `true` |
| `home_team_id` | `null` (TBD until final) |
| `away_team_id` | `null` (TBD until final) |

---

## Market price ranges (Hellotickets reference, Jun 2026)

| Quantity filter | From | To |
|-----------------|------|-----|
| **2 tickets** | $11,227 | $56,401+ |
| **1 ticket** | $11,147 | $55,721+ |

Premium / hospitality listings exceed $100k — show as separate products, not section rows.

---

## Bowl levels

MetLife uses multiple tiers (NFL/soccer config). From map + listings:

| Level | Section range | Typical role |
|-------|---------------|--------------|
| **100** | 101–149 (approx.) | Lower bowl — premium sideline |
| **200** | 201–249 (approx.) | Club / lower-mid |
| **300** | 301–349 (approx.) | Upper-mid — highest listing volume on Final |
| **500** | 501+ (if present on full chart) | Upper deck value |

*Exact full section list to be traced from SVG; numbers below are confirmed from Hellotickets listings + map bubbles.*

---

## Sections confirmed on Final map (price bubbles)

### 300 level (outer mid-tier — volume tier ~$11k–$18k)

301, 303, 305, 307, 311, 315, 318, 321, 327, 329, 331, 333, 341, 345, 347, 349

Sample bubble prices (2-ticket filter): $11,227 (321) → $18,142 (329)

### 100 / lower inner (premium ~$18k–$55k+)

104, 112, 118, 121, 124, 128, 131, 134, 148

Sample bubble prices: $22,561 (104) · $54,977 (131)

---

## Sections from listing panel (2 tickets, sorted by price)

| Section | Row | Price/ticket | Notes |
|---------|-----|--------------|-------|
| 349 | 18 | $13,141 | |
| 303 | 11 | $13,195 | |
| 347 | 19 | $13,266 | |
| 314 | 23 | $13,381 | |
| 328 | 13 | $13,411 | |
| 342 | 12 | $13,488 | |
| 313 | 24 | $13,494 | |
| 311 | 16 | $13,537 | |
| 320 | 16 | $13,537 | |
| 307 | 20 | $13,595 | |
| 333 | 20 | $13,595 | |
| 319 | — | $13,596 | Row optional in resale |
| 316 | 16 | $13,606 | |
| 342 | 5 | $13,714 | Same section, different row |

**Pattern:** 300-level sections dominate the “affordable” Final inventory (~$13k/seat for pairs).

---

## Sections from listing panel (1 ticket — premium)

| Section | Row | Price/ticket | Notes |
|---------|-----|--------------|-------|
| 104 | 10 | $28,201 | Lower bowl sideline |
| 315 | 20 | $27,489 | |
| 129 | — | $26,921 | |
| 131 | 31 | $26,116 | Map bubble $54,977 = different listing/qty |
| 123 | — | $25,426 | |
| 149 | — | $25,324 | |
| 123 | 22 | $25,021 | |
| 123 | 3 | $49,632 | Front row premium |
| 143 | 19 | $45,355 | |
| 133 | 15 | $45,121 | |
| 144 | 9 | $44,867 | |
| 144 | 23 | $44,867 | |

Higher rows in same section can be **cheaper** or **dearer** — always price per listing, not per section.

---

## Hospitality & non-numbered products

These appear in the list **without** a section number (or with “No image available”):

| Product | 1 ticket price | Admin `listing_type` |
|---------|----------------|----------------------|
| **Trophy Lounge** | $48,606 | `hospitality` |
| **Lower Sideline** | $55,721 | `hospitality` |
| **Lower Premium** | $109,034 | `hospitality` |
| **Pitchside Lounge** | $112,167 | `hospitality` |
| **Lower Level** | $28,738 (2 tkts) | `zone` |

Store as `ticket_listings` with `section_id = null` and `product_name` set.

---

## UI reference (Hellotickets Final page)

From `metlife-reference.png`:

- **Compact blue header:** back arrow · title · date · venue · info icon
- **Split layout:** map ~60% · listing panel ~40%
- **Filter pill:** “2 tickets” · range “$11,227 – $56,401+” · Sort by Price
- **Map:** blue = available, grey = none; white price bubbles on sections
- **Listing card:** mini-map thumb · Section + Row · qty · **$XX,XXX** per ticket
- **Zoom:** +/- bottom-right of map

Replicate in backlog items **36** (ticket route header) and **21–22** (map + panel).

---

## Row label patterns (Final)

Single digits and teens common in 300s: Row 5, 11, 12, 16, 18, 19, 20, 23, 24  
Lower bowl: Row 3, 9, 10, 15, 19, 22, 23, 31  
Some listings omit row (still valid resale listing).

---

## Suggested category zones (admin)

| Zone | Sections (indicative) | Price band (per ticket, 2026 market) |
|------|----------------------|--------------------------------------|
| Cat 4 / Value | Upper 300s far corners | $11k–$14k |
| Cat 3 | 300s center / corners | $13k–$18k |
| Cat 2 | 200s / lower 300s | $18k–$30k |
| Cat 1 | 100s sideline | $25k–$50k |
| Hospitality | Lounges, pitchside | $48k–$112k+ |

---

## SVG build checklist

1. Trace from `metlife-reference.png` — oval bowl, green pitch
2. Path IDs: `section-349`, `section-131`, etc.
3. Price bubble centroids for sections with `min_price` in DB
4. 500-level sections if visible on full official chart (add when asset available)
5. Queue gate: redirect to `/events/world-cup-final-match-104/queue` when `queue_enabled`

---

## SQL seed priorities

When seeding Final inventory, start with:

1. **~15 hospitality rows** (4 lounge products + zone products)
2. **~30 listings in 300s** ($13k range, pairs) — matches Hellotickets volume
3. **~10 listings in 100s** ($25k–$50k singles)
4. **2–3 hero listings** at $54k+ (Section 131, 144) for map bubbles

Full seed: `supabase/seed/metlife-final-listings.sql` (item **17**).

---

## Related backlog items

- **17** — MetLife Final inventory seed
- **24** — MetLife interactive SVG
- **37–39** — Waiting room (enable for Final)
- **9** — New York city hub (lists Final first)
