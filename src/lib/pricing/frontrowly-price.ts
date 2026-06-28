/** Frontrowly sells at 10% below reference market "Now" prices. */
export const FRONTROWLY_MARKET_DISCOUNT = 0.1;

export function frontrowlyPrice(marketNowPrice: number): number {
  return Math.round(marketNowPrice * (1 - FRONTROWLY_MARKET_DISCOUNT) * 100) / 100;
}

/** Strikethrough price — reference market rate (no percentage label in UI). */
export function frontrowlyCompareAt(marketNowPrice: number): number {
  return marketNowPrice;
}
