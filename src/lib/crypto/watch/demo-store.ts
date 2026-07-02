import type { CryptoPaymentId } from "@/lib/crypto/payment-options";
import type { CryptoPaymentWatch, RegisterCryptoWatchInput } from "@/lib/crypto/watch/types";

const g = globalThis as typeof globalThis & {
  __frontrowlyCryptoWatches?: Map<string, CryptoPaymentWatch>;
};

function watches() {
  if (!g.__frontrowlyCryptoWatches) {
    g.__frontrowlyCryptoWatches = new Map();
  }
  return g.__frontrowlyCryptoWatches;
}

function watchKey(input: {
  kind: string;
  orderReference: string;
  offerToken?: string | null;
  paymentId: CryptoPaymentId;
}) {
  if (input.kind === "offer" && input.offerToken) {
    return `offer:${input.offerToken}:${input.paymentId}`;
  }
  return `order:${input.orderReference}:${input.paymentId}`;
}

export function registerDemoWatch(input: RegisterCryptoWatchInput): CryptoPaymentWatch {
  const now = new Date().toISOString();
  const key = watchKey({
    kind: input.kind,
    orderReference: input.orderReference,
    offerToken: input.offerToken,
    paymentId: input.paymentId,
  });

  for (const [id, row] of watches()) {
    if (row.status !== "watching") continue;
    const sameOrder =
      row.order_reference === input.orderReference &&
      (input.offerToken
        ? row.offer_token === input.offerToken
        : row.kind === "order" && input.kind === "order");
    if (sameOrder) watches().delete(id);
  }

  const row: CryptoPaymentWatch = {
    id: `demo-watch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    order_reference: input.orderReference,
    offer_token: input.offerToken ?? null,
    payment_id: input.paymentId,
    expected_amount_raw: input.expectedAmountRaw,
    expected_usd: input.expectedUsd,
    receive_address: input.receiveAddress,
    chain_id: input.chainId ?? null,
    started_at: now,
    expires_at: input.expiresAt,
    status: "watching",
    matched_tx_id: null,
    paid_at: null,
    last_scanned_at: null,
    scan_meta: {},
    created_at: now,
    updated_at: now,
  };
  watches().set(row.id, row);
  return row;
}

export function listDemoWatchingWatches(): CryptoPaymentWatch[] {
  const now = Date.now();
  return [...watches().values()].filter(
    (w) => w.status === "watching" && new Date(w.expires_at).getTime() > now
  );
}

export function getDemoWatchForOrder(
  orderReference: string,
  offerToken?: string | null
): CryptoPaymentWatch | null {
  let latest: CryptoPaymentWatch | null = null;
  for (const row of watches().values()) {
    const matches = offerToken
      ? row.offer_token === offerToken
      : row.order_reference === orderReference && row.kind === "order";
    if (!matches) continue;
    if (!latest || new Date(row.created_at).getTime() > new Date(latest.created_at).getTime()) {
      latest = row;
    }
  }
  return latest?.status === "watching" || latest?.status === "paid" ? latest : null;
}

export function updateDemoWatch(
  id: string,
  patch: Partial<CryptoPaymentWatch>
): CryptoPaymentWatch | null {
  const existing = watches().get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updated_at: new Date().toISOString() };
  watches().set(id, updated);
  return updated;
}

export function isDemoTxMatched(txId: string): boolean {
  for (const row of watches().values()) {
    if (row.matched_tx_id === txId) return true;
  }
  return false;
}
