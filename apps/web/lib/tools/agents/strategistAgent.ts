import {
  Output,
  stepCountIs,
  tool,
  ToolLoopAgent,
  UIMessageStreamWriter,
} from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { ChatMessageAI } from "@/types/ai";
import type { Doc, Id } from "@propure/convex/genereated";
import { captureDiscoveryInput, clarifyGoal, recommendStrategy, summarizeProfile } from "../strategyTools";

interface ResearcherAgentProps {
  user: Doc<"users"> & { strategies?: Doc<"strategies">[] };
  strategyId: Id<"strategies"> | null;
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessageAI>;
}

export const strategistOutputSchema = z.object({
  strategyDiscovery: z.object({
    summary: z
      .string()
      .describe("High-level strategy direction and rationale."),
    hypotheses: z
      .array(z.string())
      .min(1)
      .describe("Testable assumptions to validate the strategy."),
    keyInsights: z
      .array(z.string())
      .min(1)
      .describe("Most important findings that informed the strategy."),
    risksAndMitigations: z
      .array(
        z.object({
          risk: z.string(),
          mitigation: z.string(),
        }),
      )
      .default([]),
  }),

  goalSetting: z.object({
    primaryGoal: z.string().describe("Main objective."),
    secondaryGoals: z.array(z.string()).default([]),
    successMetrics: z
      .array(
        z.object({
          metric: z.string(),
          target: z.string(),
          timeframe: z.string().describe("e.g. 2 weeks, Q2, 30 days"),
        }),
      )
      .min(1),
    milestones: z
      .array(
        z.object({
          name: z.string(),
          due: z.string().describe("Date or timeframe"),
          acceptanceCriteria: z.array(z.string()).min(1),
        }),
      )
      .default([]),
  }),

  filterRecommendations: z.object({
    recommendedFilters: z
      .array(
        z.object({
          name: z.string().describe("Filter label, e.g. Budget, Region, Risk"),
          rationale: z.string(),
          defaultValue: z.string().optional(),
          options: z.array(z.string()).optional(),
          priority: z.enum(["must-have", "nice-to-have"]).default("must-have"),
        }),
      )
      .min(1),
    exclusions: z
      .array(
        z.object({
          rule: z.string().describe("What to exclude"),
          reason: z.string(),
        }),
      )
      .default([]),
  }),

  userProfiling: z.object({
    persona: z.string().describe("Concise persona label."),
    context: z
      .object({
        industry: z.string().optional(),
        companySize: z.string().optional(),
        geography: z.string().optional(),
        budgetRange: z.string().optional(),
        timeline: z.string().optional(),
      })
      .default({}),
    preferences: z
      .array(
        z.object({
          preference: z.string(),
          evidence: z.string().optional(),
        }),
      )
      .default([]),
    constraints: z
      .array(
        z.object({
          constraint: z.string(),
          severity: z.enum(["hard", "soft"]).default("hard"),
        }),
      )
      .default([]),
  }),
});

export type StrategistOutput = z.infer<typeof strategistOutputSchema>;

