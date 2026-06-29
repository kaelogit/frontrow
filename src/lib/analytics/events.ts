/** Funnel steps: event → tickets → checkout → reservation/order. */

export const FunnelEvent = {
  EVENT_VIEW: "event_view",
  EVENT_CARD_CLICK: "event_card_click",
  TICKETS_OPEN: "tickets_open",
  CHECKOUT_START: "checkout_start",
  RESERVATION_SUBMIT: "reservation_submit",
  ORDER_COMPLETE: "order_complete",
} as const;

export type FunnelEventName = (typeof FunnelEvent)[keyof typeof FunnelEvent];

export type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;
