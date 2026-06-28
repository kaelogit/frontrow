/**
 * Split match-93 listing body into part2–4 after part1 (ends Section 418 Row 26 $2,482).
 * Usage: node scripts/data/build-match93-parts.mjs [full-paste.txt]
 * If no arg, extracts from all agent transcripts.
 */
import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(root, "patches");
const part1End =
  "AT&T Stadium - Section 418\nSection 418\nRow 26 | Seats 5 - 6\n2 tickets together\nClear view\nOnly 2 left\n$4,400\nNow\n$2,482\nincl. fees";
const part2Start = "AT&T Stadium - Section 401\nSection 401\nRow 11";
const part3End = "AT&T Stadium - Section C108\nSection C108\nRow 2";
const part4End = "Showing 324 of 327";
const anchor = "W83 vs W84 - World Cup - Round of 16 (Match 93)";
const listingsStart = "AT&T Stadium - Section 216";

function collectTranscriptPaths(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTranscriptPaths(p));
    else if (entry.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

function extractFromText(text) {
  text = text.replace(/^<user_query>\n?/, "").replace(/\n?<\/user_query>$/, "");
  if (!text.includes(anchor)) return null;
  const startIdx = text.indexOf(listingsStart);
  const endIdx = text.indexOf(part4End);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + part4End.length);
}

function extractFromTranscripts() {
  const dir =
    "C:/Users/Kaelo/.cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts";
  if (!fs.existsSync(dir)) return null;
  let best = null;
  for (const transcriptPath of collectTranscriptPaths(dir)) {
    for (const line of fs.readFileSync(transcriptPath, "utf8").split("\n")) {
      if (!line.includes(anchor)) continue;
      let text;
      try {
        text = JSON.parse(line)?.message?.content?.map((c) => c.text ?? "").join("\n") ?? "";
      } catch {
        continue;
      }
      const slice = extractFromText(text);
      if (slice && (!best || slice.length > best.length)) best = slice;
    }
  }
  return best;
}

const inputPath = process.argv[2];
let body = null;
if (inputPath) {
  body = extractFromText(fs.readFileSync(inputPath, "utf8")) ?? extractFromText(
    fs.readFileSync(inputPath, "utf8").replace(/^[\s\S]*?(?=AT&T Stadium - Section 216)/, "")
  );
  if (!body && fs.readFileSync(inputPath, "utf8").includes(listingsStart)) {
    const raw = fs.readFileSync(inputPath, "utf8");
    const startIdx = raw.indexOf(listingsStart);
    const endIdx = raw.indexOf(part4End);
    if (startIdx >= 0 && endIdx >= 0) body = raw.slice(startIdx, endIdx + part4End.length);
  }
} else {
  body = extractFromTranscripts();
}

if (!body) {
  console.error("Full listings body not found (need anchor + Section 216 … Showing 324 of 327)");
  process.exit(1);
}

const part1Idx = body.indexOf(part1End);
if (part1Idx < 0) {
  console.error("Part1 end marker not found in body");
  process.exit(1);
}
const afterPart1 = body.slice(part1Idx + part1End.length).trimStart();
if (!afterPart1.startsWith("AT&T Stadium")) {
  console.error("Expected listings to continue after part1 end");
  process.exit(1);
}

const i2 = afterPart1.indexOf(part2Start);
const i3 = afterPart1.indexOf(part3End);
const i4 = afterPart1.indexOf(part4End);
if (i2 < 0 || i3 < 0 || i4 < 0) {
  console.error("Split markers missing", { i2, i3, i4 });
  process.exit(1);
}

const parts = [
  afterPart1.slice(i2, i3).trimEnd(),
  afterPart1.slice(i3, i4).trimEnd(),
  afterPart1.slice(i4).trimEnd(),
];

for (let i = 0; i < parts.length; i++) {
  const out = path.join(patchesDir, `match-93-listings-part${i + 2}.txt`);
  fs.writeFileSync(out, parts[i] + "\n", "utf8");
  const listings = (parts[i].match(/AT&T Stadium - Section/g) || []).length;
  console.log("wrote", out, "lines", parts[i].split(/\r?\n/).length, "listings", listings);
}

console.log("total after part1 listings", (afterPart1.match(/AT&T Stadium - Section/g) || []).length);
