import { google } from "@ai-sdk/google";
import { Doc } from "@propure/convex/genereated";
import { generateText, Output } from "ai";
import { buildPropertyPromptContext } from "./formatProperty";
import { buildABSContext } from "./formatSuburbMarketData";
import { buildSuburbMetricsPromptContext } from "./formatSuburbMetrics";
import z from "zod";

const model = google("gemini-2.5-flash")

export const getMarketInsight = async (suburbMetrics: Doc<"suburbMetrics">, absData: Doc<"absMarketData">[]) => {
    try {
        const context = `
        ${buildSuburbMetricsPromptContext(suburbMetrics)}
        ${absData.map(buildABSContext).join("\n")}
        `;

        const { output } = await generateText({
            model,
            prompt: `Based on the following market data, provide insights about the suburb's performance and potential.
            ${context}
            `,
            output: Output.object({
                schema: z.object({
                    type: z.enum(["seller", "buyer", "neutral"]).describe("Indicates whether the market is currently favorable for sellers, buyers, or neutral"),
                    title: z.string().describe("A one sentence title summarizing the market insight"),
                    description: z.string().describe("A brief description providing more details about the market insight, one sentence max or 20 words max"),
                })
            })
        });

        return output;

    } catch (error) {
        console.error("Error calculating market insight:", error);
        throw new Error("Failed to calculate market insight" + (error instanceof Error ? ": " + error.message : ""));
    }
}