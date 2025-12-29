# Propure - Tech Stack Analysis & Recommendations

> **Purpose**: Critical analysis of technology choices for a high-performance, scalable property investment platform with AI agent orchestration.

---

## Decision Status

| Component | Decision | Status |
|-----------|----------|--------|
| Database | PostgreSQL (Neon) + PostGIS + TimescaleDB + pgvector | **Confirmed** |
| Backend | Next.js 15 Full-Stack | **Confirmed** |
| Frontend | React 19 + Zustand + MapLibre | **Confirmed** |
| Background Jobs | Inngest | **Confirmed** |
| AI/Agents | Vercel AI SDK + Claude | **Confirmed** |
| Real-time | Pusher/Ably | **Confirmed** |
| Hosting | Vercel + Neon + Upstash | **Confirmed** |

---

## Executive Summary

Propure has unique technical challenges:
1. **High Data Volume**: Millions of property records, suburb statistics, economic indicators
2. **Real-Time Updates**: Map and list must update as AI conversation progresses
3. **Complex Queries**: Geospatial + time-series + full-text search combined
4. **AI Agent Orchestration**: Multiple specialized agents working in coordination
5. **Data Freshness**: Some data updates weekly, some monthly, some real-time

This document analyzes options across four architectural layers and provides recommendations.

---

## 1. Data Architecture

### The Challenge

You're dealing with multiple data types that need different handling:

| Data Type | Volume | Update Frequency | Query Pattern |
|-----------|--------|------------------|---------------|
| Property listings | ~10M+ records | Daily/Real-time | Geospatial, filters |
| Suburb statistics | ~15K suburbs | Monthly | Aggregations, time-series |
| Economic indicators | ~100 metrics | Monthly/Quarterly | Time-series |
| User conversations | Growing | Real-time | Full-text, context retrieval |
| Calculated scores | Derived | On-demand | Fast lookups |

### Option A: PostgreSQL + Extensions (Recommended for MVP)

```
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   PostGIS    │  │  TimescaleDB │  │    pgvector          │   │
│  │  (Geospatial)│  │ (Time-series)│  │  (AI Embeddings)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                    │                 │
│         └─────────────────┼────────────────────┘                 │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │     PostgreSQL 16+      │                        │
│              │   (Core RDBMS + JSONB)  │                        │
│              └─────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros**:
- Single database for all data types (simpler ops)
- PostGIS is industry-standard for geospatial (used by Uber, Airbnb)
- TimescaleDB handles time-series efficiently (10-100x faster than vanilla PG)
- pgvector for AI embeddings and semantic search
- ACID compliance for financial calculations
- Excellent with Prisma ORM
- Managed options: Neon (serverless), Supabase, AWS RDS

**Cons**:
- Single point of failure (mitigated by managed services)
- May need to shard at extreme scale (>100M records)

**Performance Optimizations**:
```sql
-- Geospatial index for property searches
CREATE INDEX idx_properties_location ON properties USING GIST (location);

-- Partial indexes for common filters
CREATE INDEX idx_properties_active ON properties (suburb_id, price)
WHERE status = 'active';

