"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  listingFormToRecord,
  parseListingForm,
} from "@/lib/listings/listing-form";
import {
  getAdminListingsForEvent,
  listingZone,
  recalculateEventMinPrice,
} from "@/lib/listings/admin-listings";
import { getAdminEventById } from "@/lib/events/admin-events";

async function guard(eventId: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" as const };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to manage listings." as const };
  }

  const event = await getAdminEventById(eventId);
  if (!event) return { error: "Event not found" as const };

  return { event };
}

function revalidateListingPaths(eventId: string, slug: string) {
  revalidatePath(`/admin/events/${eventId}/listings`);
  revalidatePath(`/events/${slug}`);
  revalidatePath(`/events/${slug}/tickets`);
  revalidatePath("/admin/events");
}

export async function createListingAction(eventId: string, formData: FormData) {
  const result = await guard(eventId);
  if ("error" in result) return result;

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid listing data" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ticket_listings")
    .insert(listingFormToRecord(parsed.data, eventId));

  if (error) {
    console.error(error);
    return { error: "Failed to create listing" };
  }

  await recalculateEventMinPrice(eventId);
  revalidateListingPaths(eventId, result.event.slug);

  return { success: true };
}

export async function updateListingAction(
  eventId: string,
  listingId: string,
  formData: FormData
) {
  const result = await guard(eventId);
  if ("error" in result) return result;

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid listing data" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ticket_listings")
    .update(listingFormToRecord(parsed.data, eventId))
    .eq("id", listingId)
    .eq("event_id", eventId);

  if (error) {
    console.error(error);
    return { error: "Failed to update listing" };
  }

  await recalculateEventMinPrice(eventId);
  revalidateListingPaths(eventId, result.event.slug);

  return { success: true };
}

export async function deleteListingAction(eventId: string, listingId: string) {
  const result = await guard(eventId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ticket_listings")
    .delete()
    .eq("id", listingId)
    .eq("event_id", eventId);

  if (error) {
    console.error(error);
    return { error: "Failed to delete listing" };
  }

  await recalculateEventMinPrice(eventId);
  revalidateListingPaths(eventId, result.event.slug);

  return { success: true };
}

export async function duplicateListingAction(eventId: string, listingId: string) {
  const result = await guard(eventId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { data: source, error: fetchError } = await supabase
    .from("ticket_listings")
    .select("*")
    .eq("id", listingId)
    .eq("event_id", eventId)
    .single();

  if (fetchError || !source) {
    return { error: "Listing not found" };
  }

  const { id: _id, created_at: _ca, ...copy } = source as Record<string, unknown>;

  const { error } = await supabase.from("ticket_listings").insert({
    ...copy,
    status: "available",
    quantity_available: copy.quantity,
  });

  if (error) {
    console.error(error);
    return { error: "Failed to duplicate listing" };
  }

  await recalculateEventMinPrice(eventId);
  revalidateListingPaths(eventId, result.event.slug);

  return { success: true };
}

export async function bulkAdjustPricesAction(
  eventId: string,
  formData: FormData
) {
  const result = await guard(eventId);
  if ("error" in result) return result;

  const zone = formData.get("zone") as string | null;
  const adjustType = formData.get("adjust_type") as string;
  const adjustValue = Number(formData.get("adjust_value"));

  if (!zone || !adjustType || Number.isNaN(adjustValue)) {
    return { error: "Invalid bulk adjust parameters" };
  }

  const listings = await getAdminListingsForEvent(eventId);
  const matching = listings.filter(
    (l) => l.section_number && listingZone(l.section_number) === zone
  );

  if (matching.length === 0) {
    return { error: "No listings in that zone" };
  }

  const supabase = createAdminClient();

  for (const listing of matching) {
    let newPrice = listing.price;
    if (adjustType === "percent") {
      newPrice = Math.round(listing.price * (1 + adjustValue / 100));
    } else {
      newPrice = Math.max(1, Math.round(listing.price + adjustValue));
    }

    await supabase
      .from("ticket_listings")
      .update({ price: newPrice })
      .eq("id", listing.id);
  }

  await recalculateEventMinPrice(eventId);
  revalidateListingPaths(eventId, result.event.slug);

  return { success: true, updated: matching.length };
}
