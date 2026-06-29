import type { PitchRect, SectionGeometry } from "@/lib/stadium/types";
import {
  OVAL_BOWL_CX,
  OVAL_BOWL_CY,
  OVAL_BOWL_SX,
  OVAL_BOWL_SY,
  PREVIEW_BOWL_CX,
  PREVIEW_BOWL_CY,
  PREVIEW_BOWL_SX,
  PREVIEW_BOWL_SY,
  ePoint,
  stadiumWedge,
} from "@/lib/stadium/stadium-wedge";

export const GENERIC_BOWL_VIEWBOX = "0 0 800 640";

export const GENERIC_BOWL_PITCH: PitchRect = {
  x: 255,
  y: 205,
  width: 290,
  height: 246,
};

/** Circular pitch for flat top-down generic bowl maps. */
export const GENERIC_BOWL_PITCH_CIRCLE = {
  cx: OVAL_BOWL_CX,
  cy: OVAL_BOWL_CY,
  r: 72,
};

const RING_BOUNDS: Record<number, [number, number]> = {
  1: [76, 100],
  2: [106, 156],
  3: [162, 192],
  4: [198, 258],
};

function sectionLevel(sectionNumber: string): number {
  const n = parseInt(sectionNumber.replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return 2;
  if (n >= 400) return 4;
  if (n >= 300) return 3;
  if (n >= 200) return 2;
  return 1;
}

function sortSectionNumbers(sections: string[]): string[] {
  return [...sections].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10) || 0;
    const nb = parseInt(b.replace(/\D/g, ""), 10) || 0;
    return na - nb;
  });
}

/** Oval bowl sections for venues without a traced map (NRG, Gillette, etc.). */
export function buildGenericSectionGeometry(
  sectionNumbers: Iterable<string>
): SectionGeometry[] {
  return buildBowlGeometry(
    sectionNumbers,
    OVAL_BOWL_CX,
    OVAL_BOWL_CY,
    OVAL_BOWL_SX,
    OVAL_BOWL_SY
  );
}

function buildBowlGeometry(
  sectionNumbers: Iterable<string>,
  cx: number,
  cy: number,
  sx: number,
  sy: number
): SectionGeometry[] {
  const unique = [...new Set(sectionNumbers)].filter(Boolean);
  const byLevel = new Map<number, string[]>();

  for (const number of unique) {
    const level = sectionLevel(number);
    const list = byLevel.get(level) ?? [];
    list.push(number);
    byLevel.set(level, list);
  }

  const geometry: SectionGeometry[] = [];

  for (const [level, sections] of byLevel) {
    const sorted = sortSectionNumbers(sections);
    const [innerR, outerR] = RING_BOUNDS[level] ?? [106, 156];
    const sweep = Math.PI * 2 * 0.9;
    const start = -Math.PI / 2 - sweep / 2;
    const step = sweep / sorted.length;

    sorted.forEach((number, index) => {
      const a0 = start + index * step;
      const a1 = a0 + step * 0.86;
      const mid = (a0 + a1) / 2;
      const labelR = (innerR + outerR) / 2;
      const label = ePoint(cx, cy, labelR, mid, sx, sy);

      geometry.push({
        number,
        path: stadiumWedge(cx, cy, innerR, outerR, a0, a1, sx, sy),
        labelX: label.x,
        labelY: label.y,
      });
    });
  }

  return geometry;
}

/** Isometric oval bowl for thumbnails and laptop angle-view previews. */
export function buildPreviewSectionGeometry(
  sectionNumbers: Iterable<string>
): SectionGeometry[] {
  return buildBowlGeometry(
    sectionNumbers,
    PREVIEW_BOWL_CX,
    PREVIEW_BOWL_CY,
    PREVIEW_BOWL_SX,
    PREVIEW_BOWL_SY
  );
}
