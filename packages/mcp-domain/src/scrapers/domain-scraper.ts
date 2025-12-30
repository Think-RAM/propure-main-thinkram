import {
  scrapeDomain,
  parseDomainPropertyListing,
  parseDomainSearchResults,
  type PropertyListing,
  type PropertySearchParams,
  type AustralianState,
} from "@propure/mcp-shared";

import {
  isMockModeEnabled,
  filterMockListings,
  getMockPropertyDetails,
  getMockSuburbStats,
  getMockSalesHistory,
  getMockAgentInfo,
  getMockAuctionResults,
} from "./mock-data";

/**
 * Build Domain.com.au search URL from params
 */
function buildSearchUrl(params: PropertySearchParams): string {
  const baseUrl = "https://www.domain.com.au";
  const path = params.listingType === "rent" ? "/rent" : "/sale";

  // Build location part
  let location = "";
  if (params.suburbs?.length) {
    location = params.suburbs.join("-").toLowerCase().replace(/\s+/g, "-");
  } else if (params.state) {
    location = params.state.toLowerCase();
  }

  const searchParams = new URLSearchParams();

  // Property types
  if (params.propertyTypes?.length) {
    searchParams.set("ptype", params.propertyTypes.join(","));
  }

  // Price range
  if (params.minPrice) {
    searchParams.set("price", `${params.minPrice}-${params.maxPrice || "any"}`);
  } else if (params.maxPrice) {
    searchParams.set("price", `0-${params.maxPrice}`);
  }

  // Bedrooms
  if (params.minBeds) {
    searchParams.set("bedrooms", `${params.minBeds}-any`);
  }

  // Bathrooms
  if (params.minBaths) {
    searchParams.set("bathrooms", `${params.minBaths}-any`);
  }

  // Page
  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();
  const url = `${baseUrl}${path}/${location}${params.state ? `-${params.state.toLowerCase()}` : ""}${queryString ? `?${queryString}` : ""}`;

  return url;
}

/**
 * Search properties on Domain.com.au
 */
export async function searchDomainProperties(
  params: PropertySearchParams,
): Promise<{
  listings: PropertyListing[];
  totalCount: number;
  hasMore: boolean;
}> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log("[Mock Mode] Returning mock property listings");
    return filterMockListings(params);
  }

  const url = buildSearchUrl(params);
  const html = await scrapeDomain(url);
  const listings = parseDomainSearchResults(html);

  // Domain typically shows 20 results per page
  const pageSize = params.pageSize || 20;
  const hasMore = listings.length >= pageSize;

  return {
    listings,
    totalCount: listings.length, // We don't know total without parsing pagination
    hasMore,
  };
}

/**
 * Get property details from Domain.com.au
 */
export async function getDomainPropertyDetails(
  listingId: string,
): Promise<PropertyListing | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(`[Mock Mode] Returning mock property details for ${listingId}`);
    return getMockPropertyDetails(listingId);
  }

  // Domain property URLs are like: https://www.domain.com.au/{listingId}
  const url = `https://www.domain.com.au/${listingId}`;
  const html = await scrapeDomain(url);
  return parseDomainPropertyListing(html);
}

/**
 * Get suburb statistics from Domain.com.au
 */
export async function getDomainSuburbStats(
  suburb: string,
  state: AustralianState,
  postcode: string,
): Promise<{
  suburb: string;
  state: AustralianState;
  postcode: string;
  medianPrice?: number;
  medianRent?: number;
  grossYield?: number;
  daysOnMarket?: number;
  annualGrowth?: number;
  fiveYearGrowth?: number;
} | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock suburb stats for ${suburb}, ${state}`,
    );
    return getMockSuburbStats(suburb, state, postcode);
  }

  // Domain suburb profile URL
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.domain.com.au/suburb-profile/${suburbSlug}-${state.toLowerCase()}-${postcode}`;

  try {
    const html = await scrapeDomain(url);

    // Extract stats from the page
    // Domain embeds suburb data in __NEXT_DATA__ as well
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );

    if (!match?.[1]) {
      return null;
    }

    const nextData = JSON.parse(match[1]);
    const pageProps = nextData?.props?.pageProps;

    if (!pageProps) {
      return null;
    }

    // Extract stats from various possible locations in the data
    const stats =
      pageProps.suburbStats ||
      pageProps.marketInsights ||
      pageProps.componentProps?.suburbStats ||
      {};

    return {
      suburb,
      state,
      postcode,
      medianPrice: stats.medianSoldPrice || stats.medianPrice,
      medianRent: stats.medianRentPrice || stats.medianRent,
      grossYield: stats.grossRentalYield || stats.yield,
      daysOnMarket: stats.daysOnMarket || stats.averageDaysOnMarket,
      annualGrowth: stats.annualGrowth || stats.oneYearGrowth,
      fiveYearGrowth: stats.fiveYearGrowth || stats.compoundGrowth,
    };
  } catch (error) {
    console.error(`Failed to get suburb stats for ${suburb}:`, error);
    return null;
  }
}

