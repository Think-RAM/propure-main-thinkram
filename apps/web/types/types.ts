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

export const MAP_MARKER_ICON = `
  <div
    style="
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      background: #06b6d4; /* cyan */
      display: grid;
      place-items: center;
      box-shadow: 0 6px 18px rgba(0,0,0,0.18);
      border: 1px solid rgba(0,0,0,0.12);
    "
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2">
      <path d="M10 12h4"/>
      <path d="M10 8h4"/>
      <path d="M14 21v-3a2 2 0 0 0-4 0v3"/>
      <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
    </svg>
  </div>
`;
