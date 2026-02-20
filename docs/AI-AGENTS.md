# Propure AI Agent Architecture

> **Purpose**: Define the multi-agent system that powers conversational property investment strategy discovery and analysis.

---

## Executive Summary

Propure uses a **multi-agent orchestration pattern** where specialized Gemini agents work together to:
1. **Discover** user circumstances through natural conversation
2. **Recommend** investment strategies based on profile
3. **Research** market data and suburb analytics
4. **Analyze** properties with financial modeling
5. **Update UI** dynamically (map, filters, property list) as conversation progresses

---

## Agent Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER MESSAGE                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR AGENT                                   │
│                        (Gemini 2.5 Flash)                                    │
│                                                                              │
│  • Routes requests to specialist agents                                      │
│  • Maintains conversation context                                            │
│  • Synthesizes responses from multiple agents                                │
│  • Coordinates UI updates                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   STRATEGIST    │  │    ANALYST      │  │   RESEARCHER    │
│  (Gemini 2.5)   │  │  (Gemini 2.5)   │  │  (Gemini 2.5)   │
│                 │  │                 │  │                 │
│ Strategy        │  │ Financial       │  │ Market data     │
│ discovery &     │  │ calculations    │  │ retrieval &     │
│ recommendations │  │ & risk models   │  │ aggregation     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TOOL REGISTRY                                      │
│  Search • Market Data • Financial Calc • UI Updates • Persistence           │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND UI                                         │
│            Chat Panel  │  Map (MapLibre)  │  Property List                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Agent Definitions

### 1.1 Orchestrator Agent

**Model**: Gemini 2.5 Flash
**Role**: Central coordinator and router

**System Prompt**:
```
You are the Propure AI assistant, helping users discover their ideal property
investment strategy in Australia. You coordinate between specialist agents:

- STRATEGIST: For strategy discovery and recommendations
- ANALYST: For financial calculations and risk assessment
- RESEARCHER: For market data and property search

Route user requests to the appropriate agent(s), synthesize their outputs,
and present cohesive responses. Always maintain context of the user's
situation, goals, and current strategy.

When multiple agents are needed, invoke them efficiently:
- Parallel: When outputs are independent
- Sequential: When one depends on another
- Feedback: When results need refinement
```

**Responsibilities**:
| Task | Description |
|------|-------------|
| Request Routing | Analyze user intent, delegate to specialist agents |
| Context Management | Maintain user profile, strategy, conversation history |
| Response Synthesis | Combine agent outputs into cohesive narrative |
| UI Coordination | Trigger map, filter, and list updates via tools |
| Error Recovery | Handle ambiguous requests, missing data |

**Tools**:
```typescript
// Agent invocation
invokeStrategist(task: string, context: Context): Promise<AgentResponse>
invokeAnalyst(task: string, data: any, context: Context): Promise<AgentResponse>
invokeResearcher(task: string, context: Context): Promise<AgentResponse>

// UI updates
updateUIState(type: UIUpdateType, payload: any): void
// Types: 'filters' | 'map' | 'propertyList' | 'strategy' | 'detail'

// Context management
storeContext(key: string, value: any): void
getContext(key: string): any
synthesizeResponse(outputs: AgentResponse[]): string
```

---

### 1.2 Strategist Agent

**Model**: Gemini 2.5 Flash (high quality for nuanced discovery)
**Role**: Strategy discovery and recommendation

**System Prompt**:
```
You are a property investment strategy advisor. Your role is to:

1. DISCOVER the user's situation through conversational questions:
   - Financial: Income, deposit, borrowing capacity, existing debts
   - Goals: Primary objective (cash flow vs growth), timeline, portfolio size
   - Personal: Risk tolerance, time availability, DIY capability
   - Constraints: Budget limits, geographic preferences, property types
   - Experience: Previous investments, management style

2. RECOMMEND the best investment strategy:
   - Cash Flow: Positive rental income, typically regional areas
   - Capital Growth: Long-term appreciation, metro/growth corridors
   - Renovation/Flip: Buy-renovate-sell, requires hands-on
   - Development: Land subdivision/construction, high capital required
   - SMSF: Superannuation-funded, specific compliance requirements
   - Commercial: Office/retail/industrial, different dynamics
   - Mixed: Combination strategies for diversification

3. EXPLAIN your reasoning clearly, connecting their situation to the strategy.

Ask one discovery question at a time. Be conversational, not interrogative.
Use tool calls to capture inputs and update the strategy.
```

