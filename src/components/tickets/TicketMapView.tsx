"use client";

import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import type { SectionGeometry } from "@/lib/stadium/types";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { ReferenceStadiumMap } from "@/components/stadium/StadiumMapCanvas";
import { ZoneOverviewMap } from "@/components/stadium/ZoneOverviewMap";
import type { DerivedZone } from "@/lib/stadium/derive-zones";
import type { MapDisplayMode } from "@/lib/stadium/registry";

interface TicketMapViewProps {
  mapDisplayMode: MapDisplayMode;
  useGenericSectionMap: boolean;
  mapSlug: string;
  genericGeometry: SectionGeometry[];
  mapName: string;
  stockSections: Set<string>;
  priceBySection: Map<string, number>;
  selectedSection: string | null;
  highlightedSection: string | null;
  onSectionClick: (section: string) => void;
  onSectionHover: (section: string | null) => void;
  zoom: number;
  referenceMapImage: string | null;
  onReferenceMapError: () => void;
  derivedZones: DerivedZone[];
  selectedZoneId: string | null;
  onZoneSelect: (id: string | null) => void;
  showZoomControls: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
}

export function TicketMapView({
  mapDisplayMode,
  useGenericSectionMap,
  mapSlug,
  genericGeometry,
  mapName,
  stockSections,
  priceBySection,
  selectedSection,
  highlightedSection,
  onSectionClick,
  onSectionHover,
  zoom,
  referenceMapImage,
  onReferenceMapError,
  derivedZones,
  selectedZoneId,
  onZoneSelect,
  showZoomControls,
  onZoomIn,
  onZoomOut,
  className,
}: TicketMapViewProps) {
  let mapBody: ReactNode = null;

  if (mapDisplayMode === "section") {
    mapBody = (
      <StadiumMap
        mapSlug={mapSlug}
        availableSections={stockSections}
        priceBySection={priceBySection}
        selectedSection={selectedSection}
        highlightedSection={highlightedSection}
        onSectionClick={onSectionClick}
        onSectionHover={onSectionHover}
        zoom={zoom}
      />
    );
  } else if (useGenericSectionMap) {
    mapBody = (
      <StadiumMap
        geometryOverride={genericGeometry}
        mapName={mapName}
        availableSections={stockSections}
        priceBySection={priceBySection}
        selectedSection={selectedSection}
        highlightedSection={highlightedSection}
        onSectionClick={onSectionClick}
        onSectionHover={onSectionHover}
        zoom={zoom}
      />
    );
  } else if (mapDisplayMode === "reference" && referenceMapImage) {
    mapBody = (
      <ReferenceStadiumMap
        imageSrc={referenceMapImage}
        venueName={mapName}
        zoom={zoom}
        onImageError={onReferenceMapError}
      />
    );
  } else {
    mapBody = (
      <ZoneOverviewMap
        zones={derivedZones}
        selectedZoneId={selectedZoneId}
        onZoneSelect={onZoneSelect}
        venueName={mapName}
      />
    );
  }

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {showZoomControls && (
        <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-0.5 rounded-lg border border-slate-200 bg-white shadow-md">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-8 w-8 items-center justify-center hover:bg-slate-50"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-8 w-8 items-center justify-center border-t border-slate-100 hover:bg-slate-50"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="h-full w-full p-2 sm:p-4">{mapBody}</div>
    </div>
  );
}
