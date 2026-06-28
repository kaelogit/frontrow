# Viagogo listing paste workflow

When a match is live on viagogo, paste the listing panel copy (like NZ vs Belgium) and we generate SQL + mock data.

## What to paste

For each match, send:

1. **Match number** (e.g. `98`) and **event slug** if known (`world-cup-qf-match-98`)
2. Full viagogo listing copy: section, row, qty, prices, perks, view scores

## Generator commands

| Match | Command |
|-------|---------|
| NZ vs Belgium (64) | `npm run seed:nz-be` |
| Cabo Verde vs Saudi Arabia (65) | `npm run seed:cabo-verde-saudi` |
| Uruguay vs Spain (66) | `npm run seed:uruguay-spain` |
| Egypt vs IR Iran (63) | `npm run seed:egypt-iran` |
| Croatia vs Ghana (68) | `npm run seed:croatia-ghana` |
| Match 80 R32 Atlanta (TBD teams) | `npm run seed:match-80` |
| Match 81 R32 Levi's Stadium (TBD teams) | `npm run seed:match-81` |
| Match 82 R32 Lumen Field (TBD teams) | `npm run seed:match-82` |
| Match 83 R32 BMO Field (TBD teams) | `npm run seed:match-83` |
| Match 84 R32 SoFi Stadium (TBD teams) | `npm run seed:match-84` |
| Match 85 R32 BC Place (Switzerland vs 3E/F/G/I/J) | `npm run seed:match-85` |
| Match 86 R32 Hard Rock Stadium (Argentina vs 2H) | `npm run seed:match-86` |
| Match 87 R32 Arrowhead (1K vs 3D/E/I/J/L) | `npm run seed:match-87` |
| Match 89 R16 Lincoln Financial Field (W74 vs W77) | `npm run seed:match-89` |
| Match 90 R16 NRG Stadium (W73 vs W75) | `npm run seed:match-90` |
| Match 91 R16 MetLife Stadium (W76 vs W78) | `npm run seed:match-91` |
| Match 92 R16 Estadio Azteca (W79 vs W80) | `npm run seed:match-92` |
| Match 93 R16 AT&T Stadium (W83 vs W84) | `npm run seed:match-93` |
| Match 94 R16 Lumen Field (W81 vs W82) | `npm run seed:match-94` |
| Match 95 R16 Mercedes-Benz Stadium (W86 vs W88) | `npm run seed:match-95` |
| Match 96 R16 BC Place (W85 vs W87) | `npm run seed:match-96` |
| Match 97 QF Gillette (W89 vs W90) | `npm run seed:match-97` |
| Match 98 QF SoFi (W93 vs W94) | `npm run seed:match-98` or `npm run seed:sofi-qf` |
| Match 99 QF Hard Rock (W91 vs W92) | `npm run seed:match-99` |
| Match 100 QF Arrowhead (W95 vs W96) | `npm run seed:match-100` |
| Match 101 SF AT&T (W97 vs W98) | `npm run seed:match-101` |
| Match 102 SF Mercedes-Benz (W99 vs W100) | `npm run seed:match-102` |
| Match 88 R32 AT&T Stadium (Australia vs 2G) | `npm run seed:match-88` |
| Match 103 3rd Place Hard Rock (L101 vs L102) | `npm run seed:match-103` — **219 listings**, min viagogo **$2,129** → Frontrowly **$1,916** |
| World Cup Final (104) | `npm run seed:match-104` — **202 listings**, min viagogo **$10,172** → Frontrowly **$9,155** |

**Paste import:** save viagogo copy to `scripts/data/pastes/match-{n}.txt`, then run `node scripts/import-viagogo-match.mjs match-{n} scripts/data/pastes/match-{n}.txt` (or use the npm scripts above).

New matches: add paste file + run `scripts/import-viagogo-match.mjs`, or follow the NZ Belgium hand-crafted `.mjs` pattern.

## Live marketplace catalogue (30 matches)

Matches **63–66, 68, 80–104** are flagged as viagogo-live in `src/lib/marketing/viagogo-live.ts`. The site shows only these for World Cup browse (not all 104 FIFA fixtures).

**Intentionally excluded:** Match **67** and **69–79** (early group games — no marketplace inventory).

**All viagogo-live matches imported.** Re-run any `npm run seed:match-NN` after updating a paste file.

Update scarcity % when viagogo changes — edit `VIAGOGO_LIVE_MATCHES` in that file.

## Match images

Add hero art per match:

```
public/images/events/match-{number}.jpg
```

Examples: `match-64.jpg`, `match-104.jpg`. Until a file exists, cards show a **flag matchup** hero (unique per match).

Dedicated images today: `event-new-zealand-belgium.jpg`, `event-world-cup-final.jpg`.

## Site date (hide started matches)

Set in `.env.local`:

```
NEXT_PUBLIC_SITE_DATE=2026-07-01
```

Events whose kickoff has passed are hidden automatically. Remove the variable in production to use real time.

## Team flags

All 48 nations use [flagcdn.com](https://flagcdn.com) via `TeamFlag` — no manual logo files needed for flags. Federation crests can be added to `teams.logo_url` later.
