/**
 * Export public/stadiums/bc-place.svg from the same wedge math as bc-place-layout.ts.
 * Run: node scripts/generate-bc-place-svg.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CX = 400;
const CY = 302;
const SX = 1.36;
const SY = 0.68;
const PITCH = { x: 262, y: 192, width: 276, height: 226 };

const zoneFor = (level, n) => {
  if (level === "300") return "cat-3";
  if (level === "400") return n >= 433 ? "cat-4" : "cat-3";
  if (n >= 210 && n <= 218) return "cat-1";
  if (n >= 236 && n <= 244) return "cat-1";
  return "cat-2";
};

function ePoint(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle) * SX,
    y: cy + r * Math.sin(angle) * SY,
  };
}

function stadiumWedge(cx, cy, innerR, outerR, a0, a1) {
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

function ringArc(sections, innerR, outerR, start, end, level) {
  const sweep = end - start;
  const step = sweep / sections.length;
  return sections.map((number, i) => {
    const a0 = start + i * step;
    const a1 = a0 + step * 0.9;
    const mid = (a0 + a1) / 2;
    const labelR = (innerR + outerR) / 2;
    const label = ePoint(CX, CY, labelR, mid);
    const zone = zoneFor(level, Number(number));
    return { number, path: stadiumWedge(CX, CY, innerR, outerR, a0, a1), label, zone };
  });
}

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

const geometry = [
  ...ringArc(order400East, 196, 256, -0.38 * Math.PI, 0.24 * Math.PI, "400"),
  ...ringArc(order400South, 196, 256, 0.24 * Math.PI, 0.62 * Math.PI, "400"),
  ...ringArc(order400West, 196, 256, 0.62 * Math.PI, 0.98 * Math.PI, "400"),
  ...ringArc(order400North, 196, 256, -0.98 * Math.PI, -0.38 * Math.PI, "400"),
  ...ringArc(order300North, 162, 190, -0.74 * Math.PI, -0.26 * Math.PI, "300"),
  ...ringArc(order200East, 100, 156, -0.36 * Math.PI, 0.22 * Math.PI, "200"),
  ...ringArc(order200South, 100, 156, 0.22 * Math.PI, 0.6 * Math.PI, "200"),
  ...ringArc(order200West, 100, 156, 0.6 * Math.PI, 0.96 * Math.PI, "200"),
  ...ringArc(order200North, 100, 156, -0.96 * Math.PI, -0.36 * Math.PI, "200"),
];

const paths = geometry
  .map(
    (g) =>
      `  <path id="section-${g.number}" data-section="${g.number}" data-zone="${g.zone}" d="${g.path}" fill="#dbeafe" stroke="#94a3b8" stroke-width="0.75"/>\n` +
      `  <text x="${g.label.x.toFixed(1)}" y="${g.label.y.toFixed(1)}" text-anchor="middle" font-size="7" fill="#0c4a6e" pointer-events="none">${g.number}</text>`
  )
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- BC Place Stadium — traced from bc-place-reference.png. Regenerate: node scripts/generate-bc-place-svg.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" role="img" aria-label="BC Place Stadium seating chart">
  <rect width="800" height="640" fill="#f1f5f9" rx="12"/>
  <rect x="${PITCH.x}" y="${PITCH.y}" width="${PITCH.width}" height="${PITCH.height}" fill="#16a34a" rx="4"/>
  <circle cx="${PITCH.x + PITCH.width / 2}" cy="${PITCH.y + PITCH.height / 2}" r="34" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
  <line x1="${PITCH.x + PITCH.width / 2}" y1="${PITCH.y}" x2="${PITCH.x + PITCH.width / 2}" y2="${PITCH.y + PITCH.height}" stroke="white" stroke-width="1.5" opacity="0.9"/>
${paths}
</svg>
`;

writeFileSync(join(root, "public/stadiums/bc-place.svg"), svg);
console.log(`Wrote ${geometry.length} sections → public/stadiums/bc-place.svg`);
