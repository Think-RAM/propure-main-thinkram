"use client";

import { useEffect, useRef, useState } from "react";
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
      const L = await import("leaflet");
      await import("leaflet.heat"); // attaches itself to L

      if (mounted) {
        setLeaflet(L);
      }
    }

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  const metricsData = useQuery(
    api.functions.suburbMetrics.getSuburbMetricsByType,
    {
      metricType: currentHeatmapLayer,
      bounds: viewport ?? undefined,
      limit: 500,
    },
  );

  useEffect(() => {
    if (!map || !currentHeatmapLayer || !metricsData|| !L) {
      if (heatLayerRef.current) {
        map!.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

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
  }, [map, metricsData, currentHeatmapLayer]);

  return null;
}
