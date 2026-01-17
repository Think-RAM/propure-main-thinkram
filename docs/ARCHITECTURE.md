# Propure - System Architecture

> **Purpose**: Comprehensive technical architecture for the Propure property investment platform.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Data Layer Architecture](#3-data-layer-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [AI Agent Architecture](#5-ai-agent-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Real-Time Communication](#7-real-time-communication)
8. [Background Jobs & Workflows](#8-background-jobs--workflows)
9. [External Integrations](#9-external-integrations)
10. [Security Architecture](#10-security-architecture)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Monitoring & Observability](#12-monitoring--observability)

---

## 1. System Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROPURE SYSTEM OVERVIEW                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   USERS                          PLATFORM                        EXTERNAL       │
│   ─────                          ────────                        ────────       │
│                                                                                  │
│   ┌─────────┐                 ┌─────────────────┐              ┌─────────────┐  │
│   │ Web App │ ◄──────────────▶│    Next.js 15   │◄────────────▶│ Domain API  │  │
│   │ (React) │                 │   (Frontend +   │              │ REA API     │  │
│   └─────────┘                 │    Backend)     │              │ CoreLogic   │  │
│                               └────────┬────────┘              └─────────────┘  │
│   ┌─────────┐                          │                                        │
│   │ Mobile  │                          │                       ┌─────────────┐  │
│   │ (PWA)   │ ◄────────────────────────┤                       │ ABS Data    │  │
│   └─────────┘                          │                       │ RBA Data    │  │
│                               ┌────────▼────────┐              │ Govt APIs   │  │
│                               │   PostgreSQL    │              └─────────────┘  │
│                               │ (Neon + PostGIS │                               │
│                               │ + TimescaleDB   │              ┌─────────────┐  │
│                               │ + pgvector)     │              │ Claude API  │  │
│                               └─────────────────┘              │ (Anthropic) │  │
│                                                                └─────────────┘  │
│                               ┌─────────────────┐                               │
│                               │    Inngest      │              ┌─────────────┐  │
│                               │ (Background     │              │ Pusher/Ably │  │
│                               │  Jobs)          │              │ (Real-time) │  │
│                               └─────────────────┘              └─────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | UI, SSR, RSC |
| **State** | Zustand, TanStack Query | Client/server state |
| **Maps** | MapLibre GL, deck.gl | Geospatial visualization |
| **Styling** | Tailwind CSS v4, shadcn/ui | UI components |
| **API** | tRPC, Server Actions | Type-safe API |
| **Database** | PostgreSQL 16 (Neon) | Primary data store |
| **Extensions** | PostGIS, TimescaleDB, pgvector | Geo, time-series, vectors |
| **ORM** | Prisma | Database access |
| **Cache** | Upstash Redis | Caching, rate limiting |
| **Background** | Inngest | Reliable job processing |
| **AI** | Vercel AI SDK, Claude | AI chat, agents |
| **Real-time** | Pusher/Ably | WebSocket updates |
| **Auth** | NextAuth.js v5 | Authentication |
| **Hosting** | Vercel | Edge + serverless |

---

## 2. High-Level Architecture

### Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  User Request                                                                    │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         VERCEL EDGE NETWORK                              │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │    │
│  │  │    CDN      │    │   Edge      │    │   Edge      │                  │    │
│  │  │  (Static)   │    │  Functions  │    │  Middleware │                  │    │
│  │  │             │    │  (Auth,     │    │  (Rate      │                  │    │
│  │  │  JS/CSS/    │    │   Geo)      │    │   Limit)    │                  │    │
│  │  │  Images     │    │             │    │             │                  │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                         │
│                                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      NEXT.JS APPLICATION                                 │    │
│  │                                                                          │    │
│  │   ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐   │    │
│  │   │  React Server    │    │   API Routes     │    │  Server        │   │    │
│  │   │  Components      │    │   (tRPC)         │    │  Actions       │   │    │
│  │   │                  │    │                  │    │                │   │    │
│  │   │  • Page renders  │    │  • Data queries  │    │  • Mutations   │   │    │
│  │   │  • Data fetching │    │  • AI endpoints  │    │  • Form submit │   │    │
│  │   └──────────────────┘    └──────────────────┘    └────────────────┘   │    │
│  │              │                     │                      │             │    │
│  │              └─────────────────────┼──────────────────────┘             │    │
│  │                                    │                                    │    │
│  │                           ┌────────▼────────┐                          │    │
│  │                           │  Service Layer  │                          │    │
│  │                           │                 │                          │    │
│  │                           │  • Business     │                          │    │
│  │                           │    logic        │                          │    │
│  │                           │  • Validation   │                          │    │
│  │                           │  • AI agents    │                          │    │
│  │                           └────────┬────────┘                          │    │
│  │                                    │                                    │    │
│  └────────────────────────────────────┼────────────────────────────────────┘    │
│                                       │                                          │
│       ┌───────────────┬───────────────┼───────────────┬───────────────┐         │
│       │               │               │               │               │          │
│       ▼               ▼               ▼               ▼               ▼          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Neon    │    │ Upstash │    │ Inngest │    │ Claude  │    │ Pusher  │       │
│  │ (PG)    │    │ (Redis) │    │ (Jobs)  │    │ (AI)    │    │ (WS)    │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
propure/
├── apps/
│   └── web/                          # Next.js 15 application
│       ├── app/                      # App Router
│       │   ├── (auth)/               # Auth routes (login, register)
│       │   ├── (dashboard)/          # Protected routes
│       │   │   ├── layout.tsx        # Dashboard layout (split-panel)
│       │   │   ├── page.tsx          # Main dashboard
│       │   │   └── [sessionId]/      # Strategy session
│       │   ├── api/                  # API routes
│       │   │   ├── trpc/             # tRPC router
│       │   │   ├── chat/             # AI chat endpoint
│       │   │   ├── inngest/          # Inngest webhook
│       │   │   └── webhooks/         # External webhooks
│       │   └── actions/              # Server actions
│       ├── components/               # React components
│       │   ├── chat/                 # Chat panel components
│       │   ├── map/                  # Map components
│       │   ├── property/             # Property cards, lists
│       │   └── ui/                   # shadcn/ui components
│       ├── lib/                      # Utilities
│       └── stores/                   # Zustand stores
│
├── packages/
│   ├── db/                           # Database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Prisma schema
│   │   │   └── migrations/           # DB migrations
│   │   ├── src/
│   │   │   ├── client.ts             # Prisma client
│   │   │   └── queries/              # Reusable queries
│   │   └── package.json
│   │
│   ├── ai/                           # AI agents package
│   │   ├── src/
│   │   │   ├── agents/               # Agent definitions
│   │   │   │   ├── orchestrator.ts
│   │   │   │   ├── strategist.ts
│   │   │   │   ├── analyst.ts
│   │   │   │   └── researcher.ts
│   │   │   ├── tools/                # AI tools
│   │   │   │   ├── search-properties.ts
│   │   │   │   ├── get-suburb-stats.ts
│   │   │   │   ├── calculate-roi.ts
│   │   │   │   └── update-filters.ts
│   │   │   └── prompts/              # System prompts
│   │   └── package.json
│   │
│   ├── geo/                          # Geospatial utilities
│   │   ├── src/
│   │   │   ├── queries.ts            # PostGIS queries
│   │   │   ├── scoring.ts            # Suburb scoring
│   │   │   └── filters.ts            # Geo filters
│   │   └── package.json
│   │
│   ├── inngest/                      # Background jobs
│   │   ├── src/
│   │   │   ├── client.ts             # Inngest client
│   │   │   └── functions/            # Job definitions
│   │   │       ├── data-ingestion.ts
│   │   │       ├── suburb-scoring.ts
│   │   │       └── scheduled-refresh.ts
│   │   └── package.json
│   │
│   └── shared/                       # Shared types & utils
│       ├── src/
│       │   ├── types/                # TypeScript types
│       │   ├── schemas/              # Zod schemas
│       │   ├── constants/            # Shared constants
│       │   └── utils/                # Utility functions
│       └── package.json
│
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspaces
└── package.json                      # Root package.json
```

---

## 3. Data Layer Architecture

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  USERS & AUTH                    STRATEGY                     PROPERTIES        │
│  ────────────                    ────────                     ──────────        │
│  ┌──────────────┐               ┌──────────────┐             ┌──────────────┐   │
│  │    users     │               │  strategies  │             │  properties  │   │
│  ├──────────────┤               ├──────────────┤             ├──────────────┤   │
│  │ id           │◄──────────────│ user_id      │             │ id           │   │
│  │ email        │               │ type         │             │ external_id  │   │
│  │ name         │               │ params (JSON)│             │ address      │   │
│  │ avatar       │               │ status       │             │ suburb_id    │──┐│
│  │ created_at   │               │ created_at   │             │ location     │  ││
│  └──────────────┘               └──────────────┘             │ (GEOGRAPHY)  │  ││
│         │                              │                      │ price        │  ││
│         │                              │                      │ bedrooms     │  ││
│         ▼                              ▼                      │ bathrooms    │  ││
│  ┌──────────────┐               ┌──────────────┐             │ land_size    │  ││
│  │   sessions   │               │   searches   │             │ property_type│  ││
│  ├──────────────┤               ├──────────────┤             │ listing_type │  ││
│  │ user_id      │               │ strategy_id  │             │ data (JSON)  │  ││
│  │ messages[]   │               │ filters      │             │ created_at   │  ││
│  │ context      │               │ results[]    │             │ updated_at   │  ││
│  └──────────────┘               │ created_at   │             └──────────────┘  ││
│                                 └──────────────┘                    │          ││
│                                                                     │          ││
│  GEOGRAPHIC DATA                                                    │          ││
│  ───────────────                                                    │          ││
│  ┌──────────────┐               ┌──────────────┐             ┌──────┴───────┐  ││
│  │   states     │◄──────────────│   cities     │◄────────────│   suburbs    │◄─┘│
│  ├──────────────┤               ├──────────────┤             ├──────────────┤   │
│  │ id           │               │ id           │             │ id           │   │
│  │ name         │               │ state_id     │             │ city_id      │   │
│  │ code         │               │ name         │             │ name         │   │
│  │ geometry     │               │ geometry     │             │ postcode     │   │
│  │ (GEOGRAPHY)  │               │ (GEOGRAPHY)  │             │ geometry     │   │
│  └──────────────┘               └──────────────┘             │ (GEOGRAPHY)  │   │
│                                                              └──────────────┘   │
│                                                                     │           │
│  TIME-SERIES METRICS (TimescaleDB)                                 │           │
│  ─────────────────────────────────                                 │           │
│  ┌─────────────────────────────────────────────────────────────────┴─────┐     │
│  │                        suburb_metrics (Hypertable)                     │     │
│  ├───────────────────────────────────────────────────────────────────────┤     │
│  │ time (TIMESTAMPTZ)  │  suburb_id  │  metric_type  │  value  │ source │     │
│  ├───────────────────────────────────────────────────────────────────────┤     │
│  │ 2024-01-01          │  12345      │  median_price │ 850000  │ domain │     │
│  │ 2024-01-01          │  12345      │  vacancy_rate │ 1.2     │ domain │     │
│  │ 2024-01-01          │  12345      │  gross_yield  │ 4.5     │ calc   │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
│  VECTOR EMBEDDINGS (pgvector)                                                   │
│  ────────────────────────────                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐     │
│  │                        embeddings                                      │     │
│  ├───────────────────────────────────────────────────────────────────────┤     │
│  │ id  │  entity_type  │  entity_id  │  embedding (vector(1536))  │     │     │
│  ├───────────────────────────────────────────────────────────────────────┤     │
│  │ 1   │  suburb       │  12345      │  [0.1, 0.2, ...]           │     │     │
│  │ 2   │  property     │  67890      │  [0.3, 0.4, ...]           │     │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Prisma Schema (Key Models)

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis, pgvector(map: "vector"), timescaledb]
}

// ============================================================================
// USER & AUTH
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?

  accounts      Account[]
  sessions      Session[]
  strategies    Strategy[]
  chatSessions  ChatSession[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============================================================================
// STRATEGY & SEARCH
// ============================================================================

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
  id          String         @id @default(cuid())
  userId      String
  type        StrategyType?
  status      StrategyStatus @default(DISCOVERY)

  // Strategy parameters (flexible JSON)
  params      Json           @default("{}")

  // Financial inputs
  budget      Decimal?       @db.Decimal(12, 2)
  deposit     Decimal?       @db.Decimal(12, 2)
  income      Decimal?       @db.Decimal(12, 2)

  // Preferences
  riskTolerance   String?    // low, medium, high
  timeline        String?    // short, medium, long
  managementStyle String?    // active, passive

  user        User           @relation(fields: [userId], references: [id])
  searches    Search[]
  chatSession ChatSession?

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
}

model Search {
  id          String    @id @default(cuid())
  strategyId  String

  // Search filters
  filters     Json      @default("{}")

  // Results
  results     Json      @default("[]")
  resultCount Int       @default(0)

  strategy    Strategy  @relation(fields: [strategyId], references: [id])

  createdAt   DateTime  @default(now())

  @@index([strategyId])
}

model ChatSession {
  id          String    @id @default(cuid())
  userId      String
  strategyId  String?   @unique

  messages    Json      @default("[]")
  context     Json      @default("{}")

  user        User      @relation(fields: [userId], references: [id])
  strategy    Strategy? @relation(fields: [strategyId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}

// ============================================================================
// GEOGRAPHIC DATA
// ============================================================================

model State {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique  // NSW, VIC, QLD, etc.
  geometry  Unsupported("geography(MultiPolygon, 4326)")?

  cities    City[]

  createdAt DateTime @default(now())
}

model City {
  id        String   @id @default(cuid())
  stateId   String
  name      String
  geometry  Unsupported("geography(MultiPolygon, 4326)")?

  state     State    @relation(fields: [stateId], references: [id])
  suburbs   Suburb[]

  createdAt DateTime @default(now())

  @@unique([stateId, name])
  @@index([stateId])
}

model Suburb {
  id          String   @id @default(cuid())
  cityId      String
  name        String
  postcode    String
  geometry    Unsupported("geography(MultiPolygon, 4326)")?
  centroid    Unsupported("geography(Point, 4326)")?

  // Cached latest metrics (for fast queries)
  medianPrice     Decimal? @db.Decimal(12, 2)
  medianRent      Decimal? @db.Decimal(8, 2)
  grossYield      Decimal? @db.Decimal(5, 2)
  vacancyRate     Decimal? @db.Decimal(5, 2)
  daysOnMarket    Int?
  auctionClearance Decimal? @db.Decimal(5, 2)

  // Scoring
  cashFlowScore     Int?    // 0-100
  capitalGrowthScore Int?   // 0-100
  overallScore      Int?    // 0-100

  city        City       @relation(fields: [cityId], references: [id])
  properties  Property[]

  metricsUpdatedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([cityId, name, postcode])
  @@index([cityId])
  @@index([postcode])
}

// ============================================================================
// PROPERTIES
// ============================================================================

enum PropertyType {
  HOUSE
  UNIT
  TOWNHOUSE
  VILLA
  LAND
  RURAL
  COMMERCIAL
}

enum ListingType {
  SALE
  RENT
  SOLD
  LEASED
}

model Property {
  id            String       @id @default(cuid())
  externalId    String       @unique  // ID from data provider
  source        String       // domain, rea, etc.

  suburbId      String
  address       String
  location      Unsupported("geography(Point, 4326)")

  propertyType  PropertyType
  listingType   ListingType

  price         Decimal?     @db.Decimal(12, 2)
  priceFrom     Decimal?     @db.Decimal(12, 2)
  priceTo       Decimal?     @db.Decimal(12, 2)

  bedrooms      Int?
  bathrooms     Int?
  carSpaces     Int?
  landSize      Int?         // sqm
  buildingSize  Int?         // sqm

  // Listing details
  headline      String?
  description   String?      @db.Text
  features      String[]
  images        String[]

  // Dates
  listedDate    DateTime?
  soldDate      DateTime?
  auctionDate   DateTime?

  // Extended data (flexible JSON)
  data          Json         @default("{}")

  // Calculated fields
  estimatedRent   Decimal?   @db.Decimal(8, 2)
  estimatedYield  Decimal?   @db.Decimal(5, 2)
  strategyScore   Json?      // { cashFlow: 75, capitalGrowth: 82, ... }

  suburb        Suburb       @relation(fields: [suburbId], references: [id])

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([suburbId])
  @@index([propertyType])
  @@index([listingType])
  @@index([price])
  @@index([bedrooms])
}

// ============================================================================
// METRICS (TimescaleDB Hypertable - created via migration)
// ============================================================================

model SuburbMetric {
  time        DateTime @db.Timestamptz
  suburbId    String
  metricType  String   // median_price, vacancy_rate, gross_yield, etc.
  value       Decimal  @db.Decimal(15, 4)
  source      String   // domain, rea, abs, calculated

  @@id([time, suburbId, metricType])
  @@index([suburbId])
  @@index([metricType])
  @@map("suburb_metrics")
}

model NationalMetric {
  time        DateTime @db.Timestamptz
  metricType  String   // cash_rate, gdp_growth, unemployment, etc.
  value       Decimal  @db.Decimal(15, 4)
  source      String

  @@id([time, metricType])
  @@index([metricType])
  @@map("national_metrics")
}

// ============================================================================
// EMBEDDINGS (pgvector)
// ============================================================================

model Embedding {
  id          String   @id @default(cuid())
  entityType  String   // suburb, property, strategy
  entityId    String
  embedding   Unsupported("vector(1536)")

  createdAt   DateTime @default(now())

  @@unique([entityType, entityId])
  @@index([entityType])
}
```

### Database Indexes & Optimizations

```sql
-- Additional indexes created via migration

-- Geospatial indexes
CREATE INDEX idx_properties_location ON properties USING GIST (location);
CREATE INDEX idx_suburbs_geometry ON suburbs USING GIST (geometry);
CREATE INDEX idx_suburbs_centroid ON suburbs USING GIST (centroid);

-- Partial indexes for common queries
CREATE INDEX idx_properties_sale_active ON properties (suburb_id, price, bedrooms)
WHERE listing_type = 'SALE';

CREATE INDEX idx_properties_rent_active ON properties (suburb_id, price, bedrooms)
WHERE listing_type = 'RENT';

-- TimescaleDB hypertable
SELECT create_hypertable('suburb_metrics', 'time', chunk_time_interval => INTERVAL '1 month');
SELECT create_hypertable('national_metrics', 'time', chunk_time_interval => INTERVAL '1 year');

-- Continuous aggregates for common queries
CREATE MATERIALIZED VIEW suburb_metrics_monthly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 month', time) AS month,
  suburb_id,
  metric_type,
  avg(value) as avg_value,
  max(value) as max_value,
  min(value) as min_value
FROM suburb_metrics
GROUP BY month, suburb_id, metric_type;

-- Vector similarity search index
CREATE INDEX idx_embeddings_vector ON embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 4. Backend Architecture

### Service Layer Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           tRPC ROUTER                                    │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │    │
│  │  │  userRouter   │  │ strategyRouter│  │ propertyRouter│               │    │
│  │  │               │  │               │  │               │               │    │
│  │  │ • getProfile  │  │ • create      │  │ • search      │               │    │
│  │  │ • update      │  │ • update      │  │ • getById     │               │    │
│  │  │ • delete      │  │ • getByUser   │  │ • getBySuburb │               │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘               │    │
│  │                                                                          │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │    │
│  │  │ suburbRouter  │  │  chatRouter   │  │ metricsRouter │               │    │
│  │  │               │  │               │  │               │               │    │
│  │  │ • search      │  │ • sendMessage │  │ • getSuburb   │               │    │
│  │  │ • getStats    │  │ • getHistory  │  │ • getNational │               │    │
│  │  │ • getScore    │  │ • clearChat   │  │ • getTimeline │               │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                         │
│                                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         SERVICE CLASSES                                  │    │
│  │                                                                          │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │    │
│  │  │ PropertyService │  │  SuburbService  │  │ StrategyService │         │    │
│  │  │                 │  │                 │  │                 │         │    │
│  │  │ • searchProps() │  │ • getStats()    │  │ • create()      │         │    │
│  │  │ • scoreProps()  │  │ • scoreSuburb() │  │ • recommend()   │         │    │
│  │  │ • getComps()    │  │ • getRanking()  │  │ • getMatches()  │         │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │    │
│  │                                                                          │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │    │
│  │  │  MetricsService │  │    AIService    │  │  SearchService  │         │    │
│  │  │                 │  │                 │  │                 │         │    │
│  │  │ • getHistory()  │  │ • chat()        │  │ • buildQuery()  │         │    │
│  │  │ • calculate()   │  │ • orchestrate() │  │ • execute()     │         │    │
│  │  │ • aggregate()   │  │ • callTool()    │  │ • filter()      │         │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                         │
│                                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA ACCESS LAYER                                │    │
│  │                                                                          │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │    │
│  │  │  Prisma Client  │  │   Raw SQL       │  │   Redis Cache   │         │    │
│  │  │  (ORM queries)  │  │   (PostGIS,     │  │   (Upstash)     │         │    │
│  │  │                 │  │    TimescaleDB) │  │                 │         │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### tRPC Router Example

```typescript
// apps/web/app/api/trpc/routers/property.ts

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PropertyService } from '@/services/property'
import { TRPCError } from '@trpc/server'

const propertyFiltersSchema = z.object({
  suburbIds: z.array(z.string()).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  bedrooms: z.number().optional(),
  bedroomsMin: z.number().optional(),
  propertyTypes: z.array(z.enum(['HOUSE', 'UNIT', 'TOWNHOUSE', 'VILLA', 'LAND'])).optional(),
  listingType: z.enum(['SALE', 'RENT']).optional(),
  // Geospatial
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  radius: z.object({
    lat: z.number(),
    lng: z.number(),
    km: z.number(),
  }).optional(),
})

export const propertyRouter = router({
  search: protectedProcedure
    .input(z.object({
      filters: propertyFiltersSchema,
      strategyId: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const propertyService = new PropertyService(ctx.db)

      const results = await propertyService.search({
        filters: input.filters,
        strategyId: input.strategyId,
        cursor: input.cursor,
        limit: input.limit,
        userId: ctx.session.user.id,
      })

      return results
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const propertyService = new PropertyService(ctx.db)
      const property = await propertyService.getById(input.id)

      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return property
    }),

  getComparables: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      radius: z.number().default(1), // km
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const propertyService = new PropertyService(ctx.db)
      return propertyService.getComparables(input)
    }),

  scoreForStrategy: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      strategyId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const propertyService = new PropertyService(ctx.db)
      return propertyService.scoreForStrategy(input.propertyId, input.strategyId)
    }),
})
```

### Geospatial Query Examples

```typescript
// packages/geo/src/queries.ts

