/** QR / wallet deep-link payloads for manual sends */

export function buildBtcPaymentUri(address: string, btcAmount: string): string {
  const amount = btcAmount.replace(/\.?0+$/, "") || btcAmount;
  return `bitcoin:${address}?amount=${amount}`;
}

export function buildEthPaymentUri(address: string, weiAmount: string): string {
  return `ethereum:${address}@1?value=${weiAmount}`;
}

export function buildSolanaPaymentUri(address: string, solAmount: string): string {
  return `solana:${address}?amount=${solAmount}&label=Frontrowly`;
}
