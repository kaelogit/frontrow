import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import type { Competition, EventWithRelations, Team, Venue } from "@/types/database";
import { getEvents } from "@/lib/data/events";

export interface AdminLookups {
  competitions: Competition[];
  teams: Team[];
  venues: Venue[];
}

export async function getAdminLookups(): Promise<AdminLookups> {
  if (!hasSupabaseConfig()) {
    return { competitions: [], teams: [], venues: [] };
  }

  const supabase = createAdminClient();
  const [competitions, teams, venues] = await Promise.all([
    supabase.from("competitions").select("*").order("name"),
    supabase.from("teams").select("*").order("name"),
    supabase.from("venues").select("*").order("name"),
  ]);

  return {
    competitions: (competitions.data ?? []) as Competition[],
    teams: (teams.data ?? []) as Team[],
    venues: (venues.data ?? []) as Venue[],
  };
}

export async function getAdminEvents(): Promise<EventWithRelations[]> {
  if (shouldUseMockData()) {
    return getEvents();
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      competition:competitions(*),
      home_team:teams!events_home_team_id_fkey(*),
      away_team:teams!events_away_team_id_fkey(*),
      venue:venues(*),
      ticket_categories(*),
      ticket_listings(quantity_available)
    `
    )
    .order("event_date", { ascending: true });

  if (error) {
    console.error("[admin] getAdminEvents:", error.message);
    return [];
  }

  return (data ?? []) as EventWithRelations[];
}

export async function getAdminEventById(id: string): Promise<EventWithRelations | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      competition:competitions(*),
      home_team:teams!events_home_team_id_fkey(*),
      away_team:teams!events_away_team_id_fkey(*),
      venue:venues(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EventWithRelations;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return false;
  }

  const supabase = createAdminClient();
  let query = supabase.from("events").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.maybeSingle();
  return Boolean(data);
}
