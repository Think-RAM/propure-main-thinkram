import { client } from "@propure/convex/client";
import { api, Doc, Id } from "@propure/convex/genereated";
import { generateStrategyInsights, generateRecommendedProperty, generateRecommendationSummary, scoreProperty } from "../utils/ai";


interface Property {
    id: string;
    title: string;
    location: string;
    images: string[];
    price: number;
    yield: number;
    rent: number;
    cashFlow: number;
    growth: number;
    risk: string;
    daysOnMarket: number;
    score: number;
    tag?: "recommended" | "runner-up";
}

interface RecommendedProperty {
    description: string;
    title: string;
    confidence: number;
}

interface AIInsights {
    strategy: string;
    recommendationSummaryMD: string;
}

interface SummaryMetric {
    value: number;
    description: string;
}

interface Summary {
    purchasePrice: SummaryMetric;
    cashFlow: SummaryMetric;
    growth: SummaryMetric;
}

// -------------------- HELPERS ----------------
async function fetchMarketDataAndCalculateMetrics(
    property: Doc<"properties">,
    strategy: Doc<"strategies">
): Promise<{
    property: Property;
    suburbMarketData: Doc<"suburbMetrics">;
    absData: Doc<"absMarketData">[];
} | null> {
    try {
        const postcode = property.address.postcode;

        const [suburbMarketData, absData] = await Promise.all([
            client.query(api.functions.suburbMetrics.getSuburbMetrics, { postcode }),
            client.query(api.functions.absMarketData.getAbsMarketDataByPostcode, { postcode }),
        ]);

        if (!suburbMarketData || !absData || absData.length === 0) {
            return null;
        }

        const avgWeeklyRent =
            absData.reduce((acc, data) => acc + (data.medianWeeklyRent ?? 0), 0) /
            absData.length;

        const price = property.price ? parseFloat(property.price) : 0;
        const risk = suburbMarketData.metrics.riskScore > 10 ? "high" : suburbMarketData.metrics.riskScore > 5 ? "medium" : "low";

        const enrichedProperty: Property = {
            id: property._id,
            title: property.address.displayAddress,
            location: `${property.address.suburb}, ${property.address.state}`,
            images: property.images ?? [],
            price,
            yield: suburbMarketData.metrics.netYield ?? 0,
            rent: property.propertyRentEstimate ?? avgWeeklyRent,
            cashFlow: (property.propertyRentEstimate ?? avgWeeklyRent) * 52 - price,
            growth: suburbMarketData.metrics.capitalGrowthScore ?? 0,
            risk,
            daysOnMarket:
                property.daysOnMarket
                    ? parseInt(property.daysOnMarket.toString())
                    : suburbMarketData.metrics.averageDaysOnMarket ?? 0,
            score: 0,
        };

        const score = await scoreProperty({
            strategy,
            data: {
                property: enrichedProperty,
                suburbMarketData,
                absData,
            }
        })

        return {
            property: { ...enrichedProperty, score },
            suburbMarketData,
            absData,
        };
    } catch (err) {
        console.error("Failed to enrich property:", property._id, err);
        return null;
    }
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}


// ---------------- STEPS ----------------
async function fetchStrategyProperty(chatId: string) {
    "use step";
    const strategy = await client.query(api.functions.strategy.GetStrategyByChatId, { chatId });
    const { shortlistedPropertyIds } = await client.query(api.functions.chat.getChatById, { id: chatId }) ?? {};
    if (!shortlistedPropertyIds || shortlistedPropertyIds.length === 0) {
        throw new Error("No shortlisted properties found for chatId: " + chatId);
    }
    const properties = await client.query(api.functions.properties.getPropertiesByExternalIds, { externalIds: shortlistedPropertyIds });

    return {
        strategy,
        properties,
    }
}

async function enrichPropertiesWithMarketData(
    properties: Doc<"properties">[],
    strategy: Doc<"strategies">
): Promise<Array<{
    property: Property;
    suburbMarketData: Doc<"suburbMetrics">;
    absData: Doc<"absMarketData">[];
}>> {
    "use step";

    const BATCH_SIZE = 3;

    const batches = chunkArray(properties, BATCH_SIZE);

    const results: Array<{
        property: Property;
        suburbMarketData: Doc<"suburbMetrics">;
        absData: Doc<"absMarketData">[];
    }> = [];

    for (const batch of batches) {
        // Run 3 in parallel
        const settledResults = await Promise.allSettled(
            batch.map((property) =>
                fetchMarketDataAndCalculateMetrics(property, strategy)
            )
        );

        for (const result of settledResults) {
            if (result.status === "fulfilled" && result.value) {
                results.push(result.value);
            } else {
                // Optional: log or track failed property
                console.warn("Property enrichment failed:", result);
            }
        }
    }

    return results;
}

async function generateAIInsights(strategy: Doc<"strategies">, data: Array<{ property: Property; suburbMarketData: Doc<"suburbMetrics">; absData: Doc<"absMarketData">[] }>):
    Promise<{
        insights: AIInsights;
        recommendedProperty: RecommendedProperty,
        summary: Summary
    }> {
    "use step";

    const [insights, recommendedProperty, summary] = await Promise.all([
        generateStrategyInsights({ strategy, data }),
        generateRecommendedProperty({ data }),
        generateRecommendationSummary({ data }),
    ]);

    return {
        insights,
        recommendedProperty,
        summary,
    };
}

async function saveShortListReport(params: {
    userId: Id<"users">;
    strategyId: Id<"strategies">;
    chatId: string;
    property: Property[];
    recommendedProperty: RecommendedProperty;
    aiInsights: AIInsights;
    summary: Summary
}) {
    "use step"
    await client.mutation(api.functions.shortListReports.saveShortListReport, {
        userId: params.userId,
        strategyId: params.strategyId,
        chatId: params.chatId,
        property: params.property,
        recommendedProperty: params.recommendedProperty,
        aiInsights: params.aiInsights,
        summary: params.summary,
    });

    return { success: true };
}

export async function generateShortListReport({ chatId }: { chatId: string }): Promise<{ success: boolean; message: string }> {
    "use workflow";

    try {
        const { strategy, properties } = await fetchStrategyProperty(chatId);

        const enrichedProperties = await enrichPropertiesWithMarketData(properties, strategy);

        const { insights, recommendedProperty, summary } = await generateAIInsights(strategy, enrichedProperties);

        await saveShortListReport({
            userId: strategy.userId,
            strategyId: strategy._id,
            chatId,
            property: enrichedProperties.map((item) => item.property),
            recommendedProperty,
            aiInsights: insights,
            summary,
        });

        return { success: true, message: "Shortlist report generated successfully" };
    } catch (error) {
        console.error("Error generating shortlist report:", error);
        return { success: false, message: "Failed to generate shortlist report" + (error instanceof Error ? `: ${error.message}` : "") };
    }
}