// Placeholder for PostGIS queries - to be implemented later
export const GEO_PACKAGE_VERSION = "0.1.0";

// Australia bounding box
export const AUSTRALIA_BOUNDS = {
  north: -10.0,
  south: -44.0,
  east: 154.0,
  west: 113.0,
};

// Australia center
export const AUSTRALIA_CENTER = {
  lat: -25.2744,
  lng: 133.7751,
};

// Placeholder for suburb search
export function searchSuburbsInBounds(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  console.log("Suburb search not yet implemented", bounds);
  return [];
}
