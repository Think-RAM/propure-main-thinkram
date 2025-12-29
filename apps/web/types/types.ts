export type UserPreferences = {
  // Step 1
  primaryGoal: string;
  holdingPeriod: string;
  riskLevel: string;
  // Step 2
  totalBudget: string;
  personalSavings: string;
  homeLoan: string;
  borrowingCapacity: string;
  cashflowExpectations: string;
  cashflowAmount: string;
  // Step 3
  regions: string[];
  remoteInvesting: string;
  areaPreference: string;
  // Step 4
  propertyType: string[];
  bedrooms: string;
  propertyAge: string;
  // Step 5
  previousExperience: string;
  involvement: string;
  coInvestment: string;
};

export type Plan = "free-trial" | "starter-plan" | "pro-plan";


export const ProductPlanPriceId: Record<Plan, string> = {
  "starter-plan": "price_1RjEwrI87poQAjI4avMdC22C",
  "pro-plan": "price_1RjExFI87poQAjI4i0PcUcAf",
  "free-trial": "not_a_product", // This is a placeholder for the free trial plan
}

export const PlanToPrice: Record<string, Plan> = {
  "price_1RjEwrI87poQAjI4avMdC22C": "starter-plan",
  "price_1RjExFI87poQAjI4i0PcUcAf": "pro-plan",
  "not_a_product": "free-trial",
};
