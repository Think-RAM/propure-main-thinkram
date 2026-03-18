import { CashflowPoint, FinancialMetric } from "@/lib/property";
import { Doc } from "@propure/convex/genereated";
type Range = "5y" | "10y" | "20y";

const safeNumber = (val: any, fallback = 0): number =>
  typeof val === "number" && !isNaN(val) ? val : fallback;

const midpoint = (a?: number | null, b?: number | null): number => {
  if (a && b) return (a + b) / 2;
  return a || b || 0;
};

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const round = (val: number) => Math.round(val);

const estimateMortgagePayment = (
  loanAmount: number,
  annualRate: number,
  years: number
): number => {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return loanAmount / years;
  const monthly =
    (loanAmount * r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);
  return monthly * 12;
};

const calculateGrowthRate = (
  capitalGrowthScore: number,
  populationGrowth: number
) => {
  const base = 0.03 + capitalGrowthScore * 0.04;
  const popAdj = clamp(populationGrowth / 100, 0, 0.02);
  return clamp(base + popAdj, 0.03, 0.07);
};

const calculateRentGrowth = (populationGrowth: number) => {
  return clamp(0.02 + populationGrowth / 200, 0.02, 0.04);
};

export const calculateCashFlow = (
  property: Doc<"properties">,
  suburbMetrics: Doc<"suburbMetrics">,
  absData: Doc<"absMarketData">[]
): {
  "5y": CashflowPoint[];
  "10y": CashflowPoint[];
  "20y": CashflowPoint[];
} => {
  const abs = absData?.[0] || {};

  const propertyPrice =
    safeNumber(property?.priceValue) ||
    midpoint(property?.priceFrom, property?.priceTo) ||
    safeNumber(property?.soldPrice);

  const weeklyRent =
    safeNumber(property?.propertyRentEstimate) ||
    safeNumber(abs?.medianWeeklyRent);

  let annualRent = weeklyRent * 52;

  const vacancyRate = clamp(
    safeNumber(suburbMetrics.metrics.vacancyRate),
    0,
    0.15
  );

  const capitalGrowthScore = clamp(
    safeNumber(suburbMetrics.metrics.capitalGrowthScore),
    0,
    1
  );

  const populationGrowth = safeNumber(abs?.populationGrowth);

  const riskScore = clamp(
    safeNumber(suburbMetrics.metrics.riskScore),
    0,
    1
  );

  const growthRate =
    calculateGrowthRate(capitalGrowthScore, populationGrowth) *
    (1 - riskScore * 0.3);

  const rentGrowthRate = calculateRentGrowth(populationGrowth);

  const loanToValue = 0.8;
  const loanAmount = propertyPrice * loanToValue;
  const interestRate = 0.065;

  const fallbackMortgage =
    safeNumber(abs?.medianMonthlyMortgageRepayment) * 12;

  const yearlyMortgage =
    fallbackMortgage ||
    estimateMortgagePayment(loanAmount, interestRate, 30);

  const generateProjection = (years: number): CashflowPoint[] => {
    const results: CashflowPoint[] = [];

    let currentValue = propertyPrice;
    let remainingLoan = loanAmount;
    const principalRepaymentPerYear = loanAmount / 30;

    for (let i = 1; i <= years; i++) {
      const effectiveRent = annualRent * (1 - vacancyRate);

      const management = effectiveRent * 0.07;
      const maintenance = currentValue * 0.01;
      const otherCosts = effectiveRent * 0.015;

      const interest = remainingLoan * interestRate;
      const principal = Math.min(
        principalRepaymentPerYear,
        remainingLoan
      );

      const totalExpenses =
        management +
        maintenance +
        otherCosts +
        interest +
        principal;

      const cashflow = effectiveRent - totalExpenses;

      remainingLoan = Math.max(0, remainingLoan - principal);

      currentValue = currentValue * (1 + growthRate);
      annualRent = annualRent * (1 + rentGrowthRate);

      const equity = currentValue - remainingLoan;

      results.push({
        year: `Year ${i}`,
        cashflow: round(cashflow),
        equity: round(equity),
      });
    }

    return results;
  };

  return {
    "5y": generateProjection(5),
    "10y": generateProjection(10),
    "20y": generateProjection(20),
  };
};

