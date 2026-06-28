"use client";

import { cn } from "@/lib/utils";
import { PitchMarkings } from "@/components/stadium/PitchMarkings";
import type { DerivedZone } from "@/lib/stadium/derive-zones";

interface ZoneOverviewMapProps {
  zones: DerivedZone[];
  selectedZoneId: string | null;
  onZoneSelect: (zoneId: string | null) => void;
  venueName?: string;
}

const LEVEL_BANDS = [
  { prefix: "level-500", inset: 8, fill: "#e0f2fe", stroke: "#7dd3fc" },
  { prefix: "level-400", inset: 28, fill: "#dbeafe", stroke: "#93c5fd" },
  { prefix: "level-300", inset: 52, fill: "#bfdbfe", stroke: "#60a5fa" },
  { prefix: "level-200", inset: 76, fill: "#93c5fd", stroke: "#3b82f6" },
  { prefix: "level-100", inset: 100, fill: "#60a5fa", stroke: "#2563eb" },
];

export function ZoneOverviewMap({
  zones,
  selectedZoneId,
  onZoneSelect,
  venueName,
}: ZoneOverviewMapProps) {
  const levelZones = zones.filter((z) => z.id.startsWith("level-"));
  const otherZones = zones.filter((z) => !z.id.startsWith("level-"));

  const zoneById = new Map(zones.map((z) => [z.id, z]));

  function bandZone(prefix: string) {
    return levelZones.find((z) => z.id === prefix);
  }

  function handleBandClick(prefix: string) {
    const zone = bandZone(prefix);
    if (!zone) return;
    onZoneSelect(selectedZoneId === zone.id ? null : zone.id);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 min-h-[280px]">
        <svg viewBox="0 0 400 320" className="h-full w-full">
          <rect width="400" height="320" fill="#f8fafc" rx="8" />

          {LEVEL_BANDS.map(({ prefix, inset, fill, stroke }) => {
            const zone = bandZone(prefix);
            if (!zone) return null;
            const isActive = selectedZoneId === zone.id;
            return (
              <g key={prefix}>
                <rect
                  x={inset}
                  y={inset * 0.75}
                  width={400 - inset * 2}
                  height={320 - inset * 1.5}
                  rx={24 - inset / 8}
                  fill={isActive ? "#0284c7" : fill}
                  stroke={isActive ? "#0369a1" : stroke}
                  strokeWidth={isActive ? 2 : 1}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleBandClick(prefix)}
                />
              </g>
            );
          })}

          {/* Pitch */}
          <rect x="130" y="95" width="140" height="130" fill="#15803d" rx="4" />
          <PitchMarkings x={130} y={95} width={140} height={130} strokeWidth={1.2} />

          {levelZones.length === 0 && (
            <text x="200" y="165" textAnchor="middle" fontSize="13" fill="#64748b">
              Select a zone below
            </text>
          )}
        </svg>

        {selectedZoneId && zoneById.get(selectedZoneId) && (
          <button
            type="button"
            onClick={() => onZoneSelect(null)}
            className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md"
          >
            Clear {zoneById.get(selectedZoneId)!.label}
          </button>
        )}
      </div>

      {otherZones.length > 0 && (
        <div className="border-t border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Other ticket options
          </p>
          <div className="flex flex-wrap gap-2">
            {otherZones.map((zone) => {
              const isActive = selectedZoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onZoneSelect(isActive ? null : zone.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-left text-xs font-medium transition",
                    isActive
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300"
                  )}
                >
                  <span>{zone.label}</span>
                  {zone.minPrice != null && (
                    <span className={cn("ml-1.5", isActive ? "text-sky-100" : "text-slate-500")}>
                      from ${Math.round(zone.minPrice).toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {levelZones.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-center text-xs text-slate-500">
            {venueName ? `${venueName} · ` : ""}
            Zone overview — tap a level to filter listings
          </p>
        </div>
      )}
    </div>
  );
}
