import { hasSupabaseConfig } from "@/lib/supabase/admin";

/**
 * Mock catalogue is allowed only in development when Supabase is not configured.
 * Production never serves mock events, listings, or orders — even if the DB is empty.
 */
export function shouldUseMockData(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return !hasSupabaseConfig();
}

export function isProductionDataMode(): boolean {
  return !shouldUseMockData();
}
