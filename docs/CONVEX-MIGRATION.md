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

### After (Convex + Vercel AI SDK + Vercel Workflow)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 (Vercel)                   │
│                                                          │
│  Frontend ◄──── ConvexProvider (WebSocket)               │
│  useQuery() ──► Convex (reactive subscriptions)          │
│  useMutation() ──► Convex (writes)                       │
│                                                          │
│  API Routes ──► Vercel AI SDK Agents ──► Convex         │
│           ╰──► Gemini 2.5 Flash                          │
│                                                          │
│  Workflows ──► Vercel Workflow (WDK) ──► Convex          │
│           ╰──► "use workflow" + "use step"               │
│                                                          │
│  Server Components ──► Convex (preloaded queries)        │
└─────────────────────────────────────────────────────────┘
            │                                   │
            ▼                                   ▼
  ┌──────────────────┐              ┌──────────────────┐
  │      Convex      │              │ Vercel Workflow  │
  │                  │              │      (WDK)       │
  │  ┌────────────┐  │              │                  │
  │  │  Database  │  │◄─────────────┤  Durable Steps   │
  │  └────────────┘  │              │  + Retries       │
  │  ┌────────────┐  │              └──────────────────┘
  │  │ Subscriptions│ │
  │  └────────────┘  │
  │  ┌────────────┐  │
  │  │  Scheduler │  │  ◄── Triggers workflows via cron
  │  └────────────┘  │
  └──────────────────┘
```

### What Gets Replaced

| Current Service | Replaced By | Notes |
|----------------|-------------|-------|
| Neon PostgreSQL + Prisma | Convex document DB + indexes | See schema migration (Section 3) |
| Pusher | Convex reactive queries (WebSocket) | Automatic, no channel management |
| Upstash Redis | Convex query caching (built-in) | Rate limiting via Convex actions |
| Inngest | Vercel Workflow (WDK) + Convex cron | Durable steps + retries. Convex cron triggers workflows. |

### What Stays the Same

| Component | Status |
|-----------|--------|
| Next.js 15 (App Router) | Stays |
| Clerk Authentication | Stays (integrated via `ConvexProviderWithClerk`) |
| MapLibre GL + deck.gl | Stays |
| shadcn/ui + Tailwind CSS v4 | Stays |
| MCP Servers (Domain, REA, Market Data) | Stays (called from Next.js API routes or Convex Actions) |
| Zustand (client state) | Stays (reduced scope — Convex handles server state) |
| Gemini 2.5 Flash | Stays (via `@ai-sdk/google`) |
| Vercel AI SDK | Stays (agents in Next.js API routes using `ToolLoopAgent`) |
| Vercel Workflow (WDK) | New (replaces Inngest for background jobs) |
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
│   ├── convex.config.ts            # No components registered
│   ├── auth.config.ts              # Clerk auth configuration
│   ├── schema.ts                   # Database schema
│   │
│   ├── functions/                  # Query/Mutation/Action functions
│   │   ├── users.ts                # User sync + queries
│   │   ├── strategies.ts           # Strategy CRUD
│   │   ├── properties.ts           # Property queries + geo search
│   │   ├── suburbs.ts              # Suburb queries
│   │   ├── metrics.ts              # Suburb metrics + market indicators
│   │   ├── realEstateAgents.ts     # Agent RPC (Real Estate Agent model)
│   │   ├── agencies.ts             # Agency queries
│   │   ├── priceHistory.ts         # Price history queries
│   │   ├── sales.ts                # Sale records + auction results
│   │   ├── infrastructure.ts       # Infrastructure project queries
│   │   ├── savedSearches.ts        # Saved search CRUD
│   │   ├── chatSessions.ts         # Chat thread management
│   │   └── chatMessages.ts         # Chat message CRUD
│   │
│   ├── actions/                    # Convex Actions (side effects)
│   │   └── mcp.ts                  # MCP server HTTP calls (optional)
│   │
│   ├── crons.ts                    # Scheduled jobs (cron definitions)
│   │
│   └── lib/                        # Shared utilities
│       ├── geo.ts                  # Haversine, bounding box helpers
│       ├── financial.ts            # ROI, cash flow calculations
│       └── validators.ts           # Input validation helpers
│
└── tsconfig.json

apps/web/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts            # AI chat endpoint (ToolLoopAgent)
│   └── ...
│
├── lib/
│   ├── agents/                     # AI Agent definitions
│   │   ├── orchestrator.ts         # ToolLoopAgent definition
│   │   ├── strategist.ts           # ToolLoopAgent definition
│   │   ├── researcher.ts           # ToolLoopAgent definition
│   │   └── analyst.ts              # ToolLoopAgent definition
│   │
│   └── tools/                      # Agent tools
│       ├── strategy-tools.ts       # tool() with Convex calls
│       ├── search-tools.ts         # tool() with Convex calls
│       ├── analysis-tools.ts       # tool() with pure calculations
│       ├── delegation-tools.ts     # tool() for sub-agent delegation
│       └── mcp-tools.ts            # tool() for MCP HTTP calls
│
├── workflows/                      # Vercel Workflow definitions
│   ├── dataSync.ts                 # "use workflow" - property sync
│   ├── suburbScoring.ts            # "use workflow" - suburb metrics
│   └── aiInsights.ts               # "use workflow" - AI insights
│
└── next.config.ts                  # withWorkflow(nextConfig)
```

