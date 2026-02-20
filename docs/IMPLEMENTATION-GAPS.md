# Implementation Gaps Checklist

> **As of**: 2025-12-30
> **Source of truth**: `packages/db/prisma/schema.prisma`, `apps/web/app/api/chat/route.ts`
> **Reference**: `docs/PRD.md`

---

## P0 - Critical Path Items

### Multi-Agent AI Orchestration
- [ ] Implement Orchestrator agent to coordinate sub-agents
- [ ] Implement Strategist agent for strategy discovery
- [ ] Implement Analyst agent for financial calculations
- [ ] Implement Researcher agent for data retrieval
- [ ] Wire multi-agent orchestration into chat API

**Effort**: 4-6 days
**Files**:
- `apps/web/app/api/chat/route.ts`
- `packages/ai/src/agents/orchestrator.ts` (create)
- `packages/ai/src/agents/strategist.ts` (create)
- `packages/ai/src/agents/analyst.ts` (create)
- `packages/ai/src/agents/researcher.ts` (create)
- `packages/ai/src/tools/` (create)
- `packages/ai/src/prompts/` (create)

---

### Chat Session Persistence
- [ ] Persist chat sessions and messages to database
- [ ] Store discovery profile inputs during conversation
- [ ] Implement session resumption from database

**Effort**: 3-5 days
**Files**:
- `apps/web/app/api/chat/route.ts`
- `packages/db/prisma/schema.prisma` (ChatSession/ChatMessage already exist)

---

### Schema Alignment
- [ ] Add `Search` model tied to Strategy
- [ ] Add `Shortlist` model for saved properties
- [ ] Expand `Strategy` with PRD fields (profile, preferences)
- [ ] Migrate data from `SavedSearch` to `Search`
- [ ] Align strategy enums (`RENOVATION_FLIP` → `RENOVATION`)

**Effort**: 5-8 days
**Files**:
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/`

---

### Real-Time UI Updates
- [ ] Set up Pusher/Ably WebSocket integration
- [ ] Trigger UI updates from AI tool calls
- [ ] Update map layer when strategy/filters change
- [ ] Update property list in real-time
- [ ] Smooth transitions (no jarring refreshes)

**Effort**: 4-6 days
**Files**:
- `apps/web/app/api/chat/route.ts`
- `apps/web/components/real-estate-map.tsx`
- `apps/web/components/SearchResultsSidebar.tsx`
- `apps/web/lib/pusher.ts` (create)
- `apps/web/hooks/use-realtime-updates.ts` (create)

---

## P1 - High Priority

### AI Insights Job
- [ ] Implement actual model calls in AI insights job
- [ ] Persist AI-generated insights to database
- [ ] Schedule regular insight generation

**Effort**: 2-3 days
**Files**:
- `apps/web/inngest/functions/process-ai-insights.ts`
- `packages/ai/src/agents/`

---

### Financial Input Validation
- [ ] Add validation for negative values
- [ ] Add validation for zero values where invalid
- [ ] Improve error messages for invalid inputs
- [ ] Add rate/percentage bounds checking

**Effort**: 1-2 days
**Files**:
- `apps/web/app/api/chat/route.ts` (calculateCashFlow, calculateROI tools)

---

### MCP Endpoint Security
- [ ] Fail closed when `MCP_INTERNAL_TOKEN` not set in production
- [ ] Add explicit environment check for dev/mock bypass
- [ ] Log unauthorized access attempts

**Effort**: 0.5-1 day
**Files**:
- `apps/web/app/api/mcp/domain/route.ts`
- `apps/web/app/api/mcp/realestate/route.ts`
- `apps/web/app/api/mcp/market/route.ts`

---

## P2 - Enhancement

### PostGIS Extension
- [ ] Enable PostGIS extension in database
- [ ] Add geometry columns to State, City, Suburb
- [ ] Add location point to Property
- [ ] Create GIST spatial indexes
- [ ] Add triggers to auto-update location from lat/lng

**Effort**: 3-5 days
**Files**:
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/`

---

### TimescaleDB for Time-Series
- [ ] Enable TimescaleDB extension
- [ ] Convert `SuburbMetric` to hypertable
- [ ] Convert `MarketIndicator` to hypertable
- [ ] Add time-based partitioning

**Effort**: 2-3 days
**Files**:
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/`

---

### Geometry Data Backfill
- [ ] Backfill geometry columns from existing lat/long
- [ ] Import suburb boundary GeoJSON
- [ ] Generate suburb centroids

**Effort**: 1-2 days
**Files**:
- `packages/db/prisma/migrations/`
- `scripts/backfill-geometry.ts` (create)

---

### MapLibre Migration
- [ ] Replace Google Maps with MapLibre GL
- [ ] Implement deck.gl integration for heatmaps
- [ ] Add suburb boundary layer
- [ ] Add property marker clustering
- [ ] Implement suburb popup on click

**Effort**: 5-7 days
**Files**:
- `apps/web/components/map/` (create directory)
- `apps/web/stores/map-store.ts` (create)
- `apps/web/components/real-estate-map.tsx` (replace)

---

## Summary

| Priority | Items | Total Effort |
|----------|-------|--------------|
| P0 | 4 major features | 16-25 days |
| P1 | 3 improvements | 3.5-6 days |
| P2 | 4 enhancements | 11-17 days |

**Total estimated effort**: 30-48 days

---

*Document Version: 1.0*
*Last Updated: 2025-12-30*
