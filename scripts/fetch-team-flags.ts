/**
 * Download World Cup team flag SVGs into public/flags/{iso}.svg
 *
 * Source: flagcdn.com (same artwork previously loaded at runtime)
 *   npm run flags:fetch
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { TEAM_FLAG_ISO_CODES } from "../src/lib/teams/flags";

const OUT_DIR = join(process.cwd(), "public", "flags");
const SOURCE = "https://flagcdn.com";

async function fetchFlag(iso: string): Promise<void> {
  const url = `${SOURCE}/${iso}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${iso}: HTTP ${res.status} from ${url}`);
  }
  const svg = await res.text();
  if (!svg.includes("<svg")) {
    throw new Error(`${iso}: response is not SVG`);
  }
  writeFileSync(join(OUT_DIR, `${iso}.svg`), svg, "utf8");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Fetching ${TEAM_FLAG_ISO_CODES.length} flags → public/flags/`);

  let ok = 0;
  for (const iso of TEAM_FLAG_ISO_CODES) {
    process.stdout.write(`  ${iso}.svg … `);
    await fetchFlag(iso);
    console.log("ok");
    ok++;
  }

  console.log(`\nDone — ${ok} flags saved. TBD placeholder: public/flags/tbd.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
