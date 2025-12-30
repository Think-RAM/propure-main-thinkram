import { z } from "zod";
import { inngest } from "../client";
import { prisma } from "@propure/db";
import { marketTools } from "@/lib/mcp/client";

// Zod schema for event data validation
const MarketIndicatorsEventSchema = z.object({
  indicators: z
    .array(z.enum(["rba", "abs", "demographic", "building", "population"]))
    .optional()
    .default(["rba", "abs", "demographic", "building", "population"]),
  state: z
    .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
    .optional(),
});

/**
 * Refresh national/city-level market indicators via MCP
 *
 * This function updates macro-level market data:
 * - Interest rates (RBA)
 * - Building approvals (ABS)
 * - Economic indicators (GDP, inflation, unemployment)
 * - Population projections
 * - Demographics
 *
 * Typically runs on a schedule (daily).
 */
export const refreshMarketIndicators = inngest.createFunction(
  {
    id: "refresh-market-indicators",
    name: "Refresh Market Indicators",
    retries: 3,
  },
  [
    { event: "market/indicators.refresh" },
    { cron: "0 4 * * *" }, // Daily at 4 AM AEST
  ],
  async ({ event, step }) => {
    // Validate event data with Zod
    const eventData = event?.data || {};
    const parseResult = MarketIndicatorsEventSchema.safeParse(eventData);
    if (!parseResult.success) {
      console.error("Invalid event data:", parseResult.error.flatten());
      return {
        error: "Invalid event data",
        details: parseResult.error.flatten(),
      };
    }
    const { indicators, state } = parseResult.data;

    const results: Record<string, unknown> = {};
    const now = new Date();

    // Step 1: Fetch RBA data
    if (indicators.includes("rba")) {
      const rbaData = await step.run("fetch-rba-data", async () => {
        try {
          return await marketTools.getRbaRates(true, true);
        } catch (error) {
          console.error("Failed to fetch RBA data:", error);
          return null;
        }
      });

      if (rbaData) {
        // Store cash rate
        await step.run("store-rba-rates", async () => {
          await prisma.marketIndicator.upsert({
            where: {
              indicatorType_scope_recordedAt: {
                indicatorType: "cash_rate",
                scope: "national",
                recordedAt: now,
              },
            },
            update: { value: rbaData.cashRate.current },
            create: {
              indicatorType: "cash_rate",
              scope: "national",
              value: rbaData.cashRate.current,
              unit: "percent",
              recordedAt: now,
              source: "RBA",
            },
          });
        });

        results.rba = rbaData;
      }
    }

    // Step 2: Fetch economic indicators
    if (indicators.includes("abs")) {
      const economicData = await step.run(
        "fetch-economic-indicators",
        async () => {
          try {
            return await marketTools.getEconomicIndicators();
          } catch (error) {
            console.error("Failed to fetch economic indicators:", error);
            return null;
          }
        },
      );

      if (economicData) {
        await step.run("store-economic-indicators", async () => {
          const indicatorOps = [
            {
              type: "gdp_growth",
              value: economicData.gdpGrowth,
              unit: "percent",
            },
            {
              type: "inflation",
              value: economicData.inflation,
              unit: "percent",
            },
            {
              type: "unemployment",
              value: economicData.unemployment,
              unit: "percent",
            },
            {
              type: "wage_growth",
              value: economicData.wageGrowth,
              unit: "percent",
            },
          ];

          await prisma.$transaction(
            indicatorOps.map((ind) =>
              prisma.marketIndicator.upsert({
                where: {
                  indicatorType_scope_recordedAt: {
                    indicatorType: ind.type,
                    scope: "national",
                    recordedAt: now,
                  },
                },
                update: { value: ind.value },
                create: {
                  indicatorType: ind.type,
                  scope: "national",
                  value: ind.value,
                  unit: ind.unit,
                  recordedAt: now,
                  source: "ABS",
                },
              }),
            ),
          );
        });

        results.economic = economicData;
      }
    }

    // Step 3: Fetch building approvals
    if (indicators.includes("building")) {
      const buildingData = await step.run(
        "fetch-building-approvals",
        async () => {
          try {
            return await marketTools.getBuildingApprovals(state, 12);
          } catch (error) {
            console.error("Failed to fetch building approvals:", error);
            return null;
          }
        },
      );

      if (buildingData && buildingData.length > 0) {
        await step.run("store-building-approvals", async () => {
          // Sort by period descending to ensure we get the latest data
          const sorted = [...buildingData].sort((a, b) =>
            b.period.localeCompare(a.period),
          );
          const latest = sorted[0];
          await prisma.marketIndicator.upsert({
            where: {
              indicatorType_scope_recordedAt: {
                indicatorType: "building_approvals",
                scope: state || "national",
                recordedAt: now,
              },
            },
            update: { value: latest.totalDwellings },
            create: {
              indicatorType: "building_approvals",
              scope: state || "national",
              value: latest.totalDwellings,
              unit: "dwellings",
              recordedAt: now,
              source: "ABS",
            },
          });
        });

        results.building = buildingData;
      }
    }

    // Step 4: Fetch population projections
    if (indicators.includes("population")) {
      const populationData = await step.run(
        "fetch-population-projections",
        async () => {
          try {
            return await marketTools.getPopulationProjections(state);
          } catch (error) {
            console.error("Failed to fetch population projections:", error);
            return null;
          }
        },
      );

      if (populationData) {
        await step.run("store-population-projections", async () => {
          await prisma.$transaction([
            prisma.marketIndicator.upsert({
              where: {
                indicatorType_scope_recordedAt: {
                  indicatorType: "population_current",
                  scope: state || "national",
                  recordedAt: now,
                },
              },
              update: { value: populationData.current },
              create: {
                indicatorType: "population_current",
                scope: state || "national",
                value: populationData.current,
                unit: "people",
                recordedAt: now,
                source: "ABS",
              },
            }),
            prisma.marketIndicator.upsert({
              where: {
                indicatorType_scope_recordedAt: {
                  indicatorType: "population_growth_rate",
                  scope: state || "national",
                  recordedAt: now,
                },
              },
              update: { value: populationData.growthRate },
              create: {
                indicatorType: "population_growth_rate",
                scope: state || "national",
                value: populationData.growthRate,
                unit: "percent",
                recordedAt: now,
                source: "ABS",
              },
            }),
          ]);
        });

        results.population = populationData;
      }
    }

    // Step 5: Fetch demographics for a specific area
    if (indicators.includes("demographic") && state) {
      const demographicData = await step.run("fetch-demographics", async () => {
        try {
          return await marketTools.getAbsDemographics(
            undefined,
            undefined,
            state,
          );
        } catch (error) {
          console.error("Failed to fetch demographics:", error);
          return null;
        }
      });

      if (demographicData) {
        await step.run("store-demographics", async () => {
          const demoIndicators = [
            {
              type: "median_age",
              value: demographicData.medianAge,
              unit: "years",
            },
            {
              type: "median_income",
              value: demographicData.medianIncome,
              unit: "dollars",
            },
            {
              type: "owner_occupied_rate",
              value: demographicData.ownerOccupied,
              unit: "percent",
            },
            {
              type: "rented_rate",
              value: demographicData.rented,
              unit: "percent",
            },
          ];

          await prisma.$transaction(
            demoIndicators.map((ind) =>
              prisma.marketIndicator.upsert({
                where: {
                  indicatorType_scope_recordedAt: {
                    indicatorType: ind.type,
                    scope: state,
                    recordedAt: now,
                  },
                },
                update: { value: ind.value },
                create: {
                  indicatorType: ind.type,
                  scope: state,
                  value: ind.value,
                  unit: ind.unit,
                  recordedAt: now,
                  source: "ABS",
                },
              }),
            ),
          );
        });

        results.demographics = demographicData;
      }
    }

    return {
      updated: true,
      timestamp: now.toISOString(),
      indicators: results,
    };
  },
);
