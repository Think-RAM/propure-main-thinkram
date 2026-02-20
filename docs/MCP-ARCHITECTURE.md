# Propure MCP Architecture

> **Purpose**: Technical documentation for the Model Context Protocol (MCP) implementation that powers data access for AI agents and background jobs.

---

## Overview

Propure uses a **distributed MCP system** with three specialized HTTP-based MCP servers, providing a unified tool interface for Australian property market data.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI Chat API (/api/chat)                                   │
│                    (Vercel AI SDK + Gemini)                                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ Uses MCP Tools
┌────────────────────────────────▼────────────────────────────────────────────┐
│                    MCP Client Factory                                        │
│                    (apps/web/lib/mcp/client.ts)                              │
│                                                                              │
│    • callMcpTool() - HTTP requests with retry logic                         │
│    • domainTools, realestateTools, marketTools - type-safe wrappers         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTP POST (JSON/JSON-RPC)
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MCP-DOMAIN    │  │ MCP-REALESTATE  │  │ MCP-MARKET-DATA │
│ /api/mcp/domain │  │ /api/mcp/rea    │  │ /api/mcp/market │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • search_props  │  │ • search_props  │  │ • get_rba_rates │
│ • get_details   │  │ • get_details   │  │ • get_economic  │
│ • get_suburb    │  │ • get_suburb    │  │ • get_abs_demos │
│ • get_sales     │  │ • get_sold      │  │ • get_building  │
│ • get_auctions  │  │ • get_agency    │  │ • get_pop_proj  │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │ Web Scraping / APIs
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    External Data Sources                                     │
│    Domain.com.au    │    RealEstate.com.au    │    RBA/ABS APIs            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. MCP Server Packages

### 1.1 mcp-domain (Domain.com.au)

**Package**: `packages/mcp-domain/src/server.ts`
**Endpoint**: `/api/mcp/domain`

| Tool | Description | Parameters |
|------|-------------|------------|
| `search_properties` | Search property listings | suburbs, state, priceRange, beds, propertyType |
| `get_property_details` | Full property details | listingId |
| `get_suburb_stats` | Suburb market metrics | suburb, state, postcode |
| `get_sales_history` | Historical sales for address | address, suburb, state |
| `get_agent_info` | Real estate agent profile | agentId |
| `get_auction_results` | Recent auction data | suburb, state |

### 1.2 mcp-realestate (RealEstate.com.au)

**Package**: `packages/mcp-realestate/src/server.ts`
**Endpoint**: `/api/mcp/realestate`

| Tool | Description | Parameters |
|------|-------------|------------|
| `search_properties` | Search property listings | suburbs, state, priceRange, beds |
| `get_property_details` | Property details from REA | listingId |
| `get_suburb_profile` | Demographics and trends | suburb, state, postcode |
| `get_sold_properties` | Recently sold properties | suburb, state, postcode |
| `get_agency_listings` | All listings from agency | agencyId |

### 1.3 mcp-market-data (RBA/ABS)

**Package**: `packages/mcp-market-data/src/server.ts`
**Endpoint**: `/api/mcp/market`

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_rba_rates` | RBA cash rate + lending rates | includeHistorical, includeLendingRates |
| `get_economic_indicators` | GDP, inflation, unemployment | none |
| `get_abs_demographics` | Population, income, tenure | suburb, lga, state |
| `get_building_approvals` | Dwelling construction trends | state |
| `get_population_projections` | Growth forecasts | state |

### 1.4 mcp-shared (Shared Utilities)

**Package**: `packages/mcp-shared/src/`

| Module | Purpose |
|--------|---------|
| `schemas/index.ts` | Zod schemas for PropertyListing, SuburbStats, etc. |
| `parsers/domain-parser.ts` | HTML parsing for Domain.com.au |
| `parsers/rea-parser.ts` | HTML parsing for RealEstate.com.au |
| `oxylabs/web-unblocker.ts` | Web scraping client (Oxylabs) |
| `rate-limiter.ts` | Token bucket rate limiting |

---

## 2. MCP Client Architecture

### 2.1 Client Factory

**File**: `apps/web/lib/mcp/client.ts`

The MCP client provides type-safe wrappers with automatic retry logic:

```typescript
// HTTP client with retry
async function callMcpTool<T>(
  server: 'domain' | 'realestate' | 'market',
  tool: string,
  params: Record<string, any>,
  options?: { maxRetries?: number; timeout?: number }
): Promise<T>

