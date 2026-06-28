/** Generate row labels for bulk stadium row seeding. */

export type RowPreset = "A-T" | "A-Z" | "AA-AZ" | "1-20" | "custom";

export function lettersAToZ(): string[] {
  return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
}

export function lettersAToT(): string[] {
  return lettersAToZ().slice(0, 20);
}

export function lettersAaToAz(): string[] {
  return lettersAToZ().map((l) => `A${l}`);
}

export function numbers1ToN(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

export function parseCustomRowLabels(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function rowLabelsForPreset(preset: RowPreset, customInput = ""): string[] {
  switch (preset) {
    case "A-T":
      return lettersAToT();
    case "A-Z":
      return lettersAToZ();
    case "AA-AZ":
      return lettersAaToAz();
    case "1-20":
      return numbers1ToN(20);
    case "custom":
      return parseCustomRowLabels(customInput);
    default:
      return [];
  }
}

export const ROW_PRESETS: { value: RowPreset; label: string; example: string }[] = [
  { value: "A-T", label: "A through T", example: "A, B, … T" },
  { value: "A-Z", label: "A through Z", example: "A, B, … Z" },
  { value: "AA-AZ", label: "AA through AZ", example: "AA, AB, … AZ" },
  { value: "1-20", label: "1 through 20", example: "1, 2, … 20" },
  { value: "custom", label: "Custom list", example: "SS, PP, VIP" },
];
