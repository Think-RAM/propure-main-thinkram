import "dotenv/config";
import { getDomainPropertyDetailsWithScrapeDo } from "@propure/mcp-domain";
// import { logger } from "../logger";

async function main() {
  if (!process.env.SCRAPEDO_TOKEN) {
    throw new Error("Missing SCRAPEDO_TOKEN in environment");
  }

  const listingId = "level-29-82-hay-street-haymarket-nsw-2000-17842655";

  const result = await getDomainPropertyDetailsWithScrapeDo(listingId);
  console.info({ listingId, result }, "Domain property details result");
}

main().catch((err) => {
  console.error({ err }, "Error running domain search");
  process.exit(1);
});
