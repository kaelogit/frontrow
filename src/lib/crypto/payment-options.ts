import { base, bsc, mainnet } from "viem/chains";

export const CRYPTO_PAYMENT_IDS = [
  "usdc-base",
  "usdc-ethereum",
  "usdt-ethereum",
  "eth-ethereum",
  "bnb-bsc",
  "usdt-bsc",
  "sol-solana",
  "btc-bitcoin",
] as const;

export type CryptoPaymentId = (typeof CRYPTO_PAYMENT_IDS)[number];

export type PaymentRail = "evm" | "solana" | "bitcoin";

export interface CryptoPaymentOption {
  id: CryptoPaymentId;
  symbol: string;
  label: string;
  rail: PaymentRail;
  /** 1 USD = 1 token unit (USDC, USDT) */
  stablecoin: boolean;
  coingeckoId?: string;
  chainId?: number;
  chainName?: string;
  evmKind?: "native" | "erc20";
  contractAddress?: `0x${string}`;
  decimals: number;
}

export const CRYPTO_PAYMENT_OPTIONS: CryptoPaymentOption[] = [
  {
    id: "usdc-base",
    symbol: "USDC",
    label: "USDC on Base (recommended · low fees)",
    rail: "evm",
    stablecoin: true,
    chainId: base.id,
    chainName: "Base",
    evmKind: "erc20",
    contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f702a5EdfF344",
    decimals: 6,
  },
  {
    id: "usdc-ethereum",
    symbol: "USDC",
    label: "USDC on Ethereum",
    rail: "evm",
    stablecoin: true,
    chainId: mainnet.id,
    chainName: "Ethereum",
    evmKind: "erc20",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  {
    id: "usdt-ethereum",
    symbol: "USDT",
    label: "USDT on Ethereum",
    rail: "evm",
    stablecoin: true,
    chainId: mainnet.id,
    chainName: "Ethereum",
    evmKind: "erc20",
    contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  {
    id: "eth-ethereum",
    symbol: "ETH",
    label: "ETH on Ethereum",
    rail: "evm",
    stablecoin: false,
    coingeckoId: "ethereum",
    chainId: mainnet.id,
    chainName: "Ethereum",
    evmKind: "native",
    decimals: 18,
  },
  {
    id: "bnb-bsc",
    symbol: "BNB",
    label: "BNB on BNB Chain",
    rail: "evm",
    stablecoin: false,
    coingeckoId: "binancecoin",
    chainId: bsc.id,
    chainName: "BNB Chain",
    evmKind: "native",
    decimals: 18,
  },
  {
    id: "usdt-bsc",
    symbol: "USDT",
    label: "USDT on BNB Chain",
    rail: "evm",
    stablecoin: true,
    chainId: bsc.id,
    chainName: "BNB Chain",
    evmKind: "erc20",
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
  },
  {
    id: "sol-solana",
    symbol: "SOL",
    label: "SOL on Solana",
    rail: "solana",
    stablecoin: false,
    coingeckoId: "solana",
    decimals: 9,
  },
  {
    id: "btc-bitcoin",
    symbol: "BTC",
    label: "BTC on Bitcoin",
    rail: "bitcoin",
    stablecoin: false,
    coingeckoId: "bitcoin",
    decimals: 8,
  },
];

export const EVM_CHAIN_IDS = [
  ...new Set(
    CRYPTO_PAYMENT_OPTIONS.filter((o) => o.rail === "evm" && o.chainId).map(
      (o) => o.chainId!
    )
  ),
];

export function getCryptoPaymentOption(id: string): CryptoPaymentOption | undefined {
  return CRYPTO_PAYMENT_OPTIONS.find((o) => o.id === id);
}

export function getOptionsForConfiguredAddresses(config: {
  evm: boolean;
  solana: boolean;
  bitcoin: boolean;
}): CryptoPaymentOption[] {
  return CRYPTO_PAYMENT_OPTIONS.filter((o) => {
    if (o.rail === "evm") return config.evm;
    if (o.rail === "solana") return config.solana;
    if (o.rail === "bitcoin") return config.bitcoin;
    return false;
  });
}

/** USD list price → smallest token units for stablecoins (1:1). */
export function usdToStablecoinAmount(usd: number, decimals: number): bigint {
  const factor = 10 ** decimals;
  return BigInt(Math.round(usd * factor));
}

/** Convert USD to volatile asset amount using spot price. */
export function usdToVolatileAmount(
  usd: number,
  priceUsd: number,
  decimals: number
): bigint {
  if (priceUsd <= 0) return BigInt(0);
  const units = (usd / priceUsd) * 10 ** decimals;
  return BigInt(Math.max(1, Math.ceil(units)));
}

export function formatTokenAmount(amount: bigint, decimals: number, maxFrac = 8): string {
  const whole = amount / BigInt(10 ** decimals);
  const frac = amount % BigInt(10 ** decimals);
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, maxFrac).replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}
