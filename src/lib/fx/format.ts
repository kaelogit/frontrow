import type { FxCurrency, FxSettings } from "@/lib/fx/settings";
import { formatPrice } from "@/lib/utils";

export function convertUsdTo(
  usdAmount: number,
  displayCurrency: FxCurrency,
  fx: FxSettings
): { amount: number; currency: FxCurrency; converted: boolean } {
  if (displayCurrency === "USD") {
    return { amount: usdAmount, currency: "USD", converted: false };
  }

  if (!fx.enabled) {
    return { amount: usdAmount, currency: "USD", converted: false };
  }

  const rate = fx.rates[displayCurrency as Exclude<FxCurrency, "USD">];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    return { amount: usdAmount, currency: "USD", converted: false };
  }

  return { amount: usdAmount * rate, currency: displayCurrency, converted: true };
}

export function formatDisplayPrice(options: {
  usdAmount: number;
  displayCurrency: FxCurrency;
  fx: FxSettings;
}): string {
  const converted = convertUsdTo(options.usdAmount, options.displayCurrency, options.fx);
  return formatPrice(converted.amount, converted.currency);
}

