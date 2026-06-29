/** Lightweight bowl silhouettes for listing-card mini-maps (no per-section paths). */

export interface BowlProfile {
  cx: number;
  cy: number;
  sx: number;
  sy: number;
  /** Stroke radii — outer to inner */
  rings: number[];
}

export const BOWL_PROFILES: Record<string, BowlProfile> = {
  "bc-place": { cx: 400, cy: 302, sx: 1.36, sy: 0.68, rings: [248, 190, 155] },
  metlife: { cx: 400, cy: 318, sx: 1.44, sy: 0.64, rings: [252, 168] },
  sofi: { cx: 400, cy: 310, sx: 1.4, sy: 0.66, rings: [298, 222, 162] },
  levis: { cx: 400, cy: 328, sx: 1.45, sy: 0.7, rings: [258, 192, 156, 100] },
};

export const DEFAULT_BOWL_PROFILE: BowlProfile = {
  cx: 400,
  cy: 310,
  sx: 1.38,
  sy: 0.68,
  rings: [250, 180, 120],
};

export function getBowlProfile(mapSlug: string | null | undefined): BowlProfile {
  if (!mapSlug) return DEFAULT_BOWL_PROFILE;
  return BOWL_PROFILES[mapSlug] ?? DEFAULT_BOWL_PROFILE;
}
