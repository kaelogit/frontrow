import type { SectionZone } from "@/lib/stadium/bc-place-sections";

export interface InferredSectionMeta {
  level: string;
  zone: SectionZone;
}

/** Default level + FIFA category zone from a numeric section id. */
export function inferSectionMeta(sectionNumber: string): InferredSectionMeta {
  const n = Number.parseInt(sectionNumber, 10);
  if (Number.isNaN(n)) {
    return { level: "other", zone: "cat-4" };
  }

  const hundreds = Math.floor(n / 100);
  const level = hundreds >= 1 ? `${hundreds}00` : "100";

  let zone: SectionZone = "cat-2";
  if (hundreds <= 1) zone = "cat-1";
  else if (hundreds === 2) zone = "cat-2";
  else if (hundreds === 3) zone = "cat-3";
  else if (hundreds >= 4) zone = "cat-4";

  return { level, zone };
}
