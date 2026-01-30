import type { PropertySearchParams } from "@propure/mcp-shared";
import { domainTools, type PropertySearchResponse } from "@/lib/mcp/client";

interface DomainScrapeWorkflowInput {
  searches?: PropertySearchParams[];
}

interface DomainScrapeWorkflowResult {
  jobCount: number;
  jobs: Array<{
    params: PropertySearchParams;
    listingsReturned: number;
    totalCount: number;
    hasMore: boolean;
  }>;
}

const DEFAULT_SEARCHES: PropertySearchParams[] = [
  {
    suburbs: ["Sydney"],
    state: "NSW",
    listingType: "sale",
    minBeds: 2,
    page: 1,
  },
];

function getConfiguredSearches(): PropertySearchParams[] {
  const raw = process.env.DOMAIN_SCRAPE_SEARCHES;
  if (!raw) {
    return DEFAULT_SEARCHES;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    console.warn(
      "DOMAIN_SCRAPE_SEARCHES did not contain an array. Falling back to defaults.",
    );
  } catch (error) {
    console.error("Failed to parse DOMAIN_SCRAPE_SEARCHES", error);
  }

  return DEFAULT_SEARCHES;
}

export async function domainScrapeWorkflow(
  input: DomainScrapeWorkflowInput = {},
): Promise<DomainScrapeWorkflowResult> {
  "use workflow";

  const searches = input.searches?.length
    ? input.searches
    : getConfiguredSearches();

  const jobs: DomainScrapeWorkflowResult["jobs"] = [];

  for (const params of searches) {
    const data = await runDomainScrape(params);
    jobs.push({
      params,
      listingsReturned: data.listings.length,
      totalCount: data.totalCount,
      hasMore: data.hasMore,
    });
  }

  return {
    jobCount: jobs.length,
    jobs,
  };
}

async function runDomainScrape(
  params: PropertySearchParams,
): Promise<PropertySearchResponse> {
  "use step";
  return domainTools.searchProperties(params);
}
