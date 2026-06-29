"use client";

import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import {
  GENERIC_BOWL_PITCH,
  GENERIC_BOWL_VIEWBOX,
} from "@/lib/stadium/generic-bowl-layout";
import { StadiumMapCanvas } from "@/components/stadium/StadiumMapCanvas";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import type { PitchRect, SectionGeometry } from "@/lib/stadium/types";
import { cn } from "@/lib/utils";

interface StadiumMapProps {
  mapSlug?: string | null;
  /** Built on the fly for venues without traced geometry (NRG, etc.) */
  geometryOverride?: SectionGeometry[];
  mapName?: string;
  viewBox?: string;
  pitch?: PitchRect;
  availableSections: Set<string>;
  priceBySection: Map<string, number>;
  selectedSection: string | null;
  highlightedSection: string | null;
  onSectionClick: (section: string) => void;
  onSectionHover: (section: string | null) => void;
  zoom: number;
}

export function StadiumMap({
  mapSlug,
  geometryOverride,
  mapName,
  viewBox,
  pitch,
  availableSections,
  priceBySection,
  selectedSection,
  highlightedSection,
  onSectionClick,
  onSectionHover,
  zoom,
}: StadiumMapProps) {
  const definition = getStadiumMapDefinition(mapSlug);
  const geometry = geometryOverride ?? definition?.geometry;
  const resolvedPitch = pitch ?? definition?.pitch ?? GENERIC_BOWL_PITCH;
  const resolvedViewBox = viewBox ?? definition?.viewBox ?? GENERIC_BOWL_VIEWBOX;
  const resolvedName = mapName ?? definition?.name ?? "Stadium";

  if (!geometry?.length) return null;

  const active = highlightedSection ?? selectedSection;

  return (
    <StadiumMapCanvas zoom={zoom}>
      <svg
        viewBox={resolvedViewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${resolvedName} seating map`}
      >
        <rect width="800" height="640" fill="#f1f5f9" rx="12" />

        <rect
          x={resolvedPitch.x}
          y={resolvedPitch.y}
          width={resolvedPitch.width}
          height={resolvedPitch.height}
          fill="#15803d"
          rx="4"
        />
        <PitchMarkings
          x={resolvedPitch.x}
          y={resolvedPitch.y}
          width={resolvedPitch.width}
          height={resolvedPitch.height}
        />

        {geometry.map((sec) => {
          const hasStock = availableSections.has(sec.number);
          const isActive = active === sec.number;
          const isSelected = selectedSection === sec.number;
          const minPrice = priceBySection.get(sec.number);
          const showPriceLabel =
            hasStock && minPrice != null && (isActive || isSelected);

          return (
            <g key={sec.number}>
              <path
                id={`section-${sec.number}`}
                data-section={sec.number}
                data-zone={sec.zone}
                d={sec.path}
                fill={
                  isActive ? "#0284c7" : hasStock ? "#7dd3fc" : "#e2e8f0"
                }
                stroke={isActive ? "#0369a1" : hasStock ? "#bae6fd" : "#cbd5e1"}
                strokeWidth={isActive ? 2 : 0.75}
                className={cn(
                  hasStock && "cursor-pointer transition-[fill,stroke] duration-150"
                )}
                onClick={() => hasStock && onSectionClick(sec.number)}
                onMouseEnter={() => hasStock && onSectionHover(sec.number)}
                onMouseLeave={() => onSectionHover(null)}
              >
                <title>
                  {hasStock && minPrice != null
                    ? `Section ${sec.number} — from $${Math.round(minPrice).toLocaleString()}`
                    : `Section ${sec.number} — no tickets`}
                </title>
              </path>

              {hasStock && zoom >= 1.15 && !showPriceLabel && (
                <text
                  x={sec.labelX}
                  y={sec.labelY}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="500"
                  fill="#0c4a6e"
                  opacity={0.7}
                  pointerEvents="none"
                >
                  {sec.number}
                </text>
              )}

              {showPriceLabel && (
                <g pointerEvents="none">
                  <rect
                    x={sec.labelX - 30}
                    y={sec.labelY - 13}
                    width="60"
                    height="24"
                    rx="5"
                    fill="white"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.08))"
                  />
                  <text
                    x={sec.labelX}
                    y={sec.labelY + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    ${Math.round(minPrice).toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </StadiumMapCanvas>
  );
}
