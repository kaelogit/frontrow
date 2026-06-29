import { base, mainnet } from "viem/chains";

/** ERC-20 stablecoins — payments route to CRYPTO_RECEIVE_ADDRESS on each chain. */
export const CRYPTO_PAYMENT_TOKENS = [
  {
    id: "usdc-base",
    symbol: "USDC",
    name: "USD Coin",
    chainId: base.id,
    chainName: "Base",
    contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f702a5EdfF344" as const,
    decimals: 6,
  },
  {
    id: "usdc-ethereum",
    symbol: "USDC",
    name: "USD Coin",
    chainId: mainnet.id,
    chainName: "Ethereum",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const,
    decimals: 6,
  },
] as const;

export type CryptoPaymentTokenId = (typeof CRYPTO_PAYMENT_TOKENS)[number]["id"];

export const CRYPTO_SUPPORTED_CHAIN_IDS = [
  ...new Set(CRYPTO_PAYMENT_TOKENS.map((t) => t.chainId)),
] as const;

export function getCryptoPaymentToken(id: string) {
  return CRYPTO_PAYMENT_TOKENS.find((t) => t.id === id);
}

/** Trust Wallet / merchant receive address (same EVM address across chains). */
export function getCryptoReceiveAddress(): `0x${string}` | null {
  const raw =
    process.env.CRYPTO_RECEIVE_ADDRESS ??
    process.env.NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS;
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as `0x${string}`;
}

export function getWalletConnectProjectId(): string | null {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  return id?.trim() || null;
}

export function isCryptoPaymentsEnabled(): boolean {
  return Boolean(getCryptoReceiveAddress() && getWalletConnectProjectId());
}

/** USD list price → token smallest units (1 USD = 1 USDC). */
export function usdToTokenAmount(usd: number, decimals: number): bigint {
  const factor = 10 ** decimals;
  return BigInt(Math.round(usd * factor));
}
