import { tool } from "ai";
import z from "zod";

export const calculateCashFlow = tool({
  description:
    "Calculate annual and weekly cash flow for an investment property",
  inputSchema: z.object({
    purchasePrice: z.number().positive(),
    deposit: z.number().positive(),
    weeklyRent: z.number().positive(),
    interestRate: z
      .number()
      .positive()
      .describe("Annual rate as decimal (e.g., 0.06)"),
    vacancyAllowance: z.number().min(0).max(1).default(0.04),
    managementFee: z.number().min(0).max(1).default(0.08),
    councilRatesPercentage: z.number().min(0).max(1).default(0.003),
    insurancePercentage: z.number().min(0).max(1).default(0.002),
    maintenancePercentage: z.number().min(0).max(1).default(0.01),
    bodyCorpFees: z.number().min(0).default(0),
  }),
  execute: async (params) => {
    try {
      const {
        purchasePrice,
        deposit,
        weeklyRent,
        interestRate,
        vacancyAllowance,
        managementFee,
        councilRatesPercentage,
        insurancePercentage,
        maintenancePercentage,
        bodyCorpFees,
      } = params;

      // Income
      const annualRent = weeklyRent * 52;
      const vacancyLoss = annualRent * vacancyAllowance;
      const effectiveRentalIncome = annualRent - vacancyLoss;

      // Expenses
      const loanAmount = purchasePrice - deposit;
      const annualInterest = loanAmount * interestRate;
      const managementCost = effectiveRentalIncome * managementFee;
      const councilRates = purchasePrice * councilRatesPercentage;
      const insurance = purchasePrice * insurancePercentage;
      const maintenance = purchasePrice * maintenancePercentage;

      const totalAnnualExpenses =
        annualInterest +
        managementCost +
        councilRates +
        insurance +
        maintenance +
        bodyCorpFees;

      // Net cash flow
      const annualNetCashFlow = effectiveRentalIncome - totalAnnualExpenses;
      const weeklyNetCashFlow = annualNetCashFlow / 52;

      return {
        success: true,
        income: {
          weeklyRent,
          annualRent,
          vacancyLoss,
          effectiveRentalIncome,
        },
        expenses: {
          annualInterest,
          managementCost,
          councilRates,
          insurance,
          maintenance,
          bodyCorpFees,
          totalAnnualExpenses,
        },
        cashFlow: {
          annualNetCashFlow,
          weeklyNetCashFlow,
          status:
            annualNetCashFlow > 0
              ? "positive"
              : annualNetCashFlow < 0
                ? "negative"
                : "neutral",
          isNegativeGeared: annualNetCashFlow < 0,
        },
      };
    } catch (error) {
      console.error("Cash flow calculation failed:", error);
      return {
        success: false,
        error: "Unable to calculate cash flow",
      };
    }
  },
});

export const calculateROI = tool({
  description: "Calculate projected return on investment over a holding period",
  inputSchema: z.object({
    purchasePrice: z.number().positive(),
    deposit: z.number().positive(),
    holdingPeriod: z.number().int().positive().describe("Years"),
    capitalGrowthRate: z
      .number()
      .describe("Annual growth rate as decimal (e.g., 0.05)"),
    annualNetCashFlow: z.number().describe("From calculateCashFlow"),
    taxRate: z.number().min(0).max(1).default(0.37),
    cgtDiscount: z.number().min(0).max(1).default(0.5),
    sellingCostsPercentage: z.number().min(0).max(1).default(0.03),
  }),
  execute: async (params) => {
    try {
      const {
        purchasePrice,
        deposit,
        holdingPeriod,
        capitalGrowthRate,
        annualNetCashFlow,
        taxRate,
        cgtDiscount,
        sellingCostsPercentage,
      } = params;

      // Future value
      const futureValue =
        purchasePrice * Math.pow(1 + capitalGrowthRate, holdingPeriod);
      const capitalGain = futureValue - purchasePrice;

      // Cash flow accumulation
      const accumulatedCashFlow = annualNetCashFlow * holdingPeriod;

      // Selling costs
      const sellingCosts = futureValue * sellingCostsPercentage;

      // Capital gains tax
      const taxableGain = capitalGain * cgtDiscount;
      const capitalGainsTax = taxableGain * taxRate;

      // Net profit
      const grossProfit = capitalGain + accumulatedCashFlow - sellingCosts;
      const netProfit = grossProfit - capitalGainsTax;

      // ROI metrics
      const roi = netProfit / deposit;
      const annualizedROI = Math.pow(1 + roi, 1 / holdingPeriod) - 1;

      return {
        success: true,
        projection: {
          futureValue,
          capitalGain,
          accumulatedCashFlow,
          sellingCosts,
          capitalGainsTax,
          grossProfit,
          netProfit,
        },
        returns: {
          totalROI: roi,
          totalROIPercentage: roi * 100,
          annualizedROI,
          annualizedROIPercentage: annualizedROI * 100,
        },
        assumptions: {
          holdingPeriod,
          capitalGrowthRate,
          taxRate,
          cgtDiscount,
          sellingCostsPercentage,
        },
      };
    } catch (error) {
      console.error("ROI calculation failed:", error);
      return {
        success: false,
        error: "Unable to calculate ROI",
      };
    }
  },
});

