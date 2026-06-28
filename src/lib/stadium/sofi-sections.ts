/** SoFi Stadium sections — see docs/venues/SOFI.md */

export type SectionZone = "cat-1" | "cat-2" | "cat-3" | "cat-4";

export interface SofiSectionMeta {
  number: string;
  level: "200" | "400" | "500";
  zone: SectionZone;
}

const nums200 = [
  201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212,
  227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238,
];

const nums400 = [
  ...Array.from({ length: 35 }, (_, i) => 400 + i),
  ...Array.from({ length: 22 }, (_, i) => 436 + i),
];

const nums500 = [
  ...Array.from({ length: 22 }, (_, i) => 504 + i),
  ...Array.from({ length: 18 }, (_, i) => 536 + i),
];

function zone200(n: number): SectionZone {
  return n >= 208 && n <= 211 ? "cat-1" : "cat-2";
}

function zone400(n: number): SectionZone {
  return n >= 412 && n <= 422 ? "cat-2" : "cat-3";
}

function zone500(n: number): SectionZone {
  if (n >= 512 && n <= 542) return "cat-3";
  return n >= 543 ? "cat-4" : "cat-3";
}

export const SOFI_SECTIONS: SofiSectionMeta[] = [
  ...nums200.map((n) => ({ number: String(n), level: "200" as const, zone: zone200(n) })),
  ...nums400.map((n) => ({ number: String(n), level: "400" as const, zone: zone400(n) })),
  ...nums500.map((n) => ({ number: String(n), level: "500" as const, zone: zone500(n) })),
];

export const SOFI_SECTION_MAP = new Map(SOFI_SECTIONS.map((s) => [s.number, s]));
