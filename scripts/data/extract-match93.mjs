import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.join(scriptDir, "..", "..");
const composeScript = path.join(scriptDir, "compose-match93-paste.mjs");

spawnSync(process.execPath, [composeScript], { stdio: "inherit", cwd: root });

const outPath = path.join(scriptDir, "pastes", "match-93.txt");
if (!fs.existsSync(outPath)) {
  console.error("Paste not found");
  process.exit(1);
}

const best = fs.readFileSync(outPath, "utf8").trimEnd();
console.log("lines", best.split(/\r?\n/).length);
console.log("listings", (best.match(/AT&T Stadium - Section/g) || []).length);
console.log("last", best.split(/\r?\n/).pop());
