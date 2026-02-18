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
export type AustralianState = z.infer<typeof AustralianState>;

// Data source enum
export const DataSource = z.enum([
  "DOMAIN",
  "REALESTATE",
  "CORELOGIC",
  "ABS",
  "RBA",
  "MANUAL",
]);
export type DataSource = z.infer<typeof DataSource>;

// Listing status
export const ListingStatus = z.enum([
  // "ACTIVE",
  // "UNDER_CONTRACT", // Aligned with Prisma schema
  "SOLD",
  // "WITHDRAWN",
  "OFF_MARKET",
  "ON_MARKET",
]);
export type ListingStatus = z.infer<typeof ListingStatus>;

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
export type PropertyType = z.infer<typeof PropertyType>;

// Listing type
export const ListingType = z.enum(["sale", "rent", "sold"]);
export type ListingType = z.infer<typeof ListingType>;

export const SoldAt = z.enum([
  "AUCTION",
  "PRIVATE_TREATY",
  "OTHER",
  "PRIOR_TO_AUCTION",
]);
export type SoldAt = z.infer<typeof SoldAt>;

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
export type PropertyAddress = z.infer<typeof PropertyAddressSchema>;

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
export type PropertyFeatures = z.infer<typeof PropertyFeaturesSchema>;

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

  //sold details
  soldDate: z.string().optional(),
  soldPrice: z.number().optional(),
  soldAt: SoldAt.optional(),

  //from property profile
  daysOnMarket: z.number().optional(),
  propertyValueEstimate: z
    .object({
      low: z.number().optional(),
      mid: z.number().optional(),
      high: z.number().optional(),
    })
    .optional(),
  propertyRentEstimate: z.number().optional(),

  listedDate: z.string().optional(),
  auctionDate: z.string().optional(),
  inspectionTimes: z.array(z.string()).optional(),
  scrapedAt: z.string(),
});
export type PropertyListing = z.infer<typeof PropertyListingSchema>;

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
  // maxPages: z.number().optional().default(50),
});
export type PropertySearchParams = z.infer<typeof PropertySearchParamsSchema>;

// Search results schema
export const PropertySearchResultsSchema = z.object({
  listings: z.array(PropertyListingSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
});
export type PropertySearchResults = z.infer<typeof PropertySearchResultsSchema>;

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
export type SuburbStats = z.infer<typeof SuburbStatsSchema>;

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
export type Agent = z.infer<typeof AgentSchema>;

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
export type Agency = z.infer<typeof AgencySchema>;

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
export type SaleRecord = z.infer<typeof SaleRecordSchema>;

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
export type AuctionResult = z.infer<typeof AuctionResultSchema>;

// Market indicator schema (RBA, ABS data)
export const MarketIndicatorSchema = z.object({
  indicatorType: z.string(), // "cash_rate", "unemployment", "building_approvals", etc.
  scope: z.string(), // "national", "NSW", "Sydney", etc.
  value: z.number(),
  unit: z.string().optional(), // "%", "AUD", "count", etc.
  recordedAt: z.string(),
  source: DataSource,
});
export type MarketIndicator = z.infer<typeof MarketIndicatorSchema>;

export const BreakdownEntrySchema = z.object({
  label: z.string(),
  count: z.number(),
  percentage: z.number().optional(),
});
export type BreakdownEntry = z.infer<typeof BreakdownEntrySchema>;

export const MarketDataSchema = z.object({
  rented: z.number(),
  ownerOccupied: z.number(),
  census_year: z.number(), // Year of the ABS census data (e.g. 2021)
  people: z.array(BreakdownEntrySchema),
  maritalStatus: z.array(BreakdownEntrySchema),
  education: z.array(BreakdownEntrySchema),
  laborForce: z.array(BreakdownEntrySchema),
  employmentStatus: z.array(BreakdownEntrySchema),
  occupationTopResponses: z.array(BreakdownEntrySchema),
  industryTopResponses: z.array(BreakdownEntrySchema),
  medianWeeklyIncomes: z.array(BreakdownEntrySchema),
  methodOfTravelToWork: z.array(BreakdownEntrySchema),
  familyComposition: z.array(BreakdownEntrySchema),
  dwellingStructure: z.array(BreakdownEntrySchema),
  numberOfBedrooms: z.array(BreakdownEntrySchema),
  tenureType: z.array(BreakdownEntrySchema),
  rentWeeklyPayments: z.array(BreakdownEntrySchema),
  mortgageMonthlyRepayments: z.array(BreakdownEntrySchema),
  // Additional ABS summary fields
  totalPopulation: z.number().optional(),
  medianAge: z.number().optional(),
  populationGrowth: z.number().optional(), // YoY %
  malePercentage: z.number().optional(),
  femalePercentage: z.number().optional(),

  medianWeeklyPersonalIncome: z.number().optional(),
  medianWeeklyHouseholdIncome: z.number().optional(),
  medianWeeklyFamilyIncome: z.number().optional(),
  medianMonthlyMortgageRepayment: z.number().optional(),
  medianWeeklyRent: z.number().optional(),
});
export type MarketData = z.infer<typeof MarketDataSchema>;

export type PeopleBreakdown = Array<BreakdownEntry>;
export type MaritalStatusBreakdown = Array<BreakdownEntry>;
export type EducationLevelBreakdown = Array<BreakdownEntry>;
export type LaborForceBreakdown = Array<BreakdownEntry>;
export type EmploymentStatusBreakdown = Array<BreakdownEntry>;
export type OccupationTopResponses = Array<BreakdownEntry>;
export type IndustryTopResponses = Array<BreakdownEntry>;
export type MedianWeeklyIncomes = Array<BreakdownEntry>;
export type MethodOfTravelToWork = Array<BreakdownEntry>;
export type FamilyComposition = Array<BreakdownEntry>;
export type DwellingStructure = Array<BreakdownEntry>;
export type NumberOfBedrooms = Array<BreakdownEntry>;
export type TenureType = Array<BreakdownEntry>;
export type RentWeeklyPayments = Array<BreakdownEntry>;
export type MortgageMonthlyRepayments = Array<BreakdownEntry>;

// Population projection schema (ABS)
export const AbsPopulationProjectionSchema = z.object({
  // suburb: z.string(),
  state: AustralianState,
  year: z.number(), // 2024-2040
  projectedPopulation: z.number(),
  growthRate: z.number(), // % change from previous year
});
export type AbsPopulationProjection = z.infer<
  typeof AbsPopulationProjectionSchema
>;

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
export type InfrastructureProject = z.infer<typeof InfrastructureProjectSchema>;
