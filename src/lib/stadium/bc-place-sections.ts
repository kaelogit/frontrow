/** BC Place section numbers + zones — see docs/venues/BC_PLACE.md */

export type SectionZone = "cat-1" | "cat-2" | "cat-3" | "cat-4";

export interface BcPlaceSectionMeta {
  number: string;
  level: "200" | "300" | "400";
  zone: SectionZone;
}

const zoneFor = (level: string, n: number): SectionZone => {
  if (level === "300") return "cat-3";
  if (level === "400") return n >= 433 ? "cat-4" : "cat-3";
  if (n >= 210 && n <= 218) return "cat-1";
  if (n >= 236 && n <= 244) return "cat-1";
  return "cat-2";
};

const nums200 = [
  201, 202, 203, 204, 206, 207, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
  221, 222, 224, 225, 226, 227, 228, 229, 230, 231, 233, 234, 236, 237, 238, 239, 240,
  241, 242, 243, 244, 245, 246, 248, 249, 251, 252, 253, 254,
];

const nums300 = [336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346];

const nums400 = [
  401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417,
  418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434,
  435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451,
  452, 453, 454,
];

function build(level: "200" | "300" | "400", numbers: number[]): BcPlaceSectionMeta[] {
  return numbers.map((n) => ({
    number: String(n),
    level,
    zone: zoneFor(level, n),
  }));
}

export const BC_PLACE_SECTIONS: BcPlaceSectionMeta[] = [
  ...build("200", nums200),
  ...build("300", nums300),
  ...build("400", nums400),
];

export const BC_PLACE_SECTION_MAP = new Map(
  BC_PLACE_SECTIONS.map((s) => [s.number, s])
);
