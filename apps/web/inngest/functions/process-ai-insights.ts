import { inngest } from "../client";

/**
 * Process AI-generated insights for properties/suburbs
 *
 * This function uses AI to generate insights:
 * - Property investment summaries
 * - Suburb analysis and recommendations
 * - Risk assessments
 * - Comparable property analysis
 *
 * Triggered when new data is available or on-demand.
 */
export const processAiInsights = inngest.createFunction(
  {
    id: "process-ai-insights",
    name: "Process AI Insights",
    retries: 2,
    // Rate limit to avoid API costs
    rateLimit: {
      limit: 10,
      period: "1m",
    },
  },
  { event: "ai/insights.generate" },
  async ({ event, step }) => {
    const { entityType, entityId } = event.data as {
      entityType: "property" | "suburb" | "strategy";
      entityId: string;
    };

    // Step 1: Fetch entity data
    const entityData = await step.run("fetch-entity-data", async () => {
      // TODO: Fetch property, suburb, or strategy data
      console.log(`Fetching ${entityType} data for ID: ${entityId}...`);
      return null;
    });

    if (!entityData) {
      return { error: "Entity not found" };
    }

    // Step 2: Generate AI insights
    const insights = await step.run("generate-insights", async () => {
      // TODO: Call AI service (Claude/Gemini) to generate insights
      // Use appropriate prompt based on entityType
      console.log("Generating AI insights...");
      return {
        summary: null,
        strengths: [],
        risks: [],
        recommendations: [],
      };
    });

    // Step 3: Store insights
    await step.run("store-insights", async () => {
      // TODO: Store insights in database
      // Could be cached in Redis or stored in a dedicated table
      console.log("Storing AI insights...");
    });

    return {
      entityType,
      entityId,
      insights,
    };
  },
);
