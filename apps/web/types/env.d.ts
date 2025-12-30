namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;

    // Authentication (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    CLERK_SECRET_KEY?: string;

    // AI (Google Gemini)
    GOOGLE_GENERATIVE_AI_API_KEY?: string;

    // Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;

    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Inngest
    INNGEST_EVENT_KEY?: string;
    INNGEST_SIGNING_KEY?: string;

    // Oxylabs Web Unblocker
    OXYLABS_USERNAME?: string;
    OXYLABS_PASSWORD?: string;

    // MCP Configuration
    MCP_INTERNAL_TOKEN?: string;
    MCP_DOMAIN_URL?: string;
    MCP_REALESTATE_URL?: string;
    MCP_MARKET_URL?: string;
    MCP_MOCK_MODE?: string; // Set to "true" to use mock data

    // Application
    NEXT_PUBLIC_APP_URL?: string;
    VERCEL_URL?: string;
    NODE_ENV?: "development" | "production" | "test";

    // Pusher (optional)
    PUSHER_APP_ID?: string;
    PUSHER_KEY?: string;
    PUSHER_SECRET?: string;
    NEXT_PUBLIC_PUSHER_KEY?: string;
    NEXT_PUBLIC_PUSHER_CLUSTER?: string;

    // Upstash Redis (optional)
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  }
}
