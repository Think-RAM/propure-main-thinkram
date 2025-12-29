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
 * Investment Strategy Types
 */
export type StrategyType =
  | "cash-flow"
  | "capital-growth"
  | "renovation-flip"
  | "development"
  | "smsf"
  | "commercial";

/**
 * Property Types
 */
export type PropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "unit"
  | "land"
  | "commercial";

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
