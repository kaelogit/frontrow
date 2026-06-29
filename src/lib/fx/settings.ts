import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

export type FxCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AED" | "BRL";

export interface FxSettings {
  enabled: boolean;
  base: "USD";
  rates: Partial<Record<Exclude<FxCurrency, "USD">, number>>;
  disclaimer: string;
}

export const DEFAULT_FX: FxSettings = {
  enabled: false,
  base: "USD",
  rates: {
    EUR: 0.9,
    GBP: 0.78,
    CAD: 1.36,
    AED: 3.67,
    BRL: 5.2,
  },
  disclaimer: "Estimated conversion. Checkout in USD.",
};

function parseFx(raw: unknown): FxSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_FX;
  const o = raw as Record<string, unknown>;
  const ratesRaw = (o.rates && typeof o.rates === "object" ? (o.rates as Record<string, unknown>) : {}) ?? {};
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

  const rates: FxSettings["rates"] = {
    EUR: num(ratesRaw.EUR),
    GBP: num(ratesRaw.GBP),
    CAD: num(ratesRaw.CAD),
    AED: num(ratesRaw.AED),
    BRL: num(ratesRaw.BRL),
  };

  return {
    enabled: o.enabled === true,
    base: "USD",
    rates,
    disclaimer:
      typeof o.disclaimer === "string" && o.disclaimer.trim()
        ? o.disclaimer.trim()
        : DEFAULT_FX.disclaimer,
  };
}

export async function getFxSettings(): Promise<FxSettings> {
  if (!hasSupabaseConfig()) return DEFAULT_FX;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "fx")
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_FX;
    return parseFx(data.value);
  } catch {
    return DEFAULT_FX;
  }
}