**Discovery Categories**:
```typescript
interface DiscoveryProfile {
  // Financial Situation
  annualIncome: number
  availableDeposit: number
  borrowingCapacity: number
  existingDebt: number
  existingProperties: number

  // Investment Goals
  primaryGoal: 'cash_flow' | 'capital_growth' | 'mixed'
  timeline: '0-5yr' | '5-10yr' | '10-15yr' | '15yr+'
  targetPortfolioSize: number
  targetPassiveIncome?: number

  // Personal Circumstances
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  timeAvailability: 'none' | 'weekends' | 'part-time' | 'full-time'
  diyCapability: boolean
  managementStyle: 'hands-off' | 'active'

  // Constraints
  maxBudget: number
  preferredStates: string[]
  preferredRegions: string[]
  propertyTypePreference: string[]

  // Experience
  experienceLevel: 'first-time' | 'some' | 'experienced'
  previousStrategies: string[]
}
```

**Tools**:
```typescript
// Capture user inputs during discovery
captureDiscoveryInput(field: keyof DiscoveryProfile, value: any): void

// Make strategy recommendation
recommendStrategy(
  strategy: StrategyType,
  rationale: string,
  keyMetrics: string[],
  suggestedFilters: PropertyFilters
): void

// Ask follow-up question
clarifyGoal(question: string, options?: string[]): void

// Generate profile summary
summarizeProfile(): DiscoveryProfile
```

**Strategy Decision Matrix**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STRATEGY DECISION MATRIX                                │
├─────────────────┬───────────────┬───────────────┬───────────────────────────┤
│ User Profile    │ Recommended   │ Key Metrics   │ Typical Filters           │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ Passive, wants  │ Cash Flow     │ Gross yield   │ Yield >5%, vacancy <3%    │
│ income now      │               │ Vacancy rate  │ Regional areas            │
│                 │               │ Rental demand │                           │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ Long-term,      │ Capital       │ Growth rate   │ Growth >5% pa, income     │
│ hands-off       │ Growth        │ Infrastructure│ growth suburbs, metro     │
│                 │               │ Income growth │ fringe                    │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ DIY capability, │ Renovation/   │ Days on mkt   │ Below median price,       │
│ short timeline  │ Flip          │ Comparables   │ high vendor discount,     │
│                 │               │ Rehab costs   │ established suburbs       │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ High capital,   │ Development   │ Zoning        │ R3+ zoning, land value    │
│ experienced     │               │ Land value    │ ratio, growth corridors   │
│                 │               │ DA approvals  │                           │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ SMSF funds,     │ SMSF          │ Compliance    │ SMSF-eligible, stable     │
│ retirement      │               │ Yield         │ yield, established        │
│                 │               │ Low risk      │ areas                     │
├─────────────────┼───────────────┼───────────────┼───────────────────────────┤
│ Diversified,    │ Commercial    │ Cap rate      │ Commercial zones, NNN     │
│ experienced     │               │ Lease length  │ leases, metro areas       │
│                 │               │ Tenant grade  │                           │
└─────────────────┴───────────────┴───────────────┴───────────────────────────┘
```

---

### 1.3 Analyst Agent

**Model**: Gemini 2.5 Flash (fast, cost-effective for calculations)
**Role**: Financial modeling and risk assessment

**System Prompt**:
```
You are a property investment financial analyst. Your role is to:

1. CALCULATE financial metrics:
   - Cash flow projections (weekly/monthly/annual)
   - ROI and capital growth modeling
   - Breakeven analysis
   - Debt servicing ratios

