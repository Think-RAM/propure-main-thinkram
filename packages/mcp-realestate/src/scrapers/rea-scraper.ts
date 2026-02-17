import {
  scrapeRealEstateWithWebScraper,
  // scrapeRealEstate,
  parseReaPropertyListing,
  parseReaSearchResults,
  type PropertyListing,
  type PropertySearchParams,
  type AustralianState,
} from "@propure/mcp-shared";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

import {
  isMockModeEnabled,
  filterMockListings,
  getMockPropertyDetails,
  getMockSuburbStats,
  getMockSoldProperties,
  getMockAgencyListings,
} from "./mock-data";

/**
 * Build RealEstate.com.au search URL from params
 */
export function buildSearchUrl(params: PropertySearchParams): string {
  const baseUrl = "https://www.realestate.com.au";

  // Build listing type path (buy|rent|sold)
  let listingPath = "buy";
  if (params.listingType === "rent") {
    listingPath = "rent";
  } else if (params.listingType === "sold") {
    listingPath = "sold";
  }

  // Build location part: REA expects plus-separated suburb + state + optional postcode
  let location = "";
  if (params.suburbs?.length) {
    const suburbSlug = params.suburbs[0].toLowerCase().replace(/\s+/g, "+");
    const state = (params.state || "nsw").toLowerCase();
    const postcode = params.postcode ? `+${params.postcode}` : "";
    location = `in-${suburbSlug},+${state}${postcode}`;
  } else if (params.state) {
    location = `in-${params.state.toLowerCase()}`;
  }

  const searchParams = new URLSearchParams();

  // Property types
  if (params.propertyTypes?.length) {
    const typeMap: Record<string, string> = {
      house: "house",
      apartment: "unit+apartment",
      unit: "unit+apartment",
      townhouse: "townhouse",
      villa: "villa",
      land: "land",
      rural: "rural",
    };
    const types = params.propertyTypes
      .map((t) => typeMap[t] || t)
      .filter(Boolean);
    if (types.length) {
      searchParams.set("propertyType", types.join(","));
    }
  }

  // Price range
  if (params.minPrice) {
    searchParams.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  // Bedrooms
  if (params.minBeds) {
    searchParams.set("minBedrooms", String(params.minBeds));
  }
  if (params.maxBeds) {
    searchParams.set("maxBedrooms", String(params.maxBeds));
  }

  // Bathrooms
  if (params.minBaths) {
    searchParams.set("minBathrooms", String(params.minBaths));
  }

  // Page: REA encodes page in path as /list-N (default list-1)
  const pageSegment =
    params.page && params.page > 1 ? `/list-${params.page}` : "/list-1";

  const queryString = searchParams.toString();
  const url = `${baseUrl}/${listingPath}/${location}${pageSegment}${queryString ? `?${queryString}` : ""}`;

  return url;
}

/**
 * Search properties on RealEstate.com.au
 */
export async function searchReaProperties(
  params: PropertySearchParams,
): Promise<{
  listings: PropertyListing[];
  totalCount: number;
  hasMore: boolean;
}> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log("[Mock Mode] Returning mock REA property listings");
    return filterMockListings(params);
  }

  const url = buildSearchUrl(params);
  const html = await scrapeRealEstateWithWebScraper(url);

  // Save reference HTML for debugging/parser development
  const referenceDir = join(process.cwd(), "packages/mcp-realestate/reference");
  if (!existsSync(referenceDir)) {
    mkdirSync(referenceDir, { recursive: true });
  }
  writeFileSync(join(referenceDir, "rea-search-results.html"), html);

  // const listings = parseReaSearchResults(html);
  const listings: PropertyListing[] = [];

  // REA typically shows 20-25 results per page
  const hasMore = listings.length >= 20;

  return {
    listings,
    totalCount: listings.length,
    hasMore,
  };
}

/**
 * Get property details from RealEstate.com.au
 */
