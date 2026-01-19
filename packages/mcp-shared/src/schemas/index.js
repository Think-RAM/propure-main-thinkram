import { z } from "zod";
// Australian states enum
export const AustralianState = z.enum([
    "NSW",
    "VIC",
    "QLD",
    "WA",
    "SA",
    "TAS",
    "NT",
    "ACT",
]);
// Data source enum
export const DataSource = z.enum([
    "DOMAIN",
    "REALESTATE",
    "CORELOGIC",
    "ABS",
    "RBA",
    "MANUAL",
]);
// Listing status
export const ListingStatus = z.enum([
    "ACTIVE",
    "UNDER_CONTRACT", // Aligned with Prisma schema
    "SOLD",
    "WITHDRAWN",
    "OFF_MARKET",
]);
// Property types
export const PropertyType = z.enum([
    "house",
    "apartment",
    "unit",
    "townhouse",
    "villa",
    "land",
    "rural",
    "commercial",
    "other",
]);
// Listing type
export const ListingType = z.enum(["sale", "rent", "sold"]);
// Property address schema
export const PropertyAddressSchema = z.object({
    streetNumber: z.string().optional(),
    streetName: z.string().optional(),
    streetType: z.string().optional(),
    suburb: z.string(),
    state: AustralianState,
    postcode: z.string(),
    displayAddress: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});
// Property features schema
export const PropertyFeaturesSchema = z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    parkingSpaces: z.number().optional(),
    landSize: z.number().optional(), // sqm
    buildingSize: z.number().optional(), // sqm
    propertyType: PropertyType.optional(),
    features: z.array(z.string()).optional(),
});
// Property listing schema
export const PropertyListingSchema = z.object({
    externalId: z.string(),
    source: DataSource,
    sourceUrl: z.string().optional(),
    address: PropertyAddressSchema,
    features: PropertyFeaturesSchema.optional(),
    price: z.string().optional(), // Display price like "$1,200,000" or "$800 - $900 pw"
    priceValue: z.number().optional(), // Numeric price when available
    priceFrom: z.number().optional(),
    priceTo: z.number().optional(),
    listingType: ListingType,
    listingStatus: ListingStatus.optional(),
    headline: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    agentName: z.string().optional(),
    agentPhone: z.string().optional(),
    agencyName: z.string().optional(),
    listedDate: z.string().optional(),
    auctionDate: z.string().optional(),
    inspectionTimes: z.array(z.string()).optional(),
    scrapedAt: z.string(),
});
// Search parameters schema
export const PropertySearchParamsSchema = z.object({
    suburbs: z.array(z.string()).optional(),
    state: AustralianState.optional(),
    postcode: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBeds: z.number().optional(),
    maxBeds: z.number().optional(),
    minBaths: z.number().optional(),
    propertyTypes: z.array(PropertyType).optional(),
    listingType: ListingType.default("sale"),
    includesSurrounding: z.boolean().optional(),
    // pageSize: z.number().default(20),
    page: z.number().default(1),
});
// Search results schema
export const PropertySearchResultsSchema = z.object({
    listings: z.array(PropertyListingSchema),
    totalCount: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
});
// Suburb statistics schema
export const SuburbStatsSchema = z.object({
    suburb: z.string(),
    state: AustralianState,
    postcode: z.string(),
    source: DataSource,
    medianPrice: z.number().optional(),
    medianRent: z.number().optional(),
    grossYield: z.number().optional(),
    vacancyRate: z.number().optional(),
    daysOnMarket: z.number().optional(),
    annualGrowth: z.number().optional(),
    fiveYearGrowth: z.number().optional(),
    population: z.number().optional(),
    medianIncome: z.number().optional(),
    ownerOccupied: z.number().optional(), // percentage
    renters: z.number().optional(), // percentage
    updatedAt: z.string(),
});
// Agent schema
export const AgentSchema = z.object({
    externalId: z.string(),
    source: DataSource,
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    photoUrl: z.string().optional(),
    agencyId: z.string().optional(),
    agencyName: z.string().optional(),
    profileUrl: z.string().optional(),
    salesCount: z.number().optional(),
    reviewsCount: z.number().optional(),
    rating: z.number().optional(),
});
// Agency schema
export const AgencySchema = z.object({
    externalId: z.string(),
    source: DataSource,
    name: z.string(),
    logoUrl: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    profileUrl: z.string().optional(),
    activeListings: z.number().optional(),
    soldListings: z.number().optional(),
});
// Sale record schema
export const SaleRecordSchema = z.object({
    externalId: z.string().optional(),
    source: DataSource,
    address: z.string(),
    suburb: z.string(),
    state: AustralianState,
    postcode: z.string(),
    propertyType: PropertyType.optional(),
    saleDate: z.string(),
    salePrice: z.number(),
    saleType: z.string().optional(), // "auction", "private treaty", etc.
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    landSize: z.number().optional(),
});
// Auction result schema
export const AuctionResultSchema = z.object({
    externalId: z.string().optional(),
    source: DataSource,
    address: z.string(),
    suburb: z.string(),
    state: AustralianState,
    auctionDate: z.string(),
    result: z.enum([
        "sold_at_auction",
        "sold_before_auction",
        "sold_after_auction",
        "passed_in",
        "withdrawn",
    ]),
    guidePrice: z.number().optional(),
    soldPrice: z.number().optional(),
    propertyType: PropertyType.optional(),
});
// Market indicator schema (RBA, ABS data)
export const MarketIndicatorSchema = z.object({
    indicatorType: z.string(), // "cash_rate", "unemployment", "building_approvals", etc.
    scope: z.string(), // "national", "NSW", "Sydney", etc.
    value: z.number(),
    unit: z.string().optional(), // "%", "AUD", "count", etc.
    recordedAt: z.string(),
    source: DataSource,
});
// Infrastructure project schema
export const InfrastructureProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum([
        "transport",
        "health",
        "education",
        "commercial",
        "residential",
        "other",
    ]),
    status: z.enum(["announced", "planning", "construction", "completed"]),
    state: AustralianState,
    suburbs: z.array(z.string()).optional(),
    estimatedCost: z.number().optional(),
    completionDate: z.string().optional(),
    description: z.string().optional(),
    sourceUrl: z.string().optional(),
});
