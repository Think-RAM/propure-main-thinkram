import "dotenv/config";
import {
  getDomainPropertyDetails,
  searchDomainProperties,
} from "@propure/mcp-domain";

async function main() {
  if (!process.env.OXYLABS_USERNAME || !process.env.OXYLABS_PASSWORD) {
    throw new Error(
      "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD in environment",
    );
  }

  const listingId = "level-29-82-hay-street-haymarket-nsw-2000-17842655";

  const result = await getDomainPropertyDetails(listingId);

  console.log("Domain search result: ", result);
}

main().catch((err) => {
  console.error("Error running domain search:", err);
  process.exit(1);
});