import { PrismaClient } from '@prisma/client'

export class GeoQueries {
  constructor(private db: PrismaClient) {}

  /**
   * Find properties within a bounding box
   */
  async findPropertiesInBounds(bounds: {
    north: number
    south: number
    east: number
    west: number
  }, filters?: PropertyFilters) {
    return this.db.$queryRaw`
      SELECT
        p.*,
        ST_AsGeoJSON(p.location) as location_geojson,
        s.name as suburb_name,
        s.postcode,
        s.gross_yield as suburb_yield,
        s.cash_flow_score,
        s.capital_growth_score
      FROM properties p
      JOIN suburbs s ON p.suburb_id = s.id
      WHERE ST_Within(
        p.location,
        ST_MakeEnvelope(
          ${bounds.west}, ${bounds.south},
          ${bounds.east}, ${bounds.north},
          4326
        )::geography
      )
      ${filters?.listingType ? Prisma.sql`AND p.listing_type = ${filters.listingType}` : Prisma.empty}
      ${filters?.priceMin ? Prisma.sql`AND p.price >= ${filters.priceMin}` : Prisma.empty}
      ${filters?.priceMax ? Prisma.sql`AND p.price <= ${filters.priceMax}` : Prisma.empty}
      ${filters?.bedrooms ? Prisma.sql`AND p.bedrooms >= ${filters.bedrooms}` : Prisma.empty}
      ORDER BY p.price ASC
      LIMIT 500
    `
  }

