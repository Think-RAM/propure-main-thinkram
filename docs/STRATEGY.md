# Propure - Product Strategy Document

## Executive Summary

Propure is an AI-powered property investment strategy platform that helps users identify the right investment strategy based on their personal circumstances, then narrows down property searches using multi-level market data (national → state → suburb → street → property).

The interface follows a v0-style split-panel design:
- **Left Panel**: AI chat interface for strategy discovery and refinement
- **Right Panel**: Interactive map + property list that dynamically updates based on strategy

---

## Core Value Proposition

**"From Strategy to Property in One Conversation"**

Most property investors fail not because they pick the wrong property, but because they pick a property that doesn't align with their strategy, circumstances, and goals. Propure solves this by:

1. **Strategy-First Approach**: Identify the RIGHT strategy before searching for properties
2. **Personalized Analysis**: Factor in individual circumstances (income, equity, risk tolerance, timeline)
3. **Data-Driven Narrowing**: Use hierarchical market data to filter from millions to the few right properties
4. **Continuous Refinement**: Real-time map/list updates as the strategy conversation evolves

---

## Investment Strategies Supported

### Primary Strategies

| Strategy | Description | Key Metrics | Ideal For |
|----------|-------------|-------------|-----------|
| **Cash Flow** | Positive rental income after expenses | Rental yield, vacancy rates, expense ratios | Passive income seekers, retirees |
| **Capital Growth** | Long-term property value appreciation | Historical growth, infrastructure plans, demographic shifts | Wealth builders, long-term investors |
| **Renovation & Flip** | Buy, improve, sell for profit | Reno costs, comparable sales, days on market | Active investors, those with trade skills |
| **Development** | Subdivide or build new dwellings | Zoning, land size, council regulations | Experienced investors, high capital |
| **SMSF Investment** | Self-Managed Super Fund compliant | Compliance rules, limited recourse borrowing | Super fund trustees |
| **Commercial** | Office, retail, industrial properties | Net yield, lease terms, tenant quality | Higher capital investors |
| **Mixed Strategy** | Combination approaches | Varies by combination | Diversified portfolios |

### Strategy Modifiers

- First Home Buyer vs Investor
- Single property vs Portfolio building
- Active vs Passive management preference
- Short-term (<3 years) vs Long-term (10+ years) horizon
- Low, Medium, High risk tolerance

---

## User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROPURE USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: DISCOVERY (Left Panel - AI Chat)
─────────────────────────────────────────
   User arrives → AI asks discovery questions:

   ├── Financial Situation
   │   ├── Current income & stability
   │   ├── Available deposit/equity
   │   ├── Borrowing capacity
   │   └── Existing properties/debts
   │
   ├── Investment Goals
   │   ├── Primary objective (income vs growth vs quick profit)
   │   ├── Timeline (when do you need returns?)
   │   ├── Target portfolio size
   │   └── Exit strategy
   │
   ├── Personal Circumstances
   │   ├── Risk tolerance
   │   ├── Time availability for management
   │   ├── Skills (DIY reno capability?)
   │   ├── Location preferences/restrictions
   │   └── Entity structure (personal, trust, SMSF, company)
   │
   └── Constraints
       ├── Maximum budget
       ├── Geographic restrictions
       └── Property type preferences

                              ↓

Phase 2: STRATEGY RECOMMENDATION
────────────────────────────────
   AI synthesizes inputs → Recommends strategy with rationale

   Example output:
   "Based on your stable income of $X, available equity of $Y,
    10-year timeline, and preference for passive management,
    I recommend a CAPITAL GROWTH strategy focusing on
    established houses in growth corridors..."

                              ↓

Phase 3: MARKET FILTERING (Right Panel Updates)
───────────────────────────────────────────────
   Strategy parameters → Hierarchical data filtering

   NATIONAL LEVEL
   └── Filter states by: economic outlook, population growth,
       affordability index, rental demand

       STATE LEVEL
       └── Filter regions by: infrastructure investment,
           employment hubs, price cycles

           SUBURB LEVEL
           └── Filter suburbs by: yield, growth history,
               vacancy rates, demographics, amenities

               STREET LEVEL
               └── Filter streets by: flood zones, noise,
                   school catchments, comparable sales

                   PROPERTY LEVEL
                   └── Individual property analysis:
                       price, condition, rental estimate,
                       growth projection, risk assessment

                              ↓

