// First step for the marketdata workflow: fetch scrapping locations

import { client } from "@propure/convex/client";
import { api, Doc } from "@propure/convex/genereated";
import { getAbsDemographics } from "@propure/mcp-market-data";
import { MarketData } from "@propure/mcp-shared";

type ScrappingLocationRecord = Doc<"scrapping_locations">;

type ScrappingLocationWithStatus = ScrappingLocationRecord & {
  status: "pending" | "done" | "failed";
};

// client and api are expected to be available in the workflow runtime/global scope
// (the same ones used by other workflow steps in this package).
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

  return records.map((location) => ({ ...location, status: "pending" }));
  // return records.map((location: any) => ({ ...location, status: "pending" }));
}

export type DemographicCallResult = {
  location: ScrappingLocationWithStatus;
  success: boolean;
  marketData?: MarketData;
  url?: string;

  error?: string;
};

const START_YEAR = 2021;

// Step: call ABS demographics sequentially for all locations
export async function fetchDemographicsForLocations(
  locations: ScrappingLocationWithStatus[],
): Promise<DemographicCallResult[]> {
  "use step";

  const results: DemographicCallResult[] = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const postcode = loc.postcode;

    if (!postcode) {
      console.warn("Skipping location without postcode:", loc);
      results.push({
        location: loc,
        success: false,
        error: "missing postcode",
      });
      continue;
    }

    try {
      console.info(
        `Fetching ABS demographics for postcode=${postcode} (${i + 1}/${locations.length})`,
      );

      const yearList = [
        START_YEAR,
        // START_YEAR - 5,
        // START_YEAR - 10,
        // START_YEAR - 15,
      ]; // Can be extended to fetch multiple years if needed

      for (const year of yearList) {
        const { url, referencePath, marketData } = await getAbsDemographics(
          postcode,
          year,
        );
        results.push({
          location: loc,
          success: true,
          marketData,
        });
        console.info(`Fetched ABS demographics for postcode=${postcode}`);
      }
    } catch (err: any) {
      console.error(`ABS fetch failed for postcode=${postcode}:`, err);
      results.push({ location: loc, success: false, error: String(err) });
    }
  }

  return results;
}

// Persist demographic results into Convex using upsertAbsMarketData
export async function persistDemographics(
  results: DemographicCallResult[],
): Promise<void> {
  "use step";

  for (const res of results) {
    const { location, marketData } = res;
    if (!marketData) {
      console.warn(
        `Skipping persist for postcode=${location.postcode} due to previous error: `,
      );
      continue;
    }

    try {
      // Call Convex mutation to upsert the record. client and api are expected
      // to be available in the workflow runtime scope.
      const rec = await client.mutation(
        api.functions.absMarketData.upsertAbsMarketData,
        {
          ...marketData,
          census_year: BigInt(marketData.census_year),
          postcode: location.postcode,
          suburb: location.suburb,
          state: location.state,
        },
      );

      console.info(
        `Persisted ABS market data for postcode=${location.postcode}`,
        rec,
      );
    } catch (err) {
      console.error(
        `Failed to persist ABS market data for postcode=${location.postcode}:`,
        err,
      );
    }
  }
}

// Top-level workflow that invokes the first step. No input and no return
// per the request — it simply triggers the step and lets downstream
// planning/steps handle the data.
export async function marketDataWorkflow(): Promise<void> {
  "use workflow";

  try {
    const locations = await fetchScrappingLocations();
    // console.info(`marketDataWorkflow: fetched ${locations.length} locations`);

    // Next step: fetch demographics sequentially for each location
    const demographicResults = await fetchDemographicsForLocations(locations);
    // console.info(
    //   `marketDataWorkflow: fetched demographics for ${demographicResults.length} locations`,
    // );

    

    // Persist each demographic result into Convex
    await persistDemographics(demographicResults);
    
  } catch (err) {
    console.error("marketDataWorkflow failed:", err);
  }
}
