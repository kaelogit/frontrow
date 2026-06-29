interface PostHogClient {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  init: (
    token: string,
    config?: Record<string, unknown>,
    name?: string
  ) => void;
}

interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  plausible?: (
    event: string,
    options?: { props?: Record<string, string | number | boolean>; u?: string }
  ) => void;
  posthog?: PostHogClient;
}
