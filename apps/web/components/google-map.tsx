"use client";

import {
  GoogleMap as GoogleMapComponent,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState } from "react";
import { useMap } from "@/context/MapContext";
import { useRouter } from "next/navigation";

interface GoogleMapProps {
  className?: string;
  isBlurred?: boolean;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: -25.2744, // Australia's approximate center latitude
  lng: 133.7751, // Australia's approximate center longitude
};

export function GoogleMap({ className, isBlurred }: GoogleMapProps) {
  const { registerMap, results } = useMap();
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div
      className={`${className} transition-all duration-700 ${
        isBlurred ? "blur-sm" : "blur-0"
      }`}
    >
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={6}
        options={{
          mapId: "real-estate-map",
          fullscreenControl: false,
          colorScheme: google.maps.ColorScheme.DARK,
          mapTypeControl: false,
        }}
        onLoad={(map) => registerMap(map)}
      >
        {results.map((property, index) => (
          <Marker
            key={index}
            position={{ lat: property.lat, lng: property.lng }}
            title={property.title}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              fillColor: "#06b6d4",
              fillOpacity: 1,
              strokeColor: "#0e7490",
              strokeWeight: 2,
              scale: 5,
            }}
            onClick={() => setSelectedMarker(index)}
          />
        ))}

        {selectedMarker !== null && (
          <InfoWindow
            position={{
              lat: results[selectedMarker].lat,
              lng: results[selectedMarker].lng,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-4 rounded-lg shadow-md bg-white border border-cyan-200 w-64">
              <h4 className="text-base font-semibold text-gray-800">
                {results[selectedMarker].title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {results[selectedMarker].description}
              </p>
              <span
                className={`text-sm font-medium mt-2 inline-block ${results[selectedMarker].yieldColor}`}
              >
                {results[selectedMarker].yield}
              </span>
              <br />

              {/* Button to go to details page */}
              <button
                onClick={() =>
                  router.push(`/details?id=${encodeURIComponent(results[selectedMarker].title.toLowerCase().split(" ").join("-"))}`)
                }
                className="mt-4 text-sm font-medium text-cyan-700 hover:underline"
              >
                View Details →
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMapComponent>
    </div>
  );
}
