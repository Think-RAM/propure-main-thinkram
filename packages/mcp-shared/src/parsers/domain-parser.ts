import { load, type CheerioAPI, type Cheerio } from "cheerio";
import type {
  PropertyListing,
  PropertyAddress,
  PropertyFeatures,
} from "../schemas";
import chalk from "chalk";

const VALID_STATES: Set<PropertyAddress["state"]> = new Set([
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "NT",
  "ACT",
]);

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
  const $ = load(html);
  const listings: PropertyListing[] = [];

  // If the page explicitly says there are no results, bail out early
  const noMatchFound = $("h3").filter(
    (_, el) => $(el).text().trim().toLowerCase() === "no exact matches",
  ).length;
  if (noMatchFound) {
    return listings;
  }

  $('[data-testid^="listing-card-wrapper"]').each((_, el) => {
    // console.log(chalk.yellowBright("Parsed listing card: "));
    const parsed = parseListingCard($, el);

    console.dir(parsed, { depth: Infinity });

    if (parsed) {
      listings.push(parsed);
    }
  });

  console.log(
    chalk.greenBright(
      `Parsed ${listings.length} listings from search results.`,
    ),
  );

  return listings;
}

function parseListingCard($: CheerioAPI, el: unknown): PropertyListing | null {
  const card = $(el as any);

  const href =
    card.find('a[href*="domain.com.au"], a[href^="/"]').first().attr("href") ||
    undefined;
  const { url, id, suburb, state, postcode, displayAddressFromSlug } =
    parseDomainUrlParts(href);

  if (!id || !suburb || !state || !postcode) {
    return null;
  }

  const addressLineText = card
    .find('[data-testid="address-wrapper"]')
    .text()
    .replace(/\s+/g, " ")
    .trim();
  const displayAddress =
    addressLineText ||
    displayAddressFromSlug ||
    `${suburb} ${state} ${postcode}`.trim();

  const priceText = card
    .find('[data-testid="listing-card-price"]')
    .first()
    .text()
    .trim();

  const featureValues = extractFeatureValues($, card);
  const propertyTypeText = extractPropertyTypeText($, card);

  const listingType = inferListingType(priceText);
  const listingStatus = priceText.toLowerCase().includes("sold")
    ? "SOLD"
    : undefined;

  return {
    externalId: `domain-${id}`,
    source: "DOMAIN",
    sourceUrl: url,
    address: {
      suburb,
      state,
      postcode,
      displayAddress,
    },
    features: {
      bedrooms: featureValues.bedrooms,
      bathrooms: featureValues.bathrooms,
      parkingSpaces: featureValues.parkingSpaces,
      landSize: featureValues.landSize,
      propertyType: propertyTypeText
        ? normalizePropertyType(propertyTypeText)
        : featureValues.propertyType,
    },
    price: priceText || undefined,
    listingType,
    listingStatus,
    headline: addressLineText || undefined,
    scrapedAt: new Date().toISOString(),
  };
}

function extractPropertyTypeText(
  $: CheerioAPI,
  card: Cheerio<any>,
): string | undefined {
  const testIdValue = card
    .find('[data-testid="property-type"]')
    .first()
    .text()
    .trim();
  if (testIdValue) return testIdValue;

  const featuresBlock = card
    .find('[data-testid="listing-card-features-wrapper"]')
    .first();
  if (featuresBlock.length) {
    const siblingText = featuresBlock.next().text().replace(/\s+/g, " ").trim();
    if (siblingText) return siblingText;
  }

  const typePattern =
    /(apartment|unit|house|townhouse|villa|land|rural|acreage|farm|commercial)/i;
  let matched: string | undefined;

  card.find("span, div, p").each((_, node) => {
    if (matched) return;
    const text = $(node).text().replace(/\s+/g, " ").trim();
    if (text && typePattern.test(text)) {
      matched = text;
    }
  });

  return matched;
}

function parseDomainUrlParts(href?: string): {
  url?: string;
  id?: string;
  suburb?: string;
  state?: PropertyAddress["state"];
  postcode?: string;
  displayAddressFromSlug?: string;
} {
  if (!href) return {};

  const url = href.startsWith("http")
    ? href
    : `https://www.domain.com.au${href}`;

  const pathname = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return href.startsWith("/") ? href : undefined;
    }
  })();

  if (!pathname) return { url };

  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const slugParts = slug.split("/").pop()?.split("-") || [];

  if (slugParts.length < 4) return { url };

  const id = slugParts[slugParts.length - 1];
  const postcode = slugParts[slugParts.length - 2];
  const stateRaw = slugParts[slugParts.length - 3];
  const suburbRaw = slugParts[slugParts.length - 4];
  const streetParts = slugParts.slice(0, slugParts.length - 4);

  const stateUpper = stateRaw?.toUpperCase() as
    | PropertyAddress["state"]
    | undefined;
  const state =
    stateUpper && VALID_STATES.has(stateUpper) ? stateUpper : undefined;
  const suburb = suburbRaw
    ? suburbRaw.replace(/_/g, " ").replace(/\s+/g, " ").toUpperCase()
    : undefined;

  const streetAddress = streetParts.join(" ").replace(/\s+/g, " ").trim();
  const displayAddressFromSlug = streetAddress
    ? `${streetAddress}, ${suburb || ""} ${state || ""} ${postcode || ""}`.trim()
    : undefined;

  return {
    url,
    id,
    suburb,
    state,
    postcode,
    displayAddressFromSlug,
  };
}

function extractFeatureValues(
  $: CheerioAPI,
  card: Cheerio<any>,
): PropertyFeatures {
  const features: PropertyFeatures = {};

  card.find('[data-testid="property-features-feature"]').each((_, feat) => {
    const text = $(feat).text().replace(/\s+/g, " ").trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const numMatch = text.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
    const num = numMatch ? Number(numMatch[1]) : undefined;

    if (lower.includes("bed") && num !== undefined) {
      features.bedrooms = num;
    } else if (lower.includes("bath") && num !== undefined) {
      features.bathrooms = num;
    } else if (
      (lower.includes("park") || lower.includes("car")) &&
      num !== undefined
    ) {
      features.parkingSpaces = num;
    } else if (
      lower.includes("m²") ||
      lower.includes("sqm") ||
      lower.includes("m2")
    ) {
      if (num !== undefined) {
        features.landSize = num;
      }
    }
  });

  return features;
}

function inferListingType(priceText: string): PropertyListing["listingType"] {
  const lower = priceText.toLowerCase();
  if (
    lower.includes("per week") ||
    lower.includes("per-month") ||
    lower.includes("per month") ||
    lower.includes("p/w") ||
    lower.includes("pw") ||
    lower.includes("week")
  ) {
    return "rent";
  }
  if (lower.includes("sold")) return "sold";
  return "sale";
}
