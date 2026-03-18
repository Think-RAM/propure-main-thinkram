import { google } from "@ai-sdk/google";
import { api, Doc } from "@propure/convex/genereated";
import { generateText, Output } from "ai";
import { buildPropertyPromptContext } from "./formatProperty";
import { buildABSContext } from "./formatSuburbMarketData";
import { buildSuburbMetricsPromptContext } from "./formatSuburbMetrics";
import { buildStrategyPromptContext } from "./formatStrategy";
import z from "zod";
import { client } from "@propure/convex/client";
import { ComparableProperty, Scenario } from "@/lib/property";

type PropertyBadge = "Cash Flow Positive" | "High Growth Potential" | "Value Buy";

const model = google("gemini-2.5-flash")

export const getPropertyBadge = async (property: Doc<"properties">, suburbMetrics: Doc<"suburbMetrics">, absData: Doc<"absMarketData">[]) => {
    try {

        const context = `
        ${buildPropertyPromptContext(property)}
        ${buildSuburbMetricsPromptContext(suburbMetrics)}
        ${absData.map(buildABSContext).join("\n")}
        `;

        const { output } = await generateText({
            model,
            prompt: `Based on the following property details and market data, determine if this property is a "Cash Flow Positive", "High Growth Potential", "Value Buy", or "None of the above". Provide only one of these labels as the output.

            ${context}
            `,
            output: Output.choice({
                options: ["Cash Flow Positive", "High Growth Potential", "Value Buy", "None of the above"],
            })
        })
        return output === "None of the above" ? undefined : (output as PropertyBadge);
    } catch (error) {
        console.error("Error calculating property badge:", error);
        return undefined;
    }
}

export const getStrategyScore = async (property: Doc<"properties">, suburbMetrics: Doc<"suburbMetrics">, absData: Doc<"absMarketData">[], strategy: Doc<"strategies">) => {
    try {
        const context = `
        ${buildPropertyPromptContext(property)}
        ${buildSuburbMetricsPromptContext(suburbMetrics)}
        ${absData.map(buildABSContext).join("\n")}
        ${buildStrategyPromptContext(strategy)}
        `;

        const { output } = await generateText({
            model,
            prompt: `Based on the following property details, market data, and investment strategy, provide a score from 1 to 10 indicating how well this property fits the strategy. Also provide a brief explanation for the score.
            ${context}
            `,
            output: Output.object({
                schema: z.object({
                    strategyScore: z.number().min(1).max(100).describe("A score from 1 to 10 indicating how well the property fits the strategy"),
                    strategyLabel: z.string().describe("A brief explanation for the strategy score one sentence max or 12 words max"),
                })
            })
        });

        return output;
    } catch (error) {
        console.error("Error calculating strategy score:", error);
        return {
            strategyScore: undefined,
            strategyLabel: undefined,
        };
    }
}

export const getPropertyStrategyInsight = async (property: Doc<"properties">, suburbMetrics: Doc<"suburbMetrics">, absData: Doc<"absMarketData">[], strategy: Doc<"strategies">) => {
    try {
        const context = `
        ${buildPropertyPromptContext(property)}
        ${buildSuburbMetricsPromptContext(suburbMetrics)}
        ${absData.map(buildABSContext).join("\n")}
        ${buildStrategyPromptContext(strategy)}
        `;

        const { output } = await generateText({
            model,
            prompt: `Based on the following property details, market data, and investment strategy, provide insights about how well this property fits the strategy and any potential risks or advantages. Keep the response concise, one sentence max or 20 words max.
            ${context}
            `,
            output: Output.object({
                schema: z.object({
                    confidence: z.number().min(0).max(100).describe("A confidence score from 0 to 100 indicating how well the property fits the strategy"),
                    confidenceFactors: z.array(z.string()).describe("A list of factors that influenced the confidence score, one sentence max each max points 4"),
                    cashFlow: z.object({
                        level: z.enum(["strong", "moderate", "weak"]).describe("An assessment of the property's cash flow situation"),
                        description: z.string().describe("A brief description of the cash flow situation, one sentence max"),
                    }).describe("An assessment of the property's cash flow situation and its implications for the investment strategy"),
                    consideration: z.object({
                        title: z.string().describe("A key consideration for this property in relation to the investment strategy, one sentence max"),
                        description: z.string().describe("A brief explanation of this consideration, one sentence max 25 words max"),
                    }).describe("A key consideration for this property in relation to the investment strategy, along with a brief explanation"),
                    growth: z.object({
                        title: z.string().describe("An assessment of the property's growth potential in relation to the investment strategy, one sentence max"),
                        description: z.string().describe("A brief explanation of the growth potential, one sentence max 25 words max"),
                    }).describe("An assessment of the property's growth potential in relation to the investment strategy, along with a brief explanation"),
                })
            })
        });

        return output;
    } catch (error) {
        console.error("Error calculating strategy insight:", error);
        return undefined;
    }
}

