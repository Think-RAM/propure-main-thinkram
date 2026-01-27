# ADR-011: Convex Agent Component for Multi-Agent Orchestration

**Status**: Accepted
**Date**: 2026-01-27
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure uses a multi-agent orchestration pattern where four AI agents collaborate to help users discover investment strategies, research markets, and analyse properties:

| Agent | Purpose |
|-------|---------|
| **Orchestrator** | Routes requests, synthesises responses, coordinates UI |
| **Strategist** | Strategy discovery, goal setting, recommendations |
| **Analyst** | Financial calculations, risk assessment, ROI modeling |
| **Researcher** | Market data retrieval, property search, suburb stats |

All agents use **Gemini 2.5 Flash** via `@ai-sdk/google`.

### Current Implementation (POC/ai-sdk Branch)

The existing proof-of-concept uses Vercel AI SDK's `streamText` with a `ToolLoopAgent` pattern in Next.js API routes:

```typescript
// Current: Next.js API route
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

This approach has several limitations:

1. **No message persistence**: Chat history is stored in client state and sent with every request. Page refresh loses conversation.
2. **HTTP SSE streaming**: Uses Server-Sent Events over HTTP, which has connection timeout issues on serverless platforms (Vercel 60-second function timeout).
3. **No cross-agent context sharing**: Each agent invocation is independent. The Orchestrator must manually pass context between sub-agents via tool call arguments.
4. **No usage tracking**: No built-in way to track token usage, cost, or performance per agent.
5. **No durable workflows**: Multi-step agent tasks (e.g., "research 5 suburbs and compare them") can't survive function timeouts or failures.
6. **Manual UI update plumbing**: AI tool results must be explicitly pushed to the frontend via Pusher. No automatic reactivity.

### Requirements for Production

- Persistent chat threads with message history stored in the database
- WebSocket streaming (not HTTP SSE) for reliable long-running agent responses
- Cross-agent context sharing and thread continuation
- Durable multi-step workflows that survive timeouts
- Built-in token usage tracking and cost monitoring
- Automatic UI updates when agent actions modify data

---

## Decision

Use **`@convex-dev/agent`** (Convex Agent Component) for multi-agent orchestration. This is a Convex component built on top of the Vercel AI SDK that adds persistence, streaming, and workflow integration.

### Agent Definitions

```typescript
// packages/convex/convex/agents/orchestrator.ts
import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";

export const orchestrator = new Agent(components.agent, {
  name: "Orchestrator",
  chat: google("gemini-2.5-flash"),
  instructions: `You are the Propure AI assistant...`,
  tools: [delegateToStrategist, delegateToAnalyst, delegateToResearcher, updateUI],
});
```

```typescript
// packages/convex/convex/agents/strategist.ts
export const strategist = new Agent(components.agent, {
  name: "Strategist",
  chat: google("gemini-2.5-flash"),
  instructions: `You are a property investment strategy advisor...`,
  tools: [captureDiscoveryInput, recommendStrategy, createStrategy, updateStrategy],
});
```

```typescript
// packages/convex/convex/agents/researcher.ts
export const researcher = new Agent(components.agent, {
  name: "Researcher",
  chat: google("gemini-2.5-flash"),
  instructions: `You are a market research specialist...`,
  tools: [searchProperties, getSuburbStats, callDomainMCP, callRealestateMCP],
});
```

```typescript
// packages/convex/convex/agents/analyst.ts
export const analyst = new Agent(components.agent, {
  name: "Analyst",
  chat: google("gemini-2.5-flash"),
  instructions: `You are a financial analysis specialist...`,
  tools: [calculateCashFlow, calculateROI, assessRisk, compareProperties],
});
```

### Tool Types

The Convex Agent Component distinguishes two tool types:

1. **`createTool`** — Tools that need Convex database access (`ctx`). Used for reading/writing data.
2. **`tool()`** — Pure computation tools (Vercel AI SDK `tool()`). Used for calculations, formatting.

```typescript
// createTool: has database access
const searchProperties = createTool({
  description: "Search properties with filters",
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // ctx.db available for Convex queries
    return await ctx.db.query("properties")
      .withIndex("by_location_lat", ...)
      .collect();
  },
});

// tool(): pure computation
const calculateCashFlow = tool({
  description: "Calculate cash flow for a property",
  parameters: z.object({ /* ... */ }),
  execute: async ({ price, rent, expenses }) => {
    return { annualCashFlow: rent * 52 - expenses, yield: (rent * 52 / price) * 100 };
  },
});
```

### MCP Integration

External MCP servers (Domain, REA, Market Data) are called from Convex Actions via HTTP:

```typescript
// packages/convex/convex/actions/mcp.ts
export const callDomainMCP = action({
  args: { tool: v.string(), input: v.any() },
  handler: async (ctx, args) => {
    // MCP servers expose HTTP endpoints
    const response = await fetch(`${process.env.MCP_DOMAIN_URL}/tools/${args.tool}`, {
      method: "POST",
      body: JSON.stringify(args.input),
    });
    return response.json();
  },
});
```

### Streaming Architecture

```
Browser ←─ WebSocket ──→ Convex
                           │
                           ├── saveStreamDeltas() ──→ Thread messages (persisted)
                           │
                           └── useUIMessages() ──→ Real-time message stream (reactive)
