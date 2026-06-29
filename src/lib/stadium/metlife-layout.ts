import { METLIFE_SECTIONS, METLIFE_SECTION_MAP } from "./metlife-sections";

export const METLIFE_VIEWBOX = "0 0 800 640";

/** Soccer pitch — aligned to metlife-reference.png (Hellotickets Final UI) */
export const METLIFE_PITCH = { x: 208, y: 148, width: 384, height: 340 };

export interface MetlifeSectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
  zone: string;
}

const CX = 400;
const CY = 318;
/** Wide oval bowl — MetLife NFL / soccer configuration */
const SX = 1.44;
const SY = 0.64;

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
): MetlifeSectionGeometry[] {
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
      zone: METLIFE_SECTION_MAP.get(number)?.zone ?? "cat-3",
    };
  });
}

/** Clockwise from east — lower 100s then upper 300s */
const order100East = [
  "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112",
];
const order100South = [
  "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124",
];
const order100West = [
  "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136",
];
const order100North = [
  "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
];

const order300East = [
  "301", "302", "303", "304", "305", "307", "308", "309", "311", "312", "313", "314",
];
const order300South = [
  "315", "316", "317", "318", "319", "320", "321", "322", "323", "324", "325", "326",
];
const order300West = [
  "327", "328", "329", "330", "331", "332", "333", "334", "335", "336", "337", "338",
];
const order300North = [
  "339", "341", "342", "343", "344", "345", "346", "347", "348", "349", "351", "353",
];

const tracedArcs: MetlifeSectionGeometry[] = [
  ...ringArc(order300East, 178, 252, -0.38 * Math.PI, 0.24 * Math.PI),
  ...ringArc(order300South, 178, 252, 0.24 * Math.PI, 0.62 * Math.PI),
  ...ringArc(order300West, 178, 252, 0.62 * Math.PI, 0.98 * Math.PI),
  ...ringArc(order300North, 178, 252, -0.98 * Math.PI, -0.38 * Math.PI),
  ...ringArc(order100East, 108, 168, -0.36 * Math.PI, 0.22 * Math.PI),
  ...ringArc(order100South, 108, 168, 0.22 * Math.PI, 0.6 * Math.PI),
  ...ringArc(order100West, 108, 168, 0.6 * Math.PI, 0.96 * Math.PI),
  ...ringArc(order100North, 108, 168, -0.96 * Math.PI, -0.36 * Math.PI),
];

const geometryByNumber = new Map(tracedArcs.map((g) => [g.number, g]));

for (const sec of METLIFE_SECTIONS) {
  if (!geometryByNumber.has(sec.number)) {
    const idx = METLIFE_SECTIONS.indexOf(sec);
    const angle = -Math.PI / 2 + (idx / METLIFE_SECTIONS.length) * Math.PI * 2;
    geometryByNumber.set(sec.number, {
      number: sec.number,
      path: stadiumWedge(CX, CY, 108, 168, angle, angle + 0.05),
      labelX: ePoint(CX, CY, 138, angle + 0.025).x,
      labelY: ePoint(CX, CY, 138, angle + 0.025).y,
      zone: sec.zone,
    });
  }
}

/** Viagogo / Hellotickets-style oval bowl — traced from metlife-reference.png */
export const METLIFE_GEOMETRY: MetlifeSectionGeometry[] = METLIFE_SECTIONS.map(
  (sec) => geometryByNumber.get(sec.number)!
);
