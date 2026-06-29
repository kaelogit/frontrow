/** Shared elliptical-bowl wedge math (Levi's / generic oval maps). */

export const OVAL_BOWL_CX = 400;
export const OVAL_BOWL_CY = 328;
export const OVAL_BOWL_SX = 1.45;
export const OVAL_BOWL_SY = 0.7;

export function ePoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle) * OVAL_BOWL_SX,
    y: cy + r * Math.sin(angle) * OVAL_BOWL_SY,
  };
}

export function stadiumWedge(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  a0: number,
  a1: number
): string {
  const p0 = ePoint(cx, cy, innerR, a0);
  const p1 = ePoint(cx, cy, outerR, a0);
  const p2 = ePoint(cx, cy, outerR, a1);
  const p3 = ePoint(cx, cy, innerR, a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${(outerR * OVAL_BOWL_SX).toFixed(2)} ${(outerR * OVAL_BOWL_SY).toFixed(2)} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${(innerR * OVAL_BOWL_SX).toFixed(2)} ${(innerR * OVAL_BOWL_SY).toFixed(2)} 0 ${large} 0 ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}
