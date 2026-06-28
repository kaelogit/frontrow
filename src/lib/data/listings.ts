import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import { getMockListingsForEvent } from "@/lib/data/mock-listings";
import { releaseExpiredInventory } from "@/lib/inventory/holds";
import type { TicketListing } from "@/types/database";

export async function getListingsForEvent(eventId: string): Promise<TicketListing[]> {
  if (shouldUseMockData()) {
    return getMockListingsForEvent(eventId);
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  await releaseExpiredInventory();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_listings")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "available")
    .gt("quantity_available", 0)
    .order("price", { ascending: true });

  if (error) {
    console.error("[listings] getListingsForEvent:", error.message);
    return [];
  }

  return (data ?? []) as TicketListing[];
}
