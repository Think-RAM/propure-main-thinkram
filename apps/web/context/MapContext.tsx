"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Map as LeafletMap } from "leaflet";
import type { FeatureLayer } from "esri-leaflet";
import { toast } from "sonner";
import { HazardPolygon } from "@/lib/hazardZones";
import {
  handleLegendExtraction,
  styleLayer,
  stylePopupLayer,
} from "@/lib/map/styles";
import {
  BBBox,
  getLayersForView,
  LayerRegistry,
  Layers,
  Styles,
} from "@/lib/map/layers";
import { coordToAUStates } from "@/lib/utils";
import { HEATMAP_LEGENDS, MetricType } from "@/lib/map/heatmap-config";

type LatLng = { lat: number; lng: number };
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

  // optional extras if you use them in cards
  url?: string;
  beds?: number;
  baths?: number;
  cars?: number;
};

type MapContextType = {
  map: LeafletMap | null;
  viewport: BBBox | null;
  currentView: MapViewType;
  currentLayer?: Layers;
  currentHeatmapLayer?: MetricType;
  setCenter: (coords: LatLng, zoom?: number) => void;
  registerMap: (map: LeafletMap) => void;
  setHeatmapLayer: (layerId?: MetricType) => void;
  setMapLayer: (layerId?: Layers) => Promise<void>;
  results: SearchResult[];
  polygons: HazardPolygon[];
  legends: Styles[];
  setResults: (results: SearchResult[]) => void;
  setPolygons: (polygons: HazardPolygon[]) => void;
  setLegends: (legends: Styles[]) => void;
  setMapView: (view: MapViewType) => void;
};

interface MapViewUrls {
  attribution: string;
  url: string;
}

