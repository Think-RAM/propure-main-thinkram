declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Shared Scrape.do token for ABS/Domain scrapers */
      SCRAPEDO_TOKEN?: string;
      /** Optional flag to persist fetched ABS HTML */
      SAVE_ABS_REFERENCE?: "true" | "false";
      /** Enables mock response mode across MCP services */
      MCP_MOCK_MODE?: "true" | "false";
      /** Standard Node environment indicator used by loggers */
      NODE_ENV?: "development" | "production" | "test";
      /** Overrides logger verbosity */
      LOG_LEVEL?: string;
      /** Oxylabs credential for scraper clients */
      OXYLABS_USERNAME?: string;
      /** Oxylabs credential for scraper clients */
      OXYLABS_PASSWORD?: string;
    }
  }
}

export {};