### `convex.config.ts`

```typescript
import { defineApp } from "convex/server";

const app = defineApp();
// No components registered - agents run in Next.js, workflows in Vercel Workflow

export default app;
```

### `convex.json`

```json
{
  "functions": "convex/",
  "node": {
    "externalPackages": []
  }
}
```

### `next.config.ts` (Vercel Workflow Integration)

```typescript
import { withWorkflow } from "workflow/next";

const nextConfig = {
  // ... existing Next.js config
};

export default withWorkflow(nextConfig);
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
| 5 | `ChatSession` | `chatSessions` | Thread management for AI conversations |
| 6 | `ChatMessage` | `chatMessages` | Message persistence with tool calls and results |
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

  // ── Chat Threads ──
  chatSessions: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    lastMessageAt: v.optional(v.float64()),
  })
    .index("by_user", ["userId"])
    .index("by_user_last_message", ["userId", "lastMessageAt"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    toolCalls: v.optional(v.any()),
    toolResults: v.optional(v.any()),
    usage: v.optional(v.object({
      promptTokens: v.float64(),
      completionTokens: v.float64(),
    })),
    timestamp: v.float64(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_timestamp", ["sessionId", "timestamp"]),

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

### Agent Definitions (Next.js API Routes)

Four agents, all using Gemini 2.5 Flash via `@ai-sdk/google`, defined in `apps/web/lib/agents/`:

```typescript
// apps/web/lib/agents/orchestrator.ts
import { ToolLoopAgent } from "ai";
import { google } from "@ai-sdk/google";
import {
  delegateToStrategist,
  delegateToAnalyst,
  delegateToResearcher,
} from "../tools/delegation-tools";
import { searchProperties, updateUIFilters } from "../tools/search-tools";

export const orchestrator = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: `You are the Propure AI assistant, helping users discover
their ideal property investment strategy in Australia. You coordinate between
specialist agents: Strategist, Analyst, and Researcher.

Route user requests to the appropriate agent(s), synthesize their outputs,
and present cohesive responses. Always maintain context of the user's
situation, goals, and current strategy.`,
  tools: {
    delegateToStrategist,
    delegateToAnalyst,
    delegateToResearcher,
    searchProperties,
    updateUIFilters,
  },
});
```

### Tool Types

All tools use the Vercel AI SDK `tool()` function. Tools that need database access call Convex via `ConvexHttpClient`.

```typescript
// apps/web/lib/tools/search-tools.ts
import { tool } from "ai";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Tool with Convex database access
export const searchProperties = tool({
  description: "Search properties within map bounds with filters",
  parameters: z.object({
    south: z.number(),
    north: z.number(),
    west: z.number(),
    east: z.number(),
    propertyType: z.string().optional(),
    maxPrice: z.number().optional(),
  }),
  execute: async (args) => {
    // Call Convex query via HTTP client
    const properties = await convex.query(api.properties.searchByBounds, {
      south: args.south,
      north: args.north,
      west: args.west,
      east: args.east,
      propertyType: args.propertyType,
      maxPrice: args.maxPrice,
    });
    return properties;
  },
});

