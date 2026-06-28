/**
 * Split Match 97 Gillette viagogo listings body into patch files.
 */
import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(root, "patches");

const startStr = "Gillette Stadium - Section 102";
const splitB = "Gillette Stadium - Section Category 2";
const splitC = "Gillette Stadium - Section Category 1";
const endStr = "Showing 350 of 353";

function extractBody(text) {
  const startIdx = text.indexOf(startStr);
  const endIdx = text.indexOf(endStr);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + endStr.length).trimEnd();
}

function sliceByMarker(body, startMarker, endMarker) {
  const start = body.indexOf(startMarker);
  const end = endMarker ? body.indexOf(endMarker) : body.length;
  if (start < 0) return "";
  return body.slice(start, end > start ? end : body.length).trimEnd();
}

const inputPath = process.argv[2] ?? path.join(patchesDir, "match-97-full-user-paste.txt");
const text = fs.readFileSync(inputPath, "utf8");
const body = extractBody(text);
if (!body) {
  console.error("Could not find listing body");
  process.exit(1);
}

const part1 = sliceByMarker(body, startStr, splitB);
const part2 = sliceByMarker(body, splitB, splitC);
const part3 = sliceByMarker(body, splitC, null) + "\n" + endStr;

fs.mkdirSync(patchesDir, { recursive: true });
fs.writeFileSync(path.join(patchesDir, "match-97-listings-part1.txt"), part1, "utf8");
fs.writeFileSync(path.join(patchesDir, "match-97-listings-rest-a.txt"), part2, "utf8");
fs.writeFileSync(path.join(patchesDir, "match-97-listings-rest-b.txt"), part3, "utf8");

const listings = (body.match(/Gillette Stadium - Section/g) || []).length;
console.log("listings", listings);
console.log("wrote 3 parts");