  /**
   * Find properties within radius of a point
   */
  async findPropertiesInRadius(
    lat: number,
    lng: number,
    radiusKm: number,
    filters?: PropertyFilters
  ) {
    const radiusMeters = radiusKm * 1000

    return this.db.$queryRaw`
      SELECT
        p.*,
        ST_Distance(
          p.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) as distance_meters
      FROM properties p
      WHERE ST_DWithin(
        p.location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ${filters?.listingType ? Prisma.sql`AND p.listing_type = ${filters.listingType}` : Prisma.empty}
      ORDER BY distance_meters ASC
      LIMIT 100
    `
  }

  /**
   * Get suburb statistics with geospatial aggregation
   */
  async getSuburbsWithStats(bounds: Bounds) {
    return this.db.$queryRaw`
      SELECT
        s.id,
        s.name,
        s.postcode,
        ST_AsGeoJSON(s.geometry) as geometry,
        ST_AsGeoJSON(s.centroid) as centroid,
        s.median_price,
        s.median_rent,
        s.gross_yield,
        s.vacancy_rate,
        s.days_on_market,
        s.cash_flow_score,
        s.capital_growth_score,
        s.overall_score,
        COUNT(p.id) as property_count
      FROM suburbs s
      LEFT JOIN properties p ON p.suburb_id = s.id AND p.listing_type = 'SALE'
      WHERE ST_Intersects(
        s.geometry,
        ST_MakeEnvelope(
          ${bounds.west}, ${bounds.south},
          ${bounds.east}, ${bounds.north},
          4326
        )::geography
      )
      GROUP BY s.id
      ORDER BY s.overall_score DESC NULLS LAST
    `
  }

