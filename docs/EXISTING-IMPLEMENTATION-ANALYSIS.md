# Existing Implementation Analysis & Integration Plan

> **Purpose**: Analyze the existing Propure codebase and determine what can be reused, adapted, or replaced in the new architecture.

---

## Executive Summary

The existing implementation has a solid foundation with:
- Next.js 15 + React 19 (matches our target stack)
- Clerk authentication (can keep or migrate to NextAuth)
- Google Maps integration (will migrate to MapLibre)
- Investment wizard onboarding (excellent foundation for AI-powered strategy discovery)
- shadcn/ui components (fully reusable)
- Stripe subscription handling (reusable)

**Recommendation**: Evolve the existing codebase rather than starting fresh. Most UI components and patterns can be reused.

---

## 1. Existing Structure Analysis

### Current Directory Structure
```
app/
├── (auth)/
│   ├── onboarding/          # Investment wizard
│   ├── sign-in/             # Clerk auth
│   └── sign-up/             # Clerk auth
├── (main)/
│   ├── dashboard/           # Map + search UI
│   ├── details/             # Property details
│   ├── profile/             # User profile
│   └── subscription/        # Stripe subscription
├── api/
│   └── webhook/
│       ├── clerk/           # Clerk webhooks
│       └── stripe/          # Stripe webhooks
components/
├── ui/                      # shadcn/ui components (40+ components)
├── maps/                    # Australia map
├── property-details/        # Property cards
├── FiltersPanel.tsx         # Property filters
├── SearchResultsSidebar.tsx # Search results
├── investment-wizard.tsx    # Onboarding wizard
├── google-map.tsx           # Google Maps
└── real-estate-map.tsx      # Main dashboard
context/
└── MapContext.tsx           # Map state management
lib/
├── auth/                    # User auth utilities
├── clerk/                   # Clerk helpers
├── stripe/                  # Stripe helpers
└── prisma.ts                # Prisma client
prisma/
└── schema.prisma            # Basic User model
```

---

## 2. Component-by-Component Analysis

### 2.1 UI Components (shadcn/ui) - ✅ FULLY REUSABLE

All 40+ shadcn/ui components can be reused as-is:
- accordion, alert-dialog, avatar, badge, breadcrumb
- button, card, carousel, chart, checkbox, collapsible
- command, dialog, drawer, dropdown-menu, form
- input, label, popover, progress, radio-group
- scroll-area, select, separator, sheet, sidebar
- skeleton, slider, switch, table, tabs, textarea
- toast, toggle, tooltip

**Action**: Copy directly to new structure.

---

### 2.2 Investment Wizard - ✅ EXCELLENT FOUNDATION (Adapt)

**Current**: `components/investment-wizard.tsx`

The existing wizard captures exactly the data we need for strategy identification:

```typescript
// Current form data structure
{
  // Step 1: Investment Goals
  primaryGoal: "",        // Maps to our StrategyType
  holdingPeriod: "",      // Maps to timeline
  riskLevel: "",          // Maps to riskTolerance

  // Step 2: Financial Profile
  totalBudget: "",        // Maps to budget
  personalSavings: "",    // Maps to deposit
  homeLoan: "",
  borrowingCapacity: "",
  cashflowExpectations: "",
  cashflowAmount: "",

  // Step 3: Location Preferences
  regions: [],            // Maps to geographic filters
  remoteInvesting: "",
  areaPreference: "",

  // Step 4: Property Preferences
  propertyType: [],       // Maps to propertyTypes filter
  bedrooms: "",
  propertyAge: "",

  // Step 5: Experience
  previousExperience: "",
  involvement: "",        // Maps to managementStyle
  coInvestment: "",
}
```

**Adaptation Plan**:

| Current Field | New Field | Notes |
|---------------|-----------|-------|
| `primaryGoal` | `Strategy.type` | Map to enum (CASH_FLOW, CAPITAL_GROWTH, etc.) |
| `holdingPeriod` | `Strategy.timeline` | Keep as-is |
| `riskLevel` | `Strategy.riskTolerance` | Map to low/medium/high |
| `totalBudget` | `Strategy.budget` | Keep as-is |
| `personalSavings` | `Strategy.deposit` | Keep as-is |
| `borrowingCapacity` | Calculated field | Keep as-is |
| `regions` | Geographic filter | Integrate with suburb selector |
| `propertyType` | `PropertyFilters.propertyTypes` | Keep as-is |
| `involvement` | `Strategy.managementStyle` | Map to active/passive |

**Enhanced Version**: Convert to AI-powered conversational flow while keeping form as fallback:

```typescript
// New approach: Wizard becomes fallback, AI chat is primary
// packages/ai/src/tools/strategy-tools.ts

const strategyDiscoveryTool = tool({
  name: 'captureStrategyInput',
  description: 'Capture user strategy preferences from conversation',
  parameters: z.object({
    field: z.enum([
      'primaryGoal', 'holdingPeriod', 'riskLevel',
      'budget', 'deposit', 'borrowingCapacity',
      'regions', 'propertyTypes', 'managementStyle'
    ]),
    value: z.any(),
  }),
  execute: async ({ field, value }, context) => {
    // Update strategy in database
    await updateStrategy(context.strategyId, { [field]: value })
    return { success: true }
  },
})
```

