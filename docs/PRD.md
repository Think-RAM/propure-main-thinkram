# Propure - Product Requirements Document (PRD)

> **Version**: 1.0
> **Last Updated**: December 2024
> **Status**: Draft

---

## Executive Summary

Propure is an AI-powered property investment strategy platform for the Australian market. The platform helps users discover their ideal investment strategy through conversational AI, then finds matching properties using multi-level market data (National → City → Suburb → Property).

**Core Value Proposition**: "From Strategy to Property in One Conversation"

**Target Users**: Property investors in Australia seeking data-driven investment decisions.

---

## Product Vision

### Problem Statement

Most property investors fail because they:
1. Pick properties that don't align with their strategy/goals
2. Don't have access to comprehensive market data
3. Struggle to interpret complex financial metrics
4. Make emotional rather than data-driven decisions

### Solution

Propure provides:
1. **AI Strategy Discovery** - Conversational AI identifies the right strategy before property search
2. **Data-Driven Filtering** - Hierarchical market data narrows millions of properties to the right few
3. **Financial Analysis** - Automated cash flow, ROI, and risk calculations
4. **Real-Time Updates** - Map and property list update dynamically as conversation evolves

---

## Current State Analysis

### What's Already Built

| Component | Status | Notes |
|-----------|--------|-------|
| **Foundation** | ✅ | Next.js 15, React 19, TypeScript |
| **UI Components** | ✅ | 40+ shadcn/ui components |
| **Investment Wizard** | ✅ | Form-based strategy discovery |
| **Authentication** | ✅ | Clerk auth with webhooks |
| **Payments** | ✅ | Stripe subscription handling |
| **MCP Servers** | ⚠️ Partial | Domain/REA/Market routes + client wrappers; auth gated when `MCP_INTERNAL_TOKEN` is set; mock mode available |
| **Chat API** | ⚠️ Partial | Single-model chat with MCP tools + cash flow/ROI; no multi-agent orchestration or chat/session persistence |
| **Inngest Jobs** | ⚠️ Partial | Domain/REA sync, suburb metrics, market refresh implemented; AI insights stub |
| **Database Schema** | ⚠️ Partial | Core models exist (Strategy, Chat, Property); no Search/Shortlist; no PostGIS/Timescale |
| **Maps** | ⚠️ Broken | Google Maps (to migrate to MapLibre) |
| **AI Agents** | ❌ | Not implemented |
| **Real-time UI** | ❌ | Not implemented |
| **Financial Calculations** | ⚠️ Partial | Cash flow + ROI tools in chat route; input validation incomplete |

### Critical Issues to Fix (from Codex Review)

1. **Critical**: `search_properties` returns object but callers expect array → ✅ RESOLVED (2025-12-30)
2. **High Security**: `saveStrategy` lacks ownership validation → ✅ RESOLVED (2025-12-30)
3. **High Security**: MCP endpoints publicly accessible without auth → ⚠️ PARTIALLY RESOLVED (2025-12-30; auth enforced when `MCP_INTERNAL_TOKEN` is set, dev/mock can bypass)
4. **High**: External ID double-prefixing in sync jobs → ✅ RESOLVED (2025-12-30)
5. **Medium**: Building approvals indexing incorrect → ⚠️ NEEDS VERIFICATION (2025-12-30; current refresh sorts by period before persisting)
6. **Medium**: `calculateCashFlow` allows invalid inputs → ⚠️ PARTIALLY RESOLVED (2025-12-30; deposit check exists, other validation still missing)

---

## Feature Requirements

### Core Features (MVP)

#### F1: AI Strategy Discovery
**Priority**: P0
**Description**: Conversational AI helps users identify their investment strategy through natural dialogue.

**User Stories**:
- As a user, I can describe my financial situation and goals to the AI
- As a user, I receive a recommended investment strategy with clear rationale
- As a user, I can refine my strategy through follow-up questions

**Acceptance Criteria**:
- AI asks discovery questions one at a time (conversational, not interrogative)
- Captures: income, deposit, borrowing capacity, goals, risk tolerance, timeline, preferences
- Recommends one of: Cash Flow, Capital Growth, Renovation, Development, SMSF, Commercial
- Provides clear rationale connecting user situation to recommended strategy
- Strategy persists to database

#### F2: Property Search & Filtering
**Priority**: P0
**Description**: Search properties based on strategy-aligned filters with real-time map updates.

**User Stories**:
- As a user, my map updates automatically based on my strategy conversation
- As a user, I can see properties highlighted that match my strategy
- As a user, I can apply additional filters (price, bedrooms, location)

**Acceptance Criteria**:
- Properties filter by: price range, yield, growth rate, vacancy, suburb, property type
- Map displays suburb heat map by strategy score
- Property markers show key metrics (price, yield, bedrooms)
- Results sorted by strategy alignment score
- Infinite scroll / pagination for large result sets

#### F3: Financial Analysis
**Priority**: P0
**Description**: Automated financial calculations for properties including cash flow, ROI, and risk assessment.

**User Stories**:
- As a user, I can see cash flow projections for any property
- As a user, I can understand the risk profile of a property
- As a user, I can compare financial metrics across shortlisted properties

**Acceptance Criteria**:
- Cash flow calculation: rental income - expenses - loan payments
- ROI projection over 1, 5, 10 year horizons
- Risk assessment scoring (1-10) with factors
- Sensitivity analysis (rate changes, vacancy scenarios)
- Uses Australian tax considerations (negative gearing, CGT discount)

#### F4: Interactive Map
**Priority**: P0
**Description**: MapLibre-based map with suburb heatmaps and property markers.

**Acceptance Criteria**:
- MapLibre GL with deck.gl integration
- Suburb boundaries visible at zoom level 10+
- Heatmap colored by strategy score
- Property markers cluster at low zoom, expand at high zoom
- Click marker to open property detail panel

#### F5: Property Detail View
**Priority**: P0
**Description**: Detailed property information with financial analysis and AI insights.

**Acceptance Criteria**:
- Display: address, photos, price, features, description
- Financial summary: yield, cash flow, ROI projection
- Suburb context: median price, growth rate, vacancy
- AI insight: "Why this property fits your strategy"
- Save to shortlist action

#### F6: Real-Time UI Updates
**Priority**: P1
**Description**: Map and property list update in real-time as AI processes requests.

**Acceptance Criteria**:
- Pusher/Ably WebSocket integration
- UI updates triggered by AI tool calls
- Smooth transitions (no jarring refreshes)
- Loading states for pending operations

---

## Implementation Phases - Detailed Breakdown

---

## Phase 1: Foundation & Critical Fixes
**Duration**: 2 weeks
**Goal**: Stabilize existing code, fix critical bugs, establish solid database foundation.
**Current State (2025-12-30)**: Most 1.1 bug fixes are already resolved; schema remains partial and diverges from PRD; PostGIS/Timescale not configured.

### 1.1 Critical Bug Fixes
**Priority**: P0 | **Effort**: 3 days
**Current State (2025-12-30)**: Items 1.1.1, 1.1.2, 1.1.4, 1.1.5 resolved; 1.1.3 partially resolved; cash-flow validation still limited.

#### 1.1.1 Fix `search_properties` Response Shape
**Status**: ✅ RESOLVED
**Problem**: Returns `{ listings, totalCount, hasMore }` but callers treat it as array
**Files to modify**:
- `apps/web/lib/mcp/client.ts:363` - Update wrapper to handle object response
- `apps/web/app/api/chat/route.ts:95` - Update tool handler
- `apps/web/inngest/functions/sync-domain-listings.ts:176` - Update sync job
- `apps/web/inngest/functions/sync-realestate-listings.ts:173` - Update sync job

**Implementation**:
```typescript
// Option A: Update callers to destructure
const { listings, totalCount, hasMore } = await searchProperties(params)

// Option B: Update MCP to return array (breaking change)
// Not recommended - lose pagination info
```

#### 1.1.2 Add Strategy Ownership Validation
**Status**: ✅ RESOLVED
**Problem**: `saveStrategy` trusts client `strategyId` without ownership check
**File**: `apps/web/app/api/chat/route.ts:622`

**Implementation**:
```typescript
async function saveStrategy(strategyId: string, data: any, userId: string) {
  // Verify ownership before update
  const existing = await prisma.strategy.findFirst({
    where: { id: strategyId, userId }
  })
  if (!existing) {
    throw new Error('Strategy not found or access denied')
  }
  return prisma.strategy.update({ where: { id: strategyId }, data })
}
```

