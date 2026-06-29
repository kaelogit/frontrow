"use client";

import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import {
  buildPreviewSectionGeometry,
  GENERIC_BOWL_PITCH,
  GENERIC_BOWL_VIEWBOX,
} from "@/lib/stadium/generic-bowl-layout";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import {
  buildViewCone,
  cropViewBoxAroundSection,
  viewConePath,
} from "@/lib/stadium/section-view-angle";
import { roundSvgPath } from "@/lib/stadium/svg-coords";
import type { PitchRect, SectionGeometry } from "@/lib/stadium/types";
import { cn } from "@/lib/utils";

interface MiniMapProps {
  mapSlug?: string | null;
  sectionNumber: string | null;
  /** All in-stock sections — used to build generic oval map when venue has no traced geometry */
  allSections?: Iterable<string>;
  className?: string;
}

function resolveAngleViewGeometry(
  mapSlug: string | null | undefined,
  sectionNumber: string,
  allSections?: Iterable<string>
): { geometry: SectionGeometry[]; pitch: PitchRect; viewBox: string } {
  const definition = getStadiumMapDefinition(mapSlug);
  const sectionPool = allSections
    ? [...new Set(allSections)]
    : [sectionNumber];

  if (definition?.geometry?.length) {
    return {
      geometry: definition.geometry,
      pitch: definition.pitch,
      viewBox: definition.viewBox,
    };
  }

  return {
    geometry: buildPreviewSectionGeometry(
      sectionPool.length ? sectionPool : [sectionNumber]
    ),
    pitch: GENERIC_BOWL_PITCH,
    viewBox: GENERIC_BOWL_VIEWBOX,
  };
}

/** Listing-card thumbnail — isometric angle view with section wedge + view cone. */
export function MiniMap({
  mapSlug,
  sectionNumber,
  allSections,
  className,
}: MiniMapProps) {
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

  const { geometry, pitch, viewBox } = resolveAngleViewGeometry(
    mapSlug,
    sectionNumber,
    allSections
  );

  const targetSection =
    geometry.find((g) => g.number === sectionNumber) ??
    buildPreviewSectionGeometry([sectionNumber])[0];

  const cone = buildViewCone(targetSection, pitch, 0.38);
  const anchor = { x: targetSection.labelX, y: targetSection.labelY };
  const croppedViewBox = cropViewBoxAroundSection(anchor, pitch, viewBox, 90);

  return (
    <div
      className={cn(
        "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100",
        className
      )}
      aria-label={`Section ${sectionNumber} on stadium map`}
    >
      <svg
        viewBox={croppedViewBox}
        className="h-full w-full"
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
            strokeWidth="0.75"
            opacity={sec.number === sectionNumber ? 0 : 0.9}
          />
        ))}

        <rect
          x={pitch.x}
          y={pitch.y}
          width={pitch.width}
          height={pitch.height}
          fill="#4ade80"
          stroke="#16a34a"
          strokeWidth="2"
          rx="4"
        />
        <PitchMarkings
          x={pitch.x}
          y={pitch.y}
          width={pitch.width}
          height={pitch.height}
          strokeWidth={1.5}
        />

        <path
          d={roundSvgPath(viewConePath(cone))}
          fill="rgba(14, 165, 233, 0.55)"
          stroke="#0369a1"
          strokeWidth="2.5"
        />

        {targetSection.path ? (
          <path
            d={roundSvgPath(targetSection.path)}
            fill="#0284c7"
            stroke="#0c4a6e"
            strokeWidth="3"
          />
        ) : (
          <circle
            cx={anchor.x}
            cy={anchor.y}
            r={18}
            fill="#0284c7"
            stroke="#0c4a6e"
            strokeWidth="3"
          />
        )}
      </svg>

      <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-sky-700 shadow-sm">
        §{sectionNumber}
      </span>
    </div>
  );
}
