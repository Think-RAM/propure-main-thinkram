import React, { useRef } from "react";
import { cn } from "@/lib/utils"; // or use classnames lib if you don't use this
import { Badge } from "@/components/ui/badge"; // assuming you're using shadcn/ui or similar
import { useMap } from "@/context/MapContext";

type CityFilterPillsProps = {
  selected: string;
  onSelect: (key: string) => void;
};

const cityGroups = {
  All: "All Locations",
  Sydney: "Sydney Region",
  Melbourne: "Melbourne Region",
  Brisbane: "Brisbane",
  Perth: "Perth",
  Adelaide: "Adelaide",
  Hobart: "Hobart",
  Darwin: "Darwin",
  Canberra: "Canberra",
};

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

/* -------------------------------------------------- */
/* Constants                                          */
/* -------------------------------------------------- */
const AUSTRALIA_CENTER: [number, number] = [-25.2744, 133.7751];

export const CityFilterPills: React.FC<CityFilterPillsProps> = ({
  selected,
  onSelect,
}) => {
  const { setCenter } = useMap();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        onWheel={(e) => {
          const el = scrollerRef.current;
          if (!el) return;

          // If the user is already doing horizontal wheel (trackpad), let it work normally.
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

          // Only intercept when horizontal overflow exists
          const canScroll = el.scrollWidth > el.clientWidth;
          if (!canScroll) return;

          // Convert vertical wheel into horizontal scroll
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }}
        className={cn(
          "flex w-full flex-nowrap items-center gap-2",
          "overflow-x-auto overflow-y-hidden whitespace-nowrap",
          "py-1 pr-2 min-w-0",
          "overscroll-x-contain scroll-smooth",
          // make sure wheel preventDefault is allowed in React
          // (works because we're attaching directly to the element)
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {Object.entries(cityGroups).map(([key, label]) => (
          <Badge
            key={key}
            variant={selected === key ? "default" : "outline"}
            onClick={() => {
              const position = australiaMarkers.find((marker) =>
                marker.id.startsWith(key.toLowerCase())
              )?.position;
              if (position) setCenter({ lat: position.lat, lng: position.lng });
              else
                setCenter(
                  { lat: AUSTRALIA_CENTER[0], lng: AUSTRALIA_CENTER[1] },
                  6
                );
              onSelect(key);
            }}
            className={cn(
              "shrink-0",
              "cursor-pointer select-none rounded-full px-3 py-1 text-xs font-medium transition",
              "border shadow-sm",
              selected === key
                ? "bg-[#0d7377] text-white border-[#0d7377]/60 hover:bg-[#0a5d60]"
                : "bg-[#1a1f26]/60 text-[#9fe7ea] border-white/10 hover:bg-white/5 hover:border-[#0d7377]/30"
            )}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
