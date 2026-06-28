/**
 * One-off: extract Match 98 paste from a saved raw file.
 * Save user viagogo copy to scripts/data/pastes/match-98-user-full.txt then:
 *   node scripts/data/split-match98-listings.mjs scripts/data/pastes/match-98-user-full.txt
 *   node scripts/data/build-match98-header.mjs
 *   node scripts/data/compose-match98-paste.mjs
 *   npm run seed:match-98
 */

import fs from "fs";
import path from "path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const fullPath = path.join(root, "pastes", "match-98-user-full.txt");

if (!fs.existsSync(fullPath)) {
  console.error("Missing", fullPath);
  process.exit(1);
}

const raw = fs.readFileSync(fullPath, "utf8");
const n = (raw.match(/SoFi Stadium - Section/g) || []).length;
console.log("listings", n, "lines", raw.split(/\r?\n/).length);
if (!raw.includes("Showing 316 of 316")) {
  console.warn("Warning: expected footer Showing 316 of 316");
}
if (n < 300) {
  console.warn("Warning: expected ~316 listings, got", n);
}
