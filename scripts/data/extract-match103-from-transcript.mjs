import { readFileSync, writeFileSync } from "fs";

const path =
  process.argv[2] ||
  "C:/Users/Kaelo/.cursor/projects/c-Users-Kaelo-frontrowly/agent-transcripts/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95/da94ca5f-db5c-4d2a-a7cc-3e9e14912c95.jsonl";
const start = "World Cup Tickets - Hard Rock Stadium - Complex";
const endMarkers = ["Showing 219 of 219", "showing 219 of 219"];
const mustHave = /L101 vs L102|3rd Place \(Match 103\)/i;
const lines = readFileSync(path, "utf8").split(/\n/).filter(Boolean);
let best = null;
for (const line of lines) {
  let o;
  try {
    o = JSON.parse(line);
  } catch {
    continue;
  }
  if (o.role !== "user") continue;
  for (const part of o.message?.content || []) {
    let t = (part.text || "").replace(/<\/?user_query>/g, "");
    if (!t.includes(start)) continue;
    if (!mustHave.test(t)) continue;
    for (const end of endMarkers) {
      const i = t.indexOf(start);
      const j = t.indexOf(end, i);
      if (i >= 0 && j >= 0) {
        const paste = t.slice(i, j + end.length) + "\n";
        if (!best || paste.length > best.length) best = paste;
      }
    }
  }
}
if (!best) {
  console.error("No paste found");
  process.exit(1);
}
const dest = "c:/Users/Kaelo/frontrowly/scripts/data/pastes/match-103.txt";
writeFileSync(dest, best);
console.log("Wrote", dest, best.split("\n").length, "lines", best.length, "chars");