  /**
   * Find nearest suburbs to a point
   */
  async findNearestSuburbs(lat: number, lng: number, limit: number = 10) {
    return this.db.$queryRaw`
      SELECT
        s.*,
        ST_Distance(
          s.centroid,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) as distance_meters
      FROM suburbs s
      ORDER BY s.centroid <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      LIMIT ${limit}
    `
  }
}
```

---

## 5. AI Agent Architecture

Propure uses a **multi-agent orchestration pattern** powered by Gemini 2.5 Flash via Vercel AI SDK:

```
User Message → ORCHESTRATOR → [STRATEGIST | ANALYST | RESEARCHER] → Response + UI Updates
```

| Agent | Purpose |
|-------|---------|
| **Orchestrator** | Routes requests, synthesizes responses, coordinates UI |
| **Strategist** | Strategy discovery, goal setting, recommendations |
| **Analyst** | Financial calculations, risk assessment, ROI modeling |
| **Researcher** | Market data retrieval, property search, suburb stats |

**Key Tools**: `searchProperties`, `getSuburbStats`, `calculateROI`, `assessRisk`, `updateMapFilters`

For complete agent definitions, system prompts, tool schemas, and implementation details, see **[AI-AGENTS.md](./AI-AGENTS.md)**.

---

## 6. Frontend Architecture

### Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND COMPONENT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                              APP SHELL                                   │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │    │
│  │  │                           HEADER                                  │   │    │
│  │  │  [Logo]            [User Menu]            [Settings]             │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  ┌──────────────────────────┐ │ ┌──────────────────────────────────┐   │    │
│  │  │      LEFT PANEL          │ │ │         RIGHT PANEL              │   │    │
│  │  │      (40% width)         │ │ │         (60% width)              │   │    │
│  │  │                          │ │ │                                  │   │    │
│  │  │  ┌────────────────────┐  │ │ │  ┌────────────────────────────┐ │   │    │
│  │  │  │   CHAT MESSAGES    │  │ │ │  │       MAP CONTAINER        │ │   │    │
│  │  │  │                    │  │ │ │  │                            │ │   │    │
│  │  │  │  ┌──────────────┐  │  │ │ │  │  ┌──────────────────────┐ │ │   │    │
│  │  │  │  │ AI Message   │  │  │ │ │  │  │    MapLibre GL       │ │ │   │    │
│  │  │  │  │ with cards   │  │  │ │ │  │  │                      │ │ │   │    │
│  │  │  │  └──────────────┘  │  │ │ │  │  │  • Suburb boundaries │ │ │   │    │
│  │  │  │                    │  │ │ │  │  │  • Property markers  │ │ │   │    │
│  │  │  │  ┌──────────────┐  │  │ │ │  │  │  • Heatmaps (deck.gl)│ │ │   │    │
│  │  │  │  │ User Message │  │  │ │ │  │  │  • Cluster markers   │ │ │   │    │
│  │  │  │  └──────────────┘  │  │ │ │  │  │                      │ │ │   │    │
│  │  │  │                    │  │ │ │  │  └──────────────────────┘ │ │   │    │
│  │  │  │  ┌──────────────┐  │  │ │ │  │                            │ │   │    │
│  │  │  │  │ Strategy     │  │  │ │ │  │  ┌──────────────────────┐ │ │   │    │
│  │  │  │  │ Card         │  │  │ │ │  │  │    MAP CONTROLS      │ │ │   │    │
│  │  │  │  └──────────────┘  │  │ │ │  │  │ [Filters] [Layers]   │ │ │   │    │
│  │  │  │                    │  │ │ │  │  └──────────────────────┘ │ │   │    │
│  │  │  └────────────────────┘  │ │ │  └────────────────────────────┘ │   │    │
│  │  │                          │ │ │                                  │   │    │
│  │  │  ┌────────────────────┐  │ │ │  ┌────────────────────────────┐ │   │    │
│  │  │  │   CHAT INPUT       │  │ │ │  │     PROPERTY LIST         │ │   │    │
│  │  │  │                    │  │ │ │  │                            │ │   │    │
│  │  │  │  [Type message...] │  │ │ │  │  ┌──────────────────────┐ │ │   │    │
│  │  │  │              [Send]│  │ │ │  │  │   PropertyCard       │ │ │   │    │
│  │  │  └────────────────────┘  │ │ │  │  │   Score: 85          │ │ │   │    │
│  │  │                          │ │ │  │  └──────────────────────┘ │ │   │    │
│  │  └──────────────────────────┘ │ │  │  ┌──────────────────────┐ │ │   │    │
│  │                               │ │  │  │   PropertyCard       │ │ │   │    │
│  │                               │ │  │  │   Score: 78          │ │ │   │    │
│  │                               │ │  │  └──────────────────────┘ │ │   │    │
│  │                               │ │  └────────────────────────────┘ │   │    │
│  │                               │ └──────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### State Management

```typescript
// apps/web/stores/strategy-store.ts

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Strategy, PropertyFilters, Property, Suburb } from '@propure/shared'

