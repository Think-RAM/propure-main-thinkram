/**
 * Mock data for testing without Oxylabs credentials
 * Set MCP_MOCK_MODE=true to use this data
 *
 * Note: These listings are from RealEstate.com.au and use different
 * suburbs than Domain mock data to simulate competing platforms
 */

import type { PropertyListing, AustralianState } from "@propure/mcp-shared";

// Current timestamp for scrapedAt
const now = () => new Date().toISOString();

// Mock property listings across different Australian cities (REA-specific suburbs)
export const mockPropertyListings: PropertyListing[] = [
  // Sydney - Bondi Beach
  {
    externalId: "rea-143256789",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-apartment-nsw-bondi-beach-143256789",
    address: {
      streetNumber: "12/45",
      streetName: "Campbell",
      streetType: "Parade",
      suburb: "Bondi Beach",
      state: "NSW",
      postcode: "2026",
      displayAddress: "12/45 Campbell Parade, Bondi Beach NSW 2026",
      latitude: -33.8915,
      longitude: 151.2767,
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      buildingSize: 85,
      propertyType: "apartment",
      features: [
        "Ocean Views",
        "Balcony",
        "Security Building",
        "Walk to Beach",
        "Air Conditioning",
        "Built-in Wardrobes",
      ],
    },
    price: "$1,950,000 - $2,100,000",
    priceFrom: 1950000,
    priceTo: 2100000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Stunning Beachfront Living with Panoramic Ocean Views",
    description:
      "This exceptional apartment on iconic Campbell Parade offers front-row seats to one of Australia's most famous beaches. Wake up to breathtaking ocean views and enjoy the ultimate Bondi lifestyle. Features include a sun-drenched balcony, modern kitchen, and resort-style facilities.",
    images: [
      "https://images.realestate.com.au/img/bondi-1.jpg",
      "https://images.realestate.com.au/img/bondi-2.jpg",
      "https://images.realestate.com.au/img/bondi-3.jpg",
    ],
    agentName: "Lucy Zhang",
    agentPhone: "0411 234 567",
    agencyName: "Richardson & Wrench Bondi Beach",
    listedDate: "2024-12-18",
    inspectionTimes: ["Saturday 10:00am - 10:30am", "Thursday 5:30pm - 6:00pm"],
    scrapedAt: now(),
  },
  // Melbourne - St Kilda
  {
    externalId: "rea-143267890",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-apartment-vic-st-kilda-143267890",
    address: {
      streetNumber: "8/22",
      streetName: "Fitzroy",
      streetType: "Street",
      suburb: "St Kilda",
      state: "VIC",
      postcode: "3182",
      displayAddress: "8/22 Fitzroy Street, St Kilda VIC 3182",
      latitude: -37.8675,
      longitude: 144.9803,
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      buildingSize: 72,
      propertyType: "apartment",
      features: [
        "Art Deco Building",
        "High Ceilings",
        "Period Features",
        "Walk to Beach",
        "Tram at Door",
      ],
    },
    price: "$750,000 - $820,000",
    priceFrom: 750000,
    priceTo: 820000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Elegant Art Deco in Prime St Kilda Location",
    description:
      "Beautifully maintained Art Deco apartment in the heart of St Kilda. Original features include ornate ceiling roses, picture rails, and polished floorboards. Steps to Acland Street, Luna Park, and St Kilda Beach.",
    images: [
      "https://images.realestate.com.au/img/stkilda-1.jpg",
      "https://images.realestate.com.au/img/stkilda-2.jpg",
    ],
    agentName: "Marcus Lee",
    agentPhone: "0422 345 678",
    agencyName: "Hocking Stuart St Kilda",
    listedDate: "2024-12-12",
    auctionDate: "2025-01-18",
    inspectionTimes: ["Saturday 11:00am - 11:30am"],
    scrapedAt: now(),
  },
  // Sydney - Paddington
  {
    externalId: "rea-143278901",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-nsw-paddington-143278901",
    address: {
      streetNumber: "156",
      streetName: "Oxford",
      streetType: "Street",
      suburb: "Paddington",
      state: "NSW",
      postcode: "2021",
      displayAddress: "156 Oxford Street, Paddington NSW 2021",
      latitude: -33.8847,
      longitude: 151.2265,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 320,
      buildingSize: 245,
      propertyType: "house",
      features: [
        "Heritage Terrace",
        "Original Ironwork",
        "Rear Courtyard",
        "Modern Extension",
        "Wine Cellar",
        "Home Office",
      ],
    },
    price: "$4,200,000 - $4,600,000",
    priceFrom: 4200000,
    priceTo: 4600000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Grand Victorian Terrace with Contemporary Extension",
    description:
      "This stunning double-fronted Victorian terrace seamlessly blends heritage charm with contemporary luxury. Original features include lacework balcony, marble fireplaces, and ornate ceilings. The rear features a stunning glass-walled extension with landscaped courtyard.",
    images: [
      "https://images.realestate.com.au/img/paddington-1.jpg",
      "https://images.realestate.com.au/img/paddington-2.jpg",
      "https://images.realestate.com.au/img/paddington-3.jpg",
    ],
    agentName: "Charlotte Morrison",
    agentPhone: "0433 456 789",
    agencyName: "Laing+Simmons Paddington",
    listedDate: "2024-12-20",
    auctionDate: "2025-02-01",
    inspectionTimes: [
      "Saturday 10:30am - 11:00am",
      "Wednesday 6:00pm - 6:30pm",
    ],
    scrapedAt: now(),
  },
  // Brisbane - New Farm
  {
    externalId: "rea-143289012",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-qld-new-farm-143289012",
    address: {
      streetNumber: "42",
      streetName: "Moray",
      streetType: "Street",
      suburb: "New Farm",
      state: "QLD",
      postcode: "4005",
      displayAddress: "42 Moray Street, New Farm QLD 4005",
      latitude: -27.468,
      longitude: 153.0496,
    },
    features: {
      bedrooms: 5,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 607,
      buildingSize: 340,
      propertyType: "house",
      features: [
        "Queenslander Style",
        "River Views",
        "Pool",
        "VJ Walls",
        "Wraparound Verandah",
        "Walk to Howard Smith Wharves",
      ],
    },
    price: "$3,800,000",
    priceValue: 3800000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Magnificent Queenslander with City and River Views",
    description:
      "This beautifully restored Queenslander showcases exceptional craftsmanship with soaring ceilings, VJ walls, and wraparound verandahs. Set on 607sqm with city and river glimpses. Walking distance to James Street and Howard Smith Wharves.",
    images: [
      "https://images.realestate.com.au/img/newfarm-1.jpg",
      "https://images.realestate.com.au/img/newfarm-2.jpg",
    ],
    agentName: "Benjamin Ward",
    agentPhone: "0444 567 890",
    agencyName: "Ray White New Farm",
    listedDate: "2024-12-15",
    inspectionTimes: ["Saturday 9:30am - 10:00am"],
    scrapedAt: now(),
  },
  // Melbourne - South Yarra
  {
    externalId: "rea-143290123",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-townhouse-vic-south-yarra-143290123",
    address: {
      streetNumber: "3/88",
      streetName: "Toorak",
      streetType: "Road",
      suburb: "South Yarra",
      state: "VIC",
      postcode: "3141",
      displayAddress: "3/88 Toorak Road, South Yarra VIC 3141",
      latitude: -37.8394,
      longitude: 144.9912,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      buildingSize: 165,
      propertyType: "townhouse",
      features: [
        "Double Storey",
        "Private Courtyard",
        "Walk to Chapel Street",
        "European Appliances",
        "Heating/Cooling",
      ],
    },
    price: "$1,850,000 - $2,000,000",
    priceFrom: 1850000,
    priceTo: 2000000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Sophisticated Townhouse in Prestigious Location",
    description:
      "This immaculate townhouse offers a rare opportunity in one of Melbourne's most sought-after addresses. Split over two levels with north-facing courtyard, moments to Toorak Road shopping, Fawkner Park, and South Yarra station.",
    images: [
      "https://images.realestate.com.au/img/southyarra-1.jpg",
      "https://images.realestate.com.au/img/southyarra-2.jpg",
    ],
    agentName: "Nicholas Pappas",
    agentPhone: "0455 678 901",
    agencyName: "Marshall White Stonnington",
    listedDate: "2024-12-08",
    auctionDate: "2025-01-25",
    inspectionTimes: ["Saturday 12:00pm - 12:30pm", "Thursday 5:00pm - 5:30pm"],
    scrapedAt: now(),
  },
  // Sydney - Manly
  {
    externalId: "rea-143301234",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-nsw-manly-143301234",
    address: {
      streetNumber: "28",
      streetName: "Bower",
      streetType: "Street",
      suburb: "Manly",
      state: "NSW",
      postcode: "2095",
      displayAddress: "28 Bower Street, Manly NSW 2095",
      latitude: -33.7969,
      longitude: 151.2852,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 420,
      buildingSize: 280,
      propertyType: "house",
      features: [
        "Beach Views",
        "North Facing",
        "Pool",
        "Outdoor Entertaining",
        "Walk to Wharf",
        "Home Automation",
      ],
    },
    price: "Contact Agent",
    priceFrom: 6000000,
    priceTo: 6500000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Exceptional Beachside Residence with Panoramic Views",
    description:
      "A rare offering in one of Manly's most coveted streets. This architecturally designed home captures stunning ocean views from multiple levels. Features include heated pool, state-of-the-art kitchen, and private rooftop terrace.",
    images: [
      "https://images.realestate.com.au/img/manly-1.jpg",
      "https://images.realestate.com.au/img/manly-2.jpg",
      "https://images.realestate.com.au/img/manly-3.jpg",
    ],
    agentName: "Daniel King",
    agentPhone: "0466 789 012",
    agencyName: "Cunninghams Real Estate",
    listedDate: "2024-12-22",
    inspectionTimes: ["By Private Appointment"],
    scrapedAt: now(),
  },
  // Perth - Fremantle
  {
    externalId: "rea-143312345",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-wa-fremantle-143312345",
    address: {
      streetNumber: "67",
      streetName: "South",
      streetType: "Terrace",
      suburb: "Fremantle",
      state: "WA",
      postcode: "6160",
      displayAddress: "67 South Terrace, Fremantle WA 6160",
      latitude: -32.0545,
      longitude: 115.7457,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 380,
      buildingSize: 175,
      propertyType: "house",
      features: [
        "Heritage Listed",
        "Limestone Construction",
        "High Ceilings",
        "Walk to Cappuccino Strip",
        "Rear Lane Access",
      ],
    },
    price: "$1,350,000 - $1,450,000",
    priceFrom: 1350000,
    priceTo: 1450000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Historic Fremantle Charm with Modern Comforts",
    description:
      "This beautifully restored heritage limestone cottage captures the essence of Fremantle living. Original features include pressed metal ceilings, timber floorboards, and working fireplaces. Moments to the famous Cappuccino Strip and Fremantle Markets.",
    images: [
      "https://images.realestate.com.au/img/fremantle-1.jpg",
      "https://images.realestate.com.au/img/fremantle-2.jpg",
    ],
    agentName: "Emma Thompson",
    agentPhone: "0477 890 123",
    agencyName: "dethridgeGROVES Real Estate",
    listedDate: "2024-12-10",
    inspectionTimes: ["Saturday 11:30am - 12:00pm"],
    scrapedAt: now(),
  },
  // Adelaide - Glenelg
  {
    externalId: "rea-143323456",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-apartment-sa-glenelg-143323456",
    address: {
      streetNumber: "23/1",
      streetName: "Colley",
      streetType: "Terrace",
      suburb: "Glenelg",
      state: "SA",
      postcode: "5045",
      displayAddress: "23/1 Colley Terrace, Glenelg SA 5045",
      latitude: -34.9808,
      longitude: 138.5159,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      buildingSize: 145,
      propertyType: "apartment",
      features: [
        "Beachfront",
        "Uninterrupted Ocean Views",
        "Penthouse Level",
        "Two Balconies",
        "Resort Facilities",
        "Secure Parking",
      ],
    },
    price: "$1,650,000",
    priceValue: 1650000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Luxurious Beachfront Penthouse with Spectacular Views",
    description:
      "Experience beachfront living at its finest in this stunning penthouse-level apartment. Floor-to-ceiling windows frame panoramic views of the ocean and coastline. Features include two spacious balconies, gourmet kitchen, and access to resort-style amenities.",
    images: [
      "https://images.realestate.com.au/img/glenelg-1.jpg",
      "https://images.realestate.com.au/img/glenelg-2.jpg",
    ],
    agentName: "William Scott",
    agentPhone: "0488 901 234",
    agencyName: "Harcourts Glenelg",
    listedDate: "2024-12-14",
    inspectionTimes: ["Saturday 2:00pm - 2:30pm", "Sunday 2:00pm - 2:30pm"],
    scrapedAt: now(),
  },
  // Sydney - Newtown
  {
    externalId: "rea-143334567",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-nsw-newtown-143334567",
    address: {
      streetNumber: "89",
      streetName: "Australia",
      streetType: "Street",
      suburb: "Newtown",
      state: "NSW",
      postcode: "2042",
      displayAddress: "89 Australia Street, Newtown NSW 2042",
      latitude: -33.8988,
      longitude: 151.178,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 0,
      landSize: 165,
      buildingSize: 140,
      propertyType: "house",
      features: [
        "Worker's Cottage",
        "Skylit Kitchen",
        "Courtyard Garden",
        "Exposed Brick",
        "Walk to King Street",
      ],
    },
    price: "$1,400,000 - $1,500,000",
    priceFrom: 1400000,
    priceTo: 1500000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Character-Filled Worker's Cottage in Vibrant Newtown",
    description:
      "This lovingly renovated worker's cottage offers the perfect blend of heritage charm and contemporary living. Features include exposed brick walls, polished timber floors, and a sun-drenched courtyard. Steps to King Street's cafes, bars, and boutiques.",
    images: [
      "https://images.realestate.com.au/img/newtown-1.jpg",
      "https://images.realestate.com.au/img/newtown-2.jpg",
    ],
    agentName: "Olivia Chen",
    agentPhone: "0499 012 345",
    agencyName: "Adrian William",
    listedDate: "2024-12-16",
    auctionDate: "2025-01-11",
    inspectionTimes: ["Saturday 9:30am - 10:00am"],
    scrapedAt: now(),
  },
  // Melbourne - Northcote
  {
    externalId: "rea-143345678",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-vic-northcote-143345678",
    address: {
      streetNumber: "234",
      streetName: "High",
      streetType: "Street",
      suburb: "Northcote",
      state: "VIC",
      postcode: "3070",
      displayAddress: "234 High Street, Northcote VIC 3070",
      latitude: -37.7697,
      longitude: 145.0017,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 512,
      buildingSize: 195,
      propertyType: "house",
      features: [
        "Edwardian",
        "Rear Studio",
        "Established Gardens",
        "Period Features",
        "Dual Living Potential",
      ],
    },
    price: "$1,800,000 - $1,950,000",
    priceFrom: 1800000,
    priceTo: 1950000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Grand Edwardian with Separate Studio on Large Block",
    description:
      "This impressive Edwardian home on a generous 512sqm block offers exceptional family living plus income potential with a self-contained studio. Original features include lead lighting, picture rails, and ornate fireplaces. Walk to High Street shops and Northcote station.",
    images: [
      "https://images.realestate.com.au/img/northcote-1.jpg",
      "https://images.realestate.com.au/img/northcote-2.jpg",
      "https://images.realestate.com.au/img/northcote-3.jpg",
    ],
    agentName: "Andrew Mitchell",
    agentPhone: "0400 123 456",
    agencyName: "Jellis Craig Northcote",
    listedDate: "2024-12-19",
    auctionDate: "2025-02-08",
    inspectionTimes: ["Saturday 1:00pm - 1:30pm", "Wednesday 6:00pm - 6:30pm"],
    scrapedAt: now(),
  },
  // Brisbane - Bulimba
  {
    externalId: "rea-143356789",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-qld-bulimba-143356789",
    address: {
      streetNumber: "15",
      streetName: "Oxford",
      streetType: "Street",
      suburb: "Bulimba",
      state: "QLD",
      postcode: "4171",
      displayAddress: "15 Oxford Street, Bulimba QLD 4171",
      latitude: -27.4545,
      longitude: 153.0555,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 455,
      buildingSize: 285,
      propertyType: "house",
      features: [
        "Hamptons Style",
        "Pool",
        "City Views",
        "Walk to Oxford Street",
        "Home Theatre",
        "Butler's Pantry",
      ],
    },
    price: "$2,450,000",
    priceValue: 2450000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Stunning Hamptons Residence with City Skyline Views",
    description:
      "This exquisite Hamptons-inspired home captures stunning city skyline views from its elevated position. Designed for entertaining with open-plan living, resort-style pool, and gourmet kitchen with butler's pantry. Walk to Oxford Street village.",
    images: [
      "https://images.realestate.com.au/img/bulimba-1.jpg",
      "https://images.realestate.com.au/img/bulimba-2.jpg",
    ],
    agentName: "Sarah Collins",
    agentPhone: "0411 234 567",
    agencyName: "Place Bulimba",
    listedDate: "2024-12-11",
    inspectionTimes: ["Saturday 10:00am - 10:30am"],
    scrapedAt: now(),
  },
  // Sydney - Coogee
  {
    externalId: "rea-143367890",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-unit-nsw-coogee-143367890",
    address: {
      streetNumber: "5/180",
      streetName: "Coogee Bay",
      streetType: "Road",
      suburb: "Coogee",
      state: "NSW",
      postcode: "2034",
      displayAddress: "5/180 Coogee Bay Road, Coogee NSW 2034",
      latitude: -33.9193,
      longitude: 151.2553,
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      buildingSize: 68,
      propertyType: "unit",
      features: [
        "Art Deco",
        "Ocean Glimpses",
        "Walk to Beach",
        "Original Features",
        "Sunny Balcony",
      ],
    },
    price: "$1,150,000 - $1,250,000",
    priceFrom: 1150000,
    priceTo: 1250000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Charming Art Deco Apartment Steps from Coogee Beach",
    description:
      "This delightful Art Deco apartment offers the quintessential Coogee lifestyle. Ocean glimpses from your sunny balcony, original period features, and just 200m to the sand. A rare opportunity to secure your piece of beachside paradise.",
    images: [
      "https://images.realestate.com.au/img/coogee-1.jpg",
      "https://images.realestate.com.au/img/coogee-2.jpg",
    ],
    agentName: "James Patterson",
    agentPhone: "0422 345 678",
    agencyName: "PPD Real Estate",
    listedDate: "2024-12-13",
    auctionDate: "2025-01-18",
    inspectionTimes: ["Saturday 11:00am - 11:30am", "Thursday 5:00pm - 5:30pm"],
    scrapedAt: now(),
  },
  // Perth - Cottesloe
  {
    externalId: "rea-143378901",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-wa-cottesloe-143378901",
    address: {
      streetNumber: "45",
      streetName: "Marine",
      streetType: "Parade",
      suburb: "Cottesloe",
      state: "WA",
      postcode: "6011",
      displayAddress: "45 Marine Parade, Cottesloe WA 6011",
      latitude: -31.9933,
      longitude: 115.7518,
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 3,
      landSize: 720,
      buildingSize: 450,
      propertyType: "house",
      features: [
        "Beachfront",
        "Infinity Pool",
        "Indian Ocean Views",
        "Lift",
        "Wine Room",
        "Home Gym",
      ],
    },
    price: "Offers Above $8,500,000",
    priceFrom: 8500000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Absolute Beachfront Masterpiece on Marine Parade",
    description:
      "This architectural masterpiece on prestigious Marine Parade offers unparalleled beachfront living. Featuring infinity pool overlooking the Indian Ocean, lift access to all three levels, and exceptional finishes throughout. One of Cottesloe's finest residences.",
    images: [
      "https://images.realestate.com.au/img/cottesloe-1.jpg",
      "https://images.realestate.com.au/img/cottesloe-2.jpg",
      "https://images.realestate.com.au/img/cottesloe-3.jpg",
    ],
    agentName: "Peter Robertson",
    agentPhone: "0433 456 789",
    agencyName: "William Porteous Properties",
    listedDate: "2024-12-21",
    inspectionTimes: ["By Private Appointment"],
    scrapedAt: now(),
  },
  // Melbourne - Hawthorn
  {
    externalId: "rea-143389012",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-house-vic-hawthorn-143389012",
    address: {
      streetNumber: "12",
      streetName: "Riversdale",
      streetType: "Road",
      suburb: "Hawthorn",
      state: "VIC",
      postcode: "3122",
      displayAddress: "12 Riversdale Road, Hawthorn VIC 3122",
      latitude: -37.8216,
      longitude: 145.0359,
    },
    features: {
      bedrooms: 5,
      bathrooms: 3,
      parkingSpaces: 4,
      landSize: 1100,
      buildingSize: 420,
      propertyType: "house",
      features: [
        "Victorian Mansion",
        "Tennis Court",
        "Pool",
        "Carriage House",
        "Period Gardens",
        "Multiple Living Areas",
      ],
    },
    price: "$6,500,000 - $7,000,000",
    priceFrom: 6500000,
    priceTo: 7000000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Magnificent Victorian Mansion on Landscaped Grounds",
    description:
      "This grand Victorian mansion on a substantial 1,100sqm parcel offers a lifestyle of uncompromising quality. Features include tennis court, pool, original carriage house, and stunning period gardens. A distinguished family estate in prestigious Hawthorn.",
    images: [
      "https://images.realestate.com.au/img/hawthorn-1.jpg",
      "https://images.realestate.com.au/img/hawthorn-2.jpg",
      "https://images.realestate.com.au/img/hawthorn-3.jpg",
    ],
    agentName: "Victoria Edwards",
    agentPhone: "0444 567 890",
    agencyName: "Kay & Burton Hawthorn",
    listedDate: "2024-12-17",
    inspectionTimes: ["By Private Appointment"],
    scrapedAt: now(),
  },
  // Gold Coast - Burleigh Heads
  {
    externalId: "rea-143390123",
    source: "REALESTATE",
    sourceUrl:
      "https://www.realestate.com.au/property-apartment-qld-burleigh-heads-143390123",
    address: {
      streetNumber: "15/1",
      streetName: "Goodwin",
      streetType: "Terrace",
      suburb: "Burleigh Heads",
      state: "QLD",
      postcode: "4220",
      displayAddress: "15/1 Goodwin Terrace, Burleigh Heads QLD 4220",
      latitude: -28.0886,
      longitude: 153.4476,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      buildingSize: 140,
      propertyType: "apartment",
      features: [
        "Absolute Beachfront",
        "Ocean Views",
        "Recently Renovated",
        "Walk to Village",
        "Resort Pool",
        "North Facing",
      ],
    },
    price: "$2,850,000",
    priceValue: 2850000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Premium Beachfront Living in Iconic Burleigh",
    description:
      "This beautifully renovated beachfront apartment offers the ultimate Burleigh lifestyle. Wake to stunning ocean views, with the famous Burleigh Heads point break at your doorstep. Walk to James Street village for world-class dining.",
    images: [
      "https://images.realestate.com.au/img/burleigh-1.jpg",
      "https://images.realestate.com.au/img/burleigh-2.jpg",
    ],
    agentName: "Michael Davies",
    agentPhone: "0455 678 901",
    agencyName: "Kollosche Burleigh Heads",
    listedDate: "2024-12-09",
    inspectionTimes: [
      "Saturday 10:00am - 10:30am",
      "Wednesday 4:30pm - 5:00pm",
    ],
    scrapedAt: now(),
  },
];