#### 1.1.3 Secure MCP Endpoints
**Status**: ⚠️ PARTIALLY RESOLVED (auth enforced when token set; dev/mock can bypass)
**Problem**: MCP endpoints publicly callable when `MCP_INTERNAL_TOKEN` not set
**Files**:
- `apps/web/app/api/mcp/domain/route.ts:49`
- `apps/web/app/api/mcp/realestate/route.ts:42`
- `apps/web/app/api/mcp/market/route.ts:40`

**Implementation**:
```typescript
export async function POST(request: Request) {
  const token = process.env.MCP_INTERNAL_TOKEN
  if (!token) {
    return Response.json({ error: 'MCP endpoint not configured' }, { status: 503 })
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${token}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

#### 1.1.4 Fix External ID Double-Prefixing
**Status**: ✅ RESOLVED
**Problem**: Parsers prefix IDs, sync jobs prefix again, causing duplicates
**Files**:
- `packages/mcp-shared/src/parsers/domain-parser.ts:261`
- `packages/mcp-shared/src/parsers/rea-parser.ts:274`
- `apps/web/inngest/functions/sync-domain-listings.ts:198`
- `apps/web/inngest/functions/sync-realestate-listings.ts:198`

**Implementation**:
```typescript
// Option A: Remove prefix from parsers (let sync jobs handle it)
// In parsers:
externalId: listingId  // Without prefix

// In sync jobs:
externalId: `domain-${listing.externalId}`  // Add prefix once

// Option B: Check for existing prefix
function ensurePrefix(id: string, prefix: string) {
  return id.startsWith(`${prefix}-`) ? id : `${prefix}-${id}`
}
```

#### 1.1.5 Fix REA Fallback ID Generation
**Status**: ✅ RESOLVED (now uses deterministic hash)
**Problem**: `rea-${Date.now()}` changes every run, causing duplicates
**File**: `packages/mcp-shared/src/parsers/rea-parser.ts:274`

**Implementation**:
```typescript
// Generate deterministic ID from property attributes
function generateDeterministicId(listing: any): string {
  const hash = crypto.createHash('md5')
    .update(`${listing.address}-${listing.suburb}-${listing.postcode}`)
    .digest('hex')
    .slice(0, 12)
  return `rea-${hash}`
}
```

### 1.2 Database Schema Expansion
**Priority**: P0 | **Effort**: 4 days
**Current State (2025-12-30)**: Core models exist but diverge from PRD; no PostGIS/Timescale; Search/Shortlist missing.

#### 1.2.1 Add Core Strategy Models
**Current State (2025-12-30)**: Strategy exists with `params` JSON and minimal fields; `Search`/`Shortlist` missing; chat uses `ChatSession` + `ChatMessage` tables instead of JSON arrays.
**File**: `packages/db/prisma/schema.prisma`

**New/Updated Models**:
```prisma
enum StrategyType {
  CASH_FLOW
  CAPITAL_GROWTH
  RENOVATION
  DEVELOPMENT
  SMSF
  COMMERCIAL
  MIXED
}

enum StrategyStatus {
  DISCOVERY
  IDENTIFIED
  SEARCHING
  SHORTLISTED
  COMPLETED
}

