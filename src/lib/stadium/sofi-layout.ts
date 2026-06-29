import { SOFI_SECTIONS, SOFI_SECTION_MAP } from "./sofi-sections";

export const SOFI_VIEWBOX = "0 0 800 640";

/** Soccer pitch — SoFi oval bowl (QF / group matches) */
export const SOFI_PITCH = { x: 215, y: 152, width: 370, height: 316 };

export interface SofiSectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
  zone: string;
}

const CX = 400;
const CY = 310;
const SX = 1.4;
const SY = 0.66;

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
): SofiSectionGeometry[] {
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
      zone: SOFI_SECTION_MAP.get(number)?.zone ?? "cat-3",
    };
  });
}

const order200South = [
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212",
];
const order200North = [
  "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238",
];

const order400East = [
  "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414",
];
const order400South = [
  "415", "416", "417", "418", "419", "420", "421", "422", "423", "424", "425", "426", "427", "428", "429",
];
const order400West = [
  "430", "431", "432", "433", "434", "436", "437", "438", "439", "440", "441", "442", "443", "444",
];
const order400North = [
  "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457",
];

const order500East = [
  "504", "505", "506", "507", "508", "509", "510", "511", "512", "513",
];
const order500South = [
  "514", "515", "516", "517", "518", "519", "520", "521", "522", "523",
];
const order500West = [
  "524", "525", "536", "537", "538", "539", "540", "541", "542", "543",
];
const order500North = [
  "544", "545", "546", "547", "548", "549", "550", "551", "552", "553",
];

const tracedArcs: SofiSectionGeometry[] = [
  ...ringArc(order500East, 228, 298, -0.38 * Math.PI, 0.24 * Math.PI),
  ...ringArc(order500South, 228, 298, 0.24 * Math.PI, 0.62 * Math.PI),
  ...ringArc(order500West, 228, 298, 0.62 * Math.PI, 0.98 * Math.PI),
  ...ringArc(order500North, 228, 298, -0.98 * Math.PI, -0.38 * Math.PI),
  ...ringArc(order400East, 168, 222, -0.38 * Math.PI, 0.24 * Math.PI),
  ...ringArc(order400South, 168, 222, 0.24 * Math.PI, 0.62 * Math.PI),
  ...ringArc(order400West, 168, 222, 0.62 * Math.PI, 0.98 * Math.PI),
  ...ringArc(order400North, 168, 222, -0.98 * Math.PI, -0.38 * Math.PI),
  ...ringArc(order200South, 108, 162, 0.28 * Math.PI, 0.58 * Math.PI),
  ...ringArc(order200North, 108, 162, -0.88 * Math.PI, -0.52 * Math.PI),
];

const geometryByNumber = new Map(tracedArcs.map((g) => [g.number, g]));

for (const sec of SOFI_SECTIONS) {
  if (!geometryByNumber.has(sec.number)) {
    const idx = SOFI_SECTIONS.indexOf(sec);
    const angle = -Math.PI / 2 + (idx / SOFI_SECTIONS.length) * Math.PI * 2;
    geometryByNumber.set(sec.number, {
      number: sec.number,
      path: stadiumWedge(CX, CY, 108, 162, angle, angle + 0.04),
      labelX: ePoint(CX, CY, 135, angle + 0.02).x,
      labelY: ePoint(CX, CY, 135, angle + 0.02).y,
      zone: sec.zone,
    });
  }
}

/** Hellotickets-style oval bowl — 200s end zones, 400s mid, 500s upper */
export const SOFI_GEOMETRY: SofiSectionGeometry[] = SOFI_SECTIONS.map(
  (sec) => geometryByNumber.get(sec.number)!
);
