import { readFileSync, writeFileSync } from "fs";

const out = process.argv[2];
const text = readFileSync(0, "utf8");
const start = "World Cup Tickets - Hard Rock Stadium - Complex";
const end = "Showing 243 of 246";
const i = text.indexOf(start);
const j = text.indexOf(end, i);
if (i < 0 || j < 0) {
  console.error("Bounds not found", i, j);
  process.exit(1);
}
const paste = text.slice(i, j + end.length) + "\n";
writeFileSync(out, paste, "utf8");
console.log(`Wrote ${out}: ${paste.split("\n").length} lines, ${paste.length} chars`);
