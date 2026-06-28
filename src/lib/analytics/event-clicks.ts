const STORAGE_KEY = "frontrowly:event-clicks";

/** Default order when no click data exists yet (editorial + high-demand matches). */
export const FALLBACK_TRENDING_SLUGS = [
  "world-cup-final-match-104",
  "world-cup-qf-match-98",
  "new-zealand-vs-belgium",
  "world-cup-match-99",
  "world-cup-match-100",
  "world-cup-match-97",
  "uruguay-vs-spain",
  "world-cup-match-101",
  "world-cup-match-102",
  "world-cup-match-86",
  "world-cup-match-94",
  "croatia-vs-ghana",
] as const;

type ClickMap = Record<string, number>;

function readClicks(): ClickMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ClickMap;
  } catch {
    return {};
  }
}

function writeClicks(clicks: ClickMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
  } catch {
    /* quota / private mode */
  }
}

export function trackEventClick(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const clicks = readClicks();
  clicks[slug] = (clicks[slug] ?? 0) + 1;
  writeClicks(clicks);
}

/** Slugs sorted by click count (desc), then fallback editorial order. */
export function getTrendingSlugs(limit = 6): string[] {
  const clicks = readClicks();
  const clicked = Object.entries(clicks)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);

  const merged = [...clicked];
  for (const slug of FALLBACK_TRENDING_SLUGS) {
    if (!merged.includes(slug)) merged.push(slug);
  }

  return merged.slice(0, limit);
}
