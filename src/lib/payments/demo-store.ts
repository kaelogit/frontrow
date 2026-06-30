import type {
  PaymentCredential,
  PaymentOffer,
  PaymentOfferStatus,
  PaymentSubmission,
} from "@/lib/payments/types";
import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

const g = globalThis as typeof globalThis & {
  __frontrowlyPaymentCredentials?: Map<string, PaymentCredential>;
  __frontrowlyPaymentOffers?: Map<string, PaymentOffer>;
  __frontrowlyPaymentSubmissions?: Map<string, PaymentSubmission>;
};

function credentials() {
  if (!g.__frontrowlyPaymentCredentials) {
    g.__frontrowlyPaymentCredentials = new Map();
  }
  return g.__frontrowlyPaymentCredentials;
}

function offers() {
  if (!g.__frontrowlyPaymentOffers) {
    g.__frontrowlyPaymentOffers = new Map();
  }
  return g.__frontrowlyPaymentOffers;
}

function submissions() {
  if (!g.__frontrowlyPaymentSubmissions) {
    g.__frontrowlyPaymentSubmissions = new Map();
  }
  return g.__frontrowlyPaymentSubmissions;
}

export function listDemoCredentials(): PaymentCredential[] {
  return [...credentials().values()].sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export function getDemoCredential(id: string): PaymentCredential | null {
  return credentials().get(id) ?? null;
}

export function saveDemoCredential(
  input: Omit<PaymentCredential, "created_at" | "updated_at"> & {
    created_at?: string;
    updated_at?: string;
  }
): PaymentCredential {
  const now = new Date().toISOString();
  const row: PaymentCredential = {
    ...input,
    created_at: input.created_at ?? now,
    updated_at: now,
  };
  credentials().set(row.id, row);
  return row;
}

export function deleteDemoCredential(id: string): boolean {
  return credentials().delete(id);
}

export function listDemoOffersForOrder(reference: string): PaymentOffer[] {
  return [...offers().values()]
    .filter((o) => o.order_reference === reference)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function getDemoOfferByToken(token: string): PaymentOffer | null {
  for (const offer of offers().values()) {
    if (offer.token === token) return offer;
  }
  return null;
}

export function getDemoOfferById(id: string): PaymentOffer | null {
  return offers().get(id) ?? null;
}

export function saveDemoOffer(
  offer: Omit<PaymentOffer, "created_at"> & { created_at?: string }
): PaymentOffer {
  const row: PaymentOffer = {
    ...offer,
    created_at: offer.created_at ?? new Date().toISOString(),
  };
  offers().set(row.id, row);
  return row;
}

export function updateDemoOffer(
  id: string,
  patch: Partial<PaymentOffer>
): PaymentOffer | null {
  const existing = [...offers().values()].find((o) => o.id === id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  offers().set(id, updated);
  return updated;
}

export function revokeActiveDemoOffers(reference: string): void {
  for (const offer of offers().values()) {
    if (
      offer.order_reference === reference &&
      offer.status === "active"
    ) {
      offers().set(offer.id, {
        ...offer,
        status: "revoked",
        revoked_at: new Date().toISOString(),
      });
    }
  }
}

export function saveDemoSubmission(
  submission: Omit<PaymentSubmission, "created_at"> & { created_at?: string }
): PaymentSubmission {
  const row: PaymentSubmission = {
    ...submission,
    created_at: submission.created_at ?? new Date().toISOString(),
  };
  submissions().set(row.id, row);
  return row;
}

export function getDemoSubmissionForOffer(
  offerId: string
): PaymentSubmission | null {
  for (const sub of submissions().values()) {
    if (sub.offer_id === offerId) return sub;
  }
  return null;
}

export function createDemoOfferId(): string {
  return `demo-offer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDemoCredentialId(): string {
  return `demo-cred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type CreateDemoOfferInput = {
  order_id: string;
  order_reference: string;
  credential_id: string | null;
  token: string;
  amount: number;
  currency: string;
  method_type: PaymentOffer["method_type"];
  method_label: string;
  instructions: Record<string, string>;
  crypto_payment_id: CryptoPaymentId | null;
  expiry_minutes: number;
  created_by: string | null;
};

export function createDemoOffer(input: CreateDemoOfferInput): PaymentOffer {
  revokeActiveDemoOffers(input.order_reference);
  return saveDemoOffer({
    id: createDemoOfferId(),
    ...input,
    started_at: null,
    expires_at: null,
    status: "active",
    revoked_at: null,
    submitted_at: null,
  });
}

export function expireDemoOfferIfNeeded(offer: PaymentOffer): PaymentOffer {
  if (
    offer.status === "active" &&
    offer.started_at &&
    offer.expires_at &&
    new Date(offer.expires_at).getTime() <= Date.now()
  ) {
    return updateDemoOffer(offer.id, { status: "expired" }) ?? offer;
  }
  return offer;
}

export function resolveDemoOfferStatus(offer: PaymentOffer): PaymentOfferStatus {
  const current = expireDemoOfferIfNeeded(offer);
  return current.status;
}