export const MAP_VIEW_URLS: Record<MapViewType, MapViewUrls> = {
  default: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  satellite: {
    attribution: "Tiles &copy; Esri",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  terrain: {
    attribution:
      'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  },
};

const MapContext = createContext<MapContextType | null>(null);

function bboxFromMap(map: LeafletMap): BBBox {
  const b = map.getBounds();
  return {
    minLat: b.getSouth(),
    minLng: b.getWest(),
    maxLat: b.getNorth(),
    maxLng: b.getEast(),
  };
}

/** small helper to keep a stable event handler that reads latest refs */
function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: any[]) => handlerRef.current(...args)) as T,
    [],
  );
}

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Feature layers are purely imperative -> ref, not state
  const featureLayersRef = useRef<Record<string, FeatureLayer>>({});

  // Track metadata in a ref to avoid rerender churn on moveend
  const metaRef = useRef<Record<string, LayerRegistry>>({});

  // Cache legends per layer URL (or per id if you prefer)
  const legendCacheRef = useRef<Map<string, Styles[]>>(new Map());

  // Used to ignore stale async work (race conditions)
  const opIdRef = useRef(0);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [polygons, setPolygons] = useState<HazardPolygon[]>([]);
  const [legends, setLegends] = useState<Styles[]>([]);
  const [currentLayer, setCurrentLayer] = useState<Layers | undefined>();
  const [currentHeatmapLayer, setCurrentHeatmapLayer] = useState<MetricType | undefined>();
  const [mapView, setMapView] = useState<MapViewType>("default");
  const [currentViewPort, setCurrentViewPort] = useState<BBBox | null>(null);

  const registerMap = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const setCenter = useCallback((coords: LatLng, zoom = 14) => {
    mapRef.current?.flyTo([coords.lat, coords.lng], zoom, { animate: true });
  }, []);

  const removeAllLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers = featureLayersRef.current;
    for (const id of Object.keys(layers)) {
      // esri-leaflet FeatureLayer is a Leaflet layer -> remove directly
      try {
        map.removeLayer(layers[id]);
      } catch {
        // ignore if already removed
      }
      delete layers[id];
    }

    metaRef.current = {};
    // Keep legend cache (good for perf), but reset currently active legends
    setLegends([]);
    setCurrentLayer(undefined);
  }, []);

  const removeLayerById = useCallback((layerId: string) => {
    const map = mapRef.current;
    if (!map) return;

    const layer = featureLayersRef.current[layerId];
    if (!layer) return;

    map.removeLayer(layer);
    delete featureLayersRef.current[layerId];

    // remove metadata
    const removed = metaRef.current[layerId];
    delete metaRef.current[layerId];

    // remove legends of that group (only UI state)
    if (removed) {
      setLegends((prev) => prev.filter((l) => l.groupName !== removed.name));
    }
  }, []);

  const getLegendsFor = useCallback(async (layer: LayerRegistry) => {
    const cached = legendCacheRef.current.get(layer.url);
    if (cached) return cached;

    const extracted = await handleLegendExtraction(
      layer.url,
      layer.name,
      layer.whereClause,
    );
    legendCacheRef.current.set(layer.url, extracted);
    return extracted;
  }, []);

  const addLayer = useCallback(
    async (layerInfo: LayerRegistry) => {
      const map = mapRef.current;
      if (!map) throw new Error("Map not ready");

      // if already exists, do nothing
      if (featureLayersRef.current[layerInfo.id]) return;

      const layerLegends = await getLegendsFor(layerInfo);
      const { featureLayer } = await import("esri-leaflet");
      const L = await import("leaflet");

      const lyr: FeatureLayer = featureLayer({
        url: layerInfo.url,
        style: (feature) =>
          styleLayer(
            feature,
            layerLegends,
            layerInfo.propertyKey,
            layerInfo.labelKey,
          ),
        onEachFeature: (feature, Layer) =>
          stylePopupLayer(
            feature,
            layerInfo.propertyKey,
            layerInfo.labelKey,
            Layer,
          ),
        pointToLayer: (feature) => {
          const style = styleLayer(
            feature,
            layerLegends,
            layerInfo.propertyKey,
            layerInfo.labelKey,
          );
          if (
            feature.geometry.type === "Point" ||
            feature.geometry.type === "MultiPoint"
          ) {
            console.log(feature);
            // CircleMarker expects radius + path options
            const coords = {
              lat: (feature.geometry.coordinates[0] as number[])[1],
              lng: (feature.geometry.coordinates[0] as number[])[0],
            };
            return L.circleMarker(coords, {
              radius: 6,
              ...style,
            });
          }
        },
        minZoom: 10,
        simplifyFactor: 0.4,
        cacheLayers: true,
        ignoreRenderer: true,
        where: layerInfo.whereClause ?? "1=1",
      });

      lyr.addTo(map);
      featureLayersRef.current[layerInfo.id] = lyr;
      metaRef.current[layerInfo.id] = layerInfo;

      // update UI legends once per added layer
      setLegends((prev) => {
        // avoid duplicates if called twice
        const next = prev.filter((l) => l.groupName !== layerInfo.name);
        return next.concat(layerLegends);
      });
    },
    [getLegendsFor],
  );

  const refreshLayer = useCallback((layerId: string) => {
    const lyr = featureLayersRef.current[layerId];
    const lyrMeta = metaRef.current[layerId];
    if (!lyr || !lyrMeta) return;
    lyr.setWhere(lyrMeta?.whereClause ?? "1=1");
    lyr.refresh();
  }, []);

  const setHeatmapLayer = useCallback(
    (layerId?: MetricType) => {
      const map = mapRef.current;
      if (!map) {
        toast.error("Map is not Loaded yet.");
        return;
      }
      // Remove all other layers
      removeAllLayers();
      // Only one heatmap layer at a time, so no need to check for existing layers - just add if layerId provided
      setCurrentHeatmapLayer(layerId);
      setLegends(layerId ? HEATMAP_LEGENDS[layerId] : []);
    }
  , []);

  const setMapLayer = useCallback(
    async (layerId?: Layers) => {
      const map = mapRef.current;
      if (!map) {
        toast.error("Map is not Loaded yet.");
        return;
      }

      // bump op id to invalidate previous async calls
      const opId = ++opIdRef.current;

      removeAllLayers();
      if (!layerId) return;

      const bbBox = bboxFromMap(map);
      const auState = coordToAUStates(bbBox);

      if (auState.length === 0) {
        toast.error("Map out of supported area for this layer.");
        return;
      }

      const toastId = toast.loading("Loading map layer...");
      try {
        const layerData = getLayersForView(bbBox, layerId);

        // Set current layer early (UI), but everything else stays in refs
        setCurrentLayer(layerId);

        // Preload legends in parallel (cached)
        // If user switches layers quickly, opId check will discard stale work
        await Promise.all(layerData.map((l) => getLegendsFor(l)));

        if (opIdRef.current !== opId) return;

        // Add all layers (sequential add is fine; legend work already parallelized)
        for (const l of layerData) {
          if (opIdRef.current !== opId) return;
          await addLayer(l);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load map layer.");
      } finally {
        toast.dismiss(toastId);
      }
    },
    [addLayer, getLegendsFor, removeAllLayers],
  );

  // Moveend spatial filtering: stable handler, reads latest refs (no dependency reruns)
  const onMoveEnd = useEvent(() => {
    const map = mapRef.current;
    const active = currentLayer;
    if (!map) return;
    const bbBox = bboxFromMap(map);
    setCurrentViewPort(bbBox); // Update viewport state on moveend
    if(!active) return; // Heatmap doesn't use this flow, so skip if heatmap active
    const nextMeta = getLayersForView(bbBox, active);

    const nextIds = new Set(nextMeta.map((m) => m.id));
    const currentIds = new Set(Object.keys(featureLayersRef.current));

    // Add missing
    for (const m of nextMeta) {
      if (!currentIds.has(m.id)) {
        // fire-and-forget: addLayer is safe; it also dedupes.
        void addLayer(m);
      }
    }

    // Refresh kept
    for (const id of currentIds) {
      if (nextIds.has(id)) refreshLayer(id);
    }

    // Remove out-of-bounds
    for (const id of currentIds) {
      if (!nextIds.has(id)) {
        console.log(`Removing Layer ${id}`);
        removeLayerById(id);
      }
    }
  });

  // Debounced binding once
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const debounceMs = 250;
    let t: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => onMoveEnd(), debounceMs);
    };

    map.on("moveend", schedule);
    // optional: run once after bind
    schedule();

    return () => {
      map.off("moveend", schedule);
      if (t) clearTimeout(t);
    };
  }, [mapRef.current]);

  // Cleanup on unmount
  useEffect(() => removeAllLayers, [removeAllLayers]);

  const value = useMemo<MapContextType>(
    () => ({
      map: mapRef.current,
      viewport: currentViewPort,
      currentView: mapView,
      currentLayer,
      currentHeatmapLayer,
      setCenter,
      registerMap,
      setMapLayer,
      setHeatmapLayer,
      results,
      setResults,
      polygons,
      setPolygons,
      legends,
      setLegends,
      setMapView,
    }),
    [
      mapView,
      currentLayer,
      currentHeatmapLayer,
      currentViewPort,
      // setCenter,
      // registerMap,
      // setMapLayer,
      results,
      polygons,
      legends,
    ],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}
