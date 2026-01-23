import {
  Output,
  stepCountIs,
  tool,
  ToolLoopAgent,
  UIMessageStreamWriter,
} from "ai";
import { google } from "@ai-sdk/google";
import { getStrategyTool, saveStrategy } from "../strategyTools";
import { Strategy, User } from "@prisma/client";
import z from "zod";
import { ChatMessageAI } from "@/types/ai";

interface ResearcherAgentProps {
  user: User & { strategies?: Strategy[] };
  strategyId: string | null;
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

const STRATEGIST_INSTRUCTIONS = `You are a strategic planning agent. Your task is to develop comprehensive strategies based on user goals and context. Use the available tools to gather information, validate assumptions, and refine your strategy iteratively.`;

const StrategyAgent = ({
  user,
  strategyId,
}: Omit<ResearcherAgentProps, "dataStream">) => {
  const agent = new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions: STRATEGIST_INSTRUCTIONS,
    tools: {
      getStrategy: getStrategyTool({ userId: user.id }),
      saveStrategy: saveStrategy({ user, strategyId }),
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
        const agentInstance = StrategyAgent({ user, strategyId });
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

        console.log("Ouput From Strategy Agent");
        console.dir(result, { depth: Infinity });

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
