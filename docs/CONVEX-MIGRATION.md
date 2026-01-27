# Convex Migration Path

> **Purpose**: Step-by-step migration plan for moving Propure's backend from Prisma/Neon + Pusher + Inngest + Upstash to Convex as a unified platform.
>
> **Related ADRs**: [ADR-009](./adr/009-convex-unified-backend.md) | [ADR-010](./adr/010-geospatial-bounding-box-strategy.md) | [ADR-011](./adr/011-convex-agent-multi-agent-orchestration.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Package Structure](#2-package-structure)
3. [Schema Migration](#3-schema-migration)
4. [Agent Architecture](#4-agent-architecture)
5. [Frontend Changes](#5-frontend-changes)
6. [Background Jobs](#6-background-jobs)
7. [Environment Variables](#7-environment-variables)
8. [Branch Coordination](#8-branch-coordination)
9. [Data Migration](#9-data-migration)

---

## 1. Architecture Overview

### Before (Current)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 (Vercel)                   │
│                                                          │
│  API Routes ──► Prisma ──► Neon PostgreSQL               │
│  API Routes ──► Pusher (WebSocket events)                │
│  API Routes ──► Inngest (background jobs)                │
│  API Routes ──► Upstash Redis (cache/rate limit)         │
│  API Routes ──► Vercel AI SDK ──► Gemini                 │
│                                                          │
│  Frontend ◄──── Pusher Client (real-time updates)        │
└─────────────────────────────────────────────────────────┘
         │              │             │           │
         ▼              ▼             ▼           ▼
    ┌─────────┐   ┌──────────┐  ┌─────────┐  ┌────────┐
    │  Neon   │   │  Pusher  │  │ Inngest │  │Upstash │
    │ PostGIS │   │  WS Hub  │  │  Jobs   │  │ Redis  │
    └─────────┘   └──────────┘  └─────────┘  └────────┘
```

### After (Convex)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 (Vercel)                   │
│                                                          │
│  Frontend ◄──── ConvexProvider (WebSocket)               │
│  useQuery() ──► Convex (reactive subscriptions)          │
│  useMutation() ──► Convex (writes)                       │
│  useAction() ──► Convex (AI, external APIs)              │
│                                                          │
│  Server Components ──► Convex (preloaded queries)        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │      Convex      │
              │                  │
              │  ┌────────────┐  │
              │  │  Database  │  │  ◄── Replaces Neon/Prisma
              │  └────────────┘  │
              │  ┌────────────┐  │
              │  │ Subscriptions│ │  ◄── Replaces Pusher
              │  └────────────┘  │
              │  ┌────────────┐  │
              │  │ Scheduler  │  │  ◄── Replaces Inngest
              │  │ + Workflow │  │
              │  └────────────┘  │
              │  ┌────────────┐  │
              │  │   Agent    │  │  ◄── Replaces chat API routes
              │  │ Component  │  │
              │  └────────────┘  │
              └──────────────────┘
```

### What Convex Replaces

| Current Service | Convex Replacement | Notes |
|----------------|-------------------|-------|
| Neon PostgreSQL + Prisma | Convex document DB + indexes | See schema migration (Section 3) |
| Pusher | Convex reactive queries (WebSocket) | Automatic, no channel management |
| Inngest | Convex Scheduler + Workflow Component | Cron + durable steps |
| Upstash Redis | Convex query caching (built-in) | Rate limiting via Convex actions |

### What Stays the Same

| Component | Status |
|-----------|--------|
| Next.js 15 (App Router) | Stays |
| Clerk Authentication | Stays (integrated via `ConvexProviderWithClerk`) |
| MapLibre GL + deck.gl | Stays |
| shadcn/ui + Tailwind CSS v4 | Stays |
| MCP Servers (Domain, REA, Market Data) | Stays (called from Convex Actions) |
| Zustand (client state) | Stays (reduced scope — Convex handles server state) |
| Gemini 2.5 Flash | Stays (via `@ai-sdk/google`) |
| Vercel hosting | Stays |

---

## 2. Package Structure

### New Package: `packages/convex/` (`@propure/convex`)

Following the [official Convex monorepo pattern](https://docs.convex.dev/production/project-configuration):

```
packages/convex/
├── package.json                    # @propure/convex
├── convex.json                     # Convex project configuration
├── convex/
│   ├── _generated/                 # Auto-generated (Convex CLI)
│   │   ├── api.d.ts
│   │   ├── api.js
│   │   ├── dataModel.d.ts
│   │   └── server.d.ts
│   │
│   ├── convex.config.ts            # Component registration
│   ├── auth.config.ts              # Clerk auth configuration
│   ├── schema.ts                   # Database schema
│   │
│   ├── functions/                  # Query/Mutation/Action functions
│   │   ├── users.ts                # User sync + queries
│   │   ├── strategies.ts           # Strategy CRUD
│   │   ├── properties.ts           # Property queries + geo search
│   │   ├── suburbs.ts              # Suburb queries
│   │   ├── metrics.ts              # Suburb metrics + market indicators
│   │   ├── agents-rpc.ts           # Agent RPC (Real Estate Agent model)
│   │   ├── agencies.ts             # Agency queries
│   │   ├── priceHistory.ts         # Price history queries
│   │   ├── sales.ts                # Sale records + auction results
│   │   ├── infrastructure.ts       # Infrastructure project queries
│   │   └── savedSearches.ts        # Saved search CRUD
│   │
│   ├── agents/                     # AI Agent definitions
│   │   ├── orchestrator.ts
│   │   ├── strategist.ts
│   │   ├── researcher.ts
│   │   ├── analyst.ts
│   │   └── tools/                  # Agent tools
│   │       ├── strategy-tools.ts   # createTool: DB access
│   │       ├── search-tools.ts     # createTool: property search
│   │       ├── analysis-tools.ts   # tool(): pure calculations
│   │       ├── ui-tools.ts         # createTool: UI state updates
│   │       └── mcp-tools.ts        # action: external MCP calls
│   │
│   ├── actions/                    # Convex Actions (side effects)
│   │   ├── mcp.ts                  # MCP server HTTP calls
│   │   └── ai.ts                   # AI model invocations
│   │
│   ├── workflows/                  # Durable workflows
│   │   ├── dataSync.ts             # Property data sync workflow
│   │   ├── suburbScoring.ts        # Suburb metric calculation
│   │   └── aiInsights.ts           # AI-powered market insights
│   │
│   ├── crons.ts                    # Scheduled jobs (cron definitions)
│   │
│   └── lib/                        # Shared utilities
│       ├── geo.ts                  # Haversine, bounding box helpers
│       ├── financial.ts            # ROI, cash flow calculations
│       └── validators.ts           # Input validation helpers
│
└── tsconfig.json
```

### `convex.config.ts`

```typescript
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import workflow from "@convex-dev/workflow/convex.config";

const app = defineApp();
app.use(agent);
app.use(workflow);

export default app;
```

### `convex.json`

```json
{
  "functions": "convex/",
  "node": {
    "externalPackages": ["@ai-sdk/google"]
  }
}
```

### Replaces: `packages/db/` (`@propure/db`)

The existing `packages/db/` (Prisma schema, migrations, client) is fully replaced by `packages/convex/`. Remove after migration is complete.

---

## 3. Schema Migration

### Full Mapping: Prisma Models → Convex Tables

| # | Prisma Model | Convex Table | Key Changes |
|---|-------------|-------------|-------------|
| 1 | `User` | `users` | `clerkUserId` is primary lookup; no `Account`/`Session` tables needed (Clerk handles auth) |
| 2 | `Account` | *(removed)* | Clerk manages OAuth accounts directly |
| 3 | `Session` | *(removed)* | Clerk manages sessions directly |
| 4 | `Strategy` | `strategies` | `userId` becomes `v.id("users")`; enums become `v.union(v.literal(...))` |
| 5 | `ChatSession` | *(replaced)* | Replaced by Agent Component thread management |
| 6 | `ChatMessage` | *(replaced)* | Replaced by Agent Component message storage |
| 7 | `SavedSearch` | `savedSearches` | `filters` and `results` stay as `v.any()` (JSON equivalent) |
| 8 | `State` | `states` | Simple string fields |
| 9 | `City` | `cities` | `stateId` becomes `v.id("states")` |
| 10 | `Suburb` | `suburbs` | Add `centroidLat`/`centroidLng` as `v.float64()`; boundary as `v.optional(v.string())` GeoJSON |
| 11 | `Property` | `properties` | `lat`/`lng` as `v.float64()`; `suburbId` becomes `v.id("suburbs")` |
| 12 | `SuburbMetric` | `suburbMetrics` | Composite unique replaced by compound index |
| 13 | `Agent` (RE) | `realEstateAgents` | Renamed to avoid collision with AI Agent concept |
| 14 | `Agency` | `agencies` | Straightforward mapping |
| 15 | `PriceHistory` | `priceHistory` | `propertyId` becomes `v.id("properties")` |
| 16 | `SaleRecord` | `saleRecords` | Direct mapping |
| 17 | `AuctionResult` | `auctionResults` | Direct mapping |
| 18 | `InfrastructureProject` | `infrastructureProjects` | `suburbs` array stays as `v.array(v.string())` |
| 19 | `MarketIndicator` | `marketIndicators` | Composite unique replaced by compound index |

### Enum Handling

Prisma enums become `v.union(v.literal(...))` in Convex:

```typescript
// Prisma
enum StrategyType {
  CASH_FLOW
  CAPITAL_GROWTH
  RENOVATION_FLIP
  DEVELOPMENT
  SMSF
  COMMERCIAL
}

// Convex
const strategyType = v.union(
  v.literal("CASH_FLOW"),
  v.literal("CAPITAL_GROWTH"),
  v.literal("RENOVATION_FLIP"),
  v.literal("DEVELOPMENT"),
  v.literal("SMSF"),
  v.literal("COMMERCIAL")
);
```

All enums to convert:
- `StrategyType` (6 values)
- `StrategyStatus` (5 values)
- `PropertyType` (9 values)
- `ListingType` (4 values)
- `DataSource` (6 values)
- `ListingStatus` (5 values)

### Reference Handling

Prisma foreign keys become `v.id("tableName")`:

```typescript
// Prisma
model Property {
  suburbId  String
  suburb    Suburb @relation(fields: [suburbId], references: [id])
}

// Convex
properties: defineTable({
  suburbId: v.id("suburbs"),
  // No @relation — resolved via ctx.db.get(doc.suburbId)
})
```

**No CASCADE deletes** — implement in mutation functions:

```typescript
export const deleteSuburb = mutation({
  args: { id: v.id("suburbs") },
  handler: async (ctx, args) => {
    // Manual cascade: delete properties first
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_suburb", (q) => q.eq("suburbId", args.id))
      .collect();
    for (const prop of properties) {
      await ctx.db.delete(prop._id);
    }
    await ctx.db.delete(args.id);
  },
});
```

### What's NOT Migrated

| Prisma Model | Reason |
|-------------|--------|
| `ChatSession` | Replaced by `@convex-dev/agent` thread management. The Agent Component manages its own `threads` and `messages` tables internally. |
| `ChatMessage` | Same as above — messages are stored by the Agent Component with full tool call/result tracking. |
| `Account` | Clerk handles OAuth accounts. No application-level Account table needed. |
| `Session` | Clerk handles session management. No application-level Session table needed. |

### Full Schema Definition

```typescript
// packages/convex/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Enum validators
const strategyType = v.union(
  v.literal("CASH_FLOW"),
  v.literal("CAPITAL_GROWTH"),
  v.literal("RENOVATION_FLIP"),
  v.literal("DEVELOPMENT"),
  v.literal("SMSF"),
  v.literal("COMMERCIAL")
);

const strategyStatus = v.union(
  v.literal("DISCOVERY"),
  v.literal("ACTIVE"),
  v.literal("PAUSED"),
  v.literal("COMPLETED"),
  v.literal("ARCHIVED")
);

const propertyType = v.union(
  v.literal("HOUSE"),
  v.literal("APARTMENT"),
  v.literal("TOWNHOUSE"),
  v.literal("VILLA"),
  v.literal("UNIT"),
  v.literal("LAND"),
  v.literal("RURAL"),
  v.literal("COMMERCIAL"),
  v.literal("INDUSTRIAL")
);

const listingType = v.union(
  v.literal("SALE"),
  v.literal("RENT"),
  v.literal("SOLD"),
  v.literal("LEASED")
);

const dataSource = v.union(
  v.literal("DOMAIN"),
  v.literal("REALESTATE"),
  v.literal("CORELOGIC"),
  v.literal("ABS"),
  v.literal("RBA"),
  v.literal("MANUAL")
);

const listingStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("UNDER_CONTRACT"),
  v.literal("SOLD"),
  v.literal("WITHDRAWN"),
  v.literal("OFF_MARKET")
);

export default defineSchema({
  // ── Users ──
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // ── Strategies ──
  strategies: defineTable({
    userId: v.id("users"),
    type: strategyType,
    status: strategyStatus,
    params: v.optional(v.any()),
    budget: v.optional(v.float64()),
    deposit: v.optional(v.float64()),
    income: v.optional(v.float64()),
    riskTolerance: v.optional(v.string()),
    timeline: v.optional(v.string()),
    managementStyle: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // ── Saved Searches ──
  savedSearches: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    filters: v.any(),
    results: v.optional(v.any()),
  })
    .index("by_user", ["userId"]),

  // ── Location Hierarchy ──
  states: defineTable({
    name: v.string(),
    code: v.string(),
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  cities: defineTable({
    stateId: v.id("states"),
    name: v.string(),
  })
    .index("by_state", ["stateId"])
    .index("by_state_name", ["stateId", "name"]),

  suburbs: defineTable({
    cityId: v.id("cities"),
    name: v.string(),
    postcode: v.string(),
    centroidLat: v.optional(v.float64()),
    centroidLng: v.optional(v.float64()),
    boundaryGeoJson: v.optional(v.string()),
  })
    .index("by_city", ["cityId"])
    .index("by_postcode", ["postcode"])
    .index("by_city_name_postcode", ["cityId", "name", "postcode"])
    .index("by_centroid_lat", ["centroidLat"]),

  // ── Properties ──
  properties: defineTable({
    externalId: v.optional(v.string()),
    suburbId: v.id("suburbs"),
    address: v.string(),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    propertyType: propertyType,
    listingType: listingType,
    listingStatus: listingStatus,
    source: dataSource,
    sourceUrl: v.optional(v.string()),
    price: v.optional(v.float64()),
    rentWeekly: v.optional(v.float64()),
    bedrooms: v.optional(v.float64()),
    bathrooms: v.optional(v.float64()),
    carSpaces: v.optional(v.float64()),
    landSize: v.optional(v.float64()),
    buildingSize: v.optional(v.float64()),
    description: v.optional(v.string()),
    features: v.optional(v.any()),
    images: v.optional(v.any()),
    agentId: v.optional(v.id("realEstateAgents")),
    agencyId: v.optional(v.id("agencies")),
    scrapedAt: v.optional(v.float64()),
  })
    .index("by_external_id", ["externalId"])
    .index("by_suburb", ["suburbId"])
    .index("by_property_type", ["propertyType"])
    .index("by_listing_type", ["listingType"])
    .index("by_listing_status", ["listingStatus"])
    .index("by_source", ["source"])
    .index("by_price", ["price"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_location_lat", ["latitude"])
    .index("by_agent", ["agentId"])
    .index("by_agency", ["agencyId"]),

  // ── Suburb Metrics ──
  suburbMetrics: defineTable({
    suburbId: v.id("suburbs"),
    metricType: v.string(),
    value: v.float64(),
    source: v.optional(v.string()),
    recordedAt: v.float64(),
  })
    .index("by_suburb", ["suburbId"])
    .index("by_suburb_type", ["suburbId", "metricType"])
    .index("by_suburb_type_time", ["suburbId", "metricType", "recordedAt"])
    .index("by_metric_type", ["metricType"]),

  // ── Real Estate Agents (renamed from Agent to avoid AI Agent confusion) ──
  realEstateAgents: defineTable({
    externalId: v.optional(v.string()),
    source: dataSource,
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    agencyId: v.optional(v.id("agencies")),
  })
    .index("by_external_id", ["externalId"])
    .index("by_agency", ["agencyId"])
    .index("by_source", ["source"]),

  // ── Agencies ──
  agencies: defineTable({
    externalId: v.optional(v.string()),
    source: dataSource,
    name: v.string(),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  })
    .index("by_external_id", ["externalId"])
    .index("by_source", ["source"]),

  // ── Price History ──
  priceHistory: defineTable({
    propertyId: v.id("properties"),
    price: v.optional(v.float64()),
    priceType: v.string(),
    priceText: v.optional(v.string()),
    recordedAt: v.float64(),
    source: dataSource,
  })
    .index("by_property", ["propertyId"])
    .index("by_recorded_at", ["recordedAt"])
    .index("by_price_type", ["priceType"]),

  // ── Sale Records ──
  saleRecords: defineTable({
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.optional(v.string()),
    saleDate: v.float64(),
    salePrice: v.float64(),
    saleType: v.string(),
    source: dataSource,
    sourceUrl: v.optional(v.string()),
  })
    .index("by_suburb_state", ["suburb", "state"])
    .index("by_sale_date", ["saleDate"])
    .index("by_source", ["source"]),

  // ── Auction Results ──
  auctionResults: defineTable({
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    postcode: v.optional(v.string()),
    auctionDate: v.float64(),
    result: v.string(),
    guidePrice: v.optional(v.float64()),
    soldPrice: v.optional(v.float64()),
    bidderCount: v.optional(v.float64()),
    source: dataSource,
  })
    .index("by_suburb_state", ["suburb", "state"])
    .index("by_auction_date", ["auctionDate"])
    .index("by_result", ["result"]),

  // ── Infrastructure Projects ──
  infrastructureProjects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    status: v.string(),
    state: v.string(),
    suburbs: v.array(v.string()),
    estimatedCost: v.optional(v.float64()),
    completionDate: v.optional(v.float64()),
    sourceUrl: v.optional(v.string()),
  })
    .index("by_state", ["state"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // ── Market Indicators ──
  marketIndicators: defineTable({
    indicatorType: v.string(),
    scope: v.string(),
    value: v.float64(),
    unit: v.optional(v.string()),
    recordedAt: v.float64(),
    source: dataSource,
  })
    .index("by_type", ["indicatorType"])
    .index("by_scope", ["scope"])
    .index("by_type_scope", ["indicatorType", "scope"])
    .index("by_type_scope_time", ["indicatorType", "scope", "recordedAt"]),
});
```

---

## 4. Agent Architecture

### Agent Definitions

Four agents, all using Gemini 2.5 Flash via `@ai-sdk/google`:

```typescript
// packages/convex/convex/agents/orchestrator.ts
import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";

export const orchestrator = new Agent(components.agent, {
  name: "Orchestrator",
  chat: google("gemini-2.5-flash"),
  instructions: `You are the Propure AI assistant, helping users discover
their ideal property investment strategy in Australia. You coordinate between
specialist agents: Strategist, Analyst, and Researcher.

Route user requests to the appropriate agent(s), synthesize their outputs,
and present cohesive responses. Always maintain context of the user's
situation, goals, and current strategy.`,
  tools: [delegateToStrategist, delegateToAnalyst, delegateToResearcher, updateUI],
});
```

### Tool Types

| Type | Import | Database Access | Use Case |
|------|--------|----------------|----------|
| `createTool` | `@convex-dev/agent` | Yes (`ctx.db`) | Read/write Convex data |
| `tool()` | `ai` (Vercel AI SDK) | No | Pure calculations, formatting |

**`createTool` examples** (DB access):
```typescript
// Search properties with geospatial bounding box
const searchProperties = createTool({
  description: "Search properties within map bounds",
  args: {
    south: v.float64(),
    north: v.float64(),
    west: v.float64(),
    east: v.float64(),
    propertyType: v.optional(propertyType),
    maxPrice: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("properties")
      .withIndex("by_location_lat", (q) =>
        q.gte("latitude", args.south).lte("latitude", args.north)
      )
      .collect();

    return candidates.filter(
      (p) => p.longitude >= args.west && p.longitude <= args.east
    );
  },
});

// Create or update a strategy
const createStrategy = createTool({
  description: "Create a new investment strategy for the user",
  args: {
    type: strategyType,
    budget: v.optional(v.float64()),
    riskTolerance: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("strategies", {
      userId: user._id,
      type: args.type,
      status: "DISCOVERY",
      ...args,
    });
  },
});
```

**`tool()` examples** (pure computation):
```typescript
import { tool } from "ai";
import { z } from "zod";

const calculateCashFlow = tool({
  description: "Calculate annual cash flow and yield for a property",
  parameters: z.object({
    purchasePrice: z.number(),
    weeklyRent: z.number(),
    annualExpenses: z.number().optional().default(0),
    interestRate: z.number().optional().default(6.0),
    loanAmount: z.number().optional(),
  }),
  execute: async ({ purchasePrice, weeklyRent, annualExpenses, interestRate, loanAmount }) => {
    const annualRent = weeklyRent * 52;
    const grossYield = (annualRent / purchasePrice) * 100;
    const annualInterest = (loanAmount ?? purchasePrice * 0.8) * (interestRate / 100);
    const netCashFlow = annualRent - annualExpenses - annualInterest;

    return {
      grossYield: Math.round(grossYield * 100) / 100,
      annualRent,
      annualInterest: Math.round(annualInterest),
      netCashFlow: Math.round(netCashFlow),
      weeklyCashFlow: Math.round(netCashFlow / 52),
    };
  },
});
```

### MCP Integration

External MCP servers are called from Convex Actions via HTTP. The MCP servers (Domain, REA, Market Data) continue to run as separate services.

```typescript
// packages/convex/convex/actions/mcp.ts
import { action } from "../_generated/server";
import { v } from "convex/values";

export const callDomainMCP = action({
  args: {
    tool: v.string(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const url = process.env.MCP_DOMAIN_URL;
    const response = await fetch(`${url}/tools/${args.tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.input),
    });
    if (!response.ok) {
      throw new Error(`MCP Domain call failed: ${response.status}`);
    }
    return response.json();
  },
});

export const callRealestateMCP = action({
  args: { tool: v.string(), input: v.any() },
  handler: async (ctx, args) => {
    const url = process.env.MCP_REALESTATE_URL;
    const response = await fetch(`${url}/tools/${args.tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.input),
    });
    return response.json();
  },
});

export const callMarketDataMCP = action({
  args: { tool: v.string(), input: v.any() },
  handler: async (ctx, args) => {
    const url = process.env.MCP_MARKET_DATA_URL;
    const response = await fetch(`${url}/tools/${args.tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.input),
    });
    return response.json();
  },
});
```

### Streaming

The Agent Component handles streaming via Convex WebSocket:

```
User Message
    │
    ▼
orchestrator.generateText() or orchestrator.continueThread()
    │
    ├── saveStreamDeltas() ──► Persists tokens to thread messages
    │
    └── Frontend: useUIMessages(threadId) ──► Reactive subscription
         │
         └── Re-renders as tokens arrive over WebSocket
```

No HTTP SSE. No Pusher. The streaming is native to Convex's reactive query system.

---

## 5. Frontend Changes

### Provider Setup

Replace separate providers with `ConvexProviderWithClerk`:

```typescript
// apps/web/app/providers.tsx
"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### useConvexChat Hook

Replace `useChat` from `ai/react` with a Convex-native chat hook:

```typescript
// apps/web/hooks/useConvexChat.ts
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@propure/convex";
import { useState, useCallback } from "react";

export function useConvexChat(threadId?: string) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reactive query — updates automatically when messages change
  const messages = useQuery(
    api.agents.orchestrator.getThreadMessages,
    threadId ? { threadId } : "skip"
  );

  const sendMessage = useAction(api.agents.orchestrator.chat);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      await sendMessage({ message: input, threadId });
      setInput("");
    } finally {
      setIsLoading(false);
    }
  }, [input, threadId, sendMessage]);

  return {
    messages: messages ?? [],
    input,
    setInput,
    handleSubmit,
    isLoading,
  };
}
```

### Reactive Queries Replace Pusher

**Before** (Pusher):
```typescript
// Subscribe to Pusher channel for updates
useEffect(() => {
  const channel = pusherClient.subscribe(`private-user-${userId}`);
  channel.bind("search-results", (data) => setProperties(data.properties));
  channel.bind("ui-update", (data) => updateFilters(data.payload));
  return () => channel.unbind_all();
}, [userId]);
```

**After** (Convex reactive query):
```typescript
// Automatic reactivity — no subscription management
const properties = useQuery(api.functions.properties.search, {
  south: bounds.south,
  north: bounds.north,
  west: bounds.west,
  east: bounds.east,
  ...filters,
});
// Re-renders automatically when property data changes in Convex
```

### Map Integration

```typescript
// apps/web/components/map/property-map.tsx
import { useQuery } from "convex/react";
import { api } from "@propure/convex";

export function PropertyMap() {
  const [bounds, setBounds] = useState(null);

  // Reactive: auto-updates when properties change or bounds change
  const properties = useQuery(
    api.functions.properties.searchByBounds,
    bounds ? {
      south: bounds.south,
      north: bounds.north,
      west: bounds.west,
      east: bounds.east,
    } : "skip"
  );

  const onMoveEnd = useCallback((e) => {
    const b = e.target.getBounds();
    setBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, []);

  return (
    <Map onMoveEnd={onMoveEnd}>
      {properties?.map((p) => (
        <Marker key={p._id} longitude={p.longitude} latitude={p.latitude} />
      ))}
    </Map>
  );
}
```

---

## 6. Background Jobs

### Inngest → Convex Mapping

| Inngest Function | Convex Replacement | Type |
|-----------------|-------------------|------|
| `daily-property-sync` (cron 2am) | `crons.ts` + `workflows/dataSync.ts` | Cron → Workflow |
| `weekly-suburb-scoring` (cron Sunday 3am) | `crons.ts` + `workflows/suburbScoring.ts` | Cron → Workflow |
| `monthly-economic-update` (cron 1st) | `crons.ts` + `functions/metrics.ts` | Cron → Mutation |
| `property-search-workflow` (event) | `functions/properties.ts` | Query (reactive) |
| `suburb-analysis-workflow` (event) | `workflows/aiInsights.ts` | Workflow |

### Cron Jobs

```typescript
// packages/convex/convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily property sync at 2am AEST (16:00 UTC previous day)
crons.daily(
  "daily-property-sync",
  { hourUTC: 16, minuteUTC: 0 },
  internal.workflows.dataSync.run
);

// Weekly suburb scoring on Sunday at 3am AEST (17:00 UTC Saturday)
crons.weekly(
  "weekly-suburb-scoring",
  { dayOfWeek: "saturday", hourUTC: 17, minuteUTC: 0 },
  internal.workflows.suburbScoring.run
);

// Monthly economic update on 1st at midnight AEST
crons.monthly(
  "monthly-economic-update",
  { day: 1, hourUTC: 14, minuteUTC: 0 },
  internal.functions.metrics.refreshNationalIndicators
);

export default crons;
```

### Durable Workflows

```typescript
// packages/convex/convex/workflows/dataSync.ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "../_generated/api";

const workflow = new WorkflowManager(components.workflow);

export const run = workflow.define({
  args: {},
  handler: async (step) => {
    // Step 1: Get suburbs to sync
    const suburbs = await step.runQuery(internal.functions.suburbs.listAll);

    // Step 2: Fetch from MCP servers (durable — retries on failure)
    const listings = await step.runAction(
      internal.actions.mcp.callDomainMCP,
      { tool: "searchListings", input: { suburbs } }
    );

    // Step 3: Upsert properties
    const count = await step.runMutation(
      internal.functions.properties.bulkUpsert,
      { listings }
    );

    // Step 4: Mark stale listings
    await step.runMutation(internal.functions.properties.markStale);

    return { upserted: count };
  },
});
```

---

## 7. Environment Variables

### Add

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (frontend) |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (CI/CD) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key (set in Convex dashboard) |
| `MCP_DOMAIN_URL` | Domain MCP server URL (Convex env) |
| `MCP_REALESTATE_URL` | REA MCP server URL (Convex env) |
| `MCP_MARKET_DATA_URL` | Market Data MCP server URL (Convex env) |

### Remove

| Variable | Reason |
|----------|--------|
| `DATABASE_URL` | No more PostgreSQL |
| `PUSHER_APP_ID` | No more Pusher |
| `PUSHER_KEY` | No more Pusher |
| `PUSHER_SECRET` | No more Pusher |
| `NEXT_PUBLIC_PUSHER_KEY` | No more Pusher |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | No more Pusher |
| `INNGEST_EVENT_KEY` | No more Inngest |
| `INNGEST_SIGNING_KEY` | No more Inngest |
| `UPSTASH_REDIS_REST_URL` | No more Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | No more Upstash |

### Keep

| Variable | Reason |
|----------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (frontend) |
| `CLERK_SECRET_KEY` | Clerk auth (server) |
| `DOMAIN_API_KEY` | Domain API (used by MCP server) |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |

---

## 8. Branch Coordination

### Active Branches and Impact

| Branch | Impact | Recommendation |
|--------|--------|---------------|
| `main` | Foundation — migration starts from here | Base branch for Convex migration |
| `feature/ai-agents` (POC/ai-sdk) | Agent logic, prompts, tools | **Reuse prompts and tool logic** in Convex agent definitions. Port tool schemas. Do not merge API route structure. |
| `feature/map-integration` | MapLibre components | Merge to main first. Map components stay — only data fetching changes (Pusher → Convex queries). |
| `feature/inngest-jobs` | Background job definitions | **Do not merge**. Rewrite as Convex workflows/crons. Use job logic as reference. |

### Recommended Merge Order

1. Merge `feature/map-integration` to `main` (UI components are framework-independent)
2. Create `feature/convex-migration` branch from `main`
3. Build Convex package on migration branch
4. Port agent logic from `feature/ai-agents` (prompts + tools, not routing)
5. Port job logic from `feature/inngest-jobs` (workflow steps, not Inngest API)
6. Remove old packages/services on migration branch
7. Merge `feature/convex-migration` to `main`

---

## 9. Data Migration

### Approach

One-time migration script that reads from PostgreSQL (via Prisma) and writes to Convex (via `ConvexHttpClient`).

```typescript
// scripts/migrate-to-convex.ts
import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";

const prisma = new PrismaClient();
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
```

### Migration Order

References must be created before referencing documents. Order:

1. **States** (no references)
2. **Cities** (references `states`)
3. **Suburbs** (references `cities`)
4. **Agencies** (no references)
5. **Real Estate Agents** (references `agencies`)
6. **Properties** (references `suburbs`, `realEstateAgents`, `agencies`)
7. **Price History** (references `properties`)
8. **Sale Records** (no references)
9. **Auction Results** (no references)
10. **Market Indicators** (no references)
11. **Infrastructure Projects** (no references)
12. **Users** (no references — Clerk IDs)
13. **Strategies** (references `users`)
14. **Saved Searches** (references `users`)

### ID Mapping

Prisma uses string CUIDs; Convex generates its own IDs. The migration script must maintain an ID mapping:

```typescript
const idMap = new Map<string, Id<any>>();

// Migrate states
const states = await prisma.state.findMany();
for (const state of states) {
  const convexId = await convex.mutation(api.functions.states.create, {
    name: state.name,
    code: state.code,
  });
  idMap.set(state.id, convexId);
}

// Migrate cities (using mapped state IDs)
const cities = await prisma.city.findMany();
for (const city of cities) {
  const convexId = await convex.mutation(api.functions.cities.create, {
    stateId: idMap.get(city.stateId)!,
    name: city.name,
  });
  idMap.set(city.id, convexId);
}
```

### Chat History Migration

Chat sessions and messages are migrated into the Agent Component's thread system:

```typescript
// Migrate chat history to Agent Component threads
const chatSessions = await prisma.chatSession.findMany({
  include: { messages: { orderBy: { createdAt: "asc" } } },
});

for (const session of chatSessions) {
  const userId = idMap.get(session.userId)!;

  // Create a thread via the Agent Component
  const threadId = await convex.mutation(
    api.agents.orchestrator.createThread,
    { userId, title: session.title }
  );

  // Import messages into the thread
  for (const msg of session.messages) {
    await convex.mutation(api.agents.orchestrator.importMessage, {
      threadId,
      role: msg.role,
      content: msg.content,
      toolCalls: msg.toolCalls,
      toolResults: msg.toolResults,
      createdAt: msg.createdAt.getTime(),
    });
  }
}
```

### Date Handling

Prisma uses `DateTime` objects; Convex stores timestamps as `v.float64()` (milliseconds since epoch):

```typescript
// Convert Prisma DateTime to Convex timestamp
const convexTimestamp = prismaDate.getTime(); // number (ms since epoch)
```

### Verification

After migration, verify counts:

```typescript
// Verify migration counts
const checks = [
  { table: "states", prismaCount: await prisma.state.count() },
  { table: "cities", prismaCount: await prisma.city.count() },
  { table: "suburbs", prismaCount: await prisma.suburb.count() },
  { table: "properties", prismaCount: await prisma.property.count() },
  // ... etc
];

for (const check of checks) {
  const convexCount = await convex.query(api.functions[check.table].count);
  console.log(`${check.table}: Prisma=${check.prismaCount}, Convex=${convexCount}`);
  if (check.prismaCount !== convexCount) {
    console.error(`MISMATCH: ${check.table}`);
  }
}
```

---

*Document Version: 1.0*
*Created: 2026-01-27*
*Related: [ADR-009](./adr/009-convex-unified-backend.md) | [ADR-010](./adr/010-geospatial-bounding-box-strategy.md) | [ADR-011](./adr/011-convex-agent-multi-agent-orchestration.md) | [ARCHITECTURE.md](./ARCHITECTURE.md)*
