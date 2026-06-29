"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getReferenceMapImage } from "@/lib/stadium/registry";

export { getReferenceMapImage };

/**
 * Fixed viewport for the stadium map — zoom via +/- only, never page scroll.
 */
export function StadiumMapCanvas({
  zoom,
  children,
  className,
}: {
  zoom: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const blockScroll = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full overflow-hidden touch-none", className)}
      onWheel={blockScroll}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div className="h-full w-full max-h-full max-w-full">{children}</div>
      </div>
    </div>
  );
}

interface ReferenceStadiumMapProps {
  imageSrc: string;
  venueName: string;
  zoom: number;
  onImageError?: () => void;
}

/** Image-based bowl map for venues not yet traced to SVG geometry (e.g. Mercedes-Benz). */
export function ReferenceStadiumMap({
  imageSrc,
  venueName,
  zoom,
  onImageError,
}: ReferenceStadiumMapProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Seating chart unavailable — use the zone map or listing filters.
      </div>
    );
  }

  return (
    <StadiumMapCanvas zoom={zoom} className="bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`${venueName} seating chart`}
        className="mx-auto h-full w-full object-contain"
        draggable={false}
        onError={() => {
          setFailed(true);
          onImageError?.();
        }}
      />
    </StadiumMapCanvas>
  );
}
