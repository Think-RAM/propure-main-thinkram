import { Doc } from "@propure/convex/genereated";


const formatNumber = (n?: number) =>
  n !== undefined && n !== null
    ? n.toLocaleString("en-US")
    : "Not specified";

const formatCurrency = (n?: number) =>
  n !== undefined && n !== null
    ? `$${n.toLocaleString("en-US")}`
    : "Not specified";

const liquidityLabel = (days?: number) => {
  if (!days) return "Unknown";
  if (days <= 30) return "High";
  if (days <= 60) return "Moderate";
  return "Low";
};

const resolvePrice = (p: Doc<"properties">) => {
  if (p.priceValue) return p.priceValue;
  if (p.priceFrom && p.priceTo) return (p.priceFrom + p.priceTo) / 2;
  if (p.priceFrom) return p.priceFrom;
  return undefined;
};

const getPricePosition = (
  price?: number,
  estimate?: { low?: number; high?: number }
) => {
  if (!price || !estimate?.low || !estimate?.high) return "Unknown";

  if (price < estimate.low) return "Undervalued";
  if (price > estimate.high) return "Overpriced";
  return "Fairly priced";
};

export function buildPropertyPromptContext(property: Doc<"properties">): string {
  const sections: string[] = [];

  const price = resolvePrice(property);

  // Yield calc
  const rent = property.propertyRentEstimate;
  const yieldPercent =
    price && rent ? ((rent * 52) / price) * 100 : undefined;

  sections.push(`[PROPERTY CONTEXT]`);

  // Address
  sections.push(`\nAddress:`);
  sections.push(`- ${property.address.displayAddress}`);

  // Listing
  sections.push(`\nListing Overview:`);
  sections.push(
    `- Property Type: ${property.features?.propertyType ?? "Not specified"}`,
    `- Listing Type: ${property.listingType}`,
    `- Status: ${property.listingStatus ?? "Not specified"}`,
    `- Days on Market: ${property.daysOnMarket ?? "Not specified"} (${
      liquidityLabel(parseInt((property.daysOnMarket ?? "0").toString()))
    } liquidity)`
  );

  // Pricing
  sections.push(`\nPricing:`);
  sections.push(
    `- Listing Price: ${
      property.price ?? formatCurrency(price)
    }`,
    `- Estimated Value Range: ${
      property.propertyValueEstimate?.low
        ? formatCurrency(property.propertyValueEstimate.low)
        : "?"
    } – ${
      property.propertyValueEstimate?.high
        ? formatCurrency(property.propertyValueEstimate.high)
        : "?"
    }`,
    `- Price Positioning: ${getPricePosition(
      price,
      property.propertyValueEstimate
    )}`
  );

  // Rental
  sections.push(`\nRental Potential:`);
  sections.push(
    `- Estimated Weekly Rent: ${formatCurrency(rent)}`,
    `- Estimated Yield: ${
      yieldPercent ? yieldPercent.toFixed(2) + "%" : "Not specified"
    }`
  );

  // Features
  sections.push(`\nProperty Features:`);
  sections.push(
    `- Bedrooms: ${property.features?.bedrooms ?? "Not specified"}`,
    `- Bathrooms: ${property.features?.bathrooms ?? "Not specified"}`,
    `- Parking: ${property.features?.parkingSpaces ?? "Not specified"}`,
    `- Land Size: ${property.features?.landSize ?? "Not specified"} sqm`,
    `- Building Size: ${
      property.features?.buildingSize ?? "Not specified"
    } sqm`
  );

  if (property.features?.features?.length) {
    sections.push(`\nKey Features:`);
    sections.push(`- ${property.features.features.join(", ")}`);
  }

  // Agent
  if (property.agentName || property.agencyName) {
    sections.push(`\nAgent:`);
    sections.push(
      `- ${property.agentName ?? ""} ${
        property.agencyName ? `(${property.agencyName})` : ""
      }`
    );
  }

  // Investment Signals (VERY IMPORTANT)
  sections.push(`\nKey Investment Signals:`);

  if (yieldPercent && yieldPercent > 5) {
    sections.push(`- Strong rental yield indicates good cash flow potential.`);
  } else if (yieldPercent && yieldPercent < 3) {
    sections.push(`- Low rental yield suggests reliance on capital growth.`);
  }

  if (property.daysOnMarket && property.daysOnMarket < 30) {
    sections.push(`- Fast-moving listing indicates strong demand.`);
  }

  if (
    price &&
    property.propertyValueEstimate?.low &&
    price < property.propertyValueEstimate.low
  ) {
    sections.push(`- Property appears undervalued relative to market estimates.`);
  }

  if (!yieldPercent && !price) {
    sections.push(`- Limited financial data available for full evaluation.`);
  }

  return sections.join("\n");
}