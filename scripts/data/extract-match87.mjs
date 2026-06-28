import fs from "fs";

const transcriptPath =
  "C:/Users/Kaelo/.cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95.jsonl";
const outPath = "c:/Users/Kaelo/frontrowly/scripts/data/pastes/match-87.txt";
const content = fs.readFileSync(transcriptPath, "utf8");
const startStr = "World Cup Tickets - GEHA Field at Arrowhead Stadium";
const endStr = "Showing 356 of 358";

function decodeFragment(raw) {
  if (raw.includes("\\n") && !raw.includes("\n")) {
    try {
      return JSON.parse('"' + raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"');
    } catch {
      return raw.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
    }
  }
  return raw;
}

let best = null;
let searchFrom = 0;
while (true) {
  const idx = content.indexOf(startStr, searchFrom);
  if (idx < 0) break;
  const endIdx = content.indexOf(endStr, idx);
  if (endIdx >= 0) {
    const raw = content.substring(idx, endIdx + endStr.length);
    if (!best || raw.length > best.raw.length) best = { raw };
  }
  searchFrom = idx + 1;
}

if (!best) {
  console.error("Paste not found");
  process.exit(1);
}

const decoded = decodeFragment(best.raw);
fs.writeFileSync(outPath, decoded, "utf8");
const lines = decoded.split(/\r?\n/);
console.log("lines", lines.length);
console.log("chars", decoded.length);
console.log("first", lines[0]);
console.log("second", lines[1]);
console.log("last", lines[lines.length - 1]);