Phase 4: PROPERTY SHORTLIST
───────────────────────────
   Map shows: Heat map of suitable areas → Markers for matching properties
   List shows: Ranked properties with strategy-alignment scores

   User can:
   ├── Click properties for detailed analysis
   ├── Ask AI questions about specific properties
   ├── Adjust strategy parameters (AI updates recommendations)
   └── Save/compare shortlisted properties

                              ↓

Phase 5: DEEP DIVE & DECISION
─────────────────────────────
   Selected property shows:
   ├── Financial projections (cash flow, equity growth over time)
   ├── Risk analysis (market risk, property-specific risk)
   ├── Comparable analysis (recent sales, current listings)
   ├── Suburb report (full demographic & market data)
   └── AI assessment ("Why this property fits your strategy")
```

---

## Data Architecture

### Core Principle: Timeframe-Based Analysis

The specific factors are both **quantitative and qualitative** and should be interpreted together to holistically assess capital growth prospects. Our data framework is organized by:

1. **Geographic Layer** - National → City/Town → Suburb → Street → Property
2. **Timeframe** - Short-term (0-5 years) vs Long-term (6-15 years)
3. **Control** - Within investor control vs Outside investor control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA HIERARCHY WITH TIMEFRAMES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    0-5 YEARS (Actionable)    │    6-15 YEARS (Strategic)    │
│                                              │                               │
│  NATIONAL ─────────────────────────────────────────────────────────────────  │
│  │ • Government incentives                   │ • Political stability         │
│  │ • Credit availability                     │   (outside investor control)  │
│  │ • Cash rate                               │                               │
│  │ • Consumer confidence                     │                               │
│  │ • GDP growth                              │                               │
│  │ • Employment levels                       │                               │
│  │                                           │                               │
│  CITY/TOWN ────────────────────────────────────────────────────────────────  │
│  │ • Job infrastructure                      │ • Industry diversity          │
│  │ • Building approvals                      │ • Housing affordability       │
│  │ • Job advertisements                      │                               │
│  │                                           │                               │
│  SUBURB ───────────────────────────────────────────────────────────────────  │
│  │ • Vacancy rate           • Gross yield    │ • Amenities (schools/transit) │
│  │ • Auction clearance      • Stock on mkt   │ • Proximity to employment     │
│  │ • Days on market         • Demand-Supply  │ • Income growth trends        │
│  │ • Vendor discounting     • Rental growth  │ • Professionals % growth      │
│  │ • Online search interest                  │ • Median value long-term      │
│  │ • Building approvals                      │ • Mortgage affordability      │
│  │ • Developable land supply                 │ • Rent affordability          │
│  │ • Accessibility infrastructure            │                               │
│  │                                           │                               │
│  STREET ───────────────────────────────────────────────────────────────────  │
│  │ • Flood/fire zones       • Comparable sales                               │
│  │ • Traffic volumes        • School catchments                              │
│  │                                                                           │
│  PROPERTY ─────────────────────────────────────────────────────────────────  │
│    • Address, land size, bedrooms, last sale, rental estimate                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Delivery Layer

External data sources are accessed through **Model Context Protocol (MCP) servers**, providing a unified tool interface for both AI agents and background jobs.

| MCP Server | Data Domain | Tools Provided |
|------------|-------------|----------------|
| `mcp-domain` | Domain.com.au | Property search, suburb stats, sales history, auctions |
| `mcp-realestate` | RealEstate.com.au | Property search, suburb profile, sold properties |
| `mcp-market-data` | RBA, ABS | Cash rate, economic indicators, demographics, building approvals |

> **Technical Reference**: See [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md) for implementation details.

### Data Indicators Summary by Level

> **Full detailed indicator reference**: See [DATA-INDICATORS.md](./DATA-INDICATORS.md)

#### 1. National Level (Australia)

**Short-term (0-5 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Government incentives | Policy-driven (zoned) | FirstHome.gov.au, ATO, State treasuries |
| Availability of credit | RBA lending reports | RBA Statistics |
| Official cash rate | Set by RBA monthly | RBA Cash Rate |
| Consumer confidence | Index (monthly) | Westpac-Melbourne Index |
| GDP growth | (GDP Current - Previous) / Previous × 100 | ABS National Accounts |
| Employment levels | Employed / Labour Force × 100 | ABS Labour Force |

**Long-term (6-15 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Political stability | Qualitative governance index | OECD Australia |

#### 2. City/Town Level

**Short-term (0-5 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Job infrastructure | Qualitative observation | Infrastructure Australia, Google Maps |
| Building approvals | Total Approved Units / Time Period | ABS Building Approvals |
| Job advertisements | Count listings per region | SEEK, CareerOne, Jobs & Skills Gov |

**Long-term (6-15 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Industry diversity | Jobs per Industry / Total Jobs × 100 | ABS Census Employment |
| Housing affordability | Median Property Price / Median Income | ABS + Domain + REA |

#### 3. Suburb Level

**Short-term (0-5 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Vacancy rate | Vacant / Total Rentals × 100 | Domain Rental Report |
| Auction clearance rate | Sold Auctions / Total Auctions × 100 | Domain, REA Auctions |
| Days on market | Sale Date - List Date | Domain, REA Listings |
| Vendor discounting | (List Price - Sale Price) / List Price × 100 | Domain, REA Insights |
| Gross yield | Annual Rent / Property Price × 100 | Domain Rental Yield |
| Stock on market | Total Listings per 30 days | Domain Listings |
| Demand-Supply Ratio | Searches / Listings | REA Insights |
| Rental growth | (Current Rent - Rent Year Ago) / Rent Year Ago × 100 | Domain Rent Report |
| Online search interest | Search volume trends | REA Insights |
| Median value growth | (Current - Previous) / Previous × 100 | Domain, CoreLogic |

**Long-term (6-15 years)**
| Indicator | Formula/Method | Primary Source |
|-----------|----------------|----------------|
| Amenities | Qualitative (schools, transit, shops) | MySchool, WalkScore, Google Maps |
| Proximity to employment | Distance (km) or commute time | Google Maps |
| Income growth | (Recent - Past Income) / Past × 100 | ABS Census |
| Mortgage affordability | Monthly Payment / Monthly Income × 100 | ABS + Domain |
| Rent affordability | Monthly Rent / Monthly Income × 100 | ABS + Domain |

#### 4. Additional Risk & Opportunity Indicators

| Indicator | Formula/Method | Why It Matters |
|-----------|----------------|----------------|
| Price Volatility Index | Std Dev / Average Price × 100 | Assess suburb-level risk |
| Population Growth | (New Pop - Old Pop) / Old Pop × 100 | Predict demand trajectory |
| Owner-Occupier vs Investor Ratio | Investor-owned / Total × 100 | Housing stability indicator |
| Infrastructure Pipeline Score | Qualitative (project count/value) | Forecast value uplift |
| Mortgage Stress Level | % paying >30% income on loans | Measure market fragility |
| Time to Rent vs Sell | Avg Rent Days vs Avg Sell Days | Understand liquidity |

### Data Source Registry

| Category | Sources |
|----------|---------|
| **Property Data** | Domain API, REA, CoreLogic, PropTrack, Pricefinder |
| **Government/Policy** | FirstHome.gov.au, ATO, State Treasury portals, QRO |
| **Economic** | RBA, ABS (GDP, Labour Force, Census), Westpac-Melbourne Index |
| **Infrastructure** | Infrastructure Australia, State planning portals |
| **Employment** | Jobs & Skills Gov, SEEK, CareerOne |
| **Amenities** | MySchool, WalkScore, Google Maps |
| **Risk Data** | Digital Finance Analytics, State flood/fire mapping |

---

## AI Agent Architecture

### Agent Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPURE AI AGENTS                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   STRATEGIST    │     │    ANALYST      │     │   RESEARCHER    │
│     AGENT       │     │     AGENT       │     │     AGENT       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • Discovery     │     │ • Financial     │     │ • Market data   │
│   questions     │     │   modeling      │     │   gathering     │
│ • Strategy      │     │ • Risk          │     │ • Suburb        │
│   recommendation│     │   assessment    │     │   research      │
│ • Goal          │     │ • Cash flow     │     │ • Comparable    │
│   clarification │     │   projections   │     │   analysis      │
│ • Constraint    │     │ • Portfolio     │     │ • News &        │
│   identification│     │   optimization  │     │   developments  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   ORCHESTRATOR AGENT  │
                    ├───────────────────────┤
                    │ • Coordinates agents  │
                    │ • Manages context     │
                    │ • Synthesizes outputs │
                    │ • Updates UI state    │
                    └───────────────────────┘
```

