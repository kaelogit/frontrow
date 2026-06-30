import type { CryptoAddressConfig } from "@/lib/crypto/payment-options";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getEvmReceiveAddress(): `0x${string}` | null {
  const raw = readEnv(
    "CRYPTO_RECEIVE_ADDRESS_EVM",
    "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_EVM",
    "CRYPTO_RECEIVE_ADDRESS",
    "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS"
  );
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as `0x${string}`;
}

export function getSolanaReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_SOL", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_SOL");
  if (!raw || raw.length < 32) return null;
  return raw;
}

export function getBtcReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_BTC", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_BTC");
  if (!raw || raw.length < 14) return null;
  return raw;
}

export function getLtcReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_LTC", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_LTC");
  if (!raw || raw.length < 14) return null;
  return raw;
}

export function getDogeReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_DOGE", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_DOGE");
  if (!raw || !/^D[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(raw)) return null;
  return raw;
}

export function getTronReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_TRON", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_TRON");
  if (!raw || !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(raw)) return null;
  return raw;
}

export function getTonReceiveAddress(): string | null {
  const raw = readEnv("CRYPTO_RECEIVE_ADDRESS_TON", "NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_TON");
  if (!raw || raw.length < 48) return null;
  return raw;
}

export function getWalletConnectProjectId(): string | null {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  return id?.trim() || null;
}

export function getCryptoAddressConfig(): CryptoAddressConfig {
  return {
    evm: Boolean(getEvmReceiveAddress()),
    solana: Boolean(getSolanaReceiveAddress()),
    bitcoin: Boolean(getBtcReceiveAddress()),
    litecoin: Boolean(getLtcReceiveAddress()),
    dogecoin: Boolean(getDogeReceiveAddress()),
    tron: Boolean(getTronReceiveAddress()),
    ton: Boolean(getTonReceiveAddress()),
  };
}

/** At least one receive address is configured (server env). */
export function hasCryptoReceiveAddresses(): boolean {
  const addresses = getCryptoAddressConfig();
  return Object.values(addresses).some(Boolean);
}

/** Crypto checkout is available when receive addresses exist. WalletConnect is only needed for in-wallet EVM sends. */
export function isCryptoPaymentsEnabled(): boolean {
  return hasCryptoReceiveAddresses();
}

export function isWalletConnectConfigured(): boolean {
  return Boolean(getWalletConnectProjectId());
}

export function getReceiveAddressForPayment(
  paymentId: string
): string | `0x${string}` | null {
  if (paymentId.includes("tron")) return getTronReceiveAddress();
  if (paymentId.includes("ton")) return getTonReceiveAddress();
  if (paymentId.includes("solana")) return getSolanaReceiveAddress();
  if (paymentId.includes("litecoin")) return getLtcReceiveAddress();
  if (paymentId.includes("dogecoin")) return getDogeReceiveAddress();
  if (paymentId.includes("bitcoin")) return getBtcReceiveAddress();
  return getEvmReceiveAddress();
}

/** @deprecated Use getEvmReceiveAddress */
export function getCryptoReceiveAddress(): `0x${string}` | null {
  return getEvmReceiveAddress();
}
