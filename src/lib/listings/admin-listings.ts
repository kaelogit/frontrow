import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import { getMockListingsForEvent } from "@/lib/data/mock-listings";
import { BC_PLACE_SECTION_MAP } from "@/lib/stadium/bc-place-sections";
import { METLIFE_SECTION_MAP } from "@/lib/stadium/metlife-sections";
import { SOFI_SECTION_MAP } from "@/lib/stadium/sofi-sections";
import { LEVIS_SECTION_MAP } from "@/lib/stadium/levis-sections";
import type { EventWithRelations, TicketListing } from "@/types/database";
import type { SectionZone } from "@/lib/stadium/bc-place-sections";

export async function getAdminListingsForEvent(
  eventId: string
): Promise<TicketListing[]> {
  if (shouldUseMockData()) {
    return getMockListingsForEvent(eventId);
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ticket_listings")
    .select("*")
    .eq("event_id", eventId)
    .order("price", { ascending: true });

  if (error) {
    console.error("[admin] getAdminListingsForEvent:", error.message);
    return [];
  }

  return (data ?? []) as TicketListing[];
}

export function getSectionOptionsForEvent(event: EventWithRelations): {
  sections: string[];
  zones: { value: SectionZone; label: string }[];
} {
  const zones = [
    { value: "cat-1" as const, label: "Category 1" },
    { value: "cat-2" as const, label: "Category 2" },
    { value: "cat-3" as const, label: "Category 3" },
    { value: "cat-4" as const, label: "Category 4" },
  ];

  if (event.venue?.stadium_map_slug === "bc-place") {
    return {
      sections: Array.from(BC_PLACE_SECTION_MAP.keys()).sort(
        (a, b) => Number(a) - Number(b)
      ),
      zones,
    };
  }

  if (event.venue?.stadium_map_slug === "metlife") {
    return {
      sections: Array.from(METLIFE_SECTION_MAP.keys()).sort(
        (a, b) => Number(a) - Number(b)
      ),
      zones,
    };
  }

  if (event.venue?.stadium_map_slug === "sofi") {
    return {
      sections: Array.from(SOFI_SECTION_MAP.keys()).sort(
        (a, b) => Number(a) - Number(b)
      ),
      zones,
    };
  }

  if (event.venue?.stadium_map_slug === "levis") {
    return {
      sections: Array.from(LEVIS_SECTION_MAP.keys()).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
      zones,
    };
  }

  return { sections: [], zones };
}

export function listingZone(sectionNumber: string | null): SectionZone | null {
  if (!sectionNumber) return null;
  return (
    BC_PLACE_SECTION_MAP.get(sectionNumber)?.zone ??
    METLIFE_SECTION_MAP.get(sectionNumber)?.zone ??
    SOFI_SECTION_MAP.get(sectionNumber)?.zone ??
    LEVIS_SECTION_MAP.get(sectionNumber)?.zone ??
    null
  );
}

export async function recalculateEventMinPrice(eventId: string) {
  if (!hasSupabaseConfig()) return;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ticket_listings")
    .select("price")
    .eq("event_id", eventId)
    .eq("status", "available")
    .gt("quantity_available", 0)
    .order("price", { ascending: true })
    .limit(1);

  const minPrice = data?.[0]?.price ?? null;

  await supabase
    .from("events")
    .update({ min_price: minPrice })
    .eq("id", eventId);
}
