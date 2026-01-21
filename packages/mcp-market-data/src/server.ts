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
    "scrape_abs",
    {
      title: "Scrape Australian Bureau of Statistics Data",
      description:
        "Scrape various matrices from the Australian Bureau of Statistics (ABS) website.",
      inputSchema: {
        postcode: z.string(),
      },
    },
    async ({ postcode }) => {
      try {
        const result = await scrapeABSWithScrapeDo(postcode);

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

  return server;
}
