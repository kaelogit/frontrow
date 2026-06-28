"use client";

import { useEffect, useState } from "react";
import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import {
  approximateSectionPosition,
  buildApproximateViewCone,
  buildViewCone,
  viewConePath,
} from "@/lib/stadium/section-view-angle";
import { roundSvgPath } from "@/lib/stadium/svg-coords";
import { cn } from "@/lib/utils";

interface SectionViewPreviewProps {
  mapSlug?: string | null;
  sectionNumber: string | null;
  /** compact = listing card thumbnail; panel = map overlay */
  variant?: "compact" | "panel";
  className?: string;
}

const FALLBACK_PITCH = { x: 280, y: 220, width: 240, height: 200 };

export function SectionViewPreview({
  mapSlug,
  sectionNumber,
  variant = "compact",
  className,
}: SectionViewPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!sectionNumber) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-[10px] text-slate-400",
          variant === "compact" ? "h-[72px] w-[72px]" : "h-full w-full min-h-[160px]",
          className
        )}
      >
        No image
      </div>
    );
  }

  const definition = getStadiumMapDefinition(mapSlug);
  const viewBox = definition?.viewBox ?? "0 0 800 640";
  const pitch = definition?.pitch ?? FALLBACK_PITCH;
  const section = definition?.geometry.find((g) => g.number === sectionNumber);

  const cone = section
    ? buildViewCone(section, pitch)
    : buildApproximateViewCone(sectionNumber, pitch);

  const anchor = section
    ? { x: section.labelX, y: section.labelY }
    : approximateSectionPosition(sectionNumber);

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100",
        isCompact ? "h-[72px] w-[72px]" : "min-h-[160px] w-full",
        className
      )}
      aria-label={`View angle for section ${sectionNumber}`}
    >
      {!mounted ? (
        <>
          <div className="absolute inset-[18%] rounded-sm bg-green-700" />
          {isCompact && (
            <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-sky-700">
              §{sectionNumber}
            </span>
          )}
        </>
      ) : (
        <svg
          viewBox={viewBox}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <rect width="800" height="640" fill="#f1f5f9" />

          <rect
            x={pitch.x}
            y={pitch.y}
            width={pitch.width}
            height={pitch.height}
            fill="#15803d"
            rx="4"
          />
          <PitchMarkings
            x={pitch.x}
            y={pitch.y}
            width={pitch.width}
            height={pitch.height}
            strokeWidth={isCompact ? 1 : 1.5}
          />

          {definition?.geometry.map((sec) => (
            <path
              key={sec.number}
              d={roundSvgPath(sec.path)}
              fill={sec.number === sectionNumber ? "transparent" : "#e2e8f0"}
              stroke="#cbd5e1"
              strokeWidth="0.5"
              opacity={sec.number === sectionNumber ? 0 : 0.85}
            />
          ))}

          <path
            d={roundSvgPath(viewConePath(cone))}
            fill="rgba(14, 165, 233, 0.35)"
            stroke="rgba(2, 132, 199, 0.6)"
            strokeWidth="1"
          />

          {section ? (
            <path
              d={roundSvgPath(section.path)}
              fill="#0284c7"
              stroke="#0369a1"
              strokeWidth="1.5"
            />
          ) : (
            <circle cx={anchor.x} cy={anchor.y} r={isCompact ? 10 : 14} fill="#0284c7" />
          )}

          {!isCompact && (
            <text
              x={anchor.x}
              y={anchor.y - (section ? 18 : 22)}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#0f172a"
            >
              §{sectionNumber}
            </text>
          )}
        </svg>
      )}

      {isCompact && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-sky-700">
          §{sectionNumber}
        </span>
      )}
    </div>
  );
}
