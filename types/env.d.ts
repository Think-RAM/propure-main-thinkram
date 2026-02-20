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
      /** Convex deployment identifier (team:project) */
      CONVEX_DEPLOYMENT?: string;
      /** Base URL for Convex deployment */
      CONVEX_URL?: string;
      /** Neon/Postgres connection string */
      DATABASE_URL?: string;
      /** Clerk publishable key for frontend */
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
      /** Clerk secret API key */
      CLERK_SECRET_KEY?: string;
      /** Clerk sign-in route */
      NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
      /** Clerk sign-up route */
      NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
      /** Post sign-in redirect */
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL?: string;
      /** Post sign-up redirect */
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL?: string;
      /** Issuer domain for Clerk JWTs */
      CLERK_JWT_ISSUER_DOMAIN?: string;
      /** Stripe secret key */
      STRIPE_SECRET_KEY?: string;
      /** Stripe webhook signing secret */
      STRIPE_WEBHOOK_SECRET?: string;
      /** Stripe publishable key exposed to frontend */
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      /** Google Maps key (legacy) */
      GOOGLE_MAPS_API_KEY?: string;
      /** Google Generative AI API key */
      GOOGLE_GENERATIVE_AI_API_KEY?: string;
      /** Inngest event key */
      INNGEST_EVENT_KEY?: string;
      /** Inngest signing key */
      INNGEST_SIGNING_KEY?: string;
    }
  }
}

export {};
