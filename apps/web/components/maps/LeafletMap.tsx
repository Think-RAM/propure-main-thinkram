"use client";
import { useState, memo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMap as useMapContext } from "@/context/MapContext";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";

import L from "leaflet";
import { DEMO_HAZARD_LEGEND, DEMO_HAZARD_POLYGONS } from "@/lib/hazardZones";

/* -------------------------------------------------- */
/* Constants                                          */
/* -------------------------------------------------- */
const AUSTRALIA_CENTER: [number, number] = [-25.2744, 133.7751];

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */
interface LeafletMapProps {
  className?: string;
  isBlurred?: boolean;
}

function LeafletMapComponent({ className, isBlurred }: LeafletMapProps) {
  const { results, registerMap, polygons, legends, setPolygons, setLegends } =
    useMapContext();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const onMapReady = () => {
    if (!registered) {
      setRegistered(true);
    }
  };

  useEffect(() => {
    if (registered && mapRef.current) {
      console.log("Map Registered");
      registerMap(mapRef.current);
      console.log(`Demo Hazard Data: `, DEMO_HAZARD_POLYGONS);
      console.log(`Demo Legends: `, DEMO_HAZARD_LEGEND);
      setPolygons(DEMO_HAZARD_POLYGONS);
      setLegends(DEMO_HAZARD_LEGEND);
    }
  }, [registered]);

  return (
    <div
      className={`${className} transition-all duration-700 ${
        isBlurred ? "blur-sm" : "blur-0"
      }`}
    >
      <MapContainer
        center={AUSTRALIA_CENTER}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
        renderer={L.canvas()}
        preferCanvas={true}
        ref={mapRef}
        whenReady={onMapReady}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {results.map((property, index) => (
          <Marker
            key={index}
            position={[property.lat, property.lng]}
            eventHandlers={{
              click: () => setSelectedIndex(index),
            }}
          >
            {selectedIndex === index && (
              <Popup closeButton autoPan>
                <div className="p-3 w-64">
                  <h4 className="font-semibold text-gray-800">
                    {property.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.description}
                  </p>
                  <span
                    className={`text-sm font-medium mt-2 inline-block ${property.yieldColor}`}
                  >
                    {property.yield}
                  </span>

                  <button
                    onClick={() =>
                      router.push(
                        `/details?id=${encodeURIComponent(
                          property.title.toLowerCase().split(" ").join("-")
                        )}`
                      )
                    }
                    className="mt-3 text-sm text-cyan-700 hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {polygons.map((p) => (
          <Polygon key={p.id} positions={p.coordinates} pathOptions={p.style} />
        ))}
      </MapContainer>
      <div className="absolute z-[1000] bottom-6 right-1 bg-white p-3 rounded text-sm shadow-lg">
        {legends.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const LeafletMap = memo(LeafletMapComponent);
