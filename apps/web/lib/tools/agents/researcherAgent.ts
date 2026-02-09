import {
  Output,
  stepCountIs,
  tool,
  ToolLoopAgent,
  UIMessageStreamWriter,
} from "ai";
import { google } from "@ai-sdk/google";
// Note: strategistOutputSchema no longer used - researcher now accepts explicit search params
import { ChatMessageAI } from "@/types/ai";
import z from "zod";
import { getComparables, getPropertyDetails, getSalesHistory, searchProperties } from "../propertySearchTools";
import { getSuburbStats } from "../marketTools";

// Search context extracted from strategy or user query
interface SearchContext {
  suburb?: string;
  state?: string;
  postcode?: string;
  propertyTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  keywords?: string[];
}

interface ResearcherAgentProps {
  searchContext: SearchContext;
  dataStream: UIMessageStreamWriter<ChatMessageAI>;
}

enum Website {
  DOMAIN = "www.domain.com.au",
  REAL_ESTATE = "www.realestate.com.au",
}

// --- re-usable types ---
const MoneyAUD = z.object({
  amount: z.number(),
  currency: z.literal("AUD").default("AUD"),
});

const RangeNumber = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
});

// Simple concurrency limiter (no dependency)
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    },
  );

  await Promise.all(workers);
  return out;
}

// --- tool output (Researcher Agent output buckets) ---
const ResearcherAgentOutputSchema = z.object({
  marketDataFetching: z.object({
    indicators: z
      .array(
        z.object({
          name: z.string(), // e.g. "medianRent", "medianPrice", "vacancyRate"
          value: z.union([z.number(), z.string()]),
          unit: z.string().optional(), // e.g. "%", "AUD/week"
          source: z.object({
            website: z.nativeEnum(Website),
            url: z.string().optional(),
            retrievedAt: z.string(),
          }),
        }),
      )
      .default([]),
    notes: z.array(z.string()).default([]),
  }),

  suburbStatistics: z.object({
    suburb: z.string(),
    state: z.string().optional(),
    postcode: z.string().optional(),

    medianPrice: MoneyAUD.optional(),
    medianRentWeekly: MoneyAUD.optional(),
    grossRentalYieldPct: z.number().optional(),
    vacancyRatePct: z.number().optional(),
    daysOnMarket: z.number().optional(),

    demographics: z
      .object({
        population: z.number().optional(),
        householdIncomeMedian: MoneyAUD.optional(),
      })
      .default({}),

    sources: z
      .array(
        z.object({
          website: z.nativeEnum(Website),
          url: z.string().optional(),
          retrievedAt: z.string(),
        }),
      )
      .default([]),
  }),

  propertySearches: z.object({
    query: z.object({
      suburb: z.string(),
      state: z.string().optional(),
      propertyTypes: z.array(z.string()).default([]), // e.g. ["house","unit"]
      priceRange: RangeNumber.optional(),
      beds: RangeNumber.optional(),
      baths: RangeNumber.optional(),
      keywords: z.array(z.string()).default([]),
    }),

    listings: z
      .array(
        z.object({
          title: z.string(),
          address: z.string().optional(),
          suburb: z.string(),
          state: z.string().optional(),
          postcode: z.string().optional(),

          priceText: z.string().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          cars: z.number().optional(),

          url: z.string(),
          website: z.nativeEnum(Website),

          // inferred fields
          estimatedWeeklyRent: MoneyAUD.optional(),
          estimatedGrossYieldPct: z.number().optional(),

          listedAt: z.string().optional(),
        }),
      )
      .default([]),

    notes: z.array(z.string()).default([]),
  }),

  externalApiCalls: z.object({
    calls: z
      .array(
        z.object({
          name: z.string(), // e.g. "abs_demographics", "corelogic_proxy", "domain_api"
          purpose: z.string(),
          status: z.enum(["planned", "success", "failed", "skipped"]),
          endpoint: z.string().optional(),
          error: z.string().optional(),
        }),
      )
      .default([]),
  }),

  // convenience fields derived from strategy
  derivedExpectations: z.object({
    targetGrossYieldPct: z.number().optional(),
    targetCashFlowWeekly: MoneyAUD.optional(),
    maxPurchasePrice: MoneyAUD.optional(),
    cashInHand: MoneyAUD.optional(),
    assumptions: z.array(z.string()).default([]),
  }),
});

