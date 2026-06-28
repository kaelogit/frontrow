import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const matchNum = "91";
const headerPath = path.join(root, "patches", `match-${matchNum}-user-paste.txt`);
const partsDir = path.join(root, "patches");
const outPath = path.join(root, "pastes", `match-${matchNum}.txt`);

const parts = fs
  .readdirSync(partsDir)
  .filter((f) => f.match(new RegExp(`^match-${matchNum}-listings-part\\d+\\.txt$`)))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const header = fs.readFileSync(headerPath, "utf8").trimEnd();
const body = parts.map((p) => fs.readFileSync(path.join(partsDir, p), "utf8").trimEnd()).join("\n");
const full = `${header}\n${body}\n`;
fs.writeFileSync(outPath, full, "utf8");
console.log("parts", parts.length, "lines", full.split(/\r?\n/).length);
