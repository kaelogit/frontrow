/**
 * Compose match-93 paste from header + optional full paste file, then import.
 * Usage: node scripts/data/ingest-match93-full.mjs [full-paste.txt]
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.join(scriptDir, "..", "..");
const patchesDir = path.join(scriptDir, "patches");
const pastePath = path.join(scriptDir, "pastes", "match-93.txt");
const startStr = "World Cup Tickets - AT&T Stadium";
const endStr = "Showing 324 of 327";
const listingsStart = "AT&T Stadium - Section 216";

function extractPaste(text) {
  text = text.replace(/^<user_query>\n?/, "").replace(/\n?<\/user_query>$/, "");
  const startIdx = text.indexOf(startStr);
  const endIdx = text.indexOf(endStr);
  if (startIdx < 0 || endIdx < 0) return null;
  return text.slice(startIdx, endIdx + endStr.length).trimEnd() + "\n";
}

const inputPath = process.argv[2] ?? path.join(patchesDir, "match-93-full.txt");
let paste = null;

if (inputPath && fs.existsSync(inputPath)) {
  paste = extractPaste(fs.readFileSync(inputPath, "utf8"));
  if (!paste) {
    const raw = fs.readFileSync(inputPath, "utf8");
    const li = raw.indexOf(listingsStart);
    const end = raw.indexOf(endStr);
    if (li >= 0 && end >= 0) {
      const header = fs.readFileSync(path.join(patchesDir, "match-93-user-paste.txt"), "utf8").trimEnd();
      paste = `${header}\n${raw.slice(li, end + endStr.length).trimEnd()}\n`;
    }
  }
}

if (!paste) {
  console.error("Full paste not found at", inputPath);
  process.exit(1);
}

fs.writeFileSync(pastePath, paste, "utf8");
const listings = (paste.match(/AT&T Stadium - Section/g) || []).length;
console.log("wrote", pastePath, "lines", paste.split(/\r?\n/).length, "listings", listings);

const r = spawnSync(
  process.execPath,
  ["scripts/import-viagogo-match.mjs", "match-93", pastePath],
  { stdio: "inherit", cwd: root }
);
process.exit(r.status ?? 1);
