# ADR-009: Convex as Unified Backend Platform

**Status**: Accepted
**Date**: 2026-01-27
**Decision Makers**: Dhrub Biswas

---

## Context

Propure's current backend architecture relies on multiple separate managed services, each handling a distinct concern:

1. **Neon PostgreSQL + Prisma** — Primary database (relational schema with 15+ models)
2. **Pusher** — Real-time WebSocket communication (UI updates from AI tool calls)
3. **Inngest** — Background jobs and durable workflows (data sync, suburb scoring, cron)
4. **Upstash Redis** — Caching and rate limiting

This multi-service architecture creates several operational challenges:

- **Operational complexity**: Four separate dashboards, billing accounts, and monitoring surfaces. Each service has its own failure modes, SDK versions, and upgrade cycles.
- **No native real-time reactivity**: Data changes in Neon require explicit Pusher triggers to reach the frontend. This creates a "push plumbing" layer where every mutation must manually fan out events.
- **Data consistency gaps**: Background jobs (Inngest) operate on stale reads unless explicitly coordinated with the database. There is no built-in consistency model across services.
- **Cold start latency**: Serverless functions on Vercel that need Prisma + Pusher + Redis imports have significant cold start overhead.
- **TypeScript fragmentation**: Each service has its own type system. Prisma generates types from the schema, but Pusher events, Inngest function payloads, and Redis values are typed separately with no shared source of truth.
- **Cost accumulation**: Four services each have their own pricing tiers, free-tier limits, and overage costs. At scale, the combined cost is higher than a unified platform.

The existing implementation is early-stage (pre-production), making this an ideal time to consolidate before accumulating migration debt.

---

## Decision

Adopt **Convex** as the unified backend platform for database, real-time, and caching. Background jobs and durable workflows will use **Vercel Workflow (WDK)** instead of Convex Workflow Component.

| Current Service          | Replaced By                                         |
| ------------------------ | --------------------------------------------------- |
| Neon PostgreSQL + Prisma | Convex document database with indexes               |
| Pusher                   | Convex reactive queries (WebSocket subscriptions)   |
| Upstash Redis            | Convex system table caching + in-memory query cache |
| Inngest                  | Vercel Cron + Vercel Workflow (WDK)                 |

Convex will be deployed as a new monorepo package (`packages/convex/` as `@propure/convex`) following the official Convex monorepo pattern.

**Note**: While Convex offers a Workflow Component, we're using Vercel Workflow (WDK) for background jobs to keep workflow orchestration in the Next.js layer alongside AI agents (see ADR-011).

---

## Rationale

### Single Platform for All Backend Concerns

Convex provides database, real-time subscriptions, scheduled functions, and durable workflows in a single platform with one SDK, one dashboard, and one billing account. This eliminates the integration layer between four separate services.

### TypeScript-Native End-to-End

Convex schemas are defined in TypeScript. Query and mutation functions are TypeScript. The generated API types flow directly to the frontend with full type safety — no code generation step like Prisma, no separate event type definitions for Pusher, no payload schemas for Inngest.

```typescript
// Schema definition IS the type system
defineSchema({
  properties: defineTable({
    address: v.string(),
    latitude: v.float64(),
    longitude: v.float64(),
    price: v.optional(v.float64()),
    // ...
  }).index("by_suburb", ["suburbId"]),
});
```

### Built-in Real-Time Reactivity

Convex queries are reactive by default. When data changes, subscribed clients receive updates automatically over WebSocket. This eliminates the entire Pusher integration layer — no channel management, no event serialisation, no auth endpoints.

```typescript
// Frontend: automatically re-renders when data changes
const properties = useQuery(api.properties.search, { filters });
```

### Scheduling with Vercel Cron

All scheduled jobs use **Vercel Cron** (defined in `vercel.json`) to trigger Vercel Workflows. Convex does not handle scheduling — it focuses solely on database, real-time subscriptions, and caching.

### Clerk Auth Integration

Convex has first-class Clerk integration via `ConvexProviderWithClerk`, matching Propure's existing auth provider. No adapter code needed.

### Open Source and Self-Hostable

Convex is open-source (BSL license, transitioning to Apache 2.0). Self-hosting is available as an exit strategy, reducing vendor lock-in risk compared to fully proprietary alternatives.

---

## Consequences

### Positive

- **Reduced operational complexity**: Consolidates database, real-time, and caching into one platform. Reduces from four services to two (Convex + Vercel Workflow).
- **Eliminated real-time plumbing**: No manual Pusher event dispatch. UI reactivity is automatic through Convex subscriptions.
- **Type safety from DB to UI**: Schema types flow end-to-end without code generation or manual type definitions.
- **Transactional consistency**: Mutations and queries run in ACID transactions within Convex, unlike cross-service coordination.
- **Simplified deployment**: `npx convex dev` for local development, `npx convex deploy` for production. No separate Pusher dashboard or Redis instance.
- **Built-in usage tracking**: Convex provides function execution metrics, document counts, and bandwidth tracking natively.
- **Unified observability**: Convex dashboard provides real-time monitoring of database operations, subscriptions, and scheduled functions.

