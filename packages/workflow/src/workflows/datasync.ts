import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import type { Doc } from "@propure/convex/genereated";
import { searchDomainPropertiesWithScrapeDo } from "@propure/mcp-domain";
import { start } from "workflow/api";

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
    // pageSize: 20,/
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

// Parameterised step: scrape a single listingType for a location. Kept as a
// "use step" so the workflow runtime can retry network/parsing failures.
type ListingType = "rent" | "sold" | "sale";

async function scrapeTypeStep(
  loc: ScrappingLocationWithStatus,
  listingType: ListingType,
) {
  "use step";

  return await searchDomainPropertiesWithScrapeDo({
    suburbs: [loc.suburb],
    state: loc.state as any,
    postcode: loc.postcode,
    page: 1,
    listingType,
    // pageSize: 20,
  });
}

// Workflow wrapper per listing type. This is a workflow so each listing-type
// run gets its own workflow trace but still uses step-level scrape/upsert so
// retries are isolated and atomic.
export async function processLocationListingTypeWorkflow(
  loc: ScrappingLocationWithStatus,
  listingType: ListingType,
): Promise<{
  listingType: ListingType;
  success: boolean;
  listingsCount?: number;
  error?: string;
}> {
  "use workflow";

  try {
    const scrapeResult = await scrapeTypeStep(loc, listingType);
    const listings = (scrapeResult as any).listings ?? [];

    if (listings.length > 0) {
      await upsertListings(listings);
    }

    return { listingType, success: true, listingsCount: listings.length };
  } catch (err: any) {
    console.error(
      `Listing-type workflow failed for ${loc.suburb} (${listingType}):`,
      err,
    );
    return { listingType, success: false, error: String(err) };
  }
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
  // start(processPendingLocations, [locations]);

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
  // const records: any = [];

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

  // return records.map((location: any) => ({ ...location, status: "pending" }));
  return records.map((location) => ({ ...location, status: "pending" }));
}

async function processPendingLocations(
  locations: ScrappingLocationWithStatus[],
) {
  "use workflow";

  const pending = locations.filter((l) => l.status === "pending");

  for (const loc of pending) {
    try {
      // Run three listing-type workflows in parallel (rent, sold, sale).
      // Each listing-type workflow uses step-level scrape/upsert so retries
      // remain atomic. We use strict completion: only mark completed when
      // all three listing-type workflows succeed.
      const types: ListingType[] = ["rent", "sold", "sale"];
      // const types: ListingType[] = ["sold"];
      const promises = types.map(
        (t) => processLocationListingTypeWorkflow(loc, t),
        // start(processLocationListingTypeWorkflow, [loc, t]),
      );

      const settled = await Promise.allSettled(promises);

      const results = settled.map((s) =>
        s.status === "fulfilled"
          ? s.value
          : { success: false, error: String((s as any).reason) },
      );

      // Log per-type results and determine overall success
      let allSucceeded = true;
      results.forEach((r: any) => {
        if (r.success) {
          console.info(
            `Processed ${loc.suburb} - ${r.listingType}: ${r.listingsCount} listings`,
          );
        } else {
          allSucceeded = false;
          console.error(`Failed ${loc.suburb} - ${r.listingType}: ${r.error}`);
        }
      });

      if (allSucceeded) {
        loc.status = "completed";
      } else {
        // leave status pending for strict retry semantics
        console.info(
          `Location ${loc.suburb} left pending due to failures in one or more listing-type workflows`,
        );
      }
    } catch (error) {
      console.error(`Failed to process location ${loc.suburb}:`, error);
      // leave status pending so it can be retried later
    }
  }
}
