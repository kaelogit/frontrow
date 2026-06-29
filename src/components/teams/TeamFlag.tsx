import Image from "next/image";
import type { Team } from "@/types/database";
import {
  getTeamFlagEmoji,
  getTeamFlagImageUrl,
  TBD_FLAG_PATH,
} from "@/lib/teams/flags";
import { cn } from "@/lib/utils";

interface TeamFlagProps {
  team: Team;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface TbdFlagProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { w: 20, h: 15, class: "h-[15px] w-5" },
  md: { w: 32, h: 24, class: "h-6 w-8" },
  lg: { w: 48, h: 36, class: "h-9 w-12" },
} as const;

export function TbdFlag({ size = "md", className }: TbdFlagProps) {
  const dim = SIZE[size];
  return (
    <Image
      src={TBD_FLAG_PATH}
      alt="TBD"
      width={dim.w}
      height={dim.h}
      className={cn("rounded-sm object-cover", dim.class, className)}
      unoptimized
    />
  );
}

export function TeamFlag({ team, size = "md", className }: TeamFlagProps) {
  const url = getTeamFlagImageUrl(team);
  const emoji = getTeamFlagEmoji(team);
  const dim = SIZE[size];

  if (url) {
    return (
      <Image
        src={url}
        alt={`${team.name} flag`}
        width={dim.w}
        height={dim.h}
        className={cn("rounded-sm object-cover shadow-sm", dim.class, className)}
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
