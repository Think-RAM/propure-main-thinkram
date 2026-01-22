import { Output, stepCountIs, tool, ToolLoopAgent, UIMessageStreamWriter } from 'ai';
import { google } from "@ai-sdk/google";
import { ChatMessageAI } from '@/types/ai';
import { calculateCashFlow } from '../financialTools';
import { calculateROI } from '../financialTools';
import z from 'zod';

interface AnalystAgentProps {
    dataStream: UIMessageStreamWriter<ChatMessageAI>
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
        output: Output.object({
            schema: z.object({
                insights: z.string().describe("Key insights derived from the data analysis."),
                recommendations: z.string().describe("Actionable recommendations based on the insights."),
            })
        }),
        stopWhen: stepCountIs(5),
    })
    return agent;
}

export const AnalystAgentTool = ({ dataStream }: AnalystAgentProps) => {
    return tool({
        description: "An analyst agent that interprets data and provides insights to inform decision-making.",
        inputSchema: z.object({
            query: z.string().describe("The research question or topic to investigate."),
        }),
        execute: async ({ query }) => {
            console.log(`Analyst Tool called ${query}`)
            const agent = AnalystAgent({ dataStream });
            const result = await agent.generate({ prompt: query })
            console.log("Ouput From Analyst Agent")
            console.dir(result.output, { depth: Infinity });
            return result.output;
        }
    })
}