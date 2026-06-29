export function getEvmReceiveAddress(): `0x${string}` | null {
  const raw =
    process.env.CRYPTO_RECEIVE_ADDRESS_EVM ??
    process.env.NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_EVM ??
    process.env.CRYPTO_RECEIVE_ADDRESS ??
    process.env.NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS;
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as `0x${string}`;
}

export function getSolanaReceiveAddress(): string | null {
  const raw =
    process.env.CRYPTO_RECEIVE_ADDRESS_SOL ??
    process.env.NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_SOL;
  if (!raw || raw.length < 32) return null;
  return raw.trim();
}

export function getBtcReceiveAddress(): string | null {
  const raw =
    process.env.CRYPTO_RECEIVE_ADDRESS_BTC ??
    process.env.NEXT_PUBLIC_CRYPTO_RECEIVE_ADDRESS_BTC;
  if (!raw || raw.length < 14) return null;
  return raw.trim();
}

export function getWalletConnectProjectId(): string | null {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  return id?.trim() || null;
}

export function getCryptoAddressConfig() {
  return {
    evm: Boolean(getEvmReceiveAddress()),
    solana: Boolean(getSolanaReceiveAddress()),
    bitcoin: Boolean(getBtcReceiveAddress()),
  };
}

export function isCryptoPaymentsEnabled(): boolean {
  const addresses = getCryptoAddressConfig();
  return Boolean(
    getWalletConnectProjectId() &&
      (addresses.evm || addresses.solana || addresses.bitcoin)
  );
}

/** @deprecated Use getEvmReceiveAddress */
export function getCryptoReceiveAddress(): `0x${string}` | null {
  return getEvmReceiveAddress();
}
