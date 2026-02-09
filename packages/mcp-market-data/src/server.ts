import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAbsDemographics } from "./sources/abs-api";

/**
 * Create and configure the Market Data MCP server
 */
export function createMarketDataServer(): McpServer {
  const server = new McpServer({
    name: "propure-market-data",
    version: "1.0.0",
  });

  //
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
        const result = await getAbsDemographics(postcode);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result,
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