const STRATEGIST_INSTRUCTIONS = `
You are a property investment strategy advisor for the Australian market. Your role is to:

DISCOVER the user's situation through conversational questions:

Financial: Income, deposit, borrowing capacity, existing debts, serviceability buffer
Goals: Primary objective (cash flow vs growth), timeline, portfolio size, target yield
Personal: Risk tolerance, time availability, DIY capability
Constraints: Budget limits, geographic preferences, property types
Experience: Previous investments, management style
Current Market Context: Understanding of RBA cash rate and its impact


ASSESS borrowing capacity and affordability considering:

Current RBA cash rate and stress-test rates (typically RBA rate + 3%)
How rate hikes reduce borrowing capacity (every 1% rate rise = ~$20k less borrowing per $100k loan)
Serviceability requirements: Income must service debt at stress-tested rates
Government schemes eligibility:

First Home Buyer Initiative: Stamp duty concessions, lower deposit requirements in some states
5% Deposit Scheme: Access to lending with minimal deposits (5-10%), government guarantee, higher interest rates
Other state-based programs (First Home Loan Deposit Scheme, etc.)




EVALUATE the RBA cash rate impact on strategy:

Rising rates: Erode rental yields, reduce property resale values, lower investor returns
Falling rates: Improve affordability, increase property values, enhance cash flow returns
Current rate environment: Assess whether to invest now or wait; consider rate cycle position
Portfolio stress: Model returns at higher rates (e.g., if RBA is at 4.35%, model at 7%+ for stress-testing)


RECOMMEND the best investment strategy:

Cash Flow: Positive rental income (typically 4-6% yield), suited to regional areas, less rate-sensitive
Capital Growth: Long-term appreciation (5-10 years+), metro/growth corridors, vulnerable to rate hikes
Renovation/Flip: Buy-renovate-sell, requires hands-on management, sensitive to rate timing
Development: Land subdivision/construction, high capital required, rate environment critical
SMSF: Superannuation-funded, specific compliance, tax advantages for income
Commercial: Office/retail/industrial, different yield dynamics, tenant quality dependent
Mixed: Combination strategies for diversification and risk mitigation


EXPLAIN your reasoning clearly by:

Connecting their financial situation to realistic borrowing capacity at current/stressed rates
Showing how RBA rate movements affect their strategy (affordability, yields, resale value)
Highlighting government scheme eligibility and benefits
Modeling returns under different rate scenarios
Addressing timing: whether current rate environment favors their strategy



Key principles:

Always stress-test borrowing capacity at +3% above current RBA rate
Consider rate cycle position: early hikes vs late cycle impacts differently
Factor government schemes into deposit/borrowing calculations
Emphasize that rising rate environments favor cash flow over capital growth
Explain trade-offs: lower deposits (5% scheme) mean higher rates but enable entry; first home schemes offer tax benefits but have eligibility windows

Ask one discovery question at a time. Be conversational, not interrogative. Use tool calls to capture inputs and progressively refine the strategy recommendation.
`;

const StrategyAgent = ({
  user,
  strategyId,
  chatId,
}: Omit<ResearcherAgentProps, "dataStream">) => {
  const agent = new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions: STRATEGIST_INSTRUCTIONS,
    tools: {
      captureDiscoveryInput: captureDiscoveryInput(user._id, chatId),
      recommendStrategy: recommendStrategy(user._id),
      clarifyGoal: clarifyGoal,
      summarizeProfile: summarizeProfile(user._id),
    },
    // Note: Gemini doesn't support Output.object() with tools (function calling)
    // Using text output instead - the orchestrator will synthesize the response
    output: Output.text(),
    stopWhen: stepCountIs(5),
  });

  return agent;
};

export const StrategyAgentTool = ({
  user,
  strategyId,
  chatId,
  dataStream,
}: ResearcherAgentProps) => {
  return tool({
    description:
      "A research agent that gathers information and refines strategies based on user queries.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The research question or topic to investigate."),
    }),
    execute: async ({ query }) => {
      console.log(`Strategy Tool called ${query}`);

      // Write agent start event
      dataStream.write({
        type: "data-agent-status",
        data: { agent: "strategist", status: "running", query },
      });

      try {
        const agentInstance = StrategyAgent({ user, strategyId, chatId });
        const result = await agentInstance.generate({
          prompt: query,
        });

        // Write step summaries for observability
        for (const step of result.steps) {
          if (step.toolCalls?.length) {
            dataStream.write({
              type: "data-agent-step",
              data: {
                agent: "strategist",
                tools: step.toolCalls.map((tc) => tc.toolName),
              },
            });
          }
        }

        // Write completion
        dataStream.write({
          type: "data-agent-status",
          data: { agent: "strategist", status: "complete" },
        });

        // console.log("Ouput From Strategy Agent");
        // console.dir(result, { depth: Infinity });

        return result.output;
      } catch (error) {
        console.error("Strategist agent error:", error);

        dataStream.write({
          type: "data-agent-status",
          data: { agent: "strategist", status: "error" },
        });

        // Return error message instead of throwing
        return {
          error: true,
          message:
            error instanceof Error
              ? error.message
              : "Strategy generation failed",
        };
      }
    },
  });
};
