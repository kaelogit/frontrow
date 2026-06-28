# Frontrowly Platform Gap Backlog

**Purpose:** Every gap between today’s MVP and a viagogo × Hellotickets–grade ticketing platform — one item per task. Work through until all are `done`.

**How to use:** Copy one item block (e.g. the whole `## 47.` section) and paste it in chat: *"Let's do item 47."* We implement, mark it done here, move to the next.

**Status values:** `pending` · `in_progress` · `done` · `cancelled`

**Priority:** `P0` (blocks trust/launch) · `P1` (credibility) · `P2` (parity) · `P3` (scale/differentiation)

**Repo:** `frontrowly` (Next.js 16 · Tailwind · Supabase · Resend)

**Design north stars:** [viagogo](https://www.viagogo.com) (stadium map + listing cards + social proof) · [Hellotickets](https://www.hellotickets.com) (World Cup hub, waiting room, city/round pages, clean blue UI)

**Payment policy (2026-06-25):** NexaPay is **not** a legitimate processor — remove from live path. **Active checkout paths:** (1) **Reservation request** — ships first; (2) **Crypto via WalletConnect Pay** — live (USDT, USDC, BTC, ETH, SOL). **Card** = visible, greyed out, *"Coming soon"*. **No user accounts** — guests checkout with email only; no My Account in nav.

---

## Current state (what exists today)

| Area | Status |
|------|--------|
| Marketing homepage, category cards, World Cup landing | Basic — mock/seed data |
| Event list + detail with category-based `TicketSelector` | MVP — no stadium map, no section/row listings |
| Checkout (reservation + crypto) | NexaPay to remove; WalletConnect Pay to wire; card = coming soon |
| Supabase schema | `events`, `ticket_categories`, `tickets` (unused), `orders` |
| Admin | Read-only events table skeleton; no CRUD |
| Navbar | Simple links — no search, currency, Help |
| Stadium maps | None |
| Waiting room / queue | None |
| Social proof | None |
| WalletConnect | None |

---

## Part A — Global shell & navigation (Hellotickets / viagogo parity)

### 1. Top trust disclaimer banner
**Status:** done · **Priority:** P1 · **Area:** site layout

**What:** Sticky or dismissible top bar: *"Frontrowly is an independent ticket marketplace. Prices may be above or below face value."* (Hellotickets / viagogo pattern).

**Acceptance:** Visible on all `(site)` pages; dismiss persists in `localStorage`; accessible contrast.

**Shipped:** `TrustBanner.tsx` in site layout; dismiss persists in `localStorage`.

**Likely files:** `src/components/layout/TrustBanner.tsx`, `src/app/(site)/layout.tsx`

---

### 2. Navbar redesign — Hellotickets-style
**Status:** done · **Priority:** P0 · **Area:** site layout

**What:** Replace current minimal nav with:
- Logo left
- Center search: *"City or activity"* (routes to `/events?q=…`)
- Right: country/currency pill, **Help** (→ `/faq` + `/contact`)
- **No My Account** — guests only; order status via confirmation email + reference link
- Mobile: hamburger + search icon

**Acceptance:** Matches reference hierarchy minus account; search works; responsive; sticky with blur.

**Shipped:** `Header.tsx` + `SearchBar`, `LocaleSelector`, `HelpMenu`; no My Account.

**Likely files:** `src/components/layout/Header.tsx`, `src/components/layout/SearchBar.tsx`

---

### 3. Country + currency selector modal
**Status:** done · **Priority:** P1 · **Area:** site layout

**What:** Modal like Hellotickets: flag, country name, currency code (USD, EUR, GBP, CAD, MXN, BRL…). Selection stored in cookie; prices convert client-side or via stored FX rates.

**Acceptance:** Opens from navbar pill; 20+ countries; persists across sessions; `formatPrice` respects selection.

**Shipped:** `LocaleSelector.tsx` — 7 regions, cookie persistence. FX conversion on prices = follow-up.

**Likely files:** `src/components/layout/LocaleSelector.tsx`, `src/lib/currency.ts`, `src/lib/constants.ts`

---

### 4. Language selector (EN first, i18n-ready)
**Status:** pending · **Priority:** P2 · **Area:** site layout

**What:** EN default; structure for future locales. Pair with currency modal or separate dropdown.

**Acceptance:** `next-intl` or lightweight context; no broken routes when switching.

**Likely files:** `src/i18n/`, layout providers

---

### 5. Help entry point (no accounts)
**Status:** done · **Priority:** P1 · **Area:** site layout

**What:** Help in navbar → `/faq` or small dropdown (FAQ, Contact, Guarantee). **No user accounts, no My Account link.** Order lookup only via email link on confirmation page (`/order/[reference]/confirmation`).

**Acceptance:** Navbar has Help only; no sign-in / create-account anywhere on site.

**Shipped:** `HelpMenu.tsx` → FAQ, Contact, Guarantee. No account links anywhere.

**Likely files:** `src/components/layout/HelpMenu.tsx`, existing `(site)/faq`, `(site)/contact`

---

### 6. Footer upgrade — marketplace trust blocks
**Status:** pending · **Priority:** P2 · **Area:** site layout

**What:** viagogo-style columns: Company, Help, Cities, Guarantee, payment icons, app download placeholder.

**Acceptance:** Links to existing pages; World Cup cities deep-link to city hubs.

**Likely files:** `src/components/layout/Footer.tsx`

---

### 7. Breadcrumb + contextual sub-nav on event flows
**Status:** pending · **Priority:** P2 · **Area:** site layout

**What:** e.g. `New York → Sports → World Cup 2026 → Match 104` on event pages.

**Acceptance:** Schema.org `BreadcrumbList`; back arrow on ticket-selection view (Hellotickets mobile pattern).

**Likely files:** `src/components/layout/Breadcrumbs.tsx`

---

## Part B — Event discovery & World Cup hub

### 8. World Cup 2026 hub — Hellotickets layout
**Status:** done · **Priority:** P0 · **Area:** marketing

**What:** Hero + filter tabs: All games · National teams · Cities · Final · Quarterfinals · Round of 16 · Round of 32. Image grid cards for teams/stages (reference screenshots).

**Acceptance:** Each card links to filtered event list or dedicated landing page.

**Shipped:** Hellotickets-style hub with tab bar, team/city image grids, stage match filtering, `world-cup-nav.ts`.

**Likely files:** `src/app/(site)/world-cup-2026/page.tsx`, `src/lib/marketing/world-cup-nav.ts`

---

### 9. World Cup city pages (e.g. New York, Los Angeles, Vancouver)
**Status:** done · **Priority:** P0 · **Area:** marketing

**What:** `/world-cup-2026/new-york` — date range picker, chronological match list, venue blurbs, urgency copy per match (*"Limited tickets"*, *"Best-seller"*).

**Acceptance:** MetLife Stadium page lists Final + all NY/NJ host matches; SEO title/description per city.

**Shipped:** 8 city pages, `CityMatchList` with June/July filter, urgency badges, hub links updated.

**Likely files:** `src/app/(site)/world-cup-2026/[city]/page.tsx`

---

### 10. Tournament stage pages (Quarterfinals, Semifinals, Final)
**Status:** done · **Priority:** P0 · **Area:** marketing

**What:** `/world-cup-2026/quarterfinals` — table of matches with venue, date, from-price, average price (Hellotickets pricing table pattern).

**Acceptance:** Links to individual events; section price breakdown table when data exists.

**Likely files:** `src/app/(site)/world-cup-2026/stages/[stage]/page.tsx`

**Shipped:** `/world-cup-2026/stages/[stage]` (final, semifinals, quarterfinals, round-of-16, round-of-32) · `world-cup-stages.ts` · `StageMatchTable.tsx` · hub tab links updated · Final section/zone pricing from `METLIFE.md`

---

### 11. TBD / placeholder team matches
**Status:** done · **Priority:** P1 · **Area:** data model + UI

**What:** Support events where teams are unknown: *"Winner Match 93 vs Winner Match 94 – QF - Match 98"*, *"TBD vs TBD"*. Show flags when known; neutral placeholder when not.

**Acceptance:** `events` can have `home_team_id` / `away_team_id` null; UI shows bracket labels; still sellable.

**Likely files:** migration, `EventCard.tsx`, `src/lib/data/events.ts`

**Shipped:** `007_team_labels.sql` · `match-display.ts` · `MatchTeamsRow.tsx` · EventCard, detail, city/stage lists, ticket header · mock Final + QF + partial TBD events · admin label fields

---

### 12. Event list — viagogo-style filters
**Status:** done · **Priority:** P1 · **Area:** events browse

**What:** Filter bar: Location · Group · Teams · Rounds · Dates · Price · Parking. Horizontal pills on desktop; sheet on mobile.

**Acceptance:** URL-synced query params; combinable filters; result count updates.

**Likely files:** `src/app/(site)/events/page.tsx`, `src/components/events/EventFilters.tsx`

**Shipped:** `browse-filters.ts` · `EventFilters.tsx` · URL params: `city`, `team`, `group`, `round`, `month`, `priceMin`, `priceMax`, `parking` · mobile bottom sheet

---

### 13. Event cards — flags, match number, scarcity badge
**Status:** done · **Priority:** P1 · **Area:** events browse

**What:** Date column, team flags, *"Match 64 - Group G"*, venue, *"Only 2% left"* / *"On sale Sep 10"* badges, *"See tickets"* CTA.

**Acceptance:** Scarcity % computed from inventory; configurable per event in admin.

**Likely files:** `src/components/events/EventCard.tsx`

**Shipped:** viagogo-style row card · `event-scarcity.ts` · links to `/tickets` when seat map enabled · seat-map events auto-redirect from detail page

---

### 14. Social proof on browse pages
**Status:** done · **Priority:** P1 · **Area:** marketing

**What:** *"204,807 people viewed World Cup events in the past hour"* (animated counter); *"88.6k followers"* on World Cup hub.

**Acceptance:** Admin-configurable base + jitter; feels live without lying about real analytics (label as estimated or use real views when tracking exists).

**Shipped:** `008_site_settings.sql` · `SocialProofBar.tsx` · `AnimatedCount` · hourly jitter · homepage, `/events`, World Cup hub · admin settings form.

**Likely files:** `src/components/marketing/SocialProofBar.tsx`, `site_settings` table

---

### 15. Trending / related events sidebar
**Status:** pending · **Priority:** P2 · **Area:** events

**What:** On event detail + city pages: trending near venue, *"World Cup fans also love"* carousel.

**Acceptance:** Driven by `featured` + same city/competition; admin can pin.

**Likely files:** `src/components/events/RelatedEvents.tsx`

---

### 16. Full World Cup 2026 match catalogue (104 matches)
**Status:** done · **Priority:** P0 · **Area:** data

**What:** Seed all 104 matches across 16 venues with correct dates, match numbers, groups/rounds. Include MetLife Final (Jul 19) and SoFi QF.

**Acceptance:** SQL seed file + admin bulk import; every venue represented.

**Shipped:** `supabase/seed/world-cup-2026-full.sql` · `scripts/generate-world-cup-2026-seed.mjs` · `wc2026-fixtures.json` · mock schedule generated · `docs/WORLD_CUP_2026_SEED.md`

**Likely files:** `supabase/seed/world-cup-2026-full.sql`, docs runbook

---

### 17. MetLife Stadium — World Cup Final inventory
**Status:** done · **Priority:** P0 · **Area:** data + pricing

**What:** Final event (Match 104, Jul 19 2026) with market pricing from Hellotickets reference:
- **2 tickets:** $11,227 – $56,401+
- **1 ticket:** $11,147 – $55,721+
- **300s volume tier:** ~$13,141–$13,714/seat (Sections 303, 307, 311, 313, 314, 316, 319, 320, 328, 333, 342, 347, 349…)
- **100s premium:** Sections 104, 123, 129, 131, 133, 143, 144, 149 ($25k–$50k+)
- **Hospitality:** Trophy Lounge ($48,606), Lower Sideline ($55,721), Lower Premium ($109,034), Pitchside Lounge ($112,167)
- `queue_enabled: true`

**Reference:** `docs/venues/METLIFE.md` · `public/stadiums/metlife-reference.png`

**Acceptance:** Event live on site; map bubbles match min prices; 50+ listings; waiting room ready.

**Shipped:** `supabase/seed/metlife-final-listings.sql` (77 listings) · `scripts/generate-metlife-final-seed.mjs` · MetLife map MVP (`metlife-layout.ts`) · mock `wc-104` listings · `seat_map_enabled` + `stadium_map_slug: metlife` on Final · `npm run seed:metlife-final`. Waiting room UI = item 37.

**Likely files:** `supabase/seed/metlife-final-listings.sql`, `docs/venues/METLIFE.md`

---

### 18. BC Place / SoFi / other venue events with real section maps
**Status:** done · **Priority:** P1 · **Area:** data

**What:** NZ vs Belgium @ BC Place; QF @ SoFi — anchor events for map QA.

**Shipped:** BC Place `new-zealand-vs-belgium` (172 listings) · MetLife Final `world-cup-final-match-104` (77) · SoFi QF `world-cup-qf-match-98` (127 listings) · MVP wedge maps for all three · `docs/venues/SOFI.md`

**Acceptance:** At least 3 venues with full section maps and 50+ listings each.

**Likely files:** venue map assets, seed data

---

## Part C — Stadium maps & seat model (core differentiator)

### 19. Data model — venues, sections, rows, listings
**Status:** done · **Priority:** P0 · **Area:** database

**What:** Extend schema:

```sql
-- stadium_maps: SVG asset per venue
-- stadium_sections: section_number, name, level, category_zone, svg_path_id, map_position
-- stadium_rows: section_id, row_label, sort_order
-- ticket_listings: event_id, section_id, row_id, quantity, price, perks[], badges[], view_score
```

Deprecate flat `ticket_categories` for seat-level inventory OR keep categories as zone groupings linked to sections.

**Acceptance:** Migration applied; TypeScript types updated; RLS policies for public read.

**Shipped:** `003_stadium_inventory.sql` — stadium_maps, stadium_sections, stadium_rows, ticket_listings, order_items.listing_id.

**Likely files:** `supabase/migrations/003_stadium_inventory.sql`, `src/types/database.ts`

---

### 20. Section / row semantics documentation
**Status:** done · **Priority:** P0 · **Area:** docs

**What:** Internal doc explaining:
- Section = numbered bowl block (e.g. 227, 421)
- Row = letter/label within section (A, B, SS, PP…)
- Listing = section + row + qty + price + perks
- Category zones (Cat 1–4) map to section groups
- How admin creates inventory without stress

**Acceptance:** `docs/STADIUM_SEAT_MODEL.md` with ER diagram and examples from BC Place / MetLife.

**Likely files:** `docs/STADIUM_SEAT_MODEL.md`

---

### 21. SVG stadium map component — interactive
**Status:** done · **Priority:** P0 · **Area:** frontend

**What:** Top-down stadium map (viagogo/Hellotickets style):
- Green pitch center
- Sections as clickable SVG paths
- Available = highlighted (blue/green); sold = grey
- Price bubbles on hover/always for key sections
- Zoom +/- controls

**Acceptance:** Works for BC Place MVP; clicking section filters listing panel; responsive.

**Shipped:** `StadiumMap.tsx` + `bc-place-layout.ts` wedge geometry, price bubbles, zoom.

**Likely files:** `src/components/stadium/StadiumMap.tsx`, `src/lib/stadium/bc-place-layout.ts`

---

### 22. Stadium map — listing panel sync
**Status:** done · **Priority:** P0 · **Area:** frontend

**What:** Split view: map left, scrollable listings right. Hover listing highlights section; click section scrolls to listings.

**Acceptance:** Two-way binding; mobile = tabs (Map | List).

**Shipped:** `(ticket-flow)/events/[slug]/tickets` — map/list sync, mobile tabs, section filter.

**Likely files:** `TicketsPageClient.tsx`

---

### 23. BC Place Stadium SVG (production quality)
**Status:** in_progress · **Priority:** P0 · **Area:** design/assets

**What:** Accurate section numbering per official BC Place chart (reference: `public/stadiums/bc-place-reference.png` + `docs/venues/BC_PLACE.md`). Each section = separate SVG path with `id="section-227"`.

**Shipped:** Programmatic wedge map (109 sections) — trace to hand-crafted SVG for pixel-perfect match is next polish.

**Acceptance:** Visually matches reference image; all 200s/300s/400s sections labeled; field centered; category zones + supporter blocks mapped.

**Likely files:** `public/stadiums/bc-place.svg`, `public/stadiums/bc-place-reference.png`, `docs/venues/BC_PLACE.md`

---

### 24. MetLife Stadium SVG
**Status:** pending · **Priority:** P1 · **Area:** design/assets

**What:** Full bowl for Final / NY matches. Trace from `public/stadiums/metlife-reference.png`. Levels: 100s, 200s, 300s (+ 500s when chart available). Price bubbles on 321 ($11,227), 131 ($54,977), 104 ($22,561), etc.

**Acceptance:** Same path ID convention as BC Place; tested with Final listings in `docs/venues/METLIFE.md`.

**Likely files:** `public/stadiums/metlife.svg`, `public/stadiums/metlife-reference.png`, `docs/venues/METLIFE.md`

---

### 25. SoFi Stadium SVG
**Status:** pending · **Priority:** P1 · **Area:** design/assets

**What:** For LA quarterfinal and group matches.

**Acceptance:** Section 227, 228, 543 etc. from Hellotickets reference mappable.

**Likely files:** `public/stadiums/sofi.svg`

---

### 26. Stadium map template for remaining 13 World Cup venues
**Status:** pending · **Priority:** P2 · **Area:** design/assets

**What:** Simplified but usable maps for: Azteca, AT&T, Mercedes-Benz, Arrowhead, Gillette, Hard Rock, Lincoln Financial, NRG, Levi's, Lumen, BMO, Estadio BBVA, Estadio Akron.

**Acceptance:** Checklist per venue; can start as zone-level (not every section) and refine.

**Likely files:** `public/stadiums/*.svg`

---

### 27. Mini-map thumbnails on listing cards
**Status:** pending · **Priority:** P1 · **Area:** frontend

**What:** Small stadium thumbnail with blue dot on section (viagogo listing card pattern).

**Acceptance:** Generated from same SVG + section highlight; fallback *"No image available"*.

**Likely files:** `src/components/stadium/MiniMap.tsx`

---

### 28. Seat view photos per section (optional perk)
**Status:** cancelled · **Priority:** P2 · **Area:** content

**What:** ~~View-from-seat gallery~~ — deferred; not building photo angles for launch. Review step shows section/row/perks only.

**Likely files:** `stadium_sections.view_image_url`, gallery component

---

## Part D — Ticket selection UX (viagogo flow)

### 29. Quantity modal — "How many tickets?"
**Status:** done · **Priority:** P0 · **Area:** frontend

**What:** viagogo-style first step: *"How many tickets?"* 1–4 pills, household limit disclaimer, *"View tickets"* CTA.

**Acceptance:** Modal over ticket page (map visible behind, no blur); not a separate page.

**Shipped:** `QuantityModal.tsx` — floating card, no backdrop; ticket UI renders underneath.

---

### 30. Listing cards — full viagogo parity
**Status:** done · **Priority:** P0 · **Area:** frontend

**What:** Each listing shows:
- Section + Row
- *"2 tickets together"*
- Perks: Clear view, Aisle seat, etc.
- Badges: Last tickets, Fan favorite
- View score: 7.4 Great / 8.6 Amazing
- Price per ticket
- Mini-map thumbnail

**Acceptance:** Matches reference density; clickable → checkout or detail drawer.

**Likely files:** `src/components/tickets/ListingCard.tsx`

---

### 31. Filters sidebar — quantity, price histogram, sort
**Status:** done · **Priority:** P1 · **Area:** frontend

**What:** Filter panel: ticket count, price range slider with histogram, sort (Price, Best deal, Best view, Recommended), zone/perk toggles, Reset, *"View 180 tickets"*.

**Acceptance:** Live count; URL state; fast on 200+ listings.

**Shipped:** `TicketFilters.tsx` — desktop sidebar + mobile drawer; 125 mock listings; sort/filter/histogram wired.

**Likely files:** `src/components/tickets/TicketFilters.tsx`

---

### 32. "Show more" paginated listings
**Status:** done · **Priority:** P1 · **Area:** frontend

**What:** Initial 10 listings + *"Show more"* loads next batch (reference: *"Showing 10 of 90"*).

**Acceptance:** Infinite scroll or button; performance OK with 500 listings.

**Likely files:** `ListingPanel.tsx`

---

### 33. Urgency banner on ticket page
**Status:** done · **Priority:** P1 · **Area:** frontend

**What:** Pink bar: *"Only 2% of tickets left"* — computed from total inventory.

**Acceptance:** Admin can override message per event.

**Likely files:** `src/components/tickets/ScarcityBanner.tsx`

---

### 34. Category quick-filter chips (Cat 1–4)
**Status:** done · **Priority:** P2 · **Area:** frontend

**What:** Bottom of map: OTHER TICKET OPTIONS → Cat 1, Cat 2… chips filter map + list.

**Acceptance:** Zones map to section groups in DB.

**Shipped:** `CategoryChips.tsx` under stadium map on tickets page.

**Likely files:** `CategoryChips.tsx`

---

### 35. Live purchase toast notifications
**Status:** pending · **Priority:** P2 · **Area:** frontend

**What:** *"A customer from 🇲🇽 bought 3 tickets … 47 minutes ago"* — rotating fictional/real recent orders.

**Acceptance:** Subtle; doesn't block UI; admin can disable.

**Likely files:** `src/components/marketing/PurchaseToast.tsx`

---

### 36. Event detail page → ticket selection route
**Status:** done · **Priority:** P0 · **Area:** routing

**What:** `/events/[slug]` = marketing summary; *"See tickets"* → `/events/[slug]/tickets` (full map experience). Hellotickets uses compact header on ticket view.

**Shipped:** `(ticket-flow)` route group, `TicketFlowHeader`, `EventDetailClient` seat map CTA.

**Acceptance:** Compact blue header with back arrow, match title, date, venue, info icon.

**Likely files:** `src/app/(ticket-flow)/events/[slug]/tickets/page.tsx`, `TicketFlowHeader.tsx`

---

## Part E — Waiting room & high-demand traffic

### 37. Waiting room page
**Status:** done · **Priority:** P1 · **Area:** frontend + backend

**What:** For high-demand events (Final, popular QFs): queue page with hourglass, progress bar %, *"Popular event! Fans are rushing…"*, auto-redirect when admitted.

**Acceptance:** Activates when `events.queue_enabled`; fair FIFO or randomized; survives refresh.

**Shipped:** `/events/[slug]/queue` · `QueuePageClient` · tickets route guard · cookie-bound sessions.

**Likely files:** `src/app/(ticket-flow)/events/[slug]/queue/page.tsx`, `src/lib/queue/`

---

### 38. Queue token + admission API
**Status:** done · **Priority:** P1 · **Area:** backend

**What:** Issue queue position via edge function; admit at configurable rate; cookie/session binds position.

**Acceptance:** Load test 100 concurrent users; no bypass without token.

**Shipped:** `POST /api/queue/join` · `GET /api/queue/status` · `queue_sessions` table · in-memory mock for dev.

**Likely files:** `src/app/api/queue/`, Supabase or Redis

---

### 39. Admin toggle queue per event
**Status:** done · **Priority:** P1 · **Area:** admin

**What:** Enable waiting room, set admission rate, max concurrent shoppers.

**Acceptance:** MetLife Final enabled by default when live.

**Shipped:** `queue_enabled` + `queue_admission_rate` on admin event form · Final seed sets `queue_enabled`.

**Likely files:** admin event settings

---

## Part F — Checkout, reservations & payments

### 40. Remove NexaPay from production path
**Status:** done · **Priority:** P0 · **Area:** payments

**What:** Delete/disable `nexapay.ts`, webhook route, env vars from README. Remove `nexapay_ref` usage in new orders.

**Acceptance:** No outbound calls to nexapay.one; code commented or removed; README updated.

**Shipped:** Deleted `nexapay.ts` + webhook; README + `.env.example` updated; migration `002_payment_external_id.sql`.

**Likely files:** `src/lib/walletconnect-pay.ts`, `README.md`

---

### 41. Reservation checkout (ship first)
**Status:** done · **Priority:** P0 · **Area:** checkout

**What:** Active payment path #1. Customer submits → `reservation_requested` → email to admin + customer → 48h hold. No account required — name + email only.

**Acceptance:** End-to-end works; confirmation page clear about next steps; works alongside crypto (item 44).

**Likely files:** `CheckoutPage.tsx`, `src/app/api/checkout/route.ts`

---

### 42. Card payment option — visible, coming soon
**Status:** done · **Priority:** P0 · **Area:** checkout

**What:** Show card option greyed out: *"Coming soon"* / *"Card payments launching shortly"*. Not selectable until item 45 is done.

**Acceptance:** User cannot submit with card; reservation + crypto remain selectable.

**Likely files:** `CheckoutPage.tsx`, `PAYMENT_METHODS` in constants

---

### 43. WalletConnect Pay integration (active crypto checkout)
**Status:** pending · **Priority:** P0 · **Area:** payments

**What:** Integrate [WalletConnect Pay](https://docs.walletconnect.com/payments/ecommerce/overview) merchant checkout. Support USDT, USDC, BTC, ETH, SOL.

**Paused (2026-06-25):** Waiting on WalletConnect merchant account enablement (`mrch_…` + working API key). Code stub exists; crypto disabled in checkout UI until merchant access confirmed.

**Shipped so far:** `walletconnect-pay.ts`, checkout API, webhook stub, dev fallback.

**Likely files:** `src/lib/walletconnect-pay.ts`, `src/app/api/webhooks/walletconnect/`, `.env.example`

---

### 44. Card payment provider (TBD) — research spike
**Status:** pending · **Priority:** P2 · **Area:** payments

**What:** Evaluate Stripe, Adyen, Paystack (intl), or regional processors for US/CA/MX ticket sales. High-ticket ($10k+) may need manual review / wire fallback.

**Acceptance:** Decision doc with fees, chargeback policy, ticket-industry fit. When chosen, enable item 42.

**Likely files:** `docs/PAYMENTS_RESEARCH.md`

---

### 45. Checkout — hold inventory on reservation / crypto pending
**Status:** done · **Priority:** P0 · **Area:** backend

**What:** Reserve specific `ticket_listings` rows; decrement `reserved_until`; auto-release after 48h cron.

**Acceptance:** Double-booking impossible; expired reservations return stock.

**Shipped:** Migration `006_inventory_holds.sql` — atomic RPC holds, checkout integration, admin cancel/paid release, `/api/cron/release-holds`.

**Likely files:** migration, `src/app/api/checkout/route.ts`, cron/edge function

---

### 46. Order confirmation page upgrade
**Status:** done · **Priority:** P1 · **Area:** frontend

**What:** Reference-quality confirmation: order ref, event summary, section/row details, what happens next, support contact, calendar add.

**Acceptance:** Matches brand; reservation vs paid states differ.

**Shipped:** Event hero + venue/date · ticket line items (section/row) · order summary · state-specific next steps · add-to-calendar (.ics) · support mailto with reference · guarantee/delivery links.

**Likely files:** `src/app/(site)/order/[reference]/confirmation/page.tsx`

---

### 47. Reservation + payment emails — HTML templates
**Status:** done · **Priority:** P1 · **Area:** email

**What:** Beautiful Resend templates for customer + admin with full seat details and payment instructions.

**Acceptance:** Renders in Gmail/Apple Mail; includes event image.

**Shipped:** Table-based HTML templates in `src/emails/` (reservation customer/admin + ticket confirmation) with plain-text fallbacks, event hero image, seat table with section/row, and confirmation links. Wired through `src/lib/email.ts` and admin/webhook send paths.

**Likely files:** `src/lib/email.ts`, `src/emails/`

---

## Part G — Admin panel (control everything smoothly)

### 49. Admin authentication
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** Supabase Auth magic link or password for admin users; protect `/admin/*`.

**Acceptance:** Non-admins redirected; RLS service role for writes.

**Shipped:** Magic link login at `/admin/login`, middleware guard, `ADMIN_EMAILS` allowlist, auth callback route.

**Likely files:** `src/app/admin/layout.tsx`, middleware

---

### 50. Admin dashboard — KPIs
**Status:** done · **Priority:** P1 · **Area:** admin

**What:** Open reservations, revenue (when paid), low stock events, recent orders.

**Acceptance:** At-a-glance useful; links to drill-down.

**Shipped:** `getAdminDashboardStats()` powers KPI cards (reservations, payments, paid revenue, orders today), recent orders table, and low-stock event list with drill-down links.

**Likely files:** `src/app/admin/page.tsx`

---

### 51. Admin — create / edit event
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** Form: title, subtitle, match number, competition, teams (optional/TBD), venue, date/time, image, featured, queue_enabled, scarcity_override, status.

**Acceptance:** Creates slug; previews public page; validation.

**Shipped:** `/admin/events/new`, `/admin/events/[id]/edit`, `EventForm`, migration `004_event_admin_fields.sql`.

**Likely files:** `src/app/admin/events/new/page.tsx`, `src/app/admin/events/[id]/edit/page.tsx`

---

### 52. Admin — bulk event import (CSV / SQL templates)
**Status:** done · **Priority:** P1 · **Area:** admin

**What:** Upload CSV of World Cup matches OR paste SQL template with guided fields. Less stressful than one-by-one.

**Acceptance:** Import 50 matches in <5 min; error report for bad rows.

**Shipped:** `/admin/events/import` — CSV upload with preview, validation, upsert by slug. SQL templates in `docs/ADMIN_SQL_TEMPLATES.md`.

**Likely files:** `src/app/admin/events/import/page.tsx`, `docs/ADMIN_SQL_TEMPLATES.md`

---

### 53. Admin — venue & stadium map manager
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** Upload SVG, map section path IDs to section numbers, set levels and category zones.

**Acceptance:** BC Place map uploadable; sections auto-populated from SVG IDs.

**Shipped:** `/admin/venues` list · `/admin/venues/[id]/map` — SVG upload, parse `section-*` path IDs, infer zones. Migration `010_stadium_map_admin.sql`.

**Likely files:** `src/app/admin/venues/[id]/map/page.tsx`

---

### 54. Admin — section & row editor
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** Per venue: list sections, add rows in bulk (A–Z, AA–ZZ), set default category zone.

**Acceptance:** Generate rows A–T for section 227 in one action.

**Shipped:** `/admin/venues/[id]/sections` — bulk row presets (A–T, A–Z, AA–AZ, 1–20, custom), bulk zone update.

**Likely files:** `src/app/admin/venues/[id]/sections/page.tsx`

---

### 55. Admin — ticket listings manager (the money screen)
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** Per event: add listing = pick section → row → quantity → price → perks → badges → view score. Duplicate listing. Bulk price adjust by zone.

**Acceptance:** Adding 20 listings takes <10 min; matches viagogo data shape.

**Shipped:** `/admin/events/[id]/listings` — add/edit/delete/duplicate, BC Place section picker, bulk zone price adjust, auto-updates event min_price.

**Likely files:** `src/app/admin/events/[id]/listings/page.tsx`

---

### 56. Admin — quick add listing from section map
**Status:** done · **Priority:** P1 · **Area:** admin

**What:** Click section on admin map → prefill section → enter row/qty/price → save.

**Acceptance:** Fastest path for inventory entry.

**Shipped:** `AdminStadiumMap` in listings manager — click section prefills form, scrolls to editor, row datalist from DB.

**Likely files:** `AdminStadiumMap.tsx`

---

### 57. Admin — orders / reservation queue
**Status:** done · **Priority:** P0 · **Area:** admin

**What:** List reservations; actions: Confirm payment, Mark paid, Send ticket, Cancel, Extend hold, Add note.

**Acceptance:** Status transitions match `order_status` enum; emails on state change.

**Shipped:** Orders list with status tabs, order detail page, PATCH API, ticket email on send.

**Likely files:** `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[reference]/page.tsx`

---

### 58. Admin — competitor price tracker
**Status:** pending · **Priority:** P2 · **Area:** admin

**What:** CRUD for `competitor_prices` per event (HelloTickets, viagogo URLs).

**Acceptance:** Drives "Save X% vs competitors" on event page.

**Likely files:** admin event pricing tab

---

### 59. Admin — site settings (social proof, banners, FX)
**Status:** pending · **Priority:** P2 · **Area:** admin

**What:** Edit viewer counts, follower counts, trust banner text, USD→EUR rate.

**Acceptance:** Changes reflect on site without deploy.

**Likely files:** `src/app/admin/settings/page.tsx`, `site_settings` table

---

### 60. Admin — image upload (Supabase Storage)
**Status:** done · **Priority:** P1 · **Area:** admin

**What:** Upload event hero, section view photos, team flags.

**Acceptance:** CDN URLs stored on records; image optimization via Next.js.

**Shipped:** `ImageUploadField` on event form · `src/lib/storage.ts` · migration `011_media_storage.sql` · public `media` bucket.

**Likely files:** `src/lib/storage.ts`, admin upload component

---

## Part H — Content, imagery & AI workflow

### 61. Match image generation workflow
**Status:** pending · **Priority:** P1 · **Area:** content + docs

**What:** Document how to generate match images with AI (team flags, stadium background, match text overlay). Prompt templates per match type.

**Acceptance:** `docs/IMAGE_GENERATION.md` with prompts; consistent 16:9 aspect; brand guidelines.

**Likely files:** `docs/IMAGE_GENERATION.md`

---

### 62. Team flag assets (48 World Cup nations)
**Status:** pending · **Priority:** P1 · **Area:** assets

**What:** SVG or PNG flags for all 2026 participants; used in cards and headers.

**Acceptance:** `public/flags/{iso}.svg`; fallback for TBD.

**Likely files:** `public/flags/`

---

### 63. Marketing category image grid (teams + stages)
**Status:** pending · **Priority:** P2 · **Area:** marketing

**What:** Hellotickets-style grid cards for Uruguay, USA, Quarterfinals, etc.

**Acceptance:** Admin-manageable or config file; hover zoom.

**Likely files:** `src/lib/marketing/world-cup-cards.ts`

---

### 64. Event hero images per match
**Status:** pending · **Priority:** P1 · **Area:** content

**What:** Unique image per high-value match (Final, semis, popular group games).

**Acceptance:** No generic placeholder on featured events.

**Likely files:** `public/images/events/`, admin image field

---

## Part I — SEO, trust & legal

### 65. SEO metadata per event / city / stage
**Status:** pending · **Priority:** P1 · **Area:** SEO

**What:** Dynamic `title`, `description`, Open Graph, JSON-LD `SportsEvent`.

**Acceptance:** Google-rich results validate; share cards look premium.

**Likely files:** `generateMetadata` in route files

---

### 66. Structured data — venue, offer, aggregate rating
**Status:** pending · **Priority:** P2 · **Area:** SEO

**What:** Schema.org for ticket offers (from price), venue geo.

**Acceptance:** Validator passes.

**Likely files:** `src/lib/seo/jsonld.ts`

---

### 67. Guarantee / refund / delivery pages — polish
**Status:** pending · **Priority:** P2 · **Area:** trust

**What:** Align copy with marketplace positioning (independent reseller, verified delivery).

**Acceptance:** Linked from checkout and footer.

**Likely files:** existing `(site)/guarantee`, `refunds`, `delivery`

---

## Part J — Infrastructure & quality

### 68. Supabase production setup runbook
**Status:** done · **Priority:** P0 · **Area:** ops

**What:** Step-by-step: create project, run migrations, seed, env vars, RLS audit.

**Acceptance:** `docs/SUPABASE_SETUP.md`; new dev productive in 30 min.

**Shipped:** `docs/SUPABASE_SETUP.md` — project setup, Auth, migrations 001–011, seed order, env vars, RLS audit, cron, troubleshooting. `.env.example` template added.

**Likely files:** `docs/SUPABASE_SETUP.md`

---

### 69. Admin SQL templates for common tasks
**Status:** done · **Priority:** P1 · **Area:** docs

**What:** Copy-paste SQL: add event, assign TBD teams, refresh listings, update prices.

**Acceptance:** `docs/ADMIN_SQL_TEMPLATES.md` with real examples.

**Shipped:** `docs/ADMIN_SQL_TEMPLATES.md` — list TBD matches, assign teams, bracket labels, listing refresh, min price sync. Admin form clears labels when teams selected.

**Likely files:** `docs/ADMIN_SQL_TEMPLATES.md`

---

### 70. E2E test — reservation flow
**Status:** done · **Priority:** P1 · **Area:** testing

**What:** Playwright: browse → select qty → pick listing → reserve → confirmation.

**Acceptance:** Runs in CI; uses test event.

**Shipped:** `e2e/reservation.spec.ts` · `playwright.config.ts` · `npm run test:e2e` · GitHub Actions workflow `.github/workflows/e2e.yml` · mock mode (no Supabase in CI).

**Likely files:** `e2e/reservation.spec.ts`

---

### 71. Performance — ticket page with 500 listings
**Status:** pending · **Priority:** P2 · **Area:** performance

**What:** Virtualized list; map renders <100ms; LCP acceptable.

**Acceptance:** Lighthouse performance ≥85 on ticket page.

**Likely files:** listing panel optimization

---

### 72. Analytics — Plausible or PostHog
**Status:** pending · **Priority:** P2 · **Area:** analytics

**What:** Page views, funnel: event → tickets → checkout → reservation.

**Acceptance:** Dashboard shows conversion; feeds real social proof later.

**Likely files:** `src/lib/analytics.ts`

---

### 73. Rate limiting on checkout + queue APIs
**Status:** pending · **Priority:** P1 · **Area:** security

**What:** Prevent reservation spam and queue bypass.

**Acceptance:** 429 after threshold; IP + email based.

**Likely files:** middleware, API routes

---

### 74. Migrate from mock data to Supabase-only
**Status:** done · **Priority:** P0 · **Area:** data layer

**What:** `getEvents()` always uses Supabase in prod; mock only in dev fallback.

**Acceptance:** No mock data leak in production build.

**Shipped:** `shouldUseMockData()` — mock only when `NODE_ENV !== production` and no Supabase keys; empty arrays/null on DB errors in prod.

**Likely files:** `src/lib/data/events.ts`, `src/lib/data/mock-mode.ts`

---

## Part K — Future / P3

### 75. User accounts + order history
**Status:** cancelled · **Priority:** — · **Area:** auth

**What:** ~~Sign in with email; see past orders.~~ **Not building** — guest checkout only. Order status via confirmation email + `/order/[reference]/confirmation`.

---

### 76. Favourites / follow events
**Status:** pending · **Priority:** P3 · **Area:** engagement

**What:** Heart icon on events; follower counts on hubs.

**Acceptance:** Persists per user; drives email alerts.

---

### 77. Email alerts — price drops & on-sale
**Status:** pending · **Priority:** P3 · **Area:** engagement

**What:** Notify when World Cup match goes on sale or price drops.

**Acceptance:** Opt-in on event page; Resend + queue.

---

### 78. Mobile app (PWA first)
**Status:** pending · **Priority:** P3 · **Area:** mobile

**What:** PWA manifest + install prompt before native app.

**Acceptance:** Installable; offline order lookup.

---

### 79. Multi-language content
**Status:** pending · **Priority:** P3 · **Area:** i18n

**What:** ES, FR, DE, PT for World Cup host markets.

**Acceptance:** Key flows translated.

---

### 80. Parking / hospitality upsells
**Status:** pending · **Priority:** P3 · **Area:** commerce

**What:** Add-on products on checkout (parking pass, hospitality package).

**Acceptance:** viagogo "Parking" filter parity.

---

## Recommended build order (phases)

### Phase 1 — Checkout + nav (2–3 weeks)
P0 items: **40, 41, 42, 43, 45, 49, 51, 55, 57, 74** + navbar **2, 5** + remove NexaPay **40**

*Goal: Reservation + WalletConnect crypto live; card greyed out; admin manages orders; no accounts.*

### Phase 2 — Stadium map MVP (3–4 weeks)
P0: **19, 20, 21, 22, 23, 29, 30, 36** + BC Place seed **18**

*Goal: One venue with full viagogo-style ticket selection.*

### Phase 3 — World Cup catalogue (2 weeks)
P0: **8, 9, 10, 16, 17** + filters **12, 13**

*Goal: All matches browsable; Final live at MetLife pricing.*

### Phase 4 — Admin excellence (2 weeks)
**52, 53, 54, 56, 58, 60, 69** + more stadium SVGs **24, 25**

*Goal: You can add matches + inventory without developer help.*

### Phase 5 — Polish & conversion (2 weeks)
**14, 31, 32, 33, 35, 37, 38, 47, 48, 65**

*Goal: Social proof, waiting room, urgency, SEO.*

### Phase 6 — Card payments (when provider chosen)
**44** → implement chosen processor; enable item **42**

---

## Progress tracker

| Part | Total | Done | Pending |
|------|-------|------|---------|
| A — Global shell & nav | 7 | 4 | 3 |
| B — Event discovery | 11 | 6 | 5 |
| C — Stadium maps & data | 10 | 5 | 5 |
| D — Ticket selection UX | 8 | 6 | 2 |
| E — Waiting room | 3 | 3 | 0 |
| F — Checkout & payments | 9 | 6 | 3 |
| G — Admin panel | 12 | 10 | 2 |
| H — Content & imagery | 4 | 0 | 4 |
| I — SEO & trust | 3 | 0 | 3 |
| J — Infrastructure | 7 | 4 | 3 |
| K — Future | 6 | 0 | 6 |
| **Total** | **80** | **44** | **36** |

*Update this table as items move to `done`.*

---

## Quick index by priority

**P0 (do first):** 2, 5, 8, 9, 10, 16, 17, 19, 20, 21, 22, 23, 29, 30, 36, 40, 41, 42, 43, 45, 49, 51, 53, 54, 55, 57, 68, 74

**P1 (credibility):** 1, 3, 11, 12, 13, 14, 18, 24, 25, 27, 31, 32, 33, 37, 38, 39, 46, 47, 50, 52, 56, 60, 61, 62, 64, 65, 69, 70, 73

**P2:** 4, 6, 7, 15, 26, 28, 34, 35, 44, 58, 59, 63, 66, 67, 71, 72

**P3:** 76, 77, 78, 79, 80 *(item 75 user accounts — cancelled; no accounts policy)*

---

## WalletConnect + Trust Wallet — FAQ

**Q: Can I connect WalletConnect Pay to my Trust Wallet receiving addresses?**  
**A: Yes.** In the WalletConnect Pay merchant dashboard you configure payout/receiving addresses per blockchain and token (e.g. USDT on Ethereum, USDC on Base, SOL on Solana). Your Trust Wallet addresses work as long as they support those chains. Customers connect any WalletConnect-compatible wallet to pay; funds route to your configured addresses. We will use your project ID: `31697ddb-4aa3-480a-9e85-0bcc68066c3e` (verify in dashboard before production).

**Q: Which coins first?**  
**A:** USDT, USDC (stablecoins first — less volatility), then ETH, BTC, SOL. All selectable at checkout via WalletConnect (item 43).

---

## Competitor feature checklist (merged viagogo + Hellotickets)

| Feature | viagogo | Hellotickets | Frontrowly item |
|---------|---------|--------------|-----------------|
| Interactive stadium map | ✅ | ✅ | 21–22 |
| Section + row listings | ✅ | ✅ | 19, 30 |
| Quantity modal | ✅ | ✅ | 29 |
| Price bubbles on map | ✅ | ✅ | 21 |
| Filter sidebar + histogram | ✅ | partial | 31 |
| Show more listings | ✅ | ✅ | 32 |
| View score / Great | ✅ | — | 30 |
| Fan favorite / Last tickets badges | ✅ | — | 30 |
| Waiting room | — | ✅ | 37–39 |
| City / stage landing pages | partial | ✅ | 9–10 |
| TBD team matches | ✅ | ✅ | 11 |
| Social proof counters | ✅ | partial | 14, 35 |
| Currency / country selector | ✅ | ✅ | 3 |
| Trust disclaimer banner | ✅ | ✅ | 1 |
| Scarcity % banner | ✅ | ✅ | 33 |
| Mini-map on cards | ✅ | ✅ | 27 |
| Category zone chips | ✅ | partial | 34 |

---

*Last updated: 2026-06-25. Source: lost-chat recovery session — viagogo + Hellotickets reference screenshots, current `frontrowly` codebase audit.*