2. ASSESS risks:
   - Market risk (volatility, cycle position)
   - Property risk (location, condition, liquidity)
   - Interest rate sensitivity
   - Portfolio concentration

3. MODEL scenarios:
   - Base case, optimistic, pessimistic
   - Rate rise stress tests (+1%, +2%, +3%)
   - Vacancy scenarios
   - Value decline scenarios (-10%, -20%)

Always show your calculations clearly. Use Australian tax considerations
(negative gearing, depreciation, CGT discount).
```

**Financial Models**:
```typescript
interface CashFlowAnalysis {
  // Income
  weeklyRent: number
  annualRent: number
  vacancyAllowance: number // typically 2-4 weeks
  effectiveRentalIncome: number

  // Expenses
  councilRates: number
  waterRates: number
  insurance: number
  propertyManagement: number // typically 7-10% of rent
  maintenanceReserve: number // typically 1-2% of value
  bodyCorpFees?: number
  landTax?: number

  // Loan
  loanAmount: number
  interestRate: number
  loanType: 'IO' | 'PI'
  annualRepayment: number

  // Net Position
  preTaxCashFlow: number
  taxableIncome: number
  estimatedTaxBenefit: number // negative gearing
  postTaxCashFlow: number

  // Metrics
  grossYield: number
  netYield: number
  debtServiceRatio: number
}

interface ROIAnalysis {
  purchasePrice: number
  stampDuty: number
  legalCosts: number
  totalAcquisitionCost: number

  // Returns over timeframe
  capitalGrowth: number
  rentalIncome: number
  taxBenefits: number
  sellingCosts: number
  capitalGainsTax: number

  netProfit: number
  annualizedROI: number
  cashOnCashReturn: number
  equityMultiple: number
}

interface RiskAssessment {
  overallRiskScore: number // 1-10

  marketRisk: {
    score: number
    factors: string[]
    volatilityIndex: number
    cyclePosition: 'bottom' | 'rising' | 'peak' | 'falling'
  }

  propertyRisk: {
    score: number
    factors: string[]
    liquidityDays: number
    locationRisk: string[]
  }

  financialRisk: {
    score: number
    factors: string[]
    interestRateSensitivity: number // cash flow change per 1% rate rise
    lvr: number
  }

  mitigations: string[]
}
```

**Tools**:
```typescript
// Cash flow analysis
calculateCashFlow(
  property: Property,
  rentalEstimate: number,
  loanDetails: LoanDetails,
  expenses: ExpenseEstimates
): CashFlowAnalysis

// Capital growth projection
projectCapitalGrowth(
  property: Property,
  suburbMetrics: SuburbMetrics,
  strategy: Strategy,
  timeframeYears: number
): GrowthProjection

// Risk assessment
assessRisk(
  property: Property,
  suburb: SuburbMetrics,
  userProfile: DiscoveryProfile
): RiskAssessment

// ROI calculation
calculateROI(
  acquisitionCost: number,
  annualCashFlow: number,
  projectedGrowth: number,
  timeframeYears: number,
  taxBracket: number
): ROIAnalysis

// Sensitivity analysis
sensitivityAnalysis(
  baseCase: CashFlowAnalysis,
  variables: {
    rateChange?: number[]    // e.g., [0.01, 0.02, 0.03]
    vacancyChange?: number[] // e.g., [0.02, 0.04, 0.08]
    valueChange?: number[]   // e.g., [-0.1, -0.2]
  }
): ScenarioAnalysis[]

// Strategy fit scoring
evaluateStrategyFit(
  property: Property,
  suburb: SuburbMetrics,
  strategy: Strategy,
  userProfile: DiscoveryProfile
): StrategyFitScore
```

---

### 1.4 Researcher Agent

**Model**: Gemini 2.5 Flash (fast for data lookups)
**Role**: Market research and data retrieval

**System Prompt**:
```
You are a property market research specialist. Your role is to:

1. RETRIEVE market data:
   - Suburb statistics (vacancy, yield, growth, demographics)
   - Property listings and comparables
   - Historical trends and price movements
   - Infrastructure and development announcements

