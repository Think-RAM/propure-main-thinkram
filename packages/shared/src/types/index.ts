/**
 * User Preferences - captured from investment wizard
 */
export interface UserPreferences {
  primaryGoal:
    | "cash-flow"
    | "capital-growth"
    | "renovation-flip"
    | "development"
    | "smsf"
    | "commercial"
    | null;
  holdingPeriod: "short" | "medium" | "long" | null;
  riskLevel: "low" | "medium" | "high" | null;
  totalBudget: number | null;
  personalSavings: number | null;
  homeLoan: number | null;
  borrowingCapacity: number | null;
  cashflowExpectations: "positive" | "neutral" | "negative" | null;
  cashflowAmount: number | null;
  regions: string[];
  remoteInvesting: boolean | null;
  areaPreference: "metro" | "regional" | "both" | null;
  propertyType: PropertyType[];
  bedrooms: number | null;
  propertyAge: "new" | "established" | "any" | null;
  previousExperience: "none" | "some" | "experienced" | null;
  involvement: "passive" | "active" | "hands-on" | null;
  coInvestment: boolean | null;
}

/**
 * Subscription Plan Types
 */
export type Plan = "free-trial" | "starter-plan" | "pro-plan";

/**
 * Stripe Price ID mapping for each plan
 */
export const ProductPlanPriceId: Record<Plan, string> = {
  "free-trial": "",
  "starter-plan": "price_starter_monthly",
  "pro-plan": "price_pro_monthly",
};

/**
 * Reverse mapping from Stripe Price ID to Plan
 */
export const PlanToPrice: Record<string, Plan> = {
  "": "free-trial",
  price_starter_monthly: "starter-plan",
  price_pro_monthly: "pro-plan",
};

/**
 * Investment Strategy Types (API/Frontend format - kebab-case)
 */
export type StrategyType =
  | "cash-flow"
  | "capital-growth"
  | "renovation-flip"
  | "development"
  | "smsf"
  | "commercial"
  | "diversification";

/**
 * Investment Strategy Types (Prisma format - SCREAMING_SNAKE_CASE)
 * These match the Prisma enum values exactly
 */
export type PrismaStrategyType =
  | "CASH_FLOW"
  | "CAPITAL_GROWTH"
  | "RENOVATION_FLIP"
  | "DEVELOPMENT"
  | "SMSF"
  | "COMMERCIAL"
  | "DIVERSIFICATION";

/**
 * Map API strategy type to Prisma enum value
 */
export const strategyTypeToPrisma: Record<StrategyType, PrismaStrategyType> = {
  "cash-flow": "CASH_FLOW",
  "capital-growth": "CAPITAL_GROWTH",
  "renovation-flip": "RENOVATION_FLIP",
  development: "DEVELOPMENT",
  smsf: "SMSF",
  commercial: "COMMERCIAL",
  diversification: "DIVERSIFICATION",
};

/**
 * Map Prisma enum value to API strategy type
 */
export const prismaToStrategyType: Record<PrismaStrategyType, StrategyType> = {
  CASH_FLOW: "cash-flow",
  CAPITAL_GROWTH: "capital-growth",
  RENOVATION_FLIP: "renovation-flip",
  DEVELOPMENT: "development",
  SMSF: "smsf",
  COMMERCIAL: "commercial",
  DIVERSIFICATION: "diversification",
};

/**
 * Property Types (API/Frontend format - lowercase)
 */
export type PropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "unit"
  | "land"
  | "commercial";

/**
 * Property Types (Prisma format - SCREAMING_SNAKE_CASE)
 */
export type PrismaPropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "TOWNHOUSE"
  | "VILLA"
  | "UNIT"
  | "LAND"
  | "RURAL"
  | "COMMERCIAL"
  | "INDUSTRIAL";

/**
 * Map API property type to Prisma enum value
 */
export const propertyTypeToPrisma: Record<PropertyType, PrismaPropertyType> = {
  house: "HOUSE",
  apartment: "APARTMENT",
  townhouse: "TOWNHOUSE",
  unit: "UNIT",
  land: "LAND",
  commercial: "COMMERCIAL",
};

/**
 * Map Prisma enum value to API property type (subset that maps to frontend types)
 */
export const prismaToPropertyType: Partial<
  Record<PrismaPropertyType, PropertyType>
> = {
  HOUSE: "house",
  APARTMENT: "apartment",
  TOWNHOUSE: "townhouse",
  UNIT: "unit",
  LAND: "land",
  COMMERCIAL: "commercial",
};

/**
 * Search Result from property search
 */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  yield: number;
  gradientFrom: string;
  gradientTo: string;
  yieldColor: string;
  lat: number;
  lng: number;
  price: number;
  propertyType: PropertyType;
}

/**
 * Latitude/Longitude coordinate pair
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Property Filters for search
 */
export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minYield?: number;
  maxYield?: number;
  propertyTypes?: PropertyType[];
  bedrooms?: number[];
  regions?: string[];
  suburbs?: string[];
  strategy?: StrategyType;
  sortBy?: "price" | "yield" | "growth" | "vacancy";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