// Mock suburb statistics
export interface MockSuburbStats {
  suburb: string;
  state: AustralianState;
  postcode: string;
  medianPrice?: number;
  medianRent?: number;
  population?: number;
  averageAge?: number;
  ownerOccupied?: number;
  renters?: number;
  medianIncome?: number;
}

export const mockSuburbStats: Record<string, MockSuburbStats> = {
  "bondi-beach-nsw-2026": {
    suburb: "Bondi Beach",
    state: "NSW",
    postcode: "2026",
    medianPrice: 2250000,
    medianRent: 1100,
    population: 10845,
    averageAge: 34,
    ownerOccupied: 35,
    renters: 55,
    medianIncome: 82500,
  },
  "st-kilda-vic-3182": {
    suburb: "St Kilda",
    state: "VIC",
    postcode: "3182",
    medianPrice: 895000,
    medianRent: 520,
    population: 21952,
    averageAge: 35,
    ownerOccupied: 28,
    renters: 62,
    medianIncome: 68000,
  },
  "paddington-nsw-2021": {
    suburb: "Paddington",
    state: "NSW",
    postcode: "2021",
    medianPrice: 2950000,
    medianRent: 1150,
    population: 12543,
    averageAge: 38,
    ownerOccupied: 42,
    renters: 48,
    medianIncome: 95000,
  },
  "new-farm-qld-4005": {
    suburb: "New Farm",
    state: "QLD",
    postcode: "4005",
    medianPrice: 1850000,
    medianRent: 680,
    population: 12845,
    averageAge: 36,
    ownerOccupied: 38,
    renters: 52,
    medianIncome: 78500,
  },
  "south-yarra-vic-3141": {
    suburb: "South Yarra",
    state: "VIC",
    postcode: "3141",
    medianPrice: 1650000,
    medianRent: 620,
    population: 25678,
    averageAge: 33,
    ownerOccupied: 32,
    renters: 58,
    medianIncome: 75000,
  },
  "manly-nsw-2095": {
    suburb: "Manly",
    state: "NSW",
    postcode: "2095",
    medianPrice: 3850000,
    medianRent: 1250,
    population: 15432,
    averageAge: 37,
    ownerOccupied: 45,
    renters: 45,
    medianIncome: 98000,
  },
  "fremantle-wa-6160": {
    suburb: "Fremantle",
    state: "WA",
    postcode: "6160",
    medianPrice: 1150000,
    medianRent: 650,
    population: 8345,
    averageAge: 40,
    ownerOccupied: 48,
    renters: 42,
    medianIncome: 72000,
  },
  "glenelg-sa-5045": {
    suburb: "Glenelg",
    state: "SA",
    postcode: "5045",
    medianPrice: 950000,
    medianRent: 520,
    population: 6234,
    averageAge: 42,
    ownerOccupied: 52,
    renters: 38,
    medianIncome: 68000,
  },
  "newtown-nsw-2042": {
    suburb: "Newtown",
    state: "NSW",
    postcode: "2042",
    medianPrice: 1650000,
    medianRent: 750,
    population: 14876,
    averageAge: 34,
    ownerOccupied: 35,
    renters: 55,
    medianIncome: 72000,
  },
  "northcote-vic-3070": {
    suburb: "Northcote",
    state: "VIC",
    postcode: "3070",
    medianPrice: 1520000,
    medianRent: 580,
    population: 24532,
    averageAge: 36,
    ownerOccupied: 48,
    renters: 42,
    medianIncome: 76000,
  },
  "bulimba-qld-4171": {
    suburb: "Bulimba",
    state: "QLD",
    postcode: "4171",
    medianPrice: 1750000,
    medianRent: 720,
    population: 8956,
    averageAge: 38,
    ownerOccupied: 55,
    renters: 35,
    medianIncome: 88000,
  },
  "coogee-nsw-2034": {
    suburb: "Coogee",
    state: "NSW",
    postcode: "2034",
    medianPrice: 2650000,
    medianRent: 950,
    population: 14567,
    averageAge: 35,
    ownerOccupied: 38,
    renters: 52,
    medianIncome: 86000,
  },
  "cottesloe-wa-6011": {
    suburb: "Cottesloe",
    state: "WA",
    postcode: "6011",
    medianPrice: 3250000,
    medianRent: 1100,
    population: 7234,
    averageAge: 45,
    ownerOccupied: 62,
    renters: 28,
    medianIncome: 125000,
  },
  "hawthorn-vic-3122": {
    suburb: "Hawthorn",
    state: "VIC",
    postcode: "3122",
    medianPrice: 2450000,
    medianRent: 750,
    population: 23456,
    averageAge: 38,
    ownerOccupied: 52,
    renters: 38,
    medianIncome: 95000,
  },
  "burleigh-heads-qld-4220": {
    suburb: "Burleigh Heads",
    state: "QLD",
    postcode: "4220",
    medianPrice: 1650000,
    medianRent: 850,
    population: 10234,
    averageAge: 39,
    ownerOccupied: 48,
    renters: 42,
    medianIncome: 78000,
  },
};