export const getComparableProperties = async (property: Doc<"properties">) => {
    try {
        const comparableProperties = await client.query(api.functions.properties.fetchProperties, {
            locations: [{
                suburb: property.address.suburb,
                state: property.address.state,
                postcode: property.address.postcode,
            }],
            listingType: "sale",
            maxPrice: property.priceValue ? property.priceValue * 1.2 : undefined,
            minPrice: property.priceValue ? property.priceValue * 0.8 : undefined,
            minBedrooms: property.features?.bedrooms ? Math.max(0, property.features.bedrooms - 1) : undefined,
            maxBedrooms: property.features?.bedrooms ? property.features.bedrooms + 1 : undefined,
            minBathrooms: property.features?.bathrooms ? Math.max(0, property.features.bathrooms - 1) : undefined,
            minCarSpaces: property.features?.parkingSpaces ? Math.max(0, property.features.parkingSpaces - 1) : undefined,
            page: 0,
            pageSize: 10
        })

        const limitedComparables = comparableProperties.data.slice(0, 5);

        return limitedComparables.map((c) => ({
            id: c._id as string,
            date: c.listedDate ?? c.soldDate ?? c.createdAt.toLocaleString(),
            address: c.address.displayAddress,
            suburb: `${c.address.suburb}, ${c.address.state}`,
            price: c.priceValue ?? 0,
            beds: c.features?.bedrooms ?? 0,
            landSize: c.features?.landSize ?? 0,
            pricePerSqm: c.priceValue && c.features?.landSize ? Math.round(c.priceValue / c.features.landSize) : 0,
            comparison: {
                type: getComparisonType(property, c),
                label: `${getComparisonType(property, c).at(0)?.toUpperCase()}${getComparisonType(property, c).slice(1)}`
            },
            image: c.images && c.images.length > 0 ? c.images[0] : undefined,
        } satisfies ComparableProperty));
    } catch (error) {
        console.error("Error fetching comparable properties:", error);
        throw new Error("Failed to fetch comparable properties" + (error instanceof Error ? `: ${error.message}` : ""));
    }
}

const getComparisonType = (property1: Doc<"properties">, property2: Doc<"properties">): "similar" | "higher" | "lower" | "smaller" | "larger" => {
    if (property1.priceValue && property2.priceValue) {
        if (property1.priceValue > property2.priceValue * 1.1) return "higher";
        if (property1.priceValue < property2.priceValue * 0.9) return "lower";
    }
    if (property1.features?.landSize && property2.features?.landSize) {
        if (property1.features.landSize > property2.features.landSize * 1.1) return "larger";
        if (property1.features.landSize < property2.features.landSize * 0.9) return "smaller";
    }
    return "similar";
}

export const getPropertyProjections = async (property: Doc<"properties">, suburbMetrics: Doc<"suburbMetrics">, absData: Doc<"absMarketData">[]) => {
    try {
        const context = `
        ${buildPropertyPromptContext(property)}
        ${buildSuburbMetricsPromptContext(suburbMetrics)}
        ${absData.map(buildABSContext).join("\n")}
        `;

        const metricsSchema = z.object({
            title: z.string().describe("A title summarizing the projection, one sentence max"),
            subtitle: z.string().describe("A brief description of the projection, one sentence max 25 words max"),
            metrics: z.object({
                propertyValue: z.number().describe("Projected property value in 5 years"),
                equity: z.number().describe("Projected equity in 5 years"),
                roi: z.number().describe("Projected return on investment in 5 years"),
            }).describe("Key financial metrics projected for the property in 5 years")
        });

        const [OptimiticProjections, PessimisticProjections, NeutralProjections] = await Promise.all([
            generateText({
                model,
                prompt: `Based on the following property details and market data, provide projections for the property's price growth and rental income potential over the next 5 years. Keep the response concise, one sentence max or 20 words max.
            ${context}
            `,
                output: Output.object({
                    schema: metricsSchema
                })
            }).then(({ output }) => output),
            generateText({
                model,
                prompt: `Based on the following property details and market data, provide pessimistic projections for the property's price growth and rental income potential over the next 5 years. Keep the response concise, one sentence max or 20 words max.
            ${context}
            `,
                output: Output.object({
                    schema: metricsSchema
                })
            }).then(({ output }) => output),
            generateText({
                model,
                prompt: `Based on the following property details and market data, provide neutral projections for the property's price growth and rental income potential over the next 5 years. Keep the response concise, one sentence max or 20 words max.
            ${context}
            `,
                output: Output.object({
                    schema: metricsSchema
                })
            }).then(({ output }) => output),
        ]);

        return [
            {
                id: "optimistic-projections",
                type: "optimistic",
                ...OptimiticProjections,
                isRecommended: true,

            },
            {
                id: "pessimistic-projections",
                type: "pessimistic",
                ...PessimisticProjections
            },
            {
                id: "base-projections",
                type: "base",
                ...NeutralProjections,
            }
        ] satisfies Scenario[];

    } catch (error) {
        console.error("Error calculating property projections:", error);
        throw new Error("Failed to calculate property projections" + (error instanceof Error ? `: ${error.message}` : ""));
    }
}