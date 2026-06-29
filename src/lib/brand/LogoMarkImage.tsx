import { LOGO_MARK_GRADIENT, TICKET_ICON_PATHS } from "@/lib/brand/logo-mark";

/** Raster favicon / apple-icon body for `next/og` ImageResponse. */
export function LogoMarkImage({ size }: { size: number }) {
  const radius = Math.round(size * 0.2);
  const padding = size * 0.22;
  const ticketSize = size * 0.56;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: LOGO_MARK_GRADIENT,
        borderRadius: radius,
      }}
    >
      <svg
        width={ticketSize}
        height={ticketSize}
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginLeft: padding * 0.15, marginTop: padding * 0.05 }}
      >
        {TICKET_ICON_PATHS.map((d) => (
          <path
            key={d}
            d={d}
            stroke="#ffffff"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
