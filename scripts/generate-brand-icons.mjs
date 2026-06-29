/**
 * Generates favicon.ico and PWA PNGs from the Frontrowly logo mark SVG.
 * Run: npm run icons:generate
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "brand", "logo-mark.svg");
const svg = readFileSync(svgPath);

async function png(size) {
  return sharp(svg).resize(size, size).png().toBuffer();
}

async function main() {
  const brandDir = join(root, "public", "brand");
  mkdirSync(brandDir, { recursive: true });

  const appDir = join(root, "src", "app");
  const sizes = [16, 32, 48];

  const pngBuffers = await Promise.all(sizes.map((s) => png(s)));
  const ico = await pngToIco(pngBuffers);
  writeFileSync(join(appDir, "favicon.ico"), ico);

  for (const size of [192, 512]) {
    const buf = await png(size);
    writeFileSync(join(brandDir, `icon-${size}.png`), buf);
  }

  console.log("Generated src/app/favicon.ico");
  console.log("Generated public/brand/icon-192.png, icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
