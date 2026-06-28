/** Soccer pitch markings drawn inside a bounding rect (viagogo-style detail). */
export function PitchMarkings({
  x,
  y,
  width,
  height,
  stroke = "white",
  strokeWidth = 1.5,
  opacity = 0.9,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const penDepth = width * 0.155;
  const penHalfH = height * 0.21;
  const goalDepth = width * 0.055;
  const goalHalfH = height * 0.085;
  const centerR = Math.min(width, height) * 0.12;
  const cornerR = width * 0.02;

  const s = { stroke, strokeWidth, fill: "none", opacity };

  return (
    <g>
      {/* Touchlines */}
      <rect x={x} y={y} width={width} height={height} {...s} rx={2} />

      {/* Halfway */}
      <line x1={cx} y1={y} x2={cx} y2={y + height} {...s} />

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={centerR} {...s} />
      <circle cx={cx} cy={cy} r={2} fill={stroke} opacity={opacity} />

      {/* Left penalty area */}
      <rect x={x} y={cy - penHalfH} width={penDepth} height={penHalfH * 2} {...s} />
      <rect x={x} y={cy - goalHalfH} width={goalDepth} height={goalHalfH * 2} {...s} />
      <circle cx={x + penDepth * 0.72} cy={cy} r={centerR * 0.35} {...s} />

      {/* Right penalty area */}
      <rect
        x={x + width - penDepth}
        y={cy - penHalfH}
        width={penDepth}
        height={penHalfH * 2}
        {...s}
      />
      <rect
        x={x + width - goalDepth}
        y={cy - goalHalfH}
        width={goalDepth}
        height={goalHalfH * 2}
        {...s}
      />
      <circle cx={x + width - penDepth * 0.72} cy={cy} r={centerR * 0.35} {...s} />

      {/* Corner arcs */}
      <path
        d={`M ${x} ${y + cornerR} A ${cornerR} ${cornerR} 0 0 1 ${x + cornerR} ${y}`}
        {...s}
      />
      <path
        d={`M ${x + width - cornerR} ${y} A ${cornerR} ${cornerR} 0 0 1 ${x + width} ${y + cornerR}`}
        {...s}
      />
      <path
        d={`M ${x} ${y + height - cornerR} A ${cornerR} ${cornerR} 0 0 0 ${x + cornerR} ${y + height}`}
        {...s}
      />
      <path
        d={`M ${x + width - cornerR} ${y + height} A ${cornerR} ${cornerR} 0 0 0 ${x + width} ${y + height - cornerR}`}
        {...s}
      />
    </g>
  );
}