model Strategy {
  id              String         @id @default(cuid())
  userId          String
  type            StrategyType?
  status          StrategyStatus @default(DISCOVERY)

  // Discovery profile (captured from AI conversation)
  profile         Json           @default("{}")

  // Financial inputs
  budget          Decimal?       @db.Decimal(12, 2)
  deposit         Decimal?       @db.Decimal(12, 2)
  annualIncome    Decimal?       @db.Decimal(12, 2)
  borrowingCapacity Decimal?     @db.Decimal(12, 2)

  // Preferences
  riskTolerance   String?        // conservative, moderate, aggressive
  timeline        String?        // 0-5yr, 5-10yr, 10-15yr, 15yr+
  managementStyle String?        // hands-off, active

  // Geographic preferences
  preferredStates String[]       @default([])
  preferredSuburbs String[]      @default([])

  // Property preferences
  propertyTypes   String[]       @default([])
  minBedrooms     Int?
  maxBedrooms     Int?

  user            User           @relation(fields: [userId], references: [id])
  searches        Search[]
  chatSession     ChatSession?
  shortlist       Shortlist[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([userId])
  @@index([status])
}

model ChatSession {
  id          String    @id @default(cuid())
  userId      String
  strategyId  String?   @unique

  // Conversation data
  messages    Json      @default("[]")
  context     Json      @default("{}")  // Discovery state, partial inputs

  // Metadata
  messageCount Int      @default(0)
  lastMessageAt DateTime?

  user        User      @relation(fields: [userId], references: [id])
  strategy    Strategy? @relation(fields: [strategyId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}

model Search {
  id          String    @id @default(cuid())
  strategyId  String
  name        String?

  // Search parameters
  filters     Json      @default("{}")

  // Results snapshot
  resultCount Int       @default(0)
  topResults  Json      @default("[]")  // Top 10 for quick display

  strategy    Strategy  @relation(fields: [strategyId], references: [id])

  createdAt   DateTime  @default(now())

  @@index([strategyId])
}

model Shortlist {
  id          String    @id @default(cuid())
  strategyId  String
  propertyId  String

  notes       String?
  score       Int?      // Strategy alignment score

  strategy    Strategy  @relation(fields: [strategyId], references: [id])
  property    Property  @relation(fields: [propertyId], references: [id])

  createdAt   DateTime  @default(now())

  @@unique([strategyId, propertyId])
  @@index([strategyId])
}
```

#### 1.2.2 Add Geographic Models with PostGIS
**File**: `packages/db/prisma/schema.prisma`

```prisma
model State {
  id        String   @id @default(cuid())
  name      String   // "New South Wales"
  code      String   @unique  // "NSW"

  // PostGIS geometry (handled via raw SQL)
  // geometry  geography(MultiPolygon, 4326)

  cities    City[]

  createdAt DateTime @default(now())
}

model City {
  id        String   @id @default(cuid())
  stateId   String
  name      String   // "Sydney"

  // Cached metrics
  medianPrice     Decimal? @db.Decimal(12, 2)
  populationGrowth Decimal? @db.Decimal(5, 2)

  state     State    @relation(fields: [stateId], references: [id])
  suburbs   Suburb[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([stateId, name])
  @@index([stateId])
}

model Suburb {
  id          String   @id @default(cuid())
  cityId      String
  name        String
  postcode    String

  // Coordinates for map centering
  latitude    Decimal  @db.Decimal(10, 7)
  longitude   Decimal  @db.Decimal(10, 7)

  // Cached latest metrics (denormalized for fast queries)
  medianPrice      Decimal? @db.Decimal(12, 2)
  medianRent       Decimal? @db.Decimal(8, 2)
  grossYield       Decimal? @db.Decimal(5, 2)
  vacancyRate      Decimal? @db.Decimal(5, 2)
  daysOnMarket     Int?
  auctionClearance Decimal? @db.Decimal(5, 2)
  annualGrowth     Decimal? @db.Decimal(5, 2)
  fiveYearGrowth   Decimal? @db.Decimal(5, 2)

  // Strategy scores (0-100)
  cashFlowScore       Int?
  capitalGrowthScore  Int?
  overallScore        Int?

  city        City       @relation(fields: [cityId], references: [id])
  properties  Property[]
  metrics     SuburbMetric[]

  metricsUpdatedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([cityId, name, postcode])
  @@index([cityId])
  @@index([postcode])
  @@index([cashFlowScore])
  @@index([capitalGrowthScore])
}
```

#### 1.2.3 Update Property Model
**File**: `packages/db/prisma/schema.prisma`

```prisma
enum ListingType {
  SALE
  RENT
  SOLD
}

enum ListingStatus {
  ACTIVE
  UNDER_CONTRACT
  SOLD
  WITHDRAWN
  EXPIRED
}

enum PropertyType {
  HOUSE
  APARTMENT
  TOWNHOUSE
  VILLA
  LAND
  RURAL
  COMMERCIAL
}

model Property {
  id            String        @id @default(cuid())
  externalId    String        @unique
  suburbId      String

  // Address
  streetAddress String
  displayAddress String

  // Coordinates
  latitude      Decimal       @db.Decimal(10, 7)
  longitude     Decimal       @db.Decimal(10, 7)

  // Listing info
  listingType   ListingType
  status        ListingStatus @default(ACTIVE)

  // Price
  priceValue    Decimal?      @db.Decimal(12, 2)
  priceDisplay  String?
  priceMin      Decimal?      @db.Decimal(12, 2)
  priceMax      Decimal?      @db.Decimal(12, 2)

  // Features
  propertyType  PropertyType
  bedrooms      Int?
  bathrooms     Int?
  parking       Int?
  landSize      Int?          // sqm
  buildingSize  Int?          // sqm
  yearBuilt     Int?

  // Content
  headline      String?
  description   String?       @db.Text
  features      String[]      @default([])
  images        String[]      @default([])

  // Calculated metrics
  estimatedRent Decimal?      @db.Decimal(8, 2)
  estimatedYield Decimal?     @db.Decimal(5, 2)
  strategyScore  Int?         // Depends on user's strategy

  // Metadata
  listedAt      DateTime?
  soldAt        DateTime?
  daysOnMarket  Int?
  sourceUrl     String?
  source        String        // domain, rea, etc.
  rawData       Json?         // Original API response

  suburb        Suburb        @relation(fields: [suburbId], references: [id])
  agent         Agent?        @relation(fields: [agentId], references: [id])
  agentId       String?
  shortlists    Shortlist[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([suburbId])
  @@index([listingType, status])
  @@index([propertyType])
  @@index([priceValue])
  @@index([bedrooms])
}
```

#### 1.2.4 Add Time-Series Metrics Table
**File**: `packages/db/prisma/schema.prisma`

```prisma
enum MetricType {
  MEDIAN_PRICE
  MEDIAN_RENT
  GROSS_YIELD
  VACANCY_RATE
  DAYS_ON_MARKET
  AUCTION_CLEARANCE
  STOCK_ON_MARKET
  DEMAND_SUPPLY_RATIO
  RENTAL_GROWTH
  PRICE_GROWTH
  INCOME_GROWTH
  POPULATION_GROWTH
}

model SuburbMetric {
  id          String     @id @default(cuid())
  suburbId    String
  metricType  MetricType
  value       Decimal    @db.Decimal(12, 4)

  // Time dimension
  recordedAt  DateTime   @default(now())
  period      String?    // "2024-Q1", "2024-01", etc.

  // Source tracking
  source      String
  confidence  Decimal?   @db.Decimal(3, 2)  // 0.00-1.00

  suburb      Suburb     @relation(fields: [suburbId], references: [id])

  @@index([suburbId, metricType])
  @@index([recordedAt])
  @@index([suburbId, metricType, recordedAt])
}

model MarketIndicator {
  id            String   @id @default(cuid())
  indicatorType String   // cash_rate, gdp_growth, unemployment, etc.
  value         Decimal  @db.Decimal(12, 4)

  // Scope
  scope         String   @default("national")  // national, state, city
  scopeId       String?  // state code or city id

  // Time
  recordedAt    DateTime @default(now())
  effectiveDate DateTime?
  period        String?

  // Source
  source        String
  rawData       Json?

  createdAt     DateTime @default(now())

  @@index([indicatorType, scope])
  @@index([recordedAt])
}
```

#### 1.2.5 Create Migration Script
**File**: `packages/db/prisma/migrations/001_foundation/migration.sql`

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create spatial indexes (run after Prisma migration)
-- These can't be defined in Prisma schema

-- Add geometry columns to State
ALTER TABLE "State" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);

-- Add geometry columns to City
ALTER TABLE "City" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);

-- Add geometry columns to Suburb
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS centroid geography(Point, 4326);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_state_geometry ON "State" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_city_geometry ON "City" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_suburb_geometry ON "Suburb" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_suburb_centroid ON "Suburb" USING GIST (centroid);

-- Add point geometry to Property for spatial queries
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_property_location ON "Property" USING GIST (location);

-- Trigger to auto-update location from lat/lng
CREATE OR REPLACE FUNCTION update_property_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "Property"
FOR EACH ROW EXECUTE FUNCTION update_property_location();
```

### 1.3 Project Structure Organization
**Priority**: P1 | **Effort**: 2 days

#### 1.3.1 Create Package Exports
**File**: `packages/db/src/index.ts`
```typescript
export { prisma } from './client'
export * from '@prisma/client'
export * from './queries/suburbs'
export * from './queries/properties'
export * from './queries/strategies'
```

**File**: `packages/mcp-shared/src/index.ts`
```typescript
export * from './schemas'
export * from './types'
export * from './parsers'
export * from './utils'
```

#### 1.3.2 Create Environment Template
**File**: `apps/web/.env.template`
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/propure?schema=public"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=

# MCP Internal Token (required for production)
MCP_INTERNAL_TOKEN=generate-secure-token-here

# Mock Mode (development only)
MCP_MOCK_MODE=true

# Real-time (Pusher)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Cache (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# External APIs (when not using mock mode)
OXYLABS_USERNAME=
OXYLABS_PASSWORD=
```

### 1.4 Deliverables Checklist
- [ ] All critical bugs fixed and tested
- [ ] Prisma schema with full models
- [ ] PostGIS extensions configured
- [ ] Migration scripts created and tested
- [ ] Environment template documented
- [ ] Package exports organized
- [ ] No TypeScript errors
- [ ] Basic smoke tests passing

---

## Phase 2: AI Agent System
**Duration**: 2 weeks
**Goal**: Implement multi-agent AI orchestration for strategy discovery and property analysis.
**Current State (2025-12-30)**:
- MCP servers fully implemented (3 servers, 15+ tools) - see [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md)
- MCP client with retry logic exists (`apps/web/lib/mcp/client.ts`)
- Chat API has single-model pattern with all 15 MCP tools registered
- `packages/ai` placeholder exists (types only, folders empty)
- Multi-agent orchestration NOT implemented
**Dependency**: Research tools must wrap existing MCP client (do not duplicate)

### 2.1 Agent Architecture Setup
**Priority**: P0 | **Effort**: 3 days

#### 2.1.1 Create AI Package Structure
```
packages/ai/
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts      # Main coordinator
│   │   ├── strategist.ts        # Strategy discovery
│   │   ├── analyst.ts           # Financial calculations
│   │   └── researcher.ts        # Data retrieval
│   ├── tools/
│   │   ├── index.ts             # Tool registry
│   │   ├── discovery-tools.ts   # Strategy capture
│   │   ├── search-tools.ts      # Property search
│   │   ├── financial-tools.ts   # Calculations
│   │   └── ui-tools.ts          # Frontend updates
│   ├── prompts/
│   │   ├── orchestrator.ts      # System prompt
│   │   ├── strategist.ts        # System prompt
│   │   ├── analyst.ts           # System prompt
│   │   └── researcher.ts        # System prompt
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 2.1.2 Implement Orchestrator Agent
**File**: `packages/ai/src/agents/orchestrator.ts`

```typescript
import { generateText, streamText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { orchestratorPrompt } from '../prompts/orchestrator'
import { strategistAgent } from './strategist'
import { analystAgent } from './analyst'
import { researcherAgent } from './researcher'

export interface OrchestratorContext {
  userId: string
  strategyId?: string
  strategy?: Strategy
  conversationHistory: Message[]
}

export async function orchestrate(
  message: string,
  context: OrchestratorContext,
  onToolCall?: (toolCall: ToolCall) => Promise<void>
) {
  const result = await streamText({
    model: google('gemini-2.0-flash'),
    system: orchestratorPrompt(context),
    messages: [
      ...context.conversationHistory,
      { role: 'user', content: message }
    ],
    tools: {
      // Agent invocation tools
      askStrategist: tool({
        description: 'Ask the Strategist agent for strategy discovery, goal setting, or recommendations',
        parameters: z.object({
          task: z.string().describe('What to ask the strategist'),
          discoveryContext: z.any().optional()
        }),
        execute: async ({ task, discoveryContext }) => {
          return await strategistAgent.run(task, { ...context, discoveryContext })
        }
      }),

      askAnalyst: tool({
        description: 'Ask the Analyst agent for financial calculations, ROI, or risk assessment',
        parameters: z.object({
          task: z.string().describe('What to calculate or analyze'),
          propertyData: z.any().optional(),
          financialInputs: z.any().optional()
        }),
        execute: async ({ task, propertyData, financialInputs }) => {
          return await analystAgent.run(task, { ...context, propertyData, financialInputs })
        }
      }),

      askResearcher: tool({
        description: 'Ask the Researcher agent for market data, suburb stats, or property search',
        parameters: z.object({
          task: z.string().describe('What data to retrieve'),
          searchParams: z.any().optional()
        }),
        execute: async ({ task, searchParams }) => {
          return await researcherAgent.run(task, { ...context, searchParams })
        }
      }),

      // Direct tools (for simple operations)
      updateStrategy: tool({
        description: 'Update the user strategy with new information',
        parameters: z.object({
          field: z.string(),
          value: z.any()
        }),
        execute: async ({ field, value }) => {
          // Update strategy in database
          if (context.strategyId) {
            await updateStrategyField(context.strategyId, field, value)
          }
          return { success: true, field, value }
        }
      }),

      updateUI: tool({
        description: 'Send update to frontend UI (map, filters, property list)',
        parameters: z.object({
          type: z.enum(['filters', 'map', 'propertyList', 'strategy', 'detail']),
          payload: z.any()
        }),
        execute: async ({ type, payload }) => {
          // Broadcast via Pusher
          await pusher.trigger(`user-${context.userId}`, 'ui-update', { type, payload })
          if (onToolCall) await onToolCall({ toolName: 'updateUI', args: { type, payload } })
          return { success: true }
        }
      })
    },
    maxSteps: 10, // Allow multi-step reasoning
    onStepFinish: async (step) => {
      // Track tool calls for analytics
      for (const call of step.toolCalls) {
        console.log(`Tool called: ${call.toolName}`, call.args)
      }
    }
  })

  return result
}
```

#### 2.1.3 Implement Strategist Agent
**File**: `packages/ai/src/agents/strategist.ts`

```typescript
import { generateText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { strategistPrompt } from '../prompts/strategist'

const discoverySchema = z.object({
  // Financial
  annualIncome: z.number().optional(),
  availableDeposit: z.number().optional(),
  borrowingCapacity: z.number().optional(),
  existingDebt: z.number().optional(),
  existingProperties: z.number().optional(),

  // Goals
  primaryGoal: z.enum(['cash_flow', 'capital_growth', 'mixed']).optional(),
  timeline: z.enum(['0-5yr', '5-10yr', '10-15yr', '15yr+']).optional(),
  targetPortfolioSize: z.number().optional(),
  targetPassiveIncome: z.number().optional(),

  // Personal
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  timeAvailability: z.enum(['none', 'weekends', 'part-time', 'full-time']).optional(),
  diyCapability: z.boolean().optional(),
  managementStyle: z.enum(['hands-off', 'active']).optional(),

  // Constraints
  maxBudget: z.number().optional(),
  preferredStates: z.array(z.string()).optional(),
  preferredRegions: z.array(z.string()).optional(),
  propertyTypePreference: z.array(z.string()).optional(),

  // Experience
  experienceLevel: z.enum(['first-time', 'some', 'experienced']).optional()
})

export const strategistAgent = {
  async run(task: string, context: any) {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: strategistPrompt,
      messages: [{ role: 'user', content: task }],
      tools: {
        captureDiscoveryInput: tool({
          description: 'Capture a piece of information from the user during discovery',
          parameters: z.object({
            field: z.string().describe('Field name from discovery profile'),
            value: z.any().describe('Value captured from user'),
            confidence: z.number().min(0).max(1).describe('How confident we are in this value')
          }),
          execute: async ({ field, value, confidence }) => {
            // Store in context for later persistence
            return { captured: true, field, value, confidence }
          }
        }),

        askFollowUp: tool({
          description: 'Ask a follow-up question to clarify or gather more info',
          parameters: z.object({
            question: z.string(),
            category: z.enum(['financial', 'goals', 'preferences', 'constraints', 'experience']),
            options: z.array(z.string()).optional()
          }),
          execute: async ({ question, category, options }) => {
            return { question, category, options }
          }
        }),

        recommendStrategy: tool({
          description: 'Recommend an investment strategy based on gathered profile',
          parameters: z.object({
            strategy: z.enum(['CASH_FLOW', 'CAPITAL_GROWTH', 'RENOVATION', 'DEVELOPMENT', 'SMSF', 'COMMERCIAL', 'MIXED']),
            confidence: z.number().min(0).max(1),
            rationale: z.string().describe('Clear explanation of why this strategy fits'),
            keyMetrics: z.array(z.string()).describe('Most important metrics for this strategy'),
            suggestedFilters: z.object({
              minYield: z.number().optional(),
              minGrowth: z.number().optional(),
              maxVacancy: z.number().optional(),
              states: z.array(z.string()).optional(),
              propertyTypes: z.array(z.string()).optional()
            })
          }),
          execute: async (recommendation) => {
            return recommendation
          }
        }),

        summarizeProfile: tool({
          description: 'Summarize the current discovery profile',
          parameters: z.object({}),
          execute: async () => {
            return context.discoveryContext || {}
          }
        })
      }
    })

    return result
  }
}
```

#### 2.1.4 Implement Analyst Agent
**File**: `packages/ai/src/agents/analyst.ts`

```typescript
import { generateText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { analystPrompt } from '../prompts/analyst'

export const analystAgent = {
  async run(task: string, context: any) {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: analystPrompt,
      messages: [{ role: 'user', content: task }],
      tools: {
        calculateCashFlow: tool({
          description: 'Calculate detailed cash flow analysis for a property',
          parameters: z.object({
            purchasePrice: z.number(),
            weeklyRent: z.number(),
            deposit: z.number().min(0),
            interestRate: z.number().default(6.0),
            loanType: z.enum(['IO', 'PI']).default('IO'),
            expenses: z.object({
              councilRates: z.number().default(2000),
              waterRates: z.number().default(800),
              insurance: z.number().default(1500),
              managementFee: z.number().default(0.08), // 8% of rent
              maintenanceReserve: z.number().default(0.01), // 1% of value
              bodyCorpFees: z.number().optional(),
              landTax: z.number().optional()
            }).optional()
          }),
          execute: async (params) => {
            // Validate inputs
            if (params.deposit > params.purchasePrice) {
              throw new Error('Deposit cannot exceed purchase price')
            }

            const {
              purchasePrice,
              weeklyRent,
              deposit,
              interestRate,
              loanType,
              expenses = {}
            } = params

            // Calculate loan
            const loanAmount = purchasePrice - deposit
            const monthlyRate = interestRate / 100 / 12

            // Interest only payment
            const monthlyInterest = loanAmount * monthlyRate
            const annualLoanPayment = loanType === 'IO'
              ? monthlyInterest * 12
              : calculatePIPayment(loanAmount, interestRate, 30) * 12

            // Income
            const annualRent = weeklyRent * 52
            const vacancyAllowance = annualRent * 0.04 // 2 weeks
            const effectiveRent = annualRent - vacancyAllowance

            // Expenses
            const managementFee = effectiveRent * (expenses.managementFee || 0.08)
            const maintenanceReserve = purchasePrice * (expenses.maintenanceReserve || 0.01)
            const councilRates = expenses.councilRates || 2000
            const waterRates = expenses.waterRates || 800
            const insurance = expenses.insurance || 1500
            const bodyCorpFees = expenses.bodyCorpFees || 0
            const landTax = expenses.landTax || 0

            const totalExpenses = managementFee + maintenanceReserve + councilRates +
                                  waterRates + insurance + bodyCorpFees + landTax

            // Cash flow
            const preTaxCashFlow = effectiveRent - totalExpenses - annualLoanPayment
            const weeklyCashFlow = preTaxCashFlow / 52

            // Yields
            const grossYield = (annualRent / purchasePrice) * 100
            const netYield = ((effectiveRent - totalExpenses) / purchasePrice) * 100

            // Debt servicing
            const debtServiceRatio = effectiveRent / annualLoanPayment

            return {
              income: {
                weeklyRent,
                annualRent,
                vacancyAllowance,
                effectiveRent
              },
              expenses: {
                managementFee,
                maintenanceReserve,
                councilRates,
                waterRates,
                insurance,
                bodyCorpFees,
                landTax,
                totalExpenses
              },
              loan: {
                loanAmount,
                interestRate,
                loanType,
                annualPayment: annualLoanPayment,
                monthlyPayment: annualLoanPayment / 12
              },
              cashFlow: {
                annual: preTaxCashFlow,
                monthly: preTaxCashFlow / 12,
                weekly: weeklyCashFlow,
                isPositive: preTaxCashFlow > 0
              },
              metrics: {
                grossYield,
                netYield,
                debtServiceRatio,
                lvr: (loanAmount / purchasePrice) * 100
              }
            }
          }
        }),

        calculateROI: tool({
          description: 'Calculate ROI projection over time',
          parameters: z.object({
            purchasePrice: z.number(),
            deposit: z.number(),
            stampDuty: z.number().optional(),
            legalCosts: z.number().default(2000),
            annualCashFlow: z.number(),
            projectedGrowthRate: z.number().default(3),
            timeframeYears: z.number().default(10),
            taxBracket: z.number().default(0.37)
          }),
          execute: async (params) => {
            const {
              purchasePrice,
              deposit,
              stampDuty = calculateStampDuty(purchasePrice, 'NSW'),
              legalCosts,
              annualCashFlow,
              projectedGrowthRate,
              timeframeYears,
              taxBracket
            } = params

            // Total investment
            const totalAcquisition = deposit + stampDuty + legalCosts

            // Project future value
            const futureValue = purchasePrice * Math.pow(1 + projectedGrowthRate / 100, timeframeYears)
            const capitalGain = futureValue - purchasePrice

            // Cash flow over period
            const totalCashFlow = annualCashFlow * timeframeYears

            // Selling costs (estimate 2.5%)
            const sellingCosts = futureValue * 0.025

            // CGT (50% discount if held > 12 months)
            const taxableGain = capitalGain * 0.5
            const cgt = taxableGain * taxBracket

            // Net profit
            const netProfit = capitalGain + totalCashFlow - sellingCosts - cgt - totalAcquisition + deposit

            // ROI metrics
            const totalROI = (netProfit / totalAcquisition) * 100
            const annualizedROI = Math.pow(1 + totalROI / 100, 1 / timeframeYears) - 1
            const equityMultiple = (deposit + netProfit) / deposit

            return {
              acquisition: {
                purchasePrice,
                deposit,
                stampDuty,
                legalCosts,
                totalAcquisition
              },
              projection: {
                timeframeYears,
                growthRate: projectedGrowthRate,
                futureValue,
                capitalGain
              },
              returns: {
                totalCashFlow,
                sellingCosts,
                cgt,
                netProfit
              },
              metrics: {
                totalROI,
                annualizedROI: annualizedROI * 100,
                equityMultiple,
                cashOnCashReturn: (annualCashFlow / totalAcquisition) * 100
              }
            }
          }
        }),

        assessRisk: tool({
          description: 'Assess risk factors for a property investment',
          parameters: z.object({
            property: z.object({
              price: z.number(),
              suburb: z.string(),
              propertyType: z.string(),
              yearBuilt: z.number().optional()
            }),
            suburbMetrics: z.object({
              vacancyRate: z.number(),
              daysOnMarket: z.number(),
              priceVolatility: z.number().optional(),
              auctionClearance: z.number().optional()
            }),
            loanDetails: z.object({
              lvr: z.number(),
              interestRate: z.number()
            })
          }),
          execute: async ({ property, suburbMetrics, loanDetails }) => {
            const factors = []
            let totalScore = 0
            let factorCount = 0

            // Market risk (vacancy, days on market)
            const vacancyScore = suburbMetrics.vacancyRate < 2 ? 2 :
                                suburbMetrics.vacancyRate < 3 ? 4 :
                                suburbMetrics.vacancyRate < 5 ? 6 : 8
            factors.push({
              category: 'market',
              factor: 'Vacancy rate',
              value: `${suburbMetrics.vacancyRate}%`,
              score: vacancyScore,
              assessment: vacancyScore < 4 ? 'Low risk' : vacancyScore < 6 ? 'Medium risk' : 'High risk'
            })
            totalScore += vacancyScore
            factorCount++

            // Liquidity risk (days on market)
            const domScore = suburbMetrics.daysOnMarket < 30 ? 2 :
                            suburbMetrics.daysOnMarket < 60 ? 4 :
                            suburbMetrics.daysOnMarket < 90 ? 6 : 8
            factors.push({
              category: 'market',
              factor: 'Days on market',
              value: `${suburbMetrics.daysOnMarket} days`,
              score: domScore,
              assessment: domScore < 4 ? 'High liquidity' : domScore < 6 ? 'Medium liquidity' : 'Low liquidity'
            })
            totalScore += domScore
            factorCount++

            // Financial risk (LVR)
            const lvrScore = loanDetails.lvr < 60 ? 2 :
                            loanDetails.lvr < 80 ? 4 :
                            loanDetails.lvr < 90 ? 7 : 9
            factors.push({
              category: 'financial',
              factor: 'Loan to value ratio',
              value: `${loanDetails.lvr}%`,
              score: lvrScore,
              assessment: lvrScore < 4 ? 'Conservative' : lvrScore < 7 ? 'Moderate' : 'Aggressive'
            })
            totalScore += lvrScore
            factorCount++

            // Interest rate sensitivity
            const rateSensitivity = loanDetails.lvr > 80 ? 'High' : loanDetails.lvr > 60 ? 'Medium' : 'Low'
            factors.push({
              category: 'financial',
              factor: 'Interest rate sensitivity',
              value: rateSensitivity,
              score: rateSensitivity === 'High' ? 7 : rateSensitivity === 'Medium' ? 4 : 2,
              assessment: `Cash flow ${rateSensitivity.toLowerCase()}ly sensitive to rate changes`
            })
            totalScore += rateSensitivity === 'High' ? 7 : rateSensitivity === 'Medium' ? 4 : 2
            factorCount++

            const overallScore = Math.round(totalScore / factorCount)

            return {
              overallRiskScore: overallScore,
              riskLevel: overallScore < 4 ? 'Low' : overallScore < 6 ? 'Medium' : 'High',
              factors,
              mitigations: generateMitigations(factors)
            }
          }
        })
      }
    })

    return result
  }
}

function calculatePIPayment(principal: number, rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1)
}

function calculateStampDuty(price: number, state: string): number {
  // Simplified NSW calculation
  if (state === 'NSW') {
    if (price <= 14000) return price * 0.0125
    if (price <= 32000) return 175 + (price - 14000) * 0.015
    if (price <= 85000) return 445 + (price - 32000) * 0.0175
    if (price <= 319000) return 1372 + (price - 85000) * 0.035
    if (price <= 1064000) return 9562 + (price - 319000) * 0.045
    return 43087 + (price - 1064000) * 0.055
  }
  // Default to 4% estimate
  return price * 0.04
}

function generateMitigations(factors: any[]): string[] {
  const mitigations: string[] = []

  for (const factor of factors) {
    if (factor.score >= 6) {
      switch (factor.factor) {
        case 'Vacancy rate':
          mitigations.push('Consider properties in areas with stronger rental demand')
          break
        case 'Days on market':
          mitigations.push('Be prepared for longer holding periods if selling')
          break
        case 'Loan to value ratio':
          mitigations.push('Consider increasing deposit or purchasing a lower-priced property')
          break
        case 'Interest rate sensitivity':
          mitigations.push('Build a cash buffer for rate increases')
          mitigations.push('Consider fixing a portion of the loan')
          break
      }
    }
  }

  return mitigations
}
```

#### 2.1.5 Implement Researcher Agent
**File**: `packages/ai/src/agents/researcher.ts`

```typescript
import { generateText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { researcherPrompt } from '../prompts/researcher'
import { domainTools, realestateTools, marketTools } from '@/lib/mcp/client'

export const researcherAgent = {
  async run(task: string, context: any) {
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: researcherPrompt,
      messages: [{ role: 'user', content: task }],
      tools: {
        searchProperties: tool({
          description: 'Search for properties matching criteria',
          parameters: z.object({
            suburbs: z.array(z.string()).optional(),
            state: z.string().optional(),
            listingType: z.enum(['sale', 'rent', 'sold']).default('sale'),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            minBeds: z.number().optional(),
            maxBeds: z.number().optional(),
            propertyTypes: z.array(z.string()).optional(),
            pageSize: z.number().default(20)
          }),
          execute: async (params) => {
            // Search both Domain and RealEstate
            const [domainResults, reaResults] = await Promise.allSettled([
              domainTools.searchProperties(params),
              realestateTools.searchProperties(params)
            ])

            // Combine and deduplicate
            const allListings = [
              ...(domainResults.status === 'fulfilled' ? domainResults.value.listings : []),
              ...(reaResults.status === 'fulfilled' ? reaResults.value.listings : [])
            ]

            // Dedupe by address similarity
            const unique = deduplicateListings(allListings)

            return {
              listings: unique,
              totalCount: unique.length,
              sources: {
                domain: domainResults.status === 'fulfilled',
                rea: reaResults.status === 'fulfilled'
              }
            }
          }
        }),

        getSuburbStats: tool({
          description: 'Get statistics and metrics for a suburb',
          parameters: z.object({
            suburb: z.string(),
            state: z.string().optional(),
            postcode: z.string().optional()
          }),
          execute: async (params) => {
            const stats = await domainTools.getSuburbStats(params)
            return stats
          }
        }),

        getComparables: tool({
          description: 'Get comparable recent sales for a property',
          parameters: z.object({
            suburb: z.string(),
            state: z.string(),
            propertyType: z.string(),
            bedrooms: z.number().optional(),
            radius: z.number().default(2) // km
          }),
          execute: async (params) => {
            const sales = await domainTools.getSalesHistory({
              suburb: params.suburb,
              state: params.state,
              months: 6
            })

            // Filter by property type and bedrooms
            const filtered = sales.filter(sale =>
              sale.propertyType === params.propertyType &&
              (!params.bedrooms || sale.bedrooms === params.bedrooms)
            )

            return {
              comparables: filtered.slice(0, 10),
              medianPrice: calculateMedian(filtered.map(s => s.price)),
              count: filtered.length
            }
          }
        }),

        getMarketIndicators: tool({
          description: 'Get national or state-level market indicators',
          parameters: z.object({
            scope: z.enum(['national', 'state']).default('national'),
            state: z.string().optional()
          }),
          execute: async (params) => {
            const [rates, economic] = await Promise.all([
              marketTools.getRbaRates(true, true),
              marketTools.getEconomicIndicators()
            ])

            return {
              rbaRates: rates,
              economic,
              asOf: new Date().toISOString()
            }
          }
        }),

        getInfrastructureProjects: tool({
          description: 'Get upcoming infrastructure projects for a region',
          parameters: z.object({
            state: z.string(),
            city: z.string().optional()
          }),
          execute: async (params) => {
            // This would connect to Infrastructure Australia data
            // For now, return mock or cached data
            return {
              projects: [],
              message: 'Infrastructure data not yet implemented'
            }
          }
        })
      }
    })

    return result
  }
}

function deduplicateListings(listings: any[]): any[] {
  const seen = new Map()

  for (const listing of listings) {
    // Create key from normalized address
    const key = normalizeAddress(listing.address?.displayAddress || '')

    if (!seen.has(key)) {
      seen.set(key, listing)
    } else {
      // Keep the one with more data
      const existing = seen.get(key)
      if (countFields(listing) > countFields(existing)) {
        seen.set(key, listing)
      }
    }
  }

  return Array.from(seen.values())
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/street|st|road|rd|avenue|ave|drive|dr|court|ct/g, '')
}

function countFields(obj: any): number {
  return Object.values(obj).filter(v => v != null && v !== '').length
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
```

#### 2.1.6 MCP Integration Pattern
**IMPORTANT**: All research tools in the AI agent system MUST use the existing MCP client wrappers from `apps/web/lib/mcp/client.ts`. Do NOT create new data fetching logic.

**Existing MCP Client Reference**:
```typescript
// Import from existing MCP client (450+ lines, fully implemented)
import { domainTools, realestateTools, marketTools } from '@/lib/mcp/client'

// Example usage in Researcher agent tools:
// searchProperties → domainTools.searchProperties + realestateTools.searchProperties
// getSuburbStats → domainTools.getSuburbStats
// getMarketIndicators → marketTools.getRbaRates + getEconomicIndicators
```

**Tool → MCP Client Mapping**:

| Agent Tool | MCP Client Function | MCP Server |
|------------|---------------------|------------|
| `searchProperties` | `domainTools.searchProperties`, `realestateTools.searchProperties` | domain, realestate |
| `getSuburbStats` | `domainTools.getSuburbStats` | domain |
| `getSuburbProfile` | `realestateTools.getSuburbProfile` | realestate |
| `getSalesHistory` | `domainTools.getSalesHistory` | domain |
| `getSoldProperties` | `realestateTools.getSoldProperties` | realestate |
| `getAuctionResults` | `domainTools.getAuctionResults` | domain |
| `getRbaRates` | `marketTools.getRbaRates` | market |
| `getEconomicIndicators` | `marketTools.getEconomicIndicators` | market |
| `getDemographics` | `marketTools.getAbsDemographics` | market |
| `getPopulationProjections` | `marketTools.getPopulationProjections` | market |

> **File Reference**: See [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md) for complete MCP documentation.

### 2.2 System Prompts
**Priority**: P0 | **Effort**: 2 days

#### 2.2.1 Orchestrator Prompt
**File**: `packages/ai/src/prompts/orchestrator.ts`

```typescript
export function orchestratorPrompt(context: any): string {
  const strategyContext = context.strategy
    ? `Current strategy: ${context.strategy.type} (${context.strategy.status})`
    : 'No strategy identified yet'

  return `You are the Propure AI assistant, helping users discover their ideal property investment strategy in Australia.

You coordinate between specialist agents:
- STRATEGIST: For strategy discovery, goal setting, and recommendations
- ANALYST: For financial calculations, ROI projections, and risk assessment
- RESEARCHER: For market data, suburb statistics, and property searches

${strategyContext}

## Your Responsibilities

1. **Route requests appropriately**:
   - Strategy/goal questions → askStrategist
   - Financial calculations → askAnalyst
   - Property search/market data → askResearcher

2. **Synthesize agent outputs** into cohesive, friendly responses

3. **Trigger UI updates** when relevant:
   - After strategy recommendation → update strategy display
   - After property search → update map and property list
   - After suburb analysis → highlight suburbs on map

4. **Maintain conversation context** - remember what the user has told you

## Conversation Guidelines

- Be conversational and friendly, not robotic
- Ask ONE question at a time during discovery
- Explain your reasoning when making recommendations
- Always ground responses in data when available
- If uncertain, say so and explain what you'd need to know

## Current User Context
User ID: ${context.userId}
${context.strategy ? `Strategy: ${JSON.stringify(context.strategy, null, 2)}` : 'Strategy: Not yet identified'}
`
}
```

#### 2.2.2 Strategist Prompt
**File**: `packages/ai/src/prompts/strategist.ts`

```typescript
export const strategistPrompt = `You are a property investment strategy advisor for the Australian market.

## Your Role

Help users discover the right investment strategy through conversational questions. You need to understand:

1. **Financial Situation**
   - Annual income and stability
   - Available deposit/equity
   - Borrowing capacity (if known)
   - Existing debts and properties

2. **Investment Goals**
   - Primary objective: income now vs wealth building vs quick profit
   - Timeline: when do they need returns?
   - Target portfolio size
   - Exit strategy

3. **Personal Circumstances**
   - Risk tolerance (conservative, moderate, aggressive)
   - Time availability for property management
   - DIY capability for renovations
   - Management preference (hands-off vs active)

4. **Constraints**
   - Maximum budget
   - Geographic preferences or restrictions
   - Property type preferences

## Strategy Types

| Strategy | Best For | Key Metrics |
|----------|----------|-------------|
| CASH_FLOW | Passive income seekers, retirees | Gross yield >5%, low vacancy |
| CAPITAL_GROWTH | Wealth builders, long-term investors | Growth >5% pa, infrastructure |
| RENOVATION | Active investors with trade skills | Below median, quick sales |
| DEVELOPMENT | Experienced investors, high capital | Zoning, land value ratio |
| SMSF | Super fund trustees, retirement | Compliance, stability |
| COMMERCIAL | Higher capital investors | Cap rate, lease length |
| MIXED | Diversified portfolios | Balance of metrics |

## Guidelines

- Ask one question at a time - be conversational, not interrogative
- Capture inputs using the captureDiscoveryInput tool
- When you have enough information (usually 5-8 questions), make a recommendation
- Use recommendStrategy with clear rationale connecting their situation to the strategy
- Suggest appropriate filters based on the strategy
`
```

### 2.3 Update Chat API Route
**Priority**: P0 | **Effort**: 2 days

**Current State (2025-12-30)**: Chat API exists at `apps/web/app/api/chat/route.ts` with:
- Single `gemini-2.0-flash` model (not multi-agent)
- 15 MCP-based tools already registered
- No multi-agent orchestration yet
- No chat/session persistence (stateless)

**Migration Path**:
1. Extract tools to `@propure/ai/tools/` (wrap existing MCP client)
2. Create agent modules that use these tools
3. Refactor chat route to use orchestrator
4. Add session persistence

**Target Implementation**:

**File**: `apps/web/app/api/chat/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { orchestrate } from '@propure/ai'
import { prisma } from '@propure/db'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, sessionId, strategyId } = await request.json()

  // Load or create chat session
  let session = sessionId
    ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
    : null

  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        userId,
        strategyId,
        messages: []
      }
    })
  }

  // Load strategy if exists
  const strategy = strategyId
    ? await prisma.strategy.findUnique({ where: { id: strategyId } })
    : null

  // Build context
  const context = {
    userId,
    strategyId: strategy?.id,
    strategy,
    conversationHistory: session.messages as any[]
  }

  // Track tool calls for UI updates
  const toolCalls: any[] = []

  // Run orchestrator with streaming
  const result = await orchestrate(message, context, async (toolCall) => {
    toolCalls.push(toolCall)
  })

  // Update session with new messages
  const updatedMessages = [
    ...context.conversationHistory,
    { role: 'user', content: message },
    { role: 'assistant', content: result.text }
  ]

  await prisma.chatSession.update({
    where: { id: session.id },
    data: {
      messages: updatedMessages,
      messageCount: updatedMessages.length,
      lastMessageAt: new Date()
    }
  })

  // Return streaming response
  return result.toDataStreamResponse()
}
```

### 2.4 Deliverables Checklist
- [ ] Orchestrator agent coordinating sub-agents
- [ ] Strategist agent with discovery flow
- [ ] Analyst agent with financial tools
- [ ] Researcher agent with search tools
- [ ] System prompts for all agents
- [ ] Chat API with streaming
- [ ] Tool registry with all tools
- [ ] Unit tests for financial calculations
- [ ] Integration tests for agent flows

---

## Phase 3: Map & Visualization
**Duration**: 2 weeks
**Goal**: Replace Google Maps with MapLibre, implement suburb heatmaps and property markers.

### 3.1 Map Infrastructure
**Priority**: P0 | **Effort**: 3 days

#### 3.1.1 Install Dependencies
```bash
pnpm add react-map-gl maplibre-gl @deck.gl/core @deck.gl/layers @deck.gl/react
pnpm remove @react-google-maps/api
```

#### 3.1.2 Create Map Store (Zustand)
**File**: `apps/web/stores/map-store.ts`

```typescript
import { create } from 'zustand'
import type { Map as MaplibreMap } from 'maplibre-gl'

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

interface MapState {
  // Map instance
  map: MaplibreMap | null
  setMap: (map: MaplibreMap | null) => void

  // View state
  viewState: ViewState
  setViewState: (viewState: Partial<ViewState>) => void

  // Layers visibility
  showHeatmap: boolean
  showMarkers: boolean
  showSuburbBoundaries: boolean
  toggleLayer: (layer: 'heatmap' | 'markers' | 'boundaries') => void

  // Heatmap config
  heatmapMetric: 'cashFlowScore' | 'capitalGrowthScore' | 'overallScore' | 'yield'
  setHeatmapMetric: (metric: MapState['heatmapMetric']) => void

  // Selected items
  selectedSuburb: string | null
  selectedProperty: string | null
  setSelectedSuburb: (id: string | null) => void
  setSelectedProperty: (id: string | null) => void

  // Highlighted suburbs (from AI)
  highlightedSuburbs: string[]
  setHighlightedSuburbs: (ids: string[]) => void

  // Actions
  flyTo: (coords: { lat: number; lng: number }, zoom?: number) => void
  fitBounds: (bounds: [[number, number], [number, number]]) => void
  reset: () => void
}

const AUSTRALIA_CENTER = { longitude: 133.7751, latitude: -25.2744 }
const AUSTRALIA_ZOOM = 4

export const useMapStore = create<MapState>((set, get) => ({
  // Map instance
  map: null,
  setMap: (map) => set({ map }),

  // View state
  viewState: {
    ...AUSTRALIA_CENTER,
    zoom: AUSTRALIA_ZOOM,
    pitch: 0,
    bearing: 0
  },
  setViewState: (viewState) => set((state) => ({
    viewState: { ...state.viewState, ...viewState }
  })),

  // Layers
  showHeatmap: true,
  showMarkers: true,
  showSuburbBoundaries: false,
  toggleLayer: (layer) => set((state) => {
    switch (layer) {
      case 'heatmap': return { showHeatmap: !state.showHeatmap }
      case 'markers': return { showMarkers: !state.showMarkers }
      case 'boundaries': return { showSuburbBoundaries: !state.showSuburbBoundaries }
    }
  }),

  // Heatmap
  heatmapMetric: 'overallScore',
  setHeatmapMetric: (metric) => set({ heatmapMetric: metric }),

  // Selection
  selectedSuburb: null,
  selectedProperty: null,
  setSelectedSuburb: (id) => set({ selectedSuburb: id }),
  setSelectedProperty: (id) => set({ selectedProperty: id }),

  // Highlights
  highlightedSuburbs: [],
  setHighlightedSuburbs: (ids) => set({ highlightedSuburbs: ids }),

  // Actions
  flyTo: (coords, zoom = 12) => {
    const { map } = get()
    if (map) {
      map.flyTo({
        center: [coords.lng, coords.lat],
        zoom,
        duration: 1500
      })
    }
    set({
      viewState: {
        ...get().viewState,
        longitude: coords.lng,
        latitude: coords.lat,
        zoom
      }
    })
  },

  fitBounds: (bounds) => {
    const { map } = get()
    if (map) {
      map.fitBounds(bounds, { padding: 50, duration: 1500 })
    }
  },

  reset: () => set({
    viewState: { ...AUSTRALIA_CENTER, zoom: AUSTRALIA_ZOOM, pitch: 0, bearing: 0 },
    selectedSuburb: null,
    selectedProperty: null,
    highlightedSuburbs: []
  })
}))
```

#### 3.1.3 Create Main Map Component
**File**: `apps/web/components/map/property-map.tsx`

```typescript
'use client'

import { useCallback, useEffect } from 'react'
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre'
import { DeckGL } from '@deck.gl/react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { ScatterplotLayer } from '@deck.gl/layers'
import { useMapStore } from '@/stores/map-store'
import { usePropertyStore } from '@/stores/property-store'
import { PropertyMarker } from './property-marker'
import { SuburbPopup } from './suburb-popup'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
// Alternative: 'https://api.maptiler.com/maps/streets/style.json?key=YOUR_KEY'

interface PropertyMapProps {
  className?: string
}

export function PropertyMap({ className }: PropertyMapProps) {
  const {
    viewState,
    setViewState,
    setMap,
    showHeatmap,
    showMarkers,
    heatmapMetric,
    selectedSuburb,
    selectedProperty,
    setSelectedSuburb,
    setSelectedProperty,
    highlightedSuburbs
  } = useMapStore()

  const { properties, suburbs } = usePropertyStore()

  // Handle view state changes
  const onMove = useCallback((evt: any) => {
    setViewState(evt.viewState)
  }, [setViewState])

  // Create heatmap layer
  const heatmapLayer = showHeatmap && suburbs.length > 0 ? new HeatmapLayer({
    id: 'suburb-heatmap',
    data: suburbs,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getWeight: (d: any) => d[heatmapMetric] || 50,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.1,
    colorRange: [
      [255, 255, 178],
      [254, 217, 118],
      [254, 178, 76],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38]
    ]
  }) : null

  // Create property markers layer
  const markersLayer = showMarkers && properties.length > 0 ? new ScatterplotLayer({
    id: 'property-markers',
    data: properties,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getRadius: (d: any) => selectedProperty === d.id ? 12 : 8,
    getFillColor: (d: any) => {
      if (selectedProperty === d.id) return [59, 130, 246, 255] // blue-500
      if (highlightedSuburbs.includes(d.suburbId)) return [34, 197, 94, 255] // green-500
      return [239, 68, 68, 200] // red-500
    },
    pickable: true,
    onClick: ({ object }) => {
      if (object) {
        setSelectedProperty(object.id)
      }
    }
  }) : null

  const layers = [heatmapLayer, markersLayer].filter(Boolean)

  return (
    <div className={className}>
      <Map
        {...viewState}
        onMove={onMove}
        mapStyle={MAP_STYLE}
        onLoad={(evt) => setMap(evt.target)}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Suburb boundaries (if enabled) */}
        {/* Would need GeoJSON data for suburb polygons */}

        {/* DeckGL overlay for heatmap and markers */}
        <DeckGL
          viewState={viewState}
          layers={layers}
          controller={false}
          getCursor={() => 'pointer'}
        />

        {/* Selected suburb popup */}
        {selectedSuburb && (
          <SuburbPopup
            suburbId={selectedSuburb}
            onClose={() => setSelectedSuburb(null)}
          />
        )}
      </Map>
    </div>
  )
}
```

### 3.2 Visualization Components
**Priority**: P0 | **Effort**: 3 days

#### 3.2.1 Property Marker Component
**File**: `apps/web/components/map/property-marker.tsx`

```typescript
import { Marker } from 'react-map-gl/maplibre'
import { cn } from '@/lib/utils'

interface PropertyMarkerProps {
  property: {
    id: string
    latitude: number
    longitude: number
    priceDisplay: string
    bedrooms: number
    propertyType: string
  }
  isSelected: boolean
  isHighlighted: boolean
  onClick: () => void
}

export function PropertyMarker({
  property,
  isSelected,
  isHighlighted,
  onClick
}: PropertyMarkerProps) {
  return (
    <Marker
      latitude={property.latitude}
      longitude={property.longitude}
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onClick()
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full cursor-pointer transition-all',
          'hover:scale-110 hover:z-10',
          isSelected && 'scale-125 z-20',
          isHighlighted ? 'bg-green-500' : 'bg-red-500',
          isSelected && 'ring-2 ring-white shadow-lg'
        )}
        style={{
          width: isSelected ? 40 : 32,
          height: isSelected ? 40 : 32
        }}
      >
        <span className="text-white text-xs font-medium">
          {property.bedrooms}
        </span>
      </div>
    </Marker>
  )
}
```

#### 3.2.2 Suburb Popup Component
**File**: `apps/web/components/map/suburb-popup.tsx`

```typescript
import { Popup } from 'react-map-gl/maplibre'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'

interface SuburbPopupProps {
  suburbId: string
  onClose: () => void
}

export function SuburbPopup({ suburbId, onClose }: SuburbPopupProps) {
  const { data: suburb, isLoading } = trpc.suburbs.getById.useQuery({ id: suburbId })

  if (isLoading || !suburb) return null

  return (
    <Popup
      latitude={suburb.latitude}
      longitude={suburb.longitude}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      anchor="bottom"
      offset={20}
    >
      <Card className="w-64 border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {suburb.name}, {suburb.postcode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Median Price</span>
            <span className="font-medium">
              ${(suburb.medianPrice / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Yield</span>
            <span className="font-medium">{suburb.grossYield?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vacancy</span>
            <span className="font-medium">{suburb.vacancyRate?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days on Market</span>
            <span className="font-medium">{suburb.daysOnMarket} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Growth (1yr)</span>
            <span className={cn(
              'font-medium',
              suburb.annualGrowth > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {suburb.annualGrowth > 0 ? '+' : ''}{suburb.annualGrowth?.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Popup>
  )
}
```

### 3.3 Map Integration with AI
**Priority**: P1 | **Effort**: 2 days

#### 3.3.1 Update UI Tool Handler
**File**: `apps/web/hooks/use-ai-ui-updates.ts`

```typescript
import { useEffect } from 'react'
import Pusher from 'pusher-js'
import { useMapStore } from '@/stores/map-store'
import { usePropertyStore } from '@/stores/property-store'
import { useStrategyStore } from '@/stores/strategy-store'

export function useAIUIUpdates(userId: string) {
  const mapStore = useMapStore()
  const propertyStore = usePropertyStore()
  const strategyStore = useStrategyStore()

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    })

    const channel = pusher.subscribe(`user-${userId}`)

    channel.bind('ui-update', (data: { type: string; payload: any }) => {
      switch (data.type) {
        case 'filters':
          // Update property filters and refetch
          propertyStore.setFilters(data.payload)
          break

        case 'map':
          // Update map view
          if (data.payload.center) {
            mapStore.flyTo(data.payload.center, data.payload.zoom)
          }
          if (data.payload.highlightSuburbs) {
            mapStore.setHighlightedSuburbs(data.payload.highlightSuburbs)
          }
          if (data.payload.heatmapMetric) {
            mapStore.setHeatmapMetric(data.payload.heatmapMetric)
          }
          break

        case 'propertyList':
          // Update property list
          propertyStore.setProperties(data.payload.properties)
          break

        case 'strategy':
          // Update strategy display
          strategyStore.setStrategy(data.payload)
          break

        case 'detail':
          // Open property detail
          mapStore.setSelectedProperty(data.payload.propertyId)
          if (data.payload.flyTo) {
            mapStore.flyTo(data.payload.coordinates)
          }
          break
      }
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId, mapStore, propertyStore, strategyStore])
}
```

### 3.4 Deliverables Checklist
- [ ] MapLibre map component with controls
- [ ] Zustand map store
- [ ] Suburb heatmap layer (deck.gl)
- [ ] Property marker layer
- [ ] Marker clustering at low zoom
- [ ] Click interactions (suburb popup, property selection)
- [ ] AI-triggered map updates via Pusher
- [ ] Map style configuration
- [ ] Mobile responsive layout
- [ ] Performance optimization (virtualization)

---

## Phase 4: Real-Time & UI Polish
**Duration**: 2 weeks
**Goal**: Implement real-time updates, complete dashboard layout, polish UX.

### 4.1 Real-Time Infrastructure
**Priority**: P0 | **Effort**: 2 days

*[Detailed implementation for Pusher setup, channels, client hooks]*

### 4.2 Dashboard Layout
**Priority**: P0 | **Effort**: 3 days

*[Detailed implementation for split-panel layout, responsive design]*

### 4.3 Property Detail Panel
**Priority**: P0 | **Effort**: 2 days

*[Detailed implementation for property detail slide-out, financial summary]*

### 4.4 Chat Panel
**Priority**: P0 | **Effort**: 2 days

*[Detailed implementation for chat UI, message streaming, tool indicators]*

### 4.5 Testing & Polish
**Priority**: P1 | **Effort**: 3 days

*[Testing strategy, E2E tests, accessibility, performance]*

---

## Phase 5: Data Ingestion & Automation
**Duration**: 2 weeks
**Goal**: Automate data refresh, improve data quality.

### 5.1 Inngest Workflows
**Priority**: P0 | **Effort**: 4 days

*[Detailed implementation for scheduled jobs, data pipelines]*

### 5.2 Data Quality
**Priority**: P1 | **Effort**: 3 days

*[Deduplication, validation, staleness detection]*

### 5.3 External API Integration
**Priority**: P1 | **Effort**: 3 days

*[Domain API, ABS API, RBA API integration]*

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to strategy identification | < 15 minutes | Avg conversation duration |
| Properties shortlisted per session | > 3 | DB count |
| Return user rate | > 40% | 7-day return |
| AI response time | < 3 seconds | P95 latency |
| Data freshness | < 24 hours | Last update timestamp |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Property API access limitations | High | High | Multiple data sources, scraping fallback, mock mode |
| AI hallucination on property data | Medium | High | Ground responses in database facts, cite sources |
| High AI API costs | Medium | Medium | Use Gemini Flash for efficiency, implement caching |
| Data licensing costs | Medium | Medium | Start with open sources, negotiate enterprise deals |

---

## Appendix A: Investment Strategy Definitions

| Strategy | Description | Key Metrics | Typical Filters |
|----------|-------------|-------------|-----------------|
| **CASH_FLOW** | Positive rental income after expenses | Gross yield, vacancy rate | Yield >5%, regional areas |
| **CAPITAL_GROWTH** | Long-term property value appreciation | Historical growth, income growth | Metro fringe, infrastructure |
| **RENOVATION** | Buy, improve, sell for profit | Days on market, comparables | Below median, high discount |
| **DEVELOPMENT** | Subdivide or build new dwellings | Zoning, land value ratio | R3+ zoning, growth corridors |
| **SMSF** | Self-Managed Super Fund compliant | Compliance, stability | SMSF-eligible, stable yield |
| **COMMERCIAL** | Office, retail, industrial | Cap rate, lease length | Commercial zones, NNN leases |

---

*Document Version: 1.0*
*Status: Ready for Review*
