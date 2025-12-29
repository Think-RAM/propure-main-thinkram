"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  InfoWindow,
  Marker,
} from "@react-google-maps/api";
import { Libraries } from "@react-google-maps/api/dist/utils/make-load-script-url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

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

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Center the map on Australia
const center = {
  lat: -25.2744, // Australia's approximate center latitude
  lng: 133.7751, // Australia's approximate center longitude
};

// Map options
const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  styles: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#B3E0FF" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#F8F9FA" }],
    },
  ],
};

// Helper function to get marker color based on growth rate
const getMarkerColor = (growthRate: number): string => {
  if (growthRate < 3) return "#E9ECEF"; // Low growth
  if (growthRate < 5) return "#A8DADC"; // Below average
  if (growthRate < 7) return "#4FD1C5"; // Average
  if (growthRate < 9) return "#F4A261"; // Above average
  return "#FF6F61"; // High growth
};

// Define required libraries
const libraries: Libraries = ["places", "visualization"];

export default function AustraliaMap({
  selectedCity = "All",
}: {
  selectedCity?: string;
}) {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // State for the selected marker
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  // Reference to the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // State for selected property
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(
    null
  );

  // Filter markers based on the selected city or region
  const filteredMarkers = (() => {
    if (selectedCity === "All") {
      return australiaMarkers;
    } else if (selectedCity === "Sydney") {
      return australiaMarkers.filter(
        (marker) =>
          marker.suburb.includes("Sydney") ||
          marker.suburb === "Bondi" ||
          marker.suburb === "Parramatta"
      );
    } else if (selectedCity === "Melbourne") {
      return australiaMarkers.filter(
        (marker) =>
          marker.suburb.includes("Melbourne") ||
          marker.suburb === "St Kilda" ||
          marker.suburb === "Footscray"
      );
    } else if (selectedCity === "Brisbane") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Brisbane")
      );
    } else if (selectedCity === "Perth") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Perth")
      );
    } else if (selectedCity === "Adelaide") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Adelaide")
      );
    } else if (selectedCity === "Hobart") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Hobart")
      );
    } else if (selectedCity === "Darwin") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Darwin")
      );
    } else if (selectedCity === "Canberra") {
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes("Canberra")
      );
    } else {
      // If selectedCity is a specific suburb name
      return australiaMarkers.filter((marker) =>
        marker.suburb.includes(selectedCity)
      );
    }
  })();

  // Dynamically adjust map center and zoom based on filtered markers
  useEffect(() => {
    if (map && filteredMarkers.length > 0) {
      // If filtering to a specific city/region, zoom in to that area
      if (selectedCity !== "All" && filteredMarkers.length > 0) {
        // Create bounds object
        const bounds = new google.maps.LatLngBounds();

        // Add each marker to bounds
        filteredMarkers.forEach((marker) => {
          bounds.extend(marker.position);
        });

        // Fit the map to the bounds
        map.fitBounds(bounds);

        // Set a minimum zoom level to prevent excessive zoom on single markers
        const listener = google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom()! > 10) {
            map.setZoom(10);
          }
          google.maps.event.removeListener(listener);
        });
      } else {
        // Reset to Australia-wide view
        map.setCenter(center);
        map.setZoom(4);
      }
    }
  }, [map, filteredMarkers, selectedCity]);

  // Handle marker click
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Render loading state
  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
    return (
      <div className="text-center p-12">
        Error loading maps. Please check your API key configuration.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-primary">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={4}
        options={options}
        onLoad={setMap}
      >
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: getMarkerColor(marker.growthRate),
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: "#FFFFFF",
            }}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-3 max-w-[400px]">
              <h3 className="font-bold text-[#0B3C5D] text-lg mb-3">
                {selectedMarker.suburb}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Median Price</div>
                  <div className="font-semibold">
                    ${selectedMarker.metrics.medianPrice.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Rental Yield</div>
                  <div className="font-semibold">
                    {selectedMarker.metrics.averageRentalYield}%
                  </div>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">
                    Price Change (YoY)
                  </div>
                  <div className="font-semibold text-orange-600">
                    +{selectedMarker.metrics.priceChangeYoY}%
                  </div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Growth Prediction</div>
                  <div
                    className="font-semibold"
                    style={{ color: getMarkerColor(selectedMarker.growthRate) }}
                  >
                    {selectedMarker.growthRate}%
                  </div>
                </div>
                <div className="bg-red-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">Vacancy Rate</div>
                  <div className="font-semibold">
                    {selectedMarker.metrics.vacancyRate}%
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-600">
                    Avg. Days on Market
                  </div>
                  <div className="font-semibold">
                    {selectedMarker.metrics.averageDaysOnMarket} days
                  </div>
                </div>
              </div>

              {selectedMarker.properties.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-sm mb-2">
                    Available Properties:
                  </h4>
                  <div className="space-y-2">
                    {selectedMarker.properties.map((property) => (
                      <div
                        key={property.id}
                        className="bg-white p-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <div className="text-sm font-medium">
                          {property.address}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>${property.price.toLocaleString()}</span>
                          <span>
                            {property.bedrooms}bed {property.bathrooms}bath
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Property Details Dialog */}
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
                  <div className="space-y-2">
                    {selectedProperty.images ? (
                      <>
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={selectedProperty.images[0]}
                            alt={`${selectedProperty.address} - Main Image`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedProperty.images
                            .slice(1, 4)
                            .map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={image}
                                  alt={`${selectedProperty.address} - Image ${
                                    index + 2
                                  }`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      </>
                    ) : selectedProperty.imageUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={selectedProperty.imageUrl}
                          alt={selectedProperty.address}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-2xl">
                        ${selectedProperty.price.toLocaleString()}
                      </h3>
                      <p className="text-gray-600">
                        {selectedProperty.propertyType.charAt(0).toUpperCase() +
                          selectedProperty.propertyType.slice(1)}{" "}
                        for {selectedProperty.listingType}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                        <div className="font-semibold">
                          {selectedProperty.bedrooms}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                        <div className="font-semibold">
                          {selectedProperty.bathrooms}
                        </div>
                      </div>
                      {selectedProperty.landSize && (
                        <div>
                          <div className="text-sm text-gray-600">Land Size</div>
                          <div className="font-semibold">
                            {selectedProperty.landSize}m²
                          </div>
                        </div>
                      )}
                      {selectedProperty.rentalYield && (
                        <div>
                          <div className="text-sm text-gray-600">
                            Rental Yield
                          </div>
                          <div className="font-semibold">
                            {selectedProperty.rentalYield}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-sm text-gray-600">
                        {selectedProperty.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {selectedProperty.externalLink && (
                        <a
                          href={selectedProperty.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                          View on Domain.com.au
                        </a>
                      )}

                      <button
                        className="w-full bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white py-2 px-4 rounded-md transition-colors"
                        onClick={() => setSelectedProperty(null)}
                      >
                        Request More Information
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </GoogleMap>
    </div>
  );
}
