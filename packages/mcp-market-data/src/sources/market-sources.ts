/**
 * Market Sources Facade
 *
 * This module provides a unified interface for fetching Australian market data.
 * It automatically switches between real API calls and mock data based on the
 * MCP_MOCK_MODE environment variable.
 *
 * Usage:
 *   - Set MCP_MOCK_MODE=true to use mock data (for testing)
 *   - Leave MCP_MOCK_MODE unset or false to use real APIs
 */

import type { AustralianState } from "@propure/mcp-shared";

// Real API implementations
import {
  getRbaCashRate as getRbaCashRateReal,
  getRbaLendingRates as getRbaLendingRatesReal,
  getRbaEconomicIndicators as getRbaEconomicIndicatorsReal,
} from "./rba-api";

import {
  getAbsDemographics as getAbsDemographicsReal,
  getAbsBuildingApprovals as getAbsBuildingApprovalsReal,
  getAbsPopulationProjections as getAbsPopulationProjectionsReal,
} from "./abs-api";

// Mock data
import {
  isMockModeEnabled,
  MOCK_RBA_CASH_RATE,
  MOCK_RBA_LENDING_RATES,
  MOCK_ECONOMIC_INDICATORS,
  MOCK_STATE_DEMOGRAPHICS,
  MOCK_SUBURB_DEMOGRAPHICS,
  MOCK_POPULATION_PROJECTIONS,
  generateBuildingApprovals,
  findSuburbDemographics,
} from "./mock-data";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

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

interface LendingRates {
  standardVariable: number;
  fixedRates: { term: string; rate: number }[];
}

interface EconomicIndicators {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  wageGrowth: number;
}

interface AbsDemographics {
  suburb?: string;
  lga?: string;
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

interface BuildingApprovalData {
  period: string;
  state: string;
  totalDwellings: number;
  houses: number;
  apartments: number;
  valueMillions: number;
}

interface PopulationProjection {
  current: number;
  projected2030: number;
  projected2040: number;
  growthRate: number;
}

// =============================================================================
// RBA FUNCTIONS
// =============================================================================

/**
 * Get RBA cash rate data (current and historical)
 *
 * In mock mode: Returns static mock data
 * In real mode: Scrapes RBA website
 */
export async function getRbaCashRate(): Promise<RbaRateData> {
  if (isMockModeEnabled()) {
    // Simulate async behavior
    await delay(50);
    return MOCK_RBA_CASH_RATE;
  }

  return getRbaCashRateReal();
}

/**
 * Get RBA lending rates (standard variable and fixed)
 *
 * In mock mode: Returns static mock data
 * In real mode: Fetches from RBA statistics
 */
export async function getRbaLendingRates(): Promise<LendingRates> {
  if (isMockModeEnabled()) {
    await delay(50);
    return MOCK_RBA_LENDING_RATES;
  }

  return getRbaLendingRatesReal();
}

/**
 * Get key economic indicators (GDP, inflation, unemployment, wages)
 *
 * In mock mode: Returns static mock data
 * In real mode: Fetches from RBA chart pack
 */
export async function getRbaEconomicIndicators(): Promise<EconomicIndicators> {
  if (isMockModeEnabled()) {
    await delay(50);
    return MOCK_ECONOMIC_INDICATORS;
  }

  return getRbaEconomicIndicatorsReal();
}

// =============================================================================
// ABS FUNCTIONS
// =============================================================================

/**
 * Get ABS demographics for a suburb, LGA, or state
 *
 * In mock mode: Returns mock data for known suburbs/states
 * In real mode: Fetches from ABS Data API
 */
export async function getAbsDemographics(
  suburb?: string,
  lga?: string,
  state?: AustralianState,
): Promise<AbsDemographics | null> {
  if (isMockModeEnabled()) {
    await delay(50);
    return getMockDemographics(suburb, lga, state);
  }

  return getAbsDemographicsReal(suburb, lga, state);
}

/**
 * Get building approvals data
 *
 * In mock mode: Returns deterministic mock data
 * In real mode: Fetches from ABS Building Approvals API
 */
export async function getAbsBuildingApprovals(
  state?: AustralianState,
  months: number = 12,
): Promise<BuildingApprovalData[]> {
  if (isMockModeEnabled()) {
    await delay(50);
    return generateBuildingApprovals(state, months);
  }

  return getAbsBuildingApprovalsReal(state, months);
}

/**
 * Get population projections
 *
 * In mock mode: Returns static mock projections
 * In real mode: Fetches from ABS Population Projections
 */
export async function getAbsPopulationProjections(
  state?: AustralianState,
): Promise<PopulationProjection> {
  if (isMockModeEnabled()) {
    await delay(50);
    return getMockPopulationProjections(state);
  }

  return getAbsPopulationProjectionsReal(state);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate network delay for mock responses
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get mock demographics based on suburb, LGA, or state
 */
function getMockDemographics(
  suburb?: string,
  lga?: string,
  state?: AustralianState,
): AbsDemographics | null {
  // Try to find specific suburb data first
  if (suburb) {
    const suburbData = findSuburbDemographics(suburb);
    if (suburbData) {
      return {
        suburb,
        lga,
        state: suburbData.state,
        population: suburbData.population,
        medianAge: suburbData.medianAge,
        medianWeeklyIncome: suburbData.medianWeeklyIncome,
        medianMonthlyMortgage: suburbData.medianMonthlyMortgage,
        medianWeeklyRent: suburbData.medianWeeklyRent,
        ownerOccupied: suburbData.ownerOccupied,
        rented: suburbData.rented,
        unemploymentRate: suburbData.unemploymentRate,
      };
    }
  }

  // Fall back to state-level data
  const stateCode = state || "NSW";
  const stateData = MOCK_STATE_DEMOGRAPHICS[stateCode];

  if (!stateData) {
    return null;
  }

  return {
    suburb,
    lga,
    state: stateCode,
    population: stateData.population,
    medianAge: stateData.medianAge,
    medianWeeklyIncome: stateData.medianWeeklyIncome,
    medianMonthlyMortgage: stateData.medianMonthlyMortgage,
    medianWeeklyRent: stateData.medianWeeklyRent,
    ownerOccupied: stateData.ownerOccupied,
    rented: stateData.rented,
    unemploymentRate: stateData.unemploymentRate,
  };
}

/**
 * Get mock population projections for a state
 */
function getMockPopulationProjections(
  state?: AustralianState,
): PopulationProjection {
  const stateCode = state || "NSW";
  const projections =
    MOCK_POPULATION_PROJECTIONS[stateCode] || MOCK_POPULATION_PROJECTIONS.NSW;

  return {
    current: projections.current,
    projected2030: projections.projected2030,
    projected2040: projections.projected2040,
    growthRate: projections.growthRate,
  };
}
