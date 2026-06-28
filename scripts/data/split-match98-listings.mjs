/**
 * Split Match 98 SoFi viagogo listings body into three patch files.
 * Usage:
 *   node scripts/data/split-match98-listings.mjs [full-paste-or-listings.txt]
 * If no arg, reads stdin. Extracts listings only (no header) through "Showing 316 of 316".
 */
import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(root, "patches");

const startStr = "SoFi Stadium - Section 535";
const splitB = "SoFi Stadium - Section 446";
const splitC = "SoFi Stadium - Section C109";
const endStr = "Showing 316 of 316";

function extractBody(text) {
  const startIdx = text.indexOf(startStr);
  const endIdx = text.indexOf(endStr);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + endStr.length).trimEnd();
}

function listingStarts(body) {
  const lines = body.split(/\r?\n/);
  const idx = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("SoFi Stadium - Section ")) idx.push(i);
  }
  return idx;
}

function sliceToLine(lines, startLine, endLine) {
  return lines.slice(startLine, endLine).join("\n").trimEnd();
}

const inputPath = process.argv[2];
const raw = inputPath ? fs.readFileSync(inputPath, "utf8") : fs.readFileSync(0, "utf8");
const body = extractBody(raw);
if (!body) {
  console.error("Listings body not found (need", startStr, "…", endStr + ")");
  process.exit(1);
}

const lines = body.split(/\r?\n/);
const starts = listingStarts(body);
const splitBLine = lines.findIndex((l) => l === splitB);
const splitCLine = lines.findIndex((l) => l === splitC);

if (splitBLine < 0 || splitCLine < 0) {
  console.error("Split markers missing:", { splitBLine, splitCLine });
  process.exit(1);
}

const part1 = sliceToLine(lines, 0, splitBLine);
const part2 = sliceToLine(lines, splitBLine, splitCLine);
const part3 = sliceToLine(lines, splitCLine, lines.length);

const files = [
  "match-98-listings-part1.txt",
  "match-98-listings-rest-a.txt",
  "match-98-listings-rest-b.txt",
];
const parts = [part1, part2, part3];

fs.mkdirSync(patchesDir, { recursive: true });
for (let i = 0; i < files.length; i++) {
  const out = path.join(patchesDir, files[i]);
  fs.writeFileSync(out, parts[i] + "\n", "utf8");
  const n = (parts[i].match(/SoFi Stadium - Section/g) || []).length;
  console.log("wrote", out, "lines", parts[i].split(/\r?\n/).length, "listings", n);
}

const total = (body.match(/SoFi Stadium - Section/g) || []).length;
console.log("total listings", total, "listing starts", starts.length);
console.log("last", lines[lines.length - 1]);
