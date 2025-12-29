import { inngest } from "../client";

/**
 * Calculate suburb-level metrics
 *
 * This function calculates aggregated metrics for suburbs:
 * - Median price, rental yield, vacancy rate
 * - Growth rates, days on market
 * - Demographic indicators
 *
 * Can be triggered after new listings are synced or on schedule.
 */
export const calculateSuburbMetrics = inngest.createFunction(
  {
    id: "calculate-suburb-metrics",
    name: "Calculate Suburb Metrics",
    retries: 2,
  },
  { event: "suburb/metrics.update" },
  async ({ event, step }) => {
    const { suburbIds } = event.data as { suburbIds?: string[] };

    // Step 1: Fetch properties for calculation
    const properties = await step.run("fetch-properties", async () => {
      // TODO: Query properties from database
      // If suburbIds provided, filter by those suburbs
      // Otherwise, calculate for all suburbs with recent changes
      console.log("Fetching properties for metric calculation...");
      return [];
    });

    // Step 2: Calculate metrics
    const metrics = await step.run("calculate-metrics", async () => {
      // TODO: Calculate aggregated metrics
      // - Median price: sort prices, take middle value
      // - Gross yield: (median weekly rent * 52) / median price * 100
      // - Vacancy rate: vacant listings / total listings
      // - Growth rate: compare to historical data
      console.log("Calculating suburb metrics...");
      return {
        suburbsProcessed: 0,
        metricsCalculated: 0,
      };
    });

    // Step 3: Store metrics in TimescaleDB
    await step.run("store-metrics", async () => {
      // TODO: Insert metrics into SuburbMetric table
      console.log("Storing calculated metrics...");
    });

    return metrics;
  },
);
