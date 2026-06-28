import fs from "fs";

const transcriptPaths = [
  "C:/Users/Kaelo/.cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95.jsonl",
  "C:/Users/Kaelo/.cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts/df6b123b-6cc7-4dca-8fd0-b3862e881af4/df6b123b-6cc7-4dca-8fd0-b3862e881af4.jsonl",
];
const outPath = "c:/Users/Kaelo/frontrowly/scripts/data/pastes/match-90.txt";
const startStr = "World Cup Tickets - Reliant Stadium";
const endStr = "Showing 322 of 327";
const anchor = "W73 vs W75 - World Cup - Round of 16 (Match 90)";

function extractFromText(text) {
  text = text.replace(/^<user_query>\n?/, "").replace(/\n?<\/user_query>$/, "");
  const anchorIdx = text.indexOf(anchor);
  if (anchorIdx < 0) return null;
  const startIdx = text.lastIndexOf(startStr, anchorIdx);
  const endIdx = text.indexOf(endStr, anchorIdx);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + endStr.length);
}

let best = null;

for (const transcriptPath of transcriptPaths) {
  if (!fs.existsSync(transcriptPath)) continue;
  const content = fs.readFileSync(transcriptPath, "utf8");
  for (const line of content.split("\n")) {
    if (!line.includes(anchor)) continue;
    let text;
    try {
      const obj = JSON.parse(line);
      text = obj?.message?.content?.[0]?.text ?? "";
    } catch {
      continue;
    }
    const slice = extractFromText(text);
    if (slice && (!best || slice.length > best.length)) best = slice;
  }
}

if (!best) {
  console.error("Paste not found");
  process.exit(1);
}

fs.writeFileSync(outPath, best + "\n", "utf8");
const lines = best.split(/\r?\n/);
console.log("lines", lines.length);
console.log("chars", best.length);
console.log("first", lines[0]);
console.log("second", lines[1]);
console.log("last", lines[lines.length - 1]);