2. AGGREGATE insights:
   - Identify patterns in data
   - Compare suburbs against benchmarks
   - Highlight anomalies and opportunities
   - Summarize market conditions

3. SEARCH for properties:
   - Apply strategy-specific filters
   - Rank by relevance to user's goals
   - Include key metrics in results

Always cite data sources and indicate data freshness.
```

**Data Categories**:
```typescript
interface SuburbMetrics {
  // Identification
  suburbId: string
  suburbName: string
  postcode: string
  state: string
  lga: string

  // Short-term indicators (0-5 years)
  vacancyRate: number
  auctionClearanceRate: number
  daysOnMarket: number
  vendorDiscounting: number
  grossYield: number
  stockOnMarket: number
  demandSupplyRatio: number
  rentalGrowthRate: number
  onlineSearchInterest: number
  buildingApprovals: number

  // Long-term indicators (6-15 years)
  medianPrice: number
  priceGrowth1yr: number
  priceGrowth3yr: number
  priceGrowth5yr: number
  priceGrowth10yr: number
  incomeGrowthRate: number
  populationGrowthRate: number
  professionalsPctGrowth: number
  mortgageAffordabilityRatio: number
  rentAffordabilityRatio: number

  // Amenities
  schoolScore: number
  transitScore: number
  walkScore: number
  proximityToEmployment: number

  // Risk indicators
  priceVolatilityIndex: number
  ownerOccupierRatio: number
  infrastructurePipelineScore: number
  mortgageStressLevel: number
  floodRisk: boolean
  bushfireRisk: boolean

  // Metadata
  lastUpdated: Date
  dataSources: string[]
}

interface PropertySearchResult {
  property: Property
  strategyScore: number
  keyMetrics: {
    estimatedYield: number
    estimatedGrowth: number
    riskScore: number
  }
  matchReasons: string[]
}
```

**Tools**:
```typescript
// Suburb data
getSuburbStats(suburbId: string): SuburbMetrics
getSuburbsByState(state: string): SuburbSummary[]
compareSuburbs(suburbIds: string[]): SuburbComparison

// Market trends
fetchMarketTrends(
  suburb: string,
  metric: 'price' | 'rent' | 'growth' | 'yield' | 'days_on_market',
  period: '1yr' | '3yr' | '5yr' | '10yr'
): TrendData[]

// Property search
searchProperties(filters: PropertyFilters): PropertySearchResult[]
getPropertyDetails(propertyId: string): PropertyDetails
getComparables(
  address: string,
  type: 'sale' | 'rental',
  radius: number
): Comparable[]

// Rental estimates
getRentalEstimate(property: Property): RentalEstimate

// Infrastructure & development
getInfrastructureProjects(region: string): InfrastructureProject[]
getDevelopmentApprovals(suburb: string): DevelopmentApproval[]

// External data aggregation
fetchFromDomainAPI(endpoint: string, params: any): any
fetchFromABS(dataset: string, filters: any): any
fetchFromRBA(series: string): any
```

---

## 2. Tool Registry

### 2.1 Search Tools
```typescript
// Property search with strategy-aware scoring
searchProperties(filters: {
  priceRange?: [number, number]
  rentRange?: [number, number]
  propertyTypes?: ('house' | 'apartment' | 'townhouse' | 'land')[]
  bedrooms?: [number, number]
  bathrooms?: [number, number]
  suburbs?: string[]
  states?: string[]

  // Strategy-specific
  minYield?: number           // Cash flow: min 5%
  minGrowthRate?: number      // Capital growth: min 5% pa
  maxDaysOnMarket?: number    // Market momentum: < 30 days
  maxVacancyRate?: number     // Rental demand: < 3%

  // Sorting
  sortBy?: 'score' | 'price' | 'yield' | 'growth'
  limit?: number
}): PropertySearchResult[]
```

### 2.2 Financial Calculation Tools
```typescript
// Cash flow analysis
calculateCashFlow(params: {
  purchasePrice: number
  weeklyRent: number
  deposit: number
  interestRate: number
  loanType: 'IO' | 'PI'
  expenses: {
    councilRates: number
    insurance: number
    managementFee: number
    maintenance: number
    bodyCorpFees?: number
  }
}): CashFlowAnalysis