// Type-safe tool wrappers
export const domainTools = {
  searchProperties: (params) => callMcpTool<PropertySearchResponse>('domain', 'search_properties', params),
  getSuburbStats: (suburb, state, postcode?) => callMcpTool<SuburbStats>('domain', 'get_suburb_stats', { suburb, state, postcode }),
  getSalesHistory: (address, suburb, state) => callMcpTool<SaleRecord[]>('domain', 'get_sales_history', { address, suburb, state }),
  getAuctionResults: (suburb, state) => callMcpTool<AuctionResult[]>('domain', 'get_auction_results', { suburb, state }),
}

export const realestateTools = {
  searchProperties: (params) => callMcpTool<PropertySearchResponse>('realestate', 'search_properties', params),
  getSuburbProfile: (suburb, state, postcode?) => callMcpTool<SuburbProfile>('realestate', 'get_suburb_profile', { suburb, state, postcode }),
  getSoldProperties: (suburb, state, postcode?) => callMcpTool<PropertyListing[]>('realestate', 'get_sold_properties', { suburb, state, postcode }),
}

export const marketTools = {
  getRbaRates: (includeHistorical?, includeLendingRates?) => callMcpTool<RbaRates>('market', 'get_rba_rates', { includeHistorical, includeLendingRates }),
  getEconomicIndicators: () => callMcpTool<EconomicIndicators>('market', 'get_economic_indicators', {}),
  getAbsDemographics: (suburb?, lga?, state?) => callMcpTool<Demographics>('market', 'get_abs_demographics', { suburb, lga, state }),
  getPopulationProjections: (state?) => callMcpTool<PopulationProjections>('market', 'get_population_projections', { state }),
}
```

### 2.2 Retry Logic

The client implements exponential backoff with intelligent retry detection:

- **Max Retries**: 3 (configurable)
- **Base Delay**: 1 second, doubling each retry
- **Retryable Errors**: 5xx status, 429 rate limits, network errors
- **Retry-After**: Respects server-provided retry headers
- **Timeout**: 30 seconds default

### 2.3 Endpoint Configuration

```typescript
const MCP_ENDPOINTS = {
  domain: process.env.MCP_DOMAIN_URL || '/api/mcp/domain',
  realestate: process.env.MCP_REALESTATE_URL || '/api/mcp/realestate',
  market: process.env.MCP_MARKET_URL || '/api/mcp/market',
}
```

---

## 3. API Route Implementation

### 3.1 Request Format

MCP endpoints accept two call styles:

**JSON-RPC Style**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "search_properties",
    "arguments": { "suburbs": ["Ipswich"], "state": "QLD" }
  },
  "id": 1
}
```

**Direct Style**:
```json
{
  "tool": "search_properties",
  "arguments": { "suburbs": ["Ipswich"], "state": "QLD" }
}
```

### 3.2 Response Format

**Success**:
```json
{
  "result": {
    "listings": [...],
    "totalCount": 42,
    "hasMore": true
  }
}
```

**Error**:
```json
{
  "error": {
    "code": -32602,
    "message": "Invalid params: 'state' is required"
  }
}
```

### 3.3 Authentication