// Mock sales history
export interface MockSaleRecord {
  saleDate: string;
  salePrice: number;
  saleType?: string;
}

export const mockSalesHistory: Record<string, MockSaleRecord[]> = {
  "12/45-campbell-parade-bondi-beach-nsw": [
    { saleDate: "2019-08-15", salePrice: 1650000, saleType: "auction" },
    { saleDate: "2014-03-22", salePrice: 1150000, saleType: "private treaty" },
  ],
  "156-oxford-street-paddington-nsw": [
    { saleDate: "2017-11-18", salePrice: 3200000, saleType: "auction" },
    { saleDate: "2011-05-07", salePrice: 2100000, saleType: "auction" },
    { saleDate: "2005-09-24", salePrice: 1450000, saleType: "private treaty" },
  ],
  "42-moray-street-new-farm-qld": [
    { saleDate: "2020-02-29", salePrice: 2850000, saleType: "auction" },
    { saleDate: "2015-06-13", salePrice: 1950000, saleType: "private treaty" },
  ],
  "234-high-street-northcote-vic": [
    { saleDate: "2018-09-08", salePrice: 1450000, saleType: "auction" },
    { saleDate: "2012-11-17", salePrice: 985000, saleType: "auction" },
  ],
};

// Mock agent information
export interface MockAgentInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  agencyName?: string;
  salesCount?: number;
  rating?: number;
}

