import type { AdminOrder } from "@/lib/orders/demo-store";
import type { EventWithRelations } from "@/types/database";
import type { EmailEventContext } from "@/emails/types";

export function eventToEmailContext(event: EventWithRelations): EmailEventContext {
  return {
    title: event.title,
    slug: event.slug,
    date: event.event_date,
    time: event.event_time,
    subtitle: event.subtitle,
    imageUrl: event.image_url,
    matchNumber: event.match_number,
    venueName: event.venue?.name ?? null,
    venueCity: event.venue?.city ?? null,
    venueCountry: event.venue?.country ?? null,
    competitionSlug: event.competition?.slug ?? null,
  };
}

export function orderToEmailContext(order: AdminOrder): EmailEventContext {
  return {
    title: order.event_title,
    slug: order.event_slug,
    date: order.event_date,
    time: order.event_time,
    subtitle: order.event_subtitle,
    imageUrl: order.event_image_url,
    matchNumber: order.match_number,
    venueName: order.venue_name,
    venueCity: order.venue_city,
    venueCountry: order.venue_country,
  };
}

export function fallbackEventContext(slug: string, title?: string): EmailEventContext {
  return {
    title: title ?? slug,
    slug,
  };
}
