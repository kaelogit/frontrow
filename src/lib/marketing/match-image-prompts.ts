/**
 * Match hero art for World Cup fixtures.
 * Output: public/images/events/match-{n}.jpg
 *
 * Neutral art (TBD knockouts): stadium only, no team colors.
 * Team art (confirmed fixtures): split supporter sections with national colors.
 */

export type MatchImageRound =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarterfinal"
  | "semifinal"
  | "third-place"
  | "final";

export interface MatchImageSpec {
  matchNumber: string;
  venue: string;
  city: string;
  round: MatchImageRound;
  /** Stadium architecture + neutral football mood — never team colors */
  scene: string;
}

export interface TeamMatchImageSpec {
  matchNumber: string;
  homeTeam: string;
  awayTeam: string;
  homeColors: string;
  awayColors: string;
  venue: string;
  city: string;
  round: MatchImageRound;
}

/** Matches with generated team-specific art (confirmed teams) */
export const TEAM_MATCH_IMAGES = new Set<string>([
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
]);

/** Matches with neutral-only art on disk (TBD / knockout placeholders) */
export const GENERATED_NEUTRAL_MATCH_IMAGES = new Set<string>([
  "89",
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
  "100",
  "101",
  "102",
  "103",
  "104",
]);

const NEUTRAL_RULES =
  "STRICT: no national flags, no team or club colors, no crests, no colored scarves, no national jerseys, no implied supporter allegiance. Crowd if visible must wear neutral black/grey clothing only from a distance. Focus on stadium, football culture, and occasion.";

const BASE =
  "Cinematic sports photography for a ticket marketplace hero, FIFA World Cup 2026, photorealistic, golden hour or floodlit drama, lush green pitch, no readable text or logos, no watermarks, 16:10 aspect ratio";

