import type { Team } from "@/types/database";

/** ISO 3166-1 alpha-2 (or flagcdn subdivision codes) → local SVG in public/flags/ */
const SLUG_TO_ISO: Record<string, string> = {
  algeria: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgium: "be",
  "bosnia-herzegovina": "ba",
  brazil: "br",
  "cabo-verde": "cv",
  canada: "ca",
  colombia: "co",
  "congo-dr": "cd",
  "cote-divoire": "ci",
  croatia: "hr",
  curacao: "cw",
  czechia: "cz",
  ecuador: "ec",
  egypt: "eg",
  england: "gb-eng",
  france: "fr",
  germany: "de",
  ghana: "gh",
  haiti: "ht",
  iran: "ir",
  iraq: "iq",
  japan: "jp",
  jordan: "jo",
  "south-korea": "kr",
  mexico: "mx",
  morocco: "ma",
  netherlands: "nl",
  "new-zealand": "nz",
  norway: "no",
  panama: "pa",
  paraguay: "py",
  portugal: "pt",
  qatar: "qa",
  "saudi-arabia": "sa",
  scotland: "gb-sct",
  senegal: "sn",
  "south-africa": "za",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  tunisia: "tn",
  turkiye: "tr",
  usa: "us",
  uruguay: "uy",
  uzbekistan: "uz",
};

const EMOJI_FALLBACK: Record<string, string> = {
  algeria: "🇩🇿",
  argentina: "🇦🇷",
  australia: "🇦🇺",
  austria: "🇦🇹",
  belgium: "🇧🇪",
  "bosnia-herzegovina": "🇧🇦",
  brazil: "🇧🇷",
  "cabo-verde": "🇨🇻",
  canada: "🇨🇦",
  colombia: "🇨🇴",
  "congo-dr": "🇨🇩",
  "cote-divoire": "🇨🇮",
  croatia: "🇭🇷",
  curacao: "🇨🇼",
  czechia: "🇨🇿",
  ecuador: "🇪🇨",
  egypt: "🇪🇬",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  france: "🇫🇷",
  germany: "🇩🇪",
  ghana: "🇬🇭",
  haiti: "🇭🇹",
  iran: "🇮🇷",
  iraq: "🇮🇶",
  japan: "🇯🇵",
  jordan: "🇯🇴",
  "south-korea": "🇰🇷",
  mexico: "🇲🇽",
  morocco: "🇲🇦",
  netherlands: "🇳🇱",
  "new-zealand": "🇳🇿",
  norway: "🇳🇴",
  panama: "🇵🇦",
  paraguay: "🇵🇾",
  portugal: "🇵🇹",
  qatar: "🇶🇦",
  "saudi-arabia": "🇸🇦",
  scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  senegal: "🇸🇳",
  "south-africa": "🇿🇦",
  spain: "🇪🇸",
  sweden: "🇸🇪",
  switzerland: "🇨🇭",
  tunisia: "🇹🇳",
  turkiye: "🇹🇷",
  usa: "🇺🇸",
  uruguay: "🇺🇾",
  uzbekistan: "🇺🇿",
};

/** All World Cup 2026 participant flag files under public/flags/ */
export const TEAM_FLAG_ISO_CODES = [...new Set(Object.values(SLUG_TO_ISO))].sort();

export const TBD_FLAG_PATH = "/flags/tbd.svg";

export function getTeamIsoCode(team: Team): string | null {
  return SLUG_TO_ISO[team.slug] ?? null;
}

export function getTeamIsoBySlug(slug: string): string | null {
  return SLUG_TO_ISO[slug] ?? null;
}

export function getTeamFlagPath(iso: string): string {
  return `/flags/${iso}.svg`;
}

/** Local SVG path for a team, or null if slug unknown */
export function getTeamFlagImageUrl(team: Team): string | null {
  const iso = getTeamIsoCode(team);
  if (!iso) return null;
  return getTeamFlagPath(iso);
}

export function getTeamFlagImageUrlBySlug(slug: string): string | null {
  const iso = getTeamIsoBySlug(slug);
  if (!iso) return null;
  return getTeamFlagPath(iso);
}

export function getTeamFlagEmoji(team: Team): string | null {
  return EMOJI_FALLBACK[team.slug] ?? null;
}

export function hasTeamFlagAsset(team: Team): boolean {
  return Boolean(getTeamIsoCode(team));
}
