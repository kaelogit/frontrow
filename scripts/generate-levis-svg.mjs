/**
 * Export public/stadiums/levis.svg from the same wedge math as levis-layout.ts.
 * Run: node scripts/generate-levis-svg.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CX = 400;
const CY = 328;
const SX = 1.45;
const SY = 0.7;
const PITCH = { x: 255, y: 205, width: 290, height: 246 };

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

function ringArc(sections, innerR, outerR, start, end) {
  const sweep = end - start;
  const step = sweep / sections.length;
  return sections.map((number, i) => {
    const a0 = start + i * step;
    const a1 = a0 + step * 0.9;
    const mid = (a0 + a1) / 2;
    const labelR = (innerR + outerR) / 2;
    const label = ePoint(CX, CY, labelR, mid);
    return { number, path: stadiumWedge(CX, CY, innerR, outerR, a0, a1), label };
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

const geometry = [
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
    label: ePoint(CX, CY, 105, 0.035),
  },
];

const paths = geometry
  .map(
    (g) =>
      `  <path id="section-${g.number}" data-section="${g.number}" d="${g.path}" fill="#dbeafe" stroke="#94a3b8" stroke-width="0.75"/>\n` +
      `  <text x="${g.label.x.toFixed(1)}" y="${g.label.y.toFixed(1)}" text-anchor="middle" font-size="7" fill="#0c4a6e" pointer-events="none">${g.number}</text>`
  )
  .join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Levi's Stadium — traced from levis-reference.png (viagogo). Regenerate: node scripts/generate-levis-svg.mjs -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640" role="img" aria-label="Levi's Stadium seating chart">
  <rect width="800" height="640" fill="#f1f5f9" rx="12"/>
  <rect x="${PITCH.x}" y="${PITCH.y}" width="${PITCH.width}" height="${PITCH.height}" fill="#16a34a" rx="6"/>
  <circle cx="${PITCH.x + PITCH.width / 2}" cy="${PITCH.y + PITCH.height / 2}" r="36" fill="none" stroke="white" stroke-width="2" opacity="0.85"/>
  <line x1="${PITCH.x + PITCH.width / 2}" y1="${PITCH.y}" x2="${PITCH.x + PITCH.width / 2}" y2="${PITCH.y + PITCH.height}" stroke="white" stroke-width="2" opacity="0.85"/>
${paths}
</svg>
`;

writeFileSync(join(root, "public/stadiums/levis.svg"), svg);
console.log(`Wrote ${geometry.length} sections → public/stadiums/levis.svg`);