-- BRIN indexes for time-series data (very compact)
CREATE INDEX idx_metrics_time ON suburb_metrics USING BRIN (recorded_at);
```

---

### Option B: Polyglot Persistence (Scale Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                   POLYGLOT PERSISTENCE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ PostgreSQL   │  │ ClickHouse   │  │    Pinecone/         │   │
│  │ + PostGIS    │  │ (Analytics)  │  │    Qdrant            │   │
│  │ (Primary)    │  │              │  │    (Vector DB)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                    │                 │
│         │          ┌──────┴──────┐            │                 │
│         │          │    Redis    │            │                 │
│         │          │   (Cache +  │            │                 │
│         │          │    Pub/Sub) │            │                 │
│         │          └─────────────┘            │                 │
│         │                 │                    │                 │
│         └─────────────────┼────────────────────┘                 │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │    Data Sync Layer      │                        │
│              │    (Debezium CDC)       │                        │
│              └─────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**When to use**:
- When you have >50M properties
- When analytics queries slow down transactional workloads
- When you need sub-10ms vector search at scale

**Components**:
| Component | Purpose | When to Add |
|-----------|---------|-------------|
| PostgreSQL + PostGIS | Primary data store, geospatial | Day 1 |
| Redis | Caching, session, pub/sub for real-time | Day 1 |
| ClickHouse | Analytics, aggregations | When analytics slows PG |
| Pinecone/Qdrant | Vector search for AI | When pgvector limits hit |
| Debezium | Change Data Capture for sync | When polyglot needed |

---

### Option C: Data Lakehouse (Enterprise Scale)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAKEHOUSE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ingestion          Processing           Serving                 │
│  ┌─────────┐       ┌───────────┐        ┌─────────────┐         │
│  │ Kafka/  │──────▶│ Apache    │───────▶│ DuckDB /    │         │
│  │ Redpanda│       │ Spark     │        │ Trino       │         │
│  └─────────┘       └───────────┘        └─────────────┘         │
│       │                  │                     │                 │
│       │                  ▼                     │                 │
│       │          ┌───────────────┐            │                 │
│       │          │ Delta Lake /  │            │                 │
│       └─────────▶│ Apache Iceberg│◀───────────┘                 │
│                  │ (on S3/GCS)   │                               │
│                  └───────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**When to use**:
- Billions of records
- Complex ML pipelines
- Multi-tenant enterprise deployments

**Verdict**: Overkill for MVP, consider at Series B+ scale

---

### Data Architecture Recommendation

**Start with Option A (PostgreSQL ecosystem)**, with a clear migration path:

```
Phase 1 (MVP):           Phase 2 (Scale):          Phase 3 (Enterprise):
PostgreSQL 16+      ──▶  + Redis Cache        ──▶  + ClickHouse
+ PostGIS               + Dedicated Vector DB     + Event Streaming
+ TimescaleDB           + Read Replicas           + Data Lakehouse
+ pgvector
```

**Managed Service Recommendation**:

| Option | Best For | Pricing Model |
|--------|----------|---------------|
| **Neon** | Serverless, auto-scaling, branching | Pay per compute-second |
| **Supabase** | Full stack (auth, storage, realtime) | Predictable monthly |
| **PlanetScale** | MySQL alternative, branching | Per-row reads/writes |

**My pick**: **Neon** for the serverless scaling and database branching (great for dev/staging).

---

## 2. Backend Architecture

### The Challenge

- Handle AI agent orchestration
- Serve high-volume API requests
- Process background data ingestion
- Real-time updates to frontend

### Option A: Next.js Full-Stack (Recommended for Speed-to-Market)

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 FULL-STACK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15                            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  App Router          API Routes         Server Actions   │    │
│  │  (React RSC)         (REST/tRPC)        (Mutations)      │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                   │
│         │                 │                 │                    │
│         ▼                 ▼                 ▼                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────────────┐       │
│  │   Prisma   │   │   Inngest  │   │   Vercel AI SDK    │       │
│  │   (ORM)    │   │ (Workflows)│   │   (AI Streaming)   │       │
│  └────────────┘   └────────────┘   └────────────────────┘       │
│         │                 │                 │                    │
│         ▼                 ▼                 ▼                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────────────┐       │
│  │ PostgreSQL │   │   Redis    │   │   Claude/OpenAI    │       │
│  └────────────┘   └────────────┘   └────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Deployment: Vercel (Edge + Serverless)
```

**Pros**:
- Single codebase, single deployment
- React Server Components for fast initial loads
- Streaming responses for AI (critical for chat UX)
- Inngest for reliable background jobs (data ingestion, calculations)
- Edge functions for low-latency geospatial queries
- Vercel handles scaling automatically