// Tool that creates Convex data
export const createStrategy = tool({
  description: "Create a new investment strategy for the user",
  parameters: z.object({
    type: z.enum(["CASH_FLOW", "CAPITAL_GROWTH", "RENOVATION_FLIP", "DEVELOPMENT", "SMSF", "COMMERCIAL"]),
    budget: z.number().optional(),
    riskTolerance: z.string().optional(),
  }),
  execute: async (args) => {
    // Call Convex mutation via HTTP client
    const strategyId = await convex.mutation(api.strategies.create, {
      type: args.type,
      status: "DISCOVERY",
      budget: args.budget,
      riskTolerance: args.riskTolerance,
    });
    return { strategyId };
  },
});

// Pure computation tool (no database)
export const calculateCashFlow = tool({
  description: "Calculate annual cash flow and yield for a property",
  parameters: z.object({
    purchasePrice: z.number(),
    weeklyRent: z.number(),
    annualExpenses: z.number().optional().default(0),
    interestRate: z.number().optional().default(6.0),
  }),
  execute: async ({ purchasePrice, weeklyRent, annualExpenses, interestRate }) => {
    const annualRent = weeklyRent * 52;
    const grossYield = (annualRent / purchasePrice) * 100;
    const annualInterest = (purchasePrice * 0.8) * (interestRate / 100);
    const netCashFlow = annualRent - annualExpenses - annualInterest;

    return {
      grossYield: Math.round(grossYield * 100) / 100,
      annualRent,
      annualInterest: Math.round(annualInterest),
      netCashFlow: Math.round(netCashFlow),
    };
  },
});
```

### MCP Integration

External MCP servers (Domain, REA, Market Data) are called directly from tool `execute` functions via HTTP:

```typescript
// apps/web/lib/tools/mcp-tools.ts
import { tool } from "ai";
import { z } from "zod";

