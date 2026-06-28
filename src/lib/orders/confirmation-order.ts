import { getEventBySlug } from "@/lib/data/events";
import { getEventImage } from "@/lib/images";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import type { AdminOrder } from "@/lib/orders/demo-store";
import type { OrderStatus, PaymentMethod } from "@/types/database";

export interface ConfirmationOrder {
  reference: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  currency: string;
  reservedUntil: string | null;
  paidAt: string | null;
  ticketSentAt: string | null;
  items: AdminOrder["items"];
  event: {
    title: string;
    slug: string;
    subtitle: string | null;
    eventDate: string;
    eventTime: string | null;
    imageUrl: string;
    venueName: string | null;
    venueCity: string | null;
    venueCountry: string | null;
    matchNumber: string | null;
  } | null;
}

async function resolveEventMeta(order: AdminOrder): Promise<ConfirmationOrder["event"]> {
  if (order.event_date && order.event_slug) {
    const imageUrl =
      order.event_image_url ??
      getEventImage(
        order.event_slug,
        "world-cup-2026",
        order.match_number ?? undefined
      );

    return {
      title: order.event_title,
      slug: order.event_slug,
      subtitle: order.event_subtitle ?? null,
      eventDate: order.event_date,
      eventTime: order.event_time ?? null,
      imageUrl,
      venueName: order.venue_name ?? null,
      venueCity: order.venue_city ?? null,
      venueCountry: order.venue_country ?? null,
      matchNumber: order.match_number ?? null,
    };
  }

  if (!order.event_slug) return null;

  const event = await getEventBySlug(order.event_slug);
  if (!event) {
    return {
      title: order.event_title,
      slug: order.event_slug,
      subtitle: null,
      eventDate: "",
      eventTime: null,
      imageUrl: getEventImage(order.event_slug, "world-cup-2026", order.match_number ?? undefined),
      venueName: null,
      venueCity: null,
      venueCountry: null,
      matchNumber: order.match_number ?? null,
    };
  }

  return {
    title: event.title,
    slug: event.slug,
    subtitle: event.subtitle,
    eventDate: event.event_date,
    eventTime: event.event_time,
    imageUrl: getEventImage(
      event.slug,
      event.competition?.slug,
      event.match_number
    ),
    venueName: event.venue?.name ?? null,
    venueCity: event.venue?.city ?? null,
    venueCountry: event.venue?.country ?? null,
    matchNumber: event.match_number ?? null,
  };
}

export async function getConfirmationOrder(
  reference: string
): Promise<ConfirmationOrder | null> {
  const order = await getAdminOrderByReference(reference);
  if (!order) return null;

  const event = await resolveEventMeta(order);

  return {
    reference: order.reference,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    status: order.status,
    paymentMethod: order.payment_method,
    totalAmount: order.total_amount,
    currency: order.currency,
    reservedUntil: order.reserved_until,
    paidAt: order.paid_at,
    ticketSentAt: order.ticket_sent_at,
    items: order.items,
    event,
  };
}
