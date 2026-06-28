import { HelpCircle } from "lucide-react";
import type { EventWithRelations, Team } from "@/types/database";
import { TeamFlag } from "@/components/teams/TeamFlag";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { cn } from "@/lib/utils";

interface MatchTeamsRowProps {
  event: EventWithRelations;
  variant?: "default" | "compact" | "hero" | "inverse";
  className?: string;
  showHeadline?: boolean;
}

function TeamSlot({
  label,
  flag,
  isTbd,
  team,
  variant,
}: {
  label: string;
  flag: string | null;
  isTbd: boolean;
  team?: Team | null;
  variant: "default" | "compact" | "hero" | "inverse";
}) {
  const badgeSize =
    variant === "hero"
      ? "h-14 w-14 text-2xl"
      : variant === "compact" || variant === "inverse"
        ? "h-7 w-7 text-sm"
        : "h-10 w-10 text-lg";

  const labelClass =
    variant === "hero"
      ? "text-sm font-semibold text-white"
      : variant === "inverse"
        ? "text-sm font-medium text-white"
        : variant === "compact"
          ? "text-sm font-medium text-slate-900"
          : "text-xs font-semibold text-slate-700";

  if (variant === "compact" || variant === "inverse") {
    return (
      <span className="inline-flex items-center gap-1.5">
        {isTbd ? (
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed text-[10px] font-bold",
              variant === "inverse"
                ? "border-white/40 bg-white/10 text-white/70"
                : "border-slate-300 bg-slate-100 text-slate-400"
            )}
          >
            ?
          </span>
        ) : team ? (
          <TeamFlag team={team} size="sm" />
        ) : (
          <span className="text-base leading-none">{flag}</span>
        )}
        <span
          className={cn(
            labelClass,
            isTbd && variant === "compact" && "text-slate-500",
            isTbd && variant === "inverse" && "text-white/75"
          )}
        >
          {label}
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          badgeSize,
          isTbd
            ? "border-2 border-dashed border-slate-300 bg-slate-100 text-slate-400"
            : variant === "hero"
              ? "bg-white/15 backdrop-blur"
              : "bg-slate-50 ring-1 ring-slate-200"
        )}
      >
        {isTbd ? (
          <HelpCircle className={variant === "hero" ? "h-6 w-6" : "h-4 w-4"} />
        ) : team ? (
          <TeamFlag team={team} size={variant === "hero" ? "lg" : "md"} />
        ) : (
          <span>{flag}</span>
        )}
      </div>
      <span
        className={cn(
          labelClass,
          isTbd && variant !== "hero" && "text-slate-500",
          isTbd && variant === "hero" && "text-white/80"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function MatchTeamsRow({
  event,
  variant = "default",
  className,
  showHeadline = false,
}: MatchTeamsRowProps) {
  const match = getEventMatchDisplay(event);

  if (variant === "compact" || variant === "inverse") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <TeamSlot {...match.home} team={match.home.team} variant={variant} />
        <span
          className={cn(
            "text-xs font-medium",
            variant === "inverse" ? "text-white/60" : "text-slate-400"
          )}
        >
          vs
        </span>
        <TeamSlot {...match.away} team={match.away.team} variant={variant} />
      </div>
    );
  }

  const vsClass =
    variant === "hero"
      ? "text-sm font-bold text-white/70"
      : "text-xs font-bold uppercase tracking-wide text-slate-400";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <TeamSlot {...match.home} team={match.home.team} variant={variant} />
        <span className={vsClass}>vs</span>
        <TeamSlot {...match.away} team={match.away.team} variant={variant} />
      </div>
      {showHeadline && (
        <p
          className={cn(
            "mt-3 text-center font-bold",
            variant === "hero" ? "text-lg text-white sm:text-xl" : "text-base text-slate-900"
          )}
        >
          {match.headline}
        </p>
      )}
    </div>
  );
}
