/**
 * Mock data for Australian economic indicators
 *
 * This file provides realistic mock data for testing the MCP market data
 * server without making real API calls.
 *
 * Enable mock mode by setting: MCP_MOCK_MODE=true
 *
 * Data sources and references:
 * - RBA Cash Rate: https://www.rba.gov.au/statistics/cash-rate/
 * - Economic Indicators: RBA Statement on Monetary Policy
 * - Demographics: ABS 2021 Census
 * - Building Approvals: ABS Building Approvals Australia
 * - Population Projections: ABS Population Projections
 */

import type { AustralianState } from "@propure/mcp-shared";

// =============================================================================
// RBA DATA
// =============================================================================

/**
 * RBA Cash Rate - Historical data going back 12 months
 * Based on actual RBA decisions through late 2024
 */
export const MOCK_RBA_CASH_RATE = {
  current: {
    rate: 4.35,
    effectiveDate: "2023-11-08",
  },
  historical: [
    { date: "8 November 2023", value: 4.35, unit: "%" },
    { date: "7 June 2023", value: 4.1, unit: "%" },
    { date: "3 May 2023", value: 3.85, unit: "%" },
    { date: "5 April 2023", value: 3.6, unit: "%" },
    { date: "8 March 2023", value: 3.6, unit: "%" },
    { date: "8 February 2023", value: 3.35, unit: "%" },
    { date: "7 December 2022", value: 3.1, unit: "%" },
    { date: "2 November 2022", value: 2.85, unit: "%" },
    { date: "5 October 2022", value: 2.6, unit: "%" },
    { date: "7 September 2022", value: 2.35, unit: "%" },
    { date: "3 August 2022", value: 1.85, unit: "%" },
    { date: "6 July 2022", value: 1.35, unit: "%" },
    { date: "8 June 2022", value: 0.85, unit: "%" },
    { date: "4 May 2022", value: 0.35, unit: "%" },
    { date: "6 November 2020", value: 0.1, unit: "%" },
    { date: "4 March 2020", value: 0.5, unit: "%" },
    { date: "3 October 2019", value: 0.75, unit: "%" },
    { date: "3 July 2019", value: 1.0, unit: "%" },
    { date: "5 June 2019", value: 1.25, unit: "%" },
  ],
};

/**
 * RBA Lending Rates - Major bank indicator rates
 * Based on typical rates with cash rate at 4.35%
 */
export const MOCK_RBA_LENDING_RATES = {
  standardVariable: 6.27,
  fixedRates: [
    { term: "1 year", rate: 5.99 },
    { term: "2 years", rate: 5.89 },
    { term: "3 years", rate: 5.79 },
    { term: "5 years", rate: 5.99 },
  ],
};

/**
 * Economic Indicators - Key Australian economic metrics
 * Based on Q4 2024 estimates
 */
export const MOCK_ECONOMIC_INDICATORS = {
  gdpGrowth: 1.5, // Annual GDP growth %
  inflation: 3.5, // Annual CPI %
  unemployment: 4.1, // Unemployment rate %
  wageGrowth: 4.2, // Annual wage price index %
};

// =============================================================================
// ABS DEMOGRAPHICS DATA
// =============================================================================

/**
 * State-level demographics from 2021 Census
 * with minor adjustments for 2024 estimates
 */
export const MOCK_STATE_DEMOGRAPHICS: Record<
  string,
  {
    population: number;
    medianAge: number;
    medianWeeklyIncome: number;
    medianMonthlyMortgage: number;
    medianWeeklyRent: number;
    ownerOccupied: number;
    rented: number;
    unemploymentRate: number;
  }