interface StrategyState {
  // Current strategy
  strategy: Strategy | null
  phase: 'discovery' | 'strategy' | 'search' | 'refinement' | 'selection'

  // Filters (synced with AI conversation)
  filters: PropertyFilters

  // Results
  properties: Property[]
  suburbs: Suburb[]
  selectedProperty: Property | null
  highlightedSuburbs: string[]

  // Map state
  mapBounds: Bounds | null
  mapZoom: number

  // Actions
  setStrategy: (strategy: Strategy) => void
  setPhase: (phase: StrategyState['phase']) => void
  updateFilters: (filters: Partial<PropertyFilters>) => void
  setProperties: (properties: Property[]) => void
  setSuburbs: (suburbs: Suburb[]) => void
  selectProperty: (property: Property | null) => void
  highlightSuburbs: (suburbIds: string[]) => void
  setMapBounds: (bounds: Bounds) => void
  setMapZoom: (zoom: number) => void
  reset: () => void
}

const initialFilters: PropertyFilters = {
  listingType: 'SALE',
  priceMin: undefined,
  priceMax: undefined,
  bedroomsMin: undefined,
  propertyTypes: [],
  suburbIds: [],
}

export const useStrategyStore = create<StrategyState>()(
  subscribeWithSelector((set) => ({
    strategy: null,
    phase: 'discovery',
    filters: initialFilters,
    properties: [],
    suburbs: [],
    selectedProperty: null,
    highlightedSuburbs: [],
    mapBounds: null,
    mapZoom: 10,

    setStrategy: (strategy) => set({ strategy }),

    setPhase: (phase) => set({ phase }),

    updateFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),

    setProperties: (properties) => set({ properties }),

    setSuburbs: (suburbs) => set({ suburbs }),

    selectProperty: (property) => set({ selectedProperty: property }),

    highlightSuburbs: (suburbIds) => set({ highlightedSuburbs: suburbIds }),

    setMapBounds: (bounds) => set({ mapBounds: bounds }),

    setMapZoom: (zoom) => set({ mapZoom: zoom }),

    reset: () =>
      set({
        strategy: null,
        phase: 'discovery',
        filters: initialFilters,
        properties: [],
        suburbs: [],
        selectedProperty: null,
        highlightedSuburbs: [],
      }),
  }))
)

// Selector hooks for optimized re-renders
export const useFilters = () => useStrategyStore((s) => s.filters)
export const useProperties = () => useStrategyStore((s) => s.properties)
export const useSelectedProperty = () => useStrategyStore((s) => s.selectedProperty)
export const usePhase = () => useStrategyStore((s) => s.phase)
```

```typescript
// apps/web/stores/chat-store.ts

import { create } from 'zustand'
import type { Message } from 'ai'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null

  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),
}))
```

### Key Components

```typescript
// apps/web/components/chat/chat-panel.tsx

'use client'

import { useChat } from 'ai/react'
import { useEffect } from 'react'
import { useStrategyStore } from '@/stores/strategy-store'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { StrategyCard } from './strategy-card'

