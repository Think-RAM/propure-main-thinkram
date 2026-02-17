import {
  parseDomainPropertyListing,
  parseDomainSearchResults,
  scrapeDomainWithWebScraper,
  scrapeDomainWithScrapeDo,
  type PropertyListing,
  type PropertySearchParams,
  type ListingType,
  propertyProfileValueParser,
} from "@propure/mcp-shared";
// import { logger } from "../logger";

import {
  isMockModeEnabled,
  filterMockListings,
  getMockPropertyDetails,
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
  const path =
    params.listingType === "rent"
      ? "/rent"
      : params.listingType === "sold"
        ? "/sold-listings"
        : "/sale";

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
  // const url = `${baseUrl}${path}/${location}${params.state ? `-${params.state.toLowerCase()}` : ""}${params.postcode ? `-${params.postcode}` : ""}${queryString ? `?${queryString}` : ""}`;
  const url = `${baseUrl}${path}?${queryString}`;
  return url;
}

let MAX_DOMAIN_SEARCH_PAGES = 50; //50
const PARALLEL_DOMAIN_PAGE_FETCHES = 1;

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
  fetchDetails: (
    listingId: string,
    listingType: ListingType,
  ) => Promise<PropertyListing | null>,
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
  fetchDetails: (
    listingId: string,
    listingType: ListingType,
  ) => Promise<PropertyListing | null>,
): Promise<DomainSearchResult> {
  if (isMockModeEnabled()) {
    console.info("[Mock Mode] Returning mock property listings");
    return filterMockListings(params);
  }

  if (params.listingType === "sold") {
    MAX_DOMAIN_SEARCH_PAGES = 1;
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
    // console.log(url);
    // return;
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

    const pageListings = parseDomainSearchResults({html,listingType: params.listingType});
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

  console.dir(allListings, { depth: Infinity });

  const enrichedListings = await getSoldPropertyProfileValue(allListings);

  return {
    listings: enrichedListings,
    totalCount: enrichedListings.length,
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
  // if (isMockModeEnabled()) {
  //   console.info({ listingId }, "[Mock Mode] Returning mock property details");
  //   return getMockPropertyDetails(listingId);
  // }

  let url = listingId;
  if (!url.startsWith("http")) {
    if (url.startsWith("/")) {
      url = `https://www.domain.com.au${url}`;
    } else {
      url = `https://www.domain.com.au/${url}`;
    }
  }

  const html = await scrapeDomainWithScrapeDo(url);

  // writeFileSync("reference/domain-property-details.html", html);
  return parseDomainPropertyListing(html, listingType, url);
}

export async function getSoldPropertyProfileValue(listings: PropertyListing[]) {
  try {
    for (const listing of listings) {
      const slug = listing.sourceUrl?.split("/").pop()!;
      const result = slug.substring(0, slug.lastIndexOf("-"));
      const url = `https://www.domain.com.au/property-profile/${result}`;
      console.log(url);

      const html = await scrapeDomainWithScrapeDo(url);
      const propertyValue = propertyProfileValueParser(html);

      listing.propertyValueEstimate = propertyValue.propertyValueEstimate;
      listing.propertyRentEstimate = propertyValue.rentalEstimatePerWeek;
      console.log(listing.propertyValueEstimate, listing.propertyRentEstimate);
    }
    return listings;
  } catch (error) {
    // console.error(
    //   {
    //     err: error instanceof Error ? error.message : String(error),
    //   },
    //   "Failed to fetch property profile values",
    // );
    return listings;
  }
}
