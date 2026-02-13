"use client";
import { useState, memo, useRef, useEffect } from "react";
import { MAP_VIEW_URLS, useMap as useMapContext } from "@/context/MapContext";
import dynamic from "next/dynamic";
import { MapLayersPopover } from "./MapLayersPopover";
import { LegendGroupCollapsible } from "./CollapsableLegendList";
import { PropertyPreviewCard } from "./propertyPopover";
import { MAP_MARKER_ICON } from "@/types/types";
import { HeatmapLayer } from "./HeatmapLayer";

/**
 * React-Leaflet components MUST be client-only
 */
export const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);

export const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);

export const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);

export const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);

export const Polygon = dynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false },
);

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
  const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const { results, registerMap, polygons, legends, currentView, setResults } =
    useMapContext();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [registered, setRegistered] = useState(false);

  const onMapReady = () => {
    if (!registered) {
      setRegistered(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    import("leaflet").then((L) => {
      if (mounted) setLeaflet(L);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (registered && mapRef.current) {
      console.log("Map Registered");
      registerMap(mapRef.current);
      // setPolygons(DEMO_HAZARD_POLYGONS);
      // setLegends(DEMO_HAZARD_LEGEND);
      setResults([
        {
          title: "4 Cherry Court, Norman Gardens, QLD 4701",
          description: "3 Bed | 2 Bath | 1 Car",
          lat: -23.310021,
          lng: 150.528786,
          yield: "5.2%",
          gradientFrom: "from-emerald-500/15",
          gradientTo: "to-emerald-500/0",
          yieldColor: "text-emerald-700",
        },
        {
          title: "19 Hall St, Wandal QLD 4700",
          description: "4 Bed | 2 Bath | 2 Car",
          lat: -23.363898,
          lng: 150.50107,
          yield: "4.8%",
          gradientFrom: "from-cyan-500/15",
          gradientTo: "to-cyan-500/0",
          yieldColor: "text-cyan-700",
        },
      ]);
    }
  }, [registered]);

  if (!L) return null;

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
          attribution={MAP_VIEW_URLS[currentView].attribution}
          url={MAP_VIEW_URLS[currentView].url}
        />

        {results.map((property, index) => (
          <Marker
            key={index}
            position={[property.lat, property.lng]}
            eventHandlers={{
              click: () => setSelectedIndex(index),
            }}
            icon={L.divIcon({
              className: "custom-marker-icon",
              html: MAP_MARKER_ICON,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            {selectedIndex === index && (
              <Popup closeButton={false} autoPan maxWidth={800}>
                <PropertyPreviewCard property={property} />
              </Popup>
            )}
          </Marker>
        ))}

        {polygons.map((p) => (
          <Polygon key={p.id} positions={p.coordinates} pathOptions={p.style} />
        ))}
        <HeatmapLayer />
      </MapContainer>
      {legends.length > 0 && (
        <div className="absolute z-[1000] bottom-6 right-1 p-3 bg-white/90 rounded text-sm shadow-lg">
          <div className="space-y-2 max-h-64 min-w-28 overflow-y-auto">
            {legends
              .reduce(
                (acc, l) => {
                  const group = acc.find((g) => g.group === l.groupName);
                  if (group) {
                    group.items.push(l);
                  } else {
                    acc.push({ group: l.groupName, items: [l] });
                  }
                  return acc;
                },
                [] as Array<{ group: string; items: typeof legends }>,
              )
              .map((g) => (
                <LegendGroupCollapsible group={g} key={g.group} />
              ))}
          </div>
        </div>
      )}
      <div className="absolute z-[1000] top-12 right-4 p-3 rounded text-sm shadow-lg">
        <MapLayersPopover />
      </div>
    </div>
  );
}

export const LeafletMap = memo(LeafletMapComponent);