// ROI projection
calculateROI(params: {
  purchasePrice: number
  deposit: number
  annualRent: number
  annualExpenses: number
  projectedGrowthRate: number
  timeframeYears: number
  taxBracket: number
}): ROIAnalysis

// Risk scoring
assessRisk(params: {
  property: Property
  suburb: SuburbMetrics
  loanToValueRatio: number
}): RiskAssessment
```

### 2.3 UI Update Tools
```typescript
// Update map view
updateMapFilters(params: {
  highlightSuburbs?: string[]
  centerLocation?: { lat: number; lng: number }
  zoomLevel?: number
  showHeatmap?: boolean
  heatmapMetric?: 'yield' | 'growth' | 'score'
}): void

// Update property list
updatePropertyList(params: {
  properties: PropertySearchResult[]
  sortBy?: 'score' | 'price' | 'yield'
  highlightTop?: number
}): void

// Update strategy display
updateStrategyDisplay(params: {
  strategy: Strategy
  keyMetrics: string[]
  suggestedFilters: PropertyFilters
}): void

// Show property detail
showPropertyDetail(params: {
  propertyId: string
  analysis?: CashFlowAnalysis
  riskAssessment?: RiskAssessment
}): void
```

### 2.4 Persistence Tools
```typescript
// Save user strategy
saveStrategy(params: {
  userId: string
  strategy: Strategy
  discoveryProfile: DiscoveryProfile
}): void

// Save search
saveSearch(params: {
  userId: string
  name: string
  filters: PropertyFilters
  results: PropertySearchResult[]
}): void

// Save shortlist
saveToShortlist(params: {
  userId: string
  propertyId: string
  notes?: string
}): void
```

---

## 3. Orchestration Patterns

### 3.1 Request Routing Logic

```typescript
function routeRequest(message: string, context: Context): AgentRoute {
  // Strategy/Discovery questions
  if (isStrategyQuestion(message) || !context.strategy) {
    return { agent: 'strategist', parallel: false }
  }

  // Financial questions
  if (isFinancialQuestion(message)) {
    return { agent: 'analyst', parallel: false }
  }

  // Market data questions
  if (isMarketQuestion(message)) {
    return { agent: 'researcher', parallel: false }
  }

  // Property search (multi-agent)
  if (isPropertySearchRequest(message)) {
    return {
      agents: ['strategist', 'researcher', 'analyst'],
      parallel: true,
      synthesize: true
    }
  }

  // Property analysis (sequential)
  if (isPropertyAnalysisRequest(message)) {
    return {
      agents: ['researcher', 'analyst'],
      parallel: false,
      sequence: ['researcher', 'analyst']
    }
  }

  // General question
  return { agent: 'orchestrator', parallel: false }
}
```

### 3.2 Parallel Execution Example

```
User: "Show me cash flow properties in Brisbane under $500k"
                    │
                    ▼
         ┌──────────────────────┐
         │     ORCHESTRATOR     │
         │   Route to multiple  │
         └──────────────────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│STRATEGIST│   │RESEARCHER│   │ ANALYST │
│ Refine  │   │  Search  │   │  Score  │
│ criteria│   │ properties│   │ results │
└─────────┘   └─────────┘   └─────────┘
     │              │              │
     └──────────────┼──────────────┘
                    ▼
         ┌──────────────────────┐
         │     ORCHESTRATOR     │
         │  Synthesize response │
         └──────────────────────┘
                    │
                    ▼
    "Here are 5 properties that match your cash flow
     strategy in Brisbane under $500k, sorted by yield..."