export function ChatPanel() {
  const { updateFilters, setProperties, highlightSuburbs, setStrategy } = useStrategyStore()

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      // Handle UI updates from AI
      switch (toolCall.toolName) {
        case 'updateUI':
          const { type, payload } = toolCall.args as { type: string; payload: any }

          if (type === 'filters') {
            updateFilters(payload)
          } else if (type === 'highlight') {
            highlightSuburbs(payload.suburbIds)
          } else if (type === 'updateList') {
            setProperties(payload.properties)
          }
          break

        case 'recommendStrategy':
          setStrategy(toolCall.args as any)
          break
      }
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="border-t p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
```

```typescript
// apps/web/components/map/property-map.tsx

'use client'

import { useRef, useCallback, useEffect } from 'react'
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre'
import { HeatmapLayer, ScatterplotLayer } from '@deck.gl/layers'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { useStrategyStore } from '@/stores/strategy-store'
import { PropertyMarker } from './property-marker'
import { SuburbLayer } from './suburb-layer'
import 'maplibre-gl/dist/maplibre-gl.css'

const INITIAL_VIEW = {
  longitude: 151.2093,
  latitude: -33.8688,
  zoom: 10,
}

export function PropertyMap() {
  const mapRef = useRef<any>(null)
  const {
    properties,
    suburbs,
    highlightedSuburbs,
    selectedProperty,
    filters,
    setMapBounds,
    selectProperty,
  } = useStrategyStore()

  // Update bounds when map moves
  const onMoveEnd = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds()
      setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    }
  }, [setMapBounds])

  // Create heatmap layer for suburb scores
  const heatmapLayer = new HeatmapLayer({
    id: 'suburb-heatmap',
    data: suburbs,
    getPosition: (d: any) => [d.centroid.lng, d.centroid.lat],
    getWeight: (d: any) => d.overallScore / 100,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.1,
    colorRange: [
      [255, 255, 178],
      [254, 217, 118],
      [254, 178, 76],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
    ],
  })

  // Property markers layer
  const propertyLayer = new ScatterplotLayer({
    id: 'property-markers',
    data: properties,
    getPosition: (d: any) => [d.location.lng, d.location.lat],
    getRadius: 50,
    getFillColor: (d: any) => {
      const score = d.strategyScore?.overall || 50
      if (score >= 80) return [34, 197, 94, 200]  // green
      if (score >= 60) return [234, 179, 8, 200]   // yellow
      return [239, 68, 68, 200]  // red
    },
    pickable: true,
    onClick: ({ object }) => {
      if (object) selectProperty(object)
    },
  })

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      onMoveEnd={onMoveEnd}
    >
      <NavigationControl position="top-right" />

      {/* Suburb boundaries */}
      <SuburbLayer
        suburbs={suburbs}
        highlightedSuburbs={highlightedSuburbs}
      />

      {/* deck.gl overlay */}
      <MapboxOverlay layers={[heatmapLayer, propertyLayer]} />

      {/* Selected property marker */}
      {selectedProperty && (
        <Marker
          longitude={selectedProperty.location.lng}
          latitude={selectedProperty.location.lat}
          anchor="bottom"
        >
          <PropertyMarker property={selectedProperty} selected />
        </Marker>
      )}
    </Map>
  )
}
```

---

## 7. Real-Time Communication

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        REAL-TIME ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐             │
│  │   Client    │◄────────▶│   Pusher/   │◄────────▶│   Server    │             │
│  │  (Browser)  │          │    Ably     │          │  (Next.js)  │             │
│  └─────────────┘          └─────────────┘          └─────────────┘             │
│        │                                                  │                      │
│        │                 CHANNELS                         │                      │
│        │                 ────────                         │                      │
│        │                                                  │                      │
│        │  ┌─────────────────────────────────────────┐    │                      │
│        ├──│  private-user-{userId}                  │────┤                      │
│        │  │  • Strategy updates                     │    │                      │
│        │  │  • AI tool results                      │    │                      │
│        │  │  • Search results                       │    │                      │
│        │  └─────────────────────────────────────────┘    │                      │
│        │                                                  │                      │
│        │  ┌─────────────────────────────────────────┐    │                      │
│        ├──│  private-session-{sessionId}            │────┤                      │
│        │  │  • Chat messages                        │    │                      │
│        │  │  • Typing indicators                    │    │                      │
│        │  │  • UI state updates                     │    │                      │
│        │  └─────────────────────────────────────────┘    │                      │
│        │                                                  │                      │
│        │  ┌─────────────────────────────────────────┐    │                      │
│        └──│  presence-map-{bounds}                  │────┘                      │
│           │  • Other users viewing same area        │                           │
│           │  • Property view counts                 │                           │
│           └─────────────────────────────────────────┘                           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// apps/web/lib/pusher.ts

import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  }
)

// Event types
export type UIUpdateEvent = {
  type: 'filters' | 'highlight' | 'zoom' | 'showProperty' | 'updateList'
  payload: any
}

export type SearchResultEvent = {
  properties: any[]
  suburbs: any[]
  count: number
}

// Helper to send updates
export async function sendUIUpdate(userId: string, update: UIUpdateEvent) {
  await pusherServer.trigger(`private-user-${userId}`, 'ui-update', update)
}

export async function sendSearchResults(userId: string, results: SearchResultEvent) {
  await pusherServer.trigger(`private-user-${userId}`, 'search-results', results)
}
```

```typescript
// apps/web/hooks/use-realtime.ts

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useStrategyStore } from '@/stores/strategy-store'
import { useSession } from 'next-auth/react'

export function useRealtime() {
  const { data: session } = useSession()
  const { updateFilters, setProperties, highlightSuburbs, selectProperty } = useStrategyStore()

  useEffect(() => {
    if (!session?.user?.id) return

    const channel = pusherClient.subscribe(`private-user-${session.user.id}`)

    channel.bind('ui-update', (data: UIUpdateEvent) => {
      switch (data.type) {
        case 'filters':
          updateFilters(data.payload)
          break
        case 'highlight':
          highlightSuburbs(data.payload.suburbIds)
          break
        case 'showProperty':
          selectProperty(data.payload.property)
          break
        case 'updateList':
          setProperties(data.payload.properties)
          break
      }
    })

    channel.bind('search-results', (data: SearchResultEvent) => {
      setProperties(data.properties)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(`private-user-${session.user.id}`)
    }
  }, [session?.user?.id])
}
```

---

## 8. Background Jobs & Workflows

### Inngest Functions

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INNGEST WORKFLOWS                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SCHEDULED JOBS                                                                  │
│  ──────────────                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  daily-property-sync                    Runs: Every day at 2am AEST     │    │
│  │  ├── Fetch new listings from Domain API                                 │    │
│  │  ├── Update existing property statuses                                  │    │
│  │  ├── Remove sold/withdrawn listings                                     │    │
│  │  └── Trigger suburb metric recalculation                                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  weekly-suburb-scoring                  Runs: Every Sunday at 3am       │    │
│  │  ├── Calculate suburb metrics from properties                           │    │
│  │  ├── Fetch external data (ABS, Domain reports)                          │    │
│  │  ├── Calculate strategy scores for each suburb                          │    │
│  │  └── Update suburb cache fields                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  monthly-economic-update                Runs: 1st of each month         │    │
│  │  ├── Fetch RBA cash rate data                                           │    │
│  │  ├── Fetch ABS economic indicators                                      │    │
│  │  ├── Update national metrics table                                      │    │
│  │  └── Recalculate affordability metrics                                  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  EVENT-DRIVEN JOBS                                                              │
│  ─────────────────                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  property-search-workflow               Trigger: search.requested       │    │
│  │  ├── Build geospatial query from filters                                │    │
│  │  ├── Execute search against PostGIS                                     │    │
│  │  ├── Score properties against user's strategy                           │    │
│  │  ├── Sort and paginate results                                          │    │
│  │  └── Push results via WebSocket                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  suburb-analysis-workflow               Trigger: suburb.analysis.requested│   │
│  │  ├── Fetch suburb from database                                         │    │
│  │  ├── Get historical metrics (TimescaleDB)                               │    │
│  │  ├── Calculate growth trends                                            │    │
│  │  ├── Fetch comparable suburbs                                           │    │
│  │  └── Generate AI summary                                                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  property-score-workflow                Trigger: property.score.requested│   │
│  │  ├── Fetch property details                                             │    │
│  │  ├── Get suburb metrics                                                 │    │
│  │  ├── Calculate strategy-specific scores                                 │    │
│  │  ├── Compare to similar properties                                      │    │
│  │  └── Update property score cache                                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// packages/inngest/src/functions/data-ingestion.ts

