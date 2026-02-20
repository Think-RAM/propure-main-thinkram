"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import dynamic from "next/dynamic";

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

// Define types for our map data
type PropertyData = {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: "house" | "apartment" | "townhouse";
  landSize?: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  listingType: "sale" | "rent";
  rentalYield?: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
  externalLink?: string;
};

type MapMarker = {
  id: string;
  position: { lat: number; lng: number };
  label: string;
  growthRate: number;
  suburb: string;
  properties: PropertyData[];
  metrics: {
    medianPrice: number;
    averageRentalYield: number;
    vacancyRate: number;
    averageDaysOnMarket: number;
    priceChangeYoY: number;
  };
};

// Sample data for Australian property markets
// In a real application, this would come from an API or database
const australiaMarkers: MapMarker[] = [
  {
    id: "sydney-1",
    position: { lat: -33.8688, lng: 151.2093 },
    label: "S",
    growthRate: 7.5,
    suburb: "Sydney CBD",
    metrics: {
      medianPrice: 1250000,
      averageRentalYield: 3.8,
      vacancyRate: 2.1,
      averageDaysOnMarket: 45,
      priceChangeYoY: 8.5,
    },
    properties: [
      {
        id: "syd-prop-1",
        address: "201/8 Darling Island Road, Pyrmont",
        price: 2978000, // Updated with median price from the area
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        landSize: 140, // 140sqm as mentioned in the listing
        description:
          "Timeless contemporary elegance defines this magnificent 140sqm waterfront apartment capturing breathtaking views in its premier north end position at The Revy, an elite residential complex in a blue-chip harbourside setting on Darling Island fronting Jones Bay. Enjoy tranquil bayside vistas and northerly harbour views with a captivating panorama of ferries, yachts and cruise ships.",
        listingType: "sale",
        externalLink:
          "https://www.domain.com.au/201-8-darling-island-road-pyrmont-nsw-2009-2019854368",
        imageUrl: "/placeholder.jpg", // Will update with actual images once provided
        images: [], // Will update with actual images once provided
      },
      {
        id: "syd-prop-2",
        address: "42 Market Street, Sydney",
        price: 1250000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        description: "Modern apartment in the heart of Sydney CBD",
        listingType: "sale",
        rentalYield: 4.2,
        imageUrl: "/placeholder.jpg",
      },
      {
        id: "syd-prop-3",
        address: "15 Pitt Street, Sydney",
        price: 850000,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "apartment",
        description: "Luxury one-bedroom apartment with harbor views",
        listingType: "sale",
        rentalYield: 4.5,
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "melbourne-1",
    position: { lat: -37.8136, lng: 144.9631 },
    label: "M",
    growthRate: 6.2,
    suburb: "Melbourne CBD",
    metrics: {
      medianPrice: 950000,
      averageRentalYield: 4.1,
      vacancyRate: 3.2,
      averageDaysOnMarket: 52,
      priceChangeYoY: 6.8,
    },
    properties: [
      {
        id: "mel-prop-1",
        address: "101 Collins Street, Melbourne",
        price: 950000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        description: "Premium CBD apartment with city views",
        listingType: "sale",
        rentalYield: 4.8,
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "brisbane-1",
    position: { lat: -27.4698, lng: 153.0251 },
    label: "B",
    growthRate: 8.3,
    suburb: "Brisbane CBD",
    metrics: {
      medianPrice: 750000,
      averageRentalYield: 4.8,
      vacancyRate: 1.8,
      averageDaysOnMarket: 38,
      priceChangeYoY: 9.2,
    },
    properties: [
      {
        id: "bris-prop-1",
        address: "222 Margaret Street, Brisbane",
        price: 850000,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        description:
          "Luxury riverside apartment with city views and resort facilities",
        listingType: "sale",
        rentalYield: 5.5,
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "perth-1",
    position: { lat: -31.9505, lng: 115.8605 },
    label: "P",
    growthRate: 4.8,
    suburb: "Perth CBD",
    metrics: {
      medianPrice: 600000,
      averageRentalYield: 3.5,
      vacancyRate: 2.5,
      averageDaysOnMarket: 60,
      priceChangeYoY: 4.2,
    },
    properties: [],
  },
  {
    id: "adelaide-1",
    position: { lat: -34.9285, lng: 138.6007 },
    label: "A",
    growthRate: 5.6,
    suburb: "Adelaide CBD",
    metrics: {
      medianPrice: 550000,
      averageRentalYield: 3.7,
      vacancyRate: 2.3,
      averageDaysOnMarket: 58,
      priceChangeYoY: 5.1,
    },
    properties: [],
  },
  {
    id: "hobart-1",
    position: { lat: -42.8821, lng: 147.3272 },
    label: "H",
    growthRate: 9.2,
    suburb: "Hobart CBD",
    metrics: {
      medianPrice: 450000,
      averageRentalYield: 4.2,
      vacancyRate: 1.9,
      averageDaysOnMarket: 40,
      priceChangeYoY: 10.3,
    },
    properties: [],
  },
  {
    id: "darwin-1",
    position: { lat: -12.4634, lng: 130.8456 },
    label: "D",
    growthRate: 3.7,
    suburb: "Darwin CBD",
    metrics: {
      medianPrice: 400000,
      averageRentalYield: 3.0,
      vacancyRate: 3.0,
      averageDaysOnMarket: 65,
      priceChangeYoY: 2.8,
    },
    properties: [],
  },
  {
    id: "canberra-1",
    position: { lat: -35.2809, lng: 149.13 },
    label: "C",
    growthRate: 5.9,
    suburb: "Canberra CBD",
    metrics: {
      medianPrice: 700000,
      averageRentalYield: 3.9,
      vacancyRate: 2.0,
      averageDaysOnMarket: 50,
      priceChangeYoY: 6.0,
    },
    properties: [],
  },
  // Sydney suburbs
  {
    id: "bondi-1",
    position: { lat: -33.8914, lng: 151.2766 },
    label: "B",
    growthRate: 8.7,
    suburb: "Bondi",
    metrics: {
      medianPrice: 2450000,
      averageRentalYield: 3.8,
      vacancyRate: 1.5,
      averageDaysOnMarket: 35,
      priceChangeYoY: 9.0,
    },
    properties: [
      {
        id: "bondi-prop-1",
        address: "24 Campbell Parade, Bondi Beach",
        price: 2450000,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        landSize: 120,
        description:
          "Beachfront apartment with stunning ocean views, recently renovated with high-end finishes",
        listingType: "sale",
        rentalYield: 3.8,
        imageUrl: "/placeholder.jpg",
        lastSoldPrice: 1850000,
        lastSoldDate: "2020-06-15",
      },
      {
        id: "bondi-prop-2",
        address: "15 Warners Avenue, Bondi",
        price: 1100,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        description: "Modern apartment minutes from the beach, fully furnished",
        listingType: "rent",
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "parramatta-1",
    position: { lat: -33.8148, lng: 151.0018 },
    label: "P",
    growthRate: 6.5,
    suburb: "Parramatta",
    metrics: {
      medianPrice: 750000,
      averageRentalYield: 5.2,
      vacancyRate: 2.2,
      averageDaysOnMarket: 48,
      priceChangeYoY: 6.5,
    },
    properties: [
      {
        id: "parra-prop-1",
        address: "7 Smith Street, Parramatta",
        price: 750000,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        description:
          "Modern apartment in the heart of Parramatta CBD, close to transport",
        listingType: "sale",
        rentalYield: 5.2,
        imageUrl: "/placeholder.jpg",
      },
      {
        id: "parra-prop-2",
        address: "180 George Street, Parramatta",
        price: 1250000,
        bedrooms: 4,
        bathrooms: 2,
        propertyType: "house",
        landSize: 450,
        description: "Spacious family home with modern amenities and backyard",
        listingType: "sale",
        rentalYield: 4.1,
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  // Melbourne suburbs
  {
    id: "st-kilda-1",
    position: { lat: -37.8671, lng: 144.981 },
    label: "SK",
    growthRate: 7.1,
    suburb: "St Kilda",
    metrics: {
      medianPrice: 695000,
      averageRentalYield: 4.9,
      vacancyRate: 2.0,
      averageDaysOnMarket: 42,
      priceChangeYoY: 7.1,
    },
    properties: [
      {
        id: "sk-prop-1",
        address: "52 Acland Street, St Kilda",
        price: 695000,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        description: "Charming art deco apartment near the beach and cafes",
        listingType: "sale",
        rentalYield: 4.9,
        imageUrl: "/placeholder.jpg",
      },
      {
        id: "sk-prop-2",
        address: "15 Grey Street, St Kilda",
        price: 550,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "apartment",
        description: "Stylish furnished apartment in the heart of St Kilda",
        listingType: "rent",
        imageUrl: "/placeholder.jpg",
      },
    ],
  },
  {
    id: "footscray-1",
    position: { lat: -37.801, lng: 144.9007 },
    label: "F",
    growthRate: 9.4,
    suburb: "Footscray",
    metrics: {
      medianPrice: 500000,
      averageRentalYield: 4.5,
      vacancyRate: 2.5,
      averageDaysOnMarket: 50,
      priceChangeYoY: 9.4,
    },
    properties: [],
  },
];

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const AUSTRALIA_CENTER: [number, number] = [-25.2744, 133.7751];

// Helper function to get marker color based on growth rate
const getMarkerColor = (growthRate: number): string => {
  if (growthRate < 3) return "#E9ECEF"; // Low growth
  if (growthRate < 5) return "#A8DADC"; // Below average
  if (growthRate < 7) return "#4FD1C5"; // Average
  if (growthRate < 9) return "#F4A261"; // Above average
  return "#FF6F61"; // High growth
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function AustraliaMap({
  selectedCity = "All",
}: {
  selectedCity?: string;
}) {
  const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(
    null,
  );
  const mapRef = useRef<L.Map | null>(null);

  /* -------------------------------------------------------------- */
  /* Filter markers                                                  */
  /* -------------------------------------------------------------- */
  const filteredMarkers = useMemo(() => {
    if (selectedCity === "All") return australiaMarkers;
    return australiaMarkers.filter((m) =>
      m.suburb.toLowerCase().includes(selectedCity.toLowerCase()),
    );
  }, [selectedCity]);

  /* ------------------------------------------------------------------ */
  /* Custom Leaflet icon (Canvas-friendly)                               */
  /* ------------------------------------------------------------------ */
  const createIcon = (color: string) => {
    if (!L) return undefined;
    return L.divIcon({
      className: "",
      html: `<div style="
      width:18px;
      height:18px;
      border-radius:50%;
      background:${color};
      border:2px solid #fff;
    "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  /* -------------------------------------------------------------- */
  /* Fit bounds on filter change                                     */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (filteredMarkers.length === 0 || !mapRef.current || !L) return;
    if (selectedCity !== "All") {
      const bounds = L.latLngBounds(
        filteredMarkers.map((m) => [m.position.lat, m.position.lng]),
      );
      mapRef.current.fitBounds(bounds, { maxZoom: 10 });
    } else {
      mapRef.current.setView(AUSTRALIA_CENTER, 4);
    }
  }, [filteredMarkers, selectedCity]);

  useEffect(() => {
    let mounted = true;

    import("leaflet").then((L) => {
      if (mounted) setLeaflet(L);
    });

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------------- */
  /* Render                                                         */
  /* -------------------------------------------------------------- */
  if (!L) return null;

  return (
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden h-full">
      <MapContainer
        center={AUSTRALIA_CENTER}
        zoom={4}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        renderer={L.canvas()}
        preferCanvas
        ref={mapRef}
      >
        {/* Dark Theme Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap © CARTO"
        />

        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={createIcon(getMarkerColor(marker.growthRate))}
            eventHandlers={{
              click: () => setSelectedMarker(marker),
            }}
          />
        ))}

        {selectedMarker && (
          <Popup
            position={[
              selectedMarker.position.lat,
              selectedMarker.position.lng,
            ]}
            closeButton
            autoPan
            eventHandlers={{
              remove: () => setSelectedMarker(null),
            }}
          >
            <div className="p-3 max-w-[360px]">
              <h3 className="font-bold text-lg mb-3">
                {selectedMarker.suburb}
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  Median: ${selectedMarker.metrics.medianPrice.toLocaleString()}
                </div>
                <div>Yield: {selectedMarker.metrics.averageRentalYield}%</div>
                <div>YoY: +{selectedMarker.metrics.priceChangeYoY}%</div>
                <div>Vacancy: {selectedMarker.metrics.vacancyRate}%</div>
              </div>

              {selectedMarker.properties.length > 0 && (
                <div className="space-y-2">
                  {selectedMarker.properties.map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-md bg-slate-800/50 p-2 hover:bg-slate-700"
                      onClick={() => setSelectedProperty(p)}
                    >
                      <div className="text-sm font-medium">{p.address}</div>
                      <div className="text-xs text-gray-400">
                        ${p.price.toLocaleString()} · {p.bedrooms} bed
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        )}

        {/* Property Dialog */}
        <Dialog
          open={!!selectedProperty}
          onOpenChange={() => setSelectedProperty(null)}
        >
          <DialogContent className="max-w-2xl">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedProperty.address}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={
                        selectedProperty.images?.[0] ??
                        selectedProperty.imageUrl ??
                        "/placeholder.jpg"
                      }
                      alt={selectedProperty.address}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="text-2xl font-semibold">
                      ${selectedProperty.price.toLocaleString()}
                    </div>

                    <p className="text-sm text-gray-500">
                      {selectedProperty.description}
                    </p>

                    {selectedProperty.externalLink && (
                      <a
                        href={selectedProperty.externalLink}
                        target="_blank"
                        className="block text-center bg-cyan-600 text-white py-2 rounded-md"
                      >
                        View Listing
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </MapContainer>
    </div>
  );
}
