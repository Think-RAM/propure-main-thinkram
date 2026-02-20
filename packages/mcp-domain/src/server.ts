import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  AustralianState,
  PropertyType,
  ListingType,
} from "@propure/mcp-shared";
import {
  searchDomainPropertiesWithScrapeDo,
  getDomainPropertyDetailsWithScrapeDo,
  searchDomainPropertiesUsingOxylabs,
  getDomainPropertyDetailsUsingOxylabs,
  // getDomainSuburbStats,
  // getDomainSalesHistory,
  // getDomainAgentInfo,
  // getDomainAuctionResults,
} from "./scrapers/domain-scraper";

/**
 * Create and configure the Domain.com.au MCP server
 */
export function createDomainServer(): McpServer {
  const server = new McpServer({
    name: "propure-domain",
    version: "1.0.0",
  });

  // Tool: Search Properties
  server.registerTool(
    "scrape_domain",
    {
      title: "Scrape Domain Properties",
      description:
        "Scrape property listings on Domain.com.au with filters for location, price, bedrooms, and property type",
      inputSchema: {
        suburbs: z
          .array(z.string())
          .optional()
          .describe("List of suburb names to search in"),
        state: AustralianState.optional().describe(
          "Australian state (NSW, VIC, QLD, WA, SA, TAS, NT, ACT)",
        ),
        postcode: z.string().optional().describe("Postcode to search in"),
        minPrice: z.number().optional().describe("Minimum price"),
        maxPrice: z.number().optional().describe("Maximum price"),
        minBeds: z.number().optional().describe("Minimum number of bedrooms"),
        maxBeds: z.number().optional().describe("Maximum number of bedrooms"),
        minBaths: z.number().optional().describe("Minimum number of bathrooms"),
        propertyTypes: z
          .array(PropertyType)
          .optional()
          .describe("Property types to include"),
        listingType: ListingType.default("sale").describe(
          "Type of listing: sale, rent, or sold",
        ),
        pageSize: z.number().default(20).describe("Number of results per page"),
        page: z.number().default(1).describe("Page number"),
        maxPages: z
          .number()
          .default(50)
          .describe("Maximum number of pages to scrape (for pagination)"),
      },
    },
    async (params) => {
      try {
        const results = await searchDomainPropertiesWithScrapeDo(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(results, null, 2),
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

  // Tool: Get Property Details
  server.registerTool(
    "get_property_details",
    {
      title: "Get Property Details",
      description:
        "Get full details for a specific property listing on Domain.com.au",
      inputSchema: {
        listingId: z
          .string()
          .describe("The Domain.com.au listing ID or URL path"),
        listingType: ListingType.default("sale").describe(
          "Type of listing: sale, rent, or sold",
        ),
      },
    },
    async ({ listingId, listingType }) => {
      try {
        const property = await getDomainPropertyDetailsWithScrapeDo(
          listingId,
          listingType,
        );
        if (!property) {
          return {
            content: [{ type: "text" as const, text: "Property not found" }],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(property, null, 2),
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

  // Tool: Get Suburb Stats
  // server.registerTool(
  //   "get_suburb_stats",
  //   {
  //     title: "Get Suburb Statistics",
  //     description:
  //       "Get market statistics for a suburb including median price, yield, growth rates, and days on market",
  //     inputSchema: {
  //       suburb: z.string().describe("Suburb name"),
  //       state: AustralianState.describe("Australian state"),
  //       postcode: z.string().describe("Postcode"),
  //     },
  //   },
  //   async ({ suburb, state, postcode }) => {
  //     try {
  //       const stats = await getDomainSuburbStats(suburb, state, postcode);
  //       if (!stats) {
  //         return {
  //           content: [
  //             { type: "text" as const, text: "Suburb statistics not found" },
  //           ],
  //           isError: true,
  //         };
  //       }
  //       return {
  //         content: [
  //           {
  //             type: "text" as const,
  //             text: JSON.stringify(stats, null, 2),
  //           },
  //         ],
  //         structuredContent: stats,
  //       };
  //     } catch (error) {
  //       const message =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       return {
  //         content: [{ type: "text" as const, text: `Error: ${message}` }],
  //         isError: true,
  //       };
  //     }
  //   },
  // );

  // Tool: Get Sales History
  // server.registerTool(
  //   "get_sales_history",
  //   {
  //     title: "Get Sales History",
  //     description:
  //       "Get historical sales records for a specific property address",
  //     inputSchema: {
  //       address: z.string().describe("Street address of the property"),
  //       suburb: z.string().describe("Suburb name"),
  //       state: AustralianState.describe("Australian state"),
  //     },
  //   },
  //   async ({ address, suburb, state }) => {
  //     try {
  //       const history = await getDomainSalesHistory(address, suburb, state);
  //       return {
  //         content: [
  //           {
  //             type: "text" as const,
  //             text: JSON.stringify(history, null, 2),
  //           },
  //         ],
  //         structuredContent: { salesHistory: history },
  //       };
  //     } catch (error) {
  //       const message =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       return {
  //         content: [{ type: "text" as const, text: `Error: ${message}` }],
  //         isError: true,
  //       };
  //     }
  //   },
  // );

  // Tool: Get Agent Info
  // server.registerTool(
  //   "get_agent_info",
  //   {
  //     title: "Get Agent Information",
  //     description:
  //       "Get details about a real estate agent including contact info, sales count, and ratings",
  //     inputSchema: {
  //       agentId: z.string().describe("The Domain.com.au agent ID"),
  //     },
  //   },
  //   async ({ agentId }) => {
  //     try {
  //       const agent = await getDomainAgentInfo(agentId);
  //       if (!agent) {
  //         return {
  //           content: [{ type: "text" as const, text: "Agent not found" }],
  //           isError: true,
  //         };
  //       }
  //       return {
  //         content: [
  //           {
  //             type: "text" as const,
  //             text: JSON.stringify(agent, null, 2),
  //           },
  //         ],
  //         structuredContent: agent,
  //       };
  //     } catch (error) {
  //       const message =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       return {
  //         content: [{ type: "text" as const, text: `Error: ${message}` }],
  //         isError: true,
  //       };
  //     }
  //   },
  // );

  // Tool: Get Auction Results
  // server.registerTool(
  //   "get_auction_results",
  //   {
  //     title: "Get Auction Results",
  //     description:
  //       "Get recent auction results for a suburb including sold prices and clearance rates",
  //     inputSchema: {
  //       suburb: z.string().describe("Suburb name"),
  //       state: AustralianState.describe("Australian state"),
  //     },
  //   },
  //   async ({ suburb, state }) => {
  //     try {
  //       const results = await getDomainAuctionResults(suburb, state);
  //       return {
  //         content: [
  //           {
  //             type: "text" as const,
  //             text: JSON.stringify(results, null, 2),
  //           },
  //         ],
  //         structuredContent: { auctionResults: results },
  //       };
  //     } catch (error) {
  //       const message =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       return {
  //         content: [{ type: "text" as const, text: `Error: ${message}` }],
  //         isError: true,
  //       };
  //     }
  //   },
  // );

  return server;
}
