import { Doc } from "@propure/convex/genereated";

const formatNumber = (num?: number) =>
  num !== undefined && num !== null
    ? num.toLocaleString("en-US")
    : "Not specified";

const formatPercent = (num?: number) =>
  num !== undefined && num !== null
    ? `${num}%`
    : "Not specified";

const scoreToLabel = (score: number) => {
  if (score >= 8) return "Very High";
  if (score >= 6) return "High";
  if (score >= 4) return "Moderate";
  if (score >= 2) return "Low";
  return "Very Low";
};

const riskLabel = (score: number) => {
  if (score >= 7) return "High";
  if (score >= 4) return "Moderate";
  return "Low";
};

const liquidityLabel = (days: number) => {
  if (days <= 30) return "High";
  if (days <= 60) return "Moderate";
  return "Low";
};

const supplyLabel = (stock: number) => {
  if (stock < 2) return "Very Low";
  if (stock < 4) return "Low";
  if (stock < 7) return "Moderate";
  return "High";
};

export function buildSuburbMetricsPromptContext(
  suburb: Doc<"suburbMetrics">
): string {
  const m = suburb.metrics;

  const sections: string[] = [];

  sections.push(`[SUBURB MARKET CONTEXT]`);

  // Location
  sections.push(`\nLocation:`);
  sections.push(`- Postcode: ${suburb.postcode}`);
  sections.push(
    `- Coordinates: (${suburb.centerLat}, ${suburb.centerLng})`
  );

  // Market Overview
  sections.push(`\nMarket Overview:`);
  sections.push(
    `- Typical Property Value: ${formatNumber(m.typicalValue)}`,
    `- Median Value: ${formatNumber(m.medianValue)}`,
    `- Market Liquidity: ${liquidityLabel(
      m.averageDaysOnMarket
    )} (${m.averageDaysOnMarket} days on market)`,
    `- Auction Clearance Rate: ${scoreToLabel(
      m.auctionClearanceRate / 10
    )} (${formatPercent(m.auctionClearanceRate)})`
  );

  // Rental Market
  sections.push(`\nRental Market:`);
  sections.push(
    `- Rental Yield: ${formatPercent(m.netYield)}`,
    `- Vacancy Rate: ${formatPercent(m.vacancyRate)}`,
    `- Renter Proportion: ${formatPercent(m.renterProportion)}`
  );

  // Supply
  sections.push(`\nSupply & Demand:`);
  sections.push(
    `- Stock on Market: ${supplyLabel(
      m.stockOnMarket
    )} (${m.stockOnMarket})`
  );

  // Investment Signals
  sections.push(`\nInvestment Signals:`);
  sections.push(
    `- Capital Growth Potential: ${scoreToLabel(
      m.capitalGrowthScore
    )} (${m.capitalGrowthScore}/10)`,
    `- Cash Flow Strength: ${scoreToLabel(
      m.cashFlowScore
    )} (${m.cashFlowScore}/10)`,
    `- Overall Risk Level: ${riskLabel(
      m.riskScore
    )} (${m.riskScore}/10)`
  );

  // Risk Breakdown
  sections.push(`\nRisk Breakdown:`);
  sections.push(
    `- Market Risk: ${riskLabel(m.risk.marketRisk)}`,
    `- Financial Risk: ${riskLabel(m.risk.financialRisk)}`,
    `- Liquidity Risk: ${riskLabel(m.risk.liquidityRisk)}`,
    `- Concentration Risk: ${riskLabel(m.risk.concentrationRisk)}`
  );

  // Data Confidence
  sections.push(`\nData Confidence:`);
  sections.push(
    `- Completeness Score: ${m.dataCompletenessScore} ${
      m.dataCompletenessScore > 0.8
        ? "(High reliability)"
        : m.dataCompletenessScore > 0.5
        ? "(Moderate reliability)"
        : "(Low reliability)"
    }`
  );

  return sections.join("\n");
}