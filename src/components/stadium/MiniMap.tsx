"use client";

import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import { getBowlProfile } from "@/lib/stadium/mini-map-bowl";
import { approximateSectionPosition } from "@/lib/stadium/section-view-angle";
import { roundSvgPath } from "@/lib/stadium/svg-coords";
import { cn } from "@/lib/utils";

interface MiniMapProps {
  mapSlug?: string | null;
  sectionNumber: string | null;
  className?: string;
}

const FALLBACK_PITCH = { x: 280, y: 220, width: 240, height: 200 };

/** Viagogo-style listing thumbnail — bowl silhouette + highlighted section or blue dot. */
export function MiniMap({ mapSlug, sectionNumber, className }: MiniMapProps) {
  if (!sectionNumber) {
    return (
      <div
        className={cn(
          "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-1 text-center text-[10px] leading-tight text-slate-400",
          className
        )}
      >
        No image available
      </div>
    );
  }

  const definition = getStadiumMapDefinition(mapSlug);
  const viewBox = definition?.viewBox ?? "0 0 800 640";
  const pitch = definition?.pitch ?? FALLBACK_PITCH;
  const bowl = getBowlProfile(mapSlug);
  const section = definition?.geometry.find((g) => g.number === sectionNumber);
  const anchor = section
    ? { x: section.labelX, y: section.labelY }
    : approximateSectionPosition(sectionNumber);

  return (
    <div
      className={cn(
        "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100",
        className
      )}
      aria-label={`Section ${sectionNumber} on stadium map`}
    >
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <rect width="800" height="640" fill="#f1f5f9" />

        {bowl.rings.map((radius) => (
          <ellipse
            key={radius}
            cx={bowl.cx}
            cy={bowl.cy}
            rx={radius * bowl.sx}
            ry={radius * bowl.sy}
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
        ))}

        <rect
          x={pitch.x}
          y={pitch.y}
          width={pitch.width}
          height={pitch.height}
          fill="#16a34a"
          rx="3"
        />

        {section ? (
          <path
            d={roundSvgPath(section.path)}
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.25"
          />
        ) : (
          <>
            <circle
              cx={anchor.x}
              cy={anchor.y}
              r={12}
              fill="rgba(14, 165, 233, 0.25)"
            />
            <circle cx={anchor.x} cy={anchor.y} r={5.5} fill="#0284c7" stroke="#fff" strokeWidth="1" />
          </>
        )}
      </svg>

      <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-sky-700 shadow-sm">
        §{sectionNumber}
      </span>
    </div>
  );
}
