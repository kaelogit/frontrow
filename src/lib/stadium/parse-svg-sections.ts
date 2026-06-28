/** Extract stadium section numbers from SVG path / group ids. */

const ID_ATTR = /\bid=["']([^"']+)["']/gi;

export function extractSectionNumber(id: string): string | null {
  const trimmed = id.trim();
  const prefixed = /^section[-_]?(\d{2,4})$/i.exec(trimmed);
  if (prefixed) return prefixed[1];

  if (/^\d{2,4}$/.test(trimmed)) return trimmed;

  const embedded = /(?:section|sec)[-_]?(\d{2,4})/i.exec(trimmed);
  if (embedded) return embedded[1];

  return null;
}

export function parseSectionNumbersFromSvg(svg: string): string[] {
  if (!svg.trim()) return [];

  const found = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = ID_ATTR.exec(svg)) !== null) {
    const section = extractSectionNumber(match[1]);
    if (section) found.add(section);
  }

  const dataSection = /data-section=["'](\d{2,4})["']/gi;
  while ((match = dataSection.exec(svg)) !== null) {
    found.add(match[1]);
  }

  return Array.from(found).sort((a, b) => Number(a) - Number(b));
}

export function countSvgSectionIds(svg: string): number {
  return parseSectionNumbersFromSvg(svg).length;
}
