import type { CryptoPaymentOption } from "@/lib/crypto/payment-options";
import {
  usdToStablecoinAmount,
  usdToVolatileAmount,
} from "@/lib/crypto/payment-options";

const COINGECKO_IDS = ["bitcoin", "ethereum", "binancecoin", "solana"] as const;

type CoinId = (typeof COINGECKO_IDS)[number];

let priceCache: { at: number; prices: Record<CoinId, number> } | null = null;
const CACHE_MS = 60_000;

async function fetchSpotPrices(): Promise<Record<CoinId, number>> {
  const now = Date.now();
  if (priceCache && now - priceCache.at < CACHE_MS) {
    return priceCache.prices;
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS.join(",")}&vs_currencies=usd`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error("Could not fetch crypto prices");
  }

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const prices = {
    bitcoin: data.bitcoin?.usd ?? 0,
    ethereum: data.ethereum?.usd ?? 0,
    binancecoin: data.binancecoin?.usd ?? 0,
    solana: data.solana?.usd ?? 0,
  };
  priceCache = { at: now, prices };
  return prices;
}

export interface CryptoQuote {
  paymentId: string;
  symbol: string;
  label: string;
  amount: string;
  amountRaw: string;
  usdTotal: number;
  priceUsd: number | null;
}

export async function quoteCryptoPayment(
  option: CryptoPaymentOption,
  usdTotal: number
): Promise<CryptoQuote> {
  if (option.stablecoin) {
    const raw = usdToStablecoinAmount(usdTotal, option.decimals);
    return {
      paymentId: option.id,
      symbol: option.symbol,
      label: option.label,
      amount: (usdTotal).toFixed(2),
      amountRaw: raw.toString(),
      usdTotal,
      priceUsd: 1,
    };
  }

  const prices = await fetchSpotPrices();
  const coinId = option.coingeckoId as CoinId | undefined;
  const priceUsd = coinId ? prices[coinId] : 0;
  if (!priceUsd) {
    throw new Error(`Price unavailable for ${option.symbol}`);
  }

  const raw = usdToVolatileAmount(usdTotal, priceUsd, option.decimals);
  const amount =
    option.decimals === 8
      ? (Number(raw) / 1e8).toFixed(8)
      : option.decimals === 9
        ? (Number(raw) / 1e9).toFixed(6)
        : (Number(raw) / 1e18).toFixed(6);

  return {
    paymentId: option.id,
    symbol: option.symbol,
    label: option.label,
    amount,
    amountRaw: raw.toString(),
    usdTotal,
    priceUsd,
  };
}
