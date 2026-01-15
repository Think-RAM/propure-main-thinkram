import type { LatLngExpression, PathOptions } from "leaflet";
import { Geometry } from "wkx";
import { Buffer } from "buffer";

/* ----------------------------- */
/* Raw hazard record             */
/* ----------------------------- */
export interface HazardZoneRecord {
  id: number;
  hazard_type: string;
  risk_level: string;
  planning_level: string;
  state: string;
  geometry: string; // WKB hex
}

/* ----------------------------- */
/* Parsed polygon                */
/* ----------------------------- */
export interface HazardPolygon {
  id: number;
  coordinates: LatLngExpression[];
  style: PathOptions;
  hazardType: string;
  riskLevel: string;
}

/* ----------------------------- */
/* Legend config                 */
/* ----------------------------- */
export interface HazardLegendItem {
  label: string;
  color: string;
  groupName: string;
}

type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type GeoJSONMultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;


/* ----------------------------- */
/* Color rules                   */
/* ----------------------------- */
export const HAZARD_COLORS: Record<string, string> = {
  "Medium Potential Bushfire Intensity": "#F97316",
  "Potential Impact Buffer": "#FACC15",
};

export const RISK_OPACITY: Record<string, number> = {
  "Low": 0.25,
  "Medium Potential": 0.45,
  "High": 0.65,
};

function isGeoJSONGeometry(value: unknown): value is GeoJSONGeometry {
  if (!value || typeof value !== "object") return false;

  const v = value as any;

  if (v.type === "Polygon") {
    return Array.isArray(v.coordinates);
  }

  if (v.type === "MultiPolygon") {
    return Array.isArray(v.coordinates);
  }

  return false;
}


/* ----------------------------- */
/* Geometry parser               */
/* ----------------------------- */
export function parseHazardPolygon(
  record: HazardZoneRecord
): HazardPolygon | null {
  try {
    // Convert HEX → Buffer
    const buffer = Buffer.from(record.geometry, "hex");

    // Parse WKB → Geometry
    const geometry = Geometry.parse(buffer).toGeoJSON();

    if (!isGeoJSONGeometry(geometry)) {
      console.warn("Invalid GeoJSON geometry", geometry);
      return null;
    }

    // Normalize to Polygon coordinates
    const rings =
      geometry.type === "Polygon"
        ? geometry.coordinates
        : geometry.coordinates[0];

    // Leaflet expects [lat, lng]
    const coordinates = rings[0].map(
      ([lng, lat]) => [lat, lng] as LatLngExpression
    );

    return {
      id: record.id,
      hazardType: record.hazard_type,
      riskLevel: record.risk_level,
      coordinates,
      style: {
        color: HAZARD_COLORS[record.hazard_type] ?? "#EF4444",
        weight: 1,
        fillOpacity: RISK_OPACITY[record.risk_level] ?? 0.4,
      },
    };
  } catch (err) {
    console.error("Failed to parse hazard geometry", err);
    return null;
  }
}

/* ----------------------------- */
/* Bulk converter                */
/* ----------------------------- */
export function buildHazardPolygons(
  data: HazardZoneRecord[]
): HazardPolygon[] {
  return data
    .map(parseHazardPolygon)
    .filter(Boolean) as HazardPolygon[];
}

export function buildHazardLegend(
  data: HazardZoneRecord[]
): HazardLegendItem[] {
  const unique = new Map<string, { color: string; groupName: string }>();

  data.forEach((z) => {
    if (!unique.has(z.hazard_type)) {
      unique.set(
        z.hazard_type,
        {
          color: HAZARD_COLORS[z.hazard_type] ?? "#EF4444",
          groupName: z.hazard_type,
        }
      );
    }
  });

  return Array.from(unique.entries()).map(([label, color]) => ({
    label,
    color: color.color,
    groupName: color.groupName,
  }));
}

// For demo purposes, we can import static data
import hazardData from "@/data/hazard_zones.json";
export const DEMO_HAZARD_POLYGONS = buildHazardPolygons(hazardData);
export const DEMO_HAZARD_LEGEND = buildHazardLegend(hazardData);