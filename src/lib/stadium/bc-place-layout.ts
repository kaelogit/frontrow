import { BC_PLACE_SECTIONS, BC_PLACE_SECTION_MAP } from "./bc-place-sections";

export interface SectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
  zone: string;
}

export const BC_PLACE_VIEWBOX = "0 0 800 640";

/** Soccer pitch inside the 200 ring — aligned to bc-place-reference.png */
export const BC_PLACE_PITCH = {
  x: 262,
  y: 192,
  width: 276,
  height: 226,
};

const CX = 400;
const CY = 302;
/** Pill-shaped bowl (horizontal stretch matches FIFA chart) */
const SX = 1.36;
const SY = 0.68;

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
): SectionGeometry[] {
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
      zone: BC_PLACE_SECTION_MAP.get(number)?.zone ?? "cat-3",
    };
  });
}

/** Clockwise from east curve — matches docs/venues/BC_PLACE.md */
const order200East = [
  "248", "249", "251", "252", "253", "254",
  "201", "202", "203", "204", "206", "207",
];
const order200South = [
  "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219",
];
const order200West = [
  "221", "222", "224", "225", "226", "227", "228", "229", "230", "231", "233", "234",
];
const order200North = [
  "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246",
];

const order300North = [
  "346", "345", "344", "343", "342", "341", "340", "339", "338", "337", "336",
];

const order400East = [
  "450", "451", "452", "453", "454",
  "401", "402", "403", "404", "405", "406", "407",
];
const order400South = [
  "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419",
];
const order400West = [
  "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432",
];
const order400North = [
  "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444",
  "445", "446", "447", "448", "449",
];

const tracedArcs: SectionGeometry[] = [
  ...ringArc(order400East, 196, 256, -0.38 * Math.PI, 0.24 * Math.PI),
  ...ringArc(order400South, 196, 256, 0.24 * Math.PI, 0.62 * Math.PI),
  ...ringArc(order400West, 196, 256, 0.62 * Math.PI, 0.98 * Math.PI),
  ...ringArc(order400North, 196, 256, -0.98 * Math.PI, -0.38 * Math.PI),
  ...ringArc(order300North, 162, 190, -0.74 * Math.PI, -0.26 * Math.PI),
  ...ringArc(order200East, 100, 156, -0.36 * Math.PI, 0.22 * Math.PI),
  ...ringArc(order200South, 100, 156, 0.22 * Math.PI, 0.6 * Math.PI),
  ...ringArc(order200West, 100, 156, 0.6 * Math.PI, 0.96 * Math.PI),
  ...ringArc(order200North, 100, 156, -0.96 * Math.PI, -0.36 * Math.PI),
];

const geometryByNumber = new Map(tracedArcs.map((g) => [g.number, g]));

for (const sec of BC_PLACE_SECTIONS) {
  if (!geometryByNumber.has(sec.number)) {
    const idx = BC_PLACE_SECTIONS.indexOf(sec);
    const angle = -Math.PI / 2 + (idx / BC_PLACE_SECTIONS.length) * Math.PI * 2;
    geometryByNumber.set(sec.number, {
      number: sec.number,
      path: stadiumWedge(CX, CY, 100, 156, angle, angle + 0.06),
      labelX: ePoint(CX, CY, 128, angle + 0.03).x,
      labelY: ePoint(CX, CY, 128, angle + 0.03).y,
      zone: sec.zone,
    });
  }
}

/** Viagogo-style pill bowl — arcs traced from bc-place-reference.png */
export const BC_PLACE_GEOMETRY: SectionGeometry[] = BC_PLACE_SECTIONS.map(
  (sec) => geometryByNumber.get(sec.number)!
);
