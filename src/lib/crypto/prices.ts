import type { CryptoPaymentOption } from "@/lib/crypto/payment-options";
import {
  usdToStablecoinAmount,
  usdToVolatileAmount,
} from "@/lib/crypto/payment-options";

const COINGECKO_IDS = [
  "bitcoin",
  "litecoin",
  "dogecoin",
  "ethereum",
  "binancecoin",
  "solana",
  "tron",
  "the-open-network",
] as const;

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
    litecoin: data.litecoin?.usd ?? 0,
    dogecoin: data.dogecoin?.usd ?? 0,
    ethereum: data.ethereum?.usd ?? 0,
    binancecoin: data.binancecoin?.usd ?? 0,
    solana: data.solana?.usd ?? 0,
    tron: data.tron?.usd ?? 0,
    "the-open-network": data["the-open-network"]?.usd ?? 0,
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

function formatQuoteAmount(raw: bigint, decimals: number): string {
  const divisor = 10 ** decimals;
  const value = Number(raw) / divisor;
  const fracDigits = decimals === 18 ? 6 : decimals === 9 ? 6 : 8;
  return value.toFixed(fracDigits).replace(/\.?0+$/, "") || value.toFixed(fracDigits);
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
      amount: usdTotal.toFixed(2),
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

  return {
    paymentId: option.id,
    symbol: option.symbol,
    label: option.label,
    amount: formatQuoteAmount(raw, option.decimals),
    amountRaw: raw.toString(),
    usdTotal,
    priceUsd,
  };
}
