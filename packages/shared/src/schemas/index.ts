import { z } from "zod";

/**
 * User Preferences Schema - validates investment wizard data
 */
export const userPreferencesSchema = z.object({
  primaryGoal: z
    .enum([
      "cash-flow",
      "capital-growth",
      "renovation-flip",
      "development",
      "smsf",
      "commercial",
    ])
    .nullable(),
  holdingPeriod: z.enum(["short", "medium", "long"]).nullable(),
  riskLevel: z.enum(["low", "medium", "high"]).nullable(),
  totalBudget: z.number().positive().nullable(),
  personalSavings: z.number().min(0).nullable(),
  homeLoan: z.number().min(0).nullable(),
  borrowingCapacity: z.number().min(0).nullable(),
  cashflowExpectations: z.enum(["positive", "neutral", "negative"]).nullable(),
  cashflowAmount: z.number().nullable(),
  regions: z.array(z.string()),
  remoteInvesting: z.boolean().nullable(),
  areaPreference: z.enum(["metro", "regional", "both"]).nullable(),
  propertyType: z.array(
    z.enum(["house", "apartment", "townhouse", "unit", "land", "commercial"])
  ),
  bedrooms: z.number().int().min(1).max(10).nullable(),
  propertyAge: z.enum(["new", "established", "any"]).nullable(),
  previousExperience: z.enum(["none", "some", "experienced"]).nullable(),
  involvement: z.enum(["passive", "active", "hands-on"]).nullable(),
  coInvestment: z.boolean().nullable(),
});

export type UserPreferencesSchema = z.infer<typeof userPreferencesSchema>;

/**
 * Property Filters Schema - validates search filter parameters
 */
export const propertyFiltersSchema = z.object({
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minYield: z.number().min(0).max(100).optional(),
  maxYield: z.number().min(0).max(100).optional(),
  propertyTypes: z
    .array(
      z.enum(["house", "apartment", "townhouse", "unit", "land", "commercial"])
    )
    .optional(),
  bedrooms: z.array(z.number().int().min(1).max(10)).optional(),
  regions: z.array(z.string()).optional(),
  suburbs: z.array(z.string()).optional(),
  strategy: z
    .enum([
      "cash-flow",
      "capital-growth",
      "renovation-flip",
      "development",
      "smsf",
      "commercial",
    ])
    .optional(),
  sortBy: z.enum(["price", "yield", "growth", "vacancy"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type PropertyFiltersSchema = z.infer<typeof propertyFiltersSchema>;
