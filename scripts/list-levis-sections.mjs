import { readFileSync } from "fs";
import { LISTINGS } from "./data/world-cup-match-81-viagogo-listings.mjs";
const secs = new Set();
for (const l of LISTINGS) {
  const s = l[0];
  if (s && !/^category/i.test(s) && !/level$/i.test(s) && !/lounge/i.test(s)) secs.add(s);
}
console.log([...secs].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join("\n"));
console.error("count", secs.size);
