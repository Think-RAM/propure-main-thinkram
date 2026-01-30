import { z } from "zod";
import { inngest } from "../client";

// Zod schema for event data validation
const AiInsightsEventSchema = z.object({
  entityType: z.enum(["property", "suburb", "strategy"]),
  entityId: z.string().min(1, "entityId is required"),
  userId: z.string().optional(), // For per-user rate limiting
});

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
    // Per-user rate limit to avoid API abuse
    rateLimit: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "ai/insights.generate" },
  async ({ event, step }) => {
    // Validate event data with Zod
    const parseResult = AiInsightsEventSchema.safeParse(event.data);
    if (!parseResult.success) {
      console.error("Invalid event data:", parseResult.error.flatten());
      return {
        error: "Invalid event data",
        details: parseResult.error.flatten(),
      };
    }
    const { entityType, entityId } = parseResult.data;

    // Step 1: Fetch entity data
    const entityData = await step.run("fetch-entity-data", async () => {
      try {
        console.log(`Fetching ${entityType} data for ID: ${entityId}...`);

        switch (entityType) {
          case "property":
            //TODO: Replace with actual DB fetch
          case "suburb":
            // TODO: Replace with actual DB fetch
          case "strategy":
            // TODO: Replace with actual DB fetch
          default:
            return null;
        }
      } catch (error) {
        console.error(`Failed to fetch ${entityType}:`, error);
        throw error;
      }
    });

    if (!entityData) {
      return { error: "Entity not found", entityType, entityId };
    }

    // Step 2: Generate AI insights
    const insights = await step.run("generate-insights", async () => {
      try {
        // TODO: Call AI service (Gemini) to generate insights
        // Use appropriate prompt based on entityType
        console.log("Generating AI insights...");

        // Placeholder response structure
        return {
          summary: `AI-generated summary for ${entityType} ${entityId}`,
          strengths: ["Good location", "Strong fundamentals"],
          risks: ["Market volatility", "Interest rate sensitivity"],
          recommendations: ["Consider long-term hold", "Monitor vacancy rates"],
          generatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Failed to generate insights:", error);
        throw error;
      }
    });

    // Step 3: Store insights
    await step.run("store-insights", async () => {
      try {
        // TODO: Store insights in Redis cache or dedicated table
        // For now, log the insights
        console.log("Storing AI insights:", JSON.stringify(insights, null, 2));
      } catch (error) {
        console.error("Failed to store insights:", error);
        throw error;
      }
    });

    return {
      entityType,
      entityId,
      insights,
    };
  },
);
