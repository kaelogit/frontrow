import { SOFI_SECTIONS } from "./sofi-sections";

export const SOFI_VIEWBOX = "0 0 800 640";

export const SOFI_PITCH = { x: 200, y: 160, width: 400, height: 320 };

export interface SofiSectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
}

function wedge(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x0 = cx + r1 * Math.cos(rad(a0));
  const y0 = cy + r1 * Math.sin(rad(a0));
  const x1 = cx + r1 * Math.cos(rad(a1));
  const y1 = cy + r1 * Math.sin(rad(a1));
  const x2 = cx + r2 * Math.cos(rad(a1));
  const y2 = cy + r2 * Math.sin(rad(a1));
  const x3 = cx + r2 * Math.cos(rad(a0));
  const y3 = cy + r2 * Math.sin(rad(a0));
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 ${large} 0 ${x3} ${y3} Z`;
}

const CX = 400;
const CY = 320;

const LEVEL_CONFIG = {
  "200": { r1: 100, r2: 175, base: 200, count: 24 },
  "400": { r1: 175, r2: 235, base: 0, count: 57 },
  "500": { r1: 235, r2: 295, base: 90, count: 40 },
} as const;

function sectionIndex(sec: (typeof SOFI_SECTIONS)[number]): number {
  const n = parseInt(sec.number, 10);
  if (sec.level === "200") {
    const order = [
      201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212,
      227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238,
    ];
    return order.indexOf(n);
  }
  if (sec.level === "400") {
    if (n < 436) return n - 400;
    return 35 + (n - 436);
  }
  if (n <= 525) return n - 504;
  return 22 + (n - 536);
}

export const SOFI_GEOMETRY: SofiSectionGeometry[] = SOFI_SECTIONS.map((sec) => {
  const cfg = LEVEL_CONFIG[sec.level];
  const idx = sectionIndex(sec);
  const span = 360 / cfg.count;
  const a0 = cfg.base + idx * span - span / 2;
  const a1 = a0 + span * 0.82;
  const mid = (a0 + a1) / 2;
  const lr = (cfg.r1 + cfg.r2) / 2;
  const rad = (mid * Math.PI) / 180;
  return {
    number: sec.number,
    path: wedge(CX, CY, cfg.r1, cfg.r2, a0, a1),
    labelX: CX + lr * Math.cos(rad),
    labelY: CY + lr * Math.sin(rad),
  };
});
