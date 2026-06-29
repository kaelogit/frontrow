/** Display metadata for crypto picker UI (Gateway-style). */

export const CURRENCY_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  LTC: "Litecoin",
  DOGE: "Dogecoin",
  ETH: "Ethereum",
  USDT: "Tether",
  USDC: "USD Coin",
  BNB: "BNB",
  SOL: "Solana",
  TRX: "Tron",
  TON: "Toncoin",
};

/** jsDelivr cryptocurrency-icons slug per symbol */
export const CURRENCY_ICON_SLUG: Record<string, string> = {
  BTC: "btc",
  LTC: "ltc",
  DOGE: "doge",
  ETH: "eth",
  USDT: "usdt",
  USDC: "usdc",
  BNB: "bnb",
  SOL: "sol",
  TRX: "trx",
  TON: "ton",
};

export function cryptoIconUrl(symbol: string): string {
  const slug = CURRENCY_ICON_SLUG[symbol] ?? symbol.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/${slug}.svg`;
}

/** Quick-select chips shown under the currency picker */
export const QUICK_CURRENCY_SYMBOLS = [
  "USDT",
  "BTC",
  "ETH",
  "LTC",
  "SOL",
  "DOGE",
  "TRX",
  "TON",
] as const;
