
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  logger,
  parseAbsMarketData,
  scrapeAbsWithScrapeDo as requestAbsWithScrapeDo,
} from "@propure/mcp-shared";
import type { MarketData } from "@propure/mcp-shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildURL(postcode: string) {
  return `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${postcode}`;
}

interface ScrapeAbsResult extends Record<string, unknown> {
  url: string;
  marketData: MarketData;
  referencePath?: string;
}

/**
 * Fetch ABS quick stats HTML via Scrape.do, persist it as a reference artifact,
 * and return the parsed market data breakdowns.
 */
export async function scrapeABSWithScrapeDo(
  postcode: string,
): Promise<ScrapeAbsResult> {
  const url = buildURL(postcode);
  try {
    logger.info({ url, postcode }, "Scraping ABS quick stats page");
    const html = await requestAbsWithScrapeDo(url);

    const marketData = parseAbsMarketData(html);
    if (!marketData) {
      throw new Error("Failed to parse ABS market data from fetched HTML");
    }

    let referencePath: string | undefined;
    const shouldPersistReference =
      process.env.SAVE_ABS_REFERENCE === "true";
      

    if (shouldPersistReference) {
      const referenceDir = path.join(
        __dirname,
        "../reference/abs",
      );
      await fs.mkdir(referenceDir, { recursive: true });

      referencePath = path.join(referenceDir, `POA${postcode}.html`);
      await fs.writeFile(referencePath, html, "utf8");
      logger.info({ referencePath }, "Saved ABS HTML reference");
    } else {
      logger.debug(
        {
          postcode,
        },
        "Skipping ABS reference persistence (SAVE_ABS_REFERENCE != 'true')",
      );
    }

    return { url, referencePath, marketData };
  } catch (error) {
    logger.error({ err: error, url, postcode }, "Failed to scrape ABS page");
    throw error;
  }
}
