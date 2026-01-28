# ADR-011: Multi-Agent Orchestration with Vercel AI SDK and Convex Persistence

**Status**: Accepted
**Date**: 2026-01-28
**Decision Makers**: Dhrub Biswas

---

## Context

Propure uses a multi-agent orchestration pattern where four AI agents collaborate to help users discover investment strategies, research markets, and analyse properties:

| Agent            | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| **Orchestrator** | Routes requests, synthesises responses, coordinates UI |
| **Strategist**   | Strategy discovery, goal setting, recommendations      |
| **Analyst**      | Financial calculations, risk assessment, ROI modeling  |
| **Researcher**   | Market data retrieval, property search, suburb stats   |

All agents use **Gemini 2.5 Flash** via `@ai-sdk/google`.

### Current Implementation (POC/ai-sdk Branch)

The existing proof-of-concept uses Vercel AI SDK's `streamText` in Next.js API routes:

```typescript
// apps/web/app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: orchestratorPrompt,
    messages,
    tools: { ...orchestratorTools },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}
```

This approach provides a solid foundation but needs enhancements:

1. **No message persistence**: Chat history is stored in client state only. Page refresh loses conversation.
2. **HTTP SSE streaming**: Uses Server-Sent Events, which works well for most cases but has timeout considerations on Vercel Free tier (60s). Vercel Pro extends this to 300s, and Fluid Compute removes the limit.
3. **Manual context management**: Thread management and message history must be implemented manually.
4. **Manual usage tracking**: Token usage tracking requires custom implementation in `onStepFinish` callbacks.
5. **Manual UI reactivity**: Real-time updates require explicit integration with Convex subscriptions.

### Requirements for Production

- Persistent chat threads with message history stored in Convex
- Streaming agent responses that work reliably on Vercel infrastructure
- Cross-agent context sharing via thread history
- Token usage tracking and cost monitoring per conversation
- Automatic UI updates when agent actions modify data (via Convex reactive queries)
- Durable multi-step workflows for complex operations (handled by Vercel Workflow - see ADR-009)

---

## Decision

Use **Vercel AI SDK** with the `ToolLoopAgent` class and `createAgentUIStreamResponse` in Next.js API routes, combined with Convex for message persistence and real-time delivery.

### Architecture

```
User Message → Next.js API Route
                    │
                    ├─► ToolLoopAgent.generateText()
                    │       │
                    │       ├─► Tool execution (DB via ConvexHttpClient)
                    │       └─► Sub-agent delegation (call other agents)
                    │
                    ├─► onFinish: Save to Convex chatMessages
                    │
                    └─► createAgentUIStreamResponse → SSE to client

Frontend ◄─── Convex reactive query (useQuery chatMessages)
```

### Agent Definitions

```typescript
// apps/web/lib/agents/orchestrator.ts
import { ToolLoopAgent } from "ai";
import { google } from "@ai-sdk/google";

export const orchestrator = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: `You are the Propure AI assistant, helping users discover
their ideal property investment strategy in Australia. You coordinate between
specialist agents: Strategist, Analyst, and Researcher.

Route user requests to the appropriate agent(s), synthesize their outputs,
and present cohesive responses.`,
  tools: {
    delegateToStrategist,
    delegateToAnalyst,
    delegateToResearcher,
    searchProperties,
    updateUIFilters,
  },
});
```

```typescript
// apps/web/lib/agents/strategist.ts
export const strategist = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: `You are a property investment strategy advisor for the Australian market.
Help users discover their ideal strategy based on goals, budget, risk tolerance, and timeline.`,
  tools: {
    captureDiscoveryInput,
    recommendStrategy,
    createStrategy,
    updateStrategy,
  },
});
```

```typescript
// apps/web/lib/agents/researcher.ts
export const researcher = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: `You are a market research specialist for Australian property markets.
Retrieve suburb statistics, property data, and market indicators.`,
  tools: {
    searchProperties,
    getSuburbStats,
    callDomainMCP,
    callRealestateMCP,
  },
});
```

```typescript
// apps/web/lib/agents/analyst.ts
export const analyst = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),
  instructions: `You are a financial analysis specialist for property investment.
Calculate cash flow, ROI, assess risk, and compare properties.`,
  tools: {
    calculateCashFlow,
    calculateROI,
    assessRisk,
    compareProperties,
  },
});
```

### Tool Types

All tools use the Vercel AI SDK `tool()` function with Zod schema validation. Tools that need database access call Convex via `ConvexHttpClient`.

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

// Pure computation tool (no database access)
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

// Tool that creates/updates Convex data
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
```

### Sub-Agent Delegation

The Orchestrator delegates to specialist agents via tool calls:

```typescript
// apps/web/lib/tools/delegation-tools.ts
import { tool } from "ai";
import { z } from "zod";
import { generateText } from "ai";
import { strategist, analyst, researcher } from "../agents";

