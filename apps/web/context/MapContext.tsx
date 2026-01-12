"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { type Map as LeafletMap } from "leaflet";
import { HazardLegendItem, HazardPolygon } from "@/lib/hazardZones";
import { featureLayer, FeatureLayer } from "esri-leaflet";
import { handleLegendExtraction, styleLayer } from "@/lib/map/styles";
import { toast } from "sonner";
import { Layers, stateLayerMapping } from "@/lib/map/layers";
import { coordToAUState } from "@/lib/utils";

type LatLng = {
  lat: number;
  lng: number;
};

export type MapViewType = "default" | "satellite" | "terrain";

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
  currentView: MapViewType;
  currentLayer?: Layers;
  setCenter: (coords: LatLng, zoom?: number) => void;
  registerMap: (map: LeafletMap) => void;
  setMapLayer: (layerId?: Layers) => void;
  results: SearchResult[];
  polygons: HazardPolygon[];
  legends: HazardLegendItem[];
  setResults: (results: SearchResult[]) => void;
  setPolygons: (polygons: HazardPolygon[]) => void;
  setLegends: (legends: HazardLegendItem[]) => void;
  setMapView: (view: MapViewType) => void;
};

export const MAP_VIEW_URLS: Record<MapViewType, string> = {
  default: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

export const MAP_LABELS_OVERLAY =
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<FeatureLayer | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [polygons, setPolygons] = useState<HazardPolygon[]>([]);
  const [legends, setLegends] = useState<HazardLegendItem[]>([]);
  const [currentLayer, setCurrentLayer] = useState<Layers | undefined>();
  const [mapView, setMapView] = useState<MapViewType>("default");

  const registerMap = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const setCenter = useCallback((coords: LatLng, zoom = 14) => {
    mapRef.current?.setView([coords.lat, coords.lng], zoom, {
      animate: true,
    });
  }, []);

  const setMapLayer = useCallback(async (layerId?: Layers) => {
    if (!mapRef.current) {
      toast.error("Map is not Loaded yet.");
      return;
    }
    // Remove existing layer if any
    if (layerRef.current) {
      layerRef.current.remove();
      mapRef.current.removeLayer(layerRef.current);
      layerRef.current = null;
      setCurrentLayer(undefined);
      setLegends([]);
    }
    if (!layerId) {
      return; // if no layerId provided, just remove existing layer
    }
    const mapCenter = mapRef.current.getCenter();
    const auState = coordToAUState(mapCenter.lat, mapCenter.lng);
    console.log(`Setting Layer ${layerId} for State ${auState}`);
    if (!auState) {
      toast.error("Map out of supported area for this layer.");
      return;
    }
    const toastId = toast.loading("Loading map layer...");
    try {
      const layerData = stateLayerMapping[auState][layerId];
      setCurrentLayer(layerId);
      const legendData = await handleLegendExtraction(layerData.url); // assuming layerId 2 for legend extraction
      const layer: FeatureLayer = featureLayer({
        url: layerData.url,
        style: (feature) => styleLayer(feature, legendData),
        minZoom: 10,
        simplifyFactor: 0.4,
        cacheLayers: true,
        ignoreRenderer: true,
      });
      layer.addTo(mapRef.current);
      layerRef.current = layer;
      setLegends(
        legendData.map((item) => ({
          label: item.label,
          color: item.fillColor,
        }))
      );
      console.log(`Map Layer set to: ${layerData.name}`);
    } catch (error) {
      console.error("Error setting map layer:", error);
      toast.error("Failed to load map layer.");
    } finally {
      toast.dismiss(toastId);
    }
  }, []);

  const setView = useCallback((view: MapViewType) => {
    setMapView(view);
  }, []);

  useEffect(() => {
    return () => {
      layerRef.current?.remove();
    };
  }, []);

  // 2️⃣ Spatially filter on moveend
  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    const updateSpatialFilter = () => {
      console.log("Updated Query");
      const bounds = mapRef.current!.getBounds();

      // Build spatial WHERE clause
      layerRef.current!.query().bboxIntersects(bounds).where("1=1"); // keep attribute filters here

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
        currentView: mapView,
        currentLayer,
        setCenter,
        registerMap,
        setMapLayer,
        results,
        setResults,
        polygons,
        legends,
        setPolygons,
        setLegends,
        setMapView: setView,
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
