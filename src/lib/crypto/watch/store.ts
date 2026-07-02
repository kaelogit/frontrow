import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  getDemoWatchForOrder,
  isDemoTxMatched,
  listDemoWatchingWatches,
  registerDemoWatch,
  updateDemoWatch,
} from "@/lib/crypto/watch/demo-store";
import type {
  CryptoPaymentWatch,
  RegisterCryptoWatchInput,
} from "@/lib/crypto/watch/types";

function mapWatch(row: Record<string, unknown>): CryptoPaymentWatch {
  return {
    id: row.id as string,
    kind: row.kind as CryptoPaymentWatch["kind"],
    order_reference: row.order_reference as string,
    offer_token: (row.offer_token as string) ?? null,
    payment_id: row.payment_id as CryptoPaymentWatch["payment_id"],
    expected_amount_raw: row.expected_amount_raw as string,
    expected_usd: Number(row.expected_usd),
    receive_address: row.receive_address as string,
    chain_id: (row.chain_id as number) ?? null,
    started_at: row.started_at as string,
    expires_at: row.expires_at as string,
    status: row.status as CryptoPaymentWatch["status"],
    matched_tx_id: (row.matched_tx_id as string) ?? null,
    paid_at: (row.paid_at as string) ?? null,
    last_scanned_at: (row.last_scanned_at as string) ?? null,
    scan_meta: (row.scan_meta as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function registerCryptoWatch(
  input: RegisterCryptoWatchInput
): Promise<CryptoPaymentWatch> {
  if (!hasSupabaseConfig()) {
    return registerDemoWatch(input);
  }

  const supabase = createAdminClient();

  // One active watch per order / offer at a time
  let expireQuery = supabase
    .from("crypto_payment_watches")
    .update({ status: "expired" })
    .eq("status", "watching")
    .eq("order_reference", input.orderReference);

  if (input.offerToken) {
    expireQuery = expireQuery.eq("offer_token", input.offerToken);
  } else {
    expireQuery = expireQuery.eq("kind", "order");
  }
  await expireQuery;

  const payload = {
    kind: input.kind,
    order_reference: input.orderReference,
    offer_token: input.offerToken ?? null,
    payment_id: input.paymentId,
    expected_amount_raw: input.expectedAmountRaw,
    expected_usd: input.expectedUsd,
    receive_address: input.receiveAddress,
    chain_id: input.chainId ?? null,
    expires_at: input.expiresAt,
    status: "watching" as const,
  };

  const { data, error } = await supabase
    .from("crypto_payment_watches")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapWatch(data);
}

export async function getActiveCryptoWatch(input: {
  orderReference: string;
  offerToken?: string | null;
}): Promise<CryptoPaymentWatch | null> {
  if (!hasSupabaseConfig()) {
    return getDemoWatchForOrder(input.orderReference, input.offerToken);
  }

  const supabase = createAdminClient();
  let query = supabase.from("crypto_payment_watches").select("*");

  if (input.offerToken) {
    query = query.eq("offer_token", input.offerToken);
  } else {
    query = query.eq("order_reference", input.orderReference).eq("kind", "order");
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? mapWatch(data) : null;
}

export async function getLatestCryptoWatch(input: {
  orderReference: string;
  offerToken?: string | null;
}): Promise<CryptoPaymentWatch | null> {
  return getActiveCryptoWatch(input);
}

export async function listWatchingCryptoWatches(): Promise<CryptoPaymentWatch[]> {
  if (!hasSupabaseConfig()) {
    return listDemoWatchingWatches();
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("crypto_payment_watches")
    .select("*")
    .eq("status", "watching")
    .gt("expires_at", now)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapWatch);
}

export async function markWatchPaid(
  id: string,
  txId: string
): Promise<CryptoPaymentWatch | null> {
  const paidAt = new Date().toISOString();
  const patch = {
    status: "paid" as const,
    matched_tx_id: txId,
    paid_at: paidAt,
    last_scanned_at: paidAt,
  };

  if (!hasSupabaseConfig()) {
    return updateDemoWatch(id, patch);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("crypto_payment_watches")
    .update(patch)
    .eq("id", id)
    .eq("status", "watching")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? mapWatch(data) : null;
}

export async function touchWatchScan(
  id: string,
  scanMeta?: Record<string, unknown>
): Promise<void> {
  const patch = {
    last_scanned_at: new Date().toISOString(),
    ...(scanMeta ? { scan_meta: scanMeta } : {}),
  };

  if (!hasSupabaseConfig()) {
    updateDemoWatch(id, patch);
    return;
  }

  const supabase = createAdminClient();
  await supabase.from("crypto_payment_watches").update(patch).eq("id", id);
}

export async function expireStaleWatches(): Promise<number> {
  const now = new Date().toISOString();

  if (!hasSupabaseConfig()) {
    let count = 0;
    for (const row of listDemoWatchingWatches()) {
      if (new Date(row.expires_at).getTime() <= Date.now()) {
        updateDemoWatch(row.id, { status: "expired" });
        count++;
      }
    }
    return count;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("crypto_payment_watches")
    .update({ status: "expired" })
    .eq("status", "watching")
    .lte("expires_at", now)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function isTransactionAlreadyMatched(txId: string): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return isDemoTxMatched(txId);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("crypto_payment_watches")
    .select("id")
    .eq("matched_tx_id", txId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
