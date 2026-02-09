import "dotenv/config";
// import { logger } from "@propure/mcp-shared";
import { getAbsDemographics } from "../sources/abs-api";

/**
 * Execute the ABS Scrape.do workflow for postcode 2000 and verify the reference artifact exists.
 */
async function main(): Promise<void> {
  if (!process.env.SCRAPEDO_TOKEN) {
    throw new Error("Missing SCRAPEDO_TOKEN in environment");
  }

  const postcode = "2000";
  const { referencePath, marketData } = await getAbsDemographics(postcode);

  if (!marketData || marketData.people.length === 0) {
    throw new Error("Parsed ABS market data is empty");
  }

  console.info(
    {
      referencePath: referencePath ?? "not saved",
      sample: {
        people: marketData.people.slice(0, 2),
        tenureType: marketData.tenureType,
      },
    },
    "ABS reference HTML and market data verified",
  );
}

main().catch((err) => {
  console.error({ err }, "ABS Scrape.do test failed");
  process.exit(1);
});
