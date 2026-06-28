# SoFi Stadium — seat map reference

**Venue:** SoFi Stadium, Inglewood, California, United States  
**Capacity:** ~70,240 (soccer configuration)  
**Anchor event:** World Cup 2026 Quarterfinal — Match 98 (`world-cup-qf-match-98`)

Use this doc when building the interactive SVG (`public/stadiums/sofi.svg`), seeding sections, and adding listings.

---

## Bowl layout (simplified top-down)

```
              [500s: 504–525, 536–553]
         ┌──────────────────────────────┐
  [400s  │                              │  400s]
  400–457 │      ┌────────────┐          │  corners
          │      │   pitch    │          │
  [200s   │      │  (green)   │          │  [200s
  201–212]│      └────────────┘          │  227–238]
          └──────────────────────────────┘
```

Club / premium lettered sections (C215, etc.) omitted from MVP map — numbered reserved bowl only.

---

## Section inventory (numbered reserved bowl)

### 200 level — lower corners & end zones

| Block | Sections |
|-------|----------|
| South end | 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212 |
| North corners | 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238 |

### 400 level — mid bowl

400–434, 436–457 (continuous ring segments on chart)

### 500 level — upper bowl

504–525, 536–553 (includes **543** sideline upper — common value tier)

---

## World Cup QF pricing reference (Match 98)

Frontrowly sells **10% below** reference market “Now” prices.

| Tier | Typical sections | Market “Now” (from) | Frontrowly |
|------|------------------|---------------------|------------|
| Cat 4 / Value | 500s corners (543+) | $810 | $729 |
| Cat 3 | 500s sideline, upper 400s | $900–$1,200 | $810–$1,080 |
| Cat 2 | 400s center, lower corners | $1,400–$2,500 | $1,260–$2,250 |
| Cat 1 | 200s premium corners | $2,000–$4,500 | $1,800–$4,050 |
| Hospitality | Field suites / clubs | $8,000+ | $7,200+ |

**Map bubble anchors:** 543 ($810), 227 ($950), 412 ($1,400), 208 ($2,800)

---

## Premium / hospitality (not numbered)

| Product | Notes |
|---------|-------|
| Field Club | Lower premium sideline |
| Champions Club | Club level hospitality |
| Suite Level | Private suites |

---

## Related backlog

- **Item 25** — production SoFi SVG traced from venue chart
- **Item 18** — anchor QF inventory + MVP wedge map