export async function getReaPropertyDetails(
  listingId: string,
): Promise<PropertyListing | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock REA property details for ${listingId}`,
    );
    return getMockPropertyDetails(listingId);
  }

  // REA property URLs are like: https://www.realestate.com.au/property-house-nsw-sydney-123456
  // or with just the ID: https://www.realestate.com.au/123456
  let url: string;
  if (listingId.startsWith("http")) {
    url = listingId;
  } else if (listingId.startsWith("/")) {
    url = `https://www.realestate.com.au${listingId}`;
  } else if (listingId.includes("-")) {
    // If it looks like a slug but no leading slash
    url = `https://www.realestate.com.au/property-${listingId}`;
  } else {
    // Numeric ID or unrecognized format
    url = `https://www.realestate.com.au/property-details-${listingId}`;
  }

  const html = await scrapeRealEstateWithWebScraper(url);

  // Save reference HTML for debugging/parser development
  const referenceDir = join(process.cwd(), "packages/mcp-realestate/reference");
  if (!existsSync(referenceDir)) {
    mkdirSync(referenceDir, { recursive: true });
  }
  writeFileSync(join(referenceDir, "rea-property-details.html"), html);

  // return parseReaPropertyListing(html);
  return null;
}

/**
 * Get suburb profile from RealEstate.com.au
 */
export async function getReaSuburbProfile(
  suburb: string,
  state: AustralianState,
  postcode: string,
): Promise<{
  suburb: string;
  state: AustralianState;
  postcode: string;
  medianPrice?: number;
  medianRent?: number;
  population?: number;
  averageAge?: number;
  ownerOccupied?: number;
  renters?: number;
  medianIncome?: number;
} | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock REA suburb profile for ${suburb}, ${state}`,
    );
    return getMockSuburbStats(suburb, state, postcode);
  }

  // REA suburb profile URL
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.realestate.com.au/neighbourhoods/${suburbSlug}-${postcode}-${state.toLowerCase()}`;

  try {
    const html = await scrapeRealEstateWithWebScraper(url);

    // Try to extract from ArgonautExchange
    const argonautMatch = html.match(
      /window\.ArgonautExchange\s*=\s*({[\s\S]*?});/,
    );

    if (argonautMatch?.[1]) {
      try {
        const data = JSON.parse(argonautMatch[1]);
        const cache =
          data["resi-property_listing-experience-web"]?.urqlClientCache || {};

        // Look for suburb data in the cache
        for (const value of Object.values(cache)) {
          if (value && typeof value === "object") {
            const d = value as Record<string, unknown>;
            if (d.suburb || d.suburbProfile || d.demographics) {
              const profile = (d.suburbProfile || d) as Record<string, unknown>;
              const demographics = (d.demographics ||
                profile.demographics ||
                {}) as Record<string, unknown>;

              return {
                suburb,
                state,
                postcode,
                medianPrice:
                  typeof profile.medianSalePrice === "number"
                    ? profile.medianSalePrice
                    : undefined,
                medianRent:
                  typeof profile.medianRentPrice === "number"
                    ? profile.medianRentPrice
                    : undefined,
                population:
                  typeof demographics.population === "number"
                    ? demographics.population
                    : undefined,
                averageAge:
                  typeof demographics.averageAge === "number"
                    ? demographics.averageAge
                    : undefined,
                ownerOccupied:
                  typeof demographics.ownerOccupied === "number"
                    ? demographics.ownerOccupied
                    : undefined,
                renters:
                  typeof demographics.renters === "number"
                    ? demographics.renters
                    : undefined,
                medianIncome:
                  typeof demographics.medianIncome === "number"
                    ? demographics.medianIncome
                    : undefined,
              };
            }
          }
        }
      } catch {
        // JSON parse failed, continue to fallback
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to get suburb profile for ${suburb}:`, error);
    return null;
  }
}

/**
 * Get sold properties from RealEstate.com.au
 */
export async function getReaSoldProperties(
  suburb: string,
  state: AustralianState,
  postcode?: string,
): Promise<PropertyListing[]> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock REA sold properties for ${suburb}, ${state}`,
    );
    return getMockSoldProperties(suburb, state);
  }

  const params: PropertySearchParams = {
    suburbs: [suburb],
    state,
    postcode,
    listingType: "sold",
    page: 1,
    // maxPages: 10,
  };

  const result = await searchReaProperties(params);
  return result.listings;
}

/**
 * Get agency listings from RealEstate.com.au
 */
export async function getReaAgencyListings(
  agencyId: string,
): Promise<PropertyListing[]> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock REA agency listings for ${agencyId}`,
    );
    return getMockAgencyListings(agencyId);
  }

  const url = `https://www.realestate.com.au/agency/${agencyId}/listings`;

  try {
    const html = await scrapeRealEstateWithWebScraper(url);
    // return parseReaSearchResults(html);
    return [];
  } catch (error) {
    console.error(`Failed to get agency listings for ${agencyId}:`, error);
    return [];
  }
}
