import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  searchReaProperties,
  getReaPropertyDetails,
  getReaSuburbProfile,
  getReaSoldProperties,
  getReaAgencyListings,
} from "@propure/mcp-realestate";
import {
  AustralianState,
  PropertySearchParamsSchema,
} from "@propure/mcp-shared";

// Tool-specific validation schemas
const SearchPropertiesArgsSchema = PropertySearchParamsSchema;

const GetPropertyDetailsArgsSchema = z.object({
  listingId: z.string().min(1, "listingId is required"),
});

const GetSuburbProfileArgsSchema = z.object({
  suburb: z.string().min(1, "suburb is required"),
  state: AustralianState,
  postcode: z.string().min(1, "postcode is required"),
});

const GetSoldPropertiesArgsSchema = z.object({
  suburb: z.string().min(1, "suburb is required"),
  state: AustralianState,
  postcode: z.string().optional(),
});

const GetAgencyListingsArgsSchema = z.object({
  agencyId: z.string().min(1, "agencyId is required"),
});

// Direct API endpoint for RealEstate.com.au data
// Supports both MCP JSON-RPC style calls and direct REST calls

export async function POST(request: NextRequest) {
  try {
    const authToken = process.env.MCP_INTERNAL_TOKEN;
    const isDev = process.env.NODE_ENV === "development";
    const isMockMode = process.env.MCP_MOCK_MODE === "true";

    // In production, require auth token (unless mock mode for demos)
    if (!isDev && !isMockMode && !authToken) {
      console.error("MCP_INTERNAL_TOKEN not configured in production");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }

    // Verify token if configured
    if (authToken) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${authToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { method, params, id } = body;

    if (method) {
      return handleMcpRequest(method, params, id);
    }

    const { tool, arguments: args } = body;
    if (tool) {
      return handleToolCall(tool, args);
    }

    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  } catch (error) {
    console.error("MCP RealEstate error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

async function handleMcpRequest(
  method: string,
  params: Record<string, unknown> | undefined,
  id: string | number | undefined,
) {
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "propure-realestate", version: "1.0.0" },
        capabilities: { tools: {} },
      },
      id,
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        tools: [
          {
            name: "search_properties",
            description: "Search property listings",
          },
          { name: "get_property_details", description: "Get property details" },
          {
            name: "get_suburb_profile",
            description: "Get suburb demographics",
          },
          { name: "get_sold_properties", description: "Get sold properties" },
          { name: "get_agency_listings", description: "Get agency listings" },
        ],
      },
      id,
    });
  }

  if (method === "tools/call") {
    const toolName = params?.name as string;
    const toolArgs = params?.arguments as Record<string, unknown>;
    const result = await executeTool(toolName, toolArgs);

    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        content: [{ type: "text", text: JSON.stringify(result) }],
      },
      id,
    });
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    error: { code: -32601, message: "Method not found" },
    id,
  });
}

async function handleToolCall(
  tool: string,
  args: Record<string, unknown>,
): Promise<NextResponse> {
  const result = await executeTool(tool, args);
  return NextResponse.json({ result });
}

async function executeTool(
  tool: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  switch (tool) {
    case "search_properties": {
      const validated = SearchPropertiesArgsSchema.parse(args);
      return searchReaProperties(validated);
    }

    case "get_property_details": {
      const validated = GetPropertyDetailsArgsSchema.parse(args);
      return getReaPropertyDetails(validated.listingId);
    }

    case "get_suburb_profile": {
      const validated = GetSuburbProfileArgsSchema.parse(args);
      return getReaSuburbProfile(
        validated.suburb,
        validated.state,
        validated.postcode,
      );
    }

    case "get_sold_properties": {
      const validated = GetSoldPropertiesArgsSchema.parse(args);
      return getReaSoldProperties(
        validated.suburb,
        validated.state,
        validated.postcode,
      );
    }

    case "get_agency_listings": {
      const validated = GetAgencyListingsArgsSchema.parse(args);
      return getReaAgencyListings(validated.agencyId);
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

export async function GET() {
  return NextResponse.json({
    server: "propure-realestate",
    version: "1.0.0",
    status: "healthy",
    tools: [
      "search_properties",
      "get_property_details",
      "get_suburb_profile",
      "get_sold_properties",
      "get_agency_listings",
    ],
  });
}
