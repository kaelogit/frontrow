/** Client-safe analytics configuration (NEXT_PUBLIC_* only). */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const PLAUSIBLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? "https://plausible.io/js/script.js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function analyticsEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID || PLAUSIBLE_DOMAIN || POSTHOG_KEY);
}