**Cons**:
- Vendor lock-in to Vercel ecosystem
- Cold starts on serverless (mitigated by edge)
- Complex background jobs may need dedicated workers

**Key Libraries**:
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "inngest": "^3.0.0",
    "ai": "^3.0.0",
    "@anthropic-ai/sdk": "^0.25.0",
    "zod": "^3.22.0",
    "trpc": "^11.0.0"
  }
}
```

---

### Option B: Microservices (Scale Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────┐                              │
│                    │ API Gateway │                              │
│                    │  (Kong/     │                              │
│                    │   Traefik)  │                              │
│                    └──────┬──────┘                              │
│                           │                                      │
│    ┌──────────────────────┼──────────────────────┐              │
│    │                      │                      │               │
│    ▼                      ▼                      ▼               │
│ ┌──────────┐       ┌──────────┐          ┌──────────┐          │
│ │ Property │       │   AI     │          │  User    │          │
│ │ Service  │       │ Service  │          │ Service  │          │
│ │ (Go/Rust)│       │ (Python) │          │ (Node)   │          │
│ └──────────┘       └──────────┘          └──────────┘          │
│      │                  │                     │                  │
│      ▼                  ▼                     ▼                  │
│ ┌──────────┐       ┌──────────┐          ┌──────────┐          │
│ │ PostGIS  │       │ Vector DB│          │ Postgres │          │
│ └──────────┘       └──────────┘          └──────────┘          │
│                                                                  │
│    Communication: gRPC + Event Bus (NATS/Kafka)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Deployment: Kubernetes (EKS/GKE) or Fly.io
```

**When to use**:
- Team > 10 engineers
- Need polyglot (Go for perf, Python for AI)
- Strict isolation requirements

**Verdict**: Overkill for MVP, significant operational overhead

---

### Option C: Modular Monolith (Best of Both)

```
┌─────────────────────────────────────────────────────────────────┐
│                 MODULAR MONOLITH (TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Turborepo Monorepo                    │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  apps/                    packages/                      │    │
│  │  ├── web (Next.js)        ├── @propure/db (Prisma)      │    │
│  │  ├── api (Hono/Elysia)    ├── @propure/ai (Agents)      │    │
│  │  └── workers (Inngest)    ├── @propure/geo (PostGIS)    │    │
│  │                           └── @propure/shared (Types)    │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Can deploy as:                                                  │
│  • Single Next.js app (MVP)                                     │
│  • Separate services (Scale)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros**:
- Start as monolith, split when needed
- Shared types prevent drift
- Turborepo caching speeds up CI/CD
- Can use faster runtimes (Bun) for specific services

---

### Backend Recommendation

**Option A (Next.js Full-Stack) for MVP**, structured as a modular monolith:

```
propure/
├── apps/
│   └── web/                 # Next.js 15 (App Router)
│       ├── app/
│       │   ├── (auth)/      # Auth routes
│       │   ├── (dashboard)/ # Main app
│       │   ├── api/         # API routes
│       │   └── actions/     # Server actions
│       └── ...
├── packages/
│   ├── db/                  # Prisma schema + client
│   ├── ai/                  # AI agent logic
│   └── shared/              # Shared types, utils
├── turbo.json
└── package.json
```

---

## 3. Frontend Architecture

### The Challenge

- Split-panel interface (chat left, map/list right)
- Real-time updates as AI processes
- High-performance map with potentially 1000s of markers
- Complex state synchronization

### Recommended Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 (App Router)              │    │
│  │                    React 19 (Server Components)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  State Management          UI Components        Maps             │
│  ┌──────────────┐         ┌──────────────┐    ┌────────────┐   │
│  │   Zustand    │         │   shadcn/ui  │    │  Mapbox GL │   │
│  │ (Client)     │         │   + Radix    │    │  or        │   │
│  │              │         │              │    │  MapLibre  │   │
│  │   TanStack   │         │   Tailwind   │    │            │   │
│  │   Query      │         │   CSS v4     │    │  + deck.gl │   │
│  │ (Server)     │         │              │    │  (viz)     │   │
│  └──────────────┘         └──────────────┘    └────────────┘   │
│                                                                  │
│  AI Chat                   Real-time           Forms            │
│  ┌──────────────┐         ┌──────────────┐    ┌────────────┐   │
│  │  Vercel AI   │         │   Pusher or  │    │ React Hook │   │
│  │  SDK         │         │   Ably       │    │ Form + Zod │   │
│  │  (Streaming) │         │   (WebSocket)│    │            │   │
│  └──────────────┘         └──────────────┘    └────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Decisions

#### State Management: Zustand + TanStack Query

```typescript
// stores/strategy-store.ts
import { create } from 'zustand'

