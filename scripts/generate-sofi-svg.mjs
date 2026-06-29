/**
 * Export public/stadiums/sofi.svg from the same wedge math as sofi-layout.ts.
 * Run: node scripts/generate-sofi-svg.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CX = 400;
const CY = 310;
const SX = 1.4;
const SY = 0.66;
const PITCH = { x: 215, y: 152, width: 370, height: 316 };

function zone200(n) {
  return n >= 208 && n <= 211 ? "cat-1" : "cat-2";
}

function zone400(n) {
  return n >= 412 && n <= 422 ? "cat-2" : "cat-3";
}

function zone500(n) {
  if (n >= 512 && n <= 542) return "cat-3";
  return n >= 543 ? "cat-4" : "cat-3";
}

function zoneFor(number, level) {
  const n = Number(number);
  if (level === "200") return zone200(n);
  if (level === "400") return zone400(n);
  return zone500(n);
}

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
    return {
      number,
      path: stadiumWedge(CX, CY, innerR, outerR, a0, a1),
      label,
      zone: zoneFor(number, level),
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

const geometry = [
  ...ringArc(order500East, 228, 298, -0.38 * Math.PI, 0.24 * Math.PI, "500"),
  ...ringArc(order500South, 228, 298, 0.24 * Math.PI, 0.62 * Math.PI, "500"),
  ...ringArc(order500West, 228, 298, 0.62 * Math.PI, 0.98 * Math.PI, "500"),
  ...ringArc(order500North, 228, 298, -0.98 * Math.PI, -0.38 * Math.PI, "500"),
  ...ringArc(order400East, 168, 222, -0.38 * Math.PI, 0.24 * Math.PI, "400"),
  ...ringArc(order400South, 168, 222, 0.24 * Math.PI, 0.62 * Math.PI, "400"),
  ...ringArc(order400West, 168, 222, 0.62 * Math.PI, 0.98 * Math.PI, "400"),
  ...ringArc(order400North, 168, 222, -0.98 * Math.PI, -0.38 * Math.PI, "400"),
  ...ringArc(order200South, 108, 162, 0.28 * Math.PI, 0.58 * Math.PI, "200"),
  ...ringArc(order200North, 108, 162, -0.88 * Math.PI, -0.52 * Math.PI, "200"),
];

const paths = geometry
  .map(
    (g) =>
      `  <path id="section-${g.number}" data-section="${g.number}" data-zone="${g.zone}" d="${g.path}" fill="#dbeafe" stroke="#94a3b8" stroke-width="0.75"/>\n` +
      `  <text x="${g.label.x.toFixed(1)}" y="${g.label.y.toFixed(1)}" text-anchor="middle" font-size="7" fill="#0c4a6e" pointer-events="none">${g.number}</text>`
  )
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- SoFi Stadium — traced from venue chart (docs/venues/SOFI.md). Regenerate: node scripts/generate-sofi-svg.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" role="img" aria-label="SoFi Stadium seating chart">
  <rect width="800" height="640" fill="#f1f5f9" rx="12"/>
  <rect x="${PITCH.x}" y="${PITCH.y}" width="${PITCH.width}" height="${PITCH.height}" fill="#16a34a" rx="4"/>
  <circle cx="${PITCH.x + PITCH.width / 2}" cy="${PITCH.y + PITCH.height / 2}" r="40" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
  <line x1="${PITCH.x + PITCH.width / 2}" y1="${PITCH.y}" x2="${PITCH.x + PITCH.width / 2}" y2="${PITCH.y + PITCH.height}" stroke="white" stroke-width="1.5" opacity="0.9"/>
${paths}
</svg>
`;

writeFileSync(join(root, "public/stadiums/sofi.svg"), svg);
console.log(`Wrote ${geometry.length} sections → public/stadiums/sofi.svg`);
