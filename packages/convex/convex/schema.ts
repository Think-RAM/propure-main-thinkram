// packages/convex/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v, Infer } from "convex/values";

// Enum validators
export const strategyType = v.union(
  v.literal("CASH_FLOW"),
  v.literal("CAPITAL_GROWTH"),
  v.literal("RENOVATION_FLIP"),
  v.literal("DEVELOPMENT"),
  v.literal("SMSF"),
  v.literal("COMMERCIAL"),
);

export type StrategyType = Infer<typeof strategyType>;

export const strategyStatus = v.union(
  v.literal("DISCOVERY"),
  v.literal("ACTIVE"),
  v.literal("PAUSED"),
  v.literal("COMPLETED"),
  v.literal("ARCHIVED"),
);

export type StrategyStatus = Infer<typeof strategyStatus>;

export const australianState = v.union(
  v.literal("NSW"),
  v.literal("VIC"),
  v.literal("QLD"),
  v.literal("WA"),
  v.literal("SA"),
  v.literal("TAS"),
  v.literal("NT"),
  v.literal("ACT"),
);

export type AustralianState = Infer<typeof australianState>;

export const propertyType = v.union(
  v.literal("house"),
  v.literal("apartment"),
  v.literal("unit"),
  v.literal("townhouse"),
  v.literal("villa"),
  v.literal("land"),
  v.literal("rural"),
  v.literal("commercial"),
  v.literal("industrial"),
  v.literal("other"),
);

export const listingType = v.union(
  v.literal("sale"),
  v.literal("rent"),
  v.literal("sold"),
);

export const dataSource = v.union(
  v.literal("DOMAIN"),
  v.literal("REALESTATE"),
  v.literal("CORELOGIC"),
  v.literal("ABS"),
  v.literal("RBA"),
  v.literal("MANUAL"),
);

export const listingStatus = v.union(
  // v.literal("ACTIVE"),
  // v.literal("UNDER_CONTRACT"),
  v.literal("SOLD"),
  v.literal("ON_MARKET"),
  // v.literal("WITHDRAWN"),
  v.literal("OFF_MARKET"),
);

export const soldAt = v.union(
  v.literal("AUCTION"),
  v.literal("PRIVATE_TREATY"),
  // v.literal("OFF_MARKET"),
  v.literal("OTHER"),
  v.literal("PRIOR_TO_AUCTION"),
);

export type SoldAt = Infer<typeof soldAt>;

export type PropertyType = Infer<typeof propertyType>;
export type ListingType = Infer<typeof listingType>;
export type DataSource = Infer<typeof dataSource>;
export type ListingStatus = Infer<typeof listingStatus>;

