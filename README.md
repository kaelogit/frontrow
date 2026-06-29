# Frontrowly

Premium event ticket platform — World Cup, NBA, Premier League, concerts and more.

**Stack:** Next.js 16 · Tailwind CSS · Supabase · WalletConnect Pay · Resend

## Quick start

```bash
cd frontrowly
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app runs with **mock data** until Supabase is configured.

### E2E tests

```bash
npm run test:e2e
```

Playwright runs the reservation flow against mock data (no Supabase required). CI: `.github/workflows/e2e.yml`.

## Supabase setup

Full step-by-step runbook: **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**

Quick version:

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations `001`–`011` in order (`supabase/migrations/`)
3. Run seed files (see runbook or [docs/WORLD_CUP_2026_SEED.md](docs/WORLD_CUP_2026_SEED.md))
4. Copy `.env.example` → `.env.local` and add keys + `ADMIN_EMAILS`

## Payments

| Method | Status |
|--------|--------|
| **Reservation** | Live — email to admin + customer |
| **Crypto** | WalletConnect Pay — configure API keys below |
| **Card** | Coming soon (shown disabled in checkout) |

### WalletConnect Pay

1. Open your [WalletConnect Pay dashboard](https://dashboard.walletconnect.com)
2. Create an API key and merchant; configure crypto settlement addresses (Trust Wallet, etc.)
3. Add to `.env.local`:

```
WALLETCONNECT_PAY_API_KEY=...
WALLETCONNECT_PAY_MERCHANT_ID=...
```

4. Set webhook URL to `https://yourdomain.com/api/webhooks/walletconnect`

Without keys, reservation checkout works; crypto uses a dev redirect in development.

## Email (Resend)

```
RESEND_API_KEY=...
ADMIN_EMAIL=...
FROM_EMAIL=...
```

Without Resend, reservation emails are logged to the console.

## Project structure

```
src/
  app/
    (site)/           # Public marketing + checkout
    admin/            # Admin dashboard
    api/
      checkout/       # Create orders
      webhooks/walletconnect/
  components/layout/  # Header, TrustBanner, LocaleSelector, etc.
  lib/
    walletconnect-pay.ts
    data/
supabase/migrations/
docs/PLATFORM_GAP_BACKLOG.md
```

## Admin

Visit `/admin` for the dashboard skeleton. Full CRUD coming per backlog.

## Domain

Production: **frontrowly.com**
