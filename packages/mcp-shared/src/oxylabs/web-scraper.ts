import {
  waitForRateLimit,
  RATE_LIMITS,
  type RateLimiterConfig,
} from "../rate-limiter";
// import { logger } from "../logger";

export interface WebScraperOptions {
  url: string;
  geoLocation?: string;
  parse?: boolean;
  timeout?: number;
}

export interface WebScraperResponse {
  results: Array<{
    content: string;
    status_code: number;
    url: string;
  }>;
}

export class OxylabsWebScraper {
  private readonly username: string;
  private readonly password: string;
  private readonly baseUrl = "https://realtime.oxylabs.io/v1/queries";

  constructor(username?: string, password?: string) {
    this.username = username || process.env.OXYLABS_USERNAME || "";
    this.password = password || process.env.OXYLABS_PASSWORD || "";
    console.debug({ username: this.username }, "OxylabsWebScraper username");
    console.debug("OxylabsWebScraper password resolved from env");
    if (!this.username || !this.password) {
      throw new Error(
        "Oxylabs credentials not configured. Set OXYLABS_USERNAME and OXYLABS_PASSWORD environment variables."
      );
    }
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.username}:${this.password}`
    ).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Scrape a URL using Oxylabs Web Scraper API
   */
  async scrape(options: WebScraperOptions): Promise<string> {
    console.info({ url: options.url }, "Oxylabs scrape request");

    const response = await fetch(this.baseUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify({
        url: options.url,
        source: "universal",
        geo_location: options.geoLocation || "Australia",
        parse: options.parse ?? false,
      }),
      signal: options.timeout
        ? AbortSignal.timeout(options.timeout)
        : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Oxylabs Web Scraper request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as WebScraperResponse;

    if (!data.results || data.results.length === 0) {
      throw new Error("Oxylabs Web Scraper returned no results");
    }

    const result = data.results[0];
    if (result.status_code !== 200) {
      throw new Error(`Target site returned status ${result.status_code}`);
    }

    return result.content;
  }

  /**
   * Scrape with rate limiting applied
   */
  async scrapeWithRateLimit(
    options: WebScraperOptions,
    rateLimitKey: string,
    rateLimitConfig: RateLimiterConfig
  ): Promise<string> {
    await waitForRateLimit(rateLimitKey, rateLimitConfig);
    return this.scrape(options);
  }
}

// Singleton instance for convenience
let defaultScraperClient: OxylabsWebScraper | null = null;

export function getOxylabsWebScraperClient(): OxylabsWebScraper {
  if (!defaultScraperClient) {
    defaultScraperClient = new OxylabsWebScraper();
  }
  return defaultScraperClient;
}

/**
 * Scrape Domain.com.au with Web Scraper API and appropriate rate limiting
 */
export async function scrapeDomainWithWebScraper(url: string): Promise<string> {
  const client = getOxylabsWebScraperClient();
  return client.scrapeWithRateLimit(
    { url, geoLocation: "Australia" },
    "domain-scrape",
    RATE_LIMITS.domain.scrape
  );
}

/**
 * Scrape RealEstate.com.au with Web Scraper API and appropriate rate limiting
 */
export async function scrapeRealEstateWithWebScraper(
  url: string
): Promise<string> {
  const client = getOxylabsWebScraperClient();
  return client.scrapeWithRateLimit(
    { url, geoLocation: "Australia" },
    "realestate-scrape",
    RATE_LIMITS.realestate.scrape
  );
}
