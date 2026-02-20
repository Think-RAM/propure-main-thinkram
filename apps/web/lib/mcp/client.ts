/**
 * MCP Client Factory
 *
 * Provides HTTP clients for calling MCP servers (Domain, RealEstate, Market Data).
 * Used by both Inngest background jobs and AI agents.
 */

export type McpServer = "domain" | "realestate" | "market";

const MCP_ENDPOINTS: Record<McpServer, string> = {
  domain: process.env.MCP_DOMAIN_URL || "/api/mcp/domain",
  realestate: process.env.MCP_REALESTATE_URL || "/api/mcp/realestate",
  market: process.env.MCP_MARKET_URL || "/api/mcp/market",
};

interface McpToolCallOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface McpResponse<T> {
  result?: T;
  error?: string;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network errors, 5xx status codes, rate limits)
 */
function isRetryableError(error: unknown, statusCode?: number): boolean {
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  // Retry on 5xx server errors
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return true;
  }
  // Retry on rate limit (429 Too Many Requests)
  if (statusCode === 429) {
    return true;
  }
  // Retry on timeout/abort
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  return false;
}

/**
 * Parse rate limit headers to determine retry delay
 * Supports: Retry-After, X-RateLimit-Reset, RateLimit-Reset
 */
function parseRetryAfterMs(response: Response): number | null {
  // Check Retry-After header (standard)
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) {
    // Try parsing as seconds
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
    // Try parsing as HTTP date
    const date = Date.parse(retryAfter);
    if (!isNaN(date)) {
      return Math.max(0, date - Date.now());
    }
  }

  // Check X-RateLimit-Reset (Unix timestamp)
  const rateLimitReset =
    response.headers.get("X-RateLimit-Reset") ||
    response.headers.get("RateLimit-Reset");
  if (rateLimitReset) {
    const resetTime = parseInt(rateLimitReset, 10);
    if (!isNaN(resetTime)) {
      // If it's a small number, treat as seconds from now
      // If it's a large number, treat as Unix timestamp
      if (resetTime > 1000000000) {
        return Math.max(0, resetTime * 1000 - Date.now());
      }
      return resetTime * 1000;
    }
  }

  return null;
}

/**
 * Get the full URL for an MCP endpoint
 */
function getEndpointUrl(server: McpServer): string {
  const endpoint = MCP_ENDPOINTS[server];
  // If it's a relative path, we need the base URL
  if (endpoint.startsWith("/")) {
    // VERCEL_URL doesn't include protocol, so we need to add https://
    const vercelUrl = process.env.VERCEL_URL;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (vercelUrl ? `https://${vercelUrl}` : null) ||
      "http://localhost:3000";
    return `${baseUrl.replace(/\/$/, "")}${endpoint}`;
  }
  return endpoint;
}

/**
 * Get auth headers for MCP requests
 */
