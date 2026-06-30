import type { CryptoPaymentId } from "@/lib/crypto/payment-options";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  createDemoCredentialId,
  createDemoOffer,
  deleteDemoCredential,
  expireDemoOfferIfNeeded,
  getDemoCredential,
  getDemoOfferById,
  getDemoOfferByToken,
  getDemoSubmissionForOffer,
  listDemoCredentials,
  listDemoOffersForOrder,
  revokeActiveDemoOffers,
  saveDemoCredential,
  saveDemoSubmission,
  updateDemoOffer,
} from "@/lib/payments/demo-store";
import { formatInstructionRows, snapshotFromCredential } from "@/lib/payments/instructions";
import { generatePaymentOfferToken } from "@/lib/payments/tokens";
import type {
  PaymentCredential,
  PaymentCredentialType,
  PaymentOffer,
  PaymentOfferPublicView,
  PaymentSubmission,
} from "@/lib/payments/types";

function mapCredential(row: Record<string, unknown>): PaymentCredential {
  return {
    id: row.id as string,
    label: row.label as string,
    type: row.type as PaymentCredentialType,
    details: (row.details as Record<string, string>) ?? {},
    is_active: Boolean(row.is_active),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapOffer(row: Record<string, unknown>): PaymentOffer {
  return {
    id: row.id as string,
    order_id: row.order_id as string,
    order_reference: row.order_reference as string,
    credential_id: (row.credential_id as string) ?? null,
    token: row.token as string,
    amount: Number(row.amount),
    currency: row.currency as string,
    method_type: row.method_type as PaymentCredentialType,
    method_label: row.method_label as string,
    instructions: (row.instructions as Record<string, string>) ?? {},
    crypto_payment_id: (row.crypto_payment_id as CryptoPaymentId) ?? null,
    expiry_minutes: Number(row.expiry_minutes ?? 840),
    started_at: (row.started_at as string) ?? null,
    expires_at: (row.expires_at as string) ?? null,
    status: row.status as PaymentOffer["status"],
    revoked_at: (row.revoked_at as string) ?? null,
    submitted_at: (row.submitted_at as string) ?? null,
    created_by: (row.created_by as string) ?? null,
    created_at: row.created_at as string,
  };
}

function mapSubmission(row: Record<string, unknown>): PaymentSubmission {
  return {
    id: row.id as string,
    offer_id: row.offer_id as string,
    receipt_url: row.receipt_url as string,
    receipt_filename: (row.receipt_filename as string) ?? null,
    customer_note: (row.customer_note as string) ?? null,
    created_at: row.created_at as string,
  };
}

export async function listCredentials(
  type?: PaymentCredentialType
): Promise<PaymentCredential[]> {
  if (!hasSupabaseConfig()) {
    return listDemoCredentials().filter(
      (c) => c.is_active && (!type || c.type === type)
    );
  }

  const supabase = createAdminClient();
  let query = supabase.from("payment_credentials").select("*").eq("is_active", true);
  if (type) query = query.eq("type", type);
  const { data, error } = await query.order("label");
  if (error) throw error;
  return (data ?? []).map(mapCredential);
}

export async function listAllCredentialsAdmin(): Promise<PaymentCredential[]> {
  if (!hasSupabaseConfig()) return listDemoCredentials();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_credentials")
    .select("*")
    .order("label");
  if (error) throw error;
  return (data ?? []).map(mapCredential);
}

export async function upsertCredential(
  input: Omit<PaymentCredential, "created_at" | "updated_at" | "id"> & {
    id?: string;
  }
): Promise<PaymentCredential> {
  if (!hasSupabaseConfig()) {
    return saveDemoCredential({
      id: input.id ?? createDemoCredentialId(),
      label: input.label,
      type: input.type,
      details: input.details,
      is_active: input.is_active,
    });
  }

  const supabase = createAdminClient();
  const payload = {
    label: input.label,
    type: input.type,
    details: input.details,
    is_active: input.is_active,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("payment_credentials")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapCredential(data);
  }

  const { data, error } = await supabase
    .from("payment_credentials")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapCredential(data);
}

export async function removeCredential(id: string): Promise<void> {
  if (!hasSupabaseConfig()) {
    deleteDemoCredential(id);
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("payment_credentials").delete().eq("id", id);
  if (error) throw error;
}

export async function getCredential(id: string): Promise<PaymentCredential | null> {
  if (!hasSupabaseConfig()) return getDemoCredential(id);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_credentials")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCredential(data) : null;
}

async function revokeActiveOffersForOrder(reference: string): Promise<void> {
  if (!hasSupabaseConfig()) {
    revokeActiveDemoOffers(reference);
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("payment_offers")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("order_reference", reference)
    .eq("status", "active");
}

function isOfferTimedOut(offer: PaymentOffer): boolean {
  if (!offer.started_at || !offer.expires_at) return false;
  return new Date(offer.expires_at).getTime() <= Date.now();
}

export async function createPaymentOffer(input: {
  order_id: string;
  order_reference: string;
  credential_id: string | null;
  amount: number;
  currency: string;
  method_type: PaymentCredentialType;
  method_label: string;
  instructions: Record<string, string>;
  crypto_payment_id: CryptoPaymentId | null;
  expiry_minutes: number;
  created_by: string | null;
}): Promise<PaymentOffer> {
  const token = generatePaymentOfferToken();
  await revokeActiveOffersForOrder(input.order_reference);

  const payload = {
    ...input,
    token,
    status: "active" as const,
    started_at: null,
    expires_at: null,
  };

  if (!hasSupabaseConfig()) {
    return createDemoOffer(payload);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_offers")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapOffer(data);
}

export async function createOfferFromCredential(input: {
  order_id: string;
  order_reference: string;
  credential_id: string;
  amount: number;
  currency: string;
  expiry_minutes: number;
  created_by: string | null;
}): Promise<PaymentOffer> {
  const credential = await getCredential(input.credential_id);
  if (!credential || !credential.is_active) {
    throw new Error("Payment credential not found");
  }

  const snap = snapshotFromCredential(credential);
  return createPaymentOffer({
    order_id: input.order_id,
    order_reference: input.order_reference,
    credential_id: credential.id,
    amount: input.amount,
    currency: input.currency,
    method_type: snap.method_type,
    method_label: snap.method_label,
    instructions: snap.instructions,
    crypto_payment_id: null,
    expiry_minutes: input.expiry_minutes,
    created_by: input.created_by,
  });
}

export async function createCryptoOffer(input: {
  order_id: string;
  order_reference: string;
  amount: number;
  currency: string;
  crypto_payment_id: CryptoPaymentId;
  expiry_minutes: number;
  created_by: string | null;
}): Promise<PaymentOffer> {
  return createPaymentOffer({
    order_id: input.order_id,
    order_reference: input.order_reference,
    credential_id: null,
    amount: input.amount,
    currency: input.currency,
    method_type: "crypto",
    method_label: "Crypto",
    instructions: {},
    crypto_payment_id: input.crypto_payment_id,
    expiry_minutes: input.expiry_minutes,
    created_by: input.created_by,
  });
}

export async function listOffersForOrder(reference: string): Promise<PaymentOffer[]> {
  if (!hasSupabaseConfig()) return listDemoOffersForOrder(reference);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_offers")
    .select("*")
    .eq("order_reference", reference)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOffer);
}

async function syncOfferExpiry(offer: PaymentOffer): Promise<PaymentOffer> {
  if (offer.status !== "active" || !isOfferTimedOut(offer)) {
    return offer;
  }

  if (!hasSupabaseConfig()) {
    return expireDemoOfferIfNeeded(offer);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_offers")
    .update({ status: "expired" })
    .eq("id", offer.id)
    .eq("status", "active")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? mapOffer(data) : { ...offer, status: "expired" };
}

export async function startPaymentOffer(token: string): Promise<PaymentOffer | null> {
  const offer = await getOfferByToken(token);
  if (!offer || offer.status !== "active") return null;
  if (offer.started_at) return offer;

  const startedAt = new Date();
  const expiresAt = new Date(
    startedAt.getTime() + offer.expiry_minutes * 60 * 1000
  );
  const patch = {
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  if (!hasSupabaseConfig()) {
    return updateDemoOffer(offer.id, patch);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_offers")
    .update(patch)
    .eq("id", offer.id)
    .eq("status", "active")
    .is("started_at", null)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? mapOffer(data) : offer;
}

export async function updatePaymentOfferAdmin(
  id: string,
  input: {
    amount?: number;
    method_label?: string;
    instructions?: Record<string, string>;
    expiry_minutes?: number;
    revoke?: boolean;
    reset_timer?: boolean;
    sync_credential?: boolean;
  }
): Promise<PaymentOffer | null> {
  let offer: PaymentOffer | null;

  if (!hasSupabaseConfig()) {
    offer = getDemoOfferById(id);
  } else {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_offers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    offer = data ? mapOffer(data) : null;
  }

  if (!offer) return null;

  const patch: Partial<PaymentOffer> = {};

  if (input.revoke) {
    patch.status = "revoked";
    patch.revoked_at = new Date().toISOString();
  }

  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.method_label !== undefined) patch.method_label = input.method_label;
  if (input.instructions !== undefined) patch.instructions = input.instructions;
  if (input.expiry_minutes !== undefined) patch.expiry_minutes = input.expiry_minutes;

  if (input.sync_credential && offer.credential_id) {
    const credential = await getCredential(offer.credential_id);
    if (credential) {
      const snap = snapshotFromCredential(credential);
      patch.method_type = snap.method_type;
      patch.method_label = snap.method_label;
      patch.instructions = snap.instructions;
    }
  }

  if (input.reset_timer && offer.status === "active") {
    patch.started_at = null;
    patch.expires_at = null;
  } else if (
    offer.started_at &&
    input.expiry_minutes !== undefined &&
    offer.status === "active"
  ) {
    const startedAt = new Date(offer.started_at);
    patch.expires_at = new Date(
      startedAt.getTime() + input.expiry_minutes * 60 * 1000
    ).toISOString();
  }

  if (!hasSupabaseConfig()) {
    return updateDemoOffer(id, patch);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_offers")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapOffer(data);
}

export async function getOfferByToken(token: string): Promise<PaymentOffer | null> {
  let offer: PaymentOffer | null;

  if (!hasSupabaseConfig()) {
    offer = getDemoOfferByToken(token);
  } else {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_offers")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    offer = data ? mapOffer(data) : null;
  }

  if (!offer) return null;
  return syncOfferExpiry(offer);
}

export async function getOfferSubmission(
  offerId: string
): Promise<PaymentSubmission | null> {
  if (!hasSupabaseConfig()) return getDemoSubmissionForOffer(offerId);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("offer_id", offerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSubmission(data) : null;
}

export async function markOfferSubmitted(
  offerId: string,
  submission: Omit<PaymentSubmission, "id" | "offer_id" | "created_at">
): Promise<{ offer: PaymentOffer; submission: PaymentSubmission }> {
  const submittedAt = new Date().toISOString();

  if (!hasSupabaseConfig()) {
    const offer = updateDemoOffer(offerId, {
      status: "submitted",
      submitted_at: submittedAt,
    });
    if (!offer) throw new Error("Offer not found");
    const row = saveDemoSubmission({
      id: `demo-sub-${Date.now()}`,
      offer_id: offerId,
      ...submission,
    });
    return { offer, submission: row };
  }

  const supabase = createAdminClient();
  const { data: sub, error: subErr } = await supabase
    .from("payment_submissions")
    .insert({ offer_id: offerId, ...submission })
    .select("*")
    .single();
  if (subErr) throw subErr;

  const { data: offer, error: offerErr } = await supabase
    .from("payment_offers")
    .update({ status: "submitted", submitted_at: submittedAt })
    .eq("id", offerId)
    .select("*")
    .single();
  if (offerErr) throw offerErr;

  return { offer: mapOffer(offer), submission: mapSubmission(sub) };
}

export async function buildPublicOfferView(
  token: string
): Promise<PaymentOfferPublicView | null> {
  const offer = await getOfferByToken(token);
  if (!offer) return null;

  let customerName = "Customer";
  let eventTitle = "Event";

  if (hasSupabaseConfig()) {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("customer_name, event:events(title)")
      .eq("reference", offer.order_reference)
      .maybeSingle();
    if (order) {
      customerName = order.customer_name as string;
      const event = order.event as { title?: string } | null;
      eventTitle = event?.title ?? eventTitle;
    }
  } else {
    const { getDemoOrder } = await import("@/lib/orders/demo-store");
    const order = getDemoOrder(offer.order_reference);
    if (order) {
      customerName = order.customer_name;
      eventTitle = order.event_title;
    }
  }

  const expired =
    offer.status === "expired" ||
    (offer.status === "active" && isOfferTimedOut(offer));

  const started = Boolean(offer.started_at);

  const canSubmit =
    offer.status === "active" &&
    started &&
    !expired &&
    offer.method_type !== "crypto";

  return {
    token: offer.token,
    orderReference: offer.order_reference,
    amount: offer.amount,
    currency: offer.currency,
    methodType: offer.method_type,
    methodLabel: offer.method_label,
    instructions: formatInstructionRows(offer.method_type, offer.instructions),
    cryptoPaymentId: offer.crypto_payment_id,
    expiryMinutes: offer.expiry_minutes,
    started,
    expiresAt: offer.expires_at,
    status: expired && offer.status === "active" ? "expired" : offer.status,
    expired,
    canSubmit,
    customerName,
    eventTitle,
  };
}

export async function uploadPaymentReceipt(
  token: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${token}/${Date.now()}.${ext}`;

  if (!hasSupabaseConfig()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mime = file.type || "image/jpeg";
    return `data:${mime};base64,${base64}`;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("payment-receipts")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("payment-receipts").getPublicUrl(path);
  return data.publicUrl;
}
