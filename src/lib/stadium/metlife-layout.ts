import { METLIFE_SECTIONS } from "./metlife-sections";

export const METLIFE_VIEWBOX = "0 0 800 640";

export const METLIFE_PITCH = { x: 200, y: 160, width: 400, height: 320 };

/** Simplified oval bowl — section wedges for map MVP (item 24 will trace full SVG) */
export interface MetlifeSectionGeometry {
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

export const METLIFE_GEOMETRY: MetlifeSectionGeometry[] = METLIFE_SECTIONS.map((sec, i) => {
  const n = parseInt(sec.number, 10);
  const is300 = sec.level === "300";
  const r1 = is300 ? 200 : 120;
  const r2 = is300 ? 280 : 200;
  const count = is300 ? 48 : 49;
  const base = is300 ? 0 : 180;
  const idx = is300 ? nums300Index(n) : n - 101;
  const span = 360 / count;
  const a0 = base + idx * span - span / 2;
  const a1 = a0 + span * 0.85;
  const mid = (a0 + a1) / 2;
  const lr = (r1 + r2) / 2;
  const rad = (mid * Math.PI) / 180;
  return {
    number: sec.number,
    path: wedge(CX, CY, r1, r2, a0, a1),
    labelX: CX + lr * Math.cos(rad),
    labelY: CY + lr * Math.sin(rad),
  };
});

function nums300Index(n: number): number {
  const order = [
    301, 302, 303, 304, 305, 307, 308, 309, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320,
    321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338,
    339, 341, 342, 343, 344, 345, 346, 347, 348, 349, 351, 353,
  ];
  return order.indexOf(n);
}
