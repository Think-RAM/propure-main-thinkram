import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { domainTools } from "@/lib/mcp/client";
import {
  AustralianState,
  PropertySearchParamsSchema,
} from "@propure/mcp-shared";

// Tool-specific validation schemas
const SearchPropertiesArgsSchema = PropertySearchParamsSchema;

const GetPropertyDetailsArgsSchema = z.object({
  listingId: z.string().min(1, "listingId is required"),
});

const GetSuburbStatsArgsSchema = z.object({
  suburb: z.string().min(1, "suburb is required"),
  state: AustralianState,
  postcode: z.string().min(1, "postcode is required"),
});

const GetSalesHistoryArgsSchema = z.object({
  address: z.string().min(1, "address is required"),
  suburb: z.string().min(1, "suburb is required"),
  state: AustralianState,
});

const GetAgentInfoArgsSchema = z.object({
  agentId: z.string().min(1, "agentId is required"),
});

const GetAuctionResultsArgsSchema = z.object({
  suburb: z.string().min(1, "suburb is required"),
  state: AustralianState,
});

// Direct API endpoint for Domain.com.au data
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

    // Handle MCP JSON-RPC style requests
    if (method) {
      return handleMcpRequest(method, params, id);
    }

    // Handle direct REST-style requests
    const { tool, arguments: args } = body;
    if (tool) {
      return handleToolCall(tool, args);
    }

    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  } catch (error) {
    console.error("MCP Domain error:", error);
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
  // Initialize
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "propure-domain", version: "1.0.0" },
        capabilities: { tools: {} },
      },
      id,
    });
  }

  // List tools
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
          { name: "get_suburb_stats", description: "Get suburb statistics" },
          { name: "get_sales_history", description: "Get sales history" },
          { name: "get_agent_info", description: "Get agent information" },
          { name: "get_auction_results", description: "Get auction results" },
        ],
      },
      id,
    });
  }

  // Call tool
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
      return domainTools.searchProperties(validated);
    }

    case "get_property_details": {
      const validated = GetPropertyDetailsArgsSchema.parse(args);
      return domainTools.getPropertyDetails(validated.listingId);
    }

    case "get_suburb_stats": {
      const validated = GetSuburbStatsArgsSchema.parse(args);
      return domainTools.getSuburbStats(
        validated.suburb,
        validated.state,
        validated.postcode,
      );
    }

    case "get_sales_history": {
      const validated = GetSalesHistoryArgsSchema.parse(args);
      return domainTools.getSalesHistory(
        validated.address,
        validated.suburb,
        validated.state,
      );
    }

    case "get_agent_info": {
      const validated = GetAgentInfoArgsSchema.parse(args);
      return domainTools.getAgentInfo(validated.agentId);
    }

    case "get_auction_results": {
      const validated = GetAuctionResultsArgsSchema.parse(args);
      return domainTools.getAuctionResults(validated.suburb, validated.state);
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    server: "propure-domain",
    version: "1.0.0",
    status: "healthy",
    tools: [
      "search_properties",
      "get_property_details",
      "get_suburb_stats",
      "get_sales_history",
      "get_agent_info",
      "get_auction_results",
    ],
  });
}