export const callDomainMCP = tool({
  description: "Search properties via Domain MCP server",
  parameters: z.object({
    tool: z.string(),
    input: z.any(),
  }),
  execute: async ({ tool, input }) => {
    const url = process.env.MCP_DOMAIN_URL;
    const response = await fetch(`${url}/tools/${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`MCP Domain call failed: ${response.status}`);
    }
    return response.json();
  },
});
```

All MCP calls use direct HTTP from tool execute functions — no Convex Actions for MCP integration.

### Chat API Route and Message Persistence

```typescript
// apps/web/app/api/chat/route.ts
import { createAgentUIStreamResponse } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";
import { orchestrator } from "@/lib/agents/orchestrator";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const response = await orchestrator.generateText({
    messages,
    maxSteps: 10,
    onFinish: async ({ text, toolCalls, toolResults, usage }) => {
      // Save assistant message to Convex
      await convex.mutation(api.chatMessages.create, {
        sessionId,
        role: "assistant",
        content: text,
        toolCalls: toolCalls?.map(tc => ({ name: tc.name, args: tc.args })),
        toolResults: toolResults?.map(tr => ({ result: tr.result })),
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
        },
        timestamp: Date.now(),
      });

      // Update session's lastMessageAt
      await convex.mutation(api.chatSessions.updateLastMessage, {
        sessionId,
        timestamp: Date.now(),
      });
    },
  });

  return createAgentUIStreamResponse({ response });
}
```

### Streaming Architecture

```
User Message → POST /api/chat
    │
    ├─► ToolLoopAgent.generateText({ messages, tools })
    │       │
    │       └─► Streams tokens via HTTP SSE
    │
    ├─► onFinish: Save to Convex
    │       │
    │       └─► convex.mutation(api.chatMessages.create, { ... })
    │
    └─► createAgentUIStreamResponse → HTTP Response (SSE)
             │
             └─► Frontend: useChat() receives stream

Frontend also subscribes:
    useQuery(api.chatMessages.list, { sessionId })
        └─► Re-renders when new messages saved (for thread history)
```

**Dual-channel approach**:
1. **HTTP SSE**: Live streaming during active conversation (via `useChat()` from `@ai-sdk/react`)
2. **Convex reactive query**: Thread history and message persistence (via `useQuery()` from `convex/react`)

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

### Chat Interface

Use `useChat` from `@ai-sdk/react` for streaming chat + Convex reactive queries for chat history:

```typescript
// apps/web/components/chat-interface.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@propure/convex";
import { useEffect } from "react";

export function ChatInterface({ sessionId }: { sessionId: string }) {
  // Vercel AI SDK hook for streaming
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: { sessionId },
  });

  // Convex reactive query for chat history (loads on mount)
  const historicalMessages = useQuery(api.chatMessages.list, { sessionId });

  // Merge historical messages with streaming messages
  const allMessages = [
    ...(historicalMessages ?? []),
    ...messages.filter(m => !historicalMessages?.some(hm => hm.timestamp === m.createdAt)),
  ];

  return (
    <div>
      {allMessages.map((m, i) => (
        <div key={i}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

**Pattern**:
- `useChat()` handles HTTP SSE streaming for live conversation
- `useQuery()` loads historical messages from Convex on mount
- Messages are saved to Convex in `onFinish` callback (API route)
- Convex reactive query updates when new messages arrive

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

### Inngest → Vercel Workflow Mapping

| Inngest Function | Replacement | Type |
|-----------------|-------------|------|
| `daily-property-sync` (cron 2am) | Vercel Cron → Vercel Workflow | Cron → Workflow |
| `weekly-suburb-scoring` (cron Sunday 3am) | Vercel Cron → Vercel Workflow | Cron → Workflow |
| `monthly-economic-update` (cron 1st) | Vercel Cron → Vercel Workflow | Cron → Workflow |
| `property-search-workflow` (event) | Convex Query (reactive) | Query |
| `suburb-analysis-workflow` (event) | Vercel Workflow | Workflow |

### Vercel Workflow (WDK) Setup

```typescript
// apps/web/next.config.ts
import { withWorkflow } from "workflow/next";

const nextConfig = {
  // ... existing Next.js config
};

export default withWorkflow(nextConfig);
```

### Cron Triggers (vercel.json)

All scheduled jobs are defined in `vercel.json` and trigger API routes that launch Vercel Workflows:

```json
{
  "crons": [
    {
      "path": "/api/cron/property-sync",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/suburb-scoring",
      "schedule": "0 17 * * 6"
    },
    {
      "path": "/api/cron/economic-update",
      "schedule": "0 18 1 * *"
    }
  ]
}
```

### Vercel Workflow Definitions

```typescript
// apps/web/workflows/dataSync.ts
"use workflow";

import { start } from "workflow";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function propertySyncWorkflow() {
  // Step 1: Get suburbs to sync (durable step)
  const suburbs = await step("get-suburbs", async () => {
    return await convex.query(api.suburbs.listAll);
  });

  // Step 2: Fetch from MCP servers (automatic retry on failure)
  const listings = await step("fetch-listings", async () => {
    const response = await fetch(`${process.env.MCP_DOMAIN_URL}/tools/searchListings`, {
      method: "POST",
      body: JSON.stringify({ suburbs }),
    });
    return response.json();
  });

  // Step 3: Upsert properties to Convex
  const count = await step("upsert-properties", async () => {
    return await convex.mutation(api.properties.bulkUpsert, { listings });
  });

  // Step 4: Mark stale listings
  await step("mark-stale", async () => {
    await convex.mutation(api.properties.markStale);
  });

  return { upserted: count };
}

// Trigger endpoint
export async function POST() {
  const workflowId = await start(propertySyncWorkflow);
  return Response.json({ workflowId });
}
```

```typescript
// apps/web/workflows/suburbScoring.ts
"use workflow";

import { start, sleep } from "workflow";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function suburbScoringWorkflow() {
  const suburbs = await step("get-suburbs", async () => {
    return await convex.query(api.suburbs.listAll);
  });

  for (const suburb of suburbs) {
    // Rate limiting via durable sleep
    await sleep(1000);

    await step(`score-suburb-${suburb._id}`, async () => {
      const metrics = await convex.query(api.suburbMetrics.getLatest, {
        suburbId: suburb._id,
      });

      const score = calculateScore(metrics);

      await convex.mutation(api.suburbs.updateScore, {
        suburbId: suburb._id,
        score,
      });
    });
  }

  return { processed: suburbs.length };
}
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