import { inngest } from '../client'
import { db } from '@propure/db'
import { domainApi } from '@/lib/external/domain'

export const dailyPropertySync = inngest.createFunction(
  {
    id: 'daily-property-sync',
    retries: 3,
  },
  { cron: '0 2 * * *' }, // 2am daily
  async ({ step }) => {
    // Step 1: Get list of suburbs to sync
    const suburbs = await step.run('get-suburbs', async () => {
      return db.suburb.findMany({
        select: { id: true, postcode: true, name: true },
      })
    })

    // Step 2: Fetch properties for each suburb (parallelized)
    const results = await step.run('fetch-properties', async () => {
      const batches = chunk(suburbs, 10) // Process 10 suburbs at a time
      const allProperties = []

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (suburb) => {
            const listings = await domainApi.searchListings({
              postcode: suburb.postcode,
              listingType: 'Sale',
              pageSize: 200,
            })
            return listings.map((l) => ({
              ...l,
              suburbId: suburb.id,
            }))
          })
        )
        allProperties.push(...batchResults.flat())
      }

      return allProperties
    })

    // Step 3: Upsert properties to database
    const upsertCount = await step.run('upsert-properties', async () => {
      let count = 0
      const batches = chunk(results, 100)

      for (const batch of batches) {
        await db.$transaction(
          batch.map((p) =>
            db.property.upsert({
              where: { externalId: p.id },
              create: mapToDbProperty(p),
              update: mapToDbProperty(p),
            })
          )
        )
        count += batch.length
      }

      return count
    })

    // Step 4: Mark stale listings as sold/withdrawn
    const staleCount = await step.run('mark-stale', async () => {
      const result = await db.property.updateMany({
        where: {
          updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          listingType: 'SALE',
        },
        data: { listingType: 'SOLD' },
      })
      return result.count
    })

    // Step 5: Trigger suburb metric recalculation
    await step.sendEvent('trigger-metrics', {
      name: 'suburb.metrics.recalculate',
      data: { trigger: 'daily-sync' },
    })

    return {
      propertiesUpserted: upsertCount,
      propertiesMarkedStale: staleCount,
    }
  }
)

export const weeklySuburbScoring = inngest.createFunction(
  {
    id: 'weekly-suburb-scoring',
    retries: 2,
  },
  { cron: '0 3 * * 0' }, // 3am Sunday
  async ({ step }) => {
    // Step 1: Get all suburbs
    const suburbs = await step.run('get-suburbs', async () => {
      return db.suburb.findMany()
    })

    // Step 2: Calculate metrics for each suburb
    for (const suburb of suburbs) {
      await step.run(`calculate-${suburb.id}`, async () => {
        // Get property stats
        const stats = await db.property.aggregate({
          where: { suburbId: suburb.id, listingType: 'SALE' },
          _avg: { price: true },
          _count: true,
        })

        const rentStats = await db.property.aggregate({
          where: { suburbId: suburb.id, listingType: 'RENT' },
          _avg: { price: true },
        })

        // Calculate metrics
        const medianPrice = stats._avg.price
        const medianRent = rentStats._avg.price
        const grossYield = medianPrice && medianRent
          ? ((medianRent * 52) / medianPrice) * 100
          : null

        // Calculate scores
        const cashFlowScore = calculateCashFlowScore(suburb, grossYield)
        const capitalGrowthScore = calculateCapitalGrowthScore(suburb)
        const overallScore = (cashFlowScore + capitalGrowthScore) / 2

        // Update suburb
        await db.suburb.update({
          where: { id: suburb.id },
          data: {
            medianPrice,
            medianRent,
            grossYield,
            cashFlowScore,
            capitalGrowthScore,
            overallScore,
            metricsUpdatedAt: new Date(),
          },
        })

        // Insert into time-series
        await db.$executeRaw`
          INSERT INTO suburb_metrics (time, suburb_id, metric_type, value, source)
          VALUES
            (NOW(), ${suburb.id}, 'median_price', ${medianPrice}, 'calculated'),
            (NOW(), ${suburb.id}, 'gross_yield', ${grossYield}, 'calculated'),
            (NOW(), ${suburb.id}, 'cash_flow_score', ${cashFlowScore}, 'calculated'),
            (NOW(), ${suburb.id}, 'capital_growth_score', ${capitalGrowthScore}, 'calculated')
        `
      })
    }

    return { suburbsProcessed: suburbs.length }
  }
)
```

---

## 9. External Integrations

### Integration Layer

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                       INTEGRATION SERVICE                                │    │
│  │                                                                          │    │
│  │  ┌───────────────────┐                                                  │    │
│  │  │  Rate Limiter     │  ─── Upstash Redis                              │    │
│  │  │  (per API)        │                                                  │    │
│  │  └───────────────────┘                                                  │    │
│  │           │                                                              │    │
│  │           ▼                                                              │    │
│  │  ┌───────────────────┐    ┌───────────────────┐    ┌─────────────────┐ │    │
│  │  │   Domain API      │    │   ABS API         │    │   RBA API       │ │    │
│  │  │                   │    │                   │    │                 │ │    │
│  │  │ • Listings        │    │ • Census data     │    │ • Cash rate     │ │    │
│  │  │ • Price estimates │    │ • Labour force    │    │ • Lending data  │ │    │
│  │  │ • Suburb profiles │    │ • Building stats  │    │ • Economic      │ │    │
│  │  └───────────────────┘    └───────────────────┘    └─────────────────┘ │    │
│  │                                                                          │    │
│  │  ┌───────────────────┐    ┌───────────────────┐    ┌─────────────────┐ │    │
│  │  │   Google Maps     │    │   MySchool        │    │   WalkScore     │ │    │
│  │  │                   │    │                   │    │                 │ │    │
│  │  │ • Geocoding       │    │ • School ratings  │    │ • Walkability   │ │    │
│  │  │ • Distance matrix │    │ • Catchments      │    │ • Transit score │ │    │
│  │  │ • Places API      │    │                   │    │                 │ │    │
│  │  └───────────────────┘    └───────────────────┘    └─────────────────┘ │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Domain API Client

```typescript
// apps/web/lib/external/domain.ts

import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
})

const DOMAIN_API_URL = 'https://api.domain.com.au/v1'

interface DomainListingParams {
  postcode?: string
  suburb?: string
  listingType: 'Sale' | 'Rent'
  propertyTypes?: string[]
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  pageSize?: number
  pageNumber?: number
}

