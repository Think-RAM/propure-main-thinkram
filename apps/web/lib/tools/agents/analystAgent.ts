import {
  Output,
  stepCountIs,
  tool,
  ToolLoopAgent,
  UIMessageStreamWriter,
} from "ai";
import { google } from "@ai-sdk/google";
import { ChatMessageAI } from "@/types/ai";
import { calculateCashFlow } from "../financialTools";
import { calculateROI } from "../financialTools";
import z from "zod";

interface AnalystAgentProps {
  dataStream: UIMessageStreamWriter<ChatMessageAI>;
}

const ANALYST_INSTRUCTIONS = `You are an insightful Analyst Agent. Your role is to analyze data, identify patterns, and provide actionable insights based on the information gathered. You will utilize the available tools effectively to support your analysis and recommendations.
`;

const AnalystAgent = ({ dataStream }: AnalystAgentProps) => {
  const agent = new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions: ANALYST_INSTRUCTIONS,
    tools: {
      calculateCashFlow: calculateCashFlow,
      calculateROI: calculateROI,
      // Add Risk Assessment Tool here
      // Property Scoring Tool here
    },
    // Note: Gemini doesn't support Output.object() with tools (function calling)
    // Using text output instead - the orchestrator will synthesize the response
    output: Output.text(),
    stopWhen: stepCountIs(5),
  });
  return agent;
};

export const AnalystAgentTool = ({ dataStream }: AnalystAgentProps) => {
  return tool({
    description:
      "An analyst agent that interprets data and provides insights to inform decision-making.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The research question or topic to investigate."),
    }),
    execute: async ({ query }) => {
      console.log(`Analyst Tool called ${query}`);

      // Write agent start event
      dataStream.write({
        type: "data-agent-status",
        data: { agent: "analyst", status: "running", query },
      });

      try {
        const agent = AnalystAgent({ dataStream });
        const result = await agent.generate({ prompt: query });

        // Write step summaries for observability
        for (const step of result.steps) {
          if (step.toolCalls?.length) {
            dataStream.write({
              type: "data-agent-step",
              data: {
                agent: "analyst",
                tools: step.toolCalls.map((tc) => tc.toolName),
              },
            });
          }
        }

        // Write completion
        dataStream.write({
          type: "data-agent-status",
          data: { agent: "analyst", status: "complete" },
        });

        console.log("Ouput From Analyst Agent");
        console.dir(result.output, { depth: Infinity });
        return result.output;
      } catch (error) {
        console.error("Analyst agent error:", error);

        dataStream.write({
          type: "data-agent-status",
          data: { agent: "analyst", status: "error" },
        });

        // Return error message instead of throwing
        return {
          error: true,
          message: error instanceof Error ? error.message : "Analysis failed",
        };
      }
    },
  });
};
