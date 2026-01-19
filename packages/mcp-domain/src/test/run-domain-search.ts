import "dotenv/config";
import { searchDomainProperties } from "@propure/mcp-domain";

async function main() {
  if (!process.env.OXYLABS_USERNAME || !process.env.OXYLABS_PASSWORD) {
    throw new Error(
      "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD in environment",
    );
  }

  const result = await searchDomainProperties({
    listingType: "sale",
    suburbs: ["Sydney"],
    state: "NSW",
    page: 1,
    postcode: "2000",
  });
  // "sydney-nsw-2000"

  // console.log("Domain search result: ", result);

  const listings = result.listings ?? [];
  if (listings.length === 0) {
    console.log("No listings returned.");
    return;
  }

  console.log("Listings count:", listings.length);
  console.log("Listing", listings[0]);
  // console.log("Listing:");
  // console.dir(listings, { depth: Infinity });
}

main().catch((err) => {
  console.error("Error running domain search:", err);
  process.exit(1);
});