export default defineSchema({
  // files: defineTable({
  //   storageId: v.id("_storage"),
  //   fileName: v.optional(v.string()),
  //   url: v.optional(v.string()),
  //   createdAt: v.float64(),
  //   updatedAt: v.float64(),
  // }).index("by_source", ["source"]),

  // ── Users ──
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Chat Sessions
  chatSessions: defineTable({
    sessionId: v.string(),
    userId: v.id("users"),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    title: v.optional(v.string()),
    strategyId: v.optional(v.id("strategies")),
    chatMessages: v.array(v.id("chatMessages")),
  })
    .index("by_user", ["userId"])
    .index("by_session_id", ["sessionId"])
    .index("by_updated_at", ["updatedAt"]),

  // Chat Messages
  chatMessages: defineTable({
    messageId: v.string(),
    sessionId: v.string(),
    role: v.string(),
    content: v.any(),
    toolCalls: v.optional(v.any()),
    toolResults: v.optional(v.any()),
    timestamp: v.float64(),
    createdAt: v.float64(),
  })
    .index("by_session", ["sessionId"])
    .index("by_created_at", ["createdAt"])
    .index("by_message_id", ["messageId"]),

  // ── Strategies ──
  strategies: defineTable({
    userId: v.id("users"),
    type: strategyType,
    status: strategyStatus,
    params: v.optional(v.any()),
    budget: v.optional(v.float64()),
    deposit: v.optional(v.float64()),
    income: v.optional(v.float64()),
    riskTolerance: v.optional(v.string()),
    timeline: v.optional(v.string()),
    managementStyle: v.optional(v.string()),

    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // ── Saved Searches ──
  savedSearches: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    filters: v.any(),
    results: v.optional(v.any()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("by_user", ["userId"]),

  // ── Location Hierarchy ──
  states: defineTable({
    name: v.string(),
    code: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  cities: defineTable({
    stateId: v.id("states"),
    name: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_state", ["stateId"])
    .index("by_state_name", ["stateId", "name"]),

  suburbs: defineTable({
    cityId: v.id("cities"),
    name: v.string(),
    postcode: v.string(),
    centroidLat: v.optional(v.float64()),
    centroidLng: v.optional(v.float64()),
    boundaryGeoJson: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_city", ["cityId"])
    .index("by_postcode", ["postcode"])
    .index("by_city_name_postcode", ["cityId", "name", "postcode"])
    .index("by_centroid_lat", ["centroidLat"]),

  scrapping_locations: defineTable({
    state: australianState,
    suburb: v.string(),
    postcode: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_state", ["state"])
    .index("by_state_suburb", ["state", "suburb"])
    .index("by_postcode", ["postcode"]),

  // SA2 Geocodes
  sa2Geocodes: defineTable({
    suburb: v.string(),
    state: australianState,
    sa2Code: v.string(),
    sa2Name: v.string(),
    longitude: v.optional(v.float64()),
    latitude: v.optional(v.float64()),
    createdAt: v.float64(),
  })
    .index("by_sa2_code", ["sa2Code"])
    .index("by_suburb_state", ["suburb", "state"]),

  // ABS Building Approvals (normalized relation to sa2Geocodes)
  absBuildingApprovals: defineTable({
    sa2Id: v.optional(v.id("sa2Geocodes")), // reference to sa2Geocodes when available
    month: v.string(), // 'YYYY-MM'
    totalApprovals: v.float64(),
    houseApprovals: v.float64(),
    apartmentApprovals: v.float64(),
    observationValue: v.float64(),
    source: v.optional(dataSource), // e.g. 'ABS' or 'MANUAL'
    isEstimate: v.optional(v.boolean()),
    scrapedAt: v.float64(),
    createdAt: v.float64(),
    extra: v.optional(v.any()), // optional raw payload or parsing metadata
  })
    .index("by_sa2_month", ["sa2Id", "month"])
    .index("by_month", ["month"])
    .index("by_source", ["source"]),

  // ABS Population Projections
  absPopulationProjections: defineTable({
    state: australianState,
    year: v.float64(), // 2024..2040
    projectedPopulation: v.float64(),
    growthRate: v.float64(), // percent, e.g. 1.5
    source: v.optional(dataSource), // 'ABS' or 'MANUAL'
    recordedAt: v.float64(), // epoch ms
    createdAt: v.float64(),
    extra: v.optional(v.any()), // raw parsed row / metadata
  })
    .index("by_state_year", ["state", "year"])
    .index("by_state", ["state"])
    .index("by_year", ["year"])
    .index("by_source", ["source"]),

  // ── Properties ──
  properties: defineTable({
    externalId: v.string(),
    source: dataSource,
    sourceUrl: v.optional(v.string()),

    // Structured address matching PropertyAddressSchema
    address: v.object({
      streetNumber: v.optional(v.string()),
      streetName: v.optional(v.string()),
      streetType: v.optional(v.string()),
      suburb: v.string(),
      state: australianState,
      postcode: v.string(),
      displayAddress: v.string(),
      latitude: v.optional(v.float64()),
      longitude: v.optional(v.float64()),
    }),

    // Structured features matching PropertyFeaturesSchema
    features: v.optional(
      v.object({
        bedrooms: v.optional(v.float64()),
        bathrooms: v.optional(v.float64()),
        parkingSpaces: v.optional(v.float64()), // renamed from carSpaces
        landSize: v.optional(v.float64()),
        buildingSize: v.optional(v.float64()),
        propertyType: v.optional(propertyType),
        features: v.optional(v.array(v.string())),
      }),
    ),

    // Price fields (display price as string to match shared schema)
    price: v.optional(v.string()),
    priceValue: v.optional(v.float64()),
    priceFrom: v.optional(v.float64()),
    priceTo: v.optional(v.float64()),

    listingType: listingType,
    listingStatus: v.optional(listingStatus),

    //sold related fields
    soldDate: v.optional(v.string()), // ISO date string to match shared schema
    soldPrice: v.optional(v.float64()),
    soldAt: v.optional(soldAt),

    daysOnMarket: v.optional(v.int64()),
    propertyValueEstimate: v.optional(
      v.object({
        low: v.optional(v.float64()),
        mid: v.optional(v.float64()),
        high: v.optional(v.float64()),
      }),
    ),

    propertyRentEstimate: v.optional(v.float64()),

    headline: v.optional(v.string()),
    description: v.optional(v.string()),

    images: v.optional(v.array(v.string())),

    agentName: v.optional(v.string()),
    agentPhone: v.optional(v.string()),
    agencyName: v.optional(v.string()),

    // Dates as ISO strings (matching shared schema naming)
    listedDate: v.optional(v.string()),
    auctionDate: v.optional(v.string()),

    inspectionTimes: v.optional(v.array(v.string())),
    scrapedAt: v.optional(v.string()),
    // Convenience top-level suburb for indexing/searching
    addressSuburb: v.optional(v.string()),

    // Metadata
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_listing_type", ["listingType"])
    .index("by_listing_status", ["listingStatus"])
    .index("by_source", ["source"])
    .index("by_address_suburb", ["addressSuburb"])
    .index("by_created_at", ["createdAt"]),

  // ── Suburb Metrics ──
  suburbMetrics: defineTable({
    // suburbId: v.id("suburbs"),
    postcode: v.string(),
    centerLat: v.float64(),
    centerLng: v.float64(),
    metrics: v.object({
      typicalValue: v.number(),
      medianValue: v.number(),
      averageDaysOnMarket: v.number(),
      auctionClearanceRate: v.number(),
      renterProportion: v.number(),
      vacancyRate: v.number(),
      netYield: v.number(),
      stockOnMarket: v.number(),
      capitalGrowthScore: v.number(),
      riskScore: v.number(),
      cashFlowScore: v.number(),
      risk: v.object({
        marketRisk: v.number(),
        financialRisk: v.number(),
        liquidityRisk: v.number(),
        concentrationRisk: v.number(),
      }),
      dataCompletenessScore: v.number(),
    }),
    geometry: v.object({
      center: v.object({
        lat: v.float64(),
        lng: v.float64(),
      }),
      boundary: v.object({
        northeast: v.object({
          lat: v.float64(),
          lng: v.float64(),
        }),
        southwest: v.object({
          lat: v.float64(),
          lng: v.float64(),
        }),
      }),
    }),
    recordedAt: v.float64(),
    createdAt: v.float64(),
  })
    .index("by_postcode", ["postcode"])
    .index("by_lat_lng", ["centerLat", "centerLng"]),

  // ── Real Estate Agents (renamed from Agent to avoid AI Agent confusion) ──
  realEstateAgents: defineTable({
    externalId: v.optional(v.string()),
    source: dataSource,
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    agencyId: v.optional(v.id("agencies")),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_agency", ["agencyId"])
    .index("by_source", ["source"]),

  // ── Agencies ──
  agencies: defineTable({
    externalId: v.optional(v.string()),
    source: dataSource,
    name: v.string(),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_source", ["source"]),

  // ── Price History ──
  priceHistory: defineTable({
    propertyId: v.id("properties"),
    price: v.optional(v.float64()),
    priceType: v.string(),
    priceText: v.optional(v.string()),
    recordedAt: v.float64(),
    source: dataSource,
    createdAt: v.float64(),
  })
    .index("by_property", ["propertyId"])
    .index("by_recorded_at", ["recordedAt"])
    .index("by_price_type", ["priceType"]),

  // ── Sale Records ──
  saleRecords: defineTable({
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.optional(v.string()),
    saleDate: v.float64(),
    salePrice: v.float64(),
    saleType: v.string(),
    source: dataSource,
    sourceUrl: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index("by_suburb_state", ["suburb", "state"])
    .index("by_sale_date", ["saleDate"])
    .index("by_source", ["source"]),

  // ── Auction Results ──
  auctionResults: defineTable({
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.optional(v.string()),
    auctionDate: v.float64(),
    result: v.string(),
    guidePrice: v.optional(v.float64()),
    soldPrice: v.optional(v.float64()),
    bidderCount: v.optional(v.float64()),
    source: dataSource,
    createdAt: v.float64(),
  })
    .index("by_suburb_state", ["suburb", "state"])
    .index("by_auction_date", ["auctionDate"])
    .index("by_result", ["result"]),

  // ── Infrastructure Projects ──
  infrastructureProjects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    status: v.string(),
    state: v.string(),
    suburbs: v.array(v.string()),
    estimatedCost: v.optional(v.float64()),
    completionDate: v.optional(v.float64()),
    sourceUrl: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_state", ["state"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // ── Market Indicators ──
  marketIndicators: defineTable({
    indicatorType: v.string(),
    scope: v.string(),
    value: v.float64(),
    unit: v.optional(v.string()),
    recordedAt: v.float64(),
    source: dataSource,
    createdAt: v.float64(),
  })
    .index("by_type", ["indicatorType"])
    .index("by_scope", ["scope"])
    .index("by_type_scope", ["indicatorType", "scope"])
    .index("by_type_scope_time", ["indicatorType", "scope", "recordedAt"]),

  // ABS Market Data (broken-out MarketDataSchema columns)
  absMarketData: defineTable({
    // sa2Id and sa2Code removed per request (no SA2 relation)
    census_year: v.int64(), // e.g. 2021
    postcode: v.optional(v.string()),
    suburb: v.optional(v.string()),
    lga: v.optional(v.string()),
    state: v.optional(australianState),

    // Canonical top-level metrics (if available)
    // population: v.optional(v.float64()),
    // medianAge: v.optional(v.float64()),
    // medianWeeklyIncome: v.optional(v.float64()),
    // medianMonthlyMortgage: v.optional(v.float64()),
    // // medianWeeklyRent: v.optional(v.float64()),
    ownerOccupied: v.optional(v.float64()),
    rented: v.optional(v.float64()),
    // unemploymentRate: v.optional(v.float64()),

    // Breakdown columns (arrays of small objects)
    people: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    maritalStatus: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    education: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    laborForce: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    employmentStatus: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    occupationTopResponses: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    industryTopResponses: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    medianWeeklyIncomes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    methodOfTravelToWork: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    familyComposition: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    dwellingStructure: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    numberOfBedrooms: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    tenureType: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    rentWeeklyPayments: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),
    mortgageMonthlyRepayments: v.optional(
      v.array(
        v.object({
          label: v.string(),
          count: v.float64(),
          percentage: v.optional(v.float64()),
        }),
      ),
    ),

    // Full validated marketData (from shared MarketDataSchema) and raw/debug
    marketData: v.optional(v.any()),
    url: v.optional(v.string()),
    referencePath: v.optional(v.string()),
    source: v.optional(dataSource),
    scrapedAt: v.float64(),
    createdAt: v.float64(),
    extra: v.optional(v.any()),

    totalPopulation: v.optional(v.float64()),
    medianAge: v.optional(v.float64()),
    populationGrowth: v.optional(v.float64()), // YoY %
    malePercentage: v.optional(v.float64()),
    femalePercentage: v.optional(v.float64()),

    medianWeeklyPersonalIncome: v.optional(v.float64()),
    medianWeeklyHouseholdIncome: v.optional(v.float64()),
    medianWeeklyFamilyIncome: v.optional(v.float64()),
    medianMonthlyMortgageRepayment: v.optional(v.float64()),
    medianWeeklyRent: v.optional(v.float64()),
  })
    .index("by_postcode", ["postcode"])
    .index("by_state", ["state"])
    .index("by_scraped_at", ["scrapedAt"]),
});