---

### 2.3 Google Map Component - ⚠️ REPLACE (MapLibre)

**Current**: `components/google-map.tsx`

```typescript
// Current implementation uses @react-google-maps/api
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api"
```

**Issues**:
1. Google Maps is expensive at scale
2. Limited customization for heat maps
3. No deck.gl integration

**Migration Plan**:

```typescript
// New: components/map/property-map.tsx
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'

// Migration mapping:
// GoogleMap         → Map (from react-map-gl/maplibre)
// Marker            → Marker (same API)
// InfoWindow        → Popup
// useJsApiLoader    → Not needed (MapLibre loads automatically)
// mapId             → mapStyle (URL to style JSON)
```

**What to keep**:
- Map context pattern (`MapContext.tsx`) - adapt for MapLibre
- Search results sidebar integration pattern
- Blur effect on initial load
- Australia-centered default view

---

### 2.4 MapContext - ✅ ADAPT

**Current**: `context/MapContext.tsx`

```typescript
type MapContextType = {
  setCenter: (coords: LatLng) => void
  registerMap: (map: google.maps.Map) => void
  results: SearchResult[]
  setResults: (results: SearchResult[]) => void
}
```

**New Version** (Zustand store instead of Context):

```typescript
// stores/map-store.ts
import { create } from 'zustand'
import type { Map } from 'maplibre-gl'

interface MapState {
  map: Map | null
  center: { lat: number; lng: number }
  zoom: number
  bounds: Bounds | null

  // Actions
  setMap: (map: Map) => void
  setCenter: (center: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
  setBounds: (bounds: Bounds) => void
  flyTo: (center: { lat: number; lng: number }, zoom?: number) => void
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  center: { lat: -25.2744, lng: 133.7751 }, // Australia center
  zoom: 4,
  bounds: null,

  setMap: (map) => set({ map }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setBounds: (bounds) => set({ bounds }),

  flyTo: (center, zoom) => {
    const map = get().map
    if (map) {
      map.flyTo({ center: [center.lng, center.lat], zoom: zoom || 12 })
    }
    set({ center, zoom: zoom || get().zoom })
  },
}))
```

---

### 2.5 FiltersPanel - ✅ REUSABLE (Enhance)

**Current**: `components/FiltersPanel.tsx`

Existing filters:
- Price range slider
- Monthly rent slider
- Property type checkboxes
- Property age slider
- Bedrooms slider
- Garage spaces slider
- Size slider

**Enhancements needed**:

```typescript
// Add strategy-specific filters
interface PropertyFilters {
  // Existing (keep)
  priceRange: [number, number]
  rentRange: [number, number]
  propertyTypes: string[]
  bedrooms: [number, number]
  garageSpaces: [number, number]
  size: [number, number]

  // New filters for strategy
  listingType: 'SALE' | 'RENT'
  minYield?: number           // For cash flow strategy
  minGrowthRate?: number      // For capital growth strategy
  suburbIds?: string[]        // Geographic filter
  maxDaysOnMarket?: number    // Market momentum
  vacancyRateMax?: number     // Rental demand indicator
}
```

**Integration with AI**:

```typescript
// AI can update filters via tool
const updateFiltersFromAI = (filters: Partial<PropertyFilters>) => {
  useStrategyStore.getState().updateFilters(filters)
  // Triggers re-render of map and list
}
```

---

### 2.6 SearchResultsSidebar - ✅ ADAPT

**Current**: `components/SearchResultsSidebar.tsx`

Good patterns to keep:
- Slide-in animation
- Recent searches
- Result card with yield display
- Click to center map

**Adaptations**:
1. Replace static `baseSearchResults` with real API data
2. Add strategy score to each result
3. Add sorting options (score, price, yield)
4. Integrate with tRPC for real-time updates

---

### 2.7 Real Estate Map (Dashboard) - ✅ ADAPT

**Current**: `components/real-estate-map.tsx`

This is the main dashboard component. Good patterns:
- Hero state → Search active state transition
- Blur effect on map
- Search header with filters toggle
- City filter pills

**New Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT                          NEW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │   Hero/Search Input  │   →    │   AI Chat Panel      │       │
│  │   (center screen)    │        │   (left side)        │       │
│  └──────────────────────┘        └──────────────────────┘       │
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │   Google Map         │   →    │   MapLibre + deck.gl │       │
│  │   (full screen)      │        │   (right side)       │       │
│  └──────────────────────┘        └──────────────────────┘       │
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │   Search Sidebar     │   →    │   Property List      │       │
│  │   (left, slide in)   │        │   (below map)        │       │
│  └──────────────────────┘        └──────────────────────┘       │
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────┐       │
│  │   Filters Panel      │   →    │   Filters (integrated│       │
│  │   (right, slide in)  │        │   with AI context)   │       │
│  └──────────────────────┘        └──────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.8 Authentication (Clerk) - ⚠️ DECISION NEEDED

**Current**: Clerk authentication with webhooks

