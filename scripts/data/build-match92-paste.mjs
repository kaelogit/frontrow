import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "patches");
const outPath = path.join(__dirname, "pastes", "match-92.txt");

const headerPath = path.join(root, "match-92-header.txt");
const parts = fs
  .readdirSync(root)
  .filter((f) => f.match(/^match-92-listings-part\d+\.txt$/))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (!fs.existsSync(headerPath) || parts.length === 0) {
  console.error("Need match-92-header.txt and match-92-listings-part*.txt in patches/");
  process.exit(1);
}

const header = fs.readFileSync(headerPath, "utf8").trimEnd();
const body = parts.map((p) => fs.readFileSync(path.join(root, p), "utf8").trimEnd()).join("\n");
const full = `${header}\n${body}\n`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, full, "utf8");
const listings = (full.match(/Estadio Azteca \(Estadio Banorte\) - Section/g) || []).length;
console.log("parts", parts.length, "lines", full.split(/\r?\n/).length, "listings", listings);
