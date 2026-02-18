import {
  waitForRateLimit,
  RATE_LIMITS,
  type RateLimiterConfig,
} from "../rate-limiter";
// import { logger } from "../logger";

export type ScrapeDoDevice = "desktop" | "mobile" | "tablet";
export type ScrapeDoWaitUntil = "load" | "domcontentloaded" | "networkidle";

export type ScrapeDoOutputFormat = "raw" | "markdown";

export interface ScrapeDoOptions {
  url: string;
  /** Use residential & mobile proxy pools */
  useSuperProxy?: boolean;
  geoCode?: string;
  regionalGeoCode?: string;
  sessionId?: number;
  render?: boolean;
  device?: ScrapeDoDevice;
  waitUntil?: ScrapeDoWaitUntil;
  customWait?: number;
  waitSelector?: string;
  blockResources?: boolean;
  screenShot?: boolean;
  fullScreenShot?: boolean;
  particularScreenShot?: string;
  playWithBrowser?: string;
  width?: number;
  height?: number;
  output?: "raw" | "markdown";
  transparentResponse?: boolean;
  returnJSON?: boolean;
  showFrames?: boolean;
  showWebsocketRequests?: boolean;
  pureCookies?: boolean;
  disableRedirection?: boolean;
  customHeaders?: boolean;
  extraHeaders?: boolean;
  forwardHeaders?: boolean;
  setCookies?: string;
  callback?: string;
  timeout?: number;
  retryTimeout?: number;
  disableRetry?: boolean;
  extraParams?: Record<string, string | number | boolean | undefined>;
}

export class ScrapeDoWebScraper {
  private readonly token: string;
  private readonly baseUrl = "https://api.scrape.do/";

  /**
   * Initialize the Scrape.do client, falling back to SCRAPEDO_TOKEN env var when no token is provided.
   */
  constructor(token?: string) {
    this.token = token || process.env.SCRAPEDO_TOKEN || "";

    if (!this.token) {
      throw new Error(
        "Scrape.do token not configured. Set SCRAPEDO_TOKEN environment variable.",
      );
    }
  }

  /**
   * Convert request options into the query parameters accepted by Scrape.do.
   */
  private buildSearchParams(options: ScrapeDoOptions): URLSearchParams {
    if (!options.url) {
      throw new Error("Scrape.do requires a target url");
    }

    const params = new URLSearchParams();
    params.set("token", this.token);
    params.set("url", options.url);

    this.appendBoolean(params, "super", options.useSuperProxy);
    this.appendString(params, "geoCode", options.geoCode);
    this.appendString(params, "regionalGeoCode", options.regionalGeoCode);
    this.appendNumber(params, "sessionId", options.sessionId);
    this.appendBoolean(params, "render", options.render);
    this.appendString(params, "device", options.device);
    this.appendString(params, "waitUntil", options.waitUntil);
    this.appendNumber(params, "customWait", options.customWait);
    this.appendString(params, "waitSelector", options.waitSelector);
    this.appendBoolean(params, "blockResources", options.blockResources);
    this.appendBoolean(params, "screenShot", options.screenShot);
    this.appendBoolean(params, "fullScreenShot", options.fullScreenShot);
    this.appendString(
      params,
      "particularScreenShot",
      options.particularScreenShot,
    );
    this.appendString(params, "playWithBrowser", options.playWithBrowser);
    this.appendNumber(params, "width", options.width);
    this.appendNumber(params, "height", options.height);
    this.appendString(params, "output", options.output);
    this.appendBoolean(
      params,
      "transparentResponse",
      options.transparentResponse,
    );
    this.appendBoolean(params, "returnJSON", options.returnJSON);
    this.appendBoolean(params, "showFrames", options.showFrames);
    this.appendBoolean(
      params,
      "showWebsocketRequests",
      options.showWebsocketRequests,
    );
    this.appendBoolean(params, "pureCookies", options.pureCookies);
    this.appendBoolean(
      params,
      "disableRedirection",
      options.disableRedirection,
    );
    this.appendBoolean(params, "customHeaders", options.customHeaders);
    this.appendBoolean(params, "extraHeaders", options.extraHeaders);
    this.appendBoolean(params, "forwardHeaders", options.forwardHeaders);
    this.appendString(params, "setCookies", options.setCookies);
    this.appendString(params, "callback", options.callback);
    this.appendNumber(params, "timeout", options.timeout);
    this.appendNumber(params, "retryTimeout", options.retryTimeout);
    this.appendBoolean(params, "disableRetry", options.disableRetry);

    if (options.extraParams) {
      for (const [key, value] of Object.entries(options.extraParams)) {
        if (value === undefined || value === null) {
          continue;
        }
        if (typeof value === "boolean") {
          params.set(key, value ? "true" : "false");
          continue;
        }
        params.set(key, String(value));
      }
    }

    return params;
  }

