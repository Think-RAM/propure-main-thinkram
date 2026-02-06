// removed fs/path imports — no local reference file persistence anymore
import {
  parseAbsMarketData,
  scrapeAbsWithScrapeDo as requestAbsWithScrapeDo,
  waitForRateLimit,
  RATE_LIMITS,
  type AustralianState,
} from "@propure/mcp-shared";
import type { MarketData } from "@propure/mcp-shared";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import { DOMParser } from "@xmldom/xmldom";

interface AbsDemographics {
  suburb?: string;
  lga?: string;
  state: string;
  population: number;
  medianAge: number;
  medianWeeklyIncome: number;
  medianMonthlyMortgage: number;
  medianWeeklyRent: number;
  ownerOccupied: number;
  rented: number;
  unemploymentRate: number;
}

interface BuildingApprovalData {
  period: string;
  state: string;
  totalDwellings: number;
  houses: number;
  apartments: number;
  valueMillions: number;
}

/**
 * ABS Data Explorer API base URL
 * ABS provides a SDMX-compliant API for their statistics
 */
const ABS_API_BASE = "https://api.data.abs.gov.au";

function buildURL(postcode: string) {
  return `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${postcode}`;
}

interface ScrapeAbsResult extends Record<string, unknown> {
  url: string;
  marketData: MarketData;
  referencePath?: string;
}

/**
 * Fetch ABS quick stats HTML via Scrape.do, persist it as a reference artifact,
 * and return the parsed market data breakdowns.
 */
export async function getAbsDemographics(
  postcode: string,
): Promise<ScrapeAbsResult> {
  const url = buildURL(postcode);
  try {
    console.info({ url, postcode }, "Scraping ABS quick stats page");
    const html = await requestAbsWithScrapeDo(url);

    const marketData = parseAbsMarketData(html);
    if (!marketData) {
      throw new Error("Failed to parse ABS market data from fetched HTML");
    }

    // No local persistence of HTML reference anymore — return parsed data directly
    return { url, referencePath: undefined, marketData };
  } catch (error) {
    console.error({ err: error, url, postcode }, "Failed to scrape ABS page");
    throw error;
  }
}

/**
 * Get building approvals data from ABS
 */

interface AbsBuildingApprovals {
  sa2Code: string;
  sa2Name: string;
  month: string; // ISO format: '2025-01'
  totalApprovals: number;
  houseApprovals: number;
  apartmentApprovals: number;
  observationValue: number; // Raw value from XML
}

// Fetch building approvals from ABS API (XML response)
export async function getAbsBuildingApprovals(params: {
  sa2Code: string;
  startPeriod?: string; // ISO format: '2025-01'
}): Promise<AbsBuildingApprovals[]> {
  const { sa2Code, startPeriod = "2024-01" } = params;

  const url = `https://data.api.abs.gov.au/rest/data/ABS,BA_SA2,2.0.0/1.9.TOT.TOT..${sa2Code}.M?startPeriod=${startPeriod}&dimensionAtObservation=AllDimensions`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.sdmx.genericdata+xml;version=2.1",
    },
  });

  const xmlText = await response.text();

  // Parse XML response (SDMX-ML Generic format)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Extract observations from XML
  const observations = xmlDoc.getElementsByTagName("generic:Obs");
  const approvals: AbsBuildingApprovals[] = [];

  for (const obs of Array.from(observations)) {
    // Get TIME_PERIOD from ObsKey
    const obsKey = obs.getElementsByTagName("generic:ObsKey")[0];
    const timePeriodValue = Array.from(
      obsKey.getElementsByTagName("generic:Value"),
    ).find((v) => v.getAttribute("id") === "TIME_PERIOD");
    const month = timePeriodValue?.getAttribute("value");

    // Get actual value from ObsValue
    const obsValue = obs.getElementsByTagName("generic:ObsValue")[0];
    const value = parseFloat(obsValue?.getAttribute("value") || "0");

    if (month && !isNaN(value)) {
      approvals.push({
        sa2Code,
        sa2Name:
          (
            await client.query(
              api.functions.sa2geocode.getSa2GeocodeBySa2Code,
              {
                sa2Code: sa2Code,
              },
            )
          )?.sa2Name || "", // Reverse lookup
        month,
        totalApprovals: value,
        houseApprovals: Math.round(value * 0.4), // Approximation - breakdown requires separate data dimensions
        apartmentApprovals: Math.round(value * 0.6),
        observationValue: value,
      });
    }
  }

  return approvals;
}