```

The Convex Agent Component uses `saveStreamDeltas` to persist streamed tokens to the thread, and the frontend uses `useUIMessages` (a reactive Convex query) to display them in real-time over WebSocket.

---

## Rationale

### Built on Top of Vercel AI SDK

The Convex Agent Component is not a replacement for Vercel AI SDK — it's built on top of it. It uses the same `tool()` definitions, the same `@ai-sdk/google` provider, and the same model interface. This means:

- Existing tool logic from the POC/ai-sdk branch is **directly reusable**
- System prompts require no changes
- Model configuration (Gemini 2.5 Flash) stays the same
- Knowledge of Vercel AI SDK applies directly

### Thread/Message Persistence

Every message (user, assistant, tool call, tool result) is automatically persisted to Convex tables managed by the Agent Component. This provides:

- Chat history survives page refresh
- Conversation can be resumed across sessions
- Full audit trail of agent reasoning and tool calls
- Historical context for agent responses

### WebSocket Streaming Over HTTP SSE

Convex uses WebSocket connections (not HTTP SSE) for real-time data. Streaming agent responses through Convex's reactive system provides:

- No 60-second serverless timeout (Convex Actions have up to 10-minute timeout for AI operations)
- Automatic reconnection on network interruption
- Bi-directional communication (can cancel in-flight requests)

### Durable Multi-Agent Workflows

The Agent Component integrates with the Convex Workflow Component for durable multi-step orchestration:

```typescript
const researchWorkflow = new WorkflowManager(components.workflow);

export const deepResearch = researchWorkflow.define({
  args: { suburbs: v.array(v.string()) },
  handler: async (step, args) => {
    // Each step is durable — survives failures
    const stats = await step.run("getStats", () =>
      researcher.generateText({ prompt: `Get stats for ${args.suburbs}` })
    );
    const analysis = await step.run("analyze", () =>
      analyst.generateText({ prompt: `Analyze: ${stats}` })
    );
    return analysis;
  },
});
```

### Built-in RAG Support

The Agent Component includes vector search capabilities for retrieval-augmented generation, which can be used for:

- Searching past conversations for context
- Matching user queries to relevant market reports
- Semantic search over property descriptions

### Usage Tracking

Token usage, model costs, and execution times are tracked per agent, per thread. This is essential for monitoring costs when running four agents that may invoke each other.

---

## Consequences

### Positive

- **Persistent conversations**: All chat history stored in Convex, survives page refresh, resumable across sessions.
- **WebSocket streaming**: No HTTP timeout issues. Reliable streaming even for long agent responses.
- **Reusable tool logic**: Existing Vercel AI SDK tools from POC branch work with minimal changes.
- **Durable workflows**: Multi-agent tasks survive function timeouts and failures via Workflow Component.
- **Automatic UI updates**: Agent mutations to Convex data (e.g., creating a strategy) automatically trigger reactive UI updates. No Pusher needed.
- **Usage tracking**: Built-in token/cost monitoring per agent and per thread.
- **RAG capabilities**: Vector search for context retrieval without additional infrastructure.

### Negative

- **Agent logic moves to Convex Actions**: Agent orchestration code runs on Convex infrastructure, not in Next.js API routes. This is a conceptual shift from the POC architecture.
- **Convex Action constraints**: Actions (which run AI calls) cannot directly read/write the database — they must call mutations/queries. The Agent Component handles this internally, but custom tool implementations must respect this boundary.
- **Component complexity**: The Agent Component adds tables and functions to the Convex deployment. Understanding the component's internal data model requires reading the documentation.
- **Model provider lock-in to Vercel AI SDK**: While the Agent Component uses Vercel AI SDK, the specific model providers must be compatible. Gemini via `@ai-sdk/google` is supported.

### Mitigations

1. **Action constraints**: Use `createTool` for database-accessing tools (handles the mutation boundary internally). Use `tool()` for pure computation.
2. **Component understanding**: Follow the `@convex-dev/agent` documentation and examples. The component abstracts most complexity behind the `Agent` class.
3. **Model flexibility**: Vercel AI SDK supports OpenAI, Anthropic, Google, and others. Switching models requires only changing the `chat` parameter in the Agent definition.

---

## Alternatives Considered

### 1. Keep ToolLoopAgent in Next.js API Routes + Wire to Convex

Keep the current Vercel AI SDK `streamText` approach in API routes, but persist messages to Convex manually and use Convex subscriptions for UI updates.

**Rejected because**:
- Requires building persistence layer from scratch (message storage, thread management, context retrieval)
- HTTP SSE streaming still has timeout issues on serverless
- Manual wiring between AI responses and Convex mutations creates a complex integration layer
- Duplicates functionality that `@convex-dev/agent` provides out of the box

### 2. LangChain / LangGraph

Use LangChain's agent framework with LangGraph for multi-agent orchestration.

**Rejected because**:
- Heavy framework with large dependency tree
- No native Convex integration — would require custom persistence adapters
- LangGraph's state management model conflicts with Convex's reactive model
- TypeScript support is improving but not as tight as Vercel AI SDK + Convex
- Adds another framework to learn alongside Convex

### 3. Custom Multi-Agent Framework

Build a bespoke agent orchestration system from scratch using raw Vercel AI SDK.

**Rejected because**:
- Significant engineering effort for persistence, streaming, context management
- Must solve problems already solved by `@convex-dev/agent` (thread management, token tracking, tool execution)
- Maintenance burden of a custom framework
- Risk of architectural mistakes in areas where Convex has production-tested patterns

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
