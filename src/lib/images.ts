/** Marketing & event image paths (generated assets in /public/images) */
import { hasNeutralMatchImage } from "@/lib/marketing/match-image-prompts";

export const IMAGES = {
  hero: "/images/hero-stadium.jpg",
  experience: "/images/marketing-experience.jpg",
  categories: {
    "world-cup-2026": "/images/category-world-cup.jpg",
    "premier-league": "/images/category-premier-league.jpg",
    nba: "/images/category-nba.jpg",
    concerts: "/images/category-concerts.jpg",
  },
  events: {
    "brazil-vs-scotland": "/images/event-brazil-scotland.jpg",
    "new-zealand-vs-belgium": "/images/event-new-zealand-belgium.jpg",
    "mexico-vs-usa": "/images/event-mexico-usa.jpg",
    "germany-vs-england": "/images/event-germany-england.jpg",
    "germany-vs-winner-match-88": "/images/event-germany-england.jpg",
  },
} as const;

/** Placeholder URLs that should not override per-match stadium art */
const GENERIC_EVENT_IMAGES = new Set<string>([
  "/images/category-world-cup.jpg",
  "/images/hero-stadium.jpg",
]);

/** Per-match hero art — files live at public/images/events/match-{n}.jpg */
export function getMatchImagePath(matchNumber: string | null | undefined): string | null {
  if (!matchNumber) return null;
  return `/images/events/match-${matchNumber}.jpg`;
}

export function hasDedicatedEventImage(
  slug: string,
  matchNumber: string | null | undefined,
  imageUrl: string | null | undefined
): boolean {
  return resolveEventHeroImage(slug, null, matchNumber, imageUrl).usePhoto;
}

export function getEventImage(
  slug: string,
  competitionSlug?: string | null,
  matchNumber?: string | null
) {
  return resolveEventHeroImage(slug, competitionSlug, matchNumber, null).src;
}

/**
 * Pick the best hero image for an event card or detail header.
 * Per-match neutral stadium art wins over generic category placeholders.
 */
export function resolveEventHeroImage(
  slug: string,
  competitionSlug: string | null | undefined,
  matchNumber: string | null | undefined,
  imageUrl: string | null | undefined
): { src: string; usePhoto: boolean } {
  if (hasNeutralMatchImage(matchNumber)) {
    return { src: getMatchImagePath(matchNumber)!, usePhoto: true };
  }

  if (slug in IMAGES.events) {
    return {
      src: IMAGES.events[slug as keyof typeof IMAGES.events],
      usePhoto: true,
    };
  }

  if (imageUrl && !GENERIC_EVENT_IMAGES.has(imageUrl)) {
    return { src: imageUrl, usePhoto: true };
  }

  if (competitionSlug && competitionSlug in IMAGES.categories) {
    return {
      src: IMAGES.categories[competitionSlug as keyof typeof IMAGES.categories],
      usePhoto: false,
    };
  }

  return { src: IMAGES.hero, usePhoto: false };
}

export function getCategoryImage(slug: string) {
  if (slug in IMAGES.categories) {
    return IMAGES.categories[slug as keyof typeof IMAGES.categories];
  }
  return IMAGES.hero;
}
