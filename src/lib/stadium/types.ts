export interface SectionGeometry {
  number: string;
  path: string;
  labelX: number;
  labelY: number;
  zone?: string;
}

export interface PitchRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type StadiumMapLayout = "programmatic" | "svg" | "zone-only";

export interface StadiumMapDefinition {
  slug: string;
  name: string;
  layout: StadiumMapLayout;
  /** Static SVG export (admin upload / reference) */
  svgPath?: string;
  viewBox: string;
  pitch: PitchRect;
  geometry: SectionGeometry[];
}
