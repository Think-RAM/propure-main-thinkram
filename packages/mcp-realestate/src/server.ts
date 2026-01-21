import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  AustralianState,
  PropertyType,
  ListingType,
} from "@propure/mcp-shared";
import {
  searchReaProperties,
  getReaPropertyDetails,
  getReaSuburbProfile,
  getReaSoldProperties,
  getReaAgencyListings,
} from "./scrapers/rea-scraper";

/**
 * Create and configure the RealEstate.com.au MCP server
 */
export function createRealEstateServer(): McpServer {
  const server = new McpServer({
    name: "propure-realestate",
    version: "1.0.0",
  });

  // Tool: Search Properties
  server.registerTool(
    "scrape_realestate",
    {
      title: "Scrape RealEstate Properties",
      description:
        "Scrape property listings on RealEstate.com.au with filters for location, price, bedrooms, and property type",
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
      },
    },
    async (params) => {
      try {
        const results = await searchReaProperties(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
          structuredContent: results,
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
        "Get full details for a specific property listing on RealEstate.com.au",
      inputSchema: {
        listingId: z
          .string()
          .describe("The RealEstate.com.au listing ID or URL path"),
      },
    },
    async ({ listingId }) => {
      try {
        const property = await getReaPropertyDetails(listingId);
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
          structuredContent: property,
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