const RESEARCHER_INSTRUCTIONS = `
You are a property market research specialist. Your role is to:

1. RETRIEVE market data:
   - Suburb statistics (vacancy, yield, growth, demographics)
   - Property listings and comparables
   - Historical trends and price movements
   - Infrastructure and development announcements

2. AGGREGATE insights:
   - Identify patterns in data
   - Compare suburbs against benchmarks
   - Highlight anomalies and opportunities
   - Summarize market conditions

3. SEARCH for properties:
   - Apply strategy-specific filters
   - Rank by relevance to user's goals
   - Include key metrics in results

Always cite data sources and indicate data freshness.
`;

const ResearcherAgent = ({
  searchContext,
  dataStream,
}: ResearcherAgentProps) => {
  const agent = new ToolLoopAgent({
    model: google("gemini-2.5-flash"),
    instructions: RESEARCHER_INSTRUCTIONS,
    tools: {
      searchProperties: searchProperties(dataStream),
      getPropertyDetails: getPropertyDetails,
      getComparables: getComparables,
      getSuburbStats: getSuburbStats,
      getSalesHistory: getSalesHistory
    },
    // Note: Gemini doesn't support Output.object() with tools (function calling)
    // Using text output instead - the orchestrator will synthesize the response
    output: Output.text(),
    stopWhen: stepCountIs(4),
  });

  return agent;
};

export const ResearcherAgentTool = ({
  dataStream,
}: Omit<ResearcherAgentProps, "searchContext">) => {
  return tool({
    description:
      "A research agent that searches for properties and gathers market data. Provide explicit search criteria.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The research question or topic to investigate."),
      suburb: z
        .string()
        .optional()
        .describe("Target suburb for property search (e.g., 'Mackay')."),
      state: z
        .string()
        .optional()
        .describe("Australian state abbreviation (e.g., 'QLD', 'NSW')."),
      postcode: z.string().optional().describe("Postcode of the target area."),
      propertyTypes: z
        .array(z.string())
        .optional()
        .describe("Property types to search (e.g., ['house', 'unit'])."),
      priceMin: z.number().optional().describe("Minimum price in AUD."),
      priceMax: z.number().optional().describe("Maximum price in AUD."),
      bedsMin: z.number().optional().describe("Minimum number of bedrooms."),
      bathsMin: z.number().optional().describe("Minimum number of bathrooms."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Additional search keywords (e.g., ['pool', 'renovate'])."),
    }),
    execute: async ({
      query,
      suburb,
      state,
      postcode,
      propertyTypes,
      priceMin,
      priceMax,
      bedsMin,
      bathsMin,
      keywords,
    }) => {
      console.log(`Researcher Tool called ${query}`);

      // Build search context from explicit params
      const searchContext: SearchContext = {
        suburb,
        state,
        postcode,
        propertyTypes,
        priceMin,
        priceMax,
        bedsMin,
        bathsMin,
        keywords,
      };

      // Write agent start event
      dataStream.write({
        type: "data-agent-status",
        data: { agent: "researcher", status: "running", query },
      });

      try {
        const agent = ResearcherAgent({ searchContext, dataStream });
        const result = await agent.generate({ prompt: query });

        // Write step summaries for observability
        for (const step of result.steps) {
          if (step.toolCalls?.length) {
            dataStream.write({
              type: "data-agent-step",
              data: {
                agent: "researcher",
                tools: step.toolCalls.map((tc) => tc.toolName),
              },
            });
          }
        }

        // Write completion
        dataStream.write({
          type: "data-agent-status",
          data: { agent: "researcher", status: "complete" },
        });

        console.log("Ouput From Researcher Agent");
        console.dir(result.output, { depth: Infinity });

        return result.output;
      } catch (error) {
        console.error("Researcher agent error:", error);

        dataStream.write({
          type: "data-agent-status",
          data: { agent: "researcher", status: "error" },
        });

        // Return error message instead of throwing
        return {
          error: true,
          message: error instanceof Error ? error.message : "Research failed",
        };
      }
    },
  });
};
