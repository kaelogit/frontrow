import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";

export type RateLimitScope = "ip" | "ip_email";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Local/dev fallback.
  return "0.0.0.0";
}

function memoryStore() {
  const g = globalThis as typeof globalThis & {
    __frontrowlyRateLimits?: Map<string, { count: number; resetAtMs: number }>;
  };
  if (!g.__frontrowlyRateLimits) g.__frontrowlyRateLimits = new Map();
  return g.__frontrowlyRateLimits;
}

async function hitMemory(opts: {
  key: string;
  windowSeconds: number;
  limit: number;
}): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAtMs = windowStart + windowMs;

  const store = memoryStore();
  const existing = store.get(opts.key);
  const count = existing && existing.resetAtMs === resetAtMs ? existing.count + 1 : 1;
  store.set(opts.key, { count, resetAtMs });

  return {
    allowed: count <= opts.limit,
    remaining: Math.max(0, opts.limit - count),
    resetAt: new Date(resetAtMs),
  };
}

async function hitSupabase(opts: {
  key: string;
  windowSeconds: number;
  limit: number;
}): Promise<{ allowed: boolean; remaining: number; resetAt: Date } | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_key: opts.key,
      p_window_seconds: opts.windowSeconds,
      p_limit: opts.limit,
    });

    if (error || !data || !Array.isArray(data) || !data[0]) {
      return null;
    }

    const row = data[0] as { allowed: boolean; remaining: number; reset_at: string };
    return {
      allowed: Boolean(row.allowed),
      remaining: Number(row.remaining),
      resetAt: new Date(row.reset_at),
    };
  } catch {
    return null;
  }
}

export async function enforceRateLimit(options: {
  request: Request;
  id: string; // e.g. "checkout", "queue_join"
  scope: RateLimitScope;
  windowSeconds: number;
  limit: number;
  email?: string | null;
}) {
  const ip = getClientIp(options.request);
  const ipKey = sha256(ip);
  const emailKey = options.email ? sha256(options.email.trim().toLowerCase()) : null;

  const rawKey =
    options.scope === "ip"
      ? `${options.id}:ip:${ipKey}`
      : `${options.id}:ip:${ipKey}:email:${emailKey ?? "none"}`;

  // Keep keys short in DB.
  const key = sha256(rawKey);

  const result =
    (await hitSupabase({ key, windowSeconds: options.windowSeconds, limit: options.limit })) ??
    (await hitMemory({ key, windowSeconds: options.windowSeconds, limit: options.limit }));

  if (result.allowed) {
    return { ok: true as const, ...result };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
  );

  const res = NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 }
  );
  res.headers.set("Retry-After", String(retryAfterSeconds));
  res.headers.set("X-RateLimit-Limit", String(options.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", result.resetAt.toISOString());
  return { ok: false as const, response: res };
}

