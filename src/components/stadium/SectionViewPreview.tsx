"use client";

import { MiniMap } from "@/components/stadium/MiniMap";
import {
  buildPreviewSectionGeometry,
  GENERIC_BOWL_PITCH,
  GENERIC_BOWL_VIEWBOX,
} from "@/lib/stadium/generic-bowl-layout";
import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import {
  buildApproximateViewCone,
  buildViewCone,
  viewConePath,
} from "@/lib/stadium/section-view-angle";
import { roundSvgPath } from "@/lib/stadium/svg-coords";
import type { PitchRect, SectionGeometry } from "@/lib/stadium/types";
import { cn } from "@/lib/utils";

interface SectionViewPreviewProps {
  mapSlug?: string | null;
  sectionNumber: string | null;
  /** In-stock sections for generic venue bowl background */
  allSections?: Iterable<string>;
  /** compact = listing card thumbnail (MiniMap); panel = map overlay with view cone */
  variant?: "compact" | "panel";
  className?: string;
}

function resolvePanelGeometry(
  mapSlug: string | null | undefined,
  sectionNumber: string,
  allSections?: Iterable<string>
): {
  geometry: SectionGeometry[];
  pitch: PitchRect;
  viewBox: string;
  section: SectionGeometry | undefined;
} {
  const definition = getStadiumMapDefinition(mapSlug);
  const sectionPool = allSections
    ? [...new Set(allSections)]
    : [sectionNumber];

  if (definition?.geometry?.length) {
    return {
      geometry: definition.geometry,
      pitch: definition.pitch,
      viewBox: definition.viewBox,
      section: definition.geometry.find((g) => g.number === sectionNumber),
    };
  }

  const geometry = buildPreviewSectionGeometry(
    sectionPool.length ? sectionPool : [sectionNumber]
  );

  return {
    geometry,
    pitch: GENERIC_BOWL_PITCH,
    viewBox: GENERIC_BOWL_VIEWBOX,
    section: geometry.find((g) => g.number === sectionNumber),
  };
}

export function SectionViewPreview({
  mapSlug,
  sectionNumber,
  allSections,
  variant = "compact",
  className,
}: SectionViewPreviewProps) {
  if (variant === "compact") {
    return (
      <MiniMap
        mapSlug={mapSlug}
        sectionNumber={sectionNumber}
        allSections={allSections}
        className={className}
      />
    );
  }

  if (!sectionNumber) {
    return (
      <div
        className={cn(
          "flex h-full w-full min-h-[160px] items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-400",
          className
        )}
      >
        No image available
      </div>
    );
  }

  const { geometry, pitch, viewBox, section } = resolvePanelGeometry(
    mapSlug,
    sectionNumber,
    allSections
  );

  const cone = section
    ? buildViewCone(section, pitch)
    : buildApproximateViewCone(sectionNumber, pitch);

  const anchor = section
    ? { x: section.labelX, y: section.labelY }
    : { x: cone.sx, y: cone.sy };

  return (
    <div
      className={cn(
        "relative min-h-[160px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100",
        className
      )}
      aria-label={`View angle for section ${sectionNumber}`}
    >
      <svg
        viewBox={viewBox}
        className="h-full w-full min-h-[160px]"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <rect width="800" height="640" fill="#f1f5f9" />

        {geometry.map((sec) => (
          <path
            key={sec.number}
            d={roundSvgPath(sec.path)}
            fill={sec.number === sectionNumber ? "transparent" : "#e2e8f0"}
            stroke="#cbd5e1"
            strokeWidth="0.5"
            opacity={sec.number === sectionNumber ? 0 : 0.85}
          />
        ))}

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
        />

        <path
          d={roundSvgPath(viewConePath(cone))}
          fill="rgba(14, 165, 233, 0.35)"
          stroke="rgba(2, 132, 199, 0.6)"
          strokeWidth="1"
        />

        {section?.path ? (
          <path
            d={roundSvgPath(section.path)}
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.5"
          />
        ) : (
          <circle cx={anchor.x} cy={anchor.y} r={14} fill="#0284c7" />
        )}

        <circle
          cx={anchor.x}
          cy={anchor.y}
          r={7}
          fill="#0284c7"
          stroke="#0c4a6e"
          strokeWidth="2"
        />

        <text
          x={anchor.x}
          y={anchor.y - 20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#0f172a"
        >
          §{sectionNumber}
        </text>
      </svg>
    </div>
  );
}
