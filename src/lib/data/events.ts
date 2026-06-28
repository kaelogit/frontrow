import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import {
  getMockEventBySlug,
  getMockFeaturedEvents,
  mockCompetitions,
  mockEvents,
} from "@/lib/data/mock";
import {
  applyBrowseFilters,
  type EventBrowseFilters,
} from "@/lib/events/browse-filters";
import { filterUpcomingEvents } from "@/lib/events/upcoming";
import {
  enrichEventWithViagogoLive,
  isViagogoLiveMatch,
} from "@/lib/marketing/viagogo-live";
import type { Competition, EventWithRelations } from "@/types/database";

function enrichEvent(row: Record<string, unknown>): EventWithRelations {
  return enrichEventWithViagogoLive(row as unknown as EventWithRelations);
}

function finalizeEvents(events: EventWithRelations[]): EventWithRelations[] {
  return filterUpcomingEvents(events).map(enrichEventWithViagogoLive);
}

function filterMockEvents(filters?: EventBrowseFilters): EventWithRelations[] {
  const parsed = filters ?? {};
  let events = [...mockEvents];

  if (parsed.competition) {
    events = events.filter((e) => e.competition?.slug === parsed.competition);
  }

  return finalizeEvents(applyBrowseFilters(events, parsed));
}

function filterToViagogoLiveIfWorldCup(
  events: EventWithRelations[],
  filters?: EventBrowseFilters
): EventWithRelations[] {
  if (filters?.competition !== "world-cup-2026") return events;
  return events.filter((e) => isViagogoLiveMatch(e.match_number));
}

const WORLD_CUP_FINAL_SLUG = "world-cup-final-match-104";

export async function getWorldCupFinalEvent(): Promise<EventWithRelations | null> {
  const event = await getEventBySlug(WORLD_CUP_FINAL_SLUG);
  if (!event) return null;
  return isEventUpcoming(event) ? enrichEventWithViagogoLive(event) : null;
}

function isEventUpcoming(event: EventWithRelations): boolean {
  return filterUpcomingEvents([event]).length > 0;
}

/** Marketplace-live matches (viagogo catalogue) that are still upcoming. */
export async function getViagogoLiveEvents(): Promise<EventWithRelations[]> {
  const events = await getEvents({ competition: "world-cup-2026" });
  return events
    .filter((e) => isViagogoLiveMatch(e.match_number))
    .sort((a, b) => a.event_date.localeCompare(b.event_date) || (a.event_time ?? "").localeCompare(b.event_time ?? ""));
}

export async function getFeaturedEvents(): Promise<EventWithRelations[]> {
  if (shouldUseMockData()) {
    return finalizeEvents(getMockFeaturedEvents());
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      competition:competitions(*),
      home_team:teams!events_home_team_id_fkey(*),
      away_team:teams!events_away_team_id_fkey(*),
      venue:venues(*),
      ticket_categories(*)
    `
    )
    .eq("featured", true)
    .eq("status", "scheduled")
    .order("event_date", { ascending: true })
    .limit(24);

  if (error) {
    console.error("[events] getFeaturedEvents:", error.message);
    return [];
  }

  return finalizeEvents((data ?? []).map(enrichEvent));
}

export async function getEvents(
  filters?: EventBrowseFilters
): Promise<EventWithRelations[]> {
  if (shouldUseMockData()) {
    return filterToViagogoLiveIfWorldCup(filterMockEvents(filters), filters);
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createClient();

  let competitionId: string | null = null;
  if (filters?.competition) {
    const { data: comp } = await supabase
      .from("competitions")
      .select("id")
      .eq("slug", filters.competition)
      .maybeSingle();
    competitionId = comp?.id ?? null;
    if (!competitionId) {
      return [];
    }
  }

  let query = supabase
    .from("events")
    .select(
      `
      *,
      competition:competitions(*),
      home_team:teams!events_home_team_id_fkey(*),
      away_team:teams!events_away_team_id_fkey(*),
      venue:venues(*),
      ticket_categories(*)
    `
    )
    .eq("status", "scheduled")
    .order("event_date", { ascending: true });

  if (competitionId) {
    query = query.eq("competition_id", competitionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[events] getEvents:", error.message);
    return [];
  }

  let events = filterToViagogoLiveIfWorldCup(
    finalizeEvents((data ?? []).map(enrichEvent)),
    filters
  );

  return applyBrowseFilters(events, filters ?? {});
}

export async function getEventBySlug(slug: string): Promise<EventWithRelations | null> {
  if (shouldUseMockData()) {
    const event = getMockEventBySlug(slug);
    return event ? enrichEventWithViagogoLive(event) : null;
  }

  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      competition:competitions(*),
      home_team:teams!events_home_team_id_fkey(*),
      away_team:teams!events_away_team_id_fkey(*),
      venue:venues(*),
      ticket_categories(*)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[events] getEventBySlug:", error.message);
    }
    return null;
  }

  const categories = (data.ticket_categories as EventWithRelations["ticket_categories"]) ?? [];
  data.ticket_categories = categories.sort((a, b) => a.sort_order - b.sort_order);

  return enrichEventWithViagogoLive(mapEvent(data));
}

function mapEvent(row: Record<string, unknown>): EventWithRelations {
  return row as unknown as EventWithRelations;
}

export async function getCompetitions(): Promise<Competition[]> {
  if (shouldUseMockData()) {
    return mockCompetitions;
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("featured", { ascending: false })
    .order("name");

  if (error) {
    console.error("[events] getCompetitions:", error.message);
    return [];
  }

  return (data ?? []) as Competition[];
}
