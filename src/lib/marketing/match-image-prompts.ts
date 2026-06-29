/**
 * Neutral match hero art for TBD / knockout fixtures.
 * Output: public/images/events/match-{n}.jpg
 *
 * Rules (strict):
 * - NO national flags, team colors, club crests, or colored supporter scarves
 * - NO identifiable national-team kits or implied favorites
 * - YES: stadium architecture, empty pitch, floodlights, World Cup ball/trophy,
 *   generic football legends (formal wear / silhouette / back-to-camera)
 *
 * When both teams are confirmed later, regenerate with team-specific art.
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

/** Matches with a generated neutral image on disk (update as batches complete) */
export const GENERATED_NEUTRAL_MATCH_IMAGES = new Set<string>([
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
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
  // Round of 32
  {
    matchNumber: "80",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    round: "round-of-32",
    scene: "Mercedes-Benz halo roof oculus, dramatic light on empty pitch, knockout-round gravitas",
  },
  {
    matchNumber: "81",
    venue: "Levi's Stadium",
    city: "Santa Clara",
    round: "round-of-32",
    scene: "Levi's Stadium sweeping red seats empty, California hills beyond, World Cup ball on penalty spot",
  },
  {
    matchNumber: "82",
    venue: "Lumen Field",
    city: "Seattle",
    round: "round-of-32",
    scene: "Lumen Field at dusk, misty atmosphere, tunnel mouth leading to lit pitch, no fans in color",
  },
  {
    matchNumber: "83",
    venue: "BMO Field",
    city: "Toronto",
    round: "round-of-32",
    scene: "BMO Field intimate bowl, Toronto towers in background, empty pitch, international tournament mood",
  },
  {
    matchNumber: "84",
    venue: "SoFi Stadium",
    city: "Inglewood",
    round: "round-of-32",
    scene: "SoFi translucent canopy from inside, sleek modern bowl, LA sunset through roof panels",
  },
  {
    matchNumber: "85",
    venue: "BC Place",
    city: "Vancouver",
    round: "round-of-32",
    scene: "BC Place domed roof interior, mountain mural screens, empty pitch, Pacific Northwest evening",
  },
  {
    matchNumber: "86",
    venue: "Hard Rock Stadium",
    city: "Miami Gardens",
    round: "round-of-32",
    scene: "Hard Rock Stadium open-air bowl, palm trees beyond upper deck, tropical sunset, empty field",
  },
  {
    matchNumber: "87",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    round: "round-of-32",
    scene: "Arrowhead Stadium vast bowl aerial angle, Midwest sky, empty pitch, legendary venue scale",
  },
  {
    matchNumber: "88",
    venue: "AT&T Stadium",
    city: "Arlington",
    round: "round-of-32",
    scene: "AT&T Stadium interior, massive center videoboard, cavernous empty bowl, Texas scale",
  },
  // Round of 16
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

export function buildMatchImagePrompt(spec: MatchImageSpec): string {
  const roundLabel = spec.round.replace(/-/g, " ");
  return `${BASE}. ${roundLabel} host venue: ${spec.venue}, ${spec.city}. ${spec.scene}. ${NEUTRAL_RULES}.`;
}

export function getMatchImageSpec(matchNumber: string): MatchImageSpec | undefined {
  return MATCH_IMAGE_SPECS.find((s) => s.matchNumber === matchNumber);
}

export function hasNeutralMatchImage(matchNumber: string | null | undefined): boolean {
  return matchNumber != null && GENERATED_NEUTRAL_MATCH_IMAGES.has(matchNumber);
}
