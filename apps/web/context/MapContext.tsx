"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import type { Map as LeafletMap } from "leaflet";
import { HazardLegendItem, HazardPolygon } from "@/lib/hazardZones";

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

  return (
    <MapContext.Provider
      value={{
        setCenter,
        registerMap,
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
