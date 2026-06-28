import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import type { StadiumMap, StadiumRow, StadiumSection, Venue } from "@/types/database";

export async function getAdminVenues(): Promise<Venue[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin] getAdminVenues:", error.message);
    return [];
  }

  return (data ?? []) as Venue[];
}

export async function getAdminVenueById(id: string): Promise<Venue | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("[admin] getAdminVenueById:", error.message);
    return null;
  }

  return (data as Venue) ?? null;
}

export async function getStadiumMapForVenue(venueId: string): Promise<StadiumMap | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stadium_maps")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[admin] getStadiumMapForVenue:", error.message);
    return null;
  }

  return (data as StadiumMap) ?? null;
}

export async function getStadiumSectionsForVenue(venueId: string): Promise<StadiumSection[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stadium_sections")
    .select("*")
    .eq("venue_id", venueId)
    .order("section_number", { ascending: true });

  if (error) {
    console.error("[admin] getStadiumSectionsForVenue:", error.message);
    return [];
  }

  return (data ?? []) as StadiumSection[];
}

export async function countSectionsForVenue(venueId: string): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("stadium_sections")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId);

  if (error) return 0;
  return count ?? 0;
}

export interface StadiumSectionWithRows extends StadiumSection {
  stadium_rows: StadiumRow[];
}

export async function getStadiumSectionsWithRows(
  venueId: string
): Promise<StadiumSectionWithRows[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stadium_sections")
    .select("*, stadium_rows(*)")
    .eq("venue_id", venueId)
    .order("section_number", { ascending: true });

  if (error) {
    console.error("[admin] getStadiumSectionsWithRows:", error.message);
    return [];
  }

  const sections = (data ?? []) as StadiumSectionWithRows[];
  for (const section of sections) {
    section.stadium_rows = (section.stadium_rows ?? []).sort(
      (a, b) => a.sort_order - b.sort_order || a.row_label.localeCompare(b.row_label)
    );
  }
  return sections;
}

/** section_number → row labels (for listing form datalist). */
export async function getRowLabelsBySectionForVenue(
  venueId: string
): Promise<Record<string, string[]>> {
  const sections = await getStadiumSectionsWithRows(venueId);
  const map: Record<string, string[]> = {};
  for (const section of sections) {
    map[section.section_number] = section.stadium_rows.map((r) => r.row_label);
  }
  return map;
}

export async function countRowsForVenue(venueId: string): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  const supabase = createAdminClient();
  const { data: sections } = await supabase
    .from("stadium_sections")
    .select("id")
    .eq("venue_id", venueId);

  if (!sections?.length) return 0;

  const { count, error } = await supabase
    .from("stadium_rows")
    .select("*", { count: "exact", head: true })
    .in(
      "section_id",
      sections.map((s) => s.id)
    );

  if (error) return 0;
  return count ?? 0;
}
