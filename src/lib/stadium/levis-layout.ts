import { LEVIS_SECTIONS } from "./levis-sections";

export const LEVIS_VIEWBOX = "0 0 800 640";

/** Pill-shaped soccer pitch inside the 200 ring */
export const LEVIS_PITCH = { x: 255, y: 205, width: 290, height: 246 };

export interface LevisSectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
}

const CX = 400;
const CY = 328;
/** Horizontal stretch for pill-shaped bowl (viagogo reference) */
const SX = 1.45;
const SY = 0.7;

function ePoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle) * SX,
    y: cy + r * Math.sin(angle) * SY,
  };
}

function stadiumWedge(
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
    `A ${(outerR * SX).toFixed(2)} ${(outerR * SY).toFixed(2)} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${(innerR * SX).toFixed(2)} ${(innerR * SY).toFixed(2)} 0 ${large} 0 ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function ringArc(
  sections: string[],
  innerR: number,
  outerR: number,
  start: number,
  end: number
): LevisSectionGeometry[] {
  const sweep = end - start;
  const step = sweep / sections.length;
  return sections.map((number, i) => {
    const a0 = start + i * step;
    const a1 = a0 + step * 0.9;
    const mid = (a0 + a1) / 2;
    const labelR = (innerR + outerR) / 2;
    const label = ePoint(CX, CY, labelR, mid);
    return {
      number,
      path: stadiumWedge(CX, CY, innerR, outerR, a0, a1),
      labelX: label.x,
      labelY: label.y,
    };
  });
}

const order100nw = [
  "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112",
];

const order100east = [
  "113", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "127",
  "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "139", "140",
];

const order100south = ["142", "143", "144", "145", "146"];

const order200west = [
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211",
];

const order200north = ["212", "213", "214", "215", "218", "219", "220"];

const order200east = [
  "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232",
];

const order200south = ["240", "243", "244", "245", "246"];

const order300 = Array.from({ length: 28 }, (_, i) => String(301 + i));

const order400 = Array.from({ length: 22 }, (_, i) => String(401 + i));

const tracedArcs: LevisSectionGeometry[] = [
  ...ringArc(order400, 198, 258, -Math.PI * 0.93, Math.PI * 2.05),
  ...ringArc(order300, 162, 192, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62),
  ...ringArc(order200west, 106, 156, Math.PI * 0.72, Math.PI * 1.08),
  ...ringArc(order200north, 106, 156, -Math.PI * 0.78, -Math.PI * 0.38),
  ...ringArc(order200east, 106, 156, -Math.PI * 0.28, Math.PI * 0.32),
  ...ringArc(order200south, 106, 156, Math.PI * 0.38, Math.PI * 0.72),
  ...ringArc(order100nw, 76, 100, Math.PI * 0.68, Math.PI * 1.05),
  ...ringArc(order100east, 76, 100, -Math.PI * 0.32, Math.PI * 0.28),
  ...ringArc(order100south, 76, 100, Math.PI * 0.32, Math.PI * 0.58),
  {
    number: "C138",
    path: stadiumWedge(CX, CY, 98, 112, -0.05, 0.12),
    labelX: ePoint(CX, CY, 105, 0.035).x,
    labelY: ePoint(CX, CY, 105, 0.035).y,
  },
];

const geometryByNumber = new Map(tracedArcs.map((g) => [g.number, g]));
for (const sec of LEVIS_SECTIONS) {
  if (!geometryByNumber.has(sec.number)) {
    const idx = LEVIS_SECTIONS.indexOf(sec);
    const angle = -Math.PI / 2 + (idx / LEVIS_SECTIONS.length) * Math.PI * 2;
    geometryByNumber.set(sec.number, {
      number: sec.number,
      path: stadiumWedge(CX, CY, 106, 120, angle, angle + 0.08),
      labelX: ePoint(CX, CY, 113, angle + 0.04).x,
      labelY: ePoint(CX, CY, 113, angle + 0.04).y,
    });
  }
}

/** Viagogo-style pill bowl — arcs traced from levis-reference.png */
export const LEVIS_GEOMETRY: LevisSectionGeometry[] = LEVIS_SECTIONS.map(
  (sec) => geometryByNumber.get(sec.number)!
);