export function getEstimatedBuildingApprovals(
  state?: string,
  months: number = 12,
): BuildingApprovalData[] {
  const result: BuildingApprovalData[] = [];
  const now = new Date();

  // Generate monthly estimates based on typical patterns
  const baseValues: Record<
    string,
    { total: number; houses: number; apts: number; value: number }
  > = {
    NSW: { total: 5200, houses: 1800, apts: 3400, value: 2800 },
    VIC: { total: 4800, houses: 2100, apts: 2700, value: 2400 },
    QLD: { total: 4200, houses: 2400, apts: 1800, value: 2100 },
    WA: { total: 2100, houses: 1400, apts: 700, value: 1100 },
    SA: { total: 1100, houses: 700, apts: 400, value: 550 },
    TAS: { total: 400, houses: 280, apts: 120, value: 200 },
    NT: { total: 150, houses: 80, apts: 70, value: 85 },
    ACT: { total: 450, houses: 150, apts: 300, value: 280 },
  };

  const base = baseValues[state || "NSW"] || baseValues.NSW;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    // Add some variation
    const variation = 0.9 + Math.random() * 0.2;

    result.push({
      period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      state: state || "NSW",
      totalDwellings: Math.round(base.total * variation),
      houses: Math.round(base.houses * variation),
      apartments: Math.round(base.apts * variation),
      valueMillions: Math.round(base.value * variation),
    });
  }

  return result;
}

/**
 * Get population projections
 */
export async function getAbsPopulationProjections(
  state?: AustralianState,
): Promise<{
  current: number;
  projected2030: number;
  projected2040: number;
  growthRate: number;
}> {
  await waitForRateLimit("market-api", RATE_LIMITS.market.api);

  // Population projections by state
  const projections: Record<
    string,
    { current: number; p2030: number; p2040: number; growth: number }
  > = {
    NSW: { current: 8166369, p2030: 9100000, p2040: 10200000, growth: 1.2 },
    VIC: { current: 6503491, p2030: 7400000, p2040: 8500000, growth: 1.4 },
    QLD: { current: 5156138, p2030: 6000000, p2040: 7000000, growth: 1.6 },
    WA: { current: 2660026, p2030: 3000000, p2040: 3400000, growth: 1.3 },
    SA: { current: 1771703, p2030: 1900000, p2040: 2000000, growth: 0.7 },
    TAS: { current: 557571, p2030: 600000, p2040: 640000, growth: 0.7 },
    NT: { current: 232605, p2030: 250000, p2040: 270000, growth: 0.8 },
    ACT: { current: 454499, p2030: 520000, p2040: 600000, growth: 1.4 },
  };

  const data = projections[state || "NSW"] || projections.NSW;

  return {
    current: data.current,
    projected2030: data.p2030,
    projected2040: data.p2040,
    growthRate: data.growth,
  };
}

interface SA2GeocodeResult {
  sa2Code: string;
  sa2Name: string;
  state: string;
  geometry?: {
    x: number; // Longitude
    y: number; // Latitude
  };
}

async function getSA2CodeForSuburb(
  suburb: string,
  state: string,
): Promise<SA2GeocodeResult> {
  const url = new URL(
    "https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA2/MapServer/find",
  );

  url.searchParams.set("searchText", suburb);
  url.searchParams.set("contains", "true");
  url.searchParams.set("searchFields", "SA2_NAME_2021");
  url.searchParams.set("layers", "0");
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("f", "json");

  const response = await fetch(url.toString());
  const data: any = await response.json();

  if (!data?.results || data.results.length === 0) {
    throw new Error(`No SA2 found for suburb: ${suburb}`);
  }

  // Filter results by state if multiple matches
  let result = data.results[0];
  if (data.results.length > 1) {
    const stateMatch = data.results.find((r: any) =>
      r.attributes.STE_NAME_2021?.includes(state),
    );
    if (stateMatch) result = stateMatch;
  }

  return {
    sa2Code: result.attributes.SA2_CODE_2021,
    sa2Name: result.attributes.SA2_NAME_2021,
    state: result.attributes.STE_NAME_2021 || state,
    geometry: result.geometry
      ? {
          x: result.geometry.x,
          y: result.geometry.y,
        }
      : undefined,
  };
}

export async function getSA2CodeForSuburbCached(
  suburb: string,
  state: AustralianState,
): Promise<SA2GeocodeResult> {
  const normalizedSuburb = suburb.trim().toLowerCase();

  try {
    const cached: any = await client.query(
      api.functions.sa2geocode.getSa2GeocodeBySuburbState,
      { suburb: normalizedSuburb, state },
    );

    if (cached) {
      return {
        sa2Code: cached.sa2Code,
        sa2Name: cached.sa2Name,
        state: cached.state,
        geometry:
          typeof cached.longitude === "number" &&
          typeof cached.latitude === "number"
            ? { x: cached.longitude, y: cached.latitude }
            : undefined,
      };
    }
  } catch (err) {
    console.error("Convex query failed while reading SA2 cache:", err);
    // continue to fetch from external API
  }

  // Fetch from API
  const sa2Info = await getSA2CodeForSuburb(suburb, state);

  // Persist into Convex (best-effort)
  try {
    await client.mutation(api.functions.sa2geocode.insertSa2Geocode, {
      suburb: normalizedSuburb,
      state: sa2Info.state as AustralianState,
      sa2Code: sa2Info.sa2Code,
      sa2Name: sa2Info.sa2Name,
      longitude: sa2Info.geometry?.x,
      latitude: sa2Info.geometry?.y,
    });
  } catch (err) {
    console.error("Convex mutation failed while inserting SA2 geocode:", err);
  }

  return sa2Info;
}
