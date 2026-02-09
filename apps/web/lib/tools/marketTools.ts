import { tool } from "ai";
import { z } from "zod";
import { api, Doc } from "@propure/convex/genereated";
import { client } from "@propure/convex/client";
import { AustralianState } from "@propure/convex";

export const getSuburbStats = tool({
    description:
        "Get comprehensive suburb statistics including demographics, market metrics, and trends",
    inputSchema: z.object({
        suburb: z.string().describe("Suburb name"),
        state: z.string().describe("State code (NSW, VIC, QLD, etc.)"),
        postcode: z.string().describe("Postcode (improves demographic data accuracy)"),
        includeMarketTrends: z.boolean().default(true),
        includeDemographics: z.boolean().default(true),
    }),
    execute: async ({
        suburb,
        state,
        postcode,
        includeMarketTrends,
        includeDemographics,
    }) => {
        try {
            // Parallel fetch: market data + demographics
            const promises: Promise<any>[] = [];

            // Get Suburb Market Data
            if (includeMarketTrends) {
                promises.push(
                    client.query(api.functions.absBuildingApproval.getAbsBuildingDataBySuburb, { suburb, state: state as AustralianState })
                );
            }

            // Get Suburb Demographics
            if (includeDemographics && postcode) {
                promises.push(
                    client.query(api.functions.absMarketData.getAbsMarketDataByPostcode, { postcode })
                );
            }

            const results = await Promise.allSettled(promises);
            const marketData =
                results[0]?.status === "fulfilled" ? (results[0].value.data as Doc<"absBuildingApprovals">[]) : null;
            const demographics =
                results[1]?.status === "fulfilled" ? (results[1].value.data as Doc<"absMarketData">) : null;

            return {
                success: true,
                suburb,
                state,
                marketData: marketData || { error: "Market data unavailable" },
                demographics: demographics || { error: "Demographics unavailable" },
            };

        } catch (error) {
            console.error("Suburb stats retrieval failed:", error);
            return {
                success: false,
                error: "Unable to retrieve suburb statistics",
            };
        }
    },
});