import fs from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const match85 = fs.readFileSync(path.join(scriptDir, "pastes", "match-85.txt"), "utf8").split(/\r?\n/);
const header = [...match85];

header[1] = "W85 vs W87 - World Cup - Round of 16 (Match 96)";
header[2] = "Tue · Jul 7 · 1:00 PM";
// Insert scarcity line after Sign In (match 96 viagogo header)
if (header[13] === "Sign In" && header[14] === "201") {
  header.splice(14, 0, "Only 4% of tickets left");
}
const priceIdx = header.findIndex((l) => l.startsWith("US$") && header[header.indexOf(l) + 1]?.startsWith("US$"));
if (priceIdx >= 0) {
  header[priceIdx] = "US$924";
  header[priceIdx + 1] = "US$5,207+";
}
const viewIdx = header.findIndex((l) => l === "View 5007 tickets");
if (viewIdx >= 0) {
  header[viewIdx] = "View 2773 tickets";
  header[viewIdx + 1] = "2773 tickets";
}

const listingsStart = header.findIndex((l) => l.startsWith("BC Place Stadium - Section"));
const headerLines = listingsStart > 0 ? header.slice(0, listingsStart) : header.slice(0, 201);

const out = path.join(scriptDir, "patches", "match-96-user-paste.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, headerLines.join("\n") + "\n", "utf8");
console.log("wrote", out, "lines", headerLines.length);
