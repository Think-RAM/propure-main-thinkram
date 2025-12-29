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