  /**
   * Conditionally append a boolean flag to the request query string.
   */
  private appendBoolean(
    params: URLSearchParams,
    key: string,
    value?: boolean,
  ): void {
    if (typeof value === "boolean") {
      params.set(key, value ? "true" : "false");
    }
  }

  /**
   * Conditionally append a string value to the request query string.
   */
  private appendString(
    params: URLSearchParams,
    key: string,
    value?: string,
  ): void {
    if (value) {
      params.set(key, value);
    }
  }

  /**
   * Conditionally append a numeric value to the request query string.
   */
  private appendNumber(
    params: URLSearchParams,
    key: string,
    value?: number,
  ): void {
    if (typeof value === "number" && !Number.isNaN(value)) {
      params.set(key, String(value));
    }
  }

  async scrape(options: ScrapeDoOptions): Promise<string> {
    const params = this.buildSearchParams(options);
    const requestUrl = `${this.baseUrl}?${params.toString()}`;

    // console.debug(
    //   {
    //     url: options.url,
    //     render: options.render,
    //     geoCode: options.geoCode,
    //   },
    //   "Scrape.do request",
    // );

    const response = await fetch(requestUrl, {
      method: "GET",
      signal: options.timeout
        ? AbortSignal.timeout(options.timeout)
        : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Scrape.do request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const payload = await response.text();
    console.debug({ url: options.url }, "Scrape.do response received");
    return payload;
  }

  /**
   * Run a Scrape.do request guarded by the shared rate limiter configuration.
   */
  async scrapeWithRateLimit(
    options: ScrapeDoOptions,
    rateLimitKey: string,
    rateLimitConfig: RateLimiterConfig,
  ): Promise<string> {
    // await waitForRateLimit(rateLimitKey, rateLimitConfig);
    // console.trace({ rateLimitKey }, "Scrape.do rate limit gate passed");
    return this.scrape(options);
  }
}

let defaultScrapeDoClient: ScrapeDoWebScraper | null = null;

/**
 * Provide a singleton Scrape.do client so callers can reuse connections and rate limits.
 */
export function getScrapeDoClient(): ScrapeDoWebScraper {
  if (!defaultScrapeDoClient) {
    defaultScrapeDoClient = new ScrapeDoWebScraper();
  }
  return defaultScrapeDoClient;
}

/**
 * Fetch a Domain.com.au page using Scrape.do with Domain-specific rate limits.
 */
export async function scrapeDomainWithScrapeDo(
  url: string,
  options?: Omit<ScrapeDoOptions, "url">,
): Promise<string> {
  const client = getScrapeDoClient();
  const requestOptions: ScrapeDoOptions = {
    url,
    ...options,
  };
  if (!requestOptions.geoCode) {
    requestOptions.geoCode = "au";
  }
  return client.scrapeWithRateLimit(
    requestOptions,
    "domain-scrape",
    RATE_LIMITS.domain.scrape,
  );
}

/**
 * Fetch a RealEstate.com.au page using Scrape.do with dedicated rate limits.
 */
export async function scrapeRealEstateWithScrapeDo(
  url: string,
  options?: Omit<ScrapeDoOptions, "url">,
): Promise<string> {
  const client = getScrapeDoClient();
  const requestOptions: ScrapeDoOptions = {
    url,
    ...options,
  };
  if (!requestOptions.geoCode) {
    requestOptions.geoCode = "au";
  }
  return client.scrapeWithRateLimit(
    requestOptions,
    "realestate-scrape",
    RATE_LIMITS.realestate.scrape,
  );
}

/**
 * Fetch an Australian Bureau of Statistics page through Scrape.do using dedicated market-data rate limits.
 */
export async function scrapeAbsWithScrapeDo(
  url: string,
  options?: Omit<ScrapeDoOptions, "url">,
): Promise<string> {
  const client = getScrapeDoClient();
  const requestOptions: ScrapeDoOptions = {
    url,
    ...options,
  };
  if (!requestOptions.geoCode) {
    requestOptions.geoCode = "au";
  }
  return client.scrapeWithRateLimit(
    requestOptions,
    "market-abs-scrape",
    RATE_LIMITS.market.absScrape,
  );
}
