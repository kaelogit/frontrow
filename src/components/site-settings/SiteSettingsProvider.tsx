"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { FxSettings, FxCurrency } from "@/lib/fx/settings";

interface SiteSettingsContextValue {
  fx: FxSettings;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({
  fx,
  children,
}: {
  fx: FxSettings;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ fx }), [fx]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useFxSettings(): FxSettings {
  const ctx = useContext(SiteSettingsContext);
  return ctx?.fx ?? {
    enabled: false,
    base: "USD",
    rates: {},
    disclaimer: "Estimated conversion. Checkout in USD.",
  };
}

const LOCALE_COOKIE = "frontrowly_locale";

function readCurrencyFromCookie(): FxCurrency {
  if (typeof document === "undefined") return "USD";
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return "USD";
  try {
    const parsed = JSON.parse(decodeURIComponent(match.split("=")[1])) as { currency?: FxCurrency };
    return (parsed.currency as FxCurrency) || "USD";
  } catch {
    return "USD";
  }
}

function subscribeLocale(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("frontrowly:locale", handler as EventListener);
  return () => window.removeEventListener("frontrowly:locale", handler as EventListener);
}

export function useDisplayCurrency(): FxCurrency {
  return useSyncExternalStore(subscribeLocale, readCurrencyFromCookie, () => "USD");
}

