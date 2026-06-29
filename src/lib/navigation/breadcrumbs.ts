import { getEventMatchDisplay } from "@/lib/events/match-display";
import {
  WORLD_CUP_CITY_PAGES,
  type WorldCupCity,
} from "@/lib/marketing/world-cup-cities";
import {
  WORLD_CUP_STAGE_PAGES,
  stagePageHref,
  type WorldCupStage,
} from "@/lib/marketing/world-cup-stages";
import type { EventWithRelations } from "@/types/database";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbTail =
  | "event"
  | "tickets"
  | "checkout"
  | "review"
  | "queue";

const TAIL_LABELS: Record<Exclude<BreadcrumbTail, "event" | "review">, string> = {
  tickets: "Select tickets",
  checkout: "Checkout",
  queue: "Waiting room",
};

export function eventCrumbLabel(event: EventWithRelations): string {
  if (event.match_number != null) {
    return `Match ${event.match_number}`;
  }
  return getEventMatchDisplay(event).headline;
}

export function findWorldCupCityForEvent(
  event: EventWithRelations
): WorldCupCity | undefined {
  const venue = event.venue;
  if (!venue) return undefined;

  const haystack = [
    venue.slug,
    venue.name,
    venue.city,
    venue.country,
    event.title,
    event.subtitle ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return WORLD_CUP_CITY_PAGES.find((city) =>
    city.matchTerms.some((term) => haystack.includes(term.toLowerCase()))
  );
}

export function findWorldCupStageForEvent(
  event: EventWithRelations
): WorldCupStage | undefined {
  const haystack = `${event.title} ${event.subtitle ?? ""}`;
  return WORLD_CUP_STAGE_PAGES.find((stage) => stage.searchTerms.test(haystack));
}

export function buildEventBreadcrumbs(
  event: EventWithRelations,
  tail: BreadcrumbTail = "event",
  tailLabel?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  if (event.competition?.slug === "world-cup-2026") {
    items.push({ label: "World Cup 2026", href: "/world-cup-2026" });

    const city = findWorldCupCityForEvent(event);
    if (city) {
      items.push({ label: city.name, href: `/world-cup-2026/${city.slug}` });
    }

    const stage = findWorldCupStageForEvent(event);
    if (stage) {
      items.push({ label: stage.shortTitle, href: stagePageHref(stage.slug) });
    }
  } else {
    items.push({ label: "Events", href: "/events" });
  }

  const eventLabel = eventCrumbLabel(event);
  const eventHref = `/events/${event.slug}`;

  if (tail === "event") {
    items.push({ label: eventLabel });
  } else {
    items.push({ label: eventLabel, href: eventHref });

    if (tail === "review") {
      items.push({ label: tailLabel ?? "Review listing" });
    } else {
      items.push({ label: TAIL_LABELS[tail] });
    }
  }

  return items;
}

export function breadcrumbCurrentPath(
  event: EventWithRelations,
  tail: BreadcrumbTail = "event"
): string {
  switch (tail) {
    case "tickets":
      return `/events/${event.slug}?tickets=1`;
    case "checkout":
      return `/events/${event.slug}/checkout`;
    case "review":
      return `/events/${event.slug}/tickets/review`;
    case "queue":
      return `/events/${event.slug}/queue`;
    case "event":
    default:
      return `/events/${event.slug}`;
  }
}