interface StrategyState {
  strategy: Strategy | null
  filters: PropertyFilters
  setStrategy: (strategy: Strategy) => void
  updateFilters: (filters: Partial<PropertyFilters>) => void
}

export const useStrategyStore = create<StrategyState>((set) => ({
  strategy: null,
  filters: defaultFilters,
  setStrategy: (strategy) => set({ strategy }),
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
}))

// Real-time sync with map
useEffect(() => {
  const unsubscribe = useStrategyStore.subscribe(
    (state) => state.filters,
    (filters) => map.current?.setFilter('properties', buildMapFilter(filters))
  )
  return unsubscribe
}, [])
```

#### Maps: MapLibre GL + deck.gl

**Why MapLibre over Mapbox**:
- Open source (no vendor lock-in)
- Same API as Mapbox GL JS
- Can use Mapbox tiles or free alternatives (Maptiler, Stadia)
- deck.gl for WebGL-accelerated visualizations (heatmaps, clusters)

```typescript
// components/map/property-map.tsx
import Map from 'react-map-gl/maplibre'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'

export function PropertyMap({ properties, filters }) {
  const heatmapLayer = new HeatmapLayer({
    id: 'suburb-heatmap',
    data: suburbScores,
    getPosition: d => [d.longitude, d.latitude],
    getWeight: d => d.strategyScore,
    radiusPixels: 60,
  })

  return (
    <Map
      initialViewState={{ longitude: 151.2, latitude: -33.9, zoom: 10 }}
      mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth.json"
    >
      <DeckGLOverlay layers={[heatmapLayer]} />
      <PropertyMarkers properties={properties} />
    </Map>
  )
}
```

#### AI Chat: Vercel AI SDK with Streaming

```typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages, strategy } = await req.json()

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: buildSystemPrompt(strategy),
    messages,
    tools: {
      searchProperties: { /* ... */ },
      getSuburbStats: { /* ... */ },
      updateFilters: { /* ... */ },
    },
  })

  return result.toDataStreamResponse()
}

// components/chat/chat-panel.tsx
import { useChat } from 'ai/react'