export const assessRisk = tool({
  description:
    "Assess investment risk for a property based on market and financial factors",
  inputSchema: z.object({
    suburb: z.string(),
    state: z.string(),
    propertyType: z.string(),
    purchasePrice: z.number(),
    loanToValueRatio: z.number().describe("LVR as decimal (e.g., 0.8 for 80%)"),
    cashFlowStatus: z.enum(["positive", "negative", "neutral"]),
    holdingPeriod: z.number().describe("Intended holding period in years"),
  }),
  execute: async (params) => {
    try {
      // Risk factors scoring (0-100, lower = lower risk)
      const risks = {
        marketRisk: 0,
        financialRisk: 0,
        liquidityRisk: 0,
        concentrationRisk: 0,
      };

      // Market risk: based on suburb volatility, supply
      // TODO: Fetch suburb market indicators
      risks.marketRisk = 50; // Placeholder

      // Financial risk: based on LVR, cash flow, interest rate sensitivity
      if (params.loanToValueRatio > 0.9) risks.financialRisk += 40;
      else if (params.loanToValueRatio > 0.8) risks.financialRisk += 25;
      else risks.financialRisk += 10;

      if (params.cashFlowStatus === "negative") risks.financialRisk += 20;
      else if (params.cashFlowStatus === "neutral") risks.financialRisk += 10;

      // Liquidity risk: property type, price point
      if (
        params.propertyType === "Land" ||
        params.propertyType === "Commercial"
      ) {
        risks.liquidityRisk += 30;
      }
      if (params.purchasePrice > 2000000) risks.liquidityRisk += 20;

      // Overall risk score (weighted average)
      const overallRisk =
        risks.marketRisk * 0.4 +
        risks.financialRisk * 0.3 +
        risks.liquidityRisk * 0.2 +
        risks.concentrationRisk * 0.1;

      const riskLevel =
        overallRisk < 30 ? "Low" : overallRisk < 60 ? "Medium" : "High";

      return {
        success: true,
        overallRisk,
        riskLevel,
        breakdown: risks,
        recommendations: generateRiskRecommendations(risks, riskLevel),
      };
    } catch (error) {
      console.error("Risk assessment failed:", error);
      return {
        success: false,
        error: "Unable to assess risk",
      };
    }
  },
});

export const projectGrowth = tool({
  description: "Project capital growth for a suburb based on market indicators",
  inputSchema: z.object({
    suburb: z.string(),
    state: z.string(),
    currentMedianPrice: z.number(),
    projectionYears: z.number().int().positive().default(10),
  }),
  execute: async ({ suburb, state, currentMedianPrice, projectionYears }) => {
    try {
      // Fetch historical growth rates
      // TODO: Integrate with market data MCP
      const historicalGrowth = {
        threeYear: 0.05, // Placeholder: 5% p.a.
        fiveYear: 0.06, // 6% p.a.
        tenYear: 0.055, // 5.5% p.a.
      };

      // Forecast growth rate (weighted average + adjustments)
      const baseGrowth =
        historicalGrowth.threeYear * 0.5 +
        historicalGrowth.fiveYear * 0.3 +
        historicalGrowth.tenYear * 0.2;

      // TODO: Adjust for infrastructure, zoning, supply factors
      const adjustedGrowth = baseGrowth;

      // Project future values
      const projections: Array<{
        year: number;
        medianPrice: number;
        growth: number;
      }> = [];
      let currentValue = currentMedianPrice;

      for (let year = 1; year <= projectionYears; year++) {
        currentValue *= 1 + adjustedGrowth;
        projections.push({
          year,
          medianPrice: Math.round(currentValue),
          growth: adjustedGrowth,
        });
      }

      return {
        success: true,
        suburb,
        currentMedianPrice,
        projectedMedianPrice: projections[projections.length - 1].medianPrice,
        totalGrowth:
          (projections[projections.length - 1].medianPrice -
            currentMedianPrice) /
          currentMedianPrice,
        annualizedGrowth: adjustedGrowth,
        yearByYear: projections,
        confidence: "medium", // TODO: Calculate based on data quality
        assumptions: {
          basedOn: "Historical growth rates",
          adjustments: "None applied (base model)",
        },
      };
    } catch (error) {
      console.error("Growth projection failed:", error);
      return {
        success: false,
        error: "Unable to project growth",
      };
    }
  },
});

/* -----------------------
   Helper functions
   ----------------------- */

function generateRiskRecommendations(risks: any, level: string): string[] {
  const recommendations: string[] = [];

  if (level === "High") {
    recommendations.push("Consider increasing deposit to reduce LVR");
    recommendations.push(
      "Ensure adequate cash reserves for 6+ months expenses",
    );
  }

  if (risks.financialRisk > 50) {
    recommendations.push("Fix interest rate to protect against rate rises");
    recommendations.push("Build offset account for flexibility");
  }

  if (risks.liquidityRisk > 50) {
    recommendations.push("Plan for longer sales timeframe if needed");
    recommendations.push(
      "Consider more liquid property types (houses/apartments in metro areas)",
    );
  }

  return recommendations;
}