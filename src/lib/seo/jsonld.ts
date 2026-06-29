import type { EventWithRelations, Venue } from "@/types/database";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/site-metadata";
import { buildEventSeoDescription } from "@/lib/seo/event-metadata";
import { buildAggregateRatingJsonLd } from "@/lib/seo/marketplace-rating";
import { countryToIso, getVenueGeo } from "@/lib/seo/venue-geo";

type JsonLdObject = Record<string, unknown>;

function eventStartIso(event: EventWithRelations): string {
  const time = event.event_time ?? "12:00:00";
  const normalized = time.length === 5 ? `${time}:00` : time;
  return `${event.event_date}T${normalized}`;
}

function eventStatusUrl(status: EventWithRelations["status"]): string {
  switch (status) {
    case "cancelled":
      return "https://schema.org/EventCancelled";
    case "completed":
      return "https://schema.org/EventScheduled";
    case "sold_out":
    case "scheduled":
    default:
      return "https://schema.org/EventScheduled";
  }
}

function offerAvailability(status: EventWithRelations["status"]): string {
  if (status === "sold_out") return "https://schema.org/SoldOut";
  if (status === "cancelled") return "https://schema.org/Discontinued";
  return "https://schema.org/InStock";
}

function buildSellerOrganization(): JsonLdObject {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    aggregateRating: buildAggregateRatingJsonLd(),
  };
}

function buildVenueLocation(venue: Venue): JsonLdObject {
  const geo = getVenueGeo(venue.slug);
  const countryCode = countryToIso(venue.country);

  const location: JsonLdObject = {
    "@type": "StadiumOrArena",
    name: venue.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: venue.city,
      addressCountry: countryCode ?? venue.country,
    },
  };

  if (venue.capacity) {
    location.maximumAttendeeCapacity = venue.capacity;
  }

  if (geo) {
    location.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  return location;
}

function buildTicketOffer(event: EventWithRelations, url: string): JsonLdObject {
  return {
    "@type": "Offer",
    name: `Tickets for ${event.title}`,
    url,
    price: event.min_price,
    priceCurrency: event.currency,
    availability: offerAvailability(event.status),
    validFrom: new Date().toISOString().slice(0, 10),
    itemCondition: "https://schema.org/NewCondition",
    category: "Event Tickets",
    seller: buildSellerOrganization(),
  };
}

function buildPerformers(event: EventWithRelations): JsonLdObject[] | undefined {
  const performers: JsonLdObject[] = [];

  const home = event.home_team?.name ?? event.home_team_label;
  const away = event.away_team?.name ?? event.away_team_label;

  if (home) {
    performers.push({ "@type": "SportsTeam", name: home });
  }
  if (away) {
    performers.push({ "@type": "SportsTeam", name: away });
  }

  return performers.length ? performers : undefined;
}

/** Schema.org SportsEvent with venue geo, ticket offers, and seller rating */
export function buildSportsEventJsonLd(
  event: EventWithRelations,
  imagePath: string
): JsonLdObject {
  const url = absoluteUrl(`/events/${event.slug}`);
  const description = buildEventSeoDescription(event);

  const sportsEvent: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.title,
    description,
    url,
    image: absoluteUrl(imagePath),
    startDate: eventStartIso(event),
    eventStatus: eventStatusUrl(event.status),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: {
      "@type": "SportsOrganization",
      name: event.competition?.name ?? "FIFA World Cup 2026",
    },
    performer: buildPerformers(event),
  };

  if (event.venue) {
    sportsEvent.location = buildVenueLocation(event.venue);
  }

  if (event.min_price != null && event.min_price > 0 && event.status !== "cancelled") {
    sportsEvent.offers = buildTicketOffer(event, url);
  }

  return sportsEvent;
}

/** BreadcrumbList for event detail pages */
export function buildEventBreadcrumbJsonLd(
  event: EventWithRelations
): JsonLdObject {
  const items: JsonLdObject[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Events",
      item: absoluteUrl("/events"),
    },
  ];

  if (event.competition?.slug === "world-cup-2026") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: "World Cup 2026",
      item: absoluteUrl("/world-cup-2026"),
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: event.title,
    item: absoluteUrl(`/events/${event.slug}`),
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/** Standalone StadiumOrArena node (optional supplement for venue-heavy pages) */
export function buildVenueJsonLd(venue: Venue, eventUrl?: string): JsonLdObject {
  const geo = getVenueGeo(venue.slug);
  return {
    "@context": "https://schema.org",
    ...buildVenueLocation(venue),
    ...(eventUrl ? { url: eventUrl } : {}),
    ...(geo
      ? { hasMap: `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}` }
      : {}),
  };
}

/** Collection page + item list for city / stage hubs */
export function buildCollectionPageJsonLd({
  name,
  description,
  path,
  events,
}: {
  name: string;
  description: string;
  path: string;
  events: EventWithRelations[];
}): JsonLdObject {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: events.length,
      itemListElement: events.slice(0, 50).map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: event.title,
        url: absoluteUrl(`/events/${event.slug}`),
      })),
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Organization + aggregate rating for site trust signals */
export function buildMarketplaceOrganizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    aggregateRating: buildAggregateRatingJsonLd(),
  };
}
