"use client";

import { getStadiumMapDefinition } from "@/lib/stadium/registry";
import { StadiumMapCanvas } from "@/components/stadium/StadiumMapCanvas";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import { cn } from "@/lib/utils";

interface StadiumMapProps {
  mapSlug?: string | null;
  availableSections: Set<string>;
  priceBySection: Map<string, number>;
  selectedSection: string | null;
  highlightedSection: string | null;
  onSectionClick: (section: string) => void;
  onSectionHover: (section: string | null) => void;
  zoom: number;
}

export function StadiumMap({
  mapSlug = "bc-place",
  availableSections,
  priceBySection,
  selectedSection,
  highlightedSection,
  onSectionClick,
  onSectionHover,
  zoom,
}: StadiumMapProps) {
  const definition = getStadiumMapDefinition(mapSlug);
  if (!definition) return null;

  const { geometry, pitch, viewBox } = definition;
  const active = highlightedSection ?? selectedSection;

  return (
    <StadiumMapCanvas zoom={zoom}>
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${definition.name} seating map`}
      >
      <rect width="800" height="640" fill="#f1f5f9" rx="12" />

      {/* Pitch */}
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

      {geometry.map((sec) => {
        const hasStock = availableSections.has(sec.number);
        const isActive = active === sec.number;
        const isSelected = selectedSection === sec.number;
        const minPrice = priceBySection.get(sec.number);
        const showPriceLabel = hasStock && minPrice != null && (isActive || isSelected);

        return (
          <g key={sec.number}>
            <path
              d={sec.path}
              fill={
                isActive
                  ? "#0284c7"
                  : hasStock
                    ? "#7dd3fc"
                    : "#e2e8f0"
              }
              stroke={isActive ? "#0369a1" : hasStock ? "#bae6fd" : "#cbd5e1"}
              strokeWidth={isActive ? 2 : 0.75}
              className={cn(hasStock && "cursor-pointer transition-[fill,stroke] duration-150")}
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

            {/* Section number — subtle, only when zoomed in */}
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

            {/* Price bubble — hover or selected only (viagogo-style) */}
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
