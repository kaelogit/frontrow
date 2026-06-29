export { analyticsEnabled, GA_MEASUREMENT_ID, PLAUSIBLE_DOMAIN, POSTHOG_KEY } from "@/lib/analytics/config";
export { FunnelEvent, type AnalyticsProps, type FunnelEventName } from "@/lib/analytics/events";
export { track, trackPageView } from "@/lib/analytics/track";
export {
  trackCheckoutStart,
  trackEventCardClick,
  trackEventView,
  trackOrderComplete,
  trackReservationSubmit,
  trackTicketsOpen,
  type EventAnalyticsContext,
} from "@/lib/analytics/funnel";
