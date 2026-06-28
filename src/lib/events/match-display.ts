import type { EventWithRelations, Team } from "@/types/database";
import { getTeamFlagEmoji } from "@/lib/teams/flags";

export interface EventMatchSide {
  label: string;
  flag: string | null;
  isTbd: boolean;
  team?: Team | null;
}

export interface EventMatchDisplay {
  home: EventMatchSide;
  away: EventMatchSide;
  headline: string;
  hasTbd: boolean;
}

export function getTeamFlag(team: Team): string | null {
  return getTeamFlagEmoji(team);
}

export function normalizeWinnerMatchLabel(label: string): string {
  const trimmed = label.trim();
  const match = /^Winner Match (\d+)$/i.exec(trimmed);
  if (match) return `W${match[1]}`;
  return trimmed;
}

function normalizeWinnerMatchText(text: string): string {
  return text.replace(/Winner Match (\d+)/gi, (_, n: string) => `W${n}`);
}

function resolveSide(
  team: Team | null | undefined,
  label: string | null | undefined
): EventMatchSide {
  if (team) {
    return {
      label: team.name,
      flag: getTeamFlag(team),
      isTbd: false,
      team,
    };
  }

  const display = normalizeWinnerMatchLabel(label?.trim() || "TBD");
  return {
    label: display,
    flag: null,
    isTbd: true,
  };
}

export function getEventMatchDisplay(event: EventWithRelations): EventMatchDisplay {
  const home = resolveSide(event.home_team, event.home_team_label);
  const away = resolveSide(event.away_team, event.away_team_label);

  const builtHeadline = `${home.label} vs ${away.label}`;
  const headline =
    home.isTbd || away.isTbd
      ? normalizeWinnerMatchText(event.title.trim() || builtHeadline)
      : builtHeadline;

  return {
    home,
    away,
    headline,
    hasTbd: home.isTbd || away.isTbd,
  };
}

export function eventHasTbdTeams(event: EventWithRelations): boolean {
  return !event.home_team_id || !event.away_team_id;
}
