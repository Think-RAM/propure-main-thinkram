import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AustralianState } from "@propure/mcp-shared";
import {
  getRbaCashRate,
  getRbaLendingRates,
  getRbaEconomicIndicators,
  getAbsDemographics,
  getAbsBuildingApprovals,
  getAbsPopulationProjections,
} from "./sources/market-sources";

/**
 * Create and configure the Market Data MCP server
 */
export function createMarketDataServer(): McpServer {
  const server = new McpServer({
    name: "propure-market-data",
    version: "1.0.0",
  });

  // Tool: Get RBA Cash Rate
  server.registerTool(
    "get_rba_rates",
    {
      title: "Get RBA Interest Rates",
      description:
        "Get current and historical RBA cash rate, plus indicator lending rates",
      inputSchema: {
        includeHistorical: z
          .boolean()
          .default(true)
          .describe("Include historical rate changes"),
        includeLendingRates: z
          .boolean()
          .default(true)
          .describe("Include standard variable and fixed rates"),
      },
    },
    async ({ includeHistorical, includeLendingRates }) => {
      try {
        const [cashRate, lendingRates] = await Promise.all([
          getRbaCashRate(),
          includeLendingRates ? getRbaLendingRates() : null,
        ]);

        const result = {
          cashRate: {
            current: cashRate.current.rate,
            effectiveDate: cashRate.current.effectiveDate,
            historical: includeHistorical ? cashRate.historical : undefined,
          },
          lendingRates: lendingRates || undefined,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Economic Indicators
  server.registerTool(
    "get_economic_indicators",
    {
      title: "Get Economic Indicators",
      description:
        "Get key economic indicators including GDP, inflation, unemployment, and wage growth",
      inputSchema: {},
    },
    async () => {
      try {
        const indicators = await getRbaEconomicIndicators();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(indicators, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Demographics
  server.registerTool(
    "get_abs_demographics",
    {
      title: "Get ABS Demographics",
      description:
        "Get Census demographics for a suburb or LGA including population, income, and housing tenure",
      inputSchema: {
        suburb: z.string().optional().describe("Suburb name"),
        lga: z.string().optional().describe("Local Government Area name"),
        state: AustralianState.optional().describe("Australian state"),
      },
    },
    async ({ suburb, lga, state }) => {
      try {
        const demographics = await getAbsDemographics(suburb, lga, state);
        if (!demographics) {
          return {
            content: [
              { type: "text" as const, text: "Demographics data not found" },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(demographics, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Building Approvals
  server.registerTool(
    "get_building_approvals",
    {
      title: "Get Building Approvals",
      description:
        "Get monthly building approval data showing new dwelling construction trends",
      inputSchema: {
        state: AustralianState.optional().describe(
          "Australian state (defaults to national)",
        ),
        months: z
          .number()
          .default(12)
          .describe("Number of months of data to return"),
      },
    },
    async ({ state, months }) => {
      try {
        const approvals = await getAbsBuildingApprovals(state, months);
        const summary = {
          totalPeriods: approvals.length,
          totalDwellings: approvals.reduce(
            (sum, a) => sum + a.totalDwellings,
            0,
          ),
          averageMonthly: Math.round(
            approvals.reduce((sum, a) => sum + a.totalDwellings, 0) /
              approvals.length,
          ),
          data: approvals,
        };
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // Tool: Get Population Projections
  server.registerTool(
    "get_population_projections",
    {
      title: "Get Population Projections",
      description:
        "Get population projections showing expected growth to 2030 and 2040",
      inputSchema: {
        state: AustralianState.optional().describe("Australian state"),
      },
    },
    async ({ state }) => {
      try {
        const projections = await getAbsPopulationProjections(state);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(projections, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  return server;
}
