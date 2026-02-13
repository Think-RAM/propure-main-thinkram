'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useQuery } from '@propure/convex'
import { api } from '@propure/convex/genereated'
import { HEATMAP_GRADIENTS, HEATMAP_CONFIG } from '@/lib/map/heatmap-config'
import { useMap } from '@/context/MapContext'
import { BBBox } from '@/lib/map/layers'

export function HeatmapLayer() {
  const { map, currentHeatmapLayer, viewport } = useMap()
  const heatLayerRef = useRef<L.HeatLayer | null>(null)
  
  const metricsData = useQuery(api.functions.suburbMetrics.getSuburbMetricsByType, {
    metricType: currentHeatmapLayer,
    bounds: viewport ?? undefined,
    limit: 500
  })
  
  useEffect(() => {
    if (!map || !currentHeatmapLayer || !metricsData) {
      if (heatLayerRef.current) {
        map!.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
      return
    }
    
    const heatPoints = metricsData.map(m => [
      m.latitude,
      m.longitude,
      m.value / 100
    ]as [number, number, number])
    
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)
    
    heatLayerRef.current = L.heatLayer(heatPoints, {
      ...HEATMAP_CONFIG,
      gradient: HEATMAP_GRADIENTS[currentHeatmapLayer]
    }).addTo(map)
    
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [map, metricsData, currentHeatmapLayer])
  
  return null
}