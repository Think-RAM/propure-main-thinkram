import { client } from "@propure/convex/client";
import { api } from "@propure/convex/api";
import type { Doc } from "@propure/convex/dataModel";
import { searchDomainPropertiesWithScrapeDo } from "@propure/mcp-domain";

// Step wrapper: scrape a single location. Marked with "use step" so the
// workflow compiler treats it as an atomic, retryable operation.
async function scrapeLocation(loc: ScrappingLocationWithStatus) {
  "use step";

  return await searchDomainPropertiesWithScrapeDo({
    suburbs: [loc.suburb],
    state: loc.state as any,
    postcode: loc.postcode,
    page: 1,
    listingType: "sale",
    pageSize: 20,
  });
}

// Step wrapper: upsert listings into Convex. Also marked with "use step" so
// upserts are retried on transient failures by the workflow runtime.
async function upsertListings(listings: any[]) {
  "use step";

  return await client.mutation(api.functions.properties.bulkUpsertProperties, {
    listings,
  });
}

// We will call convex properties.bulkUpsertProperties to insert listings

type ScrappingLocationRecord = Doc<"scrapping_locations">;

export type ScrappingStatus = "pending" | "completed";

export interface ScrappingLocationWithStatus extends ScrappingLocationRecord {
  status: ScrappingStatus;
}

export interface DataSyncWorkflowResult {
  locations: ScrappingLocationWithStatus[];
  totalLocations: number;
  fetchedAt: string;
}

export async function datasyncWorkflow(): Promise<DataSyncWorkflowResult> {
  "use workflow";

  // Step 1: load locations and keep status in-memory only
  const locations = await fetchScrappingLocations();

  // Process only pending locations
  await processPendingLocations(locations);

  return {
    locations,
    totalLocations: locations.length,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchScrappingLocations(): Promise<
  ScrappingLocationWithStatus[]
> {
  "use step";

  const records = (await client.query(
    api.functions.scrapingLocations.listAll,
    {},
  )) as ScrappingLocationRecord[];

  // If there are no configured scrapping locations in Convex, fall back to
  // a single default location used by the MCP-domain test script so the
  // workflow can run once for verification.
  if (!records || records.length === 0) {
    console.info(
      "No scrapping locations found — falling back to default location (Sydney, NSW, 2000)",
    );

    const defaultRecord = {
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
    } as unknown as ScrappingLocationRecord;

    return [{ ...defaultRecord, status: "pending" }];
  }

  return records.map((location) => ({ ...location, status: "pending" }));
}

async function processPendingLocations(
  locations: ScrappingLocationWithStatus[],
) {
  "use workflow";

  const pending = locations.filter((l) => l.status === "pending");

  for (const loc of pending) {
    try {
      // Scrape the location using the dedicated step function
      const scrapeResult = await scrapeLocation(loc);
      const listings = (scrapeResult as any).listings ?? [];

      if (listings.length > 0) {
        try {
          await upsertListings(listings);
        } catch (err) {
          console.error("Failed to upsert listings for", loc, err);
          continue; // leave status pending
        }
      }

      // Mark in-memory status as completed
      loc.status = "completed";
    } catch (error) {
      console.error(`Failed to process location ${loc.suburb}:`, error);
      // leave status pending so it can be retried later
    }
  }
}
