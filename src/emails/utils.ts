import { getEventImage } from "@/lib/images";
import { SITE_URL } from "@/lib/constants";
import type { EmailEventContext } from "@/emails/types";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function absoluteUrl(path: string, siteUrl = SITE_URL): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveEventImageUrl(event: EmailEventContext): string {
  if (event.imageUrl) {
    return absoluteUrl(event.imageUrl);
  }
  const path = getEventImage(
    event.slug,
    event.competitionSlug,
    event.matchNumber ?? undefined
  );
  return absoluteUrl(path);
}
