/** Stable SVG coordinate strings — avoids SSR/client float drift in path `d` attributes. */
export function roundSvgCoord(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

export function fmtSvgCoord(n: number): string {
  const rounded = roundSvgCoord(n);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(4).replace(/\.?0+$/, "");
}

export function roundSvgPath(path: string): string {
  return path.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (match) =>
    fmtSvgCoord(parseFloat(match))
  );
}