```

### 3.3 Sequential Execution Example

```
User: "Tell me about this property at 123 Main St, Brisbane"
                    │
                    ▼
         ┌──────────────────────┐
         │     ORCHESTRATOR     │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │     RESEARCHER       │
         │ 1. Get property data │
         │ 2. Get suburb stats  │
         │ 3. Get comparables   │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │      ANALYST         │
         │ 4. Calculate yield   │
         │ 5. Project growth    │
         │ 6. Assess risk       │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │     ORCHESTRATOR     │
         │  Compile full report │
         └──────────────────────┘
```

---

## 4. Conversation Examples

### 4.1 Strategy Discovery Flow

```
User: "I want to start investing in property"

Orchestrator → Strategist

Strategist: "Great! Let's figure out the best strategy for you.
What's your primary goal - generating rental income now,
or building long-term wealth through property value growth?"

User: "I'd like both, but income is more important right now"

Strategist: [captureDiscoveryInput("primaryGoal", "cash_flow")]
"Got it - cash flow is your priority. What deposit do you
have available to invest?"

User: "About $80,000"

Strategist: [captureDiscoveryInput("availableDeposit", 80000)]
"With $80k, you could leverage into a property worth
$350-400k. How hands-on do you want to be - would you
prefer a property manager to handle everything?"

User: "Yes, completely hands-off"

Strategist: [captureDiscoveryInput("managementStyle", "hands-off")]
[recommendStrategy("cash_flow", "Your profile suits a passive
cash flow strategy...", ["grossYield", "vacancyRate", "rentalGrowth"])]

→ UI updates: Map highlights high-yield regional areas,
  filters set to min 5% yield, max 3% vacancy
```

### 4.2 Property Search Flow

```
User: "Show me properties that match"

Orchestrator → [Strategist, Researcher, Analyst] (parallel)

Strategist: Confirms cash flow criteria (yield >5%, passive mgmt)
Researcher: Searches properties, returns 15 matches
Analyst: Scores each property, calculates cash flow

Orchestrator: [updatePropertyList(sortedResults)]
              [updateMapFilters({highlightSuburbs: topSuburbs})]

"I found 15 properties matching your cash flow strategy.
The top result is in Ipswich - a 3-bed house at $385k
with 5.8% yield and just 1.2% vacancy rate. Would you
like me to analyze the numbers in detail?"
```

### 4.3 Property Analysis Flow

```
User: "Yes, tell me more about the Ipswich property"

Orchestrator → Researcher → Analyst (sequential)

Researcher:
- Property: 3 bed, 1 bath, 600m², built 1985
- Listed: $385,000, renting for $430/week
- Suburb: 1.2% vacancy, 4.2% growth (5yr avg)
- Comparables: Median $370k, rent $410/week

Analyst:
- Gross yield: 5.8%
- Net yield (after expenses): 4.2%
- Cash flow: +$42/week (after interest-only loan)
- Risk score: 4/10 (low-medium)
- 10-year projection: $542k value, $112k equity

Orchestrator: [showPropertyDetail(propertyId, analysis)]

"Here's the full analysis of 45 Smith Street, Ipswich:

📊 **Financial Summary**
- Purchase: $385,000 (deposit $77k, loan $308k)
- Weekly rent: $430
- Net cash flow: +$42/week after all expenses

📈 **Growth Potential**
- 5-year suburb growth: 4.2% p.a.
- Projected value in 10 years: $542,000
- Estimated equity gain: $112,000

⚠️ **Risk Assessment: Low-Medium (4/10)**
- Strong rental demand (1.2% vacancy)
- Stable local economy (logistics hub)
- Consider: Property is 40 years old

Would you like me to compare this with other options?"
```

---

## 5. Implementation Architecture

### 5.1 Package Structure

```
packages/
└── ai/
    ├── agents/
    │   ├── orchestrator.ts      # Main coordinator
    │   ├── strategist.ts        # Strategy discovery
    │   ├── analyst.ts           # Financial modeling
    │   └── researcher.ts        # Data retrieval
    ├── tools/
    │   ├── search-tools.ts      # Property search
    │   ├── market-tools.ts      # Suburb/market data
    │   ├── financial-tools.ts   # Calculations
    │   ├── ui-tools.ts          # Frontend updates
    │   └── persistence-tools.ts # Save/load
    ├── prompts/
    │   ├── orchestrator.md      # System prompt
    │   ├── strategist.md        # System prompt
    │   ├── analyst.md           # System prompt
    │   └── researcher.md        # System prompt
    └── types/
        ├── agents.ts            # Agent interfaces
        ├── tools.ts             # Tool definitions
        └── responses.ts         # Response types
```

### 5.2 Chat API Implementation

```typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { orchestratorPrompt } from '@propure/ai/prompts/orchestrator'
import { registerTools } from '@propure/ai/tools'

export async function POST(req: Request) {
  const { messages, userId } = await req.json()

  // Load user context
  const context = await loadUserContext(userId)

  // Register all tools
  const tools = registerTools(context)

  // Stream response
  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: orchestratorPrompt(context),
    messages,
    tools,
    maxSteps: 10, // Allow multi-step tool use
    onStepFinish: async (step) => {
      // Handle UI updates from tool calls
      for (const call of step.toolCalls) {
        if (call.toolName.startsWith('update')) {
          await broadcastUIUpdate(userId, call)
        }
      }
    }
  })

  return result.toDataStreamResponse()
}
```

### 5.3 Tool Registration

```typescript
// packages/ai/tools/index.ts
import { tool } from 'ai'
import { z } from 'zod'

