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

export function buildLtcPaymentUri(address: string, ltcAmount: string): string {
  const amount = ltcAmount.replace(/\.?0+$/, "") || ltcAmount;
  return `litecoin:${address}?amount=${amount}`;
}

export function buildDogePaymentUri(address: string, dogeAmount: string): string {
  const amount = dogeAmount.replace(/\.?0+$/, "") || dogeAmount;
  return `dogecoin:${address}?amount=${amount}`;
}

export function buildTronPaymentUri(address: string, trxAmount: string): string {
  const amount = trxAmount.replace(/\.?0+$/, "") || trxAmount;
  return `tron:${address}?amount=${amount}`;
}

export function buildTonPaymentUri(address: string, tonAmount: string): string {
  const amount = tonAmount.replace(/\.?0+$/, "") || tonAmount;
  return `ton://transfer/${address}?amount=${amount}`;
}
