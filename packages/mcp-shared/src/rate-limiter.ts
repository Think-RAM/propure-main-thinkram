import { RateLimiter } from "limiter";

export interface RateLimiterConfig {
  tokensPerInterval: number;
  interval: "second" | "minute" | "hour" | "day";
}

const limiters = new Map<string, RateLimiter>();

/**
 * Get or create a rate limiter for a specific key
 */
export function getRateLimiter(
  key: string,
  config: RateLimiterConfig,
): RateLimiter {
  const existingLimiter = limiters.get(key);
  if (existingLimiter) {
    return existingLimiter;
  }

  const limiter = new RateLimiter({
    tokensPerInterval: config.tokensPerInterval,
    interval: config.interval,
  });

  limiters.set(key, limiter);
  return limiter;
}

/**
 * Check if we can make a request, waiting if necessary
 * Returns true when the request can proceed
 */
export async function waitForRateLimit(
  key: string,
  config: RateLimiterConfig,
): Promise<void> {
  const limiter = getRateLimiter(key, config);
  await limiter.removeTokens(1);
}

/**
 * Try to acquire a token without waiting
 * Returns false if rate limit would be exceeded
 */
export function tryAcquireToken(
  key: string,
  config: RateLimiterConfig,
): boolean {
  const limiter = getRateLimiter(key, config);
  return limiter.tryRemoveTokens(1);
}

// Default rate limit configurations
export const RATE_LIMITS = {
  domain: {
    api: { tokensPerInterval: 500, interval: "day" } as RateLimiterConfig,
    scrape: { tokensPerInterval: 30, interval: "minute" } as RateLimiterConfig,
  },
  realestate: {
    scrape: { tokensPerInterval: 15, interval: "minute" } as RateLimiterConfig,
  },
  market: {
    api: { tokensPerInterval: 100, interval: "minute" } as RateLimiterConfig,
    absScrape: { tokensPerInterval: 20, interval: "minute" } as RateLimiterConfig,
  },
} as const;
