import { BC_PLACE_SECTIONS } from "./bc-place-sections";

export interface SectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
  zone: string;
}

const CX = 400;
const CY = 320;

function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  start: number,
  end: number
): string {
  const x1 = cx + innerR * Math.cos(start);
  const y1 = cy + innerR * Math.sin(start);
  const x2 = cx + outerR * Math.cos(start);
  const y2 = cy + outerR * Math.sin(start);
  const x3 = cx + outerR * Math.cos(end);
  const y3 = cy + outerR * Math.sin(end);
  const x4 = cx + innerR * Math.cos(end);
  const y4 = cy + innerR * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${x1} ${y1}`,
    "Z",
  ].join(" ");
}

function ringSections(
  sections: string[],
  innerR: number,
  outerR: number,
  startAngle: number,
  sweep: number
): SectionGeometry[] {
  const step = sweep / sections.length;
  return sections.map((number, i) => {
    const a0 = startAngle + i * step;
    const a1 = a0 + step * 0.92;
    const meta = BC_PLACE_SECTIONS.find((s) => s.number === number);
    const mid = (a0 + a1) / 2;
    const labelR = (innerR + outerR) / 2;
    return {
      number,
      path: wedgePath(CX, CY, innerR, outerR, a0, a1),
      labelX: CX + labelR * Math.cos(mid),
      labelY: CY + labelR * Math.sin(mid),
      zone: meta?.zone ?? "cat-3",
    };
  });
}

const order200 = [
  "248", "249", "251", "252", "253", "254", "201", "202", "203", "204", "206", "207",
  "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "221",
  "222", "224", "225", "226", "227", "228", "229", "230", "231", "233", "234", "236",
  "237", "238", "239", "240", "241", "242", "243", "244", "245", "246",
];

const order400 = [
  "450", "451", "452", "453", "454", "401", "402", "403", "404", "405", "406", "407",
  "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419",
  "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431",
  "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443",
  "444", "445", "446", "447", "448", "449",
];

const order300 = [
  "346", "345", "344", "343", "342", "341", "340", "339", "338", "337", "336",
];

/** Generated wedge geometry for interactive SVG (800×640 viewBox) */
export const BC_PLACE_GEOMETRY: SectionGeometry[] = [
  ...ringSections(order200, 95, 155, -Math.PI / 2, Math.PI * 2),
  ...ringSections(
    order300,
    158,
    188,
    -Math.PI / 2 - 0.55,
    Math.PI * 0.35
  ),
  ...ringSections(order400, 192, 248, -Math.PI / 2, Math.PI * 2),
];

export const BC_PLACE_VIEWBOX = "0 0 800 640";

export const BC_PLACE_PITCH = {
  x: 280,
  y: 200,
  width: 240,
  height: 240,
};
