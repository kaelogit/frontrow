import fs from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const patchesDir = path.join(scriptDir, "patches");
const pastePath = path.join(scriptDir, "pastes", "match-94.txt");
const headerPath = path.join(patchesDir, "match-94-user-paste.txt");
const bodyChunks = [
  "match-94-listings-part1.txt",
  "match-94-listings-rest-a.txt",
  "match-94-listings-rest-b.txt",
];

const header = fs.readFileSync(headerPath, "utf8").trimEnd();
const body = bodyChunks
  .filter((f) => fs.existsSync(path.join(patchesDir, f)))
  .map((f) => fs.readFileSync(path.join(patchesDir, f), "utf8").trimEnd())
  .join("\n");
const paste = `${header}\n${body}\n`;
fs.writeFileSync(pastePath, paste, "utf8");
const listings = (paste.match(/Lumen Field at Lumen Field Event - Complex - Section/g) || []).length;
console.log("wrote", pastePath, "lines", paste.split(/\r?\n/).length, "listings", listings);
console.log("last", paste.trimEnd().split(/\r?\n/).pop());
