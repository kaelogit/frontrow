/**
 * Rate limit tiers for public APIs (backlog item 73).
 * Enforced via enforceRateLimit() — Supabase RPC in prod, in-memory in dev.
 */
export const RATE_LIMITS = {
  checkout: { id: "checkout", scope: "ip_email" as const, windowSeconds: 60, limit: 8 },
  queueJoin: { id: "queue_join", scope: "ip" as const, windowSeconds: 60, limit: 30 },
  queueStatus: { id: "queue_status", scope: "ip" as const, windowSeconds: 60, limit: 60 },
  cryptoQuote: { id: "crypto_quote", scope: "ip" as const, windowSeconds: 60, limit: 40 },
  cryptoConfirm: { id: "crypto_confirm", scope: "ip" as const, windowSeconds: 60, limit: 20 },
  contact: { id: "contact", scope: "ip_email" as const, windowSeconds: 300, limit: 5 },
} as const;
