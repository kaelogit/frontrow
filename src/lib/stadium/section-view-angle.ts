import type { PitchRect, SectionGeometry } from "@/lib/stadium/types";
import { fmtSvgCoord } from "@/lib/stadium/svg-coords";

export interface ViewCone {
  /** Section anchor (seat block) */
  sx: number;
  sy: number;
  /** Near edge of cone at section */
  nx1: number;
  ny1: number;
  nx2: number;
  ny2: number;
  /** Far edge toward pitch (field of view) */
  fx1: number;
  fy1: number;
  fx2: number;
  fy2: number;
}

function pitchCenter(pitch: PitchRect) {
  return {
    cx: pitch.x + pitch.width / 2,
    cy: pitch.y + pitch.height / 2,
  };
}

/** Approximate section position on a generic oval bowl when no traced geometry exists. */
export function approximateSectionPosition(
  sectionNumber: string,
  width = 800,
  height = 640
): { x: number; y: number } {
  const n = parseInt(sectionNumber.replace(/\D/g, ""), 10);
  const cx = width / 2;
  const cy = height / 2;

  if (Number.isNaN(n)) {
    return { x: cx, y: cy * 0.35 };
  }

  const level = n >= 300 ? 3 : n >= 200 ? 2 : 1;
  const radius = level === 1 ? 0.42 : level === 2 ? 0.34 : 0.26;
  const angleIndex = n % 100;
  const angle = (angleIndex / 100) * Math.PI * 2 - Math.PI / 2;

  return {
    x: cx + Math.cos(angle) * width * radius,
    y: cy + Math.sin(angle) * height * radius * 0.85,
  };
}

export function buildViewCone(
  section: SectionGeometry,
  pitch: PitchRect,
  spread = 0.22,
  options?: { standOffset?: number }
): ViewCone {
  const standOffset = options?.standOffset ?? 36;
  const { cx, cy } = pitchCenter(pitch);
  const sx = section.labelX;
  const sy = section.labelY;

  const dx = cx - sx;
  const dy = cy - sy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  // Wide end sits in the stands, outside the pitch
  const bx = sx - ux * standOffset;
  const by = sy - uy * standOffset;
  const nearW = 20 + len * 0.07;

  // Narrow end spreads across the pitch (field-facing side, not the center dot)
  const pitchFaceX = cx - ux * pitch.width * 0.22;
  const pitchFaceY = cy - uy * pitch.height * 0.22;
  const farW = Math.max(pitch.width, pitch.height) * (0.32 + spread * 0.5);

  return {
    sx,
    sy,
    nx1: bx + px * nearW,
    ny1: by + py * nearW,
    nx2: bx - px * nearW,
    ny2: by - py * nearW,
    fx1: pitchFaceX + px * farW,
    fy1: pitchFaceY + py * farW,
    fx2: pitchFaceX - px * farW,
    fy2: pitchFaceY - py * farW,
  };
}

export function buildApproximateViewCone(
  sectionNumber: string,
  pitch: PitchRect,
  width = 800,
  height = 640,
  options?: { standOffset?: number }
): ViewCone {
  const { x, y } = approximateSectionPosition(sectionNumber, width, height);
  return buildViewCone(
    { number: sectionNumber, path: "", labelX: x, labelY: y },
    pitch,
    0.22,
    options
  );
}

export function viewConePath(cone: ViewCone): string {
  return [
    `M ${fmtSvgCoord(cone.nx1)} ${fmtSvgCoord(cone.ny1)}`,
    `L ${fmtSvgCoord(cone.fx1)} ${fmtSvgCoord(cone.fy1)}`,
    `L ${fmtSvgCoord(cone.fx2)} ${fmtSvgCoord(cone.fy2)}`,
    `L ${fmtSvgCoord(cone.nx2)} ${fmtSvgCoord(cone.ny2)}`,
    "Z",
  ].join(" ");
}

/** Zoomed viewBox for listing thumbnails — keeps section anchor and pitch in frame. */
export function cropViewBoxAroundSection(
  anchor: { x: number; y: number },
  pitch: PitchRect,
  fullViewBox: string,
  padding = 100,
  options?: { minSize?: number; maxSize?: number }
): string {
  const minSize = options?.minSize ?? 160;
  const maxSize = options?.maxSize ?? 280;
  const parts = fullViewBox.split(/\s+/).map(Number);
  const [vbMinX, vbMinY, vbW, vbH] = parts;
  const pcx = pitch.x + pitch.width / 2;
  const pcy = pitch.y + pitch.height / 2;

  const left = Math.min(anchor.x, pcx, pitch.x) - padding;
  const top = Math.min(anchor.y, pcy, pitch.y) - padding;
  const right = Math.max(anchor.x, pcx, pitch.x + pitch.width) + padding;
  const bottom = Math.max(anchor.y, pcy, pitch.y + pitch.height) + padding;

  const w = right - left;
  const h = bottom - top;
  const size = Math.min(maxSize, Math.max(minSize, w, h));

  let cropX = (left + right) / 2 - size / 2;
  let cropY = (top + bottom) / 2 - size / 2;

  cropX = Math.max(vbMinX, Math.min(cropX, vbMinX + vbW - size));
  cropY = Math.max(vbMinY, Math.min(cropY, vbMinY + vbH - size));

  return `${fmtSvgCoord(cropX)} ${fmtSvgCoord(cropY)} ${fmtSvgCoord(size)} ${fmtSvgCoord(size)}`;
}