export const domainApi = {
  async searchListings(params: DomainListingParams) {
    // Rate limit check
    const { success, remaining } = await ratelimit.limit('domain-api')
    if (!success) {
      throw new Error('Domain API rate limit exceeded')
    }

    const response = await fetch(`${DOMAIN_API_URL}/listings/residential/_search`, {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.DOMAIN_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingType: params.listingType,
        propertyTypes: params.propertyTypes || ['House', 'ApartmentUnitFlat', 'Townhouse'],
        locations: [
          {
            state: '',
            postCode: params.postcode,
            suburb: params.suburb,
          },
        ],
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minBedrooms: params.minBedrooms,
        pageSize: params.pageSize || 100,
        pageNumber: params.pageNumber || 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Domain API error: ${response.status}`)
    }

    return response.json()
  },

  async getPropertyDetails(listingId: string) {
    const { success } = await ratelimit.limit('domain-api')
    if (!success) throw new Error('Rate limit exceeded')

    const response = await fetch(`${DOMAIN_API_URL}/listings/${listingId}`, {
      headers: { 'X-Api-Key': process.env.DOMAIN_API_KEY! },
    })

    return response.json()
  },

  async getSuburbProfile(state: string, suburb: string, postcode: string) {
    const { success } = await ratelimit.limit('domain-api')
    if (!success) throw new Error('Rate limit exceeded')

    const response = await fetch(
      `${DOMAIN_API_URL}/suburbPerformanceStatistics/${state}/${suburb}/${postcode}`,
      { headers: { 'X-Api-Key': process.env.DOMAIN_API_KEY! } }
    )

    return response.json()
  },
}
```

---

## 10. Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  EDGE LAYER                                                                      │
│  ──────────                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Vercel Edge Middleware                                                  │    │
│  │  • Rate limiting (Upstash)                                              │    │
│  │  • Bot protection                                                        │    │
│  │  • Geo-blocking (if needed)                                             │    │
│  │  • Request validation                                                    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  AUTH LAYER                                                                      │
│  ──────────                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  NextAuth.js v5                                                          │    │
│  │  • OAuth providers (Google, Apple, Email)                               │    │
│  │  • Session management (JWT)                                             │    │
│  │  • CSRF protection                                                       │    │
│  │  • Secure cookie handling                                               │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  API LAYER                                                                       │
│  ─────────                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  tRPC + Server Actions                                                   │    │
│  │  • Input validation (Zod)                                               │    │
│  │  • Authorization checks                                                  │    │
│  │  • SQL injection prevention (Prisma)                                    │    │
│  │  • XSS prevention (React)                                               │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  DATA LAYER                                                                      │
│  ──────────                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Database Security                                                       │    │
│  │  • Row-level security (future)                                          │    │
│  │  • Encrypted connections (SSL)                                          │    │
│  │  • Secrets in environment variables                                     │    │
│  │  • No direct DB access from client                                      │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Auth Implementation

```typescript
// apps/web/lib/auth.ts

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@propure/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

---

## 11. Deployment Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                              VERCEL                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                          │    │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │    │
│  │   │    Edge     │    │  Serverless │    │   Static    │                │    │
│  │   │  Functions  │    │  Functions  │    │   Assets    │                │    │
│  │   │             │    │             │    │             │                │    │
│  │   │ • Middleware│    │ • API routes│    │ • JS/CSS    │                │    │
│  │   │ • Auth      │    │ • tRPC      │    │ • Images    │                │    │
│  │   │ • Geo       │    │ • AI chat   │    │ • Fonts     │                │    │
│  │   └─────────────┘    └─────────────┘    └─────────────┘                │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                         │
│         ┌──────────────────────────────┼──────────────────────────────┐         │
│         │                              │                              │          │
│         ▼                              ▼                              ▼          │
│  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐      │
│  │    NEON     │              │   UPSTASH   │              │   INNGEST   │      │
│  │             │              │             │              │             │      │
│  │ PostgreSQL  │              │   Redis     │              │   Jobs      │      │
│  │ + PostGIS   │              │   Cache     │              │   Queue     │      │
│  │ + Timescale │              │   Rate Limit│              │   Cron      │      │
│  │ + pgvector  │              │   Sessions  │              │             │      │
│  │             │              │             │              │             │      │
│  │ Region: SYD │              │ Region: SYD │              │ Region: SYD │      │
│  └─────────────┘              └─────────────┘              └─────────────┘      │
│                                        │                                         │
│         ┌──────────────────────────────┼──────────────────────────────┐         │
│         │                              │                              │          │
│         ▼                              ▼                              ▼          │
│  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐      │
│  │   PUSHER    │              │  ANTHROPIC  │              │   DOMAIN    │      │
│  │             │              │             │              │             │      │
│  │  WebSocket  │              │  Claude API │              │ Property API│      │
│  │  Real-time  │              │  AI Models  │              │  Listings   │      │
│  └─────────────┘              └─────────────┘              └─────────────┘      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

```bash
# .env.local (development)
# .env.production (production - set in Vercel)

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For Prisma migrations

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Redis
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Real-time
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="ap4"
PUSHER_APP_ID="..."
PUSHER_SECRET="..."

# AI
ANTHROPIC_API_KEY="..."

# External APIs
DOMAIN_API_KEY="..."
GOOGLE_MAPS_API_KEY="..."

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

---

## 12. Monitoring & Observability

### Observability Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MONITORING & OBSERVABILITY                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         VERCEL ANALYTICS                                 │    │
│  │  • Web Vitals (LCP, FID, CLS)                                           │    │
│  │  • Page views & unique visitors                                         │    │
│  │  • Function execution time                                              │    │
│  │  • Edge function analytics                                              │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         ERROR TRACKING (Sentry)                          │    │
│  │  • Frontend errors                                                       │    │
│  │  • API errors                                                            │    │
│  │  • Background job failures                                              │    │
│  │  • Source maps for debugging                                            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         INNGEST DASHBOARD                                │    │
│  │  • Job execution history                                                 │    │
│  │  • Failure rates & retries                                              │    │
│  │  • Step-by-step execution logs                                          │    │
│  │  • Cron job monitoring                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         CUSTOM METRICS                                   │    │
│  │  • AI response times                                                     │    │
│  │  • Property search latency                                              │    │
│  │  • Strategy conversion rates                                            │    │
│  │  • User engagement metrics                                              │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

This architecture document defines:

1. **System Overview** - Complete tech stack and component relationships
2. **Data Layer** - PostgreSQL with PostGIS, TimescaleDB, pgvector + Prisma schema
3. **Backend** - Next.js 15 with tRPC, service layer, geospatial queries
4. **AI Agents** - Multi-agent orchestration with Vercel AI SDK + Claude
5. **Frontend** - React 19 + Zustand + MapLibre + real-time updates
6. **Background Jobs** - Inngest for data ingestion and scheduled tasks
7. **Security** - Auth, rate limiting, input validation
8. **Deployment** - Vercel + Neon + Upstash + Pusher

---

*Document Version: 1.1*
*Last Updated: December 2024*
*Related: [STRATEGY.md](./STRATEGY.md) | [TECH-STACK-ANALYSIS.md](./TECH-STACK-ANALYSIS.md) | [DATA-INDICATORS.md](./DATA-INDICATORS.md) | [AI-AGENTS.md](./AI-AGENTS.md)*