export const mockAgentInfo: Record<string, MockAgentInfo> = {
  "lucy-zhang-12345": {
    id: "lucy-zhang-12345",
    name: "Lucy Zhang",
    email: "lucy.zhang@randw.com.au",
    phone: "0411 234 567",
    photoUrl: "https://images.realestate.com.au/agents/lucy-zhang.jpg",
    agencyName: "Richardson & Wrench Bondi Beach",
    salesCount: 98,
    rating: 4.9,
  },
  "charlotte-morrison-34567": {
    id: "charlotte-morrison-34567",
    name: "Charlotte Morrison",
    email: "charlotte.morrison@lsre.com.au",
    phone: "0433 456 789",
    photoUrl: "https://images.realestate.com.au/agents/charlotte-morrison.jpg",
    agencyName: "Laing+Simmons Paddington",
    salesCount: 145,
    rating: 4.8,
  },
  "daniel-king-56789": {
    id: "daniel-king-56789",
    name: "Daniel King",
    email: "daniel.king@cunninghams.com.au",
    phone: "0466 789 012",
    photoUrl: "https://images.realestate.com.au/agents/daniel-king.jpg",
    agencyName: "Cunninghams Real Estate",
    salesCount: 178,
    rating: 4.9,
  },
};

/**
 * Filter mock listings by search params
 */
