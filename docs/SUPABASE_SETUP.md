# Supabase production setup runbook

Step-by-step guide to connect Frontrowly to Supabase for local development and production. A new developer should be productive in **~30 minutes**.

**Related docs:** [World Cup seed](./WORLD_CUP_2026_SEED.md) · [Admin SQL templates](./ADMIN_SQL_TEMPLATES.md) · [Stadium seat model](./STADIUM_SEAT_MODEL.md)

---

## Overview

| Layer | What Supabase provides |
|-------|------------------------|
| **Database** | Events, venues, stadium sections/rows, ticket listings, orders, queue sessions |
| **Auth** | Magic-link sign-in for `/admin` (email allowlist in env) |
| **Storage** | Public `media` bucket for admin-uploaded hero images |
| **Writes** | All mutations go through Next.js server actions/API routes using the **service role** key — never exposed to the browser |

Production **never** serves mock data. If Supabase keys are missing in production, catalogue pages show empty results rather than fake inventory.

---

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose a region close to your users (e.g. `us-east-1` for US traffic)
3. Save the database password somewhere secure
4. Wait for the project to finish provisioning

### Collect API keys

**Project Settings → API**

| Key | Env var | Where it goes |
|-----|---------|---------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Browser + server |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server (RLS-bound) |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — Vercel/hosting env, never commit |

---

## 2. Configure Auth (admin magic link)

Frontrowly admin uses **email OTP / magic link** — no passwords.

### Supabase dashboard

**Authentication → Providers → Email**

- Enable Email provider
- Confirm email can be disabled for internal admin use (optional)

**Authentication → URL Configuration**

| Setting | Local | Production |
|---------|-------|------------|
| Site URL | `http://localhost:3000` | `https://frontrowly.com` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://frontrowly.com/auth/callback` |

Add both local and production URLs if you use one Supabase project for dev + prod. For production-only projects, production URLs alone are fine.

### Admin allowlist

Set in your hosting env (comma-separated):

```
ADMIN_EMAILS=you@frontrowly.com,ops@frontrowly.com
```

Fallback: `ADMIN_EMAIL` (single address). Only emails in this list can access `/admin/*` after sign-in.

---

## 3. Run migrations

Run every file in `supabase/migrations/` **in numeric order** in the Supabase **SQL Editor** (or via Supabase CLI `supabase db push` if you link the project).

| # | File | What it adds |
|---|------|--------------|
| 001 | `001_initial_schema.sql` | Core tables, enums, public-read RLS on catalogue |
| 002 | `002_payment_external_id.sql` | `payment_external_id` on orders |
| 003 | `003_stadium_inventory.sql` | Stadium maps, sections, rows, ticket listings |
| 004 | `004_event_admin_fields.sql` | Admin event fields (match number, queue, scarcity, etc.) |
| 005 | `005_compare_at_price.sql` | Compare-at pricing on listings |
| 006 | `006_inventory_holds.sql` | Hold RPCs, 48h reservation expiry |
| 007 | `007_team_labels.sql` | TBD/bracket team labels on events |
| 008 | `008_site_settings.sql` | Social proof settings table |
| 009 | `009_queue_sessions.sql` | Waiting-room queue sessions |
| 010 | `010_stadium_map_admin.sql` | SVG content + `updated_at` on stadium maps |
| 011 | `011_media_storage.sql` | Public `media` storage bucket |

### Quick verify

After migrations, run in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see at least: `competitions`, `events`, `inventory_holds`, `order_items`, `orders`, `queue_sessions`, `site_settings`, `stadium_maps`, `stadium_rows`, `stadium_sections`, `teams`, `ticket_categories`, `ticket_listings`, `venues`.

---

## 4. Seed data

Seeds are idempotent (`ON CONFLICT DO NOTHING` / upserts where noted). Safe to re-run.

### Recommended order

| Step | File | Purpose |
|------|------|---------|
| 1 | `supabase/seed.sql` | Competitions, sample teams/venues, demo events |
| 2 | `supabase/seed/world-cup-2026-full.sql` | All 104 World Cup matches |
| 3 | `supabase/seed/new-zealand-vs-belgium-full.sql` | BC Place anchor event + listings |
| 4 | `supabase/seed/metlife-final-listings.sql` | World Cup Final (Match 104) + MetLife inventory |
| 5 | `supabase/seed/sofi-qf-listings.sql` | SoFi quarterfinal (Match 98) + listings |

Additional per-match listing seeds live in `supabase/seed/world-cup-match-*-full.sql`. Import via SQL Editor or `npm run seed:match-XX` scripts — see [WORLD_CUP_2026_SEED.md](./WORLD_CUP_2026_SEED.md).

### Anchor events to smoke-test

| Slug | Feature to test |
|------|-----------------|
| `new-zealand-vs-belgium` | BC Place stadium map + listings |
| `world-cup-qf-match-98` | SoFi map, 127 listings |
| `world-cup-final-match-104` | MetLife map, waiting room (`queue_enabled`) |

---

## 5. Environment variables

Copy the template and fill in values:

```bash
cp .env.example .env.local
```

### Required for production catalogue + admin

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=https://frontrowly.com

# Google Analytics 4 (optional — page views when set)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

ADMIN_EMAILS=you@frontrowly.com
```

### Email (Resend) — reservation checkout

```env
RESEND_API_KEY=re_...
FROM_EMAIL=tickets@frontrowly.com
ADMIN_EMAIL=support@frontrowly.com
```

Without `RESEND_API_KEY`, emails are logged to the server console (fine for local dev).

### Cron — release expired inventory holds

```env
CRON_SECRET=generate-a-long-random-string
```

Schedule a POST (or GET) to `/api/cron/release-holds` with header:

```
Authorization: Bearer <CRON_SECRET>
```

**Vercel cron example** (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/release-holds",
      "schedule": "0 * * * *"
    }
  ]
}
```

