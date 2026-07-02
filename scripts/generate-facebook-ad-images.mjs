#!/usr/bin/env node
/**
 * Static Facebook ad images from stadium photos + brand overlay.
 * Run: npm run brand:facebook-ads
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "brand", "facebook", "ads");
const LOGO = readFileSync(join(ROOT, "public", "brand", "logo-mark.svg"));

const ads = [
  {
    file: "ad-square-worldcup.png",
    width: 1080,
    height: 1080,
    photo: "public/images/events/match-104.jpg",
    headline: "WORLD CUP 2026",
    subline: "Premium tickets · Pick your section",
    cta: "frontrowly.com",
  },
  {
    file: "ad-square-seats.png",
    width: 1080,
    height: 1080,
    photo: "public/images/events/match-91.jpg",
    headline: "SEATS TOGETHER",
    subline: "Interactive maps · Secure booking",
    cta: "Book at frontrowly.com",
  },
  {
    file: "ad-stories-9x16.png",
    width: 1080,
    height: 1920,
    photo: "public/images/events/match-104.jpg",
    headline: "GET CLOSER",
    subline: "TO THE MATCH",
    cta: "frontrowly.com",
    vertical: true,
  },
  {
    file: "ad-stories-brand.png",
    width: 1080,
    height: 1920,
    photo: "public/images/events/match-91.jpg",
    headline: "FRONTROWLY",
    subline: "Live sports · Premium seats",
    cta: "Shop tickets → frontrowly.com",
    vertical: true,
    brandHeadline: true,
  },
  {
    file: "ad-landscape-link.png",
    width: 1200,
    height: 628,
    photo: "public/images/events/match-98.jpg",
    headline: "Premium Event Tickets",
    subline: "World Cup 2026 · Stadium maps · Secure checkout",
    cta: "frontrowly.com",
    landscape: true,
  },
  {
    file: "ad-landscape-worldcup.png",
    width: 1200,
    height: 628,
    photo: "public/images/events/match-104.jpg",
    headline: "World Cup 2026 Tickets",
    subline: "Reserve your seats today",
    cta: "frontrowly.com",
    landscape: true,
  },
];

function overlaySvg(ad) {
  const { width, height, headline, subline, cta, vertical, landscape, brandHeadline } = ad;
  const headlineSize = vertical ? 72 : landscape ? 52 : 58;
  const subSize = vertical ? 40 : landscape ? 26 : 32;
  const ctaSize = vertical ? 28 : landscape ? 22 : 26;
  const headlineY = vertical ? height * 0.62 : landscape ? height * 0.48 : height * 0.58;
  const subY = headlineY + (vertical ? 56 : landscape ? 38 : 48);
  const ctaY = vertical ? height * 0.88 : height * 0.82;
  const gradStop = vertical ? "0.35" : landscape ? "0.15" : "0.25";

  const headlineFill = brandHeadline
    ? `<tspan fill="#ffffff">FRONT</tspan><tspan fill="#7dd3fc">ROWLY</tspan>`
    : escapeXml(headline);

  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(15,23,42,0.15)"/>
      <stop offset="${gradStop}" stop-color="rgba(15,23,42,0.55)"/>
      <stop offset="100%" stop-color="rgba(15,23,42,0.92)"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#shade)"/>
  ${landscape ? `<rect x="0" y="0" width="${Math.round(width * 0.55)}" height="${height}" fill="rgba(15,23,42,0.55)"/>` : ""}
  <text x="${width / 2}" y="${headlineY}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-size="${headlineSize}" font-weight="700"
    fill="#ffffff">${headlineFill}</text>
  <text x="${width / 2}" y="${subY}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-size="${subSize}" font-weight="400"
    fill="#e0f2fe">${escapeXml(subline)}</text>
  <rect x="${width / 2 - 140}" y="${ctaY - 36}" width="280" height="48" rx="24" fill="url(#brand)"/>
  <text x="${width / 2}" y="${ctaY - 6}" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif" font-size="${ctaSize}" font-weight="700"
    fill="#ffffff">${escapeXml(cta)}</text>
</svg>`);
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function renderAd(ad) {
  const photoPath = join(ROOT, ad.photo);
  const logoSize = ad.landscape ? 72 : ad.vertical ? 96 : 88;
  const logoMargin = ad.landscape ? 28 : 36;

  const logoPng = await sharp(LOGO).resize(logoSize, logoSize).png().toBuffer();

  const base = await sharp(photoPath)
    .resize(ad.width, ad.height, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const outPath = join(OUT, ad.file);
  await sharp(base)
    .composite([
      { input: overlaySvg(ad), top: 0, left: 0 },
      { input: logoPng, top: logoMargin, left: logoMargin },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  return outPath;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const ad of ads) {
    const path = await renderAd(ad);
    console.log(`✓ ${path.replace(ROOT + "\\", "").replace(ROOT + "/", "")}`);
  }
  console.log("\nFacebook ad sizes:");
  console.log("  1080×1080 — feed (square)");
  console.log("  1080×1920 — Stories / Reels");
  console.log("  1200×628  — link / landscape feed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
