import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const headerPath = path.join(root, "patches", "match-99-user-paste.txt");
const partsDir = path.join(root, "patches");
const outPath = path.join(root, "pastes", "match-99.txt");

const parts = fs
  .readdirSync(partsDir)
  .filter((f) => f.match(/^match-99-listings-part\d+\.txt$/))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (parts.length === 0) {
  console.error("No listing parts found in", partsDir);
  process.exit(1);
}

const header = fs.readFileSync(headerPath, "utf8").trimEnd();
const body = parts.map((p) => fs.readFileSync(path.join(partsDir, p), "utf8").trimEnd()).join("\n");
const full = `${header}\n${body}\n`;
fs.writeFileSync(outPath, full, "utf8");
const listings = (full.match(/Hard Rock Stadium - Complex - Section/g) || []).length;
console.log("parts", parts.length);
console.log("lines", full.split(/\r?\n/).length);
console.log("listings", listings);
console.log("last line", full.trimEnd().split(/\r?\n/).pop());
