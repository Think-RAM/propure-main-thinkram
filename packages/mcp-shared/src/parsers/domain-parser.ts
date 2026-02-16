import { load, type CheerioAPI, type Cheerio } from "cheerio";
import {
  PropertyListing,
  PropertyAddress,
  PropertyFeatures,
  ListingStatus,
  ListingType,
  DataSource,
  AustralianState,
  PropertyType,
  SoldAt,
} from "../schemas";
import chalk from "chalk";
// import { logger } from "../logger";

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
  rawAddress: string,
): PropertyAddress | null {
  try {
    const displayAddress = rawAddress.trim();

    const parts = rawAddress.split(",").map((p) => p.trim());
    if (parts.length < 2) return null;

    const streetPart = parts[0];
    const suburbStatePostcode = parts[1];

    // Remove unit/level prefixes (Level 29/, Unit 3/, Apt 4/)
    const cleanedStreet = streetPart.replace(
      /^(Level|Lvl|Unit|Apartment|Apt|Suite)\s+\d+\/?/i,
      "",
    );

    // Street number
    const streetNumberMatch = cleanedStreet.match(/\d+/);
    const streetNumber = streetNumberMatch?.[0];

    // Street name & type
    const streetMatch = cleanedStreet
      .replace(streetNumber ?? "", "")
      .trim()
      .match(
        /^(.+?)\s+(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Tce)$/i,
      );

    const streetName = streetMatch?.[1];
    const streetType = streetMatch?.[2];

    // Suburb / state / postcode
    const suburbMatch = suburbStatePostcode.match(
      /^(.+)\s+(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\s+(\d{4})$/i,
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
      displayAddress,
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
    propertyType: mapPropertyType(input.propertyType),
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
      priceTo: Number(rangeMatch[2]),
    };
  }

  // Single price
  const valueMatch = cleaned.match(/\$(\d+)/);
  if (valueMatch) {
    return {
      priceValue: Number(valueMatch[1]),
    };
  }

  return {};
}
export function mapPropertyType(raw?: string): PropertyType | undefined {
  if (!raw) return undefined;

  const value = raw.toLowerCase();

  if (value.includes("house")) return "house";
  if (value.includes("apartment") || value.includes("flat")) return "apartment";
  if (value.includes("unit")) return "unit";
  if (value.includes("townhouse")) return "townhouse";
  if (value.includes("villa")) return "villa";
  if (value.includes("land")) return "land";
  if (value.includes("rural")) return "rural";
  if (value.includes("commercial")) return "commercial";

  return "other";
}

function parseCurrency(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

export function parseDomainPropertyListing(
  html: string,
  listingType: ListingType,
  sourceUrl?: string,
): PropertyListing | null {
  try {
    const $ = cheerio.load(html);

    // HEADLINE (USED AS ADDRESS SOURCE)
    const headline = $(
      "div[data-testid=listing-details__button-copy-wrapper] h1",
    )
      .first()
      .text()
      .trim();

    if (!headline) return null;

    // ADDRESS
    const address = parseAustralianAddress(headline);
    if (!address) return null;

    // PRICE
    const price =
      $("p[data-testid='listing-card-price']").first().text().trim() ||
      undefined;
    const soldPrice =
      $("p[data-testid='listing-card-price']").first().text().trim() ||
      undefined;

    const { priceValue, priceFrom, priceTo } = parsePrice(price);

    // FEATURES (CORE)
    const featureEls = $(
      "div[data-testid='property-features'] span[data-testid='property-features-text-container']",
    );

    const features = parsePropertyFeatures({
      bedrooms: featureEls.eq(0).text(),
      bathrooms: featureEls.eq(1).text(),
      carSpaces: featureEls.eq(2).text(),
      size: featureEls.eq(3).text(),
    });

    // FEATURE LIST
    const featureList: string[] = [];
    $("li[data-testid^='listing-details__additional-']").each((_, el) => {
      featureList.push($(el).text().trim());
    });

    if (featureList.length) {
      features.features = featureList;
    }

    // DESCRIPTION
    let description: string | undefined;
    const descContainer = $("div[data-testid='listing-details__description']");

    if (descContainer.length) {
      descContainer.find("button").remove();
      description = descContainer
        .find("p")

        .map((_index: number, el) => $(el).text().trim())
        .get()
        .join(" ");
    }

    // AGENT
    const agentName =
      $("[data-testid=listing-details__agent-details-agent-name]")
        .first()
        .text()
        .trim() || undefined;

    const phoneHref = $(
      "a[data-testid='listing-details__phone-cta-button']",
    ).attr("href");

    const agentPhone = phoneHref?.replace("tel:", "");

    const agencyName =
      $("a[data-testid=listing-details__agent-details-agency-name] > div")
        .first()
        .text()
        .trim() || undefined;

    // EXTERNAL ID
    const externalId =
      sourceUrl?.split("/").pop() ??
      `domain-${Buffer.from(headline).toString("base64")}`;

    // FINAL LISTING
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
      listingStatus: listingType === "sold" ? "SOLD" : "ON_MARKET",
      headline,
      description,
      agentName,
      agentPhone,
      agencyName,
      soldPrice: parseCurrency(soldPrice),
      scrapedAt: new Date().toISOString(),
    };

    return listing;
  } catch {
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

// function normalizeListingStatus(
//   status?: string,
// ): PropertyListing["listingStatus"] {
//   if (!status) return undefined;
//   const lower = status.toLowerCase();

//   if (lower.includes("sold")) return "SOLD";
//   if (lower.includes("under offer") || lower.includes("under contract"))
//     return "UNDER_CONTRACT";
//   if (lower.includes("withdrawn")) return "WITHDRAWN";
//   if (lower.includes("off market")) return "OFF_MARKET";

//   return "ACTIVE";
// }

function extractSaleDetails($: CheerioAPI, el: unknown) {
  const text = $(el as any)
    .text()
    .trim();

  // Normalize text
  const lowerText = text.toLowerCase();

  let soldAt: SoldAt | null = null;

  if (lowerText.includes("at auction")) {
    soldAt = "AUCTION";
  } else if (lowerText.includes("by private treaty")) {
    soldAt = "PRIVATE_TREATY";
  } else if (lowerText.includes("prior to auction")) {
    soldAt = "PRIOR_TO_AUCTION";
  }

  // Extract date (DD MMM YYYY)
  const dateMatch = text.match(/\d{2}\s[A-Za-z]{3}\s\d{4}/);

  const soldDate = dateMatch ? new Date(dateMatch[0]).toISOString() : null;

  return {
    soldAt,
    soldDate,
  };
}

/**
 * Parse Domain.com.au search results page
 */
export function parseDomainSearchResults({html, listingType}: {html: string, listingType:Pick<PropertyListing,"listingType">["listingType"]}): PropertyListing[] {
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
    const parsed = parseListingCard({$, el, listingType});

    // console.dir(parsed, { depth: Infinity });

    if (parsed) {
      listings.push(parsed);
    }
  });

  console.info(
    chalk.greenBright(
      `Parsed ${listings.length} listings from search results.`,
    ),
  );

  return listings;
}

function parseListingCard({$, el, listingType}:{$: CheerioAPI, el: unknown, listingType:Pick<PropertyListing,"listingType">["listingType"]}): PropertyListing | null {
  const card = $(el as any);

  const href =
    card.find('a[href*="domain.com.au"], a[href^="/"]').first().attr("href") ||
    undefined;

  // console.log(chalk.yellowBright(`Parsing listing card with URL: ${href}`));
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

  // const listingType = listingType;
  // const listingStatus = priceText.toLowerCase().includes("sold")
  //   ? "SOLD"
  //   : undefined;
  const saleDetails = extractSaleDetails($, el);
  const listingStatus = saleDetails.soldAt ? "SOLD" : "ON_MARKET";

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
    price: priceText.includes("$") ? priceText : undefined,
    soldPrice: parseCurrency(priceText.includes("$") ? priceText : undefined),
    listingType,
    listingStatus,
    headline: addressLineText || undefined,
    scrapedAt: new Date().toISOString(),
    soldAt: saleDetails.soldAt || undefined,
    soldDate: saleDetails.soldDate || undefined,
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

function parseCurrencyToNumber(value: string | null): number | undefined {
  if (!value) return undefined;

  // Remove $ and commas
  const cleaned = value.replace(/\$/g, "").replace(/,/g, "").trim();

  const lastChar = cleaned.slice(-1).toLowerCase();

  let multiplier = 1;
  let numericPart = cleaned;

  if (lastChar === "m") {
    multiplier = 1_000_000;
    numericPart = cleaned.slice(0, -1);
  } else if (lastChar === "k") {
    multiplier = 1_000;
    numericPart = cleaned.slice(0, -1);
  }

  const number = parseFloat(numericPart);

  if (isNaN(number)) return undefined;

  return Math.round(number * multiplier);
}

export function propertyProfileValueParser(html: string) {
  const $ = cheerio.load(html);

  const result = {
    propertyValueEstimate: {
      low: undefined as number | undefined,
      mid: undefined as number | undefined,
      high: undefined as number | undefined,
    },
    rentalEstimatePerWeek: undefined as number | undefined,
  };

  /* PROPERTY VALUE */
  $('[data-testid="estimate-card"]')
    .find('[aria-label="Estimate Range"] > div')
    .each((_, el) => {
      const label = $(el).find("h4").text().trim().toLowerCase();
      const rawValue = $(el)
        .find('[data-testid="currency"]')
        .text()
        .replace(/\s+/g, "");

      const numericValue = parseCurrencyToNumber(rawValue);

      if (label === "low") result.propertyValueEstimate.low = numericValue;
      if (label === "mid") result.propertyValueEstimate.mid = numericValue;
      if (label === "high") result.propertyValueEstimate.high = numericValue;
    });

  /* RENTAL */
  $("h4")
    .filter((_, el) => $(el).text().trim() === "Rental estimate")
    .closest("section")
    .find("span")
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith("$")) {
        result.rentalEstimatePerWeek = parseCurrencyToNumber(text);
      }
    });

  return result;
}
