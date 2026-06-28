import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.join(scriptDir, "..", "..");
const patchesDir = path.join(scriptDir, "patches");
const pastePath = path.join(scriptDir, "pastes", "match-93.txt");
const headerPath = path.join(patchesDir, "match-93-user-paste.txt");
const bodyPath = path.join(patchesDir, "match-93-listings-full.txt");
const endStr = "Showing 324 of 327";

if (!fs.existsSync(bodyPath)) {
  console.error("Missing", bodyPath);
  process.exit(1);
}

const header = fs.readFileSync(headerPath, "utf8").trimEnd();
let body = fs.readFileSync(bodyPath, "utf8").trimEnd();
if (!body.includes(endStr)) {
  console.error("Listings body must end with", endStr);
  process.exit(1);
}

const paste = `${header}\n${body}\n`;
fs.writeFileSync(pastePath, paste, "utf8");
const listings = (paste.match(/AT&T Stadium - Section/g) || []).length;
console.log("wrote", pastePath, "lines", paste.split(/\r?\n/).length, "listings", listings);

spawnSync(process.execPath, ["scripts/data/split-match93-listings.mjs", bodyPath], {
  stdio: "inherit",
  cwd: root,
});

const r = spawnSync(
  process.execPath,
  ["scripts/import-viagogo-match.mjs", "match-93", pastePath],
  { stdio: "inherit", cwd: root }
);
process.exit(r.status ?? 1);
