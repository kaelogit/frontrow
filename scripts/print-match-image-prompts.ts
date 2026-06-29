/**
 * Print AI image prompts for World Cup match heroes.
 *
 *   npm run prompts:match-images
 *   npm run prompts:match-images -- 82
 *   npm run prompts:match-images -- 80 89 104
 */

import {
  MATCH_IMAGE_SPECS,
  TEAM_MATCH_SPECS,
  buildMatchImagePrompt,
  buildTeamMatchImagePrompt,
  getMatchImageSpec,
  getTeamMatchImageSpec,
} from "../src/lib/marketing/match-image-prompts";

const args = process.argv.slice(2).filter((a) => a !== "--");

function printMatch(matchNumber: string) {
  const team = getTeamMatchImageSpec(matchNumber);
  if (team) {
    console.log(`\n=== Match ${matchNumber} (team art) ===`);
    console.log(`Output: public/images/events/match-${matchNumber}.jpg`);
    console.log(`Teams: ${team.homeTeam} vs ${team.awayTeam}`);
    console.log(buildTeamMatchImagePrompt(team));
    return;
  }

  const neutral = getMatchImageSpec(matchNumber);
  if (neutral) {
    console.log(`\n=== Match ${matchNumber} (neutral art) ===`);
    console.log(`Output: public/images/events/match-${matchNumber}.jpg`);
    console.log(buildMatchImagePrompt(neutral));
    return;
  }

  console.error(`No spec for match ${matchNumber}`);
}

if (args.length === 0) {
  const numbers = new Set<string>();
  for (const s of TEAM_MATCH_SPECS) numbers.add(s.matchNumber);
  for (const s of MATCH_IMAGE_SPECS) numbers.add(s.matchNumber);
  const sorted = [...numbers].sort((a, b) => Number(a) - Number(b));
  console.log(`# ${sorted.length} match image prompts\n`);
  for (const n of sorted) printMatch(n);
} else {
  for (const n of args) printMatch(n);
}