export function ChatPanel() {
  const { messages, input, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onToolCall: ({ toolCall }) => {
      // Update map/list when AI calls tools
      if (toolCall.toolName === 'updateFilters') {
        useStrategyStore.getState().updateFilters(toolCall.args)
      }
    },
  })

  return (/* ... */)
}
```

---

## 4. Agentic Architecture

### The Challenge

- Multiple specialized agents (Strategist, Analyst, Researcher)
- Agents need to coordinate and share context
- Agents must trigger UI updates
- Tool calls to database, external APIs
- Reliable execution (retries, timeouts)

### Option A: Vercel AI SDK with Multi-Agent (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                VERCEL AI SDK MULTI-AGENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │  ORCHESTRATOR   │                          │
│                    │  (Main Agent)   │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐          │
│  │ STRATEGIST │     │  ANALYST   │     │ RESEARCHER │          │
│  │   Agent    │     │   Agent    │     │   Agent    │          │
│  │            │     │            │     │            │          │
│  │ • Discovery│     │ • Cash flow│     │ • Suburb   │          │
│  │ • Strategy │     │ • Risk     │     │   data     │          │
│  │ • Goals    │     │ • ROI      │     │ • Market   │          │
│  └─────┬──────┘     └─────┬──────┘     └─────┬──────┘          │
│        │                  │                  │                   │
│        └──────────────────┼──────────────────┘                   │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │      TOOL REGISTRY      │                        │
│              ├─────────────────────────┤                        │
│              │ • searchProperties      │                        │
│              │ • getSuburbStats        │                        │
│              │ • calculateROI          │                        │
│              │ • updateMapFilters      │                        │
│              │ • fetchExternalData     │                        │
│              └─────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
// packages/ai/agents/orchestrator.ts
import { anthropic } from '@ai-sdk/anthropic'
import { generateText, tool } from 'ai'
import { z } from 'zod'

const strategistAgent = createAgent({
  model: anthropic('claude-sonnet-4-20250514'),
  system: `You are a property investment strategist...`,
  tools: {
    askDiscoveryQuestion: tool({
      description: 'Ask user a discovery question',
      parameters: z.object({
        question: z.string(),
        category: z.enum(['financial', 'goals', 'constraints', 'preferences']),
      }),
    }),
    recommendStrategy: tool({
      description: 'Recommend an investment strategy',
      parameters: z.object({
        strategy: z.enum(['cash_flow', 'capital_growth', 'renovation', 'development']),
        rationale: z.string(),
        keyMetrics: z.array(z.string()),
      }),
    }),
  },
})

const analystAgent = createAgent({
  model: anthropic('claude-sonnet-4-20250514'),
  system: `You are a property investment analyst...`,
  tools: {
    calculateCashFlow: tool({ /* ... */ }),
    assessRisk: tool({ /* ... */ }),
    projectROI: tool({ /* ... */ }),
  },
})

const researcherAgent = createAgent({
  model: anthropic('claude-haiku-3-5-20241022'), // Faster, cheaper for data fetching
  system: `You are a property market researcher...`,
  tools: {
    getSuburbStats: tool({ /* ... */ }),
    searchProperties: tool({ /* ... */ }),
    fetchMarketData: tool({ /* ... */ }),
  },
})

// Orchestrator coordinates agents
export async function orchestrate(messages: Message[], context: Context) {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `You are the orchestrator. Coordinate between:
      - Strategist: For strategy questions and recommendations
      - Analyst: For financial calculations and risk assessment
      - Researcher: For market data and property searches

      Based on the user's message, decide which agent(s) to invoke.`,
    messages,
    tools: {
      invokeStrategist: tool({
        description: 'Ask strategist agent for strategy guidance',
        parameters: z.object({ task: z.string() }),
        execute: async ({ task }) => {
          return await strategistAgent.run(task, context)
        },
      }),
      invokeAnalyst: tool({
        description: 'Ask analyst agent for calculations',
        parameters: z.object({ task: z.string(), data: z.any() }),
        execute: async ({ task, data }) => {
          return await analystAgent.run(task, { ...context, data })
        },
      }),
      invokeResearcher: tool({
        description: 'Ask researcher agent for market data',
        parameters: z.object({ task: z.string() }),
        execute: async ({ task }) => {
          return await researcherAgent.run(task, context)
        },
      }),
      updateUI: tool({
        description: 'Send update to frontend UI',
        parameters: z.object({
          type: z.enum(['filters', 'highlight', 'zoom']),
          payload: z.any(),
        }),
        execute: async ({ type, payload }) => {
          // Push to real-time channel
          await pusher.trigger(`user-${context.userId}`, 'ui-update', { type, payload })
          return { success: true }
        },
      }),
    },
  })

  return result
}
```

---

### Option B: LangGraph (Complex Workflows)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐                 │
│    │  START  │────▶│ CLASSIFY│────▶│ ROUTE   │                 │
│    └─────────┘     └─────────┘     └────┬────┘                 │
│                                         │                        │
│         ┌───────────────┬───────────────┼───────────────┐       │
│         │               │               │               │        │
│         ▼               ▼               ▼               ▼        │
│    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    │
│    │STRATEGY │    │RESEARCH │    │ANALYSIS │    │RESPONSE │    │
│    │  NODE   │    │  NODE   │    │  NODE   │    │  NODE   │    │
│    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    │
│         │               │               │               │        │
│         └───────────────┴───────────────┴───────────────┘        │
│                                   │                              │
│                                   ▼                              │
│                            ┌───────────┐                        │
│                            │ SYNTHESIZE│                        │
│                            └─────┬─────┘                        │
│                                  │                               │
│                                  ▼                               │
│                            ┌───────────┐                        │
│                            │    END    │                        │
│                            └───────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**When to use**:
- Complex multi-step workflows
- Need checkpointing and resumability
- Conditional branching logic
- Python ecosystem preferred

**Verdict**: Good for complex workflows, but adds Python dependency. Consider for Phase 2.

---

### Option C: Inngest for Reliable Agent Execution

```typescript
// inngest/functions/property-search.ts
import { inngest } from './client'

