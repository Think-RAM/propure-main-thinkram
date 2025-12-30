import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getRbaCashRate,
  getRbaLendingRates,
  getRbaEconomicIndicators,
  getAbsDemographics,
  getAbsBuildingApprovals,
  getAbsPopulationProjections,
} from "@propure/mcp-market-data";
import { AustralianState } from "@propure/mcp-shared";

// Tool-specific validation schemas
const GetRbaRatesArgsSchema = z.object({
  includeLendingRates: z.boolean().optional().default(true),
  includeHistorical: z.boolean().optional().default(true),
});

const GetEconomicIndicatorsArgsSchema = z.object({});

const GetAbsDemographicsArgsSchema = z.object({
  suburb: z.string().optional(),
  lga: z.string().optional(),
  state: AustralianState.optional(),
});

const GetBuildingApprovalsArgsSchema = z.object({
  state: AustralianState.optional(),
  months: z.number().optional().default(12),
});

const GetPopulationProjectionsArgsSchema = z.object({
  state: AustralianState.optional(),
});

// Direct API endpoint for market data (RBA, ABS, Infrastructure)
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
    console.error("MCP Market Data error:", error);
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
        serverInfo: { name: "propure-market-data", version: "1.0.0" },
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
          { name: "get_rba_rates", description: "Get RBA interest rates" },
          {
            name: "get_economic_indicators",
            description: "Get economic indicators",
          },
          { name: "get_abs_demographics", description: "Get ABS demographics" },
          {
            name: "get_building_approvals",
            description: "Get building approvals",
          },
          {
            name: "get_population_projections",
            description: "Get population projections",
          },
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
    case "get_rba_rates": {
      const validated = GetRbaRatesArgsSchema.parse(args);
      const [cashRate, lendingRates] = await Promise.all([
        getRbaCashRate(),
        validated.includeLendingRates ? getRbaLendingRates() : null,
      ]);
      return {
        cashRate: {
          current: cashRate.current.rate,
          effectiveDate: cashRate.current.effectiveDate,
          historical: validated.includeHistorical
            ? cashRate.historical
            : undefined,
        },
        lendingRates,
      };
    }

    case "get_economic_indicators": {
      GetEconomicIndicatorsArgsSchema.parse(args);
      return getRbaEconomicIndicators();
    }

    case "get_abs_demographics": {
      const validated = GetAbsDemographicsArgsSchema.parse(args);
      return getAbsDemographics(
        validated.suburb,
        validated.lga,
        validated.state,
      );
    }

    case "get_building_approvals": {
      const validated = GetBuildingApprovalsArgsSchema.parse(args);
      return getAbsBuildingApprovals(validated.state, validated.months);
    }

    case "get_population_projections": {
      const validated = GetPopulationProjectionsArgsSchema.parse(args);
      return getAbsPopulationProjections(validated.state);
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

export async function GET() {
  return NextResponse.json({
    server: "propure-market-data",
    version: "1.0.0",
    status: "healthy",
    tools: [
      "get_rba_rates",
      "get_economic_indicators",
      "get_abs_demographics",
      "get_building_approvals",
      "get_population_projections",
    ],
  });
}
