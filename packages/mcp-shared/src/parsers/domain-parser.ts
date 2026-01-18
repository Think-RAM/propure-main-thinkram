import type {
  PropertyListing,
  PropertyAddress,
  PropertyFeatures,
  ListingStatus,
  ListingType,
  DataSource,
} from "../schemas";
import * as cheerio from "cheerio";

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
function parseNumber(value: string): number | undefined {
  const n = Number(value.replace(/[^\d]/g, ""));
  return isNaN(n) ? undefined : n;
}

export function parseAustralianAddress(
  rawAddress: string
): PropertyAddress | null {
  try {
    const displayAddress = rawAddress.trim();

    const parts = rawAddress.split(",").map(p => p.trim());
    if (parts.length < 2) return null;

    const streetPart = parts[0];
    const suburbStatePostcode = parts[1];

    // Remove unit/level prefixes (Level 29/, Unit 3/, Apt 4/)
    const cleanedStreet = streetPart.replace(
      /^(Level|Lvl|Unit|Apartment|Apt|Suite)\s+\d+\/?/i,
      ""
    );

    // Street number
    const streetNumberMatch = cleanedStreet.match(/\d+/);
    const streetNumber = streetNumberMatch?.[0];

    // Street name & type
    const streetMatch = cleanedStreet
      .replace(streetNumber ?? "", "")
      .trim()
      .match(/^(.+?)\s+(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Tce)$/i);

    const streetName = streetMatch?.[1];
    const streetType = streetMatch?.[2];

    // Suburb / state / postcode
    const suburbMatch = suburbStatePostcode.match(
      /^(.+)\s+(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\s+(\d{4})$/i
    );

    if (!suburbMatch) return null;

    const suburb = suburbMatch[1];
    const state = suburbMatch[2].toUpperCase() as AustralianState;
    const postcode = suburbMatch[3];

    return {
      streetNumber,
      streetName,
      streetType,
      suburb,
      state,
      postcode,
      displayAddress
    };
  } catch {
    return null;
  }
}

function extractNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export function parsePropertyFeatures(input: {
  bedrooms?: string;
  bathrooms?: string;
  carSpaces?: string;
  size?: string;
  features?: string[];
  propertyType?: string;
}): PropertyFeatures {
  return {
    bedrooms: extractNumber(input.bedrooms),
    bathrooms: extractNumber(input.bathrooms),
    parkingSpaces: extractNumber(input.carSpaces),
    buildingSize: extractNumber(input.size),
    features: input.features,
    propertyType: mapPropertyType(input.propertyType)
  };
}
export function parsePrice(price?: string): {
  priceValue?: number;
  priceFrom?: number;
  priceTo?: number;
} {
  if (!price) return {};

  const cleaned = price.replace(/,/g, "");

  // Range: $800 - $900
  const rangeMatch = cleaned.match(/\$(\d+)\s*-\s*\$(\d+)/);
  if (rangeMatch) {
    return {
      priceFrom: Number(rangeMatch[1]),
      priceTo: Number(rangeMatch[2])
    };
  }

  // Single price
  const valueMatch = cleaned.match(/\$(\d+)/);
  if (valueMatch) {
    return {
      priceValue: Number(valueMatch[1])
    };
  }

  return {};
}
export function mapPropertyType(raw?: string): PropertyType | undefined {
  if (!raw) return undefined;

  const value = raw.toLowerCase();

  if (value.includes("house")) return "house";
  if (value.includes("apartment") || value.includes("flat"))
    return "apartment";
  if (value.includes("unit")) return "unit";
  if (value.includes("townhouse")) return "townhouse";
  if (value.includes("villa")) return "villa";
  if (value.includes("land")) return "land";
  if (value.includes("rural")) return "rural";
  if (value.includes("commercial")) return "commercial";

  return "other";
}
export function deriveListingStatus(
  listingType: ListingType
): ListingStatus {
  if (listingType === "sold") return "SOLD";
  return "ACTIVE";
}

export function parseDomainPropertyListing(
  html: string,
  listingType: ListingType,
  sourceUrl?: string
): PropertyListing | null {
  try {
    const $ = cheerio.load(html);

    // -----------------------------
    // HEADLINE (USED AS ADDRESS SOURCE)
    // -----------------------------

    const headline =
      $("div[data-testid=listing-details__button-copy-wrapper] h1")
        .first()
        .text()
        .trim();

    if (!headline) return null;

    // -----------------------------
    // ADDRESS
    // -----------------------------

    const address = parseAustralianAddress(headline);
    if (!address) return null;

    // -----------------------------
    // PRICE
    // -----------------------------

    const price =
      $("div[data-testid='listing-details__summary-title'] span")
        .first()
        .text()
        .trim() || undefined;

    const { priceValue, priceFrom, priceTo } = parsePrice(price);

    // -----------------------------
    // FEATURES (CORE)
    // -----------------------------

    const featureEls = $(
      "div[data-testid='property-features'] span[data-testid='property-features-text-container']"
    );

    const features = parsePropertyFeatures({
      bedrooms: featureEls.eq(0).text(),
      bathrooms: featureEls.eq(1).text(),
      carSpaces: featureEls.eq(2).text(),
      size: featureEls.eq(3).text()
    });

    // -----------------------------
    // FEATURE LIST
    // -----------------------------

    const featureList: string[] = [];
    $("li[data-testid^='listing-details__additional-']").each((_, el) => {
      featureList.push($(el).text().trim());
    });

    if (featureList.length) {
      features.features = featureList;
    }

    // -----------------------------
    // DESCRIPTION
    // -----------------------------

    let description: string | undefined;
    const descContainer = $("div[data-testid='listing-details__description']");

    if (descContainer.length) {
      descContainer.find("button").remove();
      description = descContainer
      .find("p")
      .map((_index: number, el: cheerio.Element) => $(el).text().trim())
      .get()
      .join(" ");


    // -----------------------------
    // AGENT
    // -----------------------------

    const agentName =
      $("[data-testid=listing-details__agent-details-agent-name]")
        .first()
        .text()
        .trim() || undefined;

    const phoneHref = $(
      "a[data-testid='listing-details__phone-cta-button']"
    ).attr("href");

    const agentPhone = phoneHref?.replace("tel:", "");

    const agencyName =
      $("a[data-testid=listing-details__agent-details-agency-name] > div")
        .first()
        .text()
        .trim() || undefined;

    // -----------------------------
    // EXTERNAL ID
    // -----------------------------

    const externalId =
      sourceUrl?.split("/").pop() ??
      `domain-${Buffer.from(headline).toString("base64")}`;

    // -----------------------------
    // FINAL LISTING
    // -----------------------------

    const listing: PropertyListing = {
      externalId,
      source: "DOMAIN",
      sourceUrl,
      address,
      features,
      price,
      priceValue,
      priceFrom,
      priceTo,
      listingType,
      listingStatus: listingType === "sold" ? "SOLD" : "ACTIVE",
      headline,
      description,
      agentName,
      agentPhone,
      agencyName,
      scrapedAt: new Date().toISOString()
    };

    return listing;
  } 
}
catch {
    return null;
  }
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
