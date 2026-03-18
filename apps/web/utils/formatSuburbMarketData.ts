import { Doc } from "@propure/convex/genereated";

const formatNumber = (n?: number) =>
  n !== undefined && n !== null ? n.toLocaleString("en-US") : "Not specified";

const formatPercent = (n?: number) =>
  n !== undefined && n !== null ? `${n}%` : "Not specified";

const buildTable = (
  title: string,
  data?: Array<{ label: string; percentage?: number }>,
  limit = 5
): string[] => {
  if (!data || data.length === 0) return [];

  const rows = data
    .filter((d) => d.percentage !== undefined)
    .sort((a, b) => (b.percentage! - a.percentage!))
    .slice(0, limit);

  if (rows.length === 0) return [];

  const lines: string[] = [];
  lines.push(`\n${title}:`);
  lines.push(`| Category | % |`);
  lines.push(`|----------|----|`);

  rows.forEach((r) => {
    lines.push(`| ${r.label} | ${r.percentage}% |`);
  });

  return lines;
};

export function buildABSContext(abs: Doc<"absMarketData">): string {
  const sections: string[] = [];

  sections.push(`[SUBURB DEMOGRAPHIC & ECONOMIC CONTEXT]`);

  // Location
  sections.push(`\nLocation:`);
  sections.push(`- Suburb: ${abs.suburb ?? "Not specified"}`);
  sections.push(`- Postcode: ${abs.postcode ?? "Not specified"}`);
  sections.push(`- State: ${abs.state ?? "Not specified"}`);
  sections.push(`- Census Year: ${abs.census_year}`);

  // Population
  sections.push(`\nPopulation Overview:`);
  sections.push(
    `- Total Population: ${formatNumber(abs.totalPopulation)}`,
    `- Median Age: ${abs.medianAge ?? "Not specified"}`,
    `- Population Growth: ${formatPercent(abs.populationGrowth)}`,
    `- Gender Split: ${formatPercent(abs.malePercentage)} Male / ${formatPercent(
      abs.femalePercentage
    )} Female`
  );

  // Income
  sections.push(`\nIncome Profile:`);
  sections.push(
    `- Median Weekly Household Income: ${formatNumber(
      abs.medianWeeklyHouseholdIncome
    )}`,
    `- Median Weekly Personal Income: ${formatNumber(
      abs.medianWeeklyPersonalIncome
    )}`,
    `- Median Weekly Rent: ${formatNumber(abs.medianWeeklyRent)}`,
    `- Median Monthly Mortgage: ${formatNumber(
      abs.medianMonthlyMortgageRepayment
    )}`
  );

  // Housing
  sections.push(`\nHousing Composition:`);
  sections.push(
    `- Owner Occupied: ${formatPercent(abs.ownerOccupied)}`,
    `- Rented: ${formatPercent(abs.rented)}`
  );

  // Tables (important)
  sections.push(
    ...buildTable("Occupational Profile (Top)", abs.occupationTopResponses)
  );

  sections.push(
    ...buildTable("Industry Profile (Top)", abs.industryTopResponses)
  );

  sections.push(
    ...buildTable("Income Distribution", abs.medianWeeklyIncomes)
  );

  // Derived Insights (VERY important)
  sections.push(`\nKey Demographic Signals:`);

  if ((abs.rented ?? 0) > 50) {
    sections.push(
      `- High renter proportion indicates strong investor and tenant demand.`
    );
  }

  if ((abs.medianWeeklyHouseholdIncome ?? 0) > 1500) {
    sections.push(
      `- Above-average household income suggests strong borrowing capacity and price support.`
    );
  }

  if ((abs.medianAge ?? 0) < 35) {
    sections.push(
      `- Younger population may indicate rental demand and long-term growth potential.`
    );
  }

  if ((abs.populationGrowth ?? 0) > 1.5) {
    sections.push(
      `- Positive population growth supports housing demand and capital appreciation.`
    );
  }

  return sections.join("\n");
}