export const propertySearchWorkflow = inngest.createFunction(
  { id: 'property-search', retries: 3 },
  { event: 'property/search.requested' },
  async ({ event, step }) => {
    // Step 1: Get strategy context
    const strategy = await step.run('get-strategy', async () => {
      return await db.strategy.findUnique({ where: { id: event.data.strategyId } })
    })

    // Step 2: Fetch suburb data (parallelized)
    const suburbData = await step.run('fetch-suburb-data', async () => {
      return await fetchSuburbStats(strategy.targetSuburbs)
    })

    // Step 3: AI scoring
    const scoredProperties = await step.run('ai-scoring', async () => {
      return await scoreProperties(suburbData.properties, strategy)
    })

    // Step 4: Update user's search results
    await step.run('update-results', async () => {
      await db.searchResult.create({
        data: {
          userId: event.data.userId,
          properties: scoredProperties,
        },
      })
      // Notify frontend
      await pusher.trigger(`user-${event.data.userId}`, 'search-complete', {
        count: scoredProperties.length,
      })
    })

    return { success: true, count: scoredProperties.length }
  }
)
```

**Why Inngest**:
- Automatic retries with backoff
- Step functions for long-running workflows
- Built-in observability
- Works with Vercel/serverless
- TypeScript-first

---

### Agentic Architecture Recommendation

**Hybrid approach**:

1. **Vercel AI SDK** for real-time chat and streaming
2. **Inngest** for background workflows (data ingestion, batch scoring)
3. **Multi-agent pattern** with Orchestrator coordinating specialists

```
Real-time (Chat):          Background (Jobs):
┌─────────────────┐       ┌─────────────────┐
│  Vercel AI SDK  │       │     Inngest     │
│                 │       │                 │
│ • Streaming     │       │ • Data ingestion│
│ • Tool calls    │       │ • Batch scoring │
│ • UI updates    │       │ • Calculations  │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼───────┐
              │ Shared Tools  │
              │ (DB, APIs)    │
              └───────────────┘
