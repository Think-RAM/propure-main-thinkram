"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@propure/convex";
import { api } from "@propure/convex/genereated";
import { HEATMAP_GRADIENTS, HEATMAP_CONFIG } from "@/lib/map/heatmap-config";
import { useMap } from "@/context/MapContext";
import L from "leaflet";
import "leaflet.heat"; // Ensure the heat plugin is imported and extends L


export function HeatmapLayer() {
  const { map, currentHeatmapLayer, viewport } = useMap();
  // const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const heatLayerRef = useRef<any | null>(null);

  // 🔥 Dynamically load leaflet + heat plugin
  // useEffect(() => {
  //   let mounted = true;

  //   async function loadLeaflet() {
  //     const L = await import("leaflet");
  //     const heat = await import("leaflet.heat"); // attaches itself to L

  //     console.log(heat)

  //     if (mounted) {
  //       setLeaflet({ ...L, ...heat }); // Ensure both L and heat are available in state
  //     }
  //   }

  //   loadLeaflet();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);
  const queryParams = useMemo(
    () => ({
      metricType: currentHeatmapLayer,
      bounds: viewport ?? undefined,
      limit: 500,
    }),
    [currentHeatmapLayer, viewport],
  );

  const metricsData = useQuery(
    api.functions.suburbMetrics.getSuburbMetricsByType,
    queryParams,
  );

  useEffect(() => {
    console.log("Heatmap Query Params:", queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (!map || !currentHeatmapLayer || !metricsData) {
      if (heatLayerRef.current) {
        map!.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }
    console.log("Metrics Data", metricsData);
    const heatPoints = metricsData.map(
      (m) =>
        [m.latitude, m.longitude, m.value / 100] as [number, number, number],
    );

    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);

    heatLayerRef.current = L.heatLayer(heatPoints, {
      ...HEATMAP_CONFIG,
      gradient: HEATMAP_GRADIENTS[currentHeatmapLayer],
    }).addTo(map);

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [metricsData, currentHeatmapLayer]);

  return null;
}
