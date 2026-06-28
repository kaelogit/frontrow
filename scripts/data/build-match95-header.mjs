import fs from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const match80 = fs.readFileSync(path.join(scriptDir, "pastes", "match-80.txt"), "utf8").split(/\r?\n/);
const header = [...match80];
header[1] = "W86 vs W88 - World Cup - Round of 16 (Match 95)";
header[2] = "Tue · Jul 7 · 12:00 PM";
header[357] = "US$2,260";
header[358] = "US$8,365+";
header[372] = "View 4608 tickets";
header[373] = "4608 tickets";

const out = path.join(scriptDir, "patches", "match-95-user-paste.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header.slice(0, 374).join("\n") + "\n", "utf8");
console.log("wrote", out, "lines", 374);
