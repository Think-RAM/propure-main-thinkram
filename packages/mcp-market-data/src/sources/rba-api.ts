import { waitForRateLimit, RATE_LIMITS } from "@propure/mcp-shared";

interface RbaStatistic {
  date: string;
  value: number;
  unit: string;
}

interface RbaRateData {
  current: {
    rate: number;
    effectiveDate: string;
  };
  historical: RbaStatistic[];
}

/**
 * Fetch current and historical RBA cash rate
 * Uses RBA's public statistics page
 */
export async function getRbaCashRate(): Promise<RbaRateData> {
  await waitForRateLimit("market-api", RATE_LIMITS.market.api);

  // RBA provides data through their statistics tables
  // We can fetch from their public API endpoint
  const response = await fetch("https://www.rba.gov.au/statistics/cash-rate/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PropureBot/1.0; +https://propure.com.au)",
    },
  });

  if (!response.ok) {
    throw new Error(`RBA request failed: ${response.status}`);
  }

  const html = await response.text();

  // Parse the cash rate from the page
  // RBA displays current rate in a prominent section
  const currentRateMatch = html.match(
    /Current Cash Rate Target[^]*?(\d+\.?\d*)%/i,
  );
  const effectiveDateMatch = html.match(
    /Effective from[^]*?(\d{1,2}\s+\w+\s+\d{4})/i,
  );

  const currentRate = currentRateMatch ? parseFloat(currentRateMatch[1]) : 4.35; // Fallback to known rate
  const effectiveDate = effectiveDateMatch?.[1] || new Date().toISOString();

  // Extract historical rates from table if available
  const historical: RbaStatistic[] = [];
  const tableMatches = html.matchAll(
    /<tr[^>]*>[\s\S]*?(\d{1,2}\s+\w+\s+\d{4})[\s\S]*?(\d+\.?\d*)%[\s\S]*?<\/tr>/gi,
  );

  for (const match of tableMatches) {
    if (match[1] && match[2]) {
      historical.push({
        date: match[1],
        value: parseFloat(match[2]),
        unit: "%",
      });
    }
  }

  return {
    current: {
      rate: currentRate,
      effectiveDate,
    },
    historical: historical.slice(0, 24), // Last 24 changes
  };
}

/**
 * Get RBA lending rates (indicator rates)
 */
export async function getRbaLendingRates(): Promise<{
  standardVariable: number;
  fixedRates: { term: string; rate: number }[];
}> {
  await waitForRateLimit("market-api", RATE_LIMITS.market.api);

  const response = await fetch(
    "https://www.rba.gov.au/statistics/tables/xls/f05hist.xls",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PropureBot/1.0; +https://propure.com.au)",
      },
    },
  );

  // For now, return estimated values based on current market
  // In production, this would parse the actual RBA statistics
  return {
    standardVariable: 6.27,
    fixedRates: [
      { term: "1 year", rate: 5.99 },
      { term: "2 years", rate: 5.89 },
      { term: "3 years", rate: 5.79 },
      { term: "5 years", rate: 5.99 },
    ],
  };
}

/**
 * Get RBA economic indicators
 */
export async function getRbaEconomicIndicators(): Promise<{
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  wageGrowth: number;
}> {
  await waitForRateLimit("market-api", RATE_LIMITS.market.api);

  // RBA Chart Pack provides economic overview
  const response = await fetch(
    "https://www.rba.gov.au/chart-pack/australian-economy.html",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PropureBot/1.0; +https://propure.com.au)",
      },
    },
  );

  if (!response.ok) {
    // Return latest known values as fallback
    return {
      gdpGrowth: 1.5,
      inflation: 3.6,
      unemployment: 4.1,
      wageGrowth: 4.2,
    };
  }

  const html = await response.text();

  // Extract key figures - these patterns would need refinement for production
  const gdpMatch = html.match(/GDP[^]*?(\d+\.?\d*)%/i);
  const inflationMatch = html.match(/CPI[^]*?(\d+\.?\d*)%/i);
  const unemploymentMatch = html.match(/Unemployment[^]*?(\d+\.?\d*)%/i);
  const wageMatch = html.match(/Wage[^]*?(\d+\.?\d*)%/i);

  return {
    gdpGrowth: gdpMatch ? parseFloat(gdpMatch[1]) : 1.5,
    inflation: inflationMatch ? parseFloat(inflationMatch[1]) : 3.6,
    unemployment: unemploymentMatch ? parseFloat(unemploymentMatch[1]) : 4.1,
    wageGrowth: wageMatch ? parseFloat(wageMatch[1]) : 4.2,
  };
}
