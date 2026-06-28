/**
 * Split match-93 viagogo listings body into part files.
 * Usage:
 *   node scripts/data/split-match93-listings.mjs [full-paste-or-listings.txt]
 * If no arg, reads stdin. Extracts AT&T Stadium - Section 216 … Showing 324 of 327.
 */
import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(root, "patches");
const startStr = "AT&T Stadium - Section 216";
const endStr = "Showing 324 of 327";
const parts = 4;

function extractBody(text) {
  const startIdx = text.indexOf(startStr);
  const endIdx = text.indexOf(endStr);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + endStr.length).trimEnd();
}

const inputPath = process.argv[2];
const raw = inputPath ? fs.readFileSync(inputPath, "utf8") : fs.readFileSync(0, "utf8");
const body = extractBody(raw);
if (!body) {
  console.error("Listings body not found (need", startStr, "…", endStr + ")");
  process.exit(1);
}

const lines = body.split(/\r?\n/);
const chunk = Math.ceil(lines.length / parts);
for (let i = 0; i < parts; i++) {
  const slice = lines.slice(i * chunk, (i + 1) * chunk).join("\n");
  if (!slice.trim()) continue;
  const out = path.join(patchesDir, `match-93-listings-part${i + 1}.txt`);
  fs.writeFileSync(out, slice + "\n", "utf8");
  console.log("wrote", out, "lines", slice.split(/\r?\n/).length);
}

console.log("total listing lines", lines.length);
console.log("last", lines[lines.length - 1]);
