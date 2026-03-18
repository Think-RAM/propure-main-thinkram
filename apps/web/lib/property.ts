import { calculateCashFlow, calculateFinancialMetrics } from "@/utils/financialMetric";
import { getMarketInsight } from "@/utils/marketInsight";
import { getComparableProperties, getPropertyBadge, getPropertyProjections, getPropertyStrategyInsight, getStrategyScore } from "@/utils/propertyInsight";
import { generateRiskMetrics } from "@/utils/riskMetrics";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";

export interface PropertyData {
  title: string;
  location: string;
  price: number;
  priceRange: string;
  features: {
    beds: number;
    baths: number;
    parking: number;
    area: number;
  };
  images: { id: string; url: string; alt: string }[];
  badge?: "Cash Flow Positive" | "High Growth Potential" | "Value Buy";
  strategyScore?: number;
  strategyLabel?: string;
  market: {
    type: "seller" | "buyer" | "neutral";
    title: string;
    description: string;
  };
  financials: FinancialMetric[];
  cashflow: {
    "5y": CashflowPoint[];
    "10y": CashflowPoint[];
    "20y": CashflowPoint[];
  };
  risk: {
    score: number; // e.g. 43
    label: string; // "Low-Medium Risk"

    factors: {
      name: string;
      value: number; // 0–100
    }[];
  };
  scenarios: Scenario[];
  comparables: ComparableProperty[];
  aiInsights?: AiInsights;
}

export interface AiInsights {
  confidence: number; // 0–100

  confidenceFactors: string[];

  cashFlow: {
    level: "strong" | "moderate" | "weak";
    description: string;
  };

  consideration: {
    title: string;
    description: string;
  };

  growth: {
    title: string;
    description: string;
  };
}

export interface ComparableProperty {
  id: string;

  address: string;
  suburb: string;

  price: number;
  date: string;

  beds: number;
  landSize: number;
  pricePerSqm: number;

  comparison: {
    type: "similar" | "higher" | "lower" | "smaller" | "larger";
    label?: string;
  };

  image?: string;
}

export interface Scenario {
  id: string;
  type: "optimistic" | "base" | "pessimistic";

  title: string;
  subtitle: string;

  metrics: {
    propertyValue: number;
    equity: number;
    roi: number; // % value (number, not string)
  };

  isRecommended?: boolean; // optional override
}

export interface FinancialMetric {
  id: "gross-rental-yield" | "weekly-rent" | "annual-cashflow" | "5y-growth";
  label: string;
  value: string;

  // comparison context
  comparison?: {
    value: string; // "+0.3%" / "-2%"
    type: "positive" | "negative" | "neutral";
    label?: string; // "vs suburb avg"
  };

  // optional emphasis override
  highlight?: "positive" | "negative" | "warning" | "neutral";
}

export interface CashflowPoint {
  year: string;
  cashflow: number;
  equity?: number; // optional (for future dual-line support)
}

const _getPropertyDetails = async (propertyId: string, chatId?: string) => {
  try {
    // 1. Fetch property (blocking dependency)
    const property = await client.query(
      api.functions.properties.getPropertyByExternalIdOrAddress,
      { externalId: propertyId }
    );

    if (!property) throw new Error("Property not found");

    const postcode = property.address.postcode;
    const fullAddress = `${property.address.displayAddress}, ${property.address.suburb}, ${property.address.state} ${postcode}`;

    // 2. Fetch base data in parallel
    const [suburbMetrics, absData] = await Promise.all([
      client.query(api.functions.suburbMetrics.getSuburbMetrics, { postcode }),
      client.query(api.functions.absMarketData.getAbsMarketDataByPostcode, { postcode }),
    ]);

    // 3. Start ALL async computations in parallel
    const badgePromise = getPropertyBadge(property, suburbMetrics, absData);
    const marketPromise = getMarketInsight(suburbMetrics, absData);
    const scenariosPromise = getPropertyProjections(property, suburbMetrics, absData);
    const comparablesPromise = getComparableProperties(property);
    const riskPromise = generateRiskMetrics(suburbMetrics, absData, fullAddress);

    // CPU-bound (no await needed)
    const financials = calculateFinancialMetrics(property, suburbMetrics, absData);
    const cashflow = calculateCashFlow(property, suburbMetrics, absData);

    // 4. Strategy-specific (conditional parallel block)
    let strategyLabel: string | undefined;
    let strategyScore: number | undefined;
    let aiInsights: AiInsights | undefined;

    if (chatId) {
      const strategy = await client.query(
        api.functions.strategy.GetStrategyByChatId,
        { chatId }
      );

      const [strategyRes, insights] = await Promise.all([
        getStrategyScore(property, suburbMetrics, absData, strategy),
        getPropertyStrategyInsight(property, suburbMetrics, absData, strategy),
      ]);

      strategyLabel = strategyRes.strategyLabel;
      strategyScore = strategyRes.strategyScore;
      aiInsights = insights;
    }

    // 5. Resolve remaining async in parallel
    const [badge, market, scenarios, comparables, risk] = await Promise.all([
      badgePromise,
      marketPromise,
      scenariosPromise,
      comparablesPromise,
      riskPromise,
    ]);

    return {
      title: property.address.displayAddress,
      location: `${property.address.suburb}, ${property.address.state}`,
      price: property.priceValue ?? 0,
      priceRange:
        property.priceFrom && property.priceTo
          ? `$${property.priceFrom.toLocaleString()} - $${property.priceTo.toLocaleString()}`
          : "N/A",

      features: {
        beds: property.features?.bedrooms ?? 0,
        baths: property.features?.bathrooms ?? 0,
        parking: property.features?.parkingSpaces ?? 0,
        area: property.features?.landSize ?? 0,
      },

      images:
        property.images?.map((img, i) => ({
          id: `${property._id}-${i}`,
          url: img,
          alt: `Image ${i + 1} of ${property.address.displayAddress}`,
        })) ?? [],

      badge,
      strategyLabel,
      strategyScore,
      market,
      financials,
      cashflow,
      scenarios,
      comparables,
      aiInsights,
      risk,
    };
  } catch (error) {
    console.error("Error fetching property details:", error);
    throw new Error("Failed to fetch property details");
  }
};

export const getPropertyDetails = async (propertyId: string, chatId?: string) => {
  "use cache";
  return _getPropertyDetails(propertyId, chatId);
}