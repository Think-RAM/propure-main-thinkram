declare module "@propure/mcp-domain" {
  // Minimal typing for the MCP domain exports we consume in the workflow.
  export function searchDomainPropertiesWithScrapeDo(
    params: Record<string, unknown>,
  ): Promise<{ listings?: any[]; totalCount?: number; hasMore?: boolean }>;
}