function getAuthHeaders(): Record<string, string> {
  const token = process.env.MCP_INTERNAL_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Call an MCP tool directly via HTTP with retry logic
 *
 * @param server - Which MCP server to call (domain, realestate, market)
 * @param toolName - The name of the tool to call
 * @param args - Arguments to pass to the tool
 * @param options - Optional configuration (timeout, retries, etc.)
 * @returns The tool result
 *
 * @example
 * ```ts
 * const listings = await callMcpTool('domain', 'search_properties', {
 *   suburbs: ['Parramatta'],
 *   state: 'NSW',
 *   listingType: 'sale'
 * });
 * ```
 */
export async function callMcpTool<T = unknown>(
  server: McpServer,
  toolName: string,
  args: Record<string, unknown> = {},
  options: McpToolCallOptions = {},
): Promise<T> {
  const url = getEndpointUrl(server);
  const timeout = options.timeout || 30000;
  const maxRetries = options.maxRetries ?? 3;
  const baseRetryDelay = options.retryDelay || 1000;

  // Generate a short request ID for tracing retries in logs
  const requestId = Math.random().toString(36).substring(2, 10);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tool: toolName,
          arguments: args,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const statusCode = response.status;
        let errorMessage: string;

        try {
          const errorData = (await response.json()) as { error?: string };
          errorMessage =
            errorData.error || `MCP call failed with status ${statusCode}`;
        } catch {
          errorMessage = `MCP call failed with status ${statusCode}`;
        }

        const error = new Error(errorMessage);

        // Check if we should retry
        if (isRetryableError(error, statusCode) && attempt < maxRetries - 1) {
          lastError = error;
          // Use Retry-After header if available, otherwise exponential backoff
          const retryAfterMs = parseRetryAfterMs(response);
          const delay =
            retryAfterMs !== null
              ? Math.min(retryAfterMs, 60000) // Cap at 60 seconds
              : baseRetryDelay * Math.pow(2, attempt);
          console.warn(
            `[${requestId}] MCP call to ${server}/${toolName} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
          );
          await sleep(delay);
          continue;
        }

        throw error;
      }

      const data = (await response.json()) as McpResponse<T>;
      if (data.error) {
        throw new Error(data.error);
      }

      return data.result as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if we should retry
      if (isRetryableError(error) && attempt < maxRetries - 1) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const delay = baseRetryDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(
          `[${requestId}] MCP call to ${server}/${toolName} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  // Should not reach here, but just in case
  throw (
    lastError || new Error(`[${requestId}] MCP call failed after all retries`)
  );
}

/**
 * Call an MCP tool using JSON-RPC protocol
 *
 * @param server - Which MCP server to call
 * @param toolName - The name of the tool to call
 * @param args - Arguments to pass to the tool
 * @returns The tool result
 */
export async function callMcpToolJsonRpc<T = unknown>(
  server: McpServer,
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const url = getEndpointUrl(server);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP JSON-RPC call failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    result?: { content: { type: string; text: string }[] };
    error?: { code: number; message: string };
  };

  if (data.error) {
    throw new Error(`MCP error ${data.error.code}: ${data.error.message}`);
  }

  // Parse the JSON from the text content
  const textContent = data.result?.content?.find((c) => c.type === "text");
  if (textContent) {
    return JSON.parse(textContent.text) as T;
  }

  throw new Error("No text content in MCP response");
}

/**
 * List available tools from an MCP server
 */
export async function listMcpTools(
  server: McpServer,
): Promise<{ name: string; description: string }[]> {
  const url = getEndpointUrl(server);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/list",
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to list tools: ${response.status}`);
  }

  const data = (await response.json()) as {
    result?: { tools: { name: string; description: string }[] };
  };
  return data.result?.tools || [];
}

/**
 * Check if an MCP server is healthy
 */
export async function checkMcpHealth(
  server: McpServer,
): Promise<{ status: string; server: string; version: string }> {
  const url = getEndpointUrl(server);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Type-safe Tool Wrappers
// ============================================================================

import type {
  AustralianState,
  ListingType,
  MarketData,
} from "@propure/mcp-shared";
import type {
  PropertyListing,
  PropertySearchParams,
  SuburbStats,
  Agent,
  Agency,
  SaleRecord,
  AuctionResult,
} from "@propure/mcp-shared";

/**
 * Response shape from searchProperties tools (Domain and RealEstate)
 */
export interface PropertySearchResponse {
  listings: PropertyListing[];
  totalCount: number;
  hasMore: boolean;
}

// Domain Tools
export const domainTools = {
  searchProperties: (params: PropertySearchParams) =>
    callMcpTool<PropertySearchResponse>("domain", "scrape_domain", params),

  getPropertyDetails: (listingId: string, listingType: ListingType = "sale") =>
    callMcpTool<PropertyListing | null>("domain", "get_property_details", {
      listingId,
      listingType,
    }),
};

// RealEstate Tools
export const realestateTools = {
  searchProperties: (params: PropertySearchParams) =>
    callMcpTool<PropertySearchResponse>(
      "realestate",
      "scrape_realestate",
      params,
    ),

  getPropertyDetails: (listingId: string) =>
    callMcpTool<PropertyListing | null>("realestate", "get_property_details", {
      listingId,
    }),
};

// Market Data Tools
export const marketTools = {
  scrapeAbs: (postcode: string) =>
    callMcpTool<{ url: string; marketData: MarketData }>(
      "market",
      "scrape_abs",
      {
        postcode,
      },
    ),
};
