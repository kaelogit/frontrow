/** Levi's Stadium sections — see docs/venues/LEVIS.md */

export type SectionZone = "cat-1" | "cat-2" | "cat-3" | "cat-4";

export interface LevisSectionMeta {
  number: string;
  level: "100" | "200" | "300" | "400" | "club";
  zone: SectionZone;
}

const nums100nw = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
];

const nums100east = [
  113, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 127, 128, 129, 130,
  131, 132, 133, 134, 135, 136, 137, 139, 140,
];

const nums100south = [142, 143, 144, 145, 146];

const nums200west = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211];
const nums200north = [212, 213, 214, 215, 218, 219, 220];
const nums200east = [
  221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232,
];
const nums200south = [240, 243, 244, 245, 246];

const nums300 = Array.from({ length: 28 }, (_, i) => 301 + i);

const nums400 = Array.from({ length: 22 }, (_, i) => 401 + i);

function zone100(n: number): SectionZone {
  if (n <= 104 || (n >= 127 && n <= 130)) return "cat-1";
  if (n <= 112 || n >= 142) return "cat-2";
  return "cat-3";
}

function zone200(n: number): SectionZone {
  if ((n >= 204 && n <= 211) || (n >= 224 && n <= 228)) return "cat-1";
  if (n >= 221 && n <= 232) return "cat-2";
  return "cat-3";
}

function zone300(n: number): SectionZone {
  if (n >= 312 && n <= 318) return "cat-1";
  if (n >= 308 && n <= 321) return "cat-2";
  return "cat-3";
}

function zone400(n: number): SectionZone {
  if (n >= 406 && n <= 418) return "cat-2";
  if (n <= 405 || n >= 419) return "cat-4";
  return "cat-3";
}

export const LEVIS_SECTIONS: LevisSectionMeta[] = [
  ...nums100nw.map((n) => ({
    number: String(n),
    level: "100" as const,
    zone: zone100(n),
  })),
  ...nums100east.map((n) => ({
    number: String(n),
    level: "100" as const,
    zone: zone100(n),
  })),
  ...nums100south.map((n) => ({
    number: String(n),
    level: "100" as const,
    zone: zone100(n),
  })),
  ...nums200west.map((n) => ({
    number: String(n),
    level: "200" as const,
    zone: zone200(n),
  })),
  ...nums200north.map((n) => ({
    number: String(n),
    level: "200" as const,
    zone: zone200(n),
  })),
  ...nums200east.map((n) => ({
    number: String(n),
    level: "200" as const,
    zone: zone200(n),
  })),
  ...nums200south.map((n) => ({
    number: String(n),
    level: "200" as const,
    zone: zone200(n),
  })),
  ...nums300.map((n) => ({
    number: String(n),
    level: "300" as const,
    zone: zone300(n),
  })),
  ...nums400.map((n) => ({
    number: String(n),
    level: "400" as const,
    zone: zone400(n),
  })),
  { number: "C138", level: "club", zone: "cat-1" },
];

export const LEVIS_SECTION_MAP = new Map(
  LEVIS_SECTIONS.map((s) => [s.number, s])
);
