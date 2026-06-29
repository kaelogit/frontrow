/** Brand mark colors — matches Logo.tsx gradient (sky → indigo). */
export const LOGO_MARK_GRADIENT = "linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)";

/** Lucide ticket icon paths (stroke) for favicons and SVG exports. */
export const TICKET_ICON_PATHS = [
  "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
  "M13 5v2",
  "M13 17v2",
  "M13 11v2",
] as const;

export function logoMarkSvg(size: number, cornerRadius = size * 0.2): string {
  const stroke = (size * 0.11).toFixed(2);
  const ticketScale = size / 24;
  const paths = TICKET_ICON_PATHS.map(
    (d) =>
      `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${size * 0.22} ${size * 0.22}) scale(${ticketScale})"/>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Frontrowly">
  <defs>
    <linearGradient id="fr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#fr-gradient)"/>
  ${paths}
</svg>`;
}
