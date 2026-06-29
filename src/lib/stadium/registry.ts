import {
  BC_PLACE_GEOMETRY,
  BC_PLACE_PITCH,
  BC_PLACE_VIEWBOX,
} from "@/lib/stadium/bc-place-layout";
import {
  METLIFE_GEOMETRY,
  METLIFE_PITCH,
  METLIFE_VIEWBOX,
} from "@/lib/stadium/metlife-layout";
import {
  SOFI_GEOMETRY,
  SOFI_PITCH,
  SOFI_VIEWBOX,
} from "@/lib/stadium/sofi-layout";
import {
  LEVIS_GEOMETRY,
  LEVIS_PITCH,
  LEVIS_VIEWBOX,
} from "@/lib/stadium/levis-layout";
import type { StadiumMapDefinition } from "@/lib/stadium/types";

const DEFINITIONS: Record<string, StadiumMapDefinition> = {
  "bc-place": {
    slug: "bc-place",
    name: "BC Place",
    layout: "svg",
    svgPath: "/stadiums/bc-place.svg",
    viewBox: BC_PLACE_VIEWBOX,
    pitch: BC_PLACE_PITCH,
    geometry: BC_PLACE_GEOMETRY,
  },
  metlife: {
    slug: "metlife",
    name: "MetLife Stadium",
    layout: "svg",
    svgPath: "/stadiums/metlife.svg",
    viewBox: METLIFE_VIEWBOX,
    pitch: METLIFE_PITCH,
    geometry: METLIFE_GEOMETRY,
  },
  sofi: {
    slug: "sofi",
    name: "SoFi Stadium",
    layout: "svg",
    svgPath: "/stadiums/sofi.svg",
    viewBox: SOFI_VIEWBOX,
    pitch: SOFI_PITCH,
    geometry: SOFI_GEOMETRY,
  },
  levis: {
    slug: "levis",
    name: "Levi's Stadium",
    layout: "programmatic",
    viewBox: LEVIS_VIEWBOX,
    pitch: LEVIS_PITCH,
    geometry: LEVIS_GEOMETRY,
  },
};

export type MapDisplayMode = "section" | "reference" | "zone" | "none";

const REFERENCE_MAP_IMAGES: Record<string, string> = {
  "mercedes-benz-stadium": "/stadiums/mercedes-benz-reference.png",
  "lumen-field": "/stadiums/lumen-field-reference.png",
  "gillette-stadium": "/stadiums/gillette-stadium-reference.png",
  "bc-place-stadium": "/stadiums/bc-place-reference.png",
};

/** How the tickets page should render the map panel */
export function getMapDisplayMode(
  stadiumMapSlug: string | null | undefined,
  seatMapEnabled?: boolean,
  venueSlug?: string | null
): MapDisplayMode {
  if (!seatMapEnabled) return "none";
  if (stadiumMapSlug && stadiumMapSlug in DEFINITIONS) return "section";
  if (getReferenceMapImage(stadiumMapSlug) || getReferenceMapImage(venueSlug)) {
    return "reference";
  }
  return "zone";
}

export function getStadiumMapDefinition(
  slug: string | null | undefined
): StadiumMapDefinition | null {
  if (!slug) return null;
  return DEFINITIONS[slug] ?? null;
}

/** Map slug for listing thumbnails — only when we have traced section geometry. */
export function getListingPreviewMapSlug(
  stadiumMapSlug: string | null | undefined
): string | null {
  if (!stadiumMapSlug || !(stadiumMapSlug in DEFINITIONS)) return null;
  return stadiumMapSlug;
}

export function listStadiumMapSlugs(): string[] {
  return Object.keys(DEFINITIONS);
}

export function getReferenceMapImage(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return REFERENCE_MAP_IMAGES[slug] ?? null;
}