> = {
  NSW: {
    population: 8_350_000, // Updated estimate for 2024
    medianAge: 38,
    medianWeeklyIncome: 850,
    medianMonthlyMortgage: 2_400,
    medianWeeklyRent: 580,
    ownerOccupied: 63.5,
    rented: 32.2,
    unemploymentRate: 3.9,
  },
  VIC: {
    population: 6_750_000,
    medianAge: 37,
    medianWeeklyIncome: 820,
    medianMonthlyMortgage: 2_200,
    medianWeeklyRent: 520,
    ownerOccupied: 65.3,
    rented: 29.5,
    unemploymentRate: 4.2,
  },
  QLD: {
    population: 5_450_000,
    medianAge: 38,
    medianWeeklyIncome: 790,
    medianMonthlyMortgage: 2_100,
    medianWeeklyRent: 550,
    ownerOccupied: 62.1,
    rented: 33.5,
    unemploymentRate: 4.5,
  },
  WA: {
    population: 2_850_000,
    medianAge: 37,
    medianWeeklyIncome: 920,
    medianMonthlyMortgage: 2_300,
    medianWeeklyRent: 600,
    ownerOccupied: 65.8,
    rented: 28.8,
    unemploymentRate: 3.5,
  },
  SA: {
    population: 1_850_000,
    medianAge: 40,
    medianWeeklyIncome: 740,
    medianMonthlyMortgage: 1_750,
    medianWeeklyRent: 420,
    ownerOccupied: 65.2,
    rented: 28.6,
    unemploymentRate: 4.6,
  },
  TAS: {
    population: 575_000,
    medianAge: 42,
    medianWeeklyIncome: 700,
    medianMonthlyMortgage: 1_600,
    medianWeeklyRent: 400,
    ownerOccupied: 66.3,
    rented: 27.8,
    unemploymentRate: 5.0,
  },
  NT: {
    population: 250_000,
    medianAge: 33,
    medianWeeklyIncome: 980,
    medianMonthlyMortgage: 2_100,
    medianWeeklyRent: 520,
    ownerOccupied: 44.2,
    rented: 38.8,
    unemploymentRate: 3.8,
  },
  ACT: {
    population: 475_000,
    medianAge: 35,
    medianWeeklyIncome: 1_100,
    medianMonthlyMortgage: 2_600,
    medianWeeklyRent: 600,
    ownerOccupied: 64.5,
    rented: 31.2,
    unemploymentRate: 3.0,
  },
};

/**
 * Major suburb demographics for testing
 * Based on 2021 Census with 2024 adjustments
 */
export const MOCK_SUBURB_DEMOGRAPHICS: Record<
  string,
  {
    state: string;
    population: number;
    medianAge: number;
    medianWeeklyIncome: number;
    medianMonthlyMortgage: number;
    medianWeeklyRent: number;
    ownerOccupied: number;
    rented: number;
    unemploymentRate: number;
  }
