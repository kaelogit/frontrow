/**
 * Extract viagogo paste from latest matching user message in transcript JSONL.
 * Usage: node scripts/data/extract-paste-from-transcript.mjs <out-file> <start-marker> <end-marker> <must-contain>
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const [outFile, startMarker, endMarker, mustContain] = process.argv.slice(2);
if (!outFile || !startMarker || !endMarker) {
  console.error(
    "Usage: node extract-paste-from-transcript.mjs <out> <start> <end> [mustContain]"
  );
  process.exit(1);
}

const base = join(
  process.env.USERPROFILE ?? process.env.HOME ?? "",
  ".cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts"
);

function allJsonlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...allJsonlFiles(full));
    else if (entry.name.endsWith(".jsonl")) out.push(full);
  }
  return out;
}

const files = allJsonlFiles(base).sort(
  (a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs
);

let best = null;
let bestPath = null;

for (const path of files) {
  const content = readFileSync(path, "utf8");
  let idx = 0;
  while (true) {
    const i = content.indexOf(startMarker, idx);
    if (i < 0) break;
    const j = content.indexOf(endMarker, i);
    if (j >= 0) {
      const raw = content.slice(i, j + endMarker.length);
      if (mustContain && !raw.includes(mustContain)) {
        idx = i + 1;
        continue;
      }
      if (raw.length < 10000) {
        idx = i + 1;
        continue;
      }
      if (!best || raw.length > best.length) {
        best = raw;
        bestPath = path;
      }
    }
    idx = i + 1;
  }
}

if (!best) {
  console.error("Paste not found in transcript");
  process.exit(1);
}

// Unescape JSON string escapes if needed
let decoded = best;
if (decoded.includes("\\n") && !decoded.includes("\n")) {
  try {
    decoded = JSON.parse(`"${decoded.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  } catch {
    decoded = decoded.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
  }
}

writeFileSync(outFile, decoded + "\n", "utf8");
const lines = decoded.split("\n");
console.log(`Wrote ${outFile} (${lines.length} lines, ${decoded.length} chars) from ${bestPath}`);
