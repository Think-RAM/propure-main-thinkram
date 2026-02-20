/**
 * Mock data for testing without Oxylabs credentials
 * Set MCP_MOCK_MODE=true to use this data
 */

import type { PropertyListing, AustralianState } from "@propure/mcp-shared";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Current timestamp for scrapedAt
const now = () => new Date().toISOString();

// Mock property listings across different Australian cities
export const mockPropertyListings: PropertyListing[] = [
  // Sydney - Eastern Suburbs
  {
    externalId: "domain-2019583451",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019583451",
    address: {
      streetNumber: "45",
      streetName: "Bellevue",
      streetType: "Road",
      suburb: "Bellevue Hill",
      state: "NSW",
      postcode: "2023",
      displayAddress: "45 Bellevue Road, Bellevue Hill NSW 2023",
      latitude: -33.8836,
      longitude: 151.2567,
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 3,
      landSize: 850,
      buildingSize: 420,
      propertyType: "house",
      features: [
        "Swimming Pool",
        "Tennis Court",
        "Harbour Views",
        "Double Garage",
        "Air Conditioning",
        "Garden",
      ],
    },
    price: "$8,500,000 - $9,200,000",
    priceFrom: 8500000,
    priceTo: 9200000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Magnificent Federation Masterpiece with Harbour Views",
    description:
      "Set on one of Bellevue Hill's most prestigious streets, this stunning Federation residence offers exceptional luxury living with breathtaking harbour views. Featuring five generous bedrooms, four luxurious bathrooms, and exquisite period details throughout.",
    images: [
      "https://images.domain.com.au/img/bellevue-1.jpg",
      "https://images.domain.com.au/img/bellevue-2.jpg",
      "https://images.domain.com.au/img/bellevue-3.jpg",
    ],
    agentName: "Michael Chen",
    agentPhone: "0412 345 678",
    agencyName: "Ray White Double Bay",
    listedDate: "2024-12-15",
    auctionDate: "2025-01-25",
    inspectionTimes: [
      "Saturday 11:00am - 11:30am",
      "Wednesday 5:00pm - 5:30pm",
    ],
    scrapedAt: now(),
  },
  // Sydney - Inner West
  {
    externalId: "domain-2019584532",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019584532",
    address: {
      streetNumber: "12",
      streetName: "Palace",
      streetType: "Street",
      suburb: "Petersham",
      state: "NSW",
      postcode: "2049",
      displayAddress: "12 Palace Street, Petersham NSW 2049",
      latitude: -33.8943,
      longitude: 151.1551,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 1,
      landSize: 285,
      buildingSize: 165,
      propertyType: "house",
      features: [
        "Renovated Kitchen",
        "Courtyard Garden",
        "Original Features",
        "Close to Transport",
      ],
    },
    price: "$1,650,000 - $1,750,000",
    priceFrom: 1650000,
    priceTo: 1750000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Charming Victorian Terrace in Lifestyle Location",
    description:
      "Beautifully renovated Victorian terrace in the heart of Petersham. Walk to cafes, restaurants, and Petersham train station. Features original period details with modern updates throughout.",
    images: [
      "https://images.domain.com.au/img/petersham-1.jpg",
      "https://images.domain.com.au/img/petersham-2.jpg",
    ],
    agentName: "Sarah Wilson",
    agentPhone: "0423 456 789",
    agencyName: "McGrath Inner West",
    listedDate: "2024-12-10",
    inspectionTimes: ["Saturday 10:00am - 10:30am"],
    scrapedAt: now(),
  },
  // Sydney - Southwest (Cash flow investment area)
  {
    externalId: "domain-2019585678",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019585678",
    address: {
      streetNumber: "78",
      streetName: "Cumberland",
      streetType: "Road",
      suburb: "Liverpool",
      state: "NSW",
      postcode: "2170",
      displayAddress: "78 Cumberland Road, Liverpool NSW 2170",
      latitude: -33.9237,
      longitude: 150.9256,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 556,
      buildingSize: 185,
      propertyType: "house",
      features: [
        "Granny Flat Potential",
        "Large Block",
        "Close to Hospital",
        "Near Western Sydney University",
      ],
    },
    price: "$895,000",
    priceValue: 895000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Investment Opportunity with Dual Income Potential",
    description:
      "Solid brick home on a generous 556sqm block with approved plans for granny flat. Perfect for investors seeking strong rental returns in the booming Liverpool area. Close to Liverpool Hospital and Western Sydney University.",
    images: ["https://images.domain.com.au/img/liverpool-1.jpg"],
    agentName: "Ahmed Hassan",
    agentPhone: "0434 567 890",
    agencyName: "Century 21 Liverpool",
    listedDate: "2024-12-01",
    scrapedAt: now(),
  },
  // Melbourne - Inner Suburbs
  {
    externalId: "domain-2019586789",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019586789",
    address: {
      streetNumber: "23",
      streetName: "Argyle",
      streetType: "Street",
      suburb: "Fitzroy",
      state: "VIC",
      postcode: "3065",
      displayAddress: "23 Argyle Street, Fitzroy VIC 3065",
      latitude: -37.8005,
      longitude: 144.9784,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 1,
      landSize: 180,
      buildingSize: 145,
      propertyType: "townhouse",
      features: [
        "Architect Designed",
        "Rooftop Terrace",
        "Walk to Brunswick Street",
        "Solar Panels",
      ],
    },
    price: "$1,450,000 - $1,550,000",
    priceFrom: 1450000,
    priceTo: 1550000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Contemporary Fitzroy Townhouse with City Views",
    description:
      "Striking architect-designed townhouse in the heart of Fitzroy. Features open-plan living, rooftop terrace with city views, and a secure garage. Steps to Brunswick Street's best cafes and bars.",
    images: [
      "https://images.domain.com.au/img/fitzroy-1.jpg",
      "https://images.domain.com.au/img/fitzroy-2.jpg",
    ],
    agentName: "James O'Brien",
    agentPhone: "0445 678 901",
    agencyName: "Jellis Craig Fitzroy",
    listedDate: "2024-12-08",
    auctionDate: "2025-01-18",
    inspectionTimes: ["Saturday 11:00am - 11:30am", "Thursday 6:00pm - 6:30pm"],
    scrapedAt: now(),
  },
  // Melbourne - Bayside
  {
    externalId: "domain-2019587890",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019587890",
    address: {
      streetNumber: "156",
      streetName: "Beach",
      streetType: "Road",
      suburb: "Brighton",
      state: "VIC",
      postcode: "3186",
      displayAddress: "156 Beach Road, Brighton VIC 3186",
      latitude: -37.9167,
      longitude: 145.0,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 650,
      buildingSize: 320,
      propertyType: "house",
      features: [
        "Beach Side of Road",
        "Pool",
        "Wine Cellar",
        "Home Theatre",
        "Ocean Views",
      ],
    },
    price: "Contact Agent",
    priceFrom: 4500000,
    priceTo: 5000000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Prestigious Beachside Living",
    description:
      "Luxurious residence on the coveted beach side of Beach Road. This stunning property offers uninterrupted bay views, a heated pool, and exceptional indoor-outdoor entertaining spaces.",
    images: [
      "https://images.domain.com.au/img/brighton-1.jpg",
      "https://images.domain.com.au/img/brighton-2.jpg",
      "https://images.domain.com.au/img/brighton-3.jpg",
    ],
    agentName: "Phillip Thompson",
    agentPhone: "0456 789 012",
    agencyName: "Buxton Brighton",
    listedDate: "2024-12-20",
    inspectionTimes: ["By Private Appointment"],
    scrapedAt: now(),
  },
  // Brisbane - Inner City
  {
    externalId: "domain-2019588901",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019588901",
    address: {
      streetNumber: "2102",
      streetName: "Adelaide",
      streetType: "Street",
      suburb: "Brisbane City",
      state: "QLD",
      postcode: "4000",
      displayAddress: "2102/108 Adelaide Street, Brisbane City QLD 4000",
      latitude: -27.4698,
      longitude: 153.0251,
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      buildingSize: 95,
      propertyType: "apartment",
      features: [
        "21st Floor",
        "River Views",
        "Gym",
        "Pool",
        "Concierge",
        "Air Conditioning",
      ],
    },
    price: "$720,000",
    priceValue: 720000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Stunning River Views from Premium High-Rise",
    description:
      "Impressive 2 bedroom apartment on the 21st floor of the iconic 108 Adelaide tower. Enjoy breathtaking river and city views, resort-style facilities, and a CBD lifestyle.",
    images: [
      "https://images.domain.com.au/img/brisbane-apt-1.jpg",
      "https://images.domain.com.au/img/brisbane-apt-2.jpg",
    ],
    agentName: "Emma Rodriguez",
    agentPhone: "0467 890 123",
    agencyName: "Place Estate Agents",
    listedDate: "2024-12-05",
    scrapedAt: now(),
  },
  // Brisbane - Suburbs (Growth area)
  {
    externalId: "domain-2019589012",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019589012",
    address: {
      streetNumber: "34",
      streetName: "Sunrise",
      streetType: "Crescent",
      suburb: "Springfield",
      state: "QLD",
      postcode: "4300",
      displayAddress: "34 Sunrise Crescent, Springfield QLD 4300",
      latitude: -27.6648,
      longitude: 152.9056,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 450,
      buildingSize: 220,
      propertyType: "house",
      features: [
        "Near Train Station",
        "Near Schools",
        "Modern Build",
        "Air Conditioning",
        "Alfresco Area",
      ],
    },
    price: "$685,000",
    priceValue: 685000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Modern Family Home in Growing Corridor",
    description:
      "Excellent opportunity in one of Brisbane's fastest-growing corridors. This modern 4 bedroom home is walking distance to Springfield Central station and Orion Shopping Centre. Perfect for families or investors.",
    images: ["https://images.domain.com.au/img/springfield-1.jpg"],
    agentName: "David Liu",
    agentPhone: "0478 901 234",
    agencyName: "RE/MAX Springfield",
    listedDate: "2024-11-28",
    scrapedAt: now(),
  },
  // Perth - Northern Suburbs
  {
    externalId: "domain-2019590123",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019590123",
    address: {
      streetNumber: "89",
      streetName: "Ocean",
      streetType: "Parade",
      suburb: "Scarborough",
      state: "WA",
      postcode: "6019",
      displayAddress: "89 Ocean Parade, Scarborough WA 6019",
      latitude: -31.8925,
      longitude: 115.758,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 380,
      buildingSize: 180,
      propertyType: "house",
      features: [
        "Ocean Views",
        "Renovated",
        "Walk to Beach",
        "Outdoor Entertaining",
        "Air Conditioning",
      ],
    },
    price: "$1,250,000 - $1,350,000",
    priceFrom: 1250000,
    priceTo: 1350000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Beachside Beauty with Ocean Views",
    description:
      "Stunning renovated home just steps from Scarborough Beach. Enjoy ocean views from the master bedroom and living areas. The revitalized Scarborough precinct offers restaurants, bars, and endless lifestyle options.",
    images: [
      "https://images.domain.com.au/img/scarborough-1.jpg",
      "https://images.domain.com.au/img/scarborough-2.jpg",
    ],
    agentName: "Sophie Taylor",
    agentPhone: "0489 012 345",
    agencyName: "Realmark Coastal",
    listedDate: "2024-12-12",
    auctionDate: "2025-01-11",
    inspectionTimes: ["Saturday 12:00pm - 12:30pm"],
    scrapedAt: now(),
  },
  // Adelaide - Inner Suburbs
  {
    externalId: "domain-2019591234",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019591234",
    address: {
      streetNumber: "17",
      streetName: "King William",
      streetType: "Street",
      suburb: "Unley",
      state: "SA",
      postcode: "5061",
      displayAddress: "17 King William Street, Unley SA 5061",
      latitude: -34.9505,
      longitude: 138.6034,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 700,
      buildingSize: 240,
      propertyType: "house",
      features: [
        "Character Home",
        "Large Garden",
        "Zoned Unley High",
        "Solar Panels",
        "Workshop",
      ],
    },
    price: "$1,100,000 - $1,200,000",
    priceFrom: 1100000,
    priceTo: 1200000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Character-Filled Family Home in Sought-After Location",
    description:
      "Beautiful sandstone villa in prestigious Unley. Features include high ceilings, ornate fireplaces, and a stunning rear garden. Zoned for Unley High School and moments from King William Road shops.",
    images: [
      "https://images.domain.com.au/img/unley-1.jpg",
      "https://images.domain.com.au/img/unley-2.jpg",
    ],
    agentName: "Robert Anderson",
    agentPhone: "0490 123 456",
    agencyName: "Harris Real Estate",
    listedDate: "2024-12-18",
    inspectionTimes: ["Saturday 2:00pm - 2:30pm", "Sunday 2:00pm - 2:30pm"],
    scrapedAt: now(),
  },
  // Adelaide - Investment Property
  {
    externalId: "domain-2019592345",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019592345",
    address: {
      streetNumber: "5/22",
      streetName: "Grote",
      streetType: "Street",
      suburb: "Adelaide",
      state: "SA",
      postcode: "5000",
      displayAddress: "5/22 Grote Street, Adelaide SA 5000",
      latitude: -34.9297,
      longitude: 138.5986,
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      buildingSize: 55,
      propertyType: "apartment",
      features: [
        "Currently Tenanted",
        "City Centre",
        "Secure Building",
        "Near Central Market",
      ],
    },
    price: "$340,000",
    priceValue: 340000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "High-Yielding CBD Investment",
    description:
      "Excellent investment opportunity in the heart of Adelaide CBD. Currently tenanted at $380/week (5.8% yield). Walking distance to Adelaide Central Market, Rundle Mall, and universities.",
    images: ["https://images.domain.com.au/img/adelaide-apt-1.jpg"],
    agentName: "Chris Martin",
    agentPhone: "0401 234 567",
    agencyName: "LJ Hooker Adelaide",
    listedDate: "2024-12-22",
    scrapedAt: now(),
  },
  // Hobart - Battery Point
  {
    externalId: "domain-2019593456",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019593456",
    address: {
      streetNumber: "8",
      streetName: "Hampden",
      streetType: "Road",
      suburb: "Battery Point",
      state: "TAS",
      postcode: "7004",
      displayAddress: "8 Hampden Road, Battery Point TAS 7004",
      latitude: -42.8897,
      longitude: 147.3341,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 420,
      buildingSize: 165,
      propertyType: "house",
      features: [
        "Heritage Listed",
        "Water Views",
        "Original Features",
        "Walk to Salamanca",
        "Garden",
      ],
    },
    price: "$1,750,000 - $1,900,000",
    priceFrom: 1750000,
    priceTo: 1900000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Historic Battery Point Cottage with Water Views",
    description:
      "Exquisite heritage cottage in prestigious Battery Point. Built in 1860, this lovingly restored home retains stunning original features while offering modern comforts. Glimpses of the Derwent River from the upper level.",
    images: [
      "https://images.domain.com.au/img/battery-point-1.jpg",
      "https://images.domain.com.au/img/battery-point-2.jpg",
    ],
    agentName: "Kate Williams",
    agentPhone: "0412 345 678",
    agencyName: "Petrusma Property",
    listedDate: "2024-12-14",
    inspectionTimes: ["Saturday 11:30am - 12:00pm"],
    scrapedAt: now(),
  },
  // Canberra
  {
    externalId: "domain-2019594567",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019594567",
    address: {
      streetNumber: "42",
      streetName: "National Circuit",
      streetType: "",
      suburb: "Forrest",
      state: "ACT",
      postcode: "2603",
      displayAddress: "42 National Circuit, Forrest ACT 2603",
      latitude: -35.3108,
      longitude: 149.1281,
    },
    features: {
      bedrooms: 5,
      bathrooms: 3,
      parkingSpaces: 3,
      landSize: 1200,
      buildingSize: 380,
      propertyType: "house",
      features: [
        "Heritage Listed",
        "Diplomatic Precinct",
        "Tennis Court",
        "Pool",
        "Separate Guest Quarters",
      ],
    },
    price: "Expressions of Interest",
    priceFrom: 3500000,
    priceTo: 4000000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Prestigious Forrest Residence in Diplomatic Precinct",
    description:
      "One of Canberra's most prestigious addresses. This grand home in the heart of Forrest offers exceptional living with tennis court, pool, and separate guest quarters. Perfect for entertaining on a grand scale.",
    images: [
      "https://images.domain.com.au/img/forrest-1.jpg",
      "https://images.domain.com.au/img/forrest-2.jpg",
      "https://images.domain.com.au/img/forrest-3.jpg",
    ],
    agentName: "Richard Hughes",
    agentPhone: "0423 456 789",
    agencyName: "Belle Property Canberra",
    listedDate: "2024-12-01",
    inspectionTimes: ["By Private Appointment"],
    scrapedAt: now(),
  },
  // Darwin
  {
    externalId: "domain-2019595678",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019595678",
    address: {
      streetNumber: "15",
      streetName: "Fannie Bay",
      streetType: "Place",
      suburb: "Fannie Bay",
      state: "NT",
      postcode: "0820",
      displayAddress: "15 Fannie Bay Place, Fannie Bay NT 0820",
      latitude: -12.4327,
      longitude: 130.8357,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      landSize: 850,
      buildingSize: 280,
      propertyType: "house",
      features: [
        "Tropical Design",
        "Pool",
        "Water Views",
        "Outdoor Kitchen",
        "Darwin Harbour Views",
      ],
    },
    price: "$1,450,000",
    priceValue: 1450000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Tropical Paradise with Harbour Views",
    description:
      "Stunning contemporary home designed for tropical living. Features include a spectacular pool, outdoor entertaining areas, and views over Darwin Harbour. A rare opportunity in tightly-held Fannie Bay.",
    images: [
      "https://images.domain.com.au/img/fannie-bay-1.jpg",
      "https://images.domain.com.au/img/fannie-bay-2.jpg",
    ],
    agentName: "Mark Johnston",
    agentPhone: "0434 567 890",
    agencyName: "Elders Real Estate Darwin",
    listedDate: "2024-12-10",
    inspectionTimes: [
      "Saturday 10:00am - 10:30am",
      "Wednesday 5:30pm - 6:00pm",
    ],
    scrapedAt: now(),
  },
  // Gold Coast
  {
    externalId: "domain-2019596789",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019596789",
    address: {
      streetNumber: "2501",
      streetName: "The Esplanade",
      streetType: "",
      suburb: "Surfers Paradise",
      state: "QLD",
      postcode: "4217",
      displayAddress: "2501/1 The Esplanade, Surfers Paradise QLD 4217",
      latitude: -28.0015,
      longitude: 153.4296,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      buildingSize: 165,
      propertyType: "apartment",
      features: [
        "Absolute Beachfront",
        "25th Floor",
        "Ocean Views",
        "Resort Facilities",
        "Fully Furnished",
      ],
    },
    price: "$2,150,000",
    priceValue: 2150000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Absolute Beachfront Luxury on the Esplanade",
    description:
      "Breathtaking ocean views from this premium beachfront apartment. Wake up to the sound of waves and enjoy world-class resort facilities. Fully furnished and ready to move in or rent out.",
    images: [
      "https://images.domain.com.au/img/surfers-1.jpg",
      "https://images.domain.com.au/img/surfers-2.jpg",
    ],
    agentName: "Jessica Brown",
    agentPhone: "0445 678 901",
    agencyName: "Ray White Surfers Paradise",
    listedDate: "2024-12-19",
    inspectionTimes: ["Saturday 12:00pm - 12:30pm"],
    scrapedAt: now(),
  },
  // Newcastle
  {
    externalId: "domain-2019597890",
    source: "DOMAIN",
    sourceUrl: "https://www.domain.com.au/2019597890",
    address: {
      streetNumber: "28",
      streetName: "Scott",
      streetType: "Street",
      suburb: "Newcastle",
      state: "NSW",
      postcode: "2300",
      displayAddress: "28 Scott Street, Newcastle NSW 2300",
      latitude: -32.9272,
      longitude: 151.7817,
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      landSize: 200,
      buildingSize: 120,
      propertyType: "townhouse",
      features: [
        "Walk to Beach",
        "Near Light Rail",
        "Courtyard",
        "Air Conditioning",
      ],
    },
    price: "$820,000 - $880,000",
    priceFrom: 820000,
    priceTo: 880000,
    listingType: "sale",
    listingStatus: "ON_MARKET",
    headline: "Inner City Living Minutes from the Beach",
    description:
      "Charming townhouse in the heart of Newcastle. Walk to Newcastle Beach, the foreshore, and all the cafes and restaurants the city has to offer. Perfect for young professionals or investors.",
    images: ["https://images.domain.com.au/img/newcastle-1.jpg"],
    agentName: "Tom Richards",
    agentPhone: "0456 789 012",
    agencyName: "PRD Newcastle",
    listedDate: "2024-12-17",
    inspectionTimes: ["Saturday 1:00pm - 1:30pm"],
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
  grossYield?: number;
  daysOnMarket?: number;
  annualGrowth?: number;
  fiveYearGrowth?: number;
}

export const mockSuburbStats: Record<string, MockSuburbStats> = {
  "bellevue-hill-nsw-2023": {
    suburb: "Bellevue Hill",
    state: "NSW",
    postcode: "2023",
    medianPrice: 5850000,
    medianRent: 2500,
    grossYield: 2.2,
    daysOnMarket: 45,
    annualGrowth: 4.5,
    fiveYearGrowth: 32.0,
  },
  "petersham-nsw-2049": {
    suburb: "Petersham",
    state: "NSW",
    postcode: "2049",
    medianPrice: 1725000,
    medianRent: 750,
    grossYield: 2.3,
    daysOnMarket: 28,
    annualGrowth: 5.2,
    fiveYearGrowth: 28.5,
  },
  "liverpool-nsw-2170": {
    suburb: "Liverpool",
    state: "NSW",
    postcode: "2170",
    medianPrice: 920000,
    medianRent: 550,
    grossYield: 3.1,
    daysOnMarket: 35,
    annualGrowth: 6.8,
    fiveYearGrowth: 42.0,
  },
  "fitzroy-vic-3065": {
    suburb: "Fitzroy",
    state: "VIC",
    postcode: "3065",
    medianPrice: 1485000,
    medianRent: 650,
    grossYield: 2.3,
    daysOnMarket: 32,
    annualGrowth: 3.8,
    fiveYearGrowth: 22.0,
  },
  "brighton-vic-3186": {
    suburb: "Brighton",
    state: "VIC",
    postcode: "3186",
    medianPrice: 3250000,
    medianRent: 1200,
    grossYield: 1.9,
    daysOnMarket: 38,
    annualGrowth: 5.0,
    fiveYearGrowth: 35.0,
  },
  "brisbane-city-qld-4000": {
    suburb: "Brisbane City",
    state: "QLD",
    postcode: "4000",
    medianPrice: 685000,
    medianRent: 580,
    grossYield: 4.4,
    daysOnMarket: 25,
    annualGrowth: 8.5,
    fiveYearGrowth: 45.0,
  },
  "springfield-qld-4300": {
    suburb: "Springfield",
    state: "QLD",
    postcode: "4300",
    medianPrice: 695000,
    medianRent: 520,
    grossYield: 3.9,
    daysOnMarket: 22,
    annualGrowth: 12.5,
    fiveYearGrowth: 65.0,
  },
  "scarborough-wa-6019": {
    suburb: "Scarborough",
    state: "WA",
    postcode: "6019",
    medianPrice: 1150000,
    medianRent: 680,
    grossYield: 3.1,
    daysOnMarket: 28,
    annualGrowth: 15.0,
    fiveYearGrowth: 58.0,
  },
  "unley-sa-5061": {
    suburb: "Unley",
    state: "SA",
    postcode: "5061",
    medianPrice: 1180000,
    medianRent: 620,
    grossYield: 2.7,
    daysOnMarket: 30,
    annualGrowth: 7.5,
    fiveYearGrowth: 38.0,
  },
  "adelaide-sa-5000": {
    suburb: "Adelaide",
    state: "SA",
    postcode: "5000",
    medianPrice: 520000,
    medianRent: 450,
    grossYield: 4.5,
    daysOnMarket: 28,
    annualGrowth: 9.0,
    fiveYearGrowth: 42.0,
  },
  "battery-point-tas-7004": {
    suburb: "Battery Point",
    state: "TAS",
    postcode: "7004",
    medianPrice: 1650000,
    medianRent: 750,
    grossYield: 2.4,
    daysOnMarket: 42,
    annualGrowth: 5.5,
    fiveYearGrowth: 48.0,
  },
  "forrest-act-2603": {
    suburb: "Forrest",
    state: "ACT",
    postcode: "2603",
    medianPrice: 3200000,
    medianRent: 1400,
    grossYield: 2.3,
    daysOnMarket: 55,
    annualGrowth: 4.0,
    fiveYearGrowth: 28.0,
  },
  "fannie-bay-nt-0820": {
    suburb: "Fannie Bay",
    state: "NT",
    postcode: "0820",
    medianPrice: 1350000,
    medianRent: 850,
    grossYield: 3.3,
    daysOnMarket: 48,
    annualGrowth: 2.5,
    fiveYearGrowth: 12.0,
  },
  "surfers-paradise-qld-4217": {
    suburb: "Surfers Paradise",
    state: "QLD",
    postcode: "4217",
    medianPrice: 750000,
    medianRent: 650,
    grossYield: 4.5,
    daysOnMarket: 35,
    annualGrowth: 10.5,
    fiveYearGrowth: 52.0,
  },
  "newcastle-nsw-2300": {
    suburb: "Newcastle",
    state: "NSW",
    postcode: "2300",
    medianPrice: 1050000,
    medianRent: 580,
    grossYield: 2.9,
    daysOnMarket: 30,
    annualGrowth: 7.0,
    fiveYearGrowth: 40.0,
  },
};

// Mock sales history
export interface MockSaleRecord {
  saleDate: string;
  salePrice: number;
  saleType?: string;
}

export const mockSalesHistory: Record<string, MockSaleRecord[]> = {
  "45-bellevue-road-bellevue-hill-nsw": [
    { saleDate: "2018-05-12", salePrice: 6500000, saleType: "auction" },
    { saleDate: "2012-08-20", salePrice: 4200000, saleType: "private treaty" },
    { saleDate: "2005-11-05", salePrice: 2800000, saleType: "auction" },
  ],
  "12-palace-street-petersham-nsw": [
    { saleDate: "2019-03-15", salePrice: 1450000, saleType: "auction" },
    { saleDate: "2014-07-22", salePrice: 1050000, saleType: "private treaty" },
  ],
  "23-argyle-street-fitzroy-vic": [
    { saleDate: "2020-11-28", salePrice: 1280000, saleType: "auction" },
    { saleDate: "2016-02-14", salePrice: 985000, saleType: "auction" },
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
  "michael-chen-12345": {
    id: "michael-chen-12345",
    name: "Michael Chen",
    email: "michael.chen@raywhite.com",
    phone: "0412 345 678",
    photoUrl: "https://images.domain.com.au/agents/michael-chen.jpg",
    agencyName: "Ray White Double Bay",
    salesCount: 156,
    rating: 4.8,
  },
  "sarah-wilson-23456": {
    id: "sarah-wilson-23456",
    name: "Sarah Wilson",
    email: "sarah.wilson@mcgrath.com.au",
    phone: "0423 456 789",
    photoUrl: "https://images.domain.com.au/agents/sarah-wilson.jpg",
    agencyName: "McGrath Inner West",
    salesCount: 89,
    rating: 4.9,
  },
  "james-obrien-34567": {
    id: "james-obrien-34567",
    name: "James O'Brien",
    email: "james.obrien@jelliscraig.com.au",
    phone: "0445 678 901",
    photoUrl: "https://images.domain.com.au/agents/james-obrien.jpg",
    agencyName: "Jellis Craig Fitzroy",
    salesCount: 124,
    rating: 4.7,
  },
};

// Mock auction results
export interface MockAuctionResult {
  address: string;
  auctionDate: string;
  result: string;
  guidePrice?: number;
  soldPrice?: number;
}

export const mockAuctionResults: Record<string, MockAuctionResult[]> = {
  "bellevue-hill-nsw": [
    {
      address: "23 Bellevue Road, Bellevue Hill",
      auctionDate: "2024-12-14",
      result: "sold_at_auction",
      guidePrice: 7000000,
      soldPrice: 7850000,
    },
    {
      address: "8 Victoria Road, Bellevue Hill",
      auctionDate: "2024-12-14",
      result: "passed_in",
      guidePrice: 5500000,
    },
    {
      address: "112 Bellevue Road, Bellevue Hill",
      auctionDate: "2024-12-07",
      result: "sold_before_auction",
      guidePrice: 4200000,
      soldPrice: 4350000,
    },
  ],
  "petersham-nsw": [
    {
      address: "45 New Canterbury Road, Petersham",
      auctionDate: "2024-12-14",
      result: "sold_at_auction",
      guidePrice: 1400000,
      soldPrice: 1520000,
    },
    {
      address: "18 Palace Street, Petersham",
      auctionDate: "2024-12-07",
      result: "sold_at_auction",
      guidePrice: 1600000,
      soldPrice: 1685000,
    },
  ],
  "fitzroy-vic": [
    {
      address: "56 Gore Street, Fitzroy",
      auctionDate: "2024-12-14",
      result: "sold_at_auction",
      guidePrice: 1200000,
      soldPrice: 1345000,
    },
    {
      address: "23 Napier Street, Fitzroy",
      auctionDate: "2024-12-14",
      result: "passed_in",
      guidePrice: 1800000,
    },
    {
      address: "89 Brunswick Street, Fitzroy",
      auctionDate: "2024-12-07",
      result: "sold_after_auction",
      guidePrice: 2200000,
      soldPrice: 2150000,
    },
  ],
  "brighton-vic": [
    {
      address: "45 Bay Street, Brighton",
      auctionDate: "2024-12-14",
      result: "sold_at_auction",
      guidePrice: 3500000,
      soldPrice: 3920000,
    },
    {
      address: "12 Church Street, Brighton",
      auctionDate: "2024-12-07",
      result: "sold_at_auction",
      guidePrice: 2800000,
      soldPrice: 3050000,
    },
  ],
  "springfield-qld": [
    {
      address: "15 Parkway Crescent, Springfield",
      auctionDate: "2024-12-14",
      result: "sold_at_auction",
      guidePrice: 650000,
      soldPrice: 695000,
    },
  ],
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
 * Get mock auction results by suburb
 */
export function getMockAuctionResults(
  suburb: string,
  state: AustralianState,
): MockAuctionResult[] {
  const key = `${suburb.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
  return mockAuctionResults[key] || [];
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
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.MCP_MOCK_MODE === "true";
}
