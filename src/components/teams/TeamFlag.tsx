import Image from "next/image";
import type { Team } from "@/types/database";
import { getTeamFlagEmoji, getTeamFlagImageUrl } from "@/lib/teams/flags";
import { cn } from "@/lib/utils";

interface TeamFlagProps {
  team: Team;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { img: 20, class: "h-5 w-7" },
  md: { img: 32, class: "h-8 w-11" },
  lg: { img: 48, class: "h-12 w-16" },
} as const;

export function TeamFlag({ team, size = "md", className }: TeamFlagProps) {
  const url = getTeamFlagImageUrl(team, SIZE[size].img);
  const emoji = getTeamFlagEmoji(team);

  if (url) {
    return (
      <Image
        src={url}
        alt={`${team.name} flag`}
        width={SIZE[size].img}
        height={Math.round(SIZE[size].img * 0.75)}
        className={cn("rounded-sm object-cover shadow-sm", SIZE[size].class, className)}
        unoptimized
      />
    );
  }

  if (emoji) {
    return (
      <span className={cn("leading-none", className)} aria-hidden>
        {emoji}
      </span>
    );
  }

  return null;
}
