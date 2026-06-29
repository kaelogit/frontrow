import type { AnalyticsProps } from "@/lib/analytics/events";

function scrubProps(props?: AnalyticsProps): Record<string, string | number | boolean> {
  if (!props) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

/** Send a custom event to every enabled analytics provider. */
export function track(event: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;

  const clean = scrubProps(props);

  if (typeof window.gtag === "function") {
    window.gtag("event", event, clean);
  }

  if (typeof window.plausible === "function") {
    window.plausible(
      event,
      Object.keys(clean).length > 0 ? { props: clean } : undefined
    );
  }

  if (window.posthog?.capture) {
    window.posthog.capture(event, clean);
  }
}

/** Manual pageview for App Router navigations (Plausible + PostHog; GA uses gtag config). */
export function trackPageView(url?: string): void {
  if (typeof window === "undefined") return;

  const href = url ?? window.location.href;
  const path = window.location.pathname + window.location.search;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path, page_location: href });
  }

  if (typeof window.plausible === "function") {
    window.plausible("pageview", { u: href });
  }

  if (window.posthog?.capture) {
    window.posthog.capture("$pageview", { $current_url: href });
  }
}
