import type { EventWithRelations } from "@/types/database";
import { getViagogoLiveMeta } from "@/lib/marketing/viagogo-live";

export function getEventTicketHref(event: { slug: string; seat_map_enabled?: boolean | null }): string {
  if (event.seat_map_enabled) {
    return `/events/${event.slug}?tickets=1`;
  }
  return `/events/${event.slug}`;
}

/** Remaining inventory as % of total (lower = scarcer). */
export function getEventScarcityPercent(event: EventWithRelations): number | null {
  if (event.scarcity_override != null) {
    return event.scarcity_override;
  }

  const categories = event.ticket_categories ?? [];
  if (categories.length === 0) return null;

  const total = categories.reduce((sum, c) => sum + c.quantity_total, 0);
  const available = categories.reduce((sum, c) => sum + c.quantity_available, 0);

  if (total === 0) return null;

  return Math.max(1, Math.round((available / total) * 100));
}

export interface EventScarcityBadge {
  label: string;
  className: string;
}

export function getEventScarcityBadge(
  event: EventWithRelations
): EventScarcityBadge | null {
  const viagogo = getViagogoLiveMeta(event.match_number);
  if (viagogo?.hottest) {
    return {
      label: "Hottest event",
      className: "bg-amber-500 text-white",
    };
  }

  const percent = getEventScarcityPercent(event);

  if (percent != null && percent <= 5) {
    return {
      label: `Only ${percent}% of tickets left`,
      className: "bg-pink-600 text-white",
    };
  }

  if (percent != null && percent <= 15) {
    return {
      label: `Only ${percent}% left`,
      className: "bg-pink-100 text-pink-800",
    };
  }

  if (event.status === "scheduled" && event.min_price == null) {
    return {
      label: "On sale soon",
      className: "bg-slate-100 text-slate-600",
    };
  }

  return null;
}

export function formatMatchLabel(subtitle: string | null): string | null {
  if (!subtitle) return null;
  return subtitle.replace(/ · World Cup 2026$/i, "").trim() || subtitle;
}

export function formatEventDateColumn(
  eventDate: string,
  eventTime: string | null
): { day: string; weekday: string; month: string; time: string | null } {
  const dt = new Date(`${eventDate}T${eventTime ?? "12:00"}`);
  return {
    weekday: dt.toLocaleDateString("en-US", { weekday: "short" }),
    day: dt.toLocaleDateString("en-US", { day: "numeric" }),
    month: dt.toLocaleDateString("en-US", { month: "short" }),
    time: eventTime
      ? dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : null,
  };
}
