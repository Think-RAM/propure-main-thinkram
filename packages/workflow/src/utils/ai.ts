import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from 'zod';
import { Doc } from "@propure/convex/genereated";

// --- Types & Schemas (Kept for context) ---

interface Property {
  id: string;
  title: string;
  location: string;
  images: string[];
  price: number;
  yield: number;
  rent: number;
  cashFlow: number;
  growth: number;
  risk: string;
  daysOnMarket: number;
  score: number;
  tag?: "recommended" | "runner-up";
}

interface ShortlistData {
  property: Property;
  suburbMarketData: Doc<"suburbMetrics">;
  absData: Doc<"absMarketData">[];
}

function normalizeSuburbMetrics(suburb: Doc<"suburbMetrics">) {
  const m = suburb.metrics;

  return {
    postcode: suburb.postcode,
    price: m.medianValue,
    daysOnMarket: m.averageDaysOnMarket,
    vacancyRate: m.vacancyRate,
    yield: m.netYield,
    growthScore: m.capitalGrowthScore,
    cashFlowScore: m.cashFlowScore,
    riskScore: m.riskScore,
    liquidity: m.stockOnMarket,
    clearanceRate: m.auctionClearanceRate,
  };
}

function normalizeAbsData(abs: Doc<"absMarketData">[]) {
  if (!abs.length) return null;

  const latest = abs[0]; // assume sorted

  return {
    population: latest.totalPopulation,
    growth: latest.populationGrowth,
    medianAge: latest.medianAge,

    income: {
      personal: latest.medianWeeklyPersonalIncome,
      household: latest.medianWeeklyHouseholdIncome,
    },

    rent: latest.medianWeeklyRent,
    mortgage: latest.medianMonthlyMortgageRepayment,

    ownership: {
      ownerOccupied: latest.ownerOccupied,
      rented: latest.rented,
    },
  };
}

function normalizeProperty(p: Property) {
  return {
    id: p.id,
    price: p.price,
    yield: p.yield,
    rent: p.rent,
    cashFlow: p.cashFlow,
    growth: p.growth,
    risk: p.risk,
    daysOnMarket: p.daysOnMarket,
    score: p.score,
  };
}

function buildAIInput(data: ShortlistData[]) {
  return data.map((item) => ({
    property: normalizeProperty(item.property),
    suburb: normalizeSuburbMetrics(item.suburbMarketData),
    demographics: normalizeAbsData(item.absData),
  }));
}

const aiInsightsSchema = z.object({
  strategy: z.string().describe("A professional investment thesis linking the strategy to specific market data."),
  recommendationSummaryMD: z.string().describe("A markdown-formatted analysis of market signals and KPIs."),
});

const recommendedPropertySchema = z.object({
  description: z.string().describe("Evidence-based justification for why this specific property is the top pick."),
  title: z.string().describe("The official title of the property."),
  confidence: z.number().min(0).max(100).describe("Confidence score (0-100) based on data consistency."),
});

const recommendationSummarySchema = z.object({
  purchasePrice: z.object({ value: z.number(), description: z.string() }),
  cashFlow: z.object({ value: z.number(), description: z.string() }),
  growth: z.object({ value: z.number(), description: z.string() }),
});

const model = google("gemini-2.0-flash"); // Adjusted to current standard naming

// --- Extracted & Enhanced Prompts ---

