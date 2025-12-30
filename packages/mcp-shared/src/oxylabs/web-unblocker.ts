import {
  waitForRateLimit,
  RATE_LIMITS,
  type RateLimiterConfig,
} from "../rate-limiter";

export interface WebUnblockerOptions {
  url: string;
  render?: "html" | "png";
  geoLocation?: string;
  parseJs?: boolean;
  timeout?: number;
}

export interface WebUnblockerResponse {
  results: Array<{
    content: string;
    status_code: number;
    url: string;
  }>;
}

export class OxylabsWebUnblocker {
  private readonly username: string;
  private readonly password: string;
  private readonly baseUrl = "https://unblock.oxylabs.io/v1/queries";

  constructor(username?: string, password?: string) {
    this.username = username || process.env.OXYLABS_USERNAME || "";
    this.password = password || process.env.OXYLABS_PASSWORD || "";

    if (!this.username || !this.password) {
      throw new Error(
        "Oxylabs credentials not configured. Set OXYLABS_USERNAME and OXYLABS_PASSWORD environment variables.",
      );
    }
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Scrape a URL using Oxylabs Web Unblocker
   */
  async scrape(options: WebUnblockerOptions): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify({
        url: options.url,
        source: "universal",
        render: options.render || "html",
        geo_location: options.geoLocation || "Australia",
        parse: options.parseJs ?? false,
      }),
      signal: options.timeout
        ? AbortSignal.timeout(options.timeout)
        : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Oxylabs request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as WebUnblockerResponse;

    if (!data.results || data.results.length === 0) {
      throw new Error("Oxylabs returned no results");
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
    options: WebUnblockerOptions,
    rateLimitKey: string,
    rateLimitConfig: RateLimiterConfig,
  ): Promise<string> {
    await waitForRateLimit(rateLimitKey, rateLimitConfig);
    return this.scrape(options);
  }
}

// Singleton instance for convenience
let defaultClient: OxylabsWebUnblocker | null = null;

export function getOxylabsClient(): OxylabsWebUnblocker {
  if (!defaultClient) {
    defaultClient = new OxylabsWebUnblocker();
  }
  return defaultClient;
}

/**
 * Scrape Domain.com.au with appropriate rate limiting
 */
export async function scrapeDomain(url: string): Promise<string> {
  const client = getOxylabsClient();
  return client.scrapeWithRateLimit(
    { url, render: "html", geoLocation: "Australia" },
    "domain-scrape",
    RATE_LIMITS.domain.scrape,
  );
}

/**
 * Scrape RealEstate.com.au with appropriate rate limiting
 */
export async function scrapeRealEstate(url: string): Promise<string> {
  const client = getOxylabsClient();
  return client.scrapeWithRateLimit(
    { url, render: "html", geoLocation: "Australia" },
    "realestate-scrape",
    RATE_LIMITS.realestate.scrape,
  );
}
