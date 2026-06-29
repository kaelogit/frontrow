/** Shared elliptical-bowl wedge math (Levi's / generic oval maps). */

export const OVAL_BOWL_CX = 400;
export const OVAL_BOWL_CY = 320;
/** Equal scale = flat top-down bowl (no isometric squash). */
export const OVAL_BOWL_SX = 1;
export const OVAL_BOWL_SY = 1;

/** Isometric squash for listing thumbnails and laptop angle-view previews. */
export const PREVIEW_BOWL_CX = 400;
export const PREVIEW_BOWL_CY = 328;
export const PREVIEW_BOWL_SX = 1.45;
export const PREVIEW_BOWL_SY = 0.7;

export function ePoint(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  sx = OVAL_BOWL_SX,
  sy = OVAL_BOWL_SY
) {
  return {
    x: cx + r * Math.cos(angle) * sx,
    y: cy + r * Math.sin(angle) * sy,
  };
}

export function stadiumWedge(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  a0: number,
  a1: number,
  sx = OVAL_BOWL_SX,
  sy = OVAL_BOWL_SY
): string {
  const p0 = ePoint(cx, cy, innerR, a0, sx, sy);
  const p1 = ePoint(cx, cy, outerR, a0, sx, sy);
  const p2 = ePoint(cx, cy, outerR, a1, sx, sy);
  const p3 = ePoint(cx, cy, innerR, a1, sx, sy);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${(outerR * sx).toFixed(2)} ${(outerR * sy).toFixed(2)} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${(innerR * sx).toFixed(2)} ${(innerR * sy).toFixed(2)} 0 ${large} 0 ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}
