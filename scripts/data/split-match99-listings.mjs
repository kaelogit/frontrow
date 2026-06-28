/**
 * Split Match 99 Hard Rock viagogo listings body into patch files.
 * Usage:
 *   node scripts/data/split-match99-listings.mjs [full-paste-or-listings.txt]
 */
import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(root, "patches");

const startStr = "Hard Rock Stadium - Complex - Section Category 3";
const splitB = "Hard Rock Stadium - Complex - Section 105";
const splitC = "Hard Rock Stadium - Complex - Section 249";
const endStr = "Showing 222 of 224";

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
    if (lines[i].startsWith("Hard Rock Stadium - Complex - Section ")) idx.push(i);
  }
  return idx;
}

function sliceByMarker(body, startMarker, endMarker) {
  const start = body.indexOf(startMarker);
  const end = endMarker ? body.indexOf(endMarker) : body.length;
  if (start < 0) return "";
  return body.slice(start, end > start ? end : body.length).trimEnd();
}

const inputPath = process.argv[2];
const text = inputPath
  ? fs.readFileSync(inputPath, "utf8")
  : fs.readFileSync(0, "utf8");

const body = extractBody(text);
if (!body) {
  console.error("Could not find listing body between", startStr, "and", endStr);
  process.exit(1);
}

const part1 = sliceByMarker(body, startStr, splitB);
const part2 = sliceByMarker(body, splitB, splitC);
const part3 = sliceByMarker(body, splitC, null) + "\n" + endStr;

fs.mkdirSync(patchesDir, { recursive: true });
fs.writeFileSync(path.join(patchesDir, "match-99-listings-part1.txt"), part1, "utf8");
fs.writeFileSync(path.join(patchesDir, "match-99-listings-part2.txt"), part2, "utf8");
fs.writeFileSync(path.join(patchesDir, "match-99-listings-part3.txt"), part3, "utf8");

const starts = listingStarts(body);
console.log("listings", starts.length);
console.log("wrote 3 parts to", patchesDir);