Set `CRON_SECRET` in Vercel env vars. Runs hourly; holds expire after 48h per checkout logic.

### Optional — WalletConnect Pay (crypto checkout)

```env
WALLETCONNECT_PAY_API_KEY=...
WALLETCONNECT_PAY_MERCHANT_ID=...
```

Webhook URL: `https://frontrowly.com/api/webhooks/walletconnect`

Reservation checkout works without these keys.

### Optional — dev-only

```env
NEXT_PUBLIC_SITE_DATE=2026-07-19
```

Overrides “today” for scarcity/on-sale UI testing.

---

## 6. Local development

```bash
npm install
cp .env.example .env.local
# Fill in Supabase keys (step 5)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Condition | Behaviour |
|-----------|-----------|
| No Supabase keys | Mock catalogue in **development only** |
| Keys set | Live data from your Supabase project |
| Production build without keys | Empty catalogue — no mock leak |

### Admin sign-in test

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Enter an email from `ADMIN_EMAILS`
3. Click the magic link in your inbox
4. You should land on `/admin`

---

## 7. Production deployment checklist

- [ ] All migrations `001`–`011` applied on production Supabase project
- [ ] Seed data loaded (at minimum steps 1–5 above)
- [ ] `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` set on host
- [ ] `NEXT_PUBLIC_APP_URL=https://frontrowly.com`
- [ ] `ADMIN_EMAILS` set; Auth redirect URLs include production callback
- [ ] `RESEND_API_KEY` + verified sending domain
- [ ] `CRON_SECRET` set + hourly cron hitting `/api/cron/release-holds`
- [ ] `npm run build` succeeds locally against production env
- [ ] Smoke test: browse event → tickets → reservation → confirmation email
- [ ] Admin: edit event, upload hero image, manage listings

---

## 8. RLS audit

Frontrowly uses **public read, service-role write**. The anon key can SELECT catalogue data; it cannot insert orders, listings, or admin records.

| Table / resource | Anon (public) | Service role (Next.js) |
|------------------|---------------|------------------------|
| `competitions`, `teams`, `venues`, `events` | SELECT | Full access |
| `ticket_categories`, `competitor_prices` | SELECT | Full access |
| `stadium_maps`, `stadium_sections`, `stadium_rows` | SELECT | Full access |
| `ticket_listings` | SELECT | Full access |
| `site_settings` | SELECT | Full access |
| `orders`, `order_items` | **No access** | Full access |
| `inventory_holds` | **No access** | Full access |
| `queue_sessions` | **No RLS** — not exposed to anon | Full access (queue API) |
| Storage `media` bucket | Public read | Upload via service role |

All admin mutations (`/admin/*` actions, checkout API, queue API, cron) use `createAdminClient()` with `SUPABASE_SERVICE_ROLE_KEY`.

**Do not** add anon INSERT/UPDATE policies on orders or listings — that would bypass server-side validation.

### Inventory hold RPCs

Migration `006` adds `reserve_listing_inventory()` and `reserve_category_inventory()` — called from checkout with service role. These use row-level locks to prevent double-booking.

---

## 9. Storage (hero images)

Migration `011` creates a public **`media`** bucket (5 MB max, JPEG/PNG/WebP/GIF).

Admin upload path: **Events → New/Edit → Hero image → Upload image**

Files are stored at `events/{slug}/{timestamp}-{filename}` and the public CDN URL is saved to `events.image_url`.

No extra storage policies are required — uploads use the service role, which bypasses RLS.

---

## 10. Common tasks

| Task | How |
|------|-----|
| Add TBD team labels | [ADMIN_SQL_TEMPLATES.md](./ADMIN_SQL_TEMPLATES.md) |
| Bulk import events | `/admin/events/import` (CSV) |
| Edit stadium map SVG | `/admin/venues` → venue → Map |
| Bulk add rows | `/admin/venues/[id]/sections` |
| Refresh listing prices | Admin listings page or SQL templates |
| Regenerate WC seed | `npm run seed:wc2026` then run SQL output |

---

## 11. Troubleshooting

### Site shows no events in production

- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set on the host
- Confirm seed SQL ran (check `SELECT count(*) FROM events`)
- Rebuild/redeploy after env changes

### Admin magic link doesn’t work

- Check **Redirect URLs** in Supabase Auth settings
- Email must be in `ADMIN_EMAILS` (case-insensitive)
- Link expires quickly — request a fresh one

### “Missing Supabase admin credentials” in admin actions

- Set `SUPABASE_SERVICE_ROLE_KEY` on the server (not just anon key)

### Image upload fails

- Run migration `011_media_storage.sql`
- Confirm service role key is set
- File must be ≤ 5 MB and JPEG/PNG/WebP/GIF

### Reservations don’t release after 48h

- Set `CRON_SECRET` and schedule `/api/cron/release-holds`
- Test manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://frontrowly.com/api/cron/release-holds`

### Double-booking concern

- Checkout must go through `/api/checkout` — it calls hold RPCs
- Never expose service role key to the client

---

## 12. Supabase CLI (optional)

If you prefer CLI over SQL Editor:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

There is no checked-in `supabase/config.toml` yet — CLI linking creates local config. Migrations in `supabase/migrations/` remain the source of truth.

---

## Quick reference — migration + seed one-liner order

```
001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011
seed.sql → world-cup-2026-full.sql → nz-belgium → metlife-final → sofi-qf
```

Then configure env vars, Auth redirects, cron, and Resend. You’re live.