export const delegateToStrategist = tool({
  description: "Delegate strategy discovery and recommendation tasks to the Strategist agent",
  parameters: z.object({
    task: z.string().describe("The strategy-related task to perform"),
    context: z.string().optional().describe("Additional context from the conversation"),
  }),
  execute: async ({ task, context }) => {
    const result = await generateText({
      model: strategist.model,
      messages: [
        { role: "system", content: strategist.instructions },
        { role: "user", content: context ? `${context}\n\n${task}` : task },
      ],
      tools: strategist.tools,
      maxSteps: 5,
    });
    return result.text;
  },
});

export const delegateToResearcher = tool({
  description: "Delegate market research and data retrieval to the Researcher agent",
  parameters: z.object({
    query: z.string().describe("The research query or data request"),
    filters: z.any().optional().describe("Search filters or parameters"),
  }),
  execute: async ({ query, filters }) => {
    const result = await generateText({
      model: researcher.model,
      messages: [
        { role: "system", content: researcher.instructions },
        { role: "user", content: filters ? `${query}\nFilters: ${JSON.stringify(filters)}` : query },
      ],
      tools: researcher.tools,
      maxSteps: 3,
    });
    return result.text;
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

export const callRealestateMCP = tool({
  description: "Search properties via RealEstate.com.au MCP server",
  parameters: z.object({
    tool: z.string(),
    input: z.any(),
  }),
  execute: async ({ tool, input }) => {
    const url = process.env.MCP_REALESTATE_URL;
    const response = await fetch(`${url}/tools/${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return response.json();
  },
});
```

All MCP calls use direct HTTP — no Convex Actions for MCP integration.

### Streaming and Persistence

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
    useQuery(api.chatMessages.list, { threadId })
        └─► Re-renders when new messages saved (for thread history)
```

**API Route Implementation**:

```typescript
// apps/web/app/api/chat/route.ts
import { ToolLoopAgent, createAgentUIStreamResponse } from "ai";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@propure/convex";
import { orchestrator } from "@/lib/agents/orchestrator";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const response = await orchestrator.generateText({
    messages,
    maxSteps: 10,
    onFinish: async ({ text, toolCalls, toolResults, usage }) => {
      // Save assistant message to Convex
      await convex.mutation(api.chatMessages.create, {
        threadId,
        role: "assistant",
        content: text,
        toolCalls,
        toolResults,
        usage,
      });
    },
  });

  return createAgentUIStreamResponse({ response });
}
```

**Dual-channel approach**:
1. **HTTP SSE**: Live streaming during active conversation (via `useChat()` from `@ai-sdk/react`)
2. **Convex reactive query**: Thread history and message persistence (via `useQuery()` from `convex/react`)

This provides both real-time streaming AND persistent conversation history.

---

## Rationale

### Familiar Next.js Development Model

Agent logic stays in Next.js API routes where the team already has expertise. No need to learn Convex Actions/Components for agent orchestration. Tools are standard TypeScript functions that call Convex via `ConvexHttpClient`.

### Direct Use of Vercel AI SDK

The Vercel AI SDK's `ToolLoopAgent` class provides official multi-step agent orchestration:

- `ToolLoopAgent` with `maxSteps` for loop control
- `stopWhen` conditions for early termination
- `onStepFinish` for token tracking and logging
- `onFinish` for message persistence

This is the canonical way to build agents with Vercel AI SDK, not a custom abstraction.

### Proven Pattern from POC

The POC/ai-sdk branch already demonstrates this pattern working:

- Existing tool definitions are directly reusable
- System prompts require no changes
- Model configuration (Gemini 2.5 Flash) stays the same
- Streaming via `@ai-sdk/react` `useChat()` hook is familiar

### Manual Persistence Provides Control

Saving messages to Convex manually in `onFinish` provides:

- Full control over what gets persisted (can filter sensitive data)
- Custom schema for `chatSessions` and `chatMessages` tables
- Ability to add metadata (user ID, strategy ID, cost tracking)
- No hidden abstraction layer — explicit persistence logic

```typescript
onFinish: async ({ text, toolCalls, usage }) => {
  await convex.mutation(api.chatMessages.create, {
    threadId,
    role: "assistant",
    content: text,
    toolCalls: toolCalls.map(tc => ({ name: tc.name, args: tc.args })),
    usage: { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
    timestamp: Date.now(),
  });
},
```

### HTTP SSE Streaming with Vercel Timeouts

HTTP SSE streaming works well on Vercel:

- **Vercel Free/Hobby**: 60-second timeout (sufficient for most chat responses)
- **Vercel Pro**: 300-second timeout (5 minutes — covers complex multi-step agents)
- **Fluid Compute**: No timeout limit (for long-running agents)

For operations that exceed function timeouts, use Vercel Workflow (see ADR-009).

### Colocation with Workflows

Keeping agents in Next.js API routes colocates them with Vercel Workflow definitions (`"use workflow"`), which handle durable multi-step operations. Both run in the same layer and can call Convex for data access.

### Real-Time Updates via Convex

While HTTP SSE provides streaming during active conversation, Convex reactive queries provide:

- Automatic UI updates when agent tools modify data (e.g., creating a strategy)
- Thread history that loads instantly on page refresh
- Multi-user collaboration (future: see other users' threads)

---

## Consequences

### Positive

- **Familiar development model**: Agent logic stays in Next.js API routes where the team has expertise.
- **Direct Vercel AI SDK usage**: Uses canonical `ToolLoopAgent` pattern, not a wrapper or abstraction.
- **Persistent conversations**: Chat history stored in Convex with custom schema, survives page refresh, resumable across sessions.
- **Reusable POC code**: Existing tool definitions from POC branch work unchanged.
- **Flexible persistence**: Manual `onFinish` callback provides full control over what/how data is saved.
- **Real-time updates**: Convex reactive queries provide automatic UI updates when agent tools modify data.
- **Token tracking**: Custom usage tracking via `onStepFinish` and `onFinish` callbacks.
- **Colocation with workflows**: Agents and Vercel Workflows run in the same Next.js layer.

### Negative

- **Manual thread management**: Must implement `chatSessions` and `chatMessages` tables in Convex schema and handle persistence logic manually.
- **HTTP SSE timeout consideration**: Vercel Free tier has 60-second timeout. Requires Vercel Pro (300s) or Fluid Compute (unlimited) for long-running agents.
- **No built-in RAG**: Vector search for conversation history requires implementing Convex vector indexes manually.
- **No built-in usage dashboard**: Token/cost tracking requires custom implementation (vs. built-in dashboards in some agent frameworks).
- **Database access via HTTP**: Tools call Convex via `ConvexHttpClient` (HTTP), not direct database access. This adds network latency per tool call.

### Mitigations

1. **Thread management**: Implement `chatSessions` and `chatMessages` tables following standard chat schema patterns. Use Convex `useQuery` for reactive thread lists.
2. **Timeout handling**: Use Vercel Pro for production (5-minute timeout). For operations exceeding this, delegate to Vercel Workflow.
3. **RAG implementation**: Use Convex vector fields (`v.array(v.float64())`) for embeddings. Implement cosine similarity search in Convex queries.
4. **Usage tracking**: Store token counts in `chatMessages` table. Build custom dashboard with Convex queries aggregating by user/thread/day.
5. **HTTP latency**: For tools that need multiple Convex calls, batch them into a single Convex mutation or query. Cache frequently accessed data in API route memory.

---

## Alternatives Considered

### 1. Convex Agent Component (`@convex-dev/agent`)

Use the `@convex-dev/agent` package to run agents as Convex Actions/Components with built-in persistence, streaming, and thread management.

**Rejected because**:

- **Moves agent logic to Convex Actions**: Agent orchestration would run on Convex infrastructure, not in Next.js API routes. This creates a conceptual split where workflows run in Next.js (Vercel Workflow) but agents run in Convex.
- **Locks agent orchestration to Convex platform**: While Convex is excellent for database/real-time, tying agent logic to it reduces flexibility. With Vercel AI SDK in API routes, agents can call any backend (Convex, direct DB, external APIs).
- **Adds component complexity**: The Agent Component manages its own tables for threads/messages. Understanding the abstraction requires learning the component's data model.
- **HTTP overhead between layers**: If agents run in Convex but workflows run in Vercel, they must communicate via HTTP. Keeping both in Next.js allows direct in-memory function calls.
- **Team expertise**: The team already knows Next.js API routes. Learning Convex Actions for agent orchestration adds learning curve.

**Decision**: Use Convex for what it excels at (database, real-time, caching) and Vercel AI SDK for agent orchestration in the familiar Next.js layer.

### 2. LangChain / LangGraph

Use LangChain's agent framework with LangGraph for multi-agent orchestration.

**Rejected because**:

- Heavy framework with large dependency tree
- No native integration with Convex or Vercel infrastructure
- LangGraph's state management model conflicts with Convex's reactive model
- TypeScript support is improving but not as tight as Vercel AI SDK
- Adds another framework to learn (vs. using Vercel AI SDK which the team already knows from POC)

### 3. OpenAI Assistants API

Use OpenAI's hosted Assistants with built-in thread management and tool calling.

**Rejected because**:

- Locks to OpenAI models (can't use Gemini 2.5 Flash)
- Proprietary thread storage (not in our Convex database)
- Less control over tool execution and persistence
- Higher cost than running agents on Vercel with Gemini API

---

## Related Decisions

- ADR-009: Convex as Unified Backend (provides the platform for agent execution)
- ADR-010: Geospatial Bounding Box Strategy (geospatial tools used by Researcher agent)

---

## References

- [Convex Agent Component](https://github.com/get-convex/agent)
- [Convex Agent Documentation](https://docs.convex.dev/agent)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [@ai-sdk/google (Gemini)](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai)
- [Convex Workflow Component](https://github.com/get-convex/workflow)
- [Current AI Agent Architecture](./AI-AGENTS.md)