export const MATCH_IMAGE_SPECS: MatchImageSpec[] = [
  // Group (known teams — still neutral until team art is requested)
  {
    matchNumber: "63",
    venue: "Lumen Field",
    city: "Seattle",
    round: "group",
    scene: "Lumen Field partial roof and open corners, Pacific Northwest skyline, official World Cup ball alone on center circle",
  },
  {
    matchNumber: "65",
    venue: "NRG Stadium",
    city: "Houston",
    round: "group",
    scene: "NRG Stadium retractable roof open to Texas sky, empty lower bowl, golden trophy silhouette on pitch edge",
  },
  {
    matchNumber: "66",
    venue: "Estadio Akron",
    city: "Guadalajara",
    round: "group",
    scene: "Estadio Akron exterior at sunset, modern Mexican stadium lines, Sierra Madre backdrop, no team branding",
  },
  {
    matchNumber: "68",
    venue: "Lincoln Financial Field",
    city: "Philadelphia",
    round: "group",
    scene: "Lincoln Financial Field bowl from upper tier, city skyline distant, pristine empty pitch under lights",
  },
  // Round of 16 (R32 matches 80–88 use TEAM_MATCH_SPECS)
  {
    matchNumber: "89",
    venue: "Lincoln Financial Field",
    city: "Philadelphia",
    round: "round-of-16",
    scene: "Night match floodlights over empty Lincoln Financial Field, Philadelphia glow on horizon",
  },
  {
    matchNumber: "90",
    venue: "NRG Stadium",
    city: "Houston",
    round: "round-of-16",
    scene: "NRG Stadium interior night, roof open, spotlight on center circle, knockout tension",
  },
  {
    matchNumber: "91",
    venue: "MetLife Stadium",
    city: "East Rutherford",
    round: "round-of-16",
    scene: "MetLife Stadium exterior at twilight, massive dual-club bowl hosting World Cup, empty approach",
  },
  {
    matchNumber: "92",
    venue: "Estadio Azteca",
    city: "Mexico City",
    round: "round-of-16",
    scene: "Estadio Azteca legendary bowl, volcanic peaks beyond, empty pitch, football cathedral mood",
  },
  {
    matchNumber: "93",
    venue: "AT&T Stadium",
    city: "Arlington",
    round: "round-of-16",
    scene: "AT&T Stadium at night, videoboard glow, empty pitch, Round of 16 occasion without text",
  },
  {
    matchNumber: "94",
    venue: "Lumen Field",
    city: "Seattle",
    round: "round-of-16",
    scene: "Rain-slick Lumen Field pitch under lights, empty stands, atmospheric Pacific Northwest night",
  },
  {
    matchNumber: "95",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    round: "round-of-16",
    scene: "Mercedes-Benz halo ring lit gold, empty pitch, Atlanta skyline through open end",
  },
  {
    matchNumber: "96",
    venue: "BC Place",
    city: "Vancouver",
    round: "round-of-16",
    scene: "BC Place closed roof interior, white dome, empty pitch, international tournament stage",
  },
  // Quarterfinals — homepage
  {
    matchNumber: "97",
    venue: "Gillette Stadium",
    city: "Foxborough",
    round: "quarterfinal",
    scene: "Gillette Stadium lighthouse architecture, empty pitch, quarterfinal prestige, New England summer sky, former football legend in dark suit walking through tunnel back to camera",
  },
  {
    matchNumber: "98",
    venue: "SoFi Stadium",
    city: "Inglewood",
    round: "quarterfinal",
    scene: "SoFi Stadium sweeping roof at sunset, empty world-class pitch, quarterfinal occasion, Hollywood Hills distant",
  },
  {
    matchNumber: "99",
    venue: "Hard Rock Stadium",
    city: "Miami Gardens",
    round: "quarterfinal",
    scene: "Hard Rock Stadium tropical open bowl, palm silhouettes, empty pitch, Miami quarterfinal glamour",
  },
  {
    matchNumber: "100",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    round: "quarterfinal",
    scene: "Arrowhead Stadium epic scale, empty red seats only (venue color not team), stormy summer sky, World Cup ball on center spot",
  },
  // Semifinals — homepage
  {
    matchNumber: "101",
    venue: "AT&T Stadium",
    city: "Arlington",
    round: "semifinal",
    scene: "AT&T Stadium semifinal spectacle, empty pitch, giant screen dark, football icon statue silhouette near tunnel, semifinal gravitas",
  },
  {
    matchNumber: "102",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    round: "semifinal",
    scene: "Mercedes-Benz halo roof, empty pitch, golden FIFA World Cup trophy on pedestal in foreground blur, semifinal stage",
  },
  // Third place
  {
    matchNumber: "103",
    venue: "Hard Rock Stadium",
    city: "Miami Gardens",
    round: "third-place",
    scene: "Hard Rock Stadium evening, empty pitch, bronze-medal match mood, tropical night without team colors",
  },
  // Final
  {
    matchNumber: "104",
    venue: "MetLife Stadium",
    city: "East Rutherford",
    round: "final",
    scene: "MetLife Stadium colossal dual-bowl at night, New York skyline glow on horizon, empty pristine pitch under full floodlights, golden FIFA World Cup trophy on center circle, ultimate final gravitas",
  },
];

