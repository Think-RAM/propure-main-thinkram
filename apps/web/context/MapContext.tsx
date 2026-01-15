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
import {
  handleLegendExtraction,
  styleLayer,
  stylePopupLayer,
} from "@/lib/map/styles";
import { toast } from "sonner";
import {
  BBBox,
  getLayersForView,
  LayerRegistry,
  Layers,
  Styles,
} from "@/lib/map/layers";
import { coordToAUStates } from "@/lib/utils";

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

// export const MAP_LABELS_OVERLAY =
//   "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<Record<string, FeatureLayer> | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [polygons, setPolygons] = useState<HazardPolygon[]>([]);
  const [legends, setLegends] = useState<Styles[]>([]);
  const [currentLayer, setCurrentLayer] = useState<Layers | undefined>();
  const [mapView, setMapView] = useState<MapViewType>("default");
  const [layersMetadata, setLayersMetadata] = useState<LayerRegistry[]>([]);

  const removeMapLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !layerRef.current) return;

    map.eachLayer((layer) => {
      console.log("Removing", (layer.options as any)?.url);
      Object.values(layerRef.current!).forEach((featureLayer) => {
        if (
          (layer.options as any)?.url === (featureLayer.options as any)?.url
        ) {
          map.removeLayer(layer);
        }
      });
    });

    layerRef.current = null;
    setCurrentLayer(undefined);
    setLegends([]);
    setLayersMetadata([]);
    console.log("All map layers removed.");
  }, []);

  const removeMapLayer = useCallback((layerId: string) => {
    const map = mapRef.current;
    if (layerRef.current && map) {
      const layer = layerRef.current[layerId];
      if (layer) {
        map.eachLayer((l) => {
          console.log("Removing", (layer.options as any)?.url);
          if ((l.options as any)?.url === (layer.options as any)?.url) {
            map.removeLayer(l);
          }
        });
        delete layerRef.current[layerId];
        const layerName = layersMetadata.find(l => l.id === layerId)?.name;
        console.log(`Removing Legends for ${layerName} & ${layerId}`)
        console.log(layersMetadata)
        setLayersMetadata((prev) =>
          prev.filter((layer) => layer.id !== layerId)
        );
        setLegends((prev) =>
          prev.filter((legend) => legend.groupName !== layerName)
        );
        console.log(`Map layer ${layerId} removed.`);
      }
    }
  }, [layersMetadata, currentLayer]);

  const addMapLayer = useCallback(async (layer: LayerRegistry) => {
    const map = mapRef.current;
    if (!map) {
      toast.error("Map is not Loaded yet.");
      return;
    }
    const toastId = toast.loading("Loading layer data...");
    try {
      const legends = await handleLegendExtraction(layer.url, layer.name);
      const featureLyr: FeatureLayer = featureLayer({
        url: layer.url,
        style: (feature) =>
          styleLayer(feature, legends, layer.propertyKey, layer.labelKey),
        onEachFeature: (feature, Layer) =>
          stylePopupLayer(feature, layer.propertyKey, layer.labelKey, Layer),
        minZoom: 10,
        simplifyFactor: 0.4,
        cacheLayers: true,
        ignoreRenderer: true,
      });
      featureLyr.addTo(map);
      layerRef.current = {
        ...layerRef.current,
        [layer.id]: featureLyr,
      };
      setLayersMetadata((prev) => [...prev, layer]);
      setLegends((prev) => [...prev, ...legends]);
      console.log(`Map Layer ${layer.id} added.`);
    } catch (error) {
      console.error("Error adding map layer:", error);
      toast.error("Failed to load map layer.");
    } finally {
      toast.dismiss(toastId);
    }
  }, [layersMetadata, currentLayer]);

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
      removeMapLayers();
    }
    if (!layerId) {
      return; // if no layerId provided, just remove existing layer
    }
    const mapBounds = mapRef.current.getBounds();
    const bbBox: BBBox = {
      minLat: mapBounds.getSouth(),
      minLng: mapBounds.getWest(),
      maxLat: mapBounds.getNorth(),
      maxLng: mapBounds.getEast(),
    };
    const auState = coordToAUStates(bbBox);
    console.log(`Setting Layer ${layerId} for State ${auState}`);
    if (auState.length === 0) {
      toast.error("Map out of supported area for this layer.");
      return;
    }
    const toastId = toast.loading("Loading map layer...");
    try {
      // const layerData = stateLayerMapping[auState][layerId];
      const layerData = getLayersForView(bbBox, layerId);
      setCurrentLayer(layerId);
      setLayersMetadata(layerData);
      const layersRecord: Record<string, FeatureLayer> = {};
      const legendData = (
        await Promise.all(
          layerData.map((l) => handleLegendExtraction(l.url, l.name))
        )
      ).reduce((acc, val) => acc.concat(val), []);
      layerData.map((layerInfo) => {
        const legends = legendData.filter(
          (l) => l.groupName === layerInfo.name
        );
        const layer: FeatureLayer = featureLayer({
          url: layerInfo.url,
          style: (feature) =>
            styleLayer(
              feature,
              legends,
              layerInfo.propertyKey,
              layerInfo.labelKey
            ),
          onEachFeature: (feature, Layer) =>
            stylePopupLayer(
              feature,
              layerInfo.propertyKey,
              layerInfo.labelKey,
              Layer
            ),
          minZoom: 10,
          simplifyFactor: 0.4,
          cacheLayers: true,
          ignoreRenderer: true,
        });
        layer.addTo(mapRef.current!);
        layersRecord[layerInfo.id] = layer;
      });
      layerRef.current = layersRecord;
      setLegends(legendData);
      console.log(`Map Layer set to: ${layerId}`);
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
      removeMapLayers();
    };
  }, []);

  // 2️⃣ Spatially filter on moveend
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !currentLayer) return;

    const debounceMs = 250; // tweak
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const updateSpatialFilter = () => {
      console.log("Updated Query");
      const mapBounds = mapRef.current!.getBounds();
      const bbBox: BBBox = {
        minLat: mapBounds.getSouth(),
        minLng: mapBounds.getWest(),
        maxLat: mapBounds.getNorth(),
        maxLng: mapBounds.getEast(),
      };
      const layerData = getLayersForView(bbBox, currentLayer);
      const layersToKeep = layersMetadata.filter((l) =>
        layerData.some((ld) => ld.id === l.id)
      );
      const layersToAdd = layerData.filter(
        (ld) => !layersMetadata.some((l) => l.id === ld.id)
      );
      // Add new layers that are in bounds
      layersToAdd.forEach((layer) => {
        addMapLayer(layer);
      });

      // Update existing layers Query
      layersToKeep.forEach((layer) => {
        const featureLyr = layerRef.current![layer.id];
        if (featureLyr) {
          // featureLyr.query().bboxIntersects(mapBounds).where("1=1"); // keep attribute filters here
          featureLyr.setWhere("1=1"); // keep attribute filters here
          featureLyr.refresh();
        }
      });

      // Remove layers that are out of bounds
      Object.keys(layerRef.current!).forEach((layerId) => {
        if (!layersToKeep.some((l) => l.id === layerId)) {
          console.log(`Removing layer ${layerId} as out of bounds`);
          removeMapLayer(layerId);
        }
      });
    };

    const scheduleUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSpatialFilter, debounceMs);
    };

    map.on("moveend", scheduleUpdate);
    scheduleUpdate();

    return () => {
      map.off("moveend", scheduleUpdate);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [layerRef.current, currentLayer, layersMetadata]);

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
