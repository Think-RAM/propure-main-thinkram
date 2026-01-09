"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Map as LeafletMap } from "leaflet";
import { HazardLegendItem, HazardPolygon } from "@/lib/hazardZones";
import { featureLayer, FeatureLayer } from "esri-leaflet";
import { m } from "framer-motion";

type LatLng = {
  lat: number;
  lng: number;
};

export type SearchResult = {
  title: string;
  description: string;
  yield: string;
  gradientFrom: string;
  gradientTo: string;
  yieldColor: string;
  lat: number;
  lng: number;
};

type MapContextType = {
  setCenter: (coords: LatLng, zoom?: number) => void;
  registerMap: (map: LeafletMap) => void;
  setMapLayer: (layerUrl: string, style: (feature: any) => void) => void;
  results: SearchResult[];
  polygons: HazardPolygon[];
  legends: HazardLegendItem[];
  setResults: (results: SearchResult[]) => void;
  setPolygons: (polygons: HazardPolygon[]) => void;
  setLegends: (legends: HazardLegendItem[]) => void;
};

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<FeatureLayer | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [polygons, setPolygons] = useState<HazardPolygon[]>([]);
  const [legends, setLegends] = useState<HazardLegendItem[]>([]);

  const registerMap = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const setCenter = useCallback((coords: LatLng, zoom = 14) => {
    mapRef.current?.setView([coords.lat, coords.lng], zoom, {
      animate: true,
    });
  }, []);

  const setMapLayer = useCallback(
    (layerUrl: string, style: (feature: any) => void) => {
      if (!mapRef.current) return;
      // Remove existing layer if any
      if(layerRef.current){
        layerRef.current.remove();
        layerRef.current = null;
      }
      const layer: FeatureLayer = featureLayer({
        url: layerUrl,
        style: (feature) => style(feature),
        minZoom: 10,
        simplifyFactor: 0.5,
        cacheLayers: true,
      });
      layer.addTo(mapRef.current);
      layerRef.current = layer;
      console.log(`Map Layer set to: ${layerUrl}`);
    },
    []
  );

  useEffect(() => {
    return () => {
      layerRef.current?.remove();
    };
  }, []);

  // 2️⃣ Spatially filter on moveend
  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    const updateSpatialFilter = () => {
      const bounds = mapRef.current!.getBounds();

      // Build spatial WHERE clause
      layerRef
        .current!.query()
        .bboxIntersects(bounds)
        .where("1=1"); // keep attribute filters here

      // Apply via setWhere (forces refresh)
      layerRef.current!.setWhere("1=1");
      layerRef.current!.refresh();

      // NOTE: bboxIntersects affects internal queries automatically
    };

    mapRef.current.on("moveend", updateSpatialFilter);
    updateSpatialFilter();

    return () => {
      mapRef.current?.off("moveend", updateSpatialFilter);
    };
  }, [layerRef.current]);

  return (
    <MapContext.Provider
      value={{
        setCenter,
        registerMap,
        setMapLayer,
        results,
        setResults,
        polygons,
        legends,
        setPolygons,
        setLegends,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}
