import type {
  PropertyListing,
  PropertyAddress,
  PropertyFeatures,
} from "../schemas";

interface DomainNextData {
  props: {
    pageProps: {
      componentProps?: {
        listingDetails?: {
          id?: number;
          headline?: string;
          description?: string;
          priceDetails?: {
            displayPrice?: string;
          };
          saleMode?: string;
          status?: string;
          listingType?: string;
          dateListed?: string;
          dateUpdated?: string;
          auctionSchedule?: {
            time?: string;
          };
          media?: Array<{
            type?: string;
            url?: string;
          }>;
          inspections?: Array<{
            time?: string;
          }>;
        };
        address?: {
          displayAddress?: string;
          street?: string;
          streetNumber?: string;
          streetName?: string;
          streetType?: string;
          suburb?: string;
          state?: string;
          postcode?: string;
          lat?: number;
          lng?: number;
        };
        features?: {
          beds?: number;
          baths?: number;
          parking?: number;
          propertyType?: string;
          propertyTypeFormatted?: string;
          landSize?: number;
          buildingSize?: number;
          features?: string[];
        };
        agents?: Array<{
          id?: number;
          name?: string;
          phone?: string;
          photo?: string;
          agencyId?: number;
          agencyName?: string;
        }>;
      };
    };
  };
}

/**
 * Extract __NEXT_DATA__ JSON from Domain.com.au HTML
 */
export function extractDomainNextData(html: string): DomainNextData | null {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (!match || !match[1]) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as DomainNextData;
  } catch {
    return null;
  }
}

/**
 * Parse Domain.com.au property listing from HTML
 */
export function parseDomainPropertyListing(
  html: string,
): PropertyListing | null {
  const nextData = extractDomainNextData(html);
  if (!nextData?.props?.pageProps?.componentProps) {
    return null;
  }

  const props = nextData.props.pageProps.componentProps;
  const listing = props.listingDetails;
  const addr = props.address;
  const feat = props.features;
  const agents = props.agents;

  if (!listing?.id || !addr?.suburb || !addr?.state || !addr?.postcode) {
    return null;
  }

  const address: PropertyAddress = {
    streetNumber: addr.streetNumber,
    streetName: addr.streetName,
    streetType: addr.streetType,
    suburb: addr.suburb,
    state: addr.state as PropertyAddress["state"],
    postcode: addr.postcode,
    displayAddress:
      addr.displayAddress ||
      `${addr.streetNumber || ""} ${addr.streetName || ""} ${addr.streetType || ""}, ${addr.suburb}`.trim(),
    latitude: addr.lat,
    longitude: addr.lng,
  };

  const features: PropertyFeatures = {
    bedrooms: feat?.beds,
    bathrooms: feat?.baths,
    parkingSpaces: feat?.parking,
    landSize: feat?.landSize,
    buildingSize: feat?.buildingSize,
    propertyType: normalizePropertyType(feat?.propertyType),
    features: feat?.features,
  };

  const agent = agents?.[0];

  // Determine listing type
  let listingType: PropertyListing["listingType"] = "sale";
  if (listing.listingType?.toLowerCase().includes("rent")) {
    listingType = "rent";
  } else if (
    listing.status?.toLowerCase().includes("sold") ||
    listing.saleMode?.toLowerCase().includes("sold")
  ) {
    listingType = "sold";
  }

  return {
    externalId: `domain-${listing.id}`,
    source: "DOMAIN",
    sourceUrl: `https://www.domain.com.au/${listing.id}`,
    address,
    features,
    price: listing.priceDetails?.displayPrice,
    listingType,
    listingStatus: normalizeListingStatus(listing.status),
    headline: listing.headline,
    description: listing.description,
    images: listing.media
      ?.filter((m) => m.type === "photo" || m.type === "image")
      .map((m) => m.url)
      .filter((url): url is string => !!url),
    agentName: agent?.name,
    agentPhone: agent?.phone,
    agencyName: agent?.agencyName,
    listedDate: listing.dateListed,
    auctionDate: listing.auctionSchedule?.time,
    inspectionTimes: listing.inspections
      ?.map((i) => i.time)
      .filter((t): t is string => !!t),
    scrapedAt: new Date().toISOString(),
  };
}

