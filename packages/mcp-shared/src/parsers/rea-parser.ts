import type {
  PropertyListing,
  PropertyAddress,
  PropertyFeatures,
} from "../schemas";

/**
 * Generate a deterministic hash from a string.
 * Used as a fallback ID when no proper ID can be extracted from the listing.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

interface ArgonautExchangeData {
  "resi-property_listing-experience-web"?: {
    urqlClientCache?: Record<string, unknown>;
  };
}

/**
 * Extract window.ArgonautExchange data from RealEstate.com.au HTML
 */
export function extractReaArgonautData(
  html: string,
): ArgonautExchangeData | null {
  // REA uses window.ArgonautExchange for their data
  const match = html.match(/window\.ArgonautExchange\s*=\s*({[\s\S]*?});/);

  if (!match || !match[1]) {
    // Also try alternative patterns
    const altMatch = html.match(
      /<script[^>]*>[\s\S]*?window\.ArgonautExchange\s*=\s*({[\s\S]*?});[\s\S]*?<\/script>/,
    );
    if (!altMatch || !altMatch[1]) {
      return null;
    }
    try {
      return JSON.parse(altMatch[1]) as ArgonautExchangeData;
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(match[1]) as ArgonautExchangeData;
  } catch {
    return null;
  }
}

/**
 * Extract property data from REA's urql cache
 */
function extractFromUrqlCache(
  cache: Record<string, unknown>,
): PropertyListingData | null {
  // REA uses GraphQL with urql, data is cached with various keys
  // We need to find the property listing data

  for (const [key, value] of Object.entries(cache)) {
    if (
      key.includes("Property") ||
      key.includes("Listing") ||
      key.includes("residentialListing")
    ) {
      if (value && typeof value === "object") {
        const data = value as Record<string, unknown>;

        // Check if this looks like a property listing
        if (data.address || data.propertyDetails || data.listingCompany) {
          return data as PropertyListingData;
        }
      }
    }
  }

  // Try to find data in nested structures
  for (const value of Object.values(cache)) {
    if (value && typeof value === "object") {
      const data = value as Record<string, unknown>;
      if (data.data && typeof data.data === "object") {
        const innerData = data.data as Record<string, unknown>;
        if (innerData.residentialListing || innerData.propertyListing) {
          return (innerData.residentialListing ||
            innerData.propertyListing) as PropertyListingData;
        }
      }
    }
  }

  return null;
}

interface PropertyListingData {
  id?: string;
  listingId?: string;
  headline?: string;
  description?: string;
  price?: {
    display?: string;
    from?: number;
    to?: number;
  };
  address?: {
    display?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    streetAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
  };
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    carspaces?: number;
    landArea?: number;
    buildingArea?: number;
    propertyType?: string;
    features?: string[];
  };
  media?: {
    images?: Array<{
      url?: string;
    }>;
  };
  listingCompany?: {
    id?: string;
    name?: string;
    logoUrl?: string;
  };
  listers?: Array<{
    name?: string;
    phone?: string;
  }>;
  lifeStatus?: string;
  dateAvailable?: string;
  auctionInfo?: {
    auctionDate?: string;
  };
  inspections?: Array<{
    startTime?: string;
  }>;
}

/**
 * Parse RealEstate.com.au property listing from HTML
 */
export function parseReaPropertyListing(html: string): PropertyListing | null {
  const argonautData = extractReaArgonautData(html);
  if (!argonautData) {
    // Try alternative extraction methods
    return parseReaFromJsonLd(html);
  }

  const resiWeb = argonautData["resi-property_listing-experience-web"];
  if (!resiWeb?.urqlClientCache) {
    return parseReaFromJsonLd(html);
  }

  const listingData = extractFromUrqlCache(resiWeb.urqlClientCache);
  if (!listingData) {
    return parseReaFromJsonLd(html);
  }

  return parseReaListingData(listingData);
}

