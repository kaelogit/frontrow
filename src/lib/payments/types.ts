import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

export type PaymentCredentialType =
  | "wire_us"
  | "swift"
  | "cashapp"
  | "apple_pay"
  | "zelle"
  | "paypal"
  | "crypto"
  | "other";

export type PaymentOfferStatus =
  | "active"
  | "submitted"
  | "expired"
  | "revoked"
  | "paid";

export interface PaymentCredential {
  id: string;
  label: string;
  type: PaymentCredentialType;
  details: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentOffer {
  id: string;
  order_id: string;
  order_reference: string;
  credential_id: string | null;
  token: string;
  amount: number;
  currency: string;
  method_type: PaymentCredentialType;
  method_label: string;
  instructions: Record<string, string>;
  crypto_payment_id: CryptoPaymentId | null;
  expiry_minutes: number;
  started_at: string | null;
  expires_at: string | null;
  status: PaymentOfferStatus;
  revoked_at: string | null;
  submitted_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PaymentSubmission {
  id: string;
  offer_id: string;
  receipt_url: string;
  receipt_filename: string | null;
  customer_note: string | null;
  created_at: string;
}

export interface PaymentOfferPublicView {
  token: string;
  orderReference: string;
  amount: number;
  currency: string;
  methodType: PaymentCredentialType;
  methodLabel: string;
  instructions: { label: string; value: string }[];
  cryptoPaymentId: CryptoPaymentId | null;
  expiryMinutes: number;
  started: boolean;
  expiresAt: string | null;
  status: PaymentOfferStatus;
  expired: boolean;
  canSubmit: boolean;
  customerName: string;
  eventTitle: string;
}

export const PAYMENT_CREDENTIAL_TYPE_LABELS: Record<PaymentCredentialType, string> = {
  wire_us: "Wire (US)",
  swift: "SWIFT",
  cashapp: "Cash App",
  apple_pay: "Apple Pay",
  zelle: "Zelle",
  paypal: "PayPal",
  crypto: "Crypto",
  other: "Other",
};

export const EXPIRY_PRESETS = [
  { id: "15m", label: "15 minutes", minutes: 15 },
  { id: "1h", label: "1 hour", minutes: 60 },
  { id: "14h", label: "14 hours", minutes: 14 * 60 },
  { id: "25m", label: "25 minutes", minutes: 25 },
  { id: "48h", label: "48 hours", minutes: 48 * 60 },
] as const;

export const CRYPTO_CHECKOUT_MINUTES = 25;

export function formatExpiryDuration(minutes: number): string {
  const preset = EXPIRY_PRESETS.find((p) => p.minutes === minutes);
  if (preset) return preset.label;
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
