/**
 * Export public/stadiums/metlife.svg from the same wedge math as metlife-layout.ts.
 * Run: node scripts/generate-metlife-svg.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CX = 400;
const CY = 318;
const SX = 1.44;
const SY = 0.64;
const PITCH = { x: 208, y: 148, width: 384, height: 340 };

function zone100(n) {
  return n <= 128 ? "cat-1" : "cat-2";
}

function zone300(n) {
  if (n >= 341 || (n >= 321 && n <= 329)) return "cat-3";
  return "cat-4";
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
    const n = Number(number);
    const zone = level === "100" ? zone100(n) : zone300(n);
    return { number, path: stadiumWedge(CX, CY, innerR, outerR, a0, a1), label, zone };
  });
}

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

const geometry = [
  ...ringArc(order300East, 178, 252, -0.38 * Math.PI, 0.24 * Math.PI, "300"),
  ...ringArc(order300South, 178, 252, 0.24 * Math.PI, 0.62 * Math.PI, "300"),
  ...ringArc(order300West, 178, 252, 0.62 * Math.PI, 0.98 * Math.PI, "300"),
  ...ringArc(order300North, 178, 252, -0.98 * Math.PI, -0.38 * Math.PI, "300"),
  ...ringArc(order100East, 108, 168, -0.36 * Math.PI, 0.22 * Math.PI, "100"),
  ...ringArc(order100South, 108, 168, 0.22 * Math.PI, 0.6 * Math.PI, "100"),
  ...ringArc(order100West, 108, 168, 0.6 * Math.PI, 0.96 * Math.PI, "100"),
  ...ringArc(order100North, 108, 168, -0.96 * Math.PI, -0.36 * Math.PI, "100"),
];

const paths = geometry
  .map(
    (g) =>
      `  <path id="section-${g.number}" data-section="${g.number}" data-zone="${g.zone}" d="${g.path}" fill="#dbeafe" stroke="#94a3b8" stroke-width="0.75"/>\n` +
      `  <text x="${g.label.x.toFixed(1)}" y="${g.label.y.toFixed(1)}" text-anchor="middle" font-size="7" fill="#0c4a6e" pointer-events="none">${g.number}</text>`
  )
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- MetLife Stadium — traced from metlife-reference.png. Regenerate: node scripts/generate-metlife-svg.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" role="img" aria-label="MetLife Stadium seating chart">
  <rect width="800" height="640" fill="#f1f5f9" rx="12"/>
  <rect x="${PITCH.x}" y="${PITCH.y}" width="${PITCH.width}" height="${PITCH.height}" fill="#16a34a" rx="4"/>
  <circle cx="${PITCH.x + PITCH.width / 2}" cy="${PITCH.y + PITCH.height / 2}" r="42" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
  <line x1="${PITCH.x + PITCH.width / 2}" y1="${PITCH.y}" x2="${PITCH.x + PITCH.width / 2}" y2="${PITCH.y + PITCH.height}" stroke="white" stroke-width="1.5" opacity="0.9"/>
${paths}
</svg>
`;

writeFileSync(join(root, "public/stadiums/metlife.svg"), svg);
console.log(`Wrote ${geometry.length} sections → public/stadiums/metlife.svg`);