function normalizePropertyType(
  type?: string,
): PropertyFeatures["propertyType"] {
  if (!type) return undefined;
  const lower = type.toLowerCase();

  if (lower.includes("house")) return "house";
  if (lower.includes("apartment")) return "apartment";
  if (lower.includes("unit")) return "unit";
  if (lower.includes("townhouse")) return "townhouse";
  if (lower.includes("villa")) return "villa";
  if (lower.includes("land")) return "land";
  if (lower.includes("rural") || lower.includes("farm")) return "rural";
  if (
    lower.includes("commercial") ||
    lower.includes("office") ||
    lower.includes("retail")
  ) {
    return "commercial";
  }

  return "other";
}

function normalizeListingStatus(
  status?: string,
): PropertyListing["listingStatus"] {
  if (!status) return undefined;
  const lower = status.toLowerCase();

  if (lower.includes("sold")) return "SOLD";
  if (lower.includes("under offer") || lower.includes("under contract"))
    return "UNDER_CONTRACT";
  if (lower.includes("withdrawn")) return "WITHDRAWN";
  if (lower.includes("off market")) return "OFF_MARKET";

  return "ACTIVE";
}

/**
 * Parse Domain.com.au search results page
 */
export function parseDomainSearchResults(html: string): PropertyListing[] {
  const nextData = extractDomainNextData(html);
  if (!nextData?.props?.pageProps) {
    return [];
  }

  // Search results are structured differently
  // The listings are typically in pageProps.listingsMap or similar
  const pageProps = nextData.props.pageProps as Record<string, unknown>;

  // Look for listings array in various possible locations
  const listings: PropertyListing[] = [];

  const possibleListingsArrays = [
    pageProps.listingsMap,
    pageProps.listings,
    pageProps.componentProps &&
      (pageProps.componentProps as Record<string, unknown>).listings,
  ];

  for (const arr of possibleListingsArrays) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        const parsed = parseSearchResultItem(item);
        if (parsed) {
          listings.push(parsed);
        }
      }
      break;
    }
  }

  return listings;
}

function parseSearchResultItem(item: unknown): PropertyListing | null {
  if (!item || typeof item !== "object") return null;

  const listing = item as Record<string, unknown>;
  const id = listing.id || listing.listingId;

  if (!id) return null;

  const address = listing.address as Record<string, unknown> | undefined;
  if (!address?.suburb || !address?.state || !address?.postcode) return null;

  return {
    externalId: `domain-${id}`,
    source: "DOMAIN",
    sourceUrl: `https://www.domain.com.au/${id}`,
    address: {
      suburb: String(address.suburb),
      state: String(address.state) as PropertyAddress["state"],
      postcode: String(address.postcode),
      displayAddress: String(address.displayAddress || address.suburb),
      streetNumber: address.streetNumber
        ? String(address.streetNumber)
        : undefined,
      streetName: address.streetName ? String(address.streetName) : undefined,
      latitude: typeof address.lat === "number" ? address.lat : undefined,
      longitude: typeof address.lng === "number" ? address.lng : undefined,
    },
    features: {
      bedrooms:
        typeof listing.bedrooms === "number" ? listing.bedrooms : undefined,
      bathrooms:
        typeof listing.bathrooms === "number" ? listing.bathrooms : undefined,
      parkingSpaces:
        typeof listing.carspaces === "number" ? listing.carspaces : undefined,
      propertyType: normalizePropertyType(
        typeof listing.propertyType === "string"
          ? listing.propertyType
          : undefined,
      ),
    },
    price: typeof listing.price === "string" ? listing.price : undefined,
    listingType: "sale",
    headline:
      typeof listing.headline === "string" ? listing.headline : undefined,
    scrapedAt: new Date().toISOString(),
  };
}