function parseReaListingData(
  data: PropertyListingData,
): PropertyListing | null {
  const id = data.id || data.listingId;
  const addr = data.address;

  if (!id || !addr?.suburb || !addr?.state || !addr?.postcode) {
    return null;
  }

  const address: PropertyAddress = {
    suburb: addr.suburb,
    state: addr.state as PropertyAddress["state"],
    postcode: addr.postcode,
    displayAddress: addr.display || addr.streetAddress || addr.suburb,
    latitude: addr.location?.latitude,
    longitude: addr.location?.longitude,
  };

  const details = data.propertyDetails;
  const features: PropertyFeatures = {
    bedrooms: details?.bedrooms,
    bathrooms: details?.bathrooms,
    parkingSpaces: details?.carspaces,
    landSize: details?.landArea,
    buildingSize: details?.buildingArea,
    propertyType: normalizeReaPropertyType(details?.propertyType),
    features: details?.features,
  };

  // Determine listing type from life status
  let listingType: PropertyListing["listingType"] = "sale";
  const status = data.lifeStatus?.toLowerCase() || "";
  if (status.includes("rent") || status.includes("leased")) {
    listingType = "rent";
  } else if (status.includes("sold")) {
    listingType = "sold";
  }

  const agent = data.listers?.[0];

  return {
    externalId: `rea-${id}`,
    source: "REALESTATE",
    sourceUrl: `https://www.realestate.com.au/property-${id}`,
    address,
    features,
    price: data.price?.display,
    priceFrom: data.price?.from,
    priceTo: data.price?.to,
    listingType,
    listingStatus: normalizeReaListingStatus(data.lifeStatus),
    headline: data.headline,
    description: data.description,
    images: data.media?.images
      ?.map((img) => img.url)
      .filter((url): url is string => !!url),
    agentName: agent?.name,
    agentPhone: agent?.phone,
    agencyName: data.listingCompany?.name,
    auctionDate: data.auctionInfo?.auctionDate,
    inspectionTimes: data.inspections
      ?.map((i) => i.startTime)
      .filter((t): t is string => !!t),
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fallback: Parse from JSON-LD structured data
 */
function parseReaFromJsonLd(html: string): PropertyListing | null {
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );

  if (!jsonLdMatch) return null;

  for (const match of jsonLdMatch) {
    const jsonContent = match.replace(
      /<script type="application\/ld\+json">|<\/script>/g,
      "",
    );

    try {
      const data = JSON.parse(jsonContent) as Record<string, unknown>;

      if (
        data["@type"] === "Product" ||
        data["@type"] === "RealEstateListing"
      ) {
        return parseJsonLdListing(data);
      }
    } catch {
      continue;
    }
  }

  return null;
}

function parseJsonLdListing(
  data: Record<string, unknown>,
): PropertyListing | null {
  const address = data.address as Record<string, unknown> | undefined;

  if (!address?.addressLocality || !address?.addressRegion) {
    return null;
  }

  // Generate a unique ID from the URL or other data
  // Use a deterministic hash as fallback to avoid duplicate upserts
  const url = data.url as string | undefined;
  const idMatch = url?.match(/property-([^/]+)/);
  const id =
    idMatch?.[1] || `unknown-${hashString(JSON.stringify(data).slice(0, 200))}`;

  return {
    externalId: `rea-${id}`,
    source: "REALESTATE",
    sourceUrl: url,
    address: {
      suburb: String(address.addressLocality),
      state: String(address.addressRegion) as PropertyAddress["state"],
      postcode: String(address.postalCode || ""),
      displayAddress: String(address.streetAddress || address.addressLocality),
    },
    price:
      typeof data.offers === "object" && data.offers
        ? String((data.offers as Record<string, unknown>).price || "")
        : undefined,
    listingType: "sale",
    headline: typeof data.name === "string" ? data.name : undefined,
    description:
      typeof data.description === "string" ? data.description : undefined,
    images: Array.isArray(data.image) ? data.image : undefined,
    scrapedAt: new Date().toISOString(),
  };
}

function normalizeReaPropertyType(
  type?: string,
): PropertyFeatures["propertyType"] {
  if (!type) return undefined;
  const lower = type.toLowerCase();

  if (lower.includes("house")) return "house";
  if (lower.includes("apartment") || lower.includes("flat")) return "apartment";
  if (lower.includes("unit")) return "unit";
  if (lower.includes("townhouse")) return "townhouse";
  if (lower.includes("villa")) return "villa";
  if (lower.includes("land") || lower.includes("vacant")) return "land";
  if (
    lower.includes("rural") ||
    lower.includes("farm") ||
    lower.includes("acreage")
  ) {
    return "rural";
  }
  if (
    lower.includes("commercial") ||
    lower.includes("office") ||
    lower.includes("retail")
  ) {
    return "commercial";
  }

  return "other";
}

function normalizeReaListingStatus(
  status?: string,
): PropertyListing["listingStatus"] {
  if (!status) return undefined;
  const lower = status.toLowerCase();

  if (lower.includes("sold") || lower.includes("leased")) return "SOLD";
  // if (lower.includes("under offer") || lower.includes("under contract"))
  //   return "UNDER_CONTRACT";
  // if (lower.includes("withdrawn")) return "WITHDRAWN";
  if (lower.includes("off market")) return "OFF_MARKET";

  return "OFF_MARKET";
}

/**
 * Parse REA search results page
 */
export function parseReaSearchResults(html: string): PropertyListing[] {
  const listings: PropertyListing[] = [];

  // REA search results often embed data in JSON-LD or data attributes
  // Try JSON-LD first
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );

  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      const jsonContent = match.replace(
        /<script type="application\/ld\+json">|<\/script>/g,
        "",
      );

      try {
        const data = JSON.parse(jsonContent);

        if (
          data["@type"] === "ItemList" &&
          Array.isArray(data.itemListElement)
        ) {
          for (const item of data.itemListElement) {
            const parsed = parseJsonLdListing(item.item || item);
            if (parsed) {
              listings.push(parsed);
            }
          }
        }
      } catch {
        continue;
      }
    }
  }

  // Also try ArgonautExchange for search results
  const argonautData = extractReaArgonautData(html);
  if (argonautData?.["resi-property_listing-experience-web"]?.urqlClientCache) {
    const cache =
      argonautData["resi-property_listing-experience-web"].urqlClientCache;

    for (const value of Object.values(cache)) {
      if (value && typeof value === "object") {
        const data = value as Record<string, unknown>;

        // Look for search results arrays
        if (data.results && Array.isArray(data.results)) {
          for (const result of data.results) {
            if (result && typeof result === "object") {
              const parsed = parseReaListingData(result as PropertyListingData);
              if (parsed) {
                listings.push(parsed);
              }
            }
          }
        }
      }
    }
  }

  return listings;
}