### Conversation Flow

1. **Orchestrator** receives user message
2. Routes to **Strategist** for discovery/strategy questions
3. **Strategist** determines information needed
4. **Researcher** gathers relevant market data
5. **Analyst** runs calculations on strategy viability
6. **Orchestrator** synthesizes and responds to user
7. **Orchestrator** triggers map/list updates via state change

---

## Technical Architecture (High Level)

### Frontend
```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15+)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  │  ┌─────────────────────────────────┐│
│  │    LEFT PANEL       │  │  │        RIGHT PANEL              ││
│  │                     │  │  │                                 ││
│  │  ┌───────────────┐  │  │  │  ┌───────────────────────────┐ ││
│  │  │ Chat Messages │  │  │  │  │      MAP COMPONENT        │ ││
│  │  │               │  │  │  │  │   (Mapbox/Google Maps)    │ ││
│  │  │ • AI messages │  │  │  │  │                           │ ││
│  │  │ • User input  │  │  │  │  │   • Heat maps             │ ││
│  │  │ • Strategy    │  │  │  │  │   • Property markers      │ ││
│  │  │   cards       │  │  │  │  │   • Suburb boundaries     │ ││
│  │  │ • Data viz    │  │  │  │  │   • Zoom/filter controls  │ ││
│  │  │               │  │  │  │  │                           │ ││
│  │  └───────────────┘  │  │  │  └───────────────────────────┘ ││
│  │                     │  │  │                                 ││
│  │  ┌───────────────┐  │  │  │  ┌───────────────────────────┐ ││
│  │  │ Input Area    │  │  │  │  │     PROPERTY LIST         │ ││
│  │  │               │  │  │  │  │                           │ ││
│  │  │ [Type here...]│  │  │  │  │   • Sorted by strategy    │ ││
│  │  │               │  │  │  │  │     alignment score       │ ││
│  │  └───────────────┘  │  │  │  │   • Key metrics shown     │ ││
│  │                     │  │  │  │   • Quick actions         │ ││
│  └─────────────────────┘  │  │  │                           │ ││
│                           │  │  └───────────────────────────┘ ││
│                           │  │                                 ││
│                           │  └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   API Layer  │  │  AI Service  │  │   Background Jobs    │   │
│  │  (Next.js    │  │ (Vercel AI   │  │     (Inngest)        │   │
│  │   API Routes)│  │  SDK+Gemini) │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                    │                 │
│         └─────────────────┼────────────────────┘                 │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────────┐│
│  │                   MCP SERVER LAYER                          ││
│  ├─────────────────┬─────────────────┬─────────────────────────┤│
│  │   MCP-DOMAIN    │  MCP-REALESTATE │    MCP-MARKET-DATA     ││
│  │   (Domain.com)  │  (REA.com.au)   │    (RBA, ABS)          ││
│  └─────────────────┴─────────────────┴─────────────────────────┘│
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │    DATABASE     │                            │
│                  │  (PostgreSQL +  │                            │
│                  │   PostGIS for   │                            │
│                  │   geo queries)  │                            │
│                  └─────────────────┘                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              EXTERNAL DATA INTEGRATIONS                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ • Property data APIs (Domain, REA) via MCP servers          ││
│  │ • ABS Census data via MCP-MARKET-DATA                       ││
│  │ • RBA rates & economic indicators via MCP-MARKET-DATA       ││
│  │ • Mapping services (MapLibre + deck.gl)                     ││
│  │ • Financial calculators (built-in AI tools)                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## MVP Scope (Phase 1)

### In Scope
- [ ] AI chat interface for strategy discovery
- [ ] 3 core strategies: Cash Flow, Capital Growth, Renovation
- [ ] Basic user profiling questions
- [ ] Interactive map with suburb-level filtering
- [ ] Property list with basic metrics
- [ ] Suburb-level data display
- [ ] Property detail view with key stats
- [ ] User accounts & saved searches

### Out of Scope (Future Phases)
- SMSF compliance checking
- Commercial property analysis
- Portfolio management dashboard
- Automated due diligence reports
- Integration with mortgage brokers
- Mobile native apps
- Multi-property comparison tool
- Investment scenario modeling

---

## Success Metrics

### User Metrics
- Time to strategy identification (target: <15 min conversation)
- Properties shortlisted per session
- Return user rate
- Conversion to property inquiry

### Product Metrics
- Strategy recommendation accuracy (user feedback)
- Property match relevance score
- Data freshness (how current is market data)
- AI response time

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| Data accuracy/freshness | Multiple data source validation, clear timestamps |
| AI hallucination on property data | Ground AI responses in database facts, cite sources |
| Regulatory (financial advice) | Clear disclaimers, general education not personal advice |
| Data licensing costs | Start with open/affordable sources, scale with revenue |
| User trust in AI recommendations | Transparent reasoning, show data behind suggestions |

---

## Next Steps

1. **Finalize data sources** - Identify and secure property data APIs
2. **Create PRD** - Detailed product requirements for MVP
3. **Design wireframes** - UI/UX for both panels
4. **Technical spike** - Validate AI agent architecture
5. **Data model design** - Database schema for property & user data

---

## Appendix A: Data Sources (Australia)

### Property Data
| Source | Data Provided | Access | MCP Server |
|--------|---------------|--------|------------|
| **Domain API** | Listings, price estimates, rental data | API (paid tiers) | `mcp-domain` |
| **REA Group** | Listings, auction results, search interest | API/Partnership | `mcp-realestate` |
| **CoreLogic** | Comprehensive property data, valuations | Paid subscription | *Planned* |
| **PropTrack** | Property valuations, market trends | Paid subscription | *Planned* |
| **Pricefinder** | Sales history, comparable sales | Paid subscription | *Planned* |

### Government & Policy
| Source | Data Provided | URL |
|--------|---------------|-----|
| **FirstHome.gov.au** | First home buyer grants & schemes | firsthome.gov.au |
| **ATO** | Tax incentives, FHSS scheme | ato.gov.au |
| **QRO (QLD)** | State-specific grants & concessions | qro.qld.gov.au |
| **Treasury** | Housing policy, budget measures | treasury.gov.au |
| **Infrastructure Australia** | Major project pipeline | infrastructureaustralia.gov.au |

### Economic & Demographic
| Source | Data Provided | URL | MCP Server |
|--------|---------------|-----|------------|
| **RBA** | Cash rate, lending data, economic reports | rba.gov.au | `mcp-market-data` |
| **ABS** | Census, GDP, labour force, building approvals | abs.gov.au | `mcp-market-data` |
| **Westpac-Melbourne Institute** | Consumer confidence index | westpac.com.au | *Planned* |
| **OECD** | Political stability, governance indicators | oecd.org/australia | *Planned* |
| **Jobs & Skills Australia** | Labour market insights, occupation profiles | jobsandskills.gov.au | *Planned* |

### Employment & Jobs
| Source | Data Provided | URL |
|--------|---------------|-----|
| **SEEK** | Job advertisements by region/occupation | seek.com.au |
| **CareerOne** | Job listings data | careerone.com.au |

### Amenities & Livability
| Source | Data Provided | URL |
|--------|---------------|-----|
| **MySchool** | School ratings, NAPLAN results | myschool.edu.au |
| **WalkScore** | Walkability, transit scores | walkscore.com |
| **Google Maps** | Commute times, nearby amenities | maps.google.com |

### Risk & Compliance
| Source | Data Provided | Access |
|--------|---------------|--------|
| **Digital Finance Analytics** | Mortgage stress data | Paid reports |
| **State Flood Mapping** | Flood zone data | State govt portals |
| **State Fire Services** | Bushfire risk zones | State govt portals |

---

## Appendix B: Related Documents

| Document | Purpose |
|----------|---------|
| [DATA-INDICATORS.md](./DATA-INDICATORS.md) | Full detailed indicator reference with sources, formulas, and effects |
| PRD.md (TBD) | Product Requirements Document |
| WIREFRAMES.md (TBD) | UI/UX wireframe documentation |
| DATA-MODEL.md (TBD) | Database schema and data model |

---

*Document Version: 1.1*
*Last Updated: December 2024*
*Status: Draft - Data indicators integrated*