export const TEAM_MATCH_SPECS: TeamMatchImageSpec[] = [
  {
    matchNumber: "80",
    homeTeam: "England",
    awayTeam: "Congo DR",
    homeColors: "white jerseys with red Saint George cross, red and white scarves",
    awayColors: "red jerseys with yellow and green accents, Congolese flag scarves",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    round: "round-of-32",
  },
  {
    matchNumber: "81",
    homeTeam: "United States",
    awayTeam: "Bosnia and Herzegovina",
    homeColors: "red white and blue jerseys, USA scarves",
    awayColors: "blue jerseys with yellow accents, Bosnia flag scarves",
    venue: "Levi's Stadium",
    city: "Santa Clara",
    round: "round-of-32",
  },
  {
    matchNumber: "82",
    homeTeam: "Belgium",
    awayTeam: "Senegal",
    homeColors: "red black and yellow jerseys, Belgian scarves",
    awayColors: "white green and yellow jerseys, Senegalese scarves",
    venue: "Lumen Field",
    city: "Seattle",
    round: "round-of-32",
  },
  {
    matchNumber: "83",
    homeTeam: "Portugal",
    awayTeam: "Croatia",
    homeColors: "red and green jerseys, Portuguese scarves",
    awayColors: "red and white checkered jerseys, Croatian scarves",
    venue: "BMO Field",
    city: "Toronto",
    round: "round-of-32",
  },
  {
    matchNumber: "84",
    homeTeam: "Spain",
    awayTeam: "Austria",
    homeColors: "red and yellow jerseys, Spanish scarves",
    awayColors: "red and white jerseys, Austrian scarves",
    venue: "SoFi Stadium",
    city: "Inglewood",
    round: "round-of-32",
  },
  {
    matchNumber: "85",
    homeTeam: "Switzerland",
    awayTeam: "Algeria",
    homeColors: "red and white jerseys, Swiss scarves",
    awayColors: "green white and red jerseys, Algerian scarves",
    venue: "BC Place",
    city: "Vancouver",
    round: "round-of-32",
  },
  {
    matchNumber: "86",
    homeTeam: "Argentina",
    awayTeam: "Cabo Verde",
    homeColors: "white and sky blue striped jerseys, Argentine scarves",
    awayColors: "blue white and red jerseys, Cape Verde scarves",
    venue: "Hard Rock Stadium",
    city: "Miami Gardens",
    round: "round-of-32",
  },
  {
    matchNumber: "87",
    homeTeam: "Colombia",
    awayTeam: "Ghana",
    homeColors: "yellow blue and red jerseys, Colombian scarves",
    awayColors: "yellow red and green jerseys with black star, Ghana scarves",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    round: "round-of-32",
  },
  {
    matchNumber: "88",
    homeTeam: "Australia",
    awayTeam: "Egypt",
    homeColors: "yellow and green jerseys, Australian scarves",
    awayColors: "red white and black jerseys, Egyptian scarves",
    venue: "AT&T Stadium",
    city: "Arlington",
    round: "round-of-32",
  },
];

const TEAM_BASE =
  "Cinematic wide-angle sports photography for a ticket marketplace hero, FIFA World Cup 2026, packed stadium crowd viewed from behind supporters in lower stands, photorealistic, lush green pitch visible, golden hour lighting, no readable text, no watermarks, 16:10 aspect ratio";

export function buildTeamMatchImagePrompt(spec: TeamMatchImageSpec): string {
  const roundLabel = spec.round.replace(/-/g, " ");
  return `${TEAM_BASE}. ${roundLabel} at ${spec.venue}, ${spec.city}. Crowd split down the middle: left side ${spec.homeTeam} supporters in ${spec.homeColors}, right side ${spec.awayTeam} supporters in ${spec.awayColors}, fans raising scarves, iconic stadium architecture in background.`;
}

export function getTeamMatchImageSpec(
  matchNumber: string
): TeamMatchImageSpec | undefined {
  return TEAM_MATCH_SPECS.find((s) => s.matchNumber === matchNumber);
}

export function buildMatchImagePrompt(spec: MatchImageSpec): string {
  const roundLabel = spec.round.replace(/-/g, " ");
  return `${BASE}. ${roundLabel} host venue: ${spec.venue}, ${spec.city}. ${spec.scene}. ${NEUTRAL_RULES}.`;
}

export function getMatchImageSpec(matchNumber: string): MatchImageSpec | undefined {
  return MATCH_IMAGE_SPECS.find((s) => s.matchNumber === matchNumber);
}

export function hasNeutralMatchImage(matchNumber: string | null | undefined): boolean {
  if (matchNumber == null) return false;
  return (
    TEAM_MATCH_IMAGES.has(matchNumber) ||
    GENERATED_NEUTRAL_MATCH_IMAGES.has(matchNumber)
  );
}
