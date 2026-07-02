import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

export type CryptoWatchKind = "order" | "offer";
export type CryptoWatchStatus = "watching" | "paid" | "expired";

export interface CryptoPaymentWatch {
  id: string;
  kind: CryptoWatchKind;
  order_reference: string;
  offer_token: string | null;
  payment_id: CryptoPaymentId;
  expected_amount_raw: string;
  expected_usd: number;
  receive_address: string;
  chain_id: number | null;
  started_at: string;
  expires_at: string;
  status: CryptoWatchStatus;
  matched_tx_id: string | null;
  paid_at: string | null;
  last_scanned_at: string | null;
  scan_meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RegisterCryptoWatchInput {
  kind: CryptoWatchKind;
  orderReference: string;
  offerToken?: string | null;
  paymentId: CryptoPaymentId;
  expectedAmountRaw: string;
  expectedUsd: number;
  receiveAddress: string;
  chainId?: number | null;
  expiresAt: string;
}