**Options**:

| Option | Pros | Cons |
|--------|------|------|
| **Keep Clerk** | Already working, good UX, managed | $25/mo after free tier, vendor lock-in |
| **Migrate to NextAuth** | Free, open source, flexible | Migration effort, manage sessions |
| **Auth.js v5** | Latest, edge-compatible | Newer, less battle-tested |

**Recommendation**: Keep Clerk for MVP (it's working), plan migration to NextAuth v5 for cost optimization later.

---

### 2.9 Stripe Integration - ✅ REUSABLE

**Current**: `lib/stripe/`, webhook handlers

Fully reusable:
- `getStripeCheckout.ts` - Create checkout sessions
- `cancelSubscription.ts` - Cancel subscriptions
- Webhook handler for subscription events

**Enhancement**: Add usage-based billing for AI API calls if needed.

---

### 2.10 Prisma Schema - ⚠️ NEEDS MAJOR EXPANSION

**Current**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Required**: Full schema from ARCHITECTURE.md with:
- User, Account, Session (auth)
- Strategy, Search, ChatSession
- State, City, Suburb (geographic hierarchy)
- Property (with PostGIS geography)
- SuburbMetric, NationalMetric (TimescaleDB)
- Embedding (pgvector)

---

## 3. Migration Strategy

### Phase 1: Foundation (Week 1-2)

1. **Set up monorepo structure**
   ```bash
   # Convert to Turborepo
   pnpm dlx create-turbo@latest
   ```

2. **Migrate existing app to `apps/web`**
   ```
   apps/
   └── web/           # Move existing app here
   packages/
   ├── db/            # New: Prisma + schema
   ├── ai/            # New: AI agents
   ├── geo/           # New: PostGIS queries
   └── shared/        # New: Types, utils
   ```

3. **Expand Prisma schema**
   - Add all models from ARCHITECTURE.md
   - Set up Neon with PostGIS extension

4. **Keep existing UI working** while adding new features

### Phase 2: AI Integration (Week 3-4)

1. **Add Vercel AI SDK**
   ```bash
   pnpm add ai @ai-sdk/anthropic
   ```

2. **Create chat endpoint**
   ```typescript
   // app/api/chat/route.ts
   import { streamText } from 'ai'
   import { anthropic } from '@ai-sdk/anthropic'
   ```

3. **Build chat panel component**
   - Add to left side of dashboard
   - Replace hero section with chat

4. **Connect wizard data to AI context**
   - Pre-populate AI with user preferences from wizard

### Phase 3: Map Migration (Week 5-6)

1. **Replace Google Maps with MapLibre**
   ```bash
   pnpm remove @react-google-maps/api
   pnpm add react-map-gl maplibre-gl @deck.gl/core @deck.gl/layers
   ```

2. **Migrate MapContext to Zustand**

3. **Add deck.gl layers**
   - Heatmap for suburb scores
   - Scatter plot for properties

### Phase 4: Data & Real-time (Week 7-8)

1. **Set up Inngest for background jobs**
2. **Add Pusher for real-time updates**
3. **Create data ingestion pipelines**
4. **Connect AI tools to database**

---

## 4. Code Reuse Summary

| Component | Status | Action |
|-----------|--------|--------|
| shadcn/ui components | ✅ Reuse | Copy to packages/ui |
| Investment wizard | ✅ Adapt | Keep form, add AI integration |
| FiltersPanel | ✅ Adapt | Add strategy-specific filters |
| SearchResultsSidebar | ✅ Adapt | Connect to real API |
| Google Map | ⚠️ Replace | Migrate to MapLibre |
| MapContext | ✅ Adapt | Convert to Zustand |
| Real estate map | ✅ Adapt | Add chat panel, new layout |
| Clerk auth | ✅ Keep | Consider NextAuth later |
| Stripe integration | ✅ Reuse | As-is |
| Prisma schema | ⚠️ Expand | Add all new models |
| API routes | ⚠️ Replace | Migrate to tRPC |

---

## 5. Recommended Immediate Actions

### Today
1. Set up Turborepo monorepo structure
2. Move existing code to `apps/web`
3. Create `packages/db` with expanded Prisma schema

### This Week
1. Set up Neon database with PostGIS
2. Run migrations for new schema
3. Add Vercel AI SDK
4. Create basic chat endpoint

### Next Week
1. Build chat panel UI
2. Start MapLibre migration
3. Connect wizard data to AI context

---

## 6. Files to Copy Directly

These files can be copied with minimal or no changes:

```
# UI Components (all of these)
components/ui/*.tsx

# Hooks
hooks/use-mobile.tsx
hooks/use-toast.ts

# Lib utilities
lib/utils.ts
lib/prisma.ts (update connection)

# Stripe
lib/stripe/*.ts
app/api/webhook/stripe/route.ts

# Styles
styles/globals.css (merge with new)
tailwind.config.ts (merge with new)

# Types
types/*.ts (expand)
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Related: [ARCHITECTURE.md](./ARCHITECTURE.md) | [TECH-STACK-ANALYSIS.md](./TECH-STACK-ANALYSIS.md)*
