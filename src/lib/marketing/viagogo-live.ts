/**
 * Matches currently on sale at viagogo (30 events).
 * Group anchors 63–66 & 68, then knockout bracket from Match 80.
 * Matches 67 and 69–79 intentionally excluded (no marketplace inventory).
 */
export interface ViagogoLiveMeta {
  matchNumber: number;
  scarcityPercent: number | null;
  hottest?: boolean;
}

export const VIAGOGO_LIVE_MATCHES: ViagogoLiveMeta[] = [
  { matchNumber: 63, scarcityPercent: 2 },
  { matchNumber: 64, scarcityPercent: 1 },
  { matchNumber: 65, scarcityPercent: 1 },
  { matchNumber: 66, scarcityPercent: 1 },
  { matchNumber: 68, scarcityPercent: 2 },
  { matchNumber: 80, scarcityPercent: null },
  { matchNumber: 81, scarcityPercent: null },
  { matchNumber: 82, scarcityPercent: null },
  { matchNumber: 83, scarcityPercent: null },
  { matchNumber: 84, scarcityPercent: null },
  { matchNumber: 85, scarcityPercent: null },
  { matchNumber: 86, scarcityPercent: 3 },
  { matchNumber: 87, scarcityPercent: null },
  { matchNumber: 88, scarcityPercent: null },
  { matchNumber: 89, scarcityPercent: null },
  { matchNumber: 90, scarcityPercent: 4 },
  { matchNumber: 91, scarcityPercent: 4 },
  { matchNumber: 92, scarcityPercent: 2 },
  { matchNumber: 93, scarcityPercent: 3 },
  { matchNumber: 94, scarcityPercent: 4 },
  { matchNumber: 95, scarcityPercent: null },
  { matchNumber: 96, scarcityPercent: 4 },
  { matchNumber: 97, scarcityPercent: 4 },
  { matchNumber: 98, scarcityPercent: 3 },
  { matchNumber: 99, scarcityPercent: 3 },
  { matchNumber: 100, scarcityPercent: 4 },
  { matchNumber: 101, scarcityPercent: 3 },
  { matchNumber: 102, scarcityPercent: 3 },
  { matchNumber: 103, scarcityPercent: 2 },
  { matchNumber: 104, scarcityPercent: 3, hottest: true },
];

const LIVE_BY_MATCH = new Map(
  VIAGOGO_LIVE_MATCHES.map((m) => [String(m.matchNumber), m])
);

export function getViagogoLiveMeta(matchNumber: string | null | undefined): ViagogoLiveMeta | null {
  if (!matchNumber) return null;
  return LIVE_BY_MATCH.get(matchNumber) ?? null;
}

export function isViagogoLiveMatch(matchNumber: string | null | undefined): boolean {
  return matchNumber != null && LIVE_BY_MATCH.has(matchNumber);
}

export function enrichEventWithViagogoLive<T extends { match_number?: string | null; scarcity_override?: number | null }>(
  event: T
): T {
  const meta = getViagogoLiveMeta(event.match_number);
  if (!meta?.scarcityPercent) return event;
  if (event.scarcity_override != null) return event;
  return { ...event, scarcity_override: meta.scarcityPercent };
}