```

---

## 5. Complete Stack Recommendation

### MVP Stack (Phase 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPURE MVP STACK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND                                                        │
│  ├── Next.js 15 (App Router, RSC)                               │
│  ├── React 19                                                    │
│  ├── TypeScript 5.5+                                            │
│  ├── Tailwind CSS v4                                            │
│  ├── shadcn/ui + Radix                                          │
│  ├── Zustand (client state)                                     │
│  ├── TanStack Query (server state)                              │
│  ├── MapLibre GL + deck.gl                                      │
│  ├── Vercel AI SDK (chat streaming)                             │
│  └── React Hook Form + Zod                                      │
│                                                                  │
│  BACKEND                                                         │
│  ├── Next.js API Routes + Server Actions                        │
│  ├── tRPC (type-safe API)                                       │
│  ├── Prisma ORM                                                 │
│  ├── Inngest (background jobs)                                  │
│  └── Pusher/Ably (real-time)                                    │
│                                                                  │
│  AI/AGENTS                                                       │
│  ├── Vercel AI SDK                                              │
│  ├── Anthropic Claude (Sonnet for main, Haiku for research)    │
│  └── Multi-agent orchestration pattern                          │
│                                                                  │
│  DATA                                                            │
│  ├── PostgreSQL 16 (Neon - serverless)                          │
│  ├── PostGIS extension                                          │
│  ├── TimescaleDB extension                                      │
│  ├── pgvector extension                                         │
│  └── Redis (Upstash - cache + pub/sub)                          │
│                                                                  │
│  INFRASTRUCTURE                                                  │
│  ├── Vercel (frontend + API)                                    │
│  ├── Neon (database)                                            │
│  ├── Upstash (Redis)                                            │
│  ├── Inngest Cloud (jobs)                                       │
│  └── Pusher/Ably (WebSocket)                                    │
│                                                                  │
│  DEV TOOLS                                                       │
│  ├── Turborepo (monorepo)                                       │
│  ├── pnpm (package manager)                                     │
│  ├── Biome (linting + formatting)                               │
│  ├── Vitest (testing)                                           │
│  └── Playwright (E2E)                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Estimated Costs (MVP Scale)

| Service | Free Tier | Growth Estimate |
|---------|-----------|-----------------|
| Vercel | Hobby free, Pro $20/mo | $50-200/mo at scale |
| Neon | 0.5GB free | $20-100/mo |
| Upstash Redis | 10K commands/day free | $10-50/mo |
| Inngest | 25K runs/mo free | $25-100/mo |
| Pusher | 200K messages free | $50-200/mo |
| Claude API | Pay per token | $100-500/mo |
| **Total** | **~$0/mo to start** | **$300-1000/mo at growth** |

---

## 6. Migration Path (Scale Roadmap)

```
Phase 1 (MVP):              Phase 2 (Growth):           Phase 3 (Scale):
─────────────────          ─────────────────          ─────────────────
• Single Next.js app       • Add Redis caching        • Separate services
• Neon PostgreSQL          • Read replicas            • ClickHouse analytics
• pgvector                 • Dedicated vector DB      • Kafka streaming
• Vercel hosting           • Edge functions           • Kubernetes
• 10K users                • 100K users               • 1M+ users
```

---

## 7. Decision Summary

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Database** | PostgreSQL (Neon) + PostGIS + TimescaleDB + pgvector | Single DB for all needs, serverless scaling, all extensions supported |
| **Backend** | Next.js 15 Full-Stack | Fast development, streaming AI, excellent DX |
| **Frontend** | React 19 + Zustand + MapLibre | RSC for speed, Zustand for simplicity, MapLibre for cost |
| **AI/Agents** | Vercel AI SDK + Claude + Inngest | Native streaming, reliable workflows, TypeScript |
| **Real-time** | Pusher or Ably | Managed WebSocket, no infra overhead |
| **Hosting** | Vercel + Neon + Upstash | Serverless, auto-scaling, low ops |

---

## 8. What NOT to Choose (and Why)

| Don't Choose | Why Not |
|--------------|---------|
| **MongoDB** | Weak geospatial compared to PostGIS, no real transactions |
| **Firebase** | Vendor lock-in, expensive at scale, weak querying |
| **Supabase** | Good alternative, but Neon has better serverless scaling |
| **LangChain.js** | Overly complex for this use case, Vercel AI SDK simpler |
| **Google Maps** | Expensive at scale, MapLibre is free |
| **Redux** | Overkill, Zustand is simpler for this app |
| **GraphQL** | Adds complexity, tRPC gives type safety without it |
| **Microservices** | Too early, operational overhead not justified |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Status: Ready for Review*
