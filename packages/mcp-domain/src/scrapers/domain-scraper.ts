import {
  scrapeDomain,
  parseDomainPropertyListing,
  parseDomainSearchResults,
  scrapeDomainWithWebScraper,
  scrapeDomainWithScrapeDo,
  type PropertyListing,
  type PropertySearchParams,
  type AustralianState,
  type ListingType,
} from "@propure/mcp-shared";
// import { logger } from "../logger";

import {
  isMockModeEnabled,
  filterMockListings,
  getMockPropertyDetails,
  getMockSuburbStats,
  getMockSalesHistory,
  getMockAgentInfo,
  getMockAuctionResults,
} from "./mock-data";
import { writeFileSync } from "fs";

type DomainHtmlFetcher = (url: string) => Promise<string>;

interface DomainSearchResult {
  listings: PropertyListing[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Build Domain.com.au search URL from params
 */
function buildSearchUrl(params: PropertySearchParams, page?: number): string {
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

  if (params.postcode) {
    searchParams.set("postcode", params.postcode);
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

  // Page (explicit, even for first page, to support pagination loop)
  if (page && page > 0) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();
  const url = `${baseUrl}${path}/${location}${params.state ? `-${params.state.toLowerCase()}` : ""}${params.postcode ? `-${params.postcode}` : ""}${queryString ? `?${queryString}` : ""}`;

  return url;
}

const MAX_DOMAIN_SEARCH_PAGES = 7; //50
const PARALLEL_DOMAIN_PAGE_FETCHES = 3;

/**
 * Determine whether a parsed listing already contains any pricing information.
 */
function hasListingPrice(listing: PropertyListing): boolean {
  return Boolean(
    listing.price ?? listing.priceValue ?? listing.priceFrom ?? listing.priceTo,
  );
}

/**
 * Enrich listings that do not include pricing by fetching their detail pages.
 */
async function enrichListingsWithDetails(
  listings: PropertyListing[],
  fetchDetails: (listingId: string, listingType: ListingType) => Promise<PropertyListing | null>,
): Promise<PropertyListing[]> {
  return Promise.all(
    listings.map(async (listing) => {
      if (hasListingPrice(listing)) {
        return listing;
      }

      try {
        const details = await fetchDetails(
          listing.externalId,
          listing.listingType,
        );

        if (!details) {
          return listing;
        }

        return {
          ...listing,
          price: details.price ?? listing.price,
          priceValue: details.priceValue ?? listing.priceValue,
          priceFrom: details.priceFrom ?? listing.priceFrom,
          priceTo: details.priceTo ?? listing.priceTo,
          description: listing.description ?? details.description,
          images: listing.images?.length ? listing.images : details.images,
          agentName: listing.agentName ?? details.agentName,
          agentPhone: listing.agentPhone ?? details.agentPhone,
          agencyName: listing.agencyName ?? details.agencyName,
        } satisfies PropertyListing;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          {
            listingId: listing.externalId,
            err: message,
          },
          "Failed to enrich listing",
        );
        return listing;
      }
    }),
  );
}

/**
 * Fetch and enrich Domain.com.au listings with limited parallel pagination.
 */
async function performDomainSearch(
  params: PropertySearchParams,
  fetchHtml: DomainHtmlFetcher,
  fetchDetails: (listingId: string, listingType: ListingType) => Promise<PropertyListing | null>,
): Promise<DomainSearchResult> {
  if (isMockModeEnabled()) {
    console.info("[Mock Mode] Returning mock property listings");
    return filterMockListings(params);
  }

  const startPage = params.page && params.page > 0 ? params.page : 1;
  if (startPage > MAX_DOMAIN_SEARCH_PAGES) {
    return { listings: [], totalCount: 0, hasMore: false };
  }

  const pageResults = new Map<number, PropertyListing[]>();
  let endedBy404 = false;
  let endedByEmpty = false;
  let reachedMaxPageLimit = false;

  const state = {
    nextPage: startPage,
    shouldStop: false,
  };

  /**
   * Retrieve the next page number that should be processed.
   */
  const getNextPageNumber = (): number | null => {
    if (state.shouldStop) {
      return null;
    }

    if (state.nextPage > MAX_DOMAIN_SEARCH_PAGES) {
      reachedMaxPageLimit = true;
      return null;
    }

    const pageNumber = state.nextPage;
    state.nextPage += 1;
    return pageNumber;
  };

  /**
   * Fetch, parse, and store a single page of search results.
   */
  const processPage = async (pageNumber: number): Promise<void> => {
    const url = buildSearchUrl(params, pageNumber);
    console.info({ page: pageNumber, url }, "Fetching Domain search page");

    let html: string;
    try {
      html = await fetchHtml(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("status 404")) {
        endedBy404 = true;
        state.shouldStop = true;
        return;
      }
      state.shouldStop = true;
      throw error;
    }

    const pageListings = parseDomainSearchResults(html);
    if (!pageListings.length) {
      endedByEmpty = true;
      state.shouldStop = true;
      return;
    }

    const enrichedListings = await enrichListingsWithDetails(
      pageListings,
      fetchDetails,
    );
    pageResults.set(pageNumber, enrichedListings);
  };

  /**
   * Worker loop that keeps processing pages until no more remain or a stop condition hits.
   */
  const runWorker = async (): Promise<void> => {
    while (true) {
      const pageNumber = getNextPageNumber();
      if (!pageNumber) {
        return;
      }

      await processPage(pageNumber);
    }
  };

  const workerCount = Math.min(
    PARALLEL_DOMAIN_PAGE_FETCHES,
    Math.max(MAX_DOMAIN_SEARCH_PAGES - startPage + 1, 1),
  );
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  const allListings = Array.from(pageResults.keys())
    .sort((a, b) => a - b)
    .flatMap((pageNumber) => pageResults.get(pageNumber) ?? []);

  const hitMaxPages = reachedMaxPageLimit && !endedBy404 && !endedByEmpty;

  return {
    listings: allListings,
    totalCount: allListings.length,
    hasMore: hitMaxPages,
  };
}

/**
 * @deprecated Use {@link searchDomainPropertiesWithScrapeDo} instead.
 * Search properties on Domain.com.au using Oxylabs Web Scraper
 */
export async function searchDomainPropertiesUsingOxylabs(
  params: PropertySearchParams,
): Promise<DomainSearchResult> {
  return performDomainSearch(
    params,
    (url) => scrapeDomainWithWebScraper(url),
    (listingId, listingType) =>
      getDomainPropertyDetailsUsingOxylabs(listingId, listingType),
  );
}

/**
 * Search properties on Domain.com.au using Scrape.do Web Scraper
 */
export async function searchDomainPropertiesWithScrapeDo(
  params: PropertySearchParams,
): Promise<DomainSearchResult> {
  return performDomainSearch(
    params,
    (url) => scrapeDomainWithScrapeDo(url),
    (listingId, listingType) =>
      getDomainPropertyDetailsWithScrapeDo(listingId, listingType),
  );
}

/**
 * Get property details from Domain.com.au
 */
/**
 * @deprecated Use {@link getDomainPropertyDetailsWithScrapeDo} instead.
 */
export async function getDomainPropertyDetailsUsingOxylabs(
  listingId: string,
  listingType: ListingType = "sale",
): Promise<PropertyListing | null> {
  // Check for mock mode
  if (isMockModeEnabled()) {
    console.info({ listingId }, "[Mock Mode] Returning mock property details");
    return getMockPropertyDetails(listingId);
  }

  // Domain property URLs are like: https://www.domain.com.au/{listingId}
  let url = listingId;
  if (!url.startsWith("http")) {
    if (url.startsWith("/")) {
      url = `https://www.domain.com.au${url}`;
    } else {
      url = `https://www.domain.com.au/${url}`;
    }
  }

  const html = await scrapeDomainWithWebScraper(url);

  writeFileSync("reference/domain-property-details.html", html);
  return parseDomainPropertyListing(html, listingType, url);
}

export async function getDomainPropertyDetailsWithScrapeDo(
  listingId: string,
  listingType: ListingType = "sale",
): Promise<PropertyListing | null> {
  if (isMockModeEnabled()) {
    console.info({ listingId }, "[Mock Mode] Returning mock property details");
    return getMockPropertyDetails(listingId);
  }

  let url = listingId;
  if (!url.startsWith("http")) {
    if (url.startsWith("/")) {
      url = `https://www.domain.com.au${url}`;
    } else {
      url = `https://www.domain.com.au/${url}`;
    }
  }

  const html = await scrapeDomainWithScrapeDo(url);

  writeFileSync("reference/domain-property-details.html", html);
  return parseDomainPropertyListing(html, listingType, url);
}

// /**
//  * Get suburb statistics from Domain.com.au
//  */
// export async function getDomainSuburbStats(
//   suburb: string,
//   state: AustralianState,
//   postcode: string,
// ): Promise<{
//   suburb: string;
//   state: AustralianState;
//   postcode: string;
//   medianPrice?: number;
//   medianRent?: number;
//   grossYield?: number;
//   daysOnMarket?: number;
//   annualGrowth?: number;
//   fiveYearGrowth?: number;
// } | null> {
//   // Check for mock mode
//   if (isMockModeEnabled()) {
//     console.log(
//       `[Mock Mode] Returning mock suburb stats for ${suburb}, ${state}`,
//     );
//     return getMockSuburbStats(suburb, state, postcode);
//   }

//   // Domain suburb profile URL
//   const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
//   const url = `https://www.domain.com.au/suburb-profile/${suburbSlug}-${state.toLowerCase()}-${postcode}`;

//   try {
//     const html = await scrapeDomain(url);

//     // Extract stats from the page
//     // Domain embeds suburb data in __NEXT_DATA__ as well
//     const match = html.match(
//       /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
//     );

//     if (!match?.[1]) {
//       return null;
//     }

//     const nextData = JSON.parse(match[1]);
//     const pageProps = nextData?.props?.pageProps;

//     if (!pageProps) {
//       return null;
//     }

//     // Extract stats from various possible locations in the data
//     const stats =
//       pageProps.suburbStats ||
//       pageProps.marketInsights ||
//       pageProps.componentProps?.suburbStats ||
//       {};

//     return {
//       suburb,
//       state,
//       postcode,
//       medianPrice: stats.medianSoldPrice || stats.medianPrice,
//       medianRent: stats.medianRentPrice || stats.medianRent,
//       grossYield: stats.grossRentalYield || stats.yield,
//       daysOnMarket: stats.daysOnMarket || stats.averageDaysOnMarket,
//       annualGrowth: stats.annualGrowth || stats.oneYearGrowth,
//       fiveYearGrowth: stats.fiveYearGrowth || stats.compoundGrowth,
//     };
//   } catch (error) {
//     console.error(`Failed to get suburb stats for ${suburb}:`, error);
//     return null;
//   }
// }

// /**
//  * Get sales history for an address
//  */
// export async function getDomainSalesHistory(
//   address: string,
//   suburb: string,
//   state: AustralianState,
// ): Promise<
//   Array<{
//     saleDate: string;
//     salePrice: number;
//     saleType?: string;
//   }>
// > {
//   // Check for mock mode
//   if (isMockModeEnabled()) {
//     console.log(`[Mock Mode] Returning mock sales history for ${address}`);
//     return getMockSalesHistory(address, suburb, state);
//   }

//   // Domain has sold listings that show price history
//   // Search for sold properties at this address
//   const addressSlug = address.toLowerCase().replace(/\s+/g, "-");
//   const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
//   const url = `https://www.domain.com.au/property-profile/${addressSlug}-${suburbSlug}-${state.toLowerCase()}`;

//   try {
//     const html = await scrapeDomain(url);

//     // Extract sales history from property profile page
//     const match = html.match(
//       /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
//     );

//     if (!match?.[1]) {
//       return [];
//     }

//     const nextData = JSON.parse(match[1]);
//     const salesHistory =
//       nextData?.props?.pageProps?.salesHistory ||
//       nextData?.props?.pageProps?.componentProps?.salesHistory ||
//       [];

//     return salesHistory.map(
//       (sale: { date?: string; price?: number; type?: string }) => ({
//         saleDate: sale.date || "",
//         salePrice: sale.price || 0,
//         saleType: sale.type,
//       }),
//     );
//   } catch (error) {
//     console.error(`Failed to get sales history for ${address}:`, error);
//     return [];
//   }
// }

// /**
//  * Get agent information from Domain.com.au
//  */
// export async function getDomainAgentInfo(agentId: string): Promise<{
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   photoUrl?: string;
//   agencyName?: string;
//   salesCount?: number;
//   rating?: number;
// } | null> {
//   // Check for mock mode
//   if (isMockModeEnabled()) {
//     console.log(`[Mock Mode] Returning mock agent info for ${agentId}`);
//     return getMockAgentInfo(agentId);
//   }

//   const url = `https://www.domain.com.au/real-estate-agent/${agentId}`;

//   try {
//     const html = await scrapeDomain(url);

//     const match = html.match(
//       /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
//     );

//     if (!match?.[1]) {
//       return null;
//     }

//     const nextData = JSON.parse(match[1]);
//     const agentData =
//       nextData?.props?.pageProps?.agent ||
//       nextData?.props?.pageProps?.componentProps?.agent;

//     if (!agentData) {
//       return null;
//     }

//     return {
//       id: agentId,
//       name: agentData.name || "",
//       email: agentData.email,
//       phone: agentData.phone,
//       photoUrl: agentData.photo || agentData.photoUrl,
//       agencyName: agentData.agency?.name || agentData.agencyName,
//       salesCount: agentData.salesCount || agentData.soldProperties,
//       rating: agentData.rating || agentData.averageRating,
//     };
//   } catch (error) {
//     console.error(`Failed to get agent info for ${agentId}:`, error);
//     return null;
//   }
// }

// /**
//  * Get auction results from Domain.com.au
//  */
// export async function getDomainAuctionResults(
//   suburb: string,
//   state: AustralianState,
// ): Promise<
//   Array<{
//     address: string;
//     auctionDate: string;
//     result: string;
//     guidePrice?: number;
//     soldPrice?: number;
//   }>
// > {
//   // Check for mock mode
//   if (isMockModeEnabled()) {
//     console.log(
//       `[Mock Mode] Returning mock auction results for ${suburb}, ${state}`,
//     );
//     return getMockAuctionResults(suburb, state);
//   }

//   const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
//   const url = `https://www.domain.com.au/auction-results/${suburbSlug}-${state.toLowerCase()}`;

//   try {
//     const html = await scrapeDomain(url);

//     const match = html.match(
//       /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
//     );

//     if (!match?.[1]) {
//       return [];
//     }

//     const nextData = JSON.parse(match[1]);
//     const auctionResults =
//       nextData?.props?.pageProps?.auctionResults ||
//       nextData?.props?.pageProps?.componentProps?.results ||
//       [];

//     return auctionResults.map(
//       (auction: {
//         address?: string;
//         date?: string;
//         result?: string;
//         guidePrice?: number;
//         soldPrice?: number;
//         price?: number;
//       }) => ({
//         address: auction.address || "",
//         auctionDate: auction.date || "",
//         result: auction.result || "unknown",
//         guidePrice: auction.guidePrice,
//         soldPrice: auction.soldPrice || auction.price,
//       }),
//     );
//   } catch (error) {
//     console.error(`Failed to get auction results for ${suburb}:`, error);
//     return [];
//   }
// }