const PROMPTS = {
  STRATEGY_INSIGHTS: (
    strategy: Doc<"strategies">,
    data: ReturnType<typeof buildAIInput>
  ) => `
ROLE: Principal Real Estate Investment Strategist (Institutional Grade)

PRIMARY OBJECTIVE:
Produce a precise, data-grounded investment thesis aligned with the investor profile.
Every claim MUST be directly supported by the provided dataset.

----------------------------------------
INVESTOR PROFILE (SOURCE OF TRUTH)
----------------------------------------
${JSON.stringify({
    type: strategy.type,
    budget: strategy.budget,
    riskTolerance: strategy.riskTolerance,
    timeline: strategy.timeline,
    params: strategy.params,
  })}

----------------------------------------
MARKET DATA (NORMALIZED & TRUSTED INPUT)
----------------------------------------
${JSON.stringify(data)}

----------------------------------------
CRITICAL ANALYSIS FRAMEWORK
----------------------------------------
You MUST derive insights using ONLY these relationships:

1. Rental Demand Strength:
   - vacancyRate ↓ + yield ↑ → strong rental demand
   - vacancyRate ↑ → weak rental demand

2. Affordability Pressure:
   - income vs rent
   - income vs mortgage
   - If income growth < price growth → affordability risk

3. Market Momentum:
   - growthScore ↑ + daysOnMarket ↓ → strong momentum
   - daysOnMarket ↑ → weak demand / illiquidity

4. Risk Assessment:
   - riskScore ↑ → penalize heavily
   - Combine with liquidity + vacancy for compounded risk

5. Liquidity:
   - stockOnMarket ↑ + daysOnMarket ↑ → oversupply
   - clearanceRate ↑ → strong buyer demand

----------------------------------------
NON-NEGOTIABLE RULES
----------------------------------------
- DO NOT hallucinate or infer missing data
- DO NOT introduce external knowledge
- DO NOT generalize (every claim must tie to a metric)
- IGNORE null/undefined values completely
- If data is insufficient → explicitly say "insufficient data"
- Prefer numerical comparisons over adjectives
- Avoid vague words: "good", "strong", "high" WITHOUT metrics

----------------------------------------
REASONING STYLE (IMPORTANT)
----------------------------------------
- Use cause → effect chains
- Prioritize contradictions (e.g., high yield BUT high vacancy)
- Highlight trade-offs, not just positives
- Think like a fund manager, not a salesperson

----------------------------------------
OUTPUT FORMAT (STRICT — NO DEVIATION)
----------------------------------------

Return ONLY a valid JSON object:

{
  "strategy": string,
  "recommendationSummaryMD": string
}

----------------------------------------
FIELD REQUIREMENTS
----------------------------------------

1. strategy:
- 4–6 sentences MAX
- Must:
  - Align investor profile → market conditions
  - Include at least 2 trade-offs
  - Include at least 3 explicit metric references
- No repetition
- No markdown

2. recommendationSummaryMD:
- Markdown format EXACTLY as below:

## Market Signals
- <bullet with metric + interpretation>
- <bullet with metric + interpretation>

## Opportunities
- <bullet with metric-backed opportunity>
- <bullet with metric-backed opportunity>

## Risks
- <bullet with metric-backed risk>
- <bullet with metric-backed risk>

----------------------------------------
METRIC CITATION RULE (STRICT)
----------------------------------------
Every bullet MUST:
- Contain at least 1 numeric metric
- Mention the field explicitly (e.g., "vacancyRate", "yield")

Examples:

✅ CORRECT:
"Vacancy rate of 1.2% combined with yield of 5.8% indicates tight rental supply"

❌ WRONG:
"Rental market is strong"

----------------------------------------
FAIL-SAFE CONDITIONS
----------------------------------------
- If most suburbs show conflicting signals → highlight uncertainty
- If riskScore is consistently high → bias toward caution
- If no clear opportunity → explicitly state "no strong investment signal"

----------------------------------------
OUTPUT DISCIPLINE
----------------------------------------
- No extra keys
- No explanations outside JSON
- No commentary
- No trailing text
`,

  RECOMMENDED_PROPERTY: (data: ReturnType<typeof buildAIInput>) => `
ROLE: Senior Acquisitions Analyst

INPUT:
${JSON.stringify(data)}

SELECTION FRAMEWORK:

Score each property using:
- Yield (30%)
- Cash Flow (25%)
- Growth (25%)
- Risk (inverse) (20%)

ADDITIONAL RULES:
- Prefer properties outperforming suburb averages
- Penalize high daysOnMarket (> suburb avg)
- Prefer strong demographics (high income, low vacancy)

TASK:
Select ONE property.

OUTPUT:

description:
- Justify selection using:
  - Direct comparison vs dataset average
  - At least 3 metrics
  - Mention 1 trade-off

title:
- Exact property title

confidence:
- 90–100: all metrics aligned
- 70–89: minor weaknesses
- <70: conflicting signals

STRICT:
- No generic phrases like "great opportunity"
- Must reference numbers
`,

  SUMMARY_METRICS: (data: ReturnType<typeof buildAIInput>) => `
ROLE: Quantitative Analyst

INPUT:
${JSON.stringify(data)}

TASK:
Return metrics ONLY for the selected property (best overall).

RULES:
- purchasePrice = property.price
- cashFlow = property.cashFlow
- growth = property.growth

OUTPUT FORMAT:

Each field:
- value → raw number
- description → interpretation in 1 sentence

EXAMPLES:

purchasePrice.description:
"Entry price of $650k positions this asset in the mid-market range, reducing capital barrier."

cashFlow.description:
"Positive cash flow of $8,000/year indicates self-sustaining investment."

STRICT:
- No assumptions
- No averages unless explicitly required
  `,
  SCORE_PROPERTY: (
    strategy: Doc<"strategies">,
    property: ReturnType<typeof normalizeProperty>,
    suburb: ReturnType<typeof normalizeSuburbMetrics>,
    demographics: ReturnType<typeof normalizeAbsData>
  ) => `
ROLE: Institutional-Grade Property Investment Scoring Engine

CONTEXT:
You are a deterministic scoring system used by a real estate investment platform. Your job is to evaluate a single property using structured data and return a precise, explainable investment score.

INVESTOR PROFILE:
${JSON.stringify({
    type: strategy.type,
    budget: strategy.budget,
    riskTolerance: strategy.riskTolerance,
    timeline: strategy.timeline,
    params: strategy.params,
  })}

INPUT DATA:
property:
${JSON.stringify(property)}

suburb (market benchmarks):
${JSON.stringify(suburb)}

demographics (demand indicators):
${JSON.stringify(demographics)}

OBJECTIVE:
Calculate a final INVESTMENT SCORE from 0 to 100.

SCORING FRAMEWORK (STRICT WEIGHTS):
- Yield → 30%
- Cash Flow → 25%
- Growth Potential → 25%
- Risk (inverse scoring) → 20%

METHODOLOGY:

1. NORMALIZATION:
   - Always evaluate property metrics relative to suburb benchmarks
   - Use % difference where applicable (e.g., property yield vs suburb yield)

2. YIELD SCORE:
   - Higher than suburb average → strong positive
   - Lower → penalize proportionally

3. CASH FLOW SCORE:
   - Consider rental income vs expenses if available
   - Penalize negative or weak cash flow
   - Adjust based on investor budget sensitivity

4. GROWTH SCORE:
   - Use suburb growth indicators + demographic signals
   - Favor areas with strong income growth, population growth, low vacancy

5. RISK SCORE (INVERSE):
   Penalize:
   - High daysOnMarket vs suburb
   - High vacancy rate
   - Weak demographic indicators
   - Mismatch with investor riskTolerance

6. INVESTOR PROFILE ADJUSTMENTS:
   - riskTolerance:
     - LOW → penalize volatility & weak suburbs heavily
     - HIGH → tolerate risk, favor growth
   - timeline:
     - SHORT → prioritize yield & liquidity
     - LONG → prioritize growth
   - budget:
     - Penalize properties stretching affordability or low ROI for capital
   - strategy.type:
     - e.g. "cashflow" → overweight yield/cashflow signals internally
     - e.g. "growth" → overweight appreciation signals

7. FINAL SCORE:
   - Combine weighted scores into a final integer (0–100)
   - Clamp strictly between 0 and 100

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "score": number, // integer 0–100
  "breakdown": {
    "yield": number,
    "cashFlow": number,
    "growth": number,
    "risk": number
  },
  "adjustments": {
    "investorProfileImpact": string // concise explanation of how strategy affected score
  },
  "justification": string // concise, data-driven reasoning referencing specific comparisons
}

STRICT RULES:
- DO NOT output text outside JSON
- NO generic statements (must reference actual values or comparisons)
- NO assumptions beyond provided data
- All reasoning must be derived from inputs
`,

};

