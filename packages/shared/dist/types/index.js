/**
 * Stripe Price ID mapping for each plan
 */
export const ProductPlanPriceId = {
    "free-trial": "",
    "starter-plan": "price_starter_monthly",
    "pro-plan": "price_pro_monthly",
};
/**
 * Reverse mapping from Stripe Price ID to Plan
 */
export const PlanToPrice = {
    "": "free-trial",
    price_starter_monthly: "starter-plan",
    price_pro_monthly: "pro-plan",
};
/**
 * Map API strategy type to Prisma enum value
 */
export const strategyTypeToPrisma = {
    "cash-flow": "CASH_FLOW",
    "capital-growth": "CAPITAL_GROWTH",
    "renovation-flip": "RENOVATION_FLIP",
    development: "DEVELOPMENT",
    smsf: "SMSF",
    commercial: "COMMERCIAL",
};
/**
 * Map Prisma enum value to API strategy type
 */
export const prismaToStrategyType = {
    CASH_FLOW: "cash-flow",
    CAPITAL_GROWTH: "capital-growth",
    RENOVATION_FLIP: "renovation-flip",
    DEVELOPMENT: "development",
    SMSF: "smsf",
    COMMERCIAL: "commercial",
};
/**
 * Map API property type to Prisma enum value
 */
export const propertyTypeToPrisma = {
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
export const prismaToPropertyType = {
    HOUSE: "house",
    APARTMENT: "apartment",
    TOWNHOUSE: "townhouse",
    UNIT: "unit",
    LAND: "land",
    COMMERCIAL: "commercial",
};
