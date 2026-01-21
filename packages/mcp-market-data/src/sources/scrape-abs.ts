
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  logger,
  scrapeAbsWithScrapeDo as requestAbsWithScrapeDo,
} from "@propure/mcp-shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildURL(postcode: string) {
  return `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${postcode}`;
}

/**
 * Fetch ABS quick stats HTML via Scrape.do and persist it as a reference artifact.
 * Saves the resulting HTML under packages/mcp-market-data/src/reference/abs/.
 */
export async function scrapeABSWithScrapeDo(postcode: string) {
  const url = buildURL(postcode);
  try {
    logger.info({ url, postcode }, "Scraping ABS quick stats page");
    const html = await requestAbsWithScrapeDo(url);

    const referenceDir = path.join(
      __dirname,
      "../reference/abs",
    );
    await fs.mkdir(referenceDir, { recursive: true });

    const referencePath = path.join(referenceDir, `POA${postcode}.html`);
    await fs.writeFile(referencePath, html, "utf8");
    logger.info({ referencePath }, "Saved ABS HTML reference");

    return { url, referencePath };
  } catch (error) {
    logger.error({ err: error, url, postcode }, "Failed to scrape ABS page");
    throw error;
  }
}
