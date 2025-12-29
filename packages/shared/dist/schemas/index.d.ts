import { z } from "zod";
/**
 * User Preferences Schema - validates investment wizard data
 */
export declare const userPreferencesSchema: z.ZodObject<{
    primaryGoal: z.ZodNullable<z.ZodEnum<["cash-flow", "capital-growth", "renovation-flip", "development", "smsf", "commercial"]>>;
    holdingPeriod: z.ZodNullable<z.ZodEnum<["short", "medium", "long"]>>;
    riskLevel: z.ZodNullable<z.ZodEnum<["low", "medium", "high"]>>;
    totalBudget: z.ZodNullable<z.ZodNumber>;
    personalSavings: z.ZodNullable<z.ZodNumber>;
    homeLoan: z.ZodNullable<z.ZodNumber>;
    borrowingCapacity: z.ZodNullable<z.ZodNumber>;
    cashflowExpectations: z.ZodNullable<z.ZodEnum<["positive", "neutral", "negative"]>>;
    cashflowAmount: z.ZodNullable<z.ZodNumber>;
    regions: z.ZodArray<z.ZodString, "many">;
    remoteInvesting: z.ZodNullable<z.ZodBoolean>;
    areaPreference: z.ZodNullable<z.ZodEnum<["metro", "regional", "both"]>>;
    propertyType: z.ZodArray<z.ZodEnum<["house", "apartment", "townhouse", "unit", "land", "commercial"]>, "many">;
    bedrooms: z.ZodNullable<z.ZodNumber>;
    propertyAge: z.ZodNullable<z.ZodEnum<["new", "established", "any"]>>;
    previousExperience: z.ZodNullable<z.ZodEnum<["none", "some", "experienced"]>>;
    involvement: z.ZodNullable<z.ZodEnum<["passive", "active", "hands-on"]>>;
    coInvestment: z.ZodNullable<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    primaryGoal: "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | null;
    holdingPeriod: "short" | "medium" | "long" | null;
    riskLevel: "medium" | "low" | "high" | null;
    totalBudget: number | null;
    personalSavings: number | null;
    homeLoan: number | null;
    borrowingCapacity: number | null;
    cashflowExpectations: "positive" | "neutral" | "negative" | null;
    cashflowAmount: number | null;
    regions: string[];
    remoteInvesting: boolean | null;
    areaPreference: "metro" | "regional" | "both" | null;
    propertyType: ("commercial" | "house" | "apartment" | "townhouse" | "unit" | "land")[];
    bedrooms: number | null;
    propertyAge: "new" | "established" | "any" | null;
    previousExperience: "none" | "some" | "experienced" | null;
    involvement: "passive" | "active" | "hands-on" | null;
    coInvestment: boolean | null;
}, {
    primaryGoal: "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | null;
    holdingPeriod: "short" | "medium" | "long" | null;
    riskLevel: "medium" | "low" | "high" | null;
    totalBudget: number | null;
    personalSavings: number | null;
    homeLoan: number | null;
    borrowingCapacity: number | null;
    cashflowExpectations: "positive" | "neutral" | "negative" | null;
    cashflowAmount: number | null;
    regions: string[];
    remoteInvesting: boolean | null;
    areaPreference: "metro" | "regional" | "both" | null;
    propertyType: ("commercial" | "house" | "apartment" | "townhouse" | "unit" | "land")[];
    bedrooms: number | null;
    propertyAge: "new" | "established" | "any" | null;
    previousExperience: "none" | "some" | "experienced" | null;
    involvement: "passive" | "active" | "hands-on" | null;
    coInvestment: boolean | null;
}>;
export type UserPreferencesSchema = z.infer<typeof userPreferencesSchema>;
/**
 * Property Filters Schema - validates search filter parameters
 */
export declare const propertyFiltersSchema: z.ZodObject<{
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minYield: z.ZodOptional<z.ZodNumber>;
    maxYield: z.ZodOptional<z.ZodNumber>;
    propertyTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["house", "apartment", "townhouse", "unit", "land", "commercial"]>, "many">>;
    bedrooms: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    suburbs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    strategy: z.ZodOptional<z.ZodEnum<["cash-flow", "capital-growth", "renovation-flip", "development", "smsf", "commercial"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["price", "yield", "growth", "vacancy"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    regions?: string[] | undefined;
    bedrooms?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minYield?: number | undefined;
    maxYield?: number | undefined;
    propertyTypes?: ("commercial" | "house" | "apartment" | "townhouse" | "unit" | "land")[] | undefined;
    suburbs?: string[] | undefined;
    strategy?: "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | undefined;
    sortBy?: "price" | "yield" | "growth" | "vacancy" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    regions?: string[] | undefined;
    bedrooms?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minYield?: number | undefined;
    maxYield?: number | undefined;
    propertyTypes?: ("commercial" | "house" | "apartment" | "townhouse" | "unit" | "land")[] | undefined;
    suburbs?: string[] | undefined;
    strategy?: "cash-flow" | "capital-growth" | "renovation-flip" | "development" | "smsf" | "commercial" | undefined;
    sortBy?: "price" | "yield" | "growth" | "vacancy" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type PropertyFiltersSchema = z.infer<typeof propertyFiltersSchema>;
//# sourceMappingURL=index.d.ts.map