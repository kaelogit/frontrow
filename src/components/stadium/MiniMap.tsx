"use client";

import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import {
  buildPreviewSectionGeometry,
  GENERIC_BOWL_PITCH,
  GENERIC_BOWL_VIEWBOX,
} from "@/lib/stadium/generic-bowl-layout";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import {
  buildApproximateViewCone,
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

  const pool = sectionPool.length ? sectionPool : [sectionNumber];
  const geometry = buildPreviewSectionGeometry(pool);

  if (!geometry.some((g) => g.number === sectionNumber)) {
    geometry.push(...buildPreviewSectionGeometry([sectionNumber]));
  }

  return {
    geometry,
    pitch: GENERIC_BOWL_PITCH,
    viewBox: GENERIC_BOWL_VIEWBOX,
  };
}

/** Listing-card thumbnail — cropped angle view: cone from stands into pitch. */
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

  const targetSection = geometry.find((g) => g.number === sectionNumber);

  const cone = targetSection
    ? buildViewCone(targetSection, pitch, 0.22, { standOffset: 42 })
    : buildApproximateViewCone(sectionNumber, pitch, 800, 640, { standOffset: 42 });

  const anchor = targetSection
    ? { x: targetSection.labelX, y: targetSection.labelY }
    : { x: cone.sx, y: cone.sy };

  const croppedViewBox = cropViewBoxAroundSection(anchor, pitch, viewBox, 36, {
    minSize: 120,
    maxSize: 200,
  });

  return (
    <div
      className={cn(
        "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100",
        className
      )}
      aria-label={`View angle for section ${sectionNumber}`}
    >
      <svg
        viewBox={croppedViewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
      >
        <rect x="-20" y="-20" width="900" height="700" fill="#f1f5f9" />

        {geometry.map((sec) => (
          <path
            key={sec.number}
            d={roundSvgPath(sec.path)}
            fill={sec.number === sectionNumber ? "transparent" : "#e2e8f0"}
            stroke="#cbd5e1"
            strokeWidth="1"
            opacity={sec.number === sectionNumber ? 0 : 0.7}
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
          strokeWidth={1.2}
        />

        <path
          d={roundSvgPath(viewConePath(cone))}
          fill="rgba(14, 165, 233, 0.45)"
          stroke="rgba(2, 132, 199, 0.85)"
          strokeWidth="2"
        />

        <circle
          cx={anchor.x}
          cy={anchor.y}
          r={10}
          fill="#0284c7"
          stroke="#0c4a6e"
          strokeWidth="2.5"
        />
      </svg>

      <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[9px] font-bold text-sky-700 shadow-sm">
        §{sectionNumber}
      </span>
    </div>
  );
}
