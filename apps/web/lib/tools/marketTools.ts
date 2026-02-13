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
        includeBuildingApprovals: z.boolean().default(false),
    }),
    execute: async ({
        suburb,
        state,
        postcode,
        includeMarketTrends,
        includeDemographics,
        includeBuildingApprovals,
    }) => {
        try {
            // Parallel fetch: market data + demographics
            const promises: Promise<any>[] = [];

            // Get Suburb Building Approvals Data
            if (includeBuildingApprovals) {
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

            // Get Suburb Market Trends (e.g. median price, days on market)
            if (includeMarketTrends && postcode) {
                const suburbId = await client.query(api.functions.suburb.getSuburbIdByName, { postcode });
                promises.push(
                    client.query(api.functions.suburbMetrics.getSuburbMetrics, { suburbId })
                );
            }

            const results = await Promise.allSettled(promises);
            const marketData =
                results[0]?.status === "fulfilled" ? (results[0].value.data as Doc<"absBuildingApprovals">[]) : null;
            const demographics =
                results[1]?.status === "fulfilled" ? (results[1].value.data as Doc<"absMarketData">) : null;
            const suburbMetrics =
                results[2]?.status === "fulfilled" ? (results[2].value.data as Doc<"suburbMetrics">) : null;

            return {
                success: true,
                suburb,
                state,
                marketData: marketData || { error: "Market data unavailable" },
                demographics: demographics || { error: "Demographics unavailable" },
                suburbMetrics: suburbMetrics || { error: "Suburb metrics unavailable" },
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