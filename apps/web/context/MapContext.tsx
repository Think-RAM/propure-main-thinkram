"use client"

import { createContext, useContext, useState, useRef, useCallback } from "react"

type LatLng = {
  lat: number
  lng: number
}

type SearchResult = {
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
  setCenter: (coords: LatLng) => void
  registerMap: (map: google.maps.Map) => void
  results: SearchResult[]
  setResults: (results: SearchResult[]) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapRef = useRef<{ setCenter: (coords: LatLng) => void; setZoom: (zoom: number) => void } | null>(null);
  const [results, setResults] = useState<SearchResult[]>([])

  const registerMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const setCenter = useCallback((coords: LatLng) => {
    if (mapRef.current) {
      mapRef.current.setCenter(coords)
      mapRef.current.setZoom(14)
    }
  }, [])

  return (
    <MapContext.Provider value={{ setCenter, registerMap, results, setResults }}>
      {children}
    </MapContext.Provider>
  )
}

export const useMap = () => {
  const context = useContext(MapContext)
  if (!context) throw new Error("useMap must be used within MapProvider")
  return context
}
