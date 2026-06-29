import { FunnelEvent, type AnalyticsProps } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { OrderStatus, PaymentMethod } from "@/types/database";

export interface EventAnalyticsContext {
  slug: string;
  matchNumber?: string | number | null;
  competitionSlug?: string | null;
}

function eventProps(ctx: EventAnalyticsContext): AnalyticsProps {
  return {
    event_slug: ctx.slug,
    match_number: ctx.matchNumber ?? undefined,
    competition: ctx.competitionSlug ?? undefined,
  };
}

export function trackEventView(ctx: EventAnalyticsContext): void {
  track(FunnelEvent.EVENT_VIEW, eventProps(ctx));
}

export function trackEventCardClick(slug: string): void {
  track(FunnelEvent.EVENT_CARD_CLICK, { event_slug: slug });
}

export function trackTicketsOpen(ctx: EventAnalyticsContext): void {
  track(FunnelEvent.TICKETS_OPEN, eventProps(ctx));
}

export function trackCheckoutStart(
  ctx: EventAnalyticsContext & { itemCount: number; total?: number; currency?: string }
): void {
  track(FunnelEvent.CHECKOUT_START, {
    ...eventProps(ctx),
    item_count: ctx.itemCount,
    total: ctx.total,
    currency: ctx.currency,
  });
}

export function trackReservationSubmit(
  ctx: EventAnalyticsContext & {
    reference: string;
    paymentMethod: PaymentMethod;
    total?: number;
    currency?: string;
  }
): void {
  track(FunnelEvent.RESERVATION_SUBMIT, {
    ...eventProps(ctx),
    order_reference: ctx.reference,
    payment_method: ctx.paymentMethod,
    total: ctx.total,
    currency: ctx.currency,
  });
}

export function trackOrderComplete(props: {
  reference: string;
  eventSlug: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total?: number;
  currency?: string;
}): void {
  track(FunnelEvent.ORDER_COMPLETE, {
    order_reference: props.reference,
    event_slug: props.eventSlug,
    payment_method: props.paymentMethod,
    order_status: props.status,
    total: props.total,
    currency: props.currency,
  });
}