### Negative

- **No PostGIS**: Convex does not support spatial extensions. Geospatial queries require a bounding-box + client-side filtering approach (see ADR-010).
- **Document database, not relational**: No JOINs, foreign key constraints, or CASCADE deletes. References are managed via `v.id("tableName")` with application-level integrity.
- **No TimescaleDB**: Time-series data (suburb metrics, market indicators) must use standard Convex tables with timestamp indexes instead of hypertables and continuous aggregates.
- **Vendor dependency**: Core application logic runs on Convex infrastructure. Mitigated by open-source self-hosting option.
- **Learning curve**: Team must learn Convex's reactive model, action/mutation/query distinction, and component system.
- **No raw SQL**: Complex analytical queries that currently use raw SQL (aggregations, window functions) must be reimplemented as Convex query functions.

### Mitigations

1. **Geospatial**: Implement bounding-box index queries with Haversine client-side filtering (ADR-010). Covers 90%+ of property search use cases.
2. **Data integrity**: Implement reference validation in mutation functions. Use Convex's `ctx.db.get()` to verify references before writes.
3. **Time-series**: Use compound indexes (`by_suburb_type_time`) with range queries for metric history. Pre-aggregate in scheduled functions.
4. **Vendor risk**: Convex is open-source. Data can be exported via the dashboard or API. Schema is portable TypeScript.
5. **Learning curve**: Follow official Convex documentation patterns. Workflows are handled by Vercel Workflow (WDK) which integrates with Next.js.
6. **Two-platform dependency**: While workflows run on Vercel infrastructure, they can call Convex via `ConvexHttpClient` for data access, maintaining a clean separation of concerns.

---

## Alternatives Considered

### 1. Keep Current Stack (Prisma/Neon + Pusher + Inngest + Upstash)

Maintain the existing four-service architecture and add features incrementally.

**Rejected because**:

- Operational complexity grows with each new feature (every mutation needs Pusher wiring, every background job needs Inngest function + Prisma imports)
- No path to native real-time reactivity without substantial plumbing
- Four separate billing/monitoring surfaces
- TypeScript type fragmentation across services

### 2. Supabase (PostgreSQL + Realtime + Edge Functions)

Unified PostgreSQL platform with real-time subscriptions, edge functions, and auth.

**Rejected because**:

- Real-time is row-level change subscriptions (CDC), not reactive query results — still requires client-side query logic
- Edge Functions are not TypeScript-native in the same way (Deno runtime, separate deployment)
- No built-in durable workflow engine (would still need Inngest or similar)
- Less mature agent/AI SDK ecosystem compared to Convex's `@convex-dev/agent`

### 3. Firebase / Firestore

Google's document database with real-time sync, Cloud Functions, and auth.

**Rejected because**:

- Proprietary with no self-hosting option — full vendor lock-in
- Weaker TypeScript support (no schema-level type generation)
- No ACID transactions across documents (limited to 500 documents per transaction)
- Security rules language is separate from application code
- No built-in durable workflow engine
- Pricing model (per document read/write) is expensive at scale for real-time subscriptions

### 4. Convex Workflow Component for Background Jobs

Use Convex Workflow Component (`@convex-dev/workflow`) instead of Vercel Workflow for background jobs.

**Rejected because**:

- Would require moving workflow orchestration logic into Convex Actions (separate from Next.js API routes where AI agents live)
- AI agents already run in Next.js API routes using Vercel AI SDK — keeping workflows in the same layer (Vercel Workflow) provides better colocation
- Vercel Workflow has tighter integration with Next.js through `"use workflow"` and `"use step"` directives
- Vercel Workflow + Vercel Cron provides unified observability in Vercel dashboard alongside Next.js function logs
- **Decision**: Use Convex for database/real-time/cache (where it excels), and Vercel Cron + Vercel Workflow for scheduling and durable orchestration

---

## Related Decisions

- ADR-010: Geospatial Bounding Box Strategy (addresses PostGIS gap)
- ADR-011: Convex Agent Multi-Agent Orchestration (agent architecture on Convex)

---

## References

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Monorepo Pattern](https://docs.convex.dev/production/project-configuration)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
- [Convex Workflow Component](https://github.com/get-convex/workflow)
- [Convex Open Source](https://github.com/get-convex/convex-backend)
- [Current Architecture](../ARCHITECTURE.md)
