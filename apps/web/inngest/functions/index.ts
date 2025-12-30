// Barrel export for all Inngest functions
export { syncDomainListings } from "./sync-domain-listings";
export { syncRealestateListings } from "./sync-realestate-listings";
export { calculateSuburbMetrics } from "./calculate-suburb-metrics";
export { refreshMarketIndicators } from "./refresh-market-indicators";
export { processAiInsights } from "./process-ai-insights";

// Export all functions as array for serve()
import { syncDomainListings } from "./sync-domain-listings";
import { syncRealestateListings } from "./sync-realestate-listings";
import { calculateSuburbMetrics } from "./calculate-suburb-metrics";
import { refreshMarketIndicators } from "./refresh-market-indicators";
import { processAiInsights } from "./process-ai-insights";

export const functions = [
  syncDomainListings,
  syncRealestateListings,
  calculateSuburbMetrics,
  refreshMarketIndicators,
  processAiInsights,
];
