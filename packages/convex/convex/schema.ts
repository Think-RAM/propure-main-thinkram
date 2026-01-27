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

const propertyType = v.union(
  v.literal("HOUSE"),
  v.literal("APARTMENT"),
  v.literal("TOWNHOUSE"),
  v.literal("VILLA"),
  v.literal("UNIT"),
  v.literal("LAND"),
  v.literal("RURAL"),
  v.literal("COMMERCIAL"),
  v.literal("INDUSTRIAL"),
);

const listingType = v.union(
  v.literal("SALE"),
  v.literal("RENT"),
  v.literal("SOLD"),
  v.literal("LEASED"),
);

const dataSource = v.union(
  v.literal("DOMAIN"),
  v.literal("REALESTATE"),
  v.literal("CORELOGIC"),
  v.literal("ABS"),
  v.literal("RBA"),
  v.literal("MANUAL"),
);

const listingStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("UNDER_CONTRACT"),
  v.literal("SOLD"),
  v.literal("WITHDRAWN"),
  v.literal("OFF_MARKET"),
);

export default defineSchema({
  // ── Users ──
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Chat Sessions
  chatSessions: defineTable({
    userId: v.id("users"),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    title: v.optional(v.string()),
    strategyId: v.optional(v.id("strategies")),
    chatMessages: v.array(v.id("chatMessages")),
  })
    .index("by_user", ["userId"])
    .index("by_updated_at", ["updatedAt"]),

  // Chat Messages
  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.string(),
    content: v.any(),
    toolCalls: v.optional(v.any()),
    toolResults: v.optional(v.any()),
    timestamp: v.float64(),
  }).index("by_session", ["sessionId"]),

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
    .index("by_status", ["status"]),

  // ── Saved Searches ──
  savedSearches: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    filters: v.any(),
    results: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  // ── Location Hierarchy ──
  states: defineTable({
    name: v.string(),
    code: v.string(),
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  cities: defineTable({
    stateId: v.id("states"),
    name: v.string(),
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
  })
    .index("by_city", ["cityId"])
    .index("by_postcode", ["postcode"])
    .index("by_city_name_postcode", ["cityId", "name", "postcode"])
    .index("by_centroid_lat", ["centroidLat"]),

  // ── Properties ──
  properties: defineTable({
    externalId: v.optional(v.string()),
    suburbId: v.id("suburbs"),
    address: v.string(),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    propertyType: propertyType,
    listingType: listingType,
    listingStatus: listingStatus,
    source: dataSource,
    sourceUrl: v.optional(v.string()),
    price: v.optional(v.float64()),
    rentWeekly: v.optional(v.float64()),
    bedrooms: v.optional(v.float64()),
    bathrooms: v.optional(v.float64()),
    carSpaces: v.optional(v.float64()),
    landSize: v.optional(v.float64()),
    buildingSize: v.optional(v.float64()),
    description: v.optional(v.string()),
    features: v.optional(v.any()),
    images: v.optional(v.any()),
    agentId: v.optional(v.id("realEstateAgents")),
    agencyId: v.optional(v.id("agencies")),
    scrapedAt: v.optional(v.float64()),
  })
    .index("by_external_id", ["externalId"])
    .index("by_suburb", ["suburbId"])
    .index("by_property_type", ["propertyType"])
    .index("by_listing_type", ["listingType"])
    .index("by_listing_status", ["listingStatus"])
    .index("by_source", ["source"])
    .index("by_price", ["price"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_location_lat", ["latitude"])
    .index("by_agent", ["agentId"])
    .index("by_agency", ["agencyId"]),

  // ── Suburb Metrics ──
  suburbMetrics: defineTable({
    suburbId: v.id("suburbs"),
    metricType: v.string(),
    value: v.float64(),
    source: v.optional(v.string()),
    recordedAt: v.float64(),
  })
    .index("by_suburb", ["suburbId"])
    .index("by_suburb_type", ["suburbId", "metricType"])
    .index("by_suburb_type_time", ["suburbId", "metricType", "recordedAt"])
    .index("by_metric_type", ["metricType"]),

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
  })
    .index("by_type", ["indicatorType"])
    .index("by_scope", ["scope"])
    .index("by_type_scope", ["indicatorType", "scope"])
    .index("by_type_scope_time", ["indicatorType", "scope", "recordedAt"]),
});
