// Market sources facade (mock-aware - use this for most cases)
export {
  getRbaCashRate,
  getRbaLendingRates,
  getRbaEconomicIndicators,
  getAbsDemographics,
  getAbsBuildingApprovals,
  getAbsPopulationProjections,
} from "./market-sources";

// Direct API implementations (bypasses mock mode)
export {
  getRbaCashRate as getRbaCashRateDirect,
  getRbaLendingRates as getRbaLendingRatesDirect,
  getRbaEconomicIndicators as getRbaEconomicIndicatorsDirect,
} from "./rba-api";

export {
  getAbsDemographics as getAbsDemographicsDirect,
  getAbsBuildingApprovals as getAbsBuildingApprovalsDirect,
  getAbsPopulationProjections as getAbsPopulationProjectionsDirect,
} from "./abs-api";

// Mock data exports for testing
export {
  isMockModeEnabled,
  MOCK_RBA_CASH_RATE,
  MOCK_RBA_LENDING_RATES,
  MOCK_ECONOMIC_INDICATORS,
  MOCK_STATE_DEMOGRAPHICS,
  MOCK_SUBURB_DEMOGRAPHICS,
  MOCK_BUILDING_APPROVALS_BASE,
  MOCK_POPULATION_PROJECTIONS,
  generateBuildingApprovals,
  findSuburbDemographics,
} from "./mock-data";
