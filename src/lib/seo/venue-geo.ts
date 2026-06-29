/** WGS84 coordinates for World Cup 2026 host venues (Schema.org GeoCoordinates). */

export interface VenueGeo {
  latitude: number;
  longitude: number;
}

export const VENUE_GEO: Record<string, VenueGeo> = {
  "estadio-azteca": { latitude: 19.3029, longitude: -99.1505 },
  "estadio-bbva": { latitude: 25.6866, longitude: -100.2455 },
  "estadio-akron": { latitude: 20.6816, longitude: -103.4614 },
  "bc-place-stadium": { latitude: 49.2768, longitude: -123.112 },
  "bmo-field": { latitude: 43.6332, longitude: -79.4186 },
  "metlife-stadium": { latitude: 40.8135, longitude: -74.0745 },
  "sofi-stadium": { latitude: 33.9535, longitude: -118.3392 },
  "hard-rock-stadium": { latitude: 25.958, longitude: -80.2389 },
  "gillette-stadium": { latitude: 42.0909, longitude: -71.2643 },
  "att-stadium": { latitude: 32.7473, longitude: -97.0945 },
  "mercedes-benz-stadium": { latitude: 33.7553, longitude: -84.4006 },
  "lumen-field": { latitude: 47.5952, longitude: -122.3316 },
  "levis-stadium": { latitude: 37.4032, longitude: -121.9698 },
  "lincoln-financial-field": { latitude: 39.9008, longitude: -75.1675 },
  "nrg-stadium": { latitude: 29.6847, longitude: -95.4107 },
  "arrowhead-stadium": { latitude: 39.0489, longitude: -94.4839 },
};

const COUNTRY_ISO: Record<string, string> = {
  Canada: "CA",
  "United States": "US",
  Mexico: "MX",
};

export function getVenueGeo(venueSlug: string | null | undefined): VenueGeo | null {
  if (!venueSlug) return null;
  return VENUE_GEO[venueSlug] ?? null;
}

export function countryToIso(country: string): string | undefined {
  return COUNTRY_ISO[country];
}
