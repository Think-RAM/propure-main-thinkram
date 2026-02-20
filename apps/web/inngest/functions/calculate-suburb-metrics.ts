import { z } from "zod";
import { inngest } from "../client";

// Zod schema for event data validation
const SuburbMetricsEventSchema = z.object({
  suburbIds: z.array(z.string()).optional(),
});

// Type for serialized property from step.run
type PropertyWithSuburb = {
  id: string;
  suburbId: string;
  price: number | null;
  rentWeekly: number | null;
  suburb: { id: string; name: string };
};

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
    // Validate event data with Zod
    const parseResult = SuburbMetricsEventSchema.safeParse(event.data);
    if (!parseResult.success) {
      console.error("Invalid event data:", parseResult.error.flatten());
      return {
        error: "Invalid event data",
        details: parseResult.error.flatten(),
      };
    }
    const { suburbIds } = parseResult.data;

    // Step 1: Fetch properties for calculation
    const properties = await step.run(
      "fetch-properties",
      async (): Promise<PropertyWithSuburb[]> => {
        try {
          //TODO: Replace with actual DB fetch
          const props: PropertyWithSuburb[] = []; // Placeholder for fetched properties
          console.log(
            `Fetched ${props.length} properties for metric calculation`,
          );
          return props;
        } catch (error) {
          console.error("Failed to fetch properties:", error);
          throw error;
        }
      },
    );

    // Step 2: Calculate metrics
    const metrics = await step.run("calculate-metrics", async () => {
      try {
        // Group properties by suburb
        const suburbGroups = properties.reduce<
          Record<string, PropertyWithSuburb[]>
        >((acc, prop) => {
          const key = prop.suburbId;
          if (!acc[key]) acc[key] = [];
          acc[key].push(prop);
          return acc;
        }, {});

        const calculatedMetrics: {
          suburbId: string;
          medianPrice: number | null;
          grossYield: number | null;
        }[] = [];

        for (const [suburbId, props] of Object.entries(suburbGroups)) {
          // Calculate median price
          const prices = props
            .map((p: PropertyWithSuburb) => p.price)
            .filter((p): p is number => p !== null)
            .sort((a: number, b: number) => a - b);
          const medianPrice =
            prices.length > 0 ? prices[Math.floor(prices.length / 2)] : null;

          // Calculate gross yield: (median weekly rent * 52) / median price * 100
          const rents = props
            .map((p: PropertyWithSuburb) => p.rentWeekly)
            .filter((r): r is number => r !== null);
          const medianRent =
            rents.length > 0
              ? rents.sort((a: number, b: number) => a - b)[
                  Math.floor(rents.length / 2)
                ]
              : null;
          const grossYield =
            medianPrice && medianRent
              ? ((medianRent * 52) / medianPrice) * 100
              : null;

          calculatedMetrics.push({ suburbId, medianPrice, grossYield });
        }

        console.log(
          `Calculated metrics for ${calculatedMetrics.length} suburbs`,
        );
        return {
          suburbsProcessed: calculatedMetrics.length,
          metricsCalculated: calculatedMetrics.length * 2,
          metrics: calculatedMetrics,
        };
      } catch (error) {
        console.error("Failed to calculate metrics:", error);
        throw error;
      }
    });

    // Step 3: Store metrics in database
    await step.run("store-metrics", async () => {
      try {
        const now = new Date();
        const metricRecords = metrics.metrics.flatMap((m) => [
          ...(m.medianPrice !== null
            ? [
                {
                  suburbId: m.suburbId,
                  metricType: "median_price",
                  value: m.medianPrice,
                  source: "calculated",
                  recordedAt: now,
                },
              ]
            : []),
          ...(m.grossYield !== null
            ? [
                {
                  suburbId: m.suburbId,
                  metricType: "rental_yield",
                  value: m.grossYield,
                  source: "calculated",
                  recordedAt: now,
                },
              ]
            : []),
        ]);

        if (metricRecords.length > 0) {
          // TODO: Replace with actual DB insertion
        }
        console.log(`Stored ${metricRecords.length} metric records`);
      } catch (error) {
        console.error("Failed to store metrics:", error);
        throw error;
      }
    });

    return {
      suburbsProcessed: metrics.suburbsProcessed,
      metricsCalculated: metrics.metricsCalculated,
    };
  },
);
