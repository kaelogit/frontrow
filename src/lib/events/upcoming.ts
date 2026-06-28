import type { EventWithRelations } from "@/types/database";
import { getSiteNow } from "@/lib/events/site-clock";

/** Kickoff in local event_date + event_time (tournament schedule times). */
export function getEventKickoff(event: EventWithRelations): Date {
  const time = event.event_time?.slice(0, 5) ?? "23:59";
  return new Date(`${event.event_date}T${time}:00`);
}

/** Hide matches that have already kicked off. */
export function isEventUpcoming(
  event: EventWithRelations,
  now: Date = getSiteNow()
): boolean {
  if (event.status !== "scheduled") return false;
  return getEventKickoff(event).getTime() > now.getTime();
}

export function filterUpcomingEvents(
  events: EventWithRelations[],
  now?: Date
): EventWithRelations[] {
  return events.filter((e) => isEventUpcoming(e, now));
}