export function filterMockListings(params: {
  suburbs?: string[];
  state?: AustralianState;
  postcode?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  propertyTypes?: string[];
  listingType?: "sale" | "rent" | "sold";
  page?: number;
  pageSize?: number;
}): {
  listings: PropertyListing[];
  totalCount: number;
  hasMore: boolean;
} {
  let filtered = [...mockPropertyListings];

  // Filter by suburbs
  if (params.suburbs?.length) {
    const suburbsLower = params.suburbs.map((s) => s.toLowerCase());
    filtered = filtered.filter((l) =>
      suburbsLower.includes(l.address.suburb.toLowerCase()),
    );
  }

  // Filter by state
  if (params.state) {
    filtered = filtered.filter((l) => l.address.state === params.state);
  }

  // Filter by postcode
  if (params.postcode) {
    filtered = filtered.filter((l) => l.address.postcode === params.postcode);
  }

  // Filter by price
  if (params.minPrice) {
    filtered = filtered.filter((l) => {
      const price = l.priceValue || l.priceFrom || 0;
      return price >= params.minPrice!;
    });
  }
  if (params.maxPrice) {
    filtered = filtered.filter((l) => {
      const price = l.priceValue || l.priceTo || l.priceFrom || Infinity;
      return price <= params.maxPrice!;
    });
  }

  // Filter by bedrooms
  if (params.minBeds) {
    filtered = filtered.filter(
      (l) => (l.features?.bedrooms || 0) >= params.minBeds!,
    );
  }
  if (params.maxBeds) {
    filtered = filtered.filter(
      (l) => (l.features?.bedrooms || 0) <= params.maxBeds!,
    );
  }

  // Filter by bathrooms
  if (params.minBaths) {
    filtered = filtered.filter(
      (l) => (l.features?.bathrooms || 0) >= params.minBaths!,
    );
  }

  // Filter by property types
  if (params.propertyTypes?.length) {
    filtered = filtered.filter((l) =>
      params.propertyTypes!.includes(l.features?.propertyType || ""),
    );
  }

  // Filter by listing type
  if (params.listingType) {
    filtered = filtered.filter((l) => l.listingType === params.listingType);
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);

  return {
    listings: paginatedResults,
    totalCount: filtered.length,
    hasMore: startIndex + pageSize < filtered.length,
  };
}

