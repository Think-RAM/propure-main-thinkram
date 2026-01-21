import "dotenv/config";
import { searchReaProperties } from "../scrapers/rea-scraper";
import type { PropertySearchParams } from "@propure/mcp-shared";

async function runTest() {
  console.log("Starting RealEstate scrape test...");

  // Scenario 1: Sale: suburb + state + price + beds
  const params: PropertySearchParams = {
    suburbs: ["Bondi Beach"],
    state: "NSW",
    postcode: "2026",
    
    listingType: "sale",
    page: 1,
  };

  try {
    console.log(
      "Calling searchReaProperties with params:",
      JSON.stringify(params, null, 2),
    );
    const result = await searchReaProperties(params);

    console.log("Scrape completed successfully!");
    console.log("Listings found:", result.listings.length);
    console.log("Has more pages:", result.hasMore);
    console.log("Total count:", result.totalCount);
    console.log(
      "\nNOTE: Listings should be empty (0) because parsing is currently commented out.",
    );
    console.log(
      "Check 'packages/mcp-realestate/reference/rea-search-results.html' for the raw output.",
    );
  } catch (error) {
    console.error("Error running test:", error);
  }
}

runTest();
