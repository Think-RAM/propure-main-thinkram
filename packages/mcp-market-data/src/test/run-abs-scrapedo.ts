import "dotenv/config";
import fs from "fs/promises";
import { logger } from "@propure/mcp-shared";
import { scrapeABSWithScrapeDo } from "../sources/scrape-abs";

/**
 * Execute the ABS Scrape.do workflow for postcode 2000 and verify the reference artifact exists.
 */
async function main(): Promise<void> {
  if (!process.env.SCRAPEDO_TOKEN) {
    throw new Error("Missing SCRAPEDO_TOKEN in environment");
  }

  const postcode = "2000";
  const { referencePath } = await scrapeABSWithScrapeDo(postcode);

  const exists = await fileExists(referencePath);
  if (!exists) {
    throw new Error(`Reference file not found at ${referencePath}`);
  }

  logger.info({ referencePath }, "ABS reference HTML verified");
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    logger.warn({ targetPath, error }, "Reference file access failed");
    return false;
  }
}

main().catch((err) => {
  logger.error({ err }, "ABS Scrape.do test failed");
  process.exit(1);
});
