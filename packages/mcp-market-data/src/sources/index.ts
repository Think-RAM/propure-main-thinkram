// Market sources facade (mock-aware - use this for most cases)
// export {
//   getRbaCashRate,
//   getRbaLendingRates,
//   getRbaEconomicIndicators,
//   getAbsDemographics,
//   getAbsBuildingApprovals,
//   getAbsPopulationProjections,
// } from "./market-sources";

// Direct API implementations (bypasses mock mode)
// export {
//   getRbaCashRate as getRbaCashRateDirect,
//   getRbaLendingRates as getRbaLendingRatesDirect,
//   getRbaEconomicIndicators as getRbaEconomicIndicatorsDirect,
// } from "./rba-api";

export {
  getAbsDemographics,
  getAbsBuildingApprovals,
  getAbsPopulationProjections,
} from "./abs-api";

// Mock data exports for testing