// --- Refactored Functions ---

export async function generateStrategyInsights(input: {
  strategy: Doc<"strategies">;
  data: ShortlistData[];
}) {
  const cleanedData = buildAIInput(input.data);
  const { output } = await generateText({
    model,
    output: Output.object({ schema: aiInsightsSchema }),
    prompt: PROMPTS.STRATEGY_INSIGHTS(input.strategy, cleanedData),
  });
  return output;
}

export async function generateRecommendedProperty(input: {
  data: ShortlistData[];
}) {
  const cleanedData = buildAIInput(input.data);
  const { output } = await generateText({
    model,
    output: Output.object({ schema: recommendedPropertySchema }),
    prompt: PROMPTS.RECOMMENDED_PROPERTY(cleanedData),
  });
  return output;
}

export async function generateRecommendationSummary(input: {
  data: ShortlistData[];
}): Promise<any> {
  const cleanedData = buildAIInput(input.data);
  const { output } = await generateText({
    model,
    output: Output.object({ schema: recommendationSummarySchema }),
    prompt: PROMPTS.SUMMARY_METRICS(cleanedData),
  });
  return output;
}

export async function scoreProperty(input: {
  strategy: Doc<"strategies">;
  data: ShortlistData;
}) { 
  const cleanedProperty = normalizeProperty(input.data.property);
  const cleanedSuburb = normalizeSuburbMetrics(input.data.suburbMarketData);
  const cleanedDemographics = normalizeAbsData(input.data.absData);

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: z.object({
        score: z.number().describe("Final investment score from 0 to 100 based on weighted evaluation."),
      }),
    }),
    prompt: PROMPTS.SCORE_PROPERTY(
      input.strategy,
      cleanedProperty,
      cleanedSuburb,
      cleanedDemographics
    ),
  });

  return output;
}