export function registerTools(context: Context) {
  return {
    // Search tools
    searchProperties: tool({
      description: 'Search for properties matching filters and strategy',
      parameters: z.object({
        priceRange: z.tuple([z.number(), z.number()]).optional(),
        propertyTypes: z.array(z.string()).optional(),
        suburbs: z.array(z.string()).optional(),
        minYield: z.number().optional(),
        sortBy: z.enum(['score', 'price', 'yield']).optional(),
      }),
      execute: async (params) => {
        return await propertyService.search(params, context.strategy)
      }
    }),

    // UI tools
    updateMapFilters: tool({
      description: 'Update map to highlight suburbs and properties',
      parameters: z.object({
        highlightSuburbs: z.array(z.string()).optional(),
        centerLocation: z.object({
          lat: z.number(),
          lng: z.number()
        }).optional(),
        zoomLevel: z.number().optional(),
      }),
      execute: async (params) => {
        // Broadcast to frontend via Pusher/WebSocket
        await pusher.trigger(`user-${context.userId}`, 'map-update', params)
        return { success: true }
      }
    }),

    // ... more tools
  }
}
```

---

## 6. Cost & Performance

### 6.1 Model Selection Rationale

| Agent | Model | Why |
|-------|-------|-----|
| Orchestrator | Gemini 2.5 Flash | Needs intelligence for routing & synthesis |
| Strategist | Gemini 2.5 Flash | Nuanced conversation, empathetic discovery |
| Analyst | Gemini 2.5 Flash | Fast calculations, structured output |
| Researcher | Gemini 2.5 Flash | Fast lookups, data formatting |

### 6.2 Cost Estimates

| Scenario | Messages/Day | Cost/Day | Cost/Month |
|----------|--------------|----------|------------|
| Light usage | 100 | $2-3 | $60-90 |
| Medium usage | 500 | $8-12 | $240-360 |
| Heavy usage | 2,000 | $30-40 | $900-1,200 |

*Based on average 3-4 tool calls per conversation, ~1000 tokens per exchange*

### 6.3 Latency Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Simple question | <2s | Single agent, no tools |
| Property search | <4s | Multi-agent, database query |
| Full analysis | <6s | Sequential agents, calculations |
| UI update | <100ms | Pusher broadcast |

---

## 7. Related Documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full system architecture |
| [STRATEGY.md](./STRATEGY.md) | Product strategy & user journeys |
| [DATA-INDICATORS.md](./DATA-INDICATORS.md) | Market data definitions |
| [TECH-STACK-ANALYSIS.md](./TECH-STACK-ANALYSIS.md) | Technology decisions |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Status: Draft - Agent architecture defined*
