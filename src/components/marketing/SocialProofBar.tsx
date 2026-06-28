"use client";

import { Eye, Users } from "lucide-react";
import type { SocialProofSettings } from "@/lib/social-proof/settings";
import { jitterCount, formatCompactCount } from "@/lib/social-proof/jitter";
import { AnimatedCount } from "@/components/marketing/AnimatedCount";
import { cn } from "@/lib/utils";

interface SocialProofBarProps {
  settings: SocialProofSettings;
  variant?: "bar" | "hero";
  className?: string;
}

export function SocialProofBar({
  settings,
  variant = "bar",
  className,
}: SocialProofBarProps) {
  if (!settings.enabled) return null;

  const viewers = jitterCount(
    settings.viewersBase,
    settings.viewersJitterPct,
    "viewers"
  );
  const followers = jitterCount(
    settings.followersBase,
    settings.followersJitterPct,
    "followers"
  );

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm", className)}>
        <span className="flex items-center gap-1.5 text-emerald-200">
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          <AnimatedCount value={viewers} className="font-semibold tabular-nums" />
          <span>
            fans viewed {settings.viewersLabel} this hour
            <span className="sr-only"> (estimated)</span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-200">
          <Users className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-semibold tabular-nums">{formatCompactCount(followers)}</span>
          <span>fans following</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 px-3 py-2.5 sm:px-4 sm:py-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Mobile: icon column + aligned text column */}
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-2 gap-y-2 sm:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
          <Eye className="h-4 w-4 text-sky-600" aria-hidden />
        </span>
        <p className="min-w-0 pt-1 text-xs leading-snug text-slate-700">
          <AnimatedCount value={viewers} className="font-bold text-slate-900 tabular-nums" />
          {" people viewed "}
          <span className="font-medium">{settings.viewersLabel}</span>
          {" in the past hour"}
        </p>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
          <Users className="h-4 w-4 text-sky-600" aria-hidden />
        </span>
        <p className="min-w-0 pt-1 text-xs leading-snug text-slate-600">
          <span className="font-semibold tabular-nums text-slate-800">
            {formatCompactCount(followers)}
          </span>{" "}
          fans following
          <span className="text-slate-400" title="Estimated activity">
            {" "}
            · est.
          </span>
        </p>
      </div>

      {/* Desktop: single row */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Eye className="h-4 w-4 text-sky-600" aria-hidden />
          </span>
          <span>
            <AnimatedCount value={viewers} className="font-bold text-slate-900 tabular-nums" />
            {" people viewed "}
            <span className="font-medium">{settings.viewersLabel}</span>
            {" in the past hour"}
          </span>
        </p>
        <p className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-sky-500" aria-hidden />
          <span className="font-semibold tabular-nums text-slate-800">
            {formatCompactCount(followers)}
          </span>
          <span>fans following</span>
          <span className="text-xs text-slate-400" title="Estimated activity">
            · est.
          </span>
        </p>
      </div>
    </div>
  );
}