/**
 * Get mock suburb stats by key
 */
export function getMockSuburbStats(
  suburb: string,
  state: AustralianState,
  postcode: string,
): MockSuburbStats | null {
  const key = `${suburb.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}-${postcode}`;
  return mockSuburbStats[key] || null;
}

/**
 * Get mock property details by listing ID
 */
export function getMockPropertyDetails(
  listingId: string,
): PropertyListing | null {
  return mockPropertyListings.find((l) => l.externalId === listingId) || null;
}

/**
 * Get mock sales history by address
 */
export function getMockSalesHistory(
  address: string,
  suburb: string,
  state: AustralianState,
): MockSaleRecord[] {
  const key = `${address.toLowerCase().replace(/\s+/g, "-")}-${suburb.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
  return mockSalesHistory[key] || [];
}

/**
 * Get mock agent info by ID
 */
export function getMockAgentInfo(agentId: string): MockAgentInfo | null {
  return mockAgentInfo[agentId] || null;
}

/**
 * Get mock sold properties for a suburb
 */
export function getMockSoldProperties(
  suburb: string,
  state: AustralianState,
): PropertyListing[] {
  // Return mock listings modified to appear as sold
  const suburbListings = mockPropertyListings.filter(
    (l) =>
      l.address.suburb.toLowerCase() === suburb.toLowerCase() &&
      l.address.state === state,
  );

  return suburbListings.map((listing) => ({
    ...listing,
    listingType: "sold" as const,
    listingStatus: "SOLD" as const,
    price: listing.priceValue
      ? `Sold for $${listing.priceValue.toLocaleString()}`
      : listing.price,
  }));
}

/**
 * Get mock agency listings
 */
export function getMockAgencyListings(agencyId: string): PropertyListing[] {
  // Return listings that match the agency
  const agencyNameMap: Record<string, string> = {
    "richardson-wrench-bondi": "Richardson & Wrench Bondi Beach",
    "laing-simmons-paddington": "Laing+Simmons Paddington",
    cunninghams: "Cunninghams Real Estate",
    "ray-white-new-farm": "Ray White New Farm",
  };

  const agencyName = agencyNameMap[agencyId];
  if (!agencyName) {
    return [];
  }

  return mockPropertyListings.filter((l) => l.agencyName === agencyName);
}

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.MCP_MOCK_MODE === "true";
}
