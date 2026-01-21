import "dotenv/config";
import { searchDomainPropertiesWithScrapeDo } from "@propure/mcp-domain";
import fs from "fs/promises";
import path from "path";
import { logger } from "../logger";

async function main() {
  if (!process.env.SCRAPEDO_TOKEN) {
    throw new Error("Missing SCRAPEDO_TOKEN in environment");
  }

  const result = await searchDomainPropertiesWithScrapeDo({
    listingType: "sale",
    suburbs: ["Sydney"],
    state: "NSW",
    page: 1,
    postcode: "2000",
  });

  const listings = result.listings ?? [];
  if (listings.length === 0) {
    logger.warn("No listings returned.");
    return;
  }

  logger.info({ count: listings.length }, "Listings count");
  logger.info({ listing: listings[0] }, "Listing preview");

  const referenceDir = path.join(
    process.cwd(),
    "packages/mcp-domain/reference",
  );
  await fs.mkdir(referenceDir, { recursive: true });

  const outputPath = path.join(referenceDir, "output-scrapedo.json");
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  logger.info({ outputPath }, "Saved output to file");
}

main().catch((err) => {
  logger.error({ err }, "Error running Scrape.do domain search");
  process.exit(1);
});