/**
 * Get sales history for an address
 */
export async function getDomainSalesHistory(
  address: string,
  suburb: string,
  state: AustralianState,
): Promise<
  Array<{
    saleDate: string;
    salePrice: number;
    saleType?: string;
  }>
> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(`[Mock Mode] Returning mock sales history for ${address}`);
    return getMockSalesHistory(address, suburb, state);
  }

  // Domain has sold listings that show price history
  // Search for sold properties at this address
  const addressSlug = address.toLowerCase().replace(/\s+/g, "-");
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.domain.com.au/property-profile/${addressSlug}-${suburbSlug}-${state.toLowerCase()}`;

  try {
    const html = await scrapeDomain(url);

    // Extract sales history from property profile page
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );

    if (!match?.[1]) {
      return [];
    }

    const nextData = JSON.parse(match[1]);
    const salesHistory =
      nextData?.props?.pageProps?.salesHistory ||
      nextData?.props?.pageProps?.componentProps?.salesHistory ||
      [];

    return salesHistory.map(
      (sale: { date?: string; price?: number; type?: string }) => ({
        saleDate: sale.date || "",
        salePrice: sale.price || 0,
        saleType: sale.type,
      }),
    );
  } catch (error) {
    console.error(`Failed to get sales history for ${address}:`, error);
    return [];
  }
}

/**
 * Get agent information from Domain.com.au
 */
export async function getDomainAgentInfo(agentId: string): Promise<{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  agencyName?: string;
  salesCount?: number;
  rating?: number;
} | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(`[Mock Mode] Returning mock agent info for ${agentId}`);
    return getMockAgentInfo(agentId);
  }

  const url = `https://www.domain.com.au/real-estate-agent/${agentId}`;

  try {
    const html = await scrapeDomain(url);

    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );

    if (!match?.[1]) {
      return null;
    }

    const nextData = JSON.parse(match[1]);
    const agentData =
      nextData?.props?.pageProps?.agent ||
      nextData?.props?.pageProps?.componentProps?.agent;

    if (!agentData) {
      return null;
    }

    return {
      id: agentId,
      name: agentData.name || "",
      email: agentData.email,
      phone: agentData.phone,
      photoUrl: agentData.photo || agentData.photoUrl,
      agencyName: agentData.agency?.name || agentData.agencyName,
      salesCount: agentData.salesCount || agentData.soldProperties,
      rating: agentData.rating || agentData.averageRating,
    };
  } catch (error) {
    console.error(`Failed to get agent info for ${agentId}:`, error);
    return null;
  }
}

/**
 * Get auction results from Domain.com.au
 */
export async function getDomainAuctionResults(
  suburb: string,
  state: AustralianState,
): Promise<
  Array<{
    address: string;
    auctionDate: string;
    result: string;
    guidePrice?: number;
    soldPrice?: number;
  }>
> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.log(
      `[Mock Mode] Returning mock auction results for ${suburb}, ${state}`,
    );
    return getMockAuctionResults(suburb, state);
  }

  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.domain.com.au/auction-results/${suburbSlug}-${state.toLowerCase()}`;

  try {
    const html = await scrapeDomain(url);

    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );

    if (!match?.[1]) {
      return [];
    }

    const nextData = JSON.parse(match[1]);
    const auctionResults =
      nextData?.props?.pageProps?.auctionResults ||
      nextData?.props?.pageProps?.componentProps?.results ||
      [];

    return auctionResults.map(
      (auction: {
        address?: string;
        date?: string;
        result?: string;
        guidePrice?: number;
        soldPrice?: number;
        price?: number;
      }) => ({
        address: auction.address || "",
        auctionDate: auction.date || "",
        result: auction.result || "unknown",
        guidePrice: auction.guidePrice,
        soldPrice: auction.soldPrice || auction.price,
      }),
    );
  } catch (error) {
    console.error(`Failed to get auction results for ${suburb}:`, error);
    return [];
  }
}