type ComparisonType = "positive" | "negative" | "neutral";

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${value.toFixed(1)}%`;
};

const getComparisonType = (diff: number): ComparisonType => {
  if (isNaN(diff)) return "neutral";
  if (diff > 0) return "positive";
  if (diff < 0) return "negative";
  return "neutral";
};

export const calculateFinancialMetrics = (
  property: Doc<"properties">,
  suburbMetrics: Doc<"suburbMetrics">,
  absData: Doc<"absMarketData">[]
): FinancialMetric[] => {
  // ---------- SAFE DATA EXTRACTION ----------
  const abs = absData?.[0];

  const price =
    property?.priceValue ??
    (property?.priceFrom && property?.priceTo
      ? (property.priceFrom + property.priceTo) / 2
      : null);

  const weeklyRent =
    property?.propertyRentEstimate ??
    abs?.medianWeeklyRent ??
    null;

  const suburbYield = suburbMetrics?.metrics.netYield ?? null;
  const medianRent = abs?.medianWeeklyRent ?? null;

  // ---------- 1. GROSS RENTAL YIELD ----------
  let grossYield: number | null = null;

  if (price && weeklyRent && price > 0) {
    grossYield = ((weeklyRent * 52) / price) * 100;
  }

  const yieldDiff =
    grossYield !== null && suburbYield !== null
      ? grossYield - suburbYield
      : NaN;

  const grossYieldMetric: FinancialMetric = {
    id: "gross-rental-yield",
    label: "Gross Rental Yield",
    value: formatPercent(grossYield),
    comparison:
      !isNaN(yieldDiff)
        ? {
            value: `${yieldDiff > 0 ? "+" : ""}${yieldDiff.toFixed(1)}%`,
            type: getComparisonType(yieldDiff),
            label: "vs suburb avg",
          }
        : undefined,
    highlight:
      grossYield === null || suburbYield === null
        ? "neutral"
        : yieldDiff > 0
        ? "positive"
        : yieldDiff < 0
        ? "negative"
        : "neutral",
  };

  // ---------- 2. WEEKLY RENT ----------
  const rentDiff =
    weeklyRent !== null && medianRent !== null
      ? weeklyRent - medianRent
      : NaN;

  const weeklyRentMetric: FinancialMetric = {
    id: "weekly-rent",
    label: "Weekly Rent",
    value: formatCurrency(weeklyRent),
    comparison:
      !isNaN(rentDiff)
        ? {
            value: `${rentDiff > 0 ? "+" : ""}${formatCurrency(rentDiff)}`,
            type: getComparisonType(rentDiff),
            label: "vs median",
          }
        : undefined,
    highlight:
      weeklyRent === null
        ? "neutral"
        : rentDiff > 0
        ? "positive"
        : "neutral",
  };

  // ---------- 3. ANNUAL CASHFLOW ----------
  let annualCashflow: number | null = null;

  if (weeklyRent !== null) {
    const annualRent = weeklyRent * 52;

    // Base cost = 25%
    let costRatio = 0.25;

    // Optional adjustments
    if (suburbMetrics?.metrics?.vacancyRate) {
      costRatio += Math.min(suburbMetrics.metrics.vacancyRate, 0.1); // cap impact
    }

    if (suburbMetrics?.metrics?.renterProportion) {
      costRatio += suburbMetrics.metrics.renterProportion * 0.05; // mild adjustment
    }

    const costs = annualRent * costRatio;
    annualCashflow = annualRent - costs;
  }

  const annualCashflowMetric: FinancialMetric = {
    id: "annual-cashflow",
    label: "Annual Cashflow",
    value: formatCurrency(annualCashflow),
    comparison: annualCashflow !== null
      ? {
          value: "est.",
          type: "neutral",
        }
      : undefined,
    highlight:
      annualCashflow === null
        ? "neutral"
        : annualCashflow > 1000
        ? "positive"
        : annualCashflow < 0
        ? "negative"
        : "warning",
  };

  // ---------- 4. 5Y GROWTH ----------
  let growth: number | null = null;

  if (suburbMetrics?.metrics?.capitalGrowthScore !== undefined) {
    // Map score (assume 0–10) → 2%–8%
    growth = 2 + (Math.min(Math.max(suburbMetrics.metrics.capitalGrowthScore, 0), 10) / 10) * 6;
  } else if (abs?.populationGrowth !== undefined) {
    growth = abs.populationGrowth;
  }

  const growthMetric: FinancialMetric = {
    id: "5y-growth",
    label: "5Y Growth",
    value: formatPercent(growth),
    highlight:
      growth === null
        ? "neutral"
        : growth >= 6
        ? "positive"
        : growth >= 3
        ? "neutral"
        : "warning",
  };

  // ---------- FINAL OUTPUT ----------
  return [
    grossYieldMetric,
    weeklyRentMetric,
    annualCashflowMetric,
    growthMetric,
  ];
};