```typescript
// Optional authentication when MCP_INTERNAL_TOKEN is set
const token = process.env.MCP_INTERNAL_TOKEN
if (token) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${token}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

---

## 4. Integration with AI Agents

### 4.1 Current Implementation

The chat API (`apps/web/app/api/chat/route.ts`) exposes MCP tools to Gemini:

```typescript
tools: {
  searchDomainProperties: tool({
    description: 'Search Domain.com.au property listings',
    parameters: z.object({
      suburbs: z.array(z.string()).optional(),
      state: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      // ...
    }),
    execute: async (params) => {
      return domainTools.searchProperties(params)
    }
  }),

  getSuburbStats: tool({
    description: 'Get suburb market statistics',
    parameters: z.object({
      suburb: z.string(),
      state: z.string(),
      postcode: z.string().optional(),
    }),
    execute: async (params) => {
      return domainTools.getSuburbStats(params.suburb, params.state, params.postcode)
    }
  }),

  // ... 13 more tools
}
```

### 4.2 AI Tools Registry

| AI Tool Name | MCP Server | MCP Tool |
|--------------|------------|----------|
| `searchDomainProperties` | domain | `search_properties` |
| `searchRealestateProperties` | realestate | `search_properties` |
| `getSuburbStats` | domain | `get_suburb_stats` |
| `getSuburbProfile` | realestate | `get_suburb_profile` |
| `getSalesHistory` | domain | `get_sales_history` |
| `getSoldProperties` | realestate | `get_sold_properties` |
| `getAuctionResults` | domain | `get_auction_results` |
| `getRbaRates` | market | `get_rba_rates` |
| `getEconomicIndicators` | market | `get_economic_indicators` |
| `getDemographics` | market | `get_abs_demographics` |
| `getPopulationProjections` | market | `get_population_projections` |
| `calculateCashFlow` | *built-in* | - |
| `calculateROI` | *built-in* | - |
| `saveStrategy` | *built-in* | - |

---

## 5. Background Jobs (Inngest)

MCP tools power background data synchronization:

### 5.1 Scheduled Jobs

| Function | Schedule | MCP Tools Used |
|----------|----------|----------------|
| `sync-domain-listings` | Daily 3 AM AEST | `domainTools.searchProperties` |
| `sync-realestate-listings` | Daily 4 AM AEST | `realestateTools.searchProperties` |
| `refresh-market-indicators` | Daily 4 AM AEST | `marketTools.getRbaRates`, `getEconomicIndicators`, `getAbsDemographics` |
| `calculate-suburb-metrics` | Triggered by sync | Aggregates from database |

### 5.2 Data Flow

```
Inngest Scheduler
       │
       ▼
┌──────────────────────────────┐
│ sync-domain-listings.ts      │
│                              │
│ 1. Query stale suburbs       │
│ 2. Call domainTools.search   │
│ 3. Transform to schema       │
│ 4. Upsert to Property table  │
│ 5. Emit metrics event        │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ calculate-suburb-metrics.ts  │
│                              │
│ 1. Aggregate property data   │
│ 2. Calculate median, yield   │
│ 3. Upsert SuburbMetric       │
└──────────────────────────────┘
```

---

## 6. Mock Mode

For development and demos without external API keys:

```bash
# Enable mock mode
MCP_MOCK_MODE=true

# Run development server
pnpm dev
```

Mock mode:
- Returns realistic sample data
- No external API calls
- No rate limiting
- Instant responses

---

## 7. Environment Variables

```bash
# MCP Internal Token (required for production)
MCP_INTERNAL_TOKEN=your-secure-token-here

# Mock Mode (development only)
MCP_MOCK_MODE=true

# Custom Endpoints (optional)
MCP_DOMAIN_URL=/api/mcp/domain
MCP_REALESTATE_URL=/api/mcp/realestate
MCP_MARKET_URL=/api/mcp/market

# Oxylabs (required for scraping in production)
OXYLABS_USERNAME=your-username
OXYLABS_PASSWORD=your-password
```

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `apps/web/lib/mcp/client.ts` | HTTP client factory with retry logic |
| `apps/web/app/api/mcp/domain/route.ts` | Domain MCP server endpoint |
| `apps/web/app/api/mcp/realestate/route.ts` | RealEstate MCP server endpoint |
| `apps/web/app/api/mcp/market/route.ts` | Market Data MCP server endpoint |
| `packages/mcp-domain/src/server.ts` | Domain tool definitions |
| `packages/mcp-realestate/src/server.ts` | RealEstate tool definitions |
| `packages/mcp-market-data/src/server.ts` | Market Data tool definitions |
| `packages/mcp-shared/src/schemas/index.ts` | Shared Zod schemas |
| `packages/mcp-shared/src/parsers/*.ts` | HTML parsers |
| `apps/web/app/api/chat/route.ts` | AI chat API with MCP tools |
| `apps/web/inngest/functions/*.ts` | Background jobs using MCP |

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| [STRATEGY.md](./STRATEGY.md) | Product strategy & user journeys |
| [AI-AGENTS.md](./AI-AGENTS.md) | AI agent architecture |
| [DATA-INDICATORS.md](./DATA-INDICATORS.md) | Market data definitions |
| [PRD.md](./PRD.md) | Product requirements |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Status: Active*
