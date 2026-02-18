"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@propure/convex";
import { api } from "@propure/convex/genereated";
import { HEATMAP_GRADIENTS, HEATMAP_CONFIG } from "@/lib/map/heatmap-config";
import { useMap } from "@/context/MapContext";


export function HeatmapLayer() {
  const { map, currentHeatmapLayer, viewport } = useMap();
  const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const heatLayerRef = useRef<any | null>(null);

  // 🔥 Dynamically load leaflet + heat plugin
  useEffect(() => {
    let mounted = true;

    async function loadLeaflet() {
      const leaflet = await import("leaflet");

      // Important: attach to window so leaflet.heat patches same instance
      (window as any).L = leaflet;

      await import("leaflet.heat");

      if (mounted) {
        setLeaflet(leaflet);
      }
    }

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);
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
    if (!map || !L || !currentHeatmapLayer || !metricsData) {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }
    console.log("Metrics Data", metricsData);
    const heatPoints = metricsData.map(
      (m) =>
        [m.latitude, m.longitude, m.value / 100] as [number, number, number],
    );

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = (L as any)
      .heatLayer(heatPoints, {
        ...HEATMAP_CONFIG,
        gradient: HEATMAP_GRADIENTS[currentHeatmapLayer],
      })
      .addTo(map);

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, L, metricsData, currentHeatmapLayer]);

  return null;
}
