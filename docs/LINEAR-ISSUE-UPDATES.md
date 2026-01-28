# Linear Issue Updates for Architecture Changes

## Overview

Following the architecture decision to use **Vercel AI SDK + Vercel Workflow** instead of **@convex-dev/agent + Convex Workflow Component**, the following Linear issues need to be updated.

---

## Phase 0: Foundation

### PRO-5: Configure Convex package

**Current**: Set up `packages/convex/` with `convex.config.ts` registering agent and workflow components

**Update**:
- Remove `@convex-dev/agent` and `@convex-dev/workflow` from `convex.config.ts`
- `convex.config.ts` should be minimal (no components)
- Add **new step**: Update `apps/web/next.config.ts` to wrap with `withWorkflow(nextConfig)`
- Add `workflow` package to `apps/web/package.json`

---

## Phase 2: Agent System

### PRO-16: Build Orchestrator Agent

**Current**: Create Orchestrator using `@convex-dev/agent` in Convex Actions

**Update**:
- Create Orchestrator using `ToolLoopAgent` from `ai` in `apps/web/lib/agents/orchestrator.ts`
- Agent runs in Next.js API route `/api/chat`, not in Convex
- Pattern: `new ToolLoopAgent({ model, instructions, tools })`
- Tools for delegation (`delegateToStrategist`, etc.) implemented as `tool()` functions that call `generateText()` on other agents

### PRO-17: Build Strategist Agent

**Current**: Create Strategist using `@convex-dev/agent` with `createTool` for DB access

**Update**:
- Create Strategist using `ToolLoopAgent` in `apps/web/lib/agents/strategist.ts`
- Tools use standard `tool()` from `ai` package with Zod schemas
- DB-accessing tools call Convex via `ConvexHttpClient`: `await convex.mutation(api.strategies.create, { ... })`
- No `createTool`, no `ctx.db` — all DB calls via HTTP

### PRO-18: Build Researcher Agent

**Current**: Create Researcher using `@convex-dev/agent` with MCP calls from Convex Actions

**Update**:
- Create Researcher using `ToolLoopAgent` in `apps/web/lib/agents/researcher.ts`
- MCP tools implemented as `tool()` functions in `apps/web/lib/tools/mcp-tools.ts`
- **MCP servers called directly via HTTP `fetch()` from tool `execute` functions** (no Convex Actions)

### PRO-19: Build Analyst Agent

**Current**: Create Analyst using `@convex-dev/agent` with pure computation tools

**Update**:
- Create Analyst using `ToolLoopAgent` in `apps/web/lib/agents/analyst.ts`
- Tools implemented as `tool()` functions with pure calculations (no DB access)
- Pattern stays similar, just using Vercel AI SDK `tool()` instead of component-specific `createTool`

### PRO-20: Implement MCP Integration Layer

**Current**: Implement MCP integration in Convex Actions

**Update**:
- **Use Direct HTTP only** — MCP tools call MCP servers directly via `fetch()` in tool `execute` functions
- MCP tool definitions live in `apps/web/lib/tools/mcp-tools.ts`
- No Convex Actions for MCP calls — all calls happen directly in Next.js API routes
- No need for separate "integration layer" — tools ARE the integration

### PRO-21: Implement Thread Management

**Current**: Thread management handled by `@convex-dev/agent` Component (automatic)

**Update**:
- **Manual implementation required**
- Add `chatSessions` and `chatMessages` tables to Convex schema (see CONVEX-MIGRATION.md Section 3)
- Implement Convex mutations:
  - `api.chatSessions.create()`
  - `api.chatSessions.updateLastMessage()`
  - `api.chatMessages.create()`
  - `api.chatMessages.list()`
- Persist messages in `onFinish` callback in `/api/chat` route:
  ```typescript
  onFinish: async ({ text, toolCalls, usage }) => {
    await convex.mutation(api.chatMessages.create, {
      sessionId,
      role: "assistant",
      content: text,
      toolCalls,
      usage,
      timestamp: Date.now(),
    });
  }
  ```

---

## Phase 3: Background Jobs

### PRO-9: Define Convex Schema

**Update**:
- Add `chatSessions` and `chatMessages` tables (no longer handled by Agent Component)
- Schema in docs/CONVEX-MIGRATION.md Section 3 shows full definition

### PRO-22: Set up Scheduled Jobs

**Current**: Use Convex `cronJobs()` + Convex Workflow Component

**Update**:
- **Use Vercel Cron only** — all scheduled jobs defined in `vercel.json`
- Vercel Cron triggers API routes (e.g., `/api/cron/property-sync`)
- API routes call `start(workflowFn)` to launch Vercel Workflows
- Convex handles database only — no scheduling responsibilities

### PRO-23: Build Property Data Sync Workflow

**Current**: Implement as Convex Workflow using `WorkflowManager` and `step.runQuery/runMutation`

**Update**:
- Implement as Vercel Workflow in `apps/web/workflows/dataSync.ts`
- Use `"use workflow"` directive
- Pattern: `await step("step-name", async () => { ... })`
- Steps call Convex via `ConvexHttpClient`:
  ```typescript
  const suburbs = await step("get-suburbs", async () => {
    return await convex.query(api.suburbs.listAll);
  });
  ```
- Workflow triggered via `start(workflowFn)` from API route or cron

### PRO-24: Build Suburb Scoring Workflow

**Current**: Implement as Convex Workflow

**Update**:
- Implement as Vercel Workflow in `apps/web/workflows/suburbScoring.ts`
- Use `"use workflow"` directive
- Use `sleep()` for rate limiting between suburb processing
- Pattern identical to PRO-23

### PRO-25: Build AI Insights Workflow

**Current**: Implement as Convex Workflow with agent invocations

**Update**:
- Implement as Vercel Workflow in `apps/web/workflows/aiInsights.ts`
- Steps can invoke AI agents via direct function calls (since both run in Next.js layer):
  ```typescript
  const analysis = await step("analyze", async () => {
    const result = await analyst.generateText({
      messages: [{ role: "user", content: `Analyze: ${data}` }],
    });
    return result.text;
  });
  ```

---

## Summary of Changes by Issue

| Issue | Current Approach | New Approach |
|-------|-----------------|--------------|
| PRO-5 | Convex components in convex.config.ts | No components + withWorkflow in next.config.ts |
| PRO-9 | Agent Component manages chat tables | Manual chatSessions/chatMessages tables |
| PRO-16-19 | `@convex-dev/agent` Agent class | Vercel AI SDK `ToolLoopAgent` class |
| PRO-17-19 | `createTool` with `ctx.db` | `tool()` with `ConvexHttpClient` |
| PRO-20 | MCP in Convex Actions | MCP in tool `execute` functions (direct HTTP only) |
| PRO-21 | Automatic thread management | Manual thread persistence via onFinish callback |
| PRO-22 | Convex cronJobs + Workflow | Vercel Cron + Vercel Workflow (vercel.json only) |
| PRO-23-25 | `WorkflowManager` + `step.runQuery` | `"use workflow"` + `step()` + `ConvexHttpClient` |

---

## Key Patterns to Reference

All patterns and code examples are documented in:
- **ADR-011**: `docs/adr/011-convex-agent-multi-agent-orchestration.md`
- **CONVEX-MIGRATION.md Section 4**: Agent architecture
- **CONVEX-MIGRATION.md Section 6**: Background jobs
