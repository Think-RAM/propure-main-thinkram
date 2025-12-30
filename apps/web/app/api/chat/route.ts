import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { domainTools, realestateTools, marketTools } from "@/lib/mcp/client";
import { prisma } from "@propure/db";
import { auth } from "@clerk/nextjs/server";
import type { AustralianState } from "@propure/mcp-shared";

const SYSTEM_PROMPT = `You are Propure AI, an intelligent property investment advisor for the Australian market. You help users:

1. **Discover** their investment goals through conversational questions
2. **Recommend** strategies (Cash Flow, Capital Growth, Renovation, Development, SMSF, Commercial)
3. **Research** market data, suburbs, and properties
4. **Analyze** financial metrics and risks

You have access to real-time Australian property data from Domain.com.au, RealEstate.com.au, RBA, and ABS.

When discussing properties or suburbs:
- Always cite yield, vacancy rates, and growth figures when available
- Be specific about data sources and freshness
- Use Australian property terminology (gross yield = annual rent / price × 100)

For strategy discovery, ask one question at a time about:
- Financial situation (income, deposit, borrowing capacity)
- Goals (cash flow vs growth, timeline)
- Risk tolerance (conservative, moderate, aggressive)
- Hands-on preference (passive, active, DIY)

When a user asks to search for properties, use the search tools and present results clearly.
When analyzing a property, calculate cash flow and compare to suburb benchmarks.

Be conversational, helpful, and accurate with financial figures.`;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, strategyId } = await req.json();

    // Load user context
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        strategies: {
          where: strategyId ? { id: strategyId } : { status: "ACTIVE" },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    const currentStrategy = user?.strategies[0];
    const contextInfo = currentStrategy
      ? `\n\nCurrent user strategy: ${currentStrategy.type}, Budget: $${currentStrategy.budget?.toLocaleString() || "not set"}`
      : "";

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT + contextInfo,
      messages,
      maxSteps: 10,
      tools: {
        // Property Search Tools
        searchDomainProperties: tool({
          description:
            "Search for property listings on Domain.com.au. Use this when users want to find properties in specific suburbs, price ranges, or with certain features.",
          parameters: z.object({
            suburbs: z
              .array(z.string())
              .optional()
              .describe("Suburb names to search in"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .optional()
              .describe("Australian state"),
            postcode: z.string().optional().describe("Postcode to search"),
            minPrice: z.number().optional().describe("Minimum price"),
            maxPrice: z.number().optional().describe("Maximum price"),
            minBeds: z.number().optional().describe("Minimum bedrooms"),
            maxBeds: z.number().optional().describe("Maximum bedrooms"),
            listingType: z
              .enum(["sale", "rent", "sold"])
              .optional()
              .default("sale")
              .describe("Type of listing"),
            pageSize: z
              .number()
              .optional()
              .default(10)
              .describe("Number of results"),
          }),
          execute: async (params) => {
            try {
              const result = await domainTools.searchProperties({
                suburbs: params.suburbs,
                state: params.state as AustralianState | undefined,
                postcode: params.postcode,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                minBeds: params.minBeds,
                maxBeds: params.maxBeds,
                listingType: params.listingType,
                pageSize: params.pageSize,
                page: 1,
              });
              return {
                success: true,
                count: result.listings.length,
                totalCount: result.totalCount,
                hasMore: result.hasMore,
                listings: result.listings,
              };
            } catch (error) {
              console.error("Domain search error:", error);
              return {
                success: false,
                error: error instanceof Error ? error.message : "Search failed",
              };
            }
          },
        }),

        searchRealestateProperties: tool({
          description:
            "Search for property listings on RealEstate.com.au. Use as an alternative to Domain for broader search coverage.",
          parameters: z.object({
            suburbs: z
              .array(z.string())
              .optional()
              .describe("Suburb names to search in"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .optional()
              .describe("Australian state"),
            postcode: z.string().optional().describe("Postcode to search"),
            minPrice: z.number().optional().describe("Minimum price"),
            maxPrice: z.number().optional().describe("Maximum price"),
            minBeds: z.number().optional().describe("Minimum bedrooms"),
            listingType: z
              .enum(["sale", "rent", "sold"])
              .optional()
              .default("sale")
              .describe("Type of listing"),
            pageSize: z
              .number()
              .optional()
              .default(10)
              .describe("Number of results"),
          }),
          execute: async (params) => {
            try {
              const result = await realestateTools.searchProperties({
                suburbs: params.suburbs,
                state: params.state as AustralianState | undefined,
                postcode: params.postcode,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                minBeds: params.minBeds,
                listingType: params.listingType,
                pageSize: params.pageSize,
                page: 1,
              });
              return {
                success: true,
                count: result.listings.length,
                totalCount: result.totalCount,
                hasMore: result.hasMore,
                listings: result.listings,
              };
            } catch (error) {
              console.error("REA search error:", error);
              return {
                success: false,
                error: error instanceof Error ? error.message : "Search failed",
              };
            }
          },
        }),

        // Suburb Analysis Tools
        getSuburbStats: tool({
          description:
            "Get suburb statistics including median price, rental yield, vacancy rate, and growth metrics. Use this when analyzing or comparing suburbs.",
          parameters: z.object({
            suburb: z.string().describe("Suburb name"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .describe("Australian state"),
            postcode: z.string().describe("Postcode"),
          }),
          execute: async (params) => {
            try {
              const stats = await domainTools.getSuburbStats(
                params.suburb,
                params.state as AustralianState,
                params.postcode,
              );
              return { success: true, stats };
            } catch (error) {
              console.error("Suburb stats error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get stats",
              };
            }
          },
        }),

        getSuburbProfile: tool({
          description:
            "Get detailed suburb profile from RealEstate.com.au with demographics and market trends.",
          parameters: z.object({
            suburb: z.string().describe("Suburb name"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .describe("Australian state"),
            postcode: z.string().describe("Postcode"),
          }),
          execute: async (params) => {
            try {
              const profile = await realestateTools.getSuburbProfile(
                params.suburb,
                params.state as AustralianState,
                params.postcode,
              );
              return { success: true, profile };
            } catch (error) {
              console.error("Suburb profile error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get profile",
              };
            }
          },
        }),

        // Market Data Tools
        getRbaRates: tool({
          description:
            "Get current RBA cash rate and lending rates. Use when discussing interest rates, borrowing costs, or mortgage affordability.",
          parameters: z.object({
            includeHistorical: z
              .boolean()
              .optional()
              .default(true)
              .describe("Include rate history"),
          }),
          execute: async (params) => {
            try {
              const rates = await marketTools.getRbaRates(
                params.includeHistorical,
                true,
              );
              return { success: true, rates };
            } catch (error) {
              console.error("RBA rates error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get rates",
              };
            }
          },
        }),

        getEconomicIndicators: tool({
          description:
            "Get key economic indicators including GDP growth, inflation, unemployment, and wage growth. Use when discussing the broader economic environment.",
          parameters: z.object({}),
          execute: async () => {
            try {
              const indicators = await marketTools.getEconomicIndicators();
              return { success: true, indicators };
            } catch (error) {
              console.error("Economic indicators error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get indicators",
              };
            }
          },
        }),

        getDemographics: tool({
          description:
            "Get ABS demographics for a suburb, LGA, or state including population, income, and housing tenure.",
          parameters: z.object({
            suburb: z.string().optional().describe("Suburb name"),
            lga: z.string().optional().describe("Local Government Area"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .optional()
              .describe("State"),
          }),
          execute: async (params) => {
            try {
              const demographics = await marketTools.getAbsDemographics(
                params.suburb,
                params.lga,
                params.state as AustralianState | undefined,
              );
              return { success: true, demographics };
            } catch (error) {
              console.error("Demographics error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get demographics",
              };
            }
          },
        }),

        getPopulationProjections: tool({
          description:
            "Get population growth projections for a state or nationally. Use when discussing long-term growth drivers.",
          parameters: z.object({
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .optional()
              .describe("State (leave empty for national)"),
          }),
          execute: async (params) => {
            try {
              const projections = await marketTools.getPopulationProjections(
                params.state as AustralianState | undefined,
              );
              return { success: true, projections };
            } catch (error) {
              console.error("Population projections error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get projections",
              };
            }
          },
        }),

        // Sales History Tools
        getSalesHistory: tool({
          description:
            "Get sales history for a specific address. Use when analyzing past performance of a property.",
          parameters: z.object({
            address: z.string().describe("Street address"),
            suburb: z.string().describe("Suburb name"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .describe("State"),
          }),
          execute: async (params) => {
            try {
              const history = await domainTools.getSalesHistory(
                params.address,
                params.suburb,
                params.state as AustralianState,
              );
              return { success: true, history };
            } catch (error) {
              console.error("Sales history error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get history",
              };
            }
          },
        }),

        getSoldProperties: tool({
          description:
            "Get recently sold properties in a suburb. Use when showing comparable sales or market activity.",
          parameters: z.object({
            suburb: z.string().describe("Suburb name"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .describe("State"),
            postcode: z.string().optional().describe("Postcode"),
          }),
          execute: async (params) => {
            try {
              const sold = await realestateTools.getSoldProperties(
                params.suburb,
                params.state as AustralianState,
                params.postcode,
              );
              return { success: true, properties: sold };
            } catch (error) {
              console.error("Sold properties error:", error);
              return {
                success: false,
                error:
                  error instanceof Error ? error.message : "Failed to get sold",
              };
            }
          },
        }),

        getAuctionResults: tool({
          description:
            "Get recent auction results in a suburb. Use when analyzing auction clearance rates or market conditions.",
          parameters: z.object({
            suburb: z.string().describe("Suburb name"),
            state: z
              .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
              .describe("State"),
          }),
          execute: async (params) => {
            try {
              const results = await domainTools.getAuctionResults(
                params.suburb,
                params.state as AustralianState,
              );
              return { success: true, results };
            } catch (error) {
              console.error("Auction results error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to get auctions",
              };
            }
          },
        }),

        // Financial Calculation Tools
        calculateCashFlow: tool({
          description:
            "Calculate weekly/annual cash flow for a property investment. Use when analyzing a specific property's financial viability.",
          parameters: z.object({
            purchasePrice: z.number().describe("Property purchase price"),
            weeklyRent: z.number().describe("Weekly rental income"),
            deposit: z.number().describe("Deposit amount"),
            interestRate: z
              .number()
              .optional()
              .default(6.5)
              .describe("Interest rate (%)"),
            loanType: z
              .enum(["IO", "PI"])
              .optional()
              .default("IO")
              .describe("IO = Interest Only, PI = Principal & Interest"),
            managementFee: z
              .number()
              .optional()
              .default(8)
              .describe("Property management fee (% of rent)"),
            councilRates: z
              .number()
              .optional()
              .describe("Annual council rates"),
            insurance: z.number().optional().describe("Annual insurance"),
            bodyCorpFees: z
              .number()
              .optional()
              .describe("Annual body corp fees"),
          }),
          execute: async (params) => {
            // Validate deposit is less than purchase price to avoid negative loan
            if (params.deposit >= params.purchasePrice) {
              return {
                success: false,
                error: "Deposit cannot equal or exceed purchase price",
              };
            }

            const loanAmount = params.purchasePrice - params.deposit;
            const annualRent = params.weeklyRent * 52;
            const vacancyAllowance = annualRent * 0.04; // 2 weeks
            const effectiveRent = annualRent - vacancyAllowance;

            const annualInterest = loanAmount * (params.interestRate / 100);
            const managementCost = effectiveRent * (params.managementFee / 100);
            const councilRates =
              params.councilRates || params.purchasePrice * 0.003;
            const insurance = params.insurance || params.purchasePrice * 0.002;
            const maintenance = params.purchasePrice * 0.01;
            const bodyCorpFees = params.bodyCorpFees || 0;

            const totalExpenses =
              annualInterest +
              managementCost +
              councilRates +
              insurance +
              maintenance +
              bodyCorpFees;

            const preTaxCashFlow = effectiveRent - totalExpenses;
            const grossYield = (annualRent / params.purchasePrice) * 100;
            const netYield = (preTaxCashFlow / params.purchasePrice) * 100;

            return {
              success: true,
              analysis: {
                income: {
                  weeklyRent: params.weeklyRent,
                  annualRent,
                  vacancyAllowance: Math.round(vacancyAllowance),
                  effectiveRent: Math.round(effectiveRent),
                },
                expenses: {
                  annualInterest: Math.round(annualInterest),
                  managementCost: Math.round(managementCost),
                  councilRates: Math.round(councilRates),
                  insurance: Math.round(insurance),
                  maintenance: Math.round(maintenance),
                  bodyCorpFees,
                  totalExpenses: Math.round(totalExpenses),
                },
                cashFlow: {
                  annual: Math.round(preTaxCashFlow),
                  weekly: Math.round(preTaxCashFlow / 52),
                  monthly: Math.round(preTaxCashFlow / 12),
                },
                metrics: {
                  grossYield: Math.round(grossYield * 100) / 100,
                  netYield: Math.round(netYield * 100) / 100,
                  loanAmount,
                  lvr: Math.round((loanAmount / params.purchasePrice) * 100),
                },
              },
            };
          },
        }),

        calculateROI: tool({
          description:
            "Calculate projected ROI and equity growth over a given timeframe. Use when projecting investment returns.",
          parameters: z.object({
            purchasePrice: z.number().describe("Property purchase price"),
            deposit: z.number().describe("Deposit amount"),
            annualCashFlow: z.number().describe("Annual net cash flow"),
            growthRate: z
              .number()
              .optional()
              .default(4)
              .describe("Annual capital growth rate (%)"),
            timeframeYears: z
              .number()
              .optional()
              .default(10)
              .describe("Holding period in years"),
          }),
          execute: async (params) => {
            const futureValue =
              params.purchasePrice *
              Math.pow(1 + params.growthRate / 100, params.timeframeYears);
            const totalCashFlow = params.annualCashFlow * params.timeframeYears;
            const capitalGain = futureValue - params.purchasePrice;
            const sellingCosts = futureValue * 0.03; // 3% selling costs
            const cgtDiscount = 0.5; // 50% CGT discount after 12 months
            const cgtPayable = capitalGain * cgtDiscount * 0.37; // Assume 37% tax bracket
            const netProfit =
              capitalGain + totalCashFlow - sellingCosts - cgtPayable;
            const annualizedROI =
              (Math.pow(
                (params.deposit + netProfit) / params.deposit,
                1 / params.timeframeYears,
              ) -
                1) *
              100;
            const cashOnCash = (params.annualCashFlow / params.deposit) * 100;

            return {
              success: true,
              projection: {
                futureValue: Math.round(futureValue),
                capitalGain: Math.round(capitalGain),
                totalCashFlow: Math.round(totalCashFlow),
                sellingCosts: Math.round(sellingCosts),
                cgtPayable: Math.round(cgtPayable),
                netProfit: Math.round(netProfit),
                annualizedROI: Math.round(annualizedROI * 100) / 100,
                cashOnCashReturn: Math.round(cashOnCash * 100) / 100,
                equityGrowth: Math.round(
                  ((params.deposit + netProfit) / params.deposit - 1) * 100,
                ),
              },
            };
          },
        }),

        // Strategy Tools
        saveStrategy: tool({
          description:
            "Save or update the user's investment strategy. Use after strategy discovery is complete.",
          parameters: z.object({
            type: z
              .enum([
                "CASH_FLOW",
                "CAPITAL_GROWTH",
                "RENOVATION_FLIP",
                "DEVELOPMENT",
                "SMSF",
                "COMMERCIAL",
              ])
              .describe("Strategy type"),
            budget: z.number().optional().describe("Target budget"),
            deposit: z.number().optional().describe("Available deposit"),
            income: z.number().optional().describe("Annual income"),
            riskTolerance: z
              .enum(["low", "medium", "high"])
              .optional()
              .describe("Risk tolerance level"),
            timeline: z
              .enum(["short", "medium", "long"])
              .optional()
              .describe("Investment timeline"),
            managementStyle: z
              .enum(["hands-on", "passive", "mixed"])
              .optional()
              .describe("Preferred management approach"),
          }),
          execute: async (params) => {
            if (!user) {
              return { success: false, error: "User not authenticated" };
            }
            try {
              // Verify ownership if updating an existing strategy
              if (strategyId && strategyId !== "new") {
                const existing = await prisma.strategy.findUnique({
                  where: { id: strategyId },
                  select: { userId: true },
                });
                if (!existing || existing.userId !== user.id) {
                  return {
                    success: false,
                    error: "Strategy not found or access denied",
                  };
                }
              }

              const strategy = await prisma.strategy.upsert({
                where: { id: strategyId || "new" },
                update: {
                  type: params.type,
                  budget: params.budget,
                  deposit: params.deposit,
                  income: params.income,
                  riskTolerance: params.riskTolerance,
                  timeline: params.timeline,
                  managementStyle: params.managementStyle,
                  status: "ACTIVE",
                  updatedAt: new Date(),
                },
                create: {
                  userId: user.id,
                  type: params.type,
                  budget: params.budget,
                  deposit: params.deposit,
                  income: params.income,
                  riskTolerance: params.riskTolerance,
                  timeline: params.timeline,
                  managementStyle: params.managementStyle,
                  status: "ACTIVE",
                },
              });
              return { success: true, strategyId: strategy.id };
            } catch (error) {
              console.error("Save strategy error:", error);
              return {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to save strategy",
              };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
