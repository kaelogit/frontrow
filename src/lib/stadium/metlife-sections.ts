/** MetLife Stadium sections — see docs/venues/METLIFE.md */

export type SectionZone = "cat-1" | "cat-2" | "cat-3" | "cat-4";

export interface MetlifeSectionMeta {
  number: string;
  level: "100" | "300";
  zone: SectionZone;
}

const nums100 = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
  119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136,
  137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
];

const nums300 = [
  301, 302, 303, 304, 305, 307, 308, 309, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320,
  321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338,
  339, 341, 342, 343, 344, 345, 346, 347, 348, 349, 351, 353,
];

function zone100(n: number): SectionZone {
  return n <= 128 ? "cat-1" : "cat-2";
}

function zone300(n: number): SectionZone {
  if (n >= 341 || (n >= 321 && n <= 329)) return "cat-3";
  return "cat-4";
}

export const METLIFE_SECTIONS: MetlifeSectionMeta[] = [
  ...nums100.map((n) => ({ number: String(n), level: "100" as const, zone: zone100(n) })),
  ...nums300.map((n) => ({ number: String(n), level: "300" as const, zone: zone300(n) })),
];

export const METLIFE_SECTION_MAP = new Map(
  METLIFE_SECTIONS.map((s) => [s.number, s])
);
