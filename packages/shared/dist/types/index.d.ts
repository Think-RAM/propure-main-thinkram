/**
 * User Preferences - captured from investment wizard
 */
export interface UserPreferences {
    primaryGoal: "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | null;
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
export declare const ProductPlanPriceId: Record<Plan, string>;
/**
 * Reverse mapping from Stripe Price ID to Plan
 */
export declare const PlanToPrice: Record<string, Plan>;
/**
 * Investment Strategy Types (API/Frontend format - kebab-case)
 */
export type StrategyType = "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | "diversification";
/**
 * Investment Strategy Types (Prisma format - SCREAMING_SNAKE_CASE)
 * These match the Prisma enum values exactly
 */
export type PrismaStrategyType = "CASH_FLOW" | "CAPITAL_GROWTH" | "RENOVATION_FLIP" | "DEVELOPMENT" | "SMSF" | "COMMERCIAL" | "DIVERSIFICATION";
/**
 * Map API strategy type to Prisma enum value
 */
export declare const strategyTypeToPrisma: Record<StrategyType, PrismaStrategyType>;
/**
 * Map Prisma enum value to API strategy type
 */
export declare const prismaToStrategyType: Record<PrismaStrategyType, StrategyType>;
/**
 * Property Types (API/Frontend format - lowercase)
 */
export type PropertyType = "house" | "apartment" | "townhouse" | "unit" | "land" | "commercial";
/**
 * Property Types (Prisma format - SCREAMING_SNAKE_CASE)
 */
export type PrismaPropertyType = "HOUSE" | "APARTMENT" | "TOWNHOUSE" | "VILLA" | "UNIT" | "LAND" | "RURAL" | "COMMERCIAL" | "INDUSTRIAL";
/**
 * Map API property type to Prisma enum value
 */
export declare const propertyTypeToPrisma: Record<PropertyType, PrismaPropertyType>;
/**
 * Map Prisma enum value to API property type (subset that maps to frontend types)
 */
export declare const prismaToPropertyType: Partial<Record<PrismaPropertyType, PropertyType>>;
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
//# sourceMappingURL=index.d.ts.map