> = {
  // Sydney suburbs
  Parramatta: {
    state: "NSW",
    population: 32_000,
    medianAge: 33,
    medianWeeklyIncome: 890,
    medianMonthlyMortgage: 2_500,
    medianWeeklyRent: 580,
    ownerOccupied: 35.2,
    rented: 58.5,
    unemploymentRate: 4.2,
  },
  Bondi: {
    state: "NSW",
    population: 12_500,
    medianAge: 35,
    medianWeeklyIncome: 1_250,
    medianMonthlyMortgage: 3_200,
    medianWeeklyRent: 750,
    ownerOccupied: 42.5,
    rented: 52.3,
    unemploymentRate: 3.1,
  },
  Blacktown: {
    state: "NSW",
    population: 52_000,
    medianAge: 34,
    medianWeeklyIncome: 720,
    medianMonthlyMortgage: 2_100,
    medianWeeklyRent: 450,
    ownerOccupied: 55.8,
    rented: 38.2,
    unemploymentRate: 5.1,
  },
  Liverpool: {
    state: "NSW",
    population: 35_000,
    medianAge: 32,
    medianWeeklyIncome: 680,
    medianMonthlyMortgage: 2_000,
    medianWeeklyRent: 420,
    ownerOccupied: 48.5,
    rented: 44.2,
    unemploymentRate: 5.5,
  },
  // Melbourne suburbs
  Richmond: {
    state: "VIC",
    population: 28_000,
    medianAge: 34,
    medianWeeklyIncome: 1_100,
    medianMonthlyMortgage: 2_800,
    medianWeeklyRent: 620,
    ownerOccupied: 38.5,
    rented: 56.2,
    unemploymentRate: 3.5,
  },
  Footscray: {
    state: "VIC",
    population: 18_000,
    medianAge: 32,
    medianWeeklyIncome: 780,
    medianMonthlyMortgage: 2_200,
    medianWeeklyRent: 480,
    ownerOccupied: 42.1,
    rented: 51.8,
    unemploymentRate: 4.8,
  },
  Dandenong: {
    state: "VIC",
    population: 32_000,
    medianAge: 35,
    medianWeeklyIncome: 620,
    medianMonthlyMortgage: 1_800,
    medianWeeklyRent: 380,
    ownerOccupied: 52.5,
    rented: 41.2,
    unemploymentRate: 6.2,
  },
  // Brisbane suburbs
  "South Brisbane": {
    state: "QLD",
    population: 8_500,
    medianAge: 30,
    medianWeeklyIncome: 1_050,
    medianMonthlyMortgage: 2_600,
    medianWeeklyRent: 650,
    ownerOccupied: 25.5,
    rented: 68.2,
    unemploymentRate: 3.8,
  },
  "West End": {
    state: "QLD",
    population: 12_000,
    medianAge: 32,
    medianWeeklyIncome: 920,
    medianMonthlyMortgage: 2_400,
    medianWeeklyRent: 580,
    ownerOccupied: 32.1,
    rented: 62.5,
    unemploymentRate: 4.0,
  },
  Logan: {
    state: "QLD",
    population: 42_000,
    medianAge: 33,
    medianWeeklyIncome: 650,
    medianMonthlyMortgage: 1_750,
    medianWeeklyRent: 420,
    ownerOccupied: 58.5,
    rented: 35.2,
    unemploymentRate: 5.8,
  },
  // Perth suburbs
  Fremantle: {
    state: "WA",
    population: 8_200,
    medianAge: 38,
    medianWeeklyIncome: 950,
    medianMonthlyMortgage: 2_400,
    medianWeeklyRent: 550,
    ownerOccupied: 48.5,
    rented: 45.2,
    unemploymentRate: 3.5,
  },
  Joondalup: {
    state: "WA",
    population: 22_000,
    medianAge: 36,
    medianWeeklyIncome: 880,
    medianMonthlyMortgage: 2_200,
    medianWeeklyRent: 520,
    ownerOccupied: 62.5,
    rented: 32.1,
    unemploymentRate: 3.8,
  },
  // Adelaide suburbs
  Adelaide: {
    state: "SA",
    population: 15_000,
    medianAge: 36,
    medianWeeklyIncome: 820,
    medianMonthlyMortgage: 1_900,
    medianWeeklyRent: 450,
    ownerOccupied: 35.2,
    rented: 58.5,
    unemploymentRate: 4.2,
  },
  Glenelg: {
    state: "SA",
    population: 6_500,
    medianAge: 42,
    medianWeeklyIncome: 780,
    medianMonthlyMortgage: 2_100,
    medianWeeklyRent: 480,
    ownerOccupied: 52.5,
    rented: 42.1,
    unemploymentRate: 4.5,
  },
};

// =============================================================================
// BUILDING APPROVALS DATA
// =============================================================================

/**
 * Monthly building approvals by state
 * Based on ABS Building Approvals Australia data
 */
export const MOCK_BUILDING_APPROVALS_BASE: Record<
  string,
  { total: number; houses: number; apartments: number; valueMillions: number }
> = {
  NSW: { total: 4_800, houses: 1_600, apartments: 3_200, valueMillions: 2_600 },
  VIC: { total: 4_500, houses: 1_900, apartments: 2_600, valueMillions: 2_300 },
  QLD: { total: 4_000, houses: 2_200, apartments: 1_800, valueMillions: 2_000 },
  WA: { total: 2_000, houses: 1_300, apartments: 700, valueMillions: 1_050 },
  SA: { total: 1_000, houses: 650, apartments: 350, valueMillions: 520 },
  TAS: { total: 380, houses: 260, apartments: 120, valueMillions: 190 },
  NT: { total: 140, houses: 75, apartments: 65, valueMillions: 80 },
  ACT: { total: 420, houses: 140, apartments: 280, valueMillions: 260 },
};

/**
 * Generate deterministic building approvals data for a given number of months
 * Uses seeded pseudo-random variation for consistent test results
 */
export function generateBuildingApprovals(
  state: AustralianState | undefined,
  months: number = 12,
): Array<{
  period: string;
  state: string;
  totalDwellings: number;
  houses: number;
  apartments: number;
  valueMillions: number;
}> {
  const stateCode = state || "NSW";
  const base =
    MOCK_BUILDING_APPROVALS_BASE[stateCode] || MOCK_BUILDING_APPROVALS_BASE.NSW;

  const result: Array<{
    period: string;
    state: string;
    totalDwellings: number;
    houses: number;
    apartments: number;
    valueMillions: number;
  }> = [];

  // Use a fixed reference date for deterministic output
  const referenceDate = new Date("2024-10-01");

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(referenceDate);
    date.setMonth(date.getMonth() - i);

    // Seasonal variation: stronger in warmer months (Oct-Mar)
    const month = date.getMonth();
    const seasonalFactor =
      month >= 9 || month <= 2 ? 1.1 : month >= 3 && month <= 5 ? 0.95 : 0.9;

    // Slight trend variation based on month index (simulating market cycles)
    const trendFactor = 0.95 + (i % 6) * 0.02;

    const variation = seasonalFactor * trendFactor;

    result.push({
      period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      state: stateCode,
      totalDwellings: Math.round(base.total * variation),
      houses: Math.round(base.houses * variation),
      apartments: Math.round(base.apartments * variation),
      valueMillions: Math.round(base.valueMillions * variation),
    });
  }

  return result;
}

// =============================================================================
// POPULATION PROJECTIONS
// =============================================================================

/**
 * Population projections by state
 * Based on ABS Population Projections (Series B - medium)
 */
export const MOCK_POPULATION_PROJECTIONS: Record<
  string,
  {
    current: number;
    projected2030: number;
    projected2040: number;
    growthRate: number;
  }
> = {
  NSW: {
    current: 8_350_000,
    projected2030: 9_300_000,
    projected2040: 10_500_000,
    growthRate: 1.3,
  },
  VIC: {
    current: 6_750_000,
    projected2030: 7_700_000,
    projected2040: 8_900_000,
    growthRate: 1.5,
  },
  QLD: {
    current: 5_450_000,
    projected2030: 6_350_000,
    projected2040: 7_500_000,
    growthRate: 1.7,
  },
  WA: {
    current: 2_850_000,
    projected2030: 3_250_000,
    projected2040: 3_750_000,
    growthRate: 1.4,
  },
  SA: {
    current: 1_850_000,
    projected2030: 1_980_000,
    projected2040: 2_100_000,
    growthRate: 0.7,
  },
  TAS: {
    current: 575_000,
    projected2030: 620_000,
    projected2040: 660_000,
    growthRate: 0.7,
  },
  NT: {
    current: 250_000,
    projected2030: 275_000,
    projected2040: 300_000,
    growthRate: 1.0,
  },
  ACT: {
    current: 475_000,
    projected2030: 550_000,
    projected2040: 640_000,
    growthRate: 1.5,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.MCP_MOCK_MODE === "true";
}

/**
 * Normalize suburb name for lookup (case-insensitive, trimmed)
 */
export function normalizeSuburbName(suburb: string): string {
  return suburb.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Find suburb demographics by name (case-insensitive)
 */
export function findSuburbDemographics(
  suburb: string,
): (typeof MOCK_SUBURB_DEMOGRAPHICS)[string] | undefined {
  const normalized = normalizeSuburbName(suburb);
  const entry = Object.entries(MOCK_SUBURB_DEMOGRAPHICS).find(
    ([key]) => normalizeSuburbName(key) === normalized,
  );
  return entry ? entry[1] : undefined;
}
