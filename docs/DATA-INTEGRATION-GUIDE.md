# Propure Data Integration & Tool Implementation Guide

## Overview

This comprehensive guide answers 7 critical questions about Propure's data integration, agent tools, and algorithms. It serves as the definitive reference for implementing the AI-powered property investment platform's data layer, background jobs, and multi-agent orchestration.

**Purpose**: Provide actionable technical specifications for developers implementing:

- ABS/RBA market data integration
- AI agent tool schemas and implementations
- Property search and sales data pipelines
- Suburb scoring algorithms
- Background job workflows

**Audience**: Backend engineers, AI/ML engineers, and full-stack developers working on Propure.

---

## Table of Contents

1. [ABS Data Usage by Researcher Agent](#1-abs-data-usage-by-researcher-agent)
2. [Expense Data Sources for Analyst Agent](#2-expense-data-sources-for-analyst-agent)
3. [Tool Implementation Details (PRO-17, PRO-18, PRO-19)](#3-tool-implementation-details-pro-17-pro-18-pro-19)
4. [Minimal Suburb List for MVP](#4-minimal-suburb-list-for-mvp)
5. [Market Data Retrieval (PRO-25)](#5-market-data-retrieval-pro-25)
6. [Suburb Scoring Algorithm (PRO-24)](#6-suburb-scoring-algorithm-pro-24)
7. [Sales Data Retrieval (PRO-15)](#7-sales-data-retrieval-pro-15)

**Appendices**:

- [Appendix A: Quick Reference Table](#appendix-a-quick-reference-table)
- [Appendix B: Database Schema Reference](#appendix-b-database-schema-reference)
- [Appendix C: Glossary of Terms](#appendix-c-glossary-of-terms)
- [Appendix D: Related Documentation](#appendix-d-related-documentation)

---

## 1. ABS Data Usage by Researcher Agent

### 1.1 Current Implementation Overview

The Australian Bureau of Statistics (ABS) integration is implemented in the MCP market-data package, providing demographic, economic, and population data for suburb-level analysis.

**Location**: `/packages/mcp-market-data/src/sources/abs-scraper.ts`

**Data Access Method**: Mixed - API for some data, web scraping for others

**Three Main Functions**:

1. **`getAbsDemographics()`** - Census and demographic data (scraped from QuickStats via scrape.do)
2. **`getAbsBuildingApprovals()`** - Construction activity indicators (via official ABS API - XML response)
3. **`getAbsPopulationProjections()`** - Long-term population forecasts (scraped from ABS projections)

**Supporting Function**: 4. **`getSA2CodeForSuburb()`** - Get SA2 statistical area code for a suburb (via ABS Geo API)

**Data Access Summary**:

- **Census Demographics**: Web scraping (no API available) via scrape.do
- **Building Approvals**: Official ABS API (XML format) ✅
- **SA2 Geocoding**: Official ABS Geo API (JSON format) ✅
- **Population Projections**: Web scraping (no API available) via scrape.do

### 1.2 Data Points Retrieved

#### Demographics (via `getAbsDemographics`)

**Source**: ABS Census 2021 QuickStats (POA/SA2 level data)

```typescript
interface AbsDemographics {
  // Population
  totalPopulation: number;
  medianAge: number;
  populationGrowth: number; // YoY %
  malePercentage: number;
  femalePercentage: number;

  // Income & Financial
  medianWeeklyPersonalIncome: number;
  medianWeeklyHouseholdIncome: number;
  medianWeeklyFamilyIncome: number;
  medianMonthlyMortgageRepayment: number;
  medianWeeklyRent: number;

  // Education (top 3 responses)
  educationBachelorDegree: number; // Percentage
  educationAdvancedDiploma: number;
  educationYear12: number;
  educationNoSchool: number;

  // Ancestry (top 5 responses)
  ancestryTop: Array<{
    ancestry: string;
    percentage: number;
  }>;

  // Religion (top 5 responses)
  religionTop: Array<{
    religion: string;
    percentage: number;
  }>;

  // Language at home (top 5 responses, excluding English)
  languageAtHomeTop: Array<{
    language: string;
    percentage: number;
  }>;
  englishOnlyPercentage: number;

  // Labour Force
  labourForceParticipationRate: number; // % of population 15+ in workforce
  employmentToPopulationRatio: number;
  unemploymentRate: number;
  notInLabourForcePercentage: number;

  // Employment Status
  employedFullTime: number; // Percentage
  employedPartTime: number;
  awayFromWork: number;
  unemployedLookingForWork: number;

  // Occupation (top 5 responses)
  occupationTop: Array<{
    occupation: string;
    percentage: number;
  }>;
  professionalOccupationPercentage: number;
  managersPercentage: number;
  techniciansPercentage: number;
  labourersPercentage: number;

  // Couple Families Employment Status
  coupleBothEmployed: number; // Percentage
  coupleOneEmployed: number;
  coupleNeitherEmployed: number;

  // Dwelling Characteristics
  totalDwellings: number;
  occupiedDwellings: number;
  unoccupiedDwellings: number;

  // Dwelling Structure (top responses)
  dwellingStructure: {
    separateHouse: number; // Percentage
    semiDetached: number;
    flatUnitApartment: number;
    other: number;
  };

  // Number of Bedrooms (distribution)
  bedroomDistribution: {
    noBedroom: number; // Percentage
    oneBedroom: number;
    twoBedrooms: number;
    threeBedrooms: number;
    fourOrMoreBedrooms: number;
  };

  // Tenure Type
  tenureOwned: number; // Percentage
  tenureMortgaged: number;
  tenureRented: number;
  tenureOther: number;

  // Household Income (weekly, distribution)
  householdIncomeDistribution: {
    negative: number; // Percentage
    nil: number;
    under400: number;
    _400to799: number;
    _800to1249: number;
    _1250to1999: number;
    _2000to2999: number;
    _3000plus: number;
  };

  // Rent Weekly Payments (distribution)
  rentPaymentDistribution: {
    under200: number; // Percentage
    _200to299: number;
    _300to449: number;
    _450to649: number;
    _650plus: number;
  };

  // Mortgage Monthly Repayments (distribution)
  mortgageRepaymentDistribution: {
    under1000: number; // Percentage
    _1000to1999: number;
    _2000to2999: number;
    _3000to4499: number;
    _4500plus: number;
  };
}
```

**Example usage**:

```typescript
const demographics = await getAbsDemographics({
  suburb: "Parramatta",
  state: "NSW",
  postcode: "2150",
});

// Returns comprehensive census data:
// {
//   totalPopulation: 28123,
//   medianAge: 34,
//   populationGrowth: 2.1,
//
//   medianWeeklyPersonalIncome: 805,
//   medianWeeklyHouseholdIncome: 1876,
//   medianMonthlyMortgageRepayment: 2167,
//   medianWeeklyRent: 450,
//
//   educationBachelorDegree: 28.5,
//   educationAdvancedDiploma: 12.3,
//
//   ancestryTop: [
//     { ancestry: 'Australian', percentage: 18.2 },
//     { ancestry: 'English', percentage: 15.7 },
//     { ancestry: 'Chinese', percentage: 12.4 },
//     { ancestry: 'Indian', percentage: 8.9 },
//     { ancestry: 'Irish', percentage: 6.3 }
//   ],
//
//   religionTop: [
//     { religion: 'Catholic', percentage: 24.1 },
//     { religion: 'No religion', percentage: 22.8 },
//     { religion: 'Islam', percentage: 11.3 },
//     { religion: 'Anglican', percentage: 9.2 },
//     { religion: 'Hinduism', percentage: 7.5 }
//   ],
//
//   languageAtHomeTop: [
//     { language: 'Mandarin', percentage: 8.4 },
//     { language: 'Arabic', percentage: 7.2 },
//     { language: 'Cantonese', percentage: 5.8 },
//     { language: 'Hindi', percentage: 4.1 },
//     { language: 'Tamil', percentage: 3.2 }
//   ],
//   englishOnlyPercentage: 48.3,
//
//   labourForceParticipationRate: 64.2,
//   unemploymentRate: 5.8,
//   employedFullTime: 42.1,
//   employedPartTime: 16.3,
//
//   occupationTop: [
//     { occupation: 'Professionals', percentage: 28.4 },
//     { occupation: 'Clerical and Administrative Workers', percentage: 15.2 },
//     { occupation: 'Technicians and Trades Workers', percentage: 12.8 },
//     { occupation: 'Sales Workers', percentage: 10.5 },
//     { occupation: 'Managers', percentage: 9.7 }
//   ],
//
//   coupleBothEmployed: 52.4,
//   coupleOneEmployed: 32.1,
//   coupleNeitherEmployed: 15.5,
//
//   totalDwellings: 10847,
//   occupiedDwellings: 10203,
//
//   dwellingStructure: {
//     separateHouse: 34.2,
//     semiDetached: 18.5,
//     flatUnitApartment: 44.3,
//     other: 3.0
//   },
//
//   bedroomDistribution: {
//     noBedroom: 1.2,
//     oneBedroom: 12.8,
//     twoBedrooms: 34.5,
//     threeBedrooms: 38.2,
//     fourOrMoreBedrooms: 13.3
//   },
//
//   tenureOwned: 18.4,
//   tenureMortgaged: 35.2,
//   tenureRented: 42.8,
//   tenureOther: 3.6,
//
//   householdIncomeDistribution: {
//     negative: 0.8,
//     nil: 2.1,
//     under400: 8.5,
//     _400to799: 12.4,
//     _800to1249: 15.8,
//     _1250to1999: 22.3,
//     _2000to2999: 21.1,
//     _3000plus: 17.0
//   },
//
//   rentPaymentDistribution: {
//     under200: 8.2,
//     _200to299: 12.5,
//     _300to449: 32.4,
//     _450to649: 31.2,
//     _650plus: 15.7
//   },
//
//   mortgageRepaymentDistribution: {
//     under1000: 5.3,
//     _1000to1999: 18.7,
//     _2000to2999: 28.4,
//     _3000to4499: 32.1,
//     _4500plus: 15.5
//   }
// }
```

**Data Source Notes**:

- **Primary Source**: ABS Census 2021 (most recent complete census)
- **Geographic Level**: Postcode Area (POA) or SA2 level
- **Update Frequency**: Every 5 years (next census: 2026)
- **Interim Updates**: Some indicators updated via quarterly/annual ABS releases
- **QuickStats URL**: `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA{postcode}`

#### Building Approvals (via `getAbsBuildingApprovals`)

**Source**: ABS Building Approvals API (Official XML API) ✅

**API Endpoint**: `https://data.api.abs.gov.au/rest/data/ABS,BA_SA2,2.0.0/1.9.TOT.TOT..{SA2_CODE_2021}.M?startPeriod=YYYY-MM&dimensionAtObservation=AllDimensions`

```typescript
interface AbsBuildingApprovals {
  sa2Code: string;
  sa2Name: string;
  month: string; // ISO format: '2025-01'
  totalApprovals: number;
  houseApprovals: number;
  apartmentApprovals: number;
  observationValue: number; // Raw value from XML
}
```

**Example usage**:

```typescript
// Step 1: Get SA2 code for suburb
const sa2Code = await getSA2CodeForSuburb("Parramatta", "NSW");
// Returns: '11703' (Parramatta SA2 code)

// Step 2: Fetch building approvals for that SA2
const approvals = await getAbsBuildingApprovals({
  sa2Code: "11703",
  startPeriod: "2025-01", // Start from January 2025
});

// Returns: [
//   {
//     sa2Code: '11703',
//     sa2Name: 'Parramatta',
//     month: '2025-01',
//     totalApprovals: 234,
//     houseApprovals: 89,
//     apartmentApprovals: 145
//   },
//   ...
// ]
```

**API Implementation**:

```typescript
// Fetch building approvals from ABS API (XML response)
async function getAbsBuildingApprovals(params: {
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
    const timePeriodValue = Array.from(obsKey.getElementsByTagName("generic:Value"))
      .find(v => v.getAttribute("id") === "TIME_PERIOD");
    const month = timePeriodValue?.getAttribute("value");

    // Get actual value from ObsValue
    const obsValue = obs.getElementsByTagName("generic:ObsValue")[0];
    const value = parseFloat(obsValue?.getAttribute("value") || "0");

    if (month && !isNaN(value)) {
      approvals.push({
        sa2Code,
        sa2Name: await getSA2NameFromCode(sa2Code), // Reverse lookup
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
```

**Data Notes**:

- **Geographic Level**: SA2 (Statistical Area Level 2) - more granular than postcode
- **Update Frequency**: Monthly (released ~5 weeks after period end)
- **Response Format**: XML (SDMX-ML Generic format)
- **No Authentication Required**: Public API
- **Rate Limits**: Unknown, but recommend caching

**XML Response Structure**:
```xml
<message:GenericData>
  <message:Header>...</message:Header>
  <message:DataSet>
    <generic:Obs>
      <generic:ObsKey>
        <generic:Value id="TIME_PERIOD" value="2025-04"/>
        <generic:Value id="MEASURE" value="1"/>
        <generic:Value id="SECTOR" value="9"/>
        <generic:Value id="WORK_TYPE" value="TOT"/>
        <generic:Value id="BUILDING_TYPE" value="TOT"/>
        <generic:Value id="REGION_TYPE" value="SA2"/>
        <generic:Value id="REGION" value="115011558"/>
        <generic:Value id="FREQ" value="M"/>
      </generic:ObsKey>
      <generic:ObsValue value="2"/>
      <generic:Attributes>
        <generic:Value id="UNIT_MEASURE" value="NUM"/>
        <generic:Value id="UNIT_MULT" value="0"/>
      </generic:Attributes>
    </generic:Obs>
    <!-- More observations for other months... -->
  </message:DataSet>
</message:GenericData>
```

**Key XML Elements**:
- `<generic:Obs>`: Each observation (one per month)
- `<generic:ObsKey>`: Contains dimension values (time period, region, etc.)
- `<generic:Value id="TIME_PERIOD">`: Month in YYYY-MM format
- `<generic:Value id="REGION">`: SA2 code
- `<generic:ObsValue value="X">`: Actual building approvals count
- `<generic:Attributes>`: Metadata (unit of measure, multiplier)

#### SA2 Geocoding (via `getSA2CodeForSuburb`)

**Source**: ABS ArcGIS Geo API (Official JSON API) ✅

**API Endpoint**: `https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA2/MapServer/find`

**Purpose**: Convert suburb name to SA2 code for use with Building Approvals API and other SA2-level data

```typescript
interface SA2GeocodeResult {
  sa2Code: string;
  sa2Name: string;
  state: string;
  geometry?: {
    x: number; // Longitude
    y: number; // Latitude
  };
}
```

**Example usage**:

```typescript
const sa2Info = await getSA2CodeForSuburb("Parramatta", "NSW");

// Returns:
// {
//   sa2Code: '11703',
//   sa2Name: 'Parramatta',
//   state: 'NSW',
//   geometry: { x: 151.0039, y: -33.8153 }
// }
```

**API Implementation**:

```typescript
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
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
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
```

**Caching Strategy**:

```typescript
// Cache SA2 codes permanently (they don't change between Census periods)
async function getSA2CodeForSuburbCached(
  suburb: string,
  state: string,
): Promise<SA2GeocodeResult> {
  // Check database cache
  const cached = await db.sa2Geocode.findUnique({
    where: {
      suburb_state: {
        suburb: suburb.toLowerCase(),
        state,
      },
    },
  });

  if (cached) {
    return cached;
  }

  // Fetch from API
  const sa2Info = await getSA2CodeForSuburb(suburb, state);

  // Store in database permanently
  await db.sa2Geocode.create({
    data: {
      suburb: suburb.toLowerCase(),
      state,
      sa2Code: sa2Info.sa2Code,
      sa2Name: sa2Info.sa2Name,
      longitude: sa2Info.geometry?.x,
      latitude: sa2Info.geometry?.y,
    },
  });

  return sa2Info;
}
```

**Database Schema for SA2 Cache**:

```prisma
model SA2Geocode {
  id        String   @id @default(cuid())
  suburb    String   // Normalized (lowercase)
  state     String
  sa2Code   String
  sa2Name   String
  longitude Decimal? @db.Decimal(11, 8)
  latitude  Decimal? @db.Decimal(10, 8)

  createdAt DateTime @default(now())

  @@unique([suburb, state])
  @@index([sa2Code])
}
```

**Usage in Suburb Analysis**:

```typescript
// Workflow: Suburb name → SA2 code → Building Approvals data
async function analyzeSuburbBuildingActivity(suburb: string, state: string) {
  // Step 1: Get SA2 code
  const sa2Info = await getSA2CodeForSuburbCached(suburb, state);

  // Step 2: Fetch building approvals for that SA2
  const approvals = await getAbsBuildingApprovals({
    sa2Code: sa2Info.sa2Code,
    startPeriod: "2024-01",
  });

  // Step 3: Analyze trends
  const totalApprovals = approvals.reduce(
    (sum, a) => sum + a.totalApprovals,
    0,
  );
  const avgMonthlyApprovals = totalApprovals / approvals.length;

  return {
    suburb,
    sa2Code: sa2Info.sa2Code,
    totalApprovals,
    avgMonthlyApprovals,
    trend: calculateTrend(approvals),
  };
}
```

**Data Notes**:

- **Geographic Level**: SA2 (Statistical Area Level 2) from ASGS 2021
- **Update Frequency**: Static (only changes with new Census/ASGS updates)
- **Response Format**: JSON (ArcGIS REST API)
- **No Authentication Required**: Public API
- **Cache Strategy**: Store permanently (SA2 boundaries don't change often)
- **Geometry Data**: Includes centroid coordinates for mapping

#### Population Projections (via `getAbsPopulationProjections`)

```typescript
interface AbsPopulationProjection {
  suburb: string;
  state: string;
  year: number; // 2024-2040
  projectedPopulation: number;
  growthRate: number; // % change from previous year
}
```

**Example usage**:

```typescript
const projections = await getAbsPopulationProjections({
  suburb: "Parramatta",
  state: "NSW",
  yearFrom: 2024,
  yearTo: 2030,
});
// Returns: [
//   { suburb: 'Parramatta', year: 2024, projectedPopulation: 28500, ... },
//   { suburb: 'Parramatta', year: 2025, projectedPopulation: 29100, ... },
//   ...
// ]
```

### 1.3 Access Patterns

The Researcher Agent accesses ABS data through different flows depending on data type:

#### Pattern 1: Census Demographics (Web Scraping)

```
Researcher Agent Tool
        ↓
MCP HTTP Client (/apps/web/lib/mcp/client.ts)
        ↓
HTTP POST to /api/mcp/market
        ↓
MCP Market-Data Server (/packages/mcp-market-data)
        ↓
ABS Scraper (via scrape.do)
        ↓
ABS QuickStats Website
(https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA{postcode})
```

**Scraping Implementation**:

- **Service**: scrape.do handles JavaScript rendering and proxy rotation
- **Target URL**: `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA{postcode}`
- **Parsing**: Extract structured data from HTML tables and sections using cheerio
- **Rate Limiting**: scrape.do handles rate limiting automatically
- **Caching**: Scraped data cached in Redis (24-hour TTL) and database (permanent)

#### Pattern 2: Building Approvals (Official API)

```
Researcher Agent Tool
        ↓
MCP HTTP Client
        ↓
HTTP POST to /api/mcp/market
        ↓
MCP Market-Data Server
        ↓
Step 1: ABS Geo API (Get SA2 code)
(https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA2/MapServer/find)
        ↓
Step 2: ABS Building Approvals API (XML response)
(https://data.api.abs.gov.au/rest/data/ABS,BA_SA2,2.0.0/...)
```

**API Implementation**:

- **SA2 Geocoding**: JSON API to convert suburb name → SA2 code
- **Building Approvals**: XML API (SDMX format) for monthly approval data
- **No Authentication Required**: Public APIs
- **Caching**: SA2 codes cached permanently, approvals cached for 24 hours

**Tool wrapper example** (simplified):

```typescript
import { tool } from "ai";
import { z } from "zod";
import { callMcpTool } from "@/lib/mcp/client";

export const getSuburbDemographics = tool({
  description: "Get demographic data for a suburb from ABS",
  parameters: z.object({
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("Australian state code (NSW, VIC, etc.)"),
    postcode: z
      .string()
      .describe("Australian postcode (required for ABS lookup)"),
  }),
  execute: async ({ suburb, state, postcode }) => {
    try {
      const response = await callMcpTool("market-data", "getAbsDemographics", {
        suburb,
        state,
        postcode, // Required for QuickStats URL construction
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ABS demographics:", error);
      return { error: "Demographics data unavailable" };
    }
  },
});
```

### 1.4 Web Scraping Implementation with scrape.do

Since ABS does not provide an official API, all census data is retrieved by scraping QuickStats pages using [scrape.do](https://scrape.do/).

#### scrape.do Configuration

```typescript
// /packages/mcp-market-data/src/sources/abs-scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

const SCRAPE_DO_API_KEY = process.env.SCRAPE_DO_API_KEY;
const SCRAPE_DO_ENDPOINT = "https://api.scrape.do";

interface ScrapeDoParams {
  url: string;
  renderJs?: boolean;
  proxyCountry?: string;
  cache?: boolean;
  cacheTtl?: number; // seconds
}

async function scrapeWithScrapeDo(params: ScrapeDoParams): Promise<string> {
  const response = await axios.get(SCRAPE_DO_ENDPOINT, {
    params: {
      token: SCRAPE_DO_API_KEY,
      url: params.url,
      render_js: params.renderJs ?? true, // ABS uses JavaScript
      proxy_country: params.proxyCountry ?? "au", // Use Australian proxy
      super_proxy: true, // Rotate IPs automatically
      cache: params.cache ?? true,
      cache_ttl: params.cacheTtl ?? 86400, // 24 hours
    },
    timeout: 30000, // 30 second timeout
  });

  return response.data;
}
```

#### QuickStats Scraping Example

```typescript
export async function getAbsDemographics(params: {
  suburb: string;
  state: string;
  postcode: string;
}): Promise<AbsDemographics> {
  const { postcode } = params;

  // Check database cache first
  const cached = await db.censusDemographics.findUnique({
    where: { postcode, censusYear: 2021 },
  });

  if (
    cached &&
    cached.scrapedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ) {
    return cached.data as AbsDemographics;
  }

  // Scrape QuickStats page
  const url = `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${postcode}`;

  try {
    const html = await scrapeWithScrapeDo({
      url,
      renderJs: true,
      proxyCountry: "au",
      cache: true,
      cacheTtl: 86400, // Cache in scrape.do for 24 hours
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Extract data from QuickStats sections
    const demographics: AbsDemographics = {
      // Population
      totalPopulation: parseIntFromSection($, "Total population"),
      medianAge: parseIntFromSection($, "Median age"),

      // Income (extract from tables)
      medianWeeklyPersonalIncome: parseDecimalFromTable(
        $,
        "Median weekly personal income",
      ),
      medianWeeklyHouseholdIncome: parseDecimalFromTable(
        $,
        "Median weekly household income",
      ),
      medianWeeklyFamilyIncome: parseDecimalFromTable(
        $,
        "Median weekly family income",
      ),
      medianMonthlyMortgageRepayment: parseDecimalFromTable(
        $,
        "Median monthly mortgage repayments",
      ),
      medianWeeklyRent: parseDecimalFromTable($, "Median weekly rent"),

      // Education (parse percentages from "Highest level of education" table)
      educationBachelorDegree: parsePercentageFromTable(
        $,
        "Bachelor Degree level",
      ),
      educationAdvancedDiploma: parsePercentageFromTable(
        $,
        "Advanced Diploma and Diploma level",
      ),
      educationYear12: parsePercentageFromTable($, "Year 12"),
      educationNoSchool: parsePercentageFromTable(
        $,
        "No educational attainment",
      ),

      // Ancestry (parse top 5 from "Ancestry, top responses" table)
      ancestryTop: parseTopResponses($, "Ancestry, top responses"),

      // Religion (parse top 5 from "Religious affiliation, top responses" table)
      religionTop: parseTopResponses($, "Religious affiliation, top responses"),

      // Language (parse top 5 from "Language used at home, top responses" table)
      languageAtHomeTop: parseTopResponses(
        $,
        "Language used at home, top responses (other than English)",
      ),
      englishOnlyPercentage: parsePercentageFromTable($, "English only"),

      // Labour Force (from "Participation in the labour force" section)
      labourForceParticipationRate: parsePercentageFromSection(
        $,
        "Participation rate",
      ),
      unemploymentRate: parsePercentageFromSection($, "Unemployment rate"),
      employedFullTime: parsePercentageFromSection(
        $,
        "Employed, worked full-time",
      ),
      employedPartTime: parsePercentageFromSection(
        $,
        "Employed, worked part-time",
      ),

      // Occupation (parse top 5 from "Occupation, top responses" table)
      occupationTop: parseTopResponses($, "Occupation, top responses"),

      // Couple families employment
      coupleBothEmployed: parsePercentageFromTable($, "Both employed"),
      coupleOneEmployed: parsePercentageFromTable($, "One employed"),
      coupleNeitherEmployed: parsePercentageFromTable($, "Neither employed"),

      // Dwellings
      totalDwellings: parseIntFromSection($, "Total dwellings"),
      occupiedDwellings: parseIntFromSection($, "Occupied dwellings"),
      unoccupiedDwellings: parseIntFromSection($, "Unoccupied dwellings"),

      // Dwelling structure (from "Dwelling structure" table)
      dwellingStructure: {
        separateHouse: parsePercentageFromTable($, "Separate house"),
        semiDetached: parsePercentageFromTable(
          $,
          "Semi-detached, row or terrace house, townhouse etc.",
        ),
        flatUnitApartment: parsePercentageFromTable($, "Flat or apartment"),
        other: parsePercentageFromTable($, "Other dwelling"),
      },

      // Bedroom distribution (from "Number of bedrooms" table)
      bedroomDistribution: {
        noBedroom: parsePercentageFromTable($, "None (includes bedsitters)"),
        oneBedroom: parsePercentageFromTable($, "1 bedroom"),
        twoBedrooms: parsePercentageFromTable($, "2 bedrooms"),
        threeBedrooms: parsePercentageFromTable($, "3 bedrooms"),
        fourOrMoreBedrooms: parsePercentageFromTable($, "4 or more bedrooms"),
      },

      // Tenure type (from "Tenure type" table)
      tenureOwned: parsePercentageFromTable($, "Owned outright"),
      tenureMortgaged: parsePercentageFromTable($, "Owned with a mortgage"),
      tenureRented: parsePercentageFromTable($, "Rented"),
      tenureOther: parsePercentageFromTable($, "Other tenure type"),

      // Income/Rent/Mortgage distributions (parse full distribution tables)
      householdIncomeDistribution: parseDistributionTable(
        $,
        "Household income",
      ),
      rentPaymentDistribution: parseDistributionTable(
        $,
        "Rent weekly payments",
      ),
      mortgageRepaymentDistribution: parseDistributionTable(
        $,
        "Mortgage monthly repayments",
      ),
    };

    // Save to database for future use
    await db.censusDemographics.upsert({
      where: { postcode_censusYear: { postcode, censusYear: 2021 } },
      update: {
        data: demographics,
        scrapedAt: new Date(),
      },
      create: {
        postcode,
        censusYear: 2021,
        data: demographics,
        scrapedAt: new Date(),
      },
    });

    return demographics;
  } catch (error) {
    console.error(`Failed to scrape ABS QuickStats for ${postcode}:`, error);

    // Return cached data if available, even if stale
    if (cached) {
      console.warn(`Using stale cached data for ${postcode}`);
      return cached.data as AbsDemographics;
    }

    throw new Error("Failed to retrieve ABS demographics");
  }
}

// Helper parsing functions
function parseIntFromSection(
  $: cheerio.CheerioAPI,
  label: string,
): number | undefined {
  // Find the element containing the label and extract adjacent number
  const text = $(`*:contains("${label}")`).first().text();
  const match = text.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, "")) : undefined;
}

function parseDecimalFromTable(
  $: cheerio.CheerioAPI,
  label: string,
): number | undefined {
  // Extract decimal value (e.g., $805 or 805)
  const text = $(`td:contains("${label}")`).next().text();
  const match = text.match(/[\d,]+/);
  return match ? parseFloat(match[0].replace(/,/g, "")) : undefined;
}

function parsePercentageFromTable(
  $: cheerio.CheerioAPI,
  label: string,
): number | undefined {
  // Extract percentage value (e.g., "28.4%" → 28.4)
  const text = $(`td:contains("${label}")`).next().text();
  const match = text.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : undefined;
}

function parseTopResponses(
  $: cheerio.CheerioAPI,
  sectionTitle: string,
): Array<{ name: string; percentage: number }> {
  // Find the table under the section and extract top 5 rows
  const section = $(`h3:contains("${sectionTitle}")`).next("table");
  const rows = section.find("tbody tr").slice(0, 5);

  return rows
    .map((_, row) => {
      const cells = $(row).find("td");
      return {
        name: $(cells[0]).text().trim(),
        percentage: parseFloat($(cells[1]).text().replace("%", "")),
      };
    })
    .get();
}

function parseDistributionTable(
  $: cheerio.CheerioAPI,
  sectionTitle: string,
): Record<string, number> {
  // Extract full distribution table as key-value pairs
  const section = $(`h3:contains("${sectionTitle}")`).next("table");
  const rows = section.find("tbody tr");

  const distribution: Record<string, number> = {};
  rows.each((_, row) => {
    const cells = $(row).find("td");
    const bucket = $(cells[0]).text().trim();
    const percentage = parseFloat($(cells[1]).text().replace("%", ""));
    distribution[bucket] = percentage;
  });

  return distribution;
}
```

**Key Implementation Details**:

- **scrape.do handles**: JavaScript rendering, proxy rotation, rate limiting, caching
- **Parsing strategy**: Use cheerio to parse HTML tables and sections
- **Database caching**: Store scraped data permanently (only re-scrape on Census updates)
- **Redis caching**: 24-hour TTL for frequently accessed postcodes
- **Error handling**: Fall back to stale cached data if scraping fails
- **Cost optimization**: Aggressive caching minimizes scrape.do API calls

### 1.5 Current Limitations

1. **Data Freshness**: Census data is updated every 5 years (2021 → 2026); interim years use last census + estimates
2. **Scraping Reliability**: ABS website structure changes can break parsers; requires monitoring and maintenance
3. **Geographic Granularity**: Postcode (POA) level only; some suburbs span multiple postcodes requiring aggregation
4. **Scraping Performance**: Initial scrape takes 5-10 seconds per postcode; mitigated by aggressive caching
5. **Data Completeness**: Not all suburbs have complete QuickStats data (especially small/new suburbs)

**Gap mitigation strategies**:

- **Aggressive Caching**: Store scraped data in database permanently; refresh only on Census updates
- **Redis Cache**: 24-hour TTL for frequently accessed postcodes
- **Fallback Hierarchy**: Postcode → SA2 → LGA → State → National averages
- **Scraping Resilience**: Use scrape.do for JavaScript rendering, proxy rotation, automatic retries
- **Parser Monitoring**: Alert on HTML structure changes via error rate spikes

### 1.6 Integration with Researcher Agent

The Researcher Agent uses ABS data in the following scenarios:

**Scenario 1: Comprehensive Suburb Analysis**

- User: "Tell me about Parramatta"
- Agent calls: `getSuburbDemographics('Parramatta', 'NSW')`
- Response includes:
  - Population demographics (28,123 people, median age 34)
  - Income levels (median household $1,876/week)
  - Cultural diversity (top 5 ancestries, languages spoken)
  - Employment profile (64% labour force participation, 28% professionals)
  - Housing composition (44% apartments, 34% houses)
  - Tenure split (43% rented, 35% mortgaged, 18% owned)
  - Affordability indicators (median rent $450/week, mortgage $2,167/month)

**Scenario 2: Market Insights**

- User: "What's the building activity in NSW?"
- Agent calls: `getBuildingApprovals('NSW', dateRange)`
- Response includes: Monthly approval trends, supply indicators

**Scenario 3: Growth Forecasting**

- User: "Will Parramatta grow?"
- Agent calls: `getPopulationProjections('Parramatta', 'NSW', 2024-2030)`
- Response includes: 6-year population growth forecast

**Scenario 4: Rental Market Analysis**

- User: "What's the rental market like in Parramatta?"
- Agent calls: `getSuburbDemographics('Parramatta', 'NSW')`
- Analyzes:
  - Rental tenure: 42.8% of dwellings rented
  - Rent distribution: 31% pay $450-649/week, 16% pay $650+/week
  - Median weekly rent: $450
  - Dwelling types: 44% apartments (typically rented), 34% houses
  - Renter demographics: Young professionals (median age 34), diverse cultural backgrounds
- Synthesizes: "Parramatta has a strong rental market with 43% of properties rented.
  Most renters pay $450-649/week, reflecting the suburb's mix of apartments and houses.
  The young, professional demographic (64% workforce participation, 28% professionals)
  supports stable rental demand."

**Scenario 5: Investment Target Demographics**

- User: "Who lives in Parramatta? Is it good for family rentals?"
- Agent calls: `getSuburbDemographics('Parramatta', 'NSW')`
- Analyzes:
  - Household composition: 52% of couples both employed
  - Dwelling bedrooms: 38% are 3-bedroom, 13% are 4+ bedroom
  - Education levels: 29% bachelor degree holders
  - Family income: Median household $1,876/week
- Synthesizes: "Parramatta attracts dual-income professional couples with strong education
  levels. The prevalence of 3-bedroom dwellings (38%) suggests family suitability.
  52% of couples are both employed, indicating stable income for rent payments."

**Scenario 6: Cultural & Community Analysis**

- User: "What's the community like in Parramatta?"
- Agent calls: `getSuburbDemographics('Parramatta', 'NSW')`
- Analyzes:
  - Cultural diversity: Top ancestries include Australian, English, Chinese, Indian
  - Languages: 52% speak language other than English at home (Mandarin, Arabic, Cantonese top)
  - Religious diversity: Catholic (24%), No religion (23%), Islam (11%), Anglican (9%)
  - Professional workforce: 28% professionals, strong white-collar employment
- Synthesizes: "Parramatta is a highly multicultural suburb with strong Asian and
  Middle Eastern communities. Over half speak a language other than English at home.
  This cultural diversity creates demand for diverse property types and amenities."

**Reference**: See [AI-AGENTS.md Section 1.4](./AI-AGENTS.md) for complete Researcher Agent tool schema.

---

## 2. Expense Data Sources for Analyst Agent

### 2.1 Implementation Location

All financial calculations and expense modeling are implemented in:

**File**: `/apps/web/lib/tools/financialTools.ts`

**Two Main Tools**:

1. **`calculateCashFlow`** - Annual/weekly rental income vs expenses
2. **`calculateROI`** - Long-term return on investment modeling

### 2.2 Cash Flow Calculation Breakdown

The `calculateCashFlow` tool models the complete financial picture for an investment property.

#### Income Components

```typescript
interface IncomeCalculation {
  // Primary income
  weeklyRent: number; // User input or rental estimate
  annualRent: number; // weeklyRent × 52

  // Adjustments
  vacancyAllowance: number; // 4% default (approx 2 weeks/year)
  vacancyLoss: number; // annualRent × vacancyAllowance
  effectiveRentalIncome: number; // annualRent - vacancyLoss
}
```

**Example**:

```typescript
const income = {
  weeklyRent: 600,
  annualRent: 600 * 52, // = 31,200
  vacancyAllowance: 0.04,
  vacancyLoss: 31200 * 0.04, // = 1,248
  effectiveRentalIncome: 29952, // = 31,200 - 1,248
};
```

#### Expense Components

```typescript
interface ExpenseCalculation {
  // Financing
  loanAmount: number; // purchasePrice - deposit
  interestRate: number; // Annual rate (e.g., 0.06 for 6%)
  annualInterest: number; // loanAmount × interestRate

  // Property management
  managementFee: number; // effectiveIncome × 0.08 (8% default)

  // Holding costs
  councilRates: number; // purchasePrice × 0.003 (0.3% default)
  insurance: number; // purchasePrice × 0.002 (0.2% default)
  maintenance: number; // purchasePrice × 0.01 (1% default)

  // Optional
  bodyCorp: number; // Strata fees (user input, default 0)
  waterRates: number; // Optional (user input, default 0)

  // Total
  totalAnnualExpenses: number; // Sum of all above
}
```

**Example**:

```typescript
const expenses = {
  // Property: $750,000, Deposit: $150,000 (20%)
  loanAmount: 600000,
  interestRate: 0.06,
  annualInterest: 36000, // 600k × 6%

  managementFee: 2396, // 29,952 × 8%
  councilRates: 2250, // 750k × 0.3%
  insurance: 1500, // 750k × 0.2%
  maintenance: 7500, // 750k × 1%
  bodyCorp: 0, // House (no strata)

  totalAnnualExpenses: 49646,
};
```

#### Net Cash Flow

```typescript
interface CashFlowResult {
  annualNetCashFlow: number; // effectiveIncome - totalExpenses
  weeklyNetCashFlow: number; // annualNet / 52
  cashFlowStatus: "positive" | "negative" | "neutral";
}
```

**Example (continuing above)**:

```typescript
const cashFlow = {
  annualNetCashFlow: -19694, // 29,952 - 49,646 = -19,694
  weeklyNetCashFlow: -379, // -19,694 / 52 = -$379/week
  cashFlowStatus: "negative", // Negative gearing scenario
};
```

### 2.3 ROI Calculation Components

The `calculateROI` tool projects long-term investment returns including capital appreciation, cash flow accumulation, and tax implications.

```typescript
interface ROICalculation {
  // Inputs
  purchasePrice: number;
  deposit: number;
  holdingPeriod: number; // Years
  capitalGrowthRate: number; // Annual % (e.g., 0.05 for 5%)
  annualNetCashFlow: number; // From calculateCashFlow

  // Capital appreciation
  futureValue: number; // purchasePrice × (1 + growthRate)^years
  capitalGain: number; // futureValue - purchasePrice

  // Cash flow accumulation
  accumulatedCashFlow: number; // annualNetCashFlow × years

  // Selling costs
  sellingCosts: number; // futureValue × 0.03 (3% agent fees + costs)

  // Tax implications
  capitalGainsTax: number; // (capitalGain × 0.5) × 0.37
  // 50% CGT discount, 37% tax rate

  // Net profit
  grossProfit: number; // capitalGain + accumulatedCashFlow - sellingCosts
  netProfit: number; // grossProfit - capitalGainsTax
  roi: number; // netProfit / deposit
  annualizedROI: number; // ((roi + 1) ^ (1/years)) - 1
}
```

**Example (10-year hold)**:

```typescript
const roi = {
  purchasePrice: 750000,
  deposit: 150000,
  holdingPeriod: 10,
  capitalGrowthRate: 0.05, // 5% p.a.

  futureValue: 1222084, // 750k × 1.05^10
  capitalGain: 472084, // 1,222,084 - 750,000

  accumulatedCashFlow: -196940, // -19,694 × 10 (negative gearing)

  sellingCosts: 36662, // 1,222,084 × 3%

  capitalGainsTax: 87336, // (472,084 × 50%) × 37%

  grossProfit: 238482, // 472,084 - 196,940 - 36,662
  netProfit: 151146, // 238,482 - 87,336
  roi: 1.01, // 101% return on deposit
  annualizedROI: 0.072, // 7.2% per year
};
```

### 2.4 Default Assumptions Table

| Parameter             | Default Value | Rationale                             | Adjustability                  |
| --------------------- | ------------- | ------------------------------------- | ------------------------------ |
| **Vacancy allowance** | 4% (2 weeks)  | Low-vacancy Australian market average | User-adjustable                |
| **Management fee**    | 8% of rent    | Industry standard (range: 5-10%)      | User-adjustable                |
| **Council rates**     | 0.3% of price | National average (varies by LGA)      | System estimate, user override |
| **Insurance**         | 0.2% of price | Typical landlord insurance policy     | System estimate, user override |
| **Maintenance**       | 1% of price   | Conservative annual estimate          | User-adjustable                |
| **Body corp fees**    | $0 (houses)   | User must input for apartments        | User input required            |
| **Interest rate**     | Variable      | User input (current market ~6%)       | User input required            |
| **Tax rate**          | 37%           | Typical investor marginal rate        | User-adjustable                |
| **CGT discount**      | 50%           | Held > 12 months (legislated)         | System constant                |
| **Selling costs**     | 3%            | Agent commission + legal              | System estimate                |
| **Capital growth**    | User input    | Varies by suburb/strategy             | User input required            |

### 2.5 Tool Schema Definitions

#### `calculateCashFlow` Zod Schema

```typescript
import { z } from "zod";

export const calculateCashFlowSchema = z.object({
  purchasePrice: z
    .number()
    .positive()
    .describe("Property purchase price (AUD)"),
  deposit: z.number().positive().describe("Deposit amount (AUD)"),
  weeklyRent: z.number().positive().describe("Weekly rental income (AUD)"),
  interestRate: z
    .number()
    .positive()
    .describe("Annual interest rate (decimal, e.g., 0.06 for 6%)"),

  // Optional with defaults
  vacancyAllowance: z
    .number()
    .min(0)
    .max(1)
    .default(0.04)
    .describe("Vacancy allowance (decimal, default 4%)"),
  managementFee: z
    .number()
    .min(0)
    .max(1)
    .default(0.08)
    .describe("Management fee (decimal, default 8%)"),
  councilRatesPercentage: z
    .number()
    .min(0)
    .max(1)
    .default(0.003)
    .describe("Council rates as % of price (default 0.3%)"),
  insurancePercentage: z
    .number()
    .min(0)
    .max(1)
    .default(0.002)
    .describe("Insurance as % of price (default 0.2%)"),
  maintenancePercentage: z
    .number()
    .min(0)
    .max(1)
    .default(0.01)
    .describe("Maintenance as % of price (default 1%)"),
  bodyCorpFees: z
    .number()
    .min(0)
    .default(0)
    .describe("Annual strata/body corp fees (default 0)"),
});
```

#### `calculateROI` Zod Schema

```typescript
export const calculateROISchema = z.object({
  purchasePrice: z
    .number()
    .positive()
    .describe("Property purchase price (AUD)"),
  deposit: z.number().positive().describe("Deposit amount (AUD)"),
  holdingPeriod: z
    .number()
    .int()
    .positive()
    .describe("Investment holding period (years)"),
  capitalGrowthRate: z
    .number()
    .describe(
      "Expected annual capital growth rate (decimal, e.g., 0.05 for 5%)",
    ),
  annualNetCashFlow: z
    .number()
    .describe("Annual net cash flow (from calculateCashFlow)"),

  // Optional with defaults
  taxRate: z
    .number()
    .min(0)
    .max(1)
    .default(0.37)
    .describe("Marginal tax rate (decimal, default 37%)"),
  cgtDiscount: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe("Capital gains tax discount (default 50%)"),
  sellingCostsPercentage: z
    .number()
    .min(0)
    .max(1)
    .default(0.03)
    .describe("Selling costs as % of sale price (default 3%)"),
});
```

### 2.6 Current Gaps and Future Enhancements

#### Not Yet Implemented

1. **Depreciation Modeling**
   - Missing: Building depreciation schedule (40 years for residential)
   - Missing: Fixtures & fittings depreciation (effective life method)
   - Impact: Underestimates tax benefits by $5-15k/year for new properties

2. **Negative Gearing Tax Benefits**
   - Missing: Annual tax refund calculation from negative cash flow
   - Formula: `taxRefund = abs(annualNetCashFlow) × marginalTaxRate`
   - Impact: Cash flow calculations don't show "after-tax" position

3. **SMSF-Specific Calculations**
   - Missing: Concessional tax rate (15% vs 37%)
   - Missing: Pension phase exemptions
   - Missing: Borrowing restrictions (LVR limits)

4. **Detailed Rates Breakdown**
   - Missing: Separate water rates from council rates
   - Missing: Land tax calculations (progressive based on portfolio value)
   - Missing: State-specific variations (e.g., VIC land tax thresholds)

5. **Stamp Duty & Purchase Costs**
   - Missing: State-specific stamp duty calculations
   - Missing: Legal fees, building inspection, loan establishment
   - Impact: Understates total capital required

#### Implementation Priority

**Phase 1** (Next 2-4 weeks):

- Add depreciation modeling (significant tax impact)
- Calculate after-tax cash flow (more accurate investor view)

**Phase 2** (4-8 weeks):

- SMSF tax calculations (strategic feature differentiator)
- Detailed rates breakdown (improved accuracy)

**Phase 3** (Future):

- Land tax modeling (complex, multi-property consideration)
- Stamp duty calculator (upfront cost modeling)

### 2.7 Usage by Analyst Agent

The Analyst Agent uses these financial tools in the following workflow:

```
User: "Is 123 Main St a good investment?"
        ↓
Orchestrator routes to Analyst Agent
        ↓
Analyst calls: searchProperties('123 Main St') [via Researcher]
        ↓
Analyst calls: calculateCashFlow({ price, rent, ... })
        ↓
Analyst calls: calculateROI({ price, deposit, growth, ... })
        ↓
Analyst synthesizes: "This property is negatively geared at -$379/week
                      but projects 7.2% annualized ROI over 10 years
                      due to strong capital growth potential."
```

**Reference**: See [AI-AGENTS.md Section 1.3](./AI-AGENTS.md) for complete Analyst Agent tool schema.

---

## 3. Tool Implementation Details (PRO-17, PRO-18, PRO-19)

This section provides complete implementation patterns for all agent tools across the three specialized agents: Strategist, Researcher, and Analyst.

### 3.1 Common Patterns Across All Tools

All tools follow the Vercel AI SDK pattern using the `tool()` function with Zod schemas for type safety.

**Standard tool structure**:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const myTool = tool({
  description: "Clear, concise description of what this tool does",
  parameters: z.object({
    param1: z.string().describe("What this parameter represents"),
    param2: z.number().optional().describe("Optional parameter"),
  }),
  execute: async ({ param1, param2 }) => {
    try {
      // Tool logic here
      const result = await someOperation(param1, param2);

      // Return structured data (not just strings)
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Tool error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

**Error handling pattern**:

- Always wrap `execute` in try-catch
- Log errors for debugging
- Return structured error objects
- Never throw exceptions (breaks agent flow)

**Return value pattern**:

- Return objects, not primitive strings
- Include `success` boolean for status checking
- Separate `data` and `error` fields
- Add `metadata` for additional context

### 3.2 PRO-17: Strategist Agent Tools

**Purpose**: The Strategist Agent helps users discover their investment strategy through conversational elicitation. It captures goals, financial capacity, risk tolerance, and timeline to recommend a personalized strategy.

**File Location**: `/apps/web/lib/agents/strategist.ts`

**Database Access**: Via Convex mutations to store user profile and strategy selections

#### Tool 1: `captureDiscoveryInput`

Records user's financial situation, goals, or preferences during the discovery conversation.

```typescript
import { tool } from "ai";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const captureDiscoveryInput = tool({
  description:
    "Record user's financial situation, investment goals, or preferences during strategy discovery",
  parameters: z.object({
    userId: z.string().describe("User ID from authentication"),
    field: z
      .enum([
        "budget",
        "deposit",
        "timeline",
        "riskTolerance",
        "investmentGoal",
        "preferredLocations",
        "propertyType",
        "currentPortfolio",
      ])
      .describe("The type of information being captured"),
    value: z
      .union([z.string(), z.number(), z.array(z.string())])
      .describe("The value to store"),
    context: z.string().optional().describe("Additional context or notes"),
  }),
  execute: async ({ userId, field, value, context }) => {
    try {
      await convex.mutation(api.strategies.updateUserProfile, {
        userId,
        field,
        value,
        context,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Captured ${field}: ${JSON.stringify(value)}`,
        nextStep: getNextQuestionHint(field),
      };
    } catch (error) {
      console.error("Failed to capture discovery input:", error);
      return {
        success: false,
        error: "Unable to save user input",
      };
    }
  },
});

// Helper to suggest next question
function getNextQuestionHint(lastField: string): string {
  const flowMap: Record<string, string> = {
    budget: "Ask about deposit amount",
    deposit: "Ask about investment timeline",
    timeline: "Ask about risk tolerance",
    riskTolerance: "Ask about primary investment goal",
    investmentGoal: "Consider recommending strategy",
  };
  return flowMap[lastField] || "Continue discovery";
}
```

#### Tool 2: `recommendStrategy`

Analyzes captured user profile and recommends the most suitable investment strategy.

```typescript
export const recommendStrategy = tool({
  description: "Recommend investment strategy based on user's captured profile",
  parameters: z.object({
    userId: z.string().describe("User ID"),
    forceRecalculate: z
      .boolean()
      .default(false)
      .describe("Force recalculation even if recommendation exists"),
  }),
  execute: async ({ userId, forceRecalculate }) => {
    try {
      // Fetch user profile
      const profile = await convex.query(api.strategies.getUserProfile, {
        userId,
      });

      if (!profile) {
        return {
          success: false,
          error: "User profile not found",
        };
      }

      // Strategy matching logic
      const recommendation = calculateStrategyRecommendation(profile);

      // Save recommendation
      await convex.mutation(api.strategies.saveRecommendation, {
        userId,
        strategyType: recommendation.strategyType,
        confidence: recommendation.confidence,
        reasons: recommendation.reasons,
        alternativeStrategies: recommendation.alternatives,
      });

      return {
        success: true,
        recommendation: {
          primaryStrategy: recommendation.strategyType,
          confidence: recommendation.confidence,
          rationale: recommendation.reasons,
          alternatives: recommendation.alternatives,
        },
      };
    } catch (error) {
      console.error("Failed to recommend strategy:", error);
      return {
        success: false,
        error: "Unable to generate recommendation",
      };
    }
  },
});

// Strategy recommendation algorithm
function calculateStrategyRecommendation(profile: any) {
  const scores: Record<string, number> = {
    CASH_FLOW: 0,
    CAPITAL_GROWTH: 0,
    RENOVATION: 0,
    DEVELOPMENT: 0,
    SMSF: 0,
    COMMERCIAL: 0,
  };

  // Scoring logic based on profile
  if (profile.investmentGoal === "passive_income") scores.CASH_FLOW += 40;
  if (profile.investmentGoal === "wealth_building") scores.CAPITAL_GROWTH += 40;
  if (profile.riskTolerance === "high") {
    scores.RENOVATION += 20;
    scores.DEVELOPMENT += 20;
  }
  if (profile.timeline === "short" && profile.budget > 500000)
    scores.RENOVATION += 30;
  if (profile.timeline === "long") scores.CAPITAL_GROWTH += 20;
  if (profile.currentPortfolio?.includes("smsf")) scores.SMSF += 50;

  // Find top strategy
  const topStrategy = Object.entries(scores).reduce((a, b) =>
    scores[a[0]] > scores[b[0]] ? a : b,
  );

  // Generate alternatives (top 2)
  const alternatives = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(1, 3)
    .map(([strategy]) => strategy);

  return {
    strategyType: topStrategy[0],
    confidence: Math.min(topStrategy[1] / 100, 1),
    reasons: generateReasons(topStrategy[0], profile),
    alternatives,
  };
}

function generateReasons(strategy: string, profile: any): string[] {
  // Return human-readable reasons based on profile match
  const reasonMap: Record<string, (p: any) => string[]> = {
    CASH_FLOW: (p) => [
      `Your goal of ${p.investmentGoal} aligns with cash flow focused investments`,
      `Timeline of ${p.timeline} suits immediate income generation`,
      `Risk tolerance of ${p.riskTolerance} matches stable rental markets`,
    ],
    CAPITAL_GROWTH: (p) => [
      `Your ${p.timeline} timeline benefits from capital appreciation`,
      `Budget of $${p.budget} enables quality growth markets`,
      `Goal of ${p.investmentGoal} aligns with wealth accumulation`,
    ],
    // ... other strategies
  };

  return reasonMap[strategy]?.(profile) || [];
}
```

#### Tool 3: `clarifyGoal`

Asks follow-up questions when user input is ambiguous or incomplete.

```typescript
export const clarifyGoal = tool({
  description:
    "Ask follow-up question to clarify ambiguous or incomplete user input",
  parameters: z.object({
    field: z.string().describe("The field needing clarification"),
    currentValue: z.string().optional().describe("Current ambiguous value"),
    clarificationNeeded: z
      .enum(["too_vague", "out_of_range", "conflicting_info", "missing_detail"])
      .describe("Type of clarification needed"),
  }),
  execute: async ({ field, currentValue, clarificationNeeded }) => {
    const questions: Record<string, Record<string, string>> = {
      budget: {
        too_vague: "What's your maximum purchase price budget?",
        out_of_range: "That budget seems unusual. Can you confirm the amount?",
        missing_detail: "Is that your total budget or just the deposit?",
      },
      timeline: {
        too_vague:
          "When would you like to buy? Next 6 months, 1 year, or 2+ years?",
        conflicting_info:
          "Earlier you mentioned short-term, but this sounds long-term. Which is it?",
      },
      riskTolerance: {
        too_vague:
          "Are you comfortable with high-risk/high-reward, or prefer stable/safe investments?",
        conflicting_info:
          "Your budget suggests conservative, but you mentioned aggressive growth. Can you clarify?",
      },
    };

    const question =
      questions[field]?.[clarificationNeeded] ||
      `Can you provide more details about ${field}?`;

    return {
      success: true,
      question,
      field,
      suggestedOptions: getSuggestedOptions(field),
    };
  },
});

function getSuggestedOptions(field: string): string[] {
  const optionsMap: Record<string, string[]> = {
    riskTolerance: [
      "Low - Stable income",
      "Medium - Balanced",
      "High - Maximum growth",
    ],
    timeline: ["Short (< 1 year)", "Medium (1-3 years)", "Long (3+ years)"],
    investmentGoal: [
      "Passive income",
      "Wealth building",
      "Retirement planning",
      "Portfolio diversification",
    ],
  };
  return optionsMap[field] || [];
}
```

#### Tool 4: `summarizeProfile`

Generates a concise summary of the user's captured profile for review and confirmation.

```typescript
export const summarizeProfile = tool({
  description: "Generate summary of user's investment profile for confirmation",
  parameters: z.object({
    userId: z.string().describe("User ID"),
  }),
  execute: async ({ userId }) => {
    try {
      const profile = await convex.query(api.strategies.getUserProfile, {
        userId,
      });

      if (!profile) {
        return {
          success: false,
          error: "No profile found for user",
        };
      }

      const summary = {
        financial: {
          budget: profile.budget,
          deposit: profile.deposit,
          depositPercentage: (profile.deposit / profile.budget) * 100,
        },
        preferences: {
          timeline: profile.timeline,
          riskTolerance: profile.riskTolerance,
          goal: profile.investmentGoal,
        },
        constraints: {
          locations: profile.preferredLocations || [],
          propertyTypes: profile.propertyType || [],
        },
        completeness: calculateProfileCompleteness(profile),
      };

      return {
        success: true,
        summary,
        readyForRecommendation: summary.completeness > 0.7,
      };
    } catch (error) {
      console.error("Failed to summarize profile:", error);
      return {
        success: false,
        error: "Unable to generate summary",
      };
    }
  },
});

function calculateProfileCompleteness(profile: any): number {
  const requiredFields = [
    "budget",
    "deposit",
    "timeline",
    "riskTolerance",
    "investmentGoal",
  ];
  const completedFields = requiredFields.filter((f) => profile[f] != null);
  return completedFields.length / requiredFields.length;
}
```

### 3.3 PRO-18: Researcher Agent Tools

**Purpose**: The Researcher Agent searches for properties, retrieves suburb statistics, and gathers market data to inform investment decisions.

**File Location**: `/apps/web/lib/agents/researcher.ts`

**Core Tools**: Implemented in `/apps/web/lib/tools/propertySearchTools.ts`

**MCP Integration**: Direct HTTP calls via `/apps/web/lib/mcp/client.ts`

#### MCP Client Pattern

All Researcher tools use this MCP client helper:

```typescript
// /apps/web/lib/mcp/client.ts
import { McpResponse } from "@/types/mcp";

export async function callMcpTool<T = any>(
  serverId: "domain" | "realestate" | "market-data",
  toolName: string,
  params: Record<string, any>,
  retries: number = 3,
): Promise<McpResponse<T>> {
  const endpoint = `/api/mcp/${serverId}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: toolName, params }),
      });

      if (!response.ok) {
        throw new Error(`MCP call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`MCP call attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        return {
          success: false,
          error: `Failed after ${retries} attempts: ${error.message}`,
        };
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }
}
```

#### Tool 1: `searchDomainProperties`

Search for properties on Domain.com.au.

```typescript
// /apps/web/lib/tools/propertySearchTools.ts
import { tool } from "ai";
import { z } from "zod";
import { callMcpTool } from "@/lib/mcp/client";

export const searchDomainProperties = tool({
  description:
    "Search for properties on Domain.com.au with filters for location, price, type, etc.",
  parameters: z.object({
    locations: z
      .array(
        z.object({
          suburb: z.string(),
          state: z.string(),
          postcode: z.string().optional(),
        }),
      )
      .describe("Suburbs to search"),
    listingType: z.enum(["Sale", "Rent", "Sold"]).default("Sale"),
    propertyTypes: z
      .array(z.enum(["House", "Apartment", "Townhouse", "Villa", "Land"]))
      .optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBedrooms: z.number().optional(),
    maxBedrooms: z.number().optional(),
    minBathrooms: z.number().optional(),
    minCarSpaces: z.number().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20).max(100),
  }),
  execute: async (params) => {
    try {
      const response = await callMcpTool("domain", "search_properties", params);

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        properties: response.data.listings || [],
        totalResults: response.data.totalResults,
        page: params.page,
        hasMore: response.data.listings.length === params.pageSize,
      };
    } catch (error) {
      console.error("Domain search failed:", error);
      return {
        success: false,
        error: "Property search unavailable",
      };
    }
  },
});
```

#### Tool 2: `searchRealestateProperties`

Search for properties on RealEstate.com.au (alternative/complement to Domain).

```typescript
export const searchRealestateProperties = tool({
  description: "Search for properties on RealEstate.com.au",
  parameters: z.object({
    suburb: z.string(),
    state: z.string(),
    listingType: z.enum(["buy", "rent", "sold"]).default("buy"),
    propertyType: z.array(z.string()).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBedrooms: z.number().optional(),
    maxBedrooms: z.number().optional(),
    page: z.number().default(1),
  }),
  execute: async (params) => {
    try {
      const response = await callMcpTool(
        "realestate",
        "search_properties",
        params,
      );

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        properties: response.data.results || [],
        totalCount: response.data.totalCount,
        page: params.page,
      };
    } catch (error) {
      console.error("RealEstate search failed:", error);
      return {
        success: false,
        error: "Property search unavailable",
      };
    }
  },
});
```

#### Tool 3: `getSuburbStats`

Retrieve comprehensive statistics for a suburb (demographics, market metrics, etc.).

```typescript
export const getSuburbStats = tool({
  description:
    "Get comprehensive suburb statistics including demographics, market metrics, and trends",
  parameters: z.object({
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code (NSW, VIC, QLD, etc.)"),
    postcode: z.string().optional(),
    includeMarketTrends: z.boolean().default(true),
    includeDemographics: z.boolean().default(true),
  }),
  execute: async ({
    suburb,
    state,
    postcode,
    includeMarketTrends,
    includeDemographics,
  }) => {
    try {
      // Parallel fetch: market data + demographics
      const promises: Promise<any>[] = [];

      if (includeMarketTrends) {
        promises.push(
          callMcpTool("market-data", "getSuburbMarketData", {
            suburb,
            state,
            postcode,
          }),
        );
      }

      if (includeDemographics) {
        promises.push(
          callMcpTool("market-data", "getAbsDemographics", {
            suburb,
            state,
            postcode,
          }),
        );
      }

      const results = await Promise.allSettled(promises);

      const marketData =
        results[0]?.status === "fulfilled" ? results[0].value.data : null;
      const demographics =
        results[1]?.status === "fulfilled" ? results[1].value.data : null;

      return {
        success: true,
        suburb,
        state,
        marketData: marketData || { error: "Market data unavailable" },
        demographics: demographics || { error: "Demographics unavailable" },
      };
    } catch (error) {
      console.error("Suburb stats retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve suburb statistics",
      };
    }
  },
});
```

#### Tool 4: `getPropertyDetails`

Retrieve detailed information about a specific property by ID or address.

```typescript
export const getPropertyDetails = tool({
  description: "Get detailed information about a specific property",
  parameters: z.object({
    source: z.enum(["domain", "realestate"]).describe("Property data source"),
    propertyId: z.string().optional().describe("Property ID from source"),
    address: z.string().optional().describe("Property address (if ID unknown)"),
    suburb: z.string().optional(),
    state: z.string().optional(),
  }),
  execute: async ({ source, propertyId, address, suburb, state }) => {
    try {
      if (!propertyId && !address) {
        return {
          success: false,
          error: "Must provide either propertyId or address",
        };
      }

      const params = propertyId ? { propertyId } : { address, suburb, state };

      const response = await callMcpTool(
        source,
        "get_property_details",
        params,
      );

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        property: response.data,
      };
    } catch (error) {
      console.error("Property details retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve property details",
      };
    }
  },
});
```

#### Tool 5: `getSalesHistory`

Retrieve historical sales data for a specific address.

```typescript
export const getSalesHistory = tool({
  description: "Get historical sales records for a specific property address",
  parameters: z.object({
    address: z.string().describe("Property street address"),
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code"),
    yearsBack: z
      .number()
      .default(10)
      .describe("How many years of history to retrieve"),
  }),
  execute: async ({ address, suburb, state, yearsBack }) => {
    try {
      const response = await callMcpTool("domain", "get_sales_history", {
        address,
        suburb,
        state,
        dateFrom: new Date(
          Date.now() - yearsBack * 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        salesHistory: response.data.sales || [],
        propertyAddress: `${address}, ${suburb} ${state}`,
      };
    } catch (error) {
      console.error("Sales history retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve sales history",
      };
    }
  },
});
```

#### Tool 6: `getComparables`

Find comparable properties (similar sales) near a given address.

```typescript
export const getComparables = tool({
  description:
    "Find comparable properties (recent sales) near a specific address",
  parameters: z.object({
    address: z.string().describe("Reference property address"),
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code"),
    radiusKm: z.number().default(1).describe("Search radius in kilometers"),
    limit: z
      .number()
      .default(10)
      .max(50)
      .describe("Maximum comparables to return"),
    monthsBack: z
      .number()
      .default(12)
      .describe("How recent (months) the sales should be"),
  }),
  execute: async ({ address, suburb, state, radiusKm, limit, monthsBack }) => {
    try {
      const response = await callMcpTool("realestate", "get_comparables", {
        address,
        suburb,
        state,
        radiusKm,
        limit,
        soldDateFrom: new Date(
          Date.now() - monthsBack * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        comparables: response.data.comparables || [],
        medianPrice: response.data.medianPrice,
        count: response.data.comparables?.length || 0,
      };
    } catch (error) {
      console.error("Comparables retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve comparable properties",
      };
    }
  },
});
```

### 3.4 PRO-19: Analyst Agent Tools

**Purpose**: The Analyst Agent performs financial calculations, risk assessments, and ROI projections to help users make data-driven investment decisions.

**File Location**: `/apps/web/lib/agents/analyst.ts`

**Core Tools**: Implemented in `/apps/web/lib/tools/financialTools.ts`

**Computation Type**: Pure calculations (no external API calls or database writes)

#### Tool 1: `calculateCashFlow`

Calculate annual and weekly cash flow for an investment property (documented fully in Section 2.2).

```typescript
// /apps/web/lib/tools/financialTools.ts
import { tool } from "ai";
import { z } from "zod";

export const calculateCashFlow = tool({
  description:
    "Calculate annual and weekly cash flow for an investment property",
  parameters: z.object({
    purchasePrice: z.number().positive(),
    deposit: z.number().positive(),
    weeklyRent: z.number().positive(),
    interestRate: z
      .number()
      .positive()
      .describe("Annual rate as decimal (e.g., 0.06)"),
    vacancyAllowance: z.number().min(0).max(1).default(0.04),
    managementFee: z.number().min(0).max(1).default(0.08),
    councilRatesPercentage: z.number().min(0).max(1).default(0.003),
    insurancePercentage: z.number().min(0).max(1).default(0.002),
    maintenancePercentage: z.number().min(0).max(1).default(0.01),
    bodyCorpFees: z.number().min(0).default(0),
  }),
  execute: async (params) => {
    try {
      const {
        purchasePrice,
        deposit,
        weeklyRent,
        interestRate,
        vacancyAllowance,
        managementFee,
        councilRatesPercentage,
        insurancePercentage,
        maintenancePercentage,
        bodyCorpFees,
      } = params;

      // Income
      const annualRent = weeklyRent * 52;
      const vacancyLoss = annualRent * vacancyAllowance;
      const effectiveRentalIncome = annualRent - vacancyLoss;

      // Expenses
      const loanAmount = purchasePrice - deposit;
      const annualInterest = loanAmount * interestRate;
      const managementCost = effectiveRentalIncome * managementFee;
      const councilRates = purchasePrice * councilRatesPercentage;
      const insurance = purchasePrice * insurancePercentage;
      const maintenance = purchasePrice * maintenancePercentage;

      const totalAnnualExpenses =
        annualInterest +
        managementCost +
        councilRates +
        insurance +
        maintenance +
        bodyCorpFees;

      // Net cash flow
      const annualNetCashFlow = effectiveRentalIncome - totalAnnualExpenses;
      const weeklyNetCashFlow = annualNetCashFlow / 52;

      return {
        success: true,
        income: {
          weeklyRent,
          annualRent,
          vacancyLoss,
          effectiveRentalIncome,
        },
        expenses: {
          annualInterest,
          managementCost,
          councilRates,
          insurance,
          maintenance,
          bodyCorpFees,
          totalAnnualExpenses,
        },
        cashFlow: {
          annualNetCashFlow,
          weeklyNetCashFlow,
          status:
            annualNetCashFlow > 0
              ? "positive"
              : annualNetCashFlow < 0
                ? "negative"
                : "neutral",
          isNegativeGeared: annualNetCashFlow < 0,
        },
      };
    } catch (error) {
      console.error("Cash flow calculation failed:", error);
      return {
        success: false,
        error: "Unable to calculate cash flow",
      };
    }
  },
});
```

#### Tool 2: `calculateROI`

Project long-term return on investment including capital gains and tax (documented fully in Section 2.3).

```typescript
export const calculateROI = tool({
  description: "Calculate projected return on investment over a holding period",
  parameters: z.object({
    purchasePrice: z.number().positive(),
    deposit: z.number().positive(),
    holdingPeriod: z.number().int().positive().describe("Years"),
    capitalGrowthRate: z
      .number()
      .describe("Annual growth rate as decimal (e.g., 0.05)"),
    annualNetCashFlow: z.number().describe("From calculateCashFlow"),
    taxRate: z.number().min(0).max(1).default(0.37),
    cgtDiscount: z.number().min(0).max(1).default(0.5),
    sellingCostsPercentage: z.number().min(0).max(1).default(0.03),
  }),
  execute: async (params) => {
    try {
      const {
        purchasePrice,
        deposit,
        holdingPeriod,
        capitalGrowthRate,
        annualNetCashFlow,
        taxRate,
        cgtDiscount,
        sellingCostsPercentage,
      } = params;

      // Future value
      const futureValue =
        purchasePrice * Math.pow(1 + capitalGrowthRate, holdingPeriod);
      const capitalGain = futureValue - purchasePrice;

      // Cash flow accumulation
      const accumulatedCashFlow = annualNetCashFlow * holdingPeriod;

      // Selling costs
      const sellingCosts = futureValue * sellingCostsPercentage;

      // Capital gains tax
      const taxableGain = capitalGain * cgtDiscount;
      const capitalGainsTax = taxableGain * taxRate;

      // Net profit
      const grossProfit = capitalGain + accumulatedCashFlow - sellingCosts;
      const netProfit = grossProfit - capitalGainsTax;

      // ROI metrics
      const roi = netProfit / deposit;
      const annualizedROI = Math.pow(1 + roi, 1 / holdingPeriod) - 1;

      return {
        success: true,
        projection: {
          futureValue,
          capitalGain,
          accumulatedCashFlow,
          sellingCosts,
          capitalGainsTax,
          grossProfit,
          netProfit,
        },
        returns: {
          totalROI: roi,
          totalROIPercentage: roi * 100,
          annualizedROI,
          annualizedROIPercentage: annualizedROI * 100,
        },
        assumptions: {
          holdingPeriod,
          capitalGrowthRate,
          taxRate,
          cgtDiscount,
          sellingCostsPercentage,
        },
      };
    } catch (error) {
      console.error("ROI calculation failed:", error);
      return {
        success: false,
        error: "Unable to calculate ROI",
      };
    }
  },
});
```

#### Tool 3: `assessRisk` (Planned)

Evaluate investment risk based on market conditions, property characteristics, and financial metrics.

```typescript
export const assessRisk = tool({
  description:
    "Assess investment risk for a property based on market and financial factors",
  parameters: z.object({
    suburb: z.string(),
    state: z.string(),
    propertyType: z.string(),
    purchasePrice: z.number(),
    loanToValueRatio: z.number().describe("LVR as decimal (e.g., 0.8 for 80%)"),
    cashFlowStatus: z.enum(["positive", "negative", "neutral"]),
    holdingPeriod: z.number().describe("Intended holding period in years"),
  }),
  execute: async (params) => {
    try {
      // Risk factors scoring (0-100, lower = lower risk)
      const risks = {
        marketRisk: 0,
        financialRisk: 0,
        liquidityRisk: 0,
        concentrationRisk: 0,
      };

      // Market risk: based on suburb volatility, supply
      // TODO: Fetch suburb market indicators
      risks.marketRisk = 50; // Placeholder

      // Financial risk: based on LVR, cash flow, interest rate sensitivity
      if (params.loanToValueRatio > 0.9) risks.financialRisk += 40;
      else if (params.loanToValueRatio > 0.8) risks.financialRisk += 25;
      else risks.financialRisk += 10;

      if (params.cashFlowStatus === "negative") risks.financialRisk += 20;
      else if (params.cashFlowStatus === "neutral") risks.financialRisk += 10;

      // Liquidity risk: property type, price point
      if (
        params.propertyType === "Land" ||
        params.propertyType === "Commercial"
      ) {
        risks.liquidityRisk += 30;
      }
      if (params.purchasePrice > 2000000) risks.liquidityRisk += 20;

      // Overall risk score (weighted average)
      const overallRisk =
        risks.marketRisk * 0.4 +
        risks.financialRisk * 0.3 +
        risks.liquidityRisk * 0.2 +
        risks.concentrationRisk * 0.1;

      const riskLevel =
        overallRisk < 30 ? "Low" : overallRisk < 60 ? "Medium" : "High";

      return {
        success: true,
        overallRisk,
        riskLevel,
        breakdown: risks,
        recommendations: generateRiskRecommendations(risks, riskLevel),
      };
    } catch (error) {
      console.error("Risk assessment failed:", error);
      return {
        success: false,
        error: "Unable to assess risk",
      };
    }
  },
});

function generateRiskRecommendations(risks: any, level: string): string[] {
  const recommendations: string[] = [];

  if (level === "High") {
    recommendations.push("Consider increasing deposit to reduce LVR");
    recommendations.push(
      "Ensure adequate cash reserves for 6+ months expenses",
    );
  }

  if (risks.financialRisk > 50) {
    recommendations.push("Fix interest rate to protect against rate rises");
    recommendations.push("Build offset account for flexibility");
  }

  if (risks.liquidityRisk > 50) {
    recommendations.push("Plan for longer sales timeframe if needed");
    recommendations.push(
      "Consider more liquid property types (houses/apartments in metro areas)",
    );
  }

  return recommendations;
}
```

#### Tool 4: `projectGrowth` (Planned)

Project capital growth based on suburb indicators and market trends.

```typescript
export const projectGrowth = tool({
  description: "Project capital growth for a suburb based on market indicators",
  parameters: z.object({
    suburb: z.string(),
    state: z.string(),
    currentMedianPrice: z.number(),
    projectionYears: z.number().int().positive().default(10),
  }),
  execute: async ({ suburb, state, currentMedianPrice, projectionYears }) => {
    try {
      // Fetch historical growth rates
      // TODO: Integrate with market data MCP
      const historicalGrowth = {
        threeYear: 0.05, // Placeholder: 5% p.a.
        fiveYear: 0.06, // 6% p.a.
        tenYear: 0.055, // 5.5% p.a.
      };

      // Forecast growth rate (weighted average + adjustments)
      const baseGrowth =
        historicalGrowth.threeYear * 0.5 +
        historicalGrowth.fiveYear * 0.3 +
        historicalGrowth.tenYear * 0.2;

      // TODO: Adjust for infrastructure, zoning, supply factors
      const adjustedGrowth = baseGrowth;

      // Project future values
      const projections: Array<{
        year: number;
        medianPrice: number;
        growth: number;
      }> = [];
      let currentValue = currentMedianPrice;

      for (let year = 1; year <= projectionYears; year++) {
        currentValue *= 1 + adjustedGrowth;
        projections.push({
          year,
          medianPrice: Math.round(currentValue),
          growth: adjustedGrowth,
        });
      }

      return {
        success: true,
        suburb,
        currentMedianPrice,
        projectedMedianPrice: projections[projections.length - 1].medianPrice,
        totalGrowth:
          (projections[projections.length - 1].medianPrice -
            currentMedianPrice) /
          currentMedianPrice,
        annualizedGrowth: adjustedGrowth,
        yearByYear: projections,
        confidence: "medium", // TODO: Calculate based on data quality
        assumptions: {
          basedOn: "Historical growth rates",
          adjustments: "None applied (base model)",
        },
      };
    } catch (error) {
      console.error("Growth projection failed:", error);
      return {
        success: false,
        error: "Unable to project growth",
      };
    }
  },
});
```

### 3.5 Tool Registration with Agents

Each agent imports and registers its tools:

```typescript
// /apps/web/lib/agents/researcher.ts
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import {
  searchDomainProperties,
  searchRealestateProperties,
  getSuburbStats,
  getPropertyDetails,
  getSalesHistory,
  getComparables,
} from "@/lib/tools/propertySearchTools";

export async function runResearcherAgent(messages: any[]) {
  const result = await streamText({
    model: google("gemini-2.0-flash-exp"),
    messages,
    tools: {
      searchDomainProperties,
      searchRealestateProperties,
      getSuburbStats,
      getPropertyDetails,
      getSalesHistory,
      getComparables,
    },
    maxSteps: 5, // Allow multi-step tool usage
  });

  return result.toDataStreamResponse();
}
```

**Similar pattern for** `strategist.ts` and `analyst.ts`.

### 3.6 Testing Tools

Each tool should have unit tests:

```typescript
// /apps/web/lib/tools/__tests__/financialTools.test.ts
import { describe, it, expect } from "vitest";
import { calculateCashFlow, calculateROI } from "../financialTools";

describe("calculateCashFlow", () => {
  it("calculates negative gearing scenario correctly", async () => {
    const result = await calculateCashFlow.execute({
      purchasePrice: 750000,
      deposit: 150000,
      weeklyRent: 600,
      interestRate: 0.06,
      vacancyAllowance: 0.04,
      managementFee: 0.08,
      councilRatesPercentage: 0.003,
      insurancePercentage: 0.002,
      maintenancePercentage: 0.01,
      bodyCorpFees: 0,
    });

    expect(result.success).toBe(true);
    expect(result.cashFlow.status).toBe("negative");
    expect(result.cashFlow.annualNetCashFlow).toBeCloseTo(-19694, 0);
    expect(result.cashFlow.weeklyNetCashFlow).toBeCloseTo(-379, 0);
  });

  it("calculates positive cash flow scenario correctly", async () => {
    const result = await calculateCashFlow.execute({
      purchasePrice: 400000,
      deposit: 80000,
      weeklyRent: 550,
      interestRate: 0.06,
      // ... other params
    });

    expect(result.success).toBe(true);
    expect(result.cashFlow.status).toBe("positive");
  });
});
```

**Reference Files**:

- `/apps/web/lib/tools/propertySearchTools.ts`
- `/apps/web/lib/tools/financialTools.ts`
- `/apps/web/lib/tools/salesTools.ts`
- `/apps/web/lib/mcp/client.ts`
- `/docs/LINEAR-ISSUE-UPDATES.md` (PRO-17, PRO-18, PRO-19 sections)

---

## 4. Minimal Suburb List for MVP

### 4.1 Selection Criteria

To launch the MVP with high-quality, actionable data, we're targeting approximately **50 suburbs** that meet these criteria:

1. **Geographic Diversity**: Cover all major metropolitan areas and key regional investment hubs
2. **Strategy Diversity**: Include suburbs suitable for cash flow, capital growth, and mixed strategies
3. **Data Completeness**: Must have active Domain + REA listings and recent sales data
4. **Price Range Diversity**: From entry-level (<$400k) to premium (>$1M) to serve various budgets
5. **Market Maturity**: Mix of established markets and emerging growth areas

###4.2 Proposed MVP Suburb List (50 Total)

#### Sydney Metro (15 suburbs)

**Cash Flow Focus** (5 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Blacktown | NSW | 2148 | $650k-750k | High yield, strong rental demand, transport hub |
| Mount Druitt | NSW | 2770 | $500k-600k | Entry-level, high rental demand, affordability |
| Campbelltown | NSW | 2560 | $550k-650k | SW growth corridor, rental undersupply |
| Liverpool | NSW | 2170 | $700k-800k | Airport proximity, diverse rental market |
| Penrith | NSW | 2750 | $700k-850k | Western Sydney hub, strong employment |

**Capital Growth Focus** (5 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Parramatta | NSW | 2150 | $900k-1.2M | CBD expansion, infrastructure investment |
| Ryde | NSW | 2112 | $1.1M-1.5M | Metro rail, established area, growth potential |
| Hornsby | NSW | 2077 | $1M-1.3M | North Shore, excellent amenities, stable growth |
| Chatswood | NSW | 2067 | $1.2M-1.8M | Metro hub, prestige area, consistent growth |
| Bondi | NSW | 2026 | $1.5M-2.5M | Iconic location, tourism, international demand |

**Mixed Strategy** (5 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Bankstown | NSW | 2200 | $750k-900k | Airport precinct, gentrification, yield + growth |
| Hurstville | NSW | 2220 | $800k-1M | Transport hub, Asian community, stable |
| Strathfield | NSW | 2135 | $1.2M-1.6M | Education, rail, mid-tier growth |
| Castle Hill | NSW | 2154 | $1.1M-1.4M | Hills District, metro expansion, family market |
| Manly | NSW | 2095 | $1.8M-2.5M | Beachside, premium rentals, tourism |

#### Melbourne Metro (12 suburbs)

**Cash Flow Focus** (5 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Werribee | VIC | 3030 | $500k-600k | Western growth, affordability, rail access |
| Melton | VIC | 3337 | $450k-550k | Entry-level, high rental demand, expanding |
| Cranbourne | VIC | 3977 | $550k-650k | SE growth corridor, young families, yield |
| Dandenong | VIC | 3175 | $550k-650k | Industrial employment, diverse rental market |
| Frankston | VIC | 3199 | $600k-750k | Bayside, transport hub, moderate yield |

**Capital Growth Focus** (4 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Glen Waverley | VIC | 3150 | $1M-1.3M | Education hub, Asian community, steady growth |
| Box Hill | VIC | 3128 | $900k-1.2M | Skyline development, train hub, upward trajectory |
| Ringwood | VIC | 3134 | $800k-1M | Maroondah Highway, town center, development |
| Brunswick | VIC | 3056 | $1M-1.4M | Inner-city gentrification, lifestyle, growth |

**Mixed Strategy** (3 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Preston | VIC | 3072 | $800k-1M | Gentrification wave, tram access, yield + growth |
| Clayton | VIC | 3168 | $750k-950k | Monash University, student + professional rentals |
| Footscray | VIC | 3011 | $700k-900k | Inner-west gentrification, arts scene, upside |

#### Brisbane Metro (10 suburbs)

**Cash Flow Focus** (4 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Logan | QLD | 4114 | $400k-500k | Entry-level, rental demand, affordability |
| Ipswich | QLD | 4305 | $400k-500k | Western corridor, industrial employment, yield |
| Caboolture | QLD | 4510 | $450k-550k | North Brisbane, rail access, growing |
| Redbank Plains | QLD | 4301 | $420k-520k | Western suburbs, new developments, yield |

**Capital Growth Focus** (4 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Toowong | QLD | 4066 | $750k-1M | Inner-west, river proximity, UQ, growth |
| Indooroopilly | QLD | 4068 | $800k-1.1M | Established, shopping hub, prestige schools |
| Chermside | QLD | 4032 | $650k-850k | North Brisbane hub, Westfield, infrastructure |
| Carindale | QLD | 4152 | $700k-900k | Eastside, Westfield, family-oriented, stable |

**Mixed Strategy** (2 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Sunnybank | QLD | 4109 | $650k-800k | Asian community, Griffith Uni, yield + growth |
| Redcliffe | QLD | 4020 | $550k-700k | Bayside, peninsula, tourism + rental, balanced |

#### Other Capitals (8 suburbs)

**Perth** (2 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Joondalup | WA | 6027 | $500k-650k | Northern hub, ECU, health precinct, yield |
| Mandurah | WA | 6210 | $450k-600k | Coastal, retirement + tourism, cash flow |

**Adelaide** (2 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Salisbury | SA | 5108 | $350k-450k | Entry-level, northern suburbs, rental demand |
| Gawler | SA | 5118 | $400k-500k | Regional fringe, affordability, train access |

**Gold Coast** (2 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Southport | QLD | 4215 | $550k-750k | CBD proximity, hospital precinct, mixed |
| Robina | QLD | 4226 | $600k-800k | Town center, Griffith Uni, family-oriented |

**Canberra** (2 suburbs):
| Suburb | State | Postcode | Typical Price | Strategy Rationale |
|--------|-------|----------|---------------|---------------------|
| Belconnen | ACT | 2617 | $600k-800k | Town center, Uni of Canberra, stable yield |
| Tuggeranong | ACT | 2900 | $550k-700k | Southern Canberra, affordability, government jobs |

#### Regional Investment Hubs (5 suburbs)

| Suburb         | State | Postcode | Typical Price | Strategy Rationale                             |
| -------------- | ----- | -------- | ------------- | ---------------------------------------------- |
| Newcastle      | NSW   | 2300     | $700k-900k    | Regional capital, university, port, growth     |
| Wollongong     | NSW   | 2500     | $650k-850k    | Coastal, university, steel/health, stable      |
| Geelong        | VIC   | 3220     | $600k-800k    | Victoria's 2nd city, growth corridor, industry |
| Sunshine Coast | QLD   | 4556     | $700k-1M      | Coastal lifestyle, tourism, sea change demand  |
| Hobart         | TAS   | 7000     | $550k-750k    | Capital city, tourism, scarcity value, growth  |

### 4.3 Data Requirements Per Suburb

For each of the 50 MVP suburbs, ensure the following data is available:

**Property Listings**:

- Minimum 20 active sale listings (Domain + REA)
- Minimum 10 active rental listings (Domain + REA)
- Updated within last 7 days

**Sales Data**:

- Minimum 50 sales in last 12 months
- Historical sales for trend analysis (3+ years preferred)

**Market Metrics**:

- Median sale price (calculated from recent sales)
- Median weekly rent (calculated from rentals)
- Gross yield (rent / price)
- Days on market average
- Stock on market count

**Demographics** (ABS):

- Population
- Median age
- Median income
- Employment data

### 4.4 Seeding Strategy

#### Phase 1: Initial Data Load (Week 1)

**Priority Order**: Sydney → Melbourne → Brisbane → Others

1. **Domain Sync Jobs** (Inngest):
   - Run `sync-domain-listings` for each suburb
   - Process: Sale listings, rental listings, sold properties

2. **REA Sync Jobs** (Inngest):
   - Run `sync-realestate-listings` for each suburb
   - Cross-reference with Domain data

3. **ABS Data Load**:
   - Fetch demographics for all 50 suburbs via MCP
   - Cache in database for 30 days

**Inngest command**:

```bash
# Trigger sync for all MVP suburbs
pnpm inngest:run sync-mvp-suburbs --suburbs=./config/mvp-suburbs.json
```

#### Phase 2: Validation (Week 1-2)

1. **Data Completeness Check**:
   - Verify each suburb has minimum listing count
   - Flag suburbs with insufficient data

2. **Metrics Calculation**:
   - Run `calculate-suburb-metrics` for all 50 suburbs
   - Verify median price, rent, yield calculations

3. **Quality Assurance**:
   - Spot-check 10 random suburbs against public data sources
   - Validate sales history accuracy

#### Phase 3: Scoring (Week 2)

1. **Run Scoring Algorithm** (Section 6):
   - Calculate cash flow scores
   - Calculate capital growth scores (basic version)

2. **Normalize Scores**:
   - Ensure suburb scores are properly distributed (0-100)
   - Validate against known investment-grade suburbs

#### Phase 4: Expansion (Ongoing)

**Add 10 suburbs per week** based on:

1. User search volume (what suburbs are users asking about?)
2. Geographic gaps (ensure coverage of all regions)
3. Strategy gaps (add more cash flow or growth suburbs as needed)

**Expansion order**:

- Week 3: Add 10 more Sydney suburbs
- Week 4: Add 10 more Melbourne suburbs
- Week 5: Add 10 more Brisbane suburbs
- Week 6: Add 5 more regional + 5 user-requested

### 4.5 Database Seeding Script

Create a seeding script for the MVP suburbs:

```typescript
// /scripts/seed-mvp-suburbs.ts
import { db } from "@/lib/db";
import { mvpSuburbs } from "./data/mvp-suburbs.json";

async function seedMvpSuburbs() {
  console.log("Seeding MVP suburbs...");

  for (const suburb of mvpSuburbs) {
    try {
      await db.suburb.upsert({
        where: {
          name_state_postcode: {
            name: suburb.name,
            state: suburb.state,
            postcode: suburb.postcode,
          },
        },
        update: {
          strategyFocus: suburb.strategyFocus,
          typicalPriceMin: suburb.typicalPriceMin,
          typicalPriceMax: suburb.typicalPriceMax,
          isMvp: true,
          priority: suburb.priority,
        },
        create: {
          name: suburb.name,
          state: suburb.state,
          postcode: suburb.postcode,
          strategyFocus: suburb.strategyFocus,
          typicalPriceMin: suburb.typicalPriceMin,
          typicalPriceMax: suburb.typicalPriceMax,
          isMvp: true,
          priority: suburb.priority,
        },
      });

      console.log(`✓ Seeded ${suburb.name}, ${suburb.state}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${suburb.name}:`, error);
    }
  }

  console.log("Seeding complete!");
}

seedMvpSuburbs();
```

**Run command**:

```bash
pnpm tsx scripts/seed-mvp-suburbs.ts
```

### 4.6 Monitoring Data Quality

Track these metrics for each suburb:

| Metric                  | Ideal Target | Warning Threshold |
| ----------------------- | ------------ | ----------------- |
| Active sale listings    | 20+          | < 10              |
| Active rental listings  | 10+          | < 5               |
| Recent sales (12mo)     | 50+          | < 20              |
| Data freshness          | < 7 days     | > 14 days         |
| Price data completeness | 100%         | < 80%             |
| Demographic data        | Available    | Missing           |

**Monitoring dashboard** (Inngest or internal tool):

- Show suburb data health
- Alert when suburb falls below threshold
- Track sync job success rate

### 4.7 MVP Suburb Configuration File

Create `/config/mvp-suburbs.json`:

```json
{
  "version": "1.0",
  "lastUpdated": "2024-02-01",
  "suburbs": [
    {
      "name": "Parramatta",
      "state": "NSW",
      "postcode": "2150",
      "region": "Sydney Metro",
      "strategyFocus": "capital_growth",
      "typicalPriceMin": 900000,
      "typicalPriceMax": 1200000,
      "priority": 1,
      "rationale": "CBD expansion, infrastructure investment"
    },
    {
      "name": "Werribee",
      "state": "VIC",
      "postcode": "3030",
      "region": "Melbourne Metro",
      "strategyFocus": "cash_flow",
      "typicalPriceMin": 500000,
      "typicalPriceMax": 600000,
      "priority": 2,
      "rationale": "Western growth, affordability, rail access"
    }
    // ... remaining 48 suburbs
  ]
}
```

This configuration drives:

- Seeding scripts
- Sync job prioritization
- UI suburb filters
- Strategy recommendations

---

## 5. Market Data Retrieval (PRO-25)

### 5.1 Architecture Overview

Market data flows from external APIs through the MCP market-data package into the application, with caching and background refresh jobs ensuring data freshness.

```
User Query → Researcher Agent → Market Tools → MCP HTTP Client
                                                      ↓
                                            MCP Market-Data Server
                                                      ↓
                                         External APIs (ABS, RBA)
                                                      ↓
                                    PostgreSQL (market_indicators table)
                                                      ↓
                                         Redis Cache (15 min TTL)
```

### 5.2 Market Data Workflow

#### On-Demand Retrieval (Via Researcher Agent)

When a user asks about market conditions, the Researcher Agent calls market tools:

**Tool: `getMarketIndicators()`**

```typescript
// /apps/web/lib/tools/marketTools.ts
import { tool } from "ai";
import { z } from "zod";
import { callMcpTool } from "@/lib/mcp/client";
import { redis } from "@/lib/redis";

export const getMarketIndicators = tool({
  description:
    "Get latest market indicators including RBA cash rate, ABS economic data, and state-level trends",
  parameters: z.object({
    geography: z
      .enum(["national", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"])
      .default("national"),
    indicators: z
      .array(
        z.enum([
          "cash_rate",
          "building_approvals",
          "unemployment",
          "wage_growth",
          "inflation",
        ]),
      )
      .optional()
      .describe("Specific indicators to fetch (default: all)"),
    includeHistorical: z
      .boolean()
      .default(false)
      .describe("Include 12-month historical trend"),
  }),
  execute: async ({ geography, indicators, includeHistorical }) => {
    try {
      // Check cache first
      const cacheKey = `market:${geography}:${indicators?.join(",")}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from MCP
      const response = await callMcpTool("market-data", "getMarketIndicators", {
        geography,
        indicators,
        includeHistorical,
      });

      if (!response.success) {
        return { success: false, error: response.error };
      }

      const result = {
        success: true,
        geography,
        indicators: response.data.indicators,
        asOf: response.data.timestamp,
        historical: includeHistorical ? response.data.historical : null,
      };

      // Cache for 15 minutes
      await redis.setex(cacheKey, 900, JSON.stringify(result));

      return result;
    } catch (error) {
      console.error("Market indicators retrieval failed:", error);
      return {
        success: false,
        error: "Market data temporarily unavailable",
      };
    }
  },
});
```

**Example response**:

```json
{
  "success": true,
  "geography": "NSW",
  "indicators": {
    "cash_rate": {
      "value": 4.35,
      "unit": "%",
      "asOf": "2024-02-01",
      "source": "RBA",
      "trend": "stable"
    },
    "building_approvals": {
      "value": 5234,
      "unit": "count",
      "asOf": "2024-01-01",
      "source": "ABS",
      "trend": "increasing",
      "changePercent": 8.3
    },
    "unemployment": {
      "value": 3.7,
      "unit": "%",
      "asOf": "2024-01-01",
      "source": "ABS",
      "trend": "stable"
    }
  },
  "asOf": "2024-02-01T10:30:00Z"
}
```

#### Scheduled Refresh (Inngest Background Job)

To keep market data fresh, run daily background jobs:

**Job: `refresh-market-indicators`**

**File**: `/apps/web/inngest/functions/refresh-market-indicators.ts`

```typescript
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { callMcpTool } from "@/lib/mcp/client";
import { redis } from "@/lib/redis";

export const refreshMarketIndicators = inngest.createFunction(
  {
    id: "refresh-market-indicators",
    name: "Refresh Market Indicators",
    retries: 3,
  },
  { cron: "0 4 * * *" }, // Daily at 4 AM AEST
  async ({ event, step }) => {
    // Step 1: Fetch RBA cash rate
    const cashRate = await step.run("fetch-rba-cash-rate", async () => {
      const response = await callMcpTool("market-data", "getRbaCashRate", {});
      return response.data;
    });

    // Step 2: Fetch ABS building approvals (monthly)
    const buildingApprovals = await step.run(
      "fetch-abs-building-approvals",
      async () => {
        const response = await callMcpTool(
          "market-data",
          "getAbsBuildingApprovals",
          {
            dateFrom: new Date(
              Date.now() - 365 * 24 * 60 * 60 * 1000,
            ).toISOString(), // Last year
          },
        );
        return response.data;
      },
    );

    // Step 3: Fetch ABS employment data (quarterly)
    const employment = await step.run("fetch-abs-employment", async () => {
      const response = await callMcpTool("market-data", "getAbsEmployment", {});
      return response.data;
    });

    // Step 4: Update database
    await step.run("update-market-indicators-db", async () => {
      // Cash rate (national)
      await db.marketIndicator.upsert({
        where: {
          indicatorType_geography_recordedAt: {
            indicatorType: "cash_rate",
            geography: "national",
            recordedAt: new Date(cashRate.asOf),
          },
        },
        update: {
          value: cashRate.value,
          unit: "%",
          source: "RBA",
          metadata: { trend: cashRate.trend },
        },
        create: {
          indicatorType: "cash_rate",
          geography: "national",
          value: cashRate.value,
          unit: "%",
          recordedAt: new Date(cashRate.asOf),
          source: "RBA",
          metadata: { trend: cashRate.trend },
        },
      });

      // Building approvals (per state)
      for (const approval of buildingApprovals) {
        await db.marketIndicator.create({
          data: {
            indicatorType: "building_approvals",
            geography: approval.state,
            value: approval.totalApprovals,
            unit: "count",
            recordedAt: new Date(approval.month),
            source: "ABS",
            metadata: {
              houseApprovals: approval.houseApprovals,
              apartmentApprovals: approval.apartmentApprovals,
            },
          },
        });
      }

      // Employment data (per state)
      for (const state of employment.states) {
        await db.marketIndicator.create({
          data: {
            indicatorType: "unemployment",
            geography: state.code,
            value: state.unemploymentRate,
            unit: "%",
            recordedAt: new Date(employment.asOf),
            source: "ABS",
          },
        });
      }
    });

    // Step 5: Calculate derived metrics
    await step.run("calculate-affordability-index", async () => {
      // TODO: Calculate affordability index from median income + median price
      // Formula: (Median Price × Interest Rate × 12) / Median Annual Income
    });

    // Step 6: Invalidate Redis cache
    await step.run("invalidate-cache", async () => {
      const keys = await redis.keys("market:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    });

    // Step 7: Trigger dependent calculations
    await step.run("trigger-suburb-recalculations", async () => {
      // Send event to recalculate suburb scores if market conditions changed significantly
      if (cashRate.value !== cashRate.previousValue) {
        await inngest.send({
          name: "suburb-metrics/recalculate-all",
          data: { reason: "cash_rate_change", newRate: cashRate.value },
        });
      }
    });

    return {
      success: true,
      updated: {
        cashRate: cashRate.value,
        buildingApprovals: buildingApprovals.length,
        employment: employment.states.length,
      },
    };
  },
);
```

### 5.3 Data Sources

#### RBA (Reserve Bank of Australia)

**What**: Official cash rate, lending indicators, financial stability metrics

**Access**: Via MCP market-data package (`/packages/mcp-market-data/src/sources/rba-api.ts`)

**API Endpoint**: `https://www.rba.gov.au/statistics/`

**Update Frequency**:

- Cash rate: Monthly (first Tuesday of each month)
- Lending indicators: Monthly
- Financial stability: Quarterly

**Key Indicators**:

- Cash rate (official interest rate)
- Variable mortgage rates
- Fixed mortgage rates
- Lending by state
- Housing credit growth

**Implementation**:

```typescript
// /packages/mcp-market-data/src/sources/rba-api.ts
export async function getRbaCashRate(): Promise<RbaIndicator> {
  // RBA publishes via CSV/Excel downloads or API
  const response = await fetch(
    "https://www.rba.gov.au/statistics/tables/csv/f1.1-data.csv",
  );
  const csv = await response.text();

  // Parse CSV to extract latest cash rate
  const lines = csv.split("\n");
  const latestRow = lines[lines.length - 2]; // Second last (last is empty)
  const [date, rate] = latestRow.split(",");

  return {
    value: parseFloat(rate),
    unit: "%",
    asOf: date,
    source: "RBA",
    trend: calculateTrend(lines), // Helper to determine if rising/falling/stable
  };
}
```

#### ABS (Australian Bureau of Statistics)

**What**: Economic indicators, demographics, building activity, employment

**Access**: Mixed approach

- **Census Demographics**: Web scraping with scrape.do (`/packages/mcp-market-data/src/sources/abs-scraper.ts`)
- **Building Approvals**: Official XML API (`/packages/mcp-market-data/src/sources/abs-api.ts`)

**Data Source URLs**:

- **Census Demographics**: `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA{postcode}`
- **Building Approvals API**: `https://data.api.abs.gov.au/rest/data/ABS,BA_SA2,2.0.0/1.9.TOT.TOT..{SA2_CODE_2021}.M?startPeriod=YYYY-MM`
- **SA2 Geocoding API**: `https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA2/MapServer/find`
- **Labour Force**: `https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia` (scraping)

**Update Frequency**:

- Building approvals: Monthly (released ~5 weeks after period end)
- Labour force (employment/unemployment): Monthly (released mid-month)
- Census data: Every 5 years (2021 → 2026; estimates between censuses)
- Population projections: Annual

**Key Indicators**:

- **From Census QuickStats**: All 50+ demographic fields (see Section 1.2)
- **From Statistical Tables**: Building approvals by state, employment data, wage growth
- **Calculated**: Population growth, income growth, employment trends

**Implementation Note**:

- **Census Demographics**: No official API - use web scraping via scrape.do (see Section 1.4)
- **Building Approvals**: Official XML API available at SA2 geographic level
- **SA2 Geocoding**: Official JSON API to convert suburb names to SA2 codes
- **Aggressive caching**: Census data cached permanently in database; API data cached with TTL

**Implementation Pattern 1: Census Demographics (Web Scraping)**

```typescript
// /packages/mcp-market-data/src/sources/abs-scraper.ts
import { scrapeWithScrapeDo } from "./scrape-client";
import * as cheerio from "cheerio";

export async function getAbsDemographics(params: {
  suburb: string;
  state: string;
  postcode: string;
}): Promise<AbsDemographics> {
  // Scrape ABS QuickStats page
  const url = `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${params.postcode}`;

  const html = await scrapeWithScrapeDo({
    url,
    renderJs: true,
    proxyCountry: "au",
    cache: true,
    cacheTtl: 86400, // 24 hours
  });

  const $ = cheerio.load(html);

  // Parse QuickStats data (50+ fields)
  return {
    totalPopulation: parseIntFromSection($, "Total population"),
    medianAge: parseIntFromSection($, "Median age"),
    medianWeeklyPersonalIncome: parseCurrencyFromSection(
      $,
      "Median weekly personal income",
    ),
    // ... 47 more fields
    censusYear: 2021,
  };
}
```

**See Section 1.4** for complete scraping implementation details.

**Implementation Pattern 2: Building Approvals (Official API)**

```typescript
// /packages/mcp-market-data/src/sources/abs-api.ts
interface BuildingApprovalsParams {
  suburb: string;
  state: string;
  startPeriod?: string; // Format: '2025-01'
}

export async function getAbsBuildingApprovals(
  params: BuildingApprovalsParams,
): Promise<AbsBuildingApprovals> {
  // Step 1: Get SA2 code for suburb
  const sa2Result = await getSA2CodeForSuburb(params.suburb, params.state);

  if (!sa2Result) {
    throw new Error(`No SA2 code found for ${params.suburb}, ${params.state}`);
  }

  // Step 2: Fetch building approvals by SA2 code
  const startPeriod = params.startPeriod || "2020-01";
  const url = `https://data.api.abs.gov.au/rest/data/ABS,BA_SA2,2.0.0/1.9.TOT.TOT..${sa2Result.sa2Code}.M?startPeriod=${startPeriod}&dimensionAtObservation=AllDimensions`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.sdmx.genericdata+xml;version=2.1",
    },
  });

  if (!response.ok) {
    throw new Error(`ABS API error: ${response.statusText}`);
  }

  const xmlText = await response.text();

  // Step 3: Parse XML response (SDMX-ML Generic format)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const observations = xmlDoc.getElementsByTagName("generic:Obs");
  const approvals: Array<{ period: string; value: number }> = [];

  for (let i = 0; i < observations.length; i++) {
    const obs = observations[i];

    // Get TIME_PERIOD from ObsKey
    const obsKey = obs.getElementsByTagName("generic:ObsKey")[0];
    const timePeriodValue = Array.from(obsKey.getElementsByTagName("generic:Value"))
      .find(v => v.getAttribute("id") === "TIME_PERIOD");
    const period = timePeriodValue?.getAttribute("value");

    // Get actual value from ObsValue
    const obsValue = obs.getElementsByTagName("generic:ObsValue")[0];
    const value = parseFloat(obsValue?.getAttribute("value") || "0");

    if (period && !isNaN(value)) {
      approvals.push({ period, value });
    }
  }

  return {
    sa2Code: sa2Result.sa2Code,
    sa2Name: sa2Result.sa2Name,
    data: approvals,
    source: "ABS",
  };
}

// Helper: Get SA2 code for suburb
async function getSA2CodeForSuburb(
  suburb: string,
  state: string,
): Promise<SA2GeocodeResult | null> {
  // Check cache first
  const cached = await prisma.sA2Geocode.findUnique({
    where: {
      suburb_state: {
        suburb: suburb.toLowerCase(),
        state: state,
      },
    },
  });

  if (cached) {
    return {
      sa2Code: cached.sa2Code,
      sa2Name: cached.sa2Name,
      state: cached.state,
    };
  }

  // Call ABS Geo API
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
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return null;
  }

  // Filter by state if multiple matches
  let result = data.results[0];
  if (data.results.length > 1) {
    result =
      data.results.find(
        (r: any) =>
          r.attributes.STE_NAME_2021?.toUpperCase() === state.toUpperCase(),
      ) || data.results[0];
  }

  const geocodeResult = {
    sa2Code: result.attributes.SA2_CODE_2021,
    sa2Name: result.attributes.SA2_NAME_2021,
    state: result.attributes.STE_NAME_2021,
  };

  // Cache permanently
  await prisma.sA2Geocode.create({
    data: {
      suburb: suburb.toLowerCase(),
      state: state,
      sa2Code: geocodeResult.sa2Code,
      sa2Name: geocodeResult.sa2Name,
      longitude: result.geometry?.x,
      latitude: result.geometry?.y,
    },
  });

  return geocodeResult;
}
```

**API Implementation Notes**:

- **SA2 Level**: Building approvals available at SA2 (Statistical Area Level 2) geographic level
- **Two-step process**: First geocode suburb to SA2 code, then fetch approvals
- **Permanent SA2 caching**: SA2 codes don't change between Census periods
- **XML/SDMX format**: Official statistical data format, requires XML parsing
- **Monthly data**: Updated ~5 weeks after period end
- **National comparison**: Can also fetch national totals by using `AUS` as geography code

**See Section 1.2** for detailed Building Approvals API documentation and SA2 Geocoding implementation

### 5.4 Storage Schema

**Table: `market_indicators`**

```prisma
// /packages/db/prisma/schema.prisma
model MarketIndicator {
  id            String   @id @default(cuid())

  // Indicator identification
  indicatorType String   // 'cash_rate', 'building_approvals', 'unemployment', etc.
  geography     String   // 'national', 'NSW', 'VIC', etc.

  // Value
  value         Float
  unit          String   // '%', 'count', 'AUD', 'index'

  // Metadata
  recordedAt    DateTime
  source        String   // 'RBA', 'ABS', 'calculated'
  metadata      Json?    // Additional context (e.g., breakdown, trend)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([indicatorType, geography, recordedAt])
  @@index([indicatorType, geography])
  @@index([recordedAt])
}
```

**Example records**:

```json
[
  {
    "indicatorType": "cash_rate",
    "geography": "national",
    "value": 4.35,
    "unit": "%",
    "recordedAt": "2024-02-01T00:00:00Z",
    "source": "RBA",
    "metadata": { "trend": "stable", "changeFromPrevious": 0 }
  },
  {
    "indicatorType": "building_approvals",
    "geography": "NSW",
    "value": 5234,
    "unit": "count",
    "recordedAt": "2024-01-01T00:00:00Z",
    "source": "ABS",
    "metadata": {
      "houseApprovals": 2100,
      "apartmentApprovals": 3134,
      "changePercent": 8.3
    }
  },
  {
    "indicatorType": "unemployment",
    "geography": "VIC",
    "value": 4.1,
    "unit": "%",
    "recordedAt": "2024-01-01T00:00:00Z",
    "source": "ABS",
    "metadata": { "trend": "increasing" }
  }
]
```

### 5.5 Error Handling & Resilience

**Retry Logic** (built into `callMcpTool`):

- 3 attempts with exponential backoff (2^attempt seconds)
- Log each failure for debugging
- Return graceful error response on final failure

**Fallback Strategy**:

```typescript
export async function getMarketIndicatorsWithFallback(geography: string) {
  try {
    // Try live API
    const live = await callMcpTool("market-data", "getMarketIndicators", {
      geography,
    });
    if (live.success) return live.data;
  } catch (error) {
    console.error("Live API failed:", error);
  }

  // Fallback 1: Use last known good value from database
  const lastKnown = await db.marketIndicator.findFirst({
    where: { geography, indicatorType: "cash_rate" },
    orderBy: { recordedAt: "desc" },
  });

  if (lastKnown) {
    console.warn("Using last known market data from", lastKnown.recordedAt);
    return {
      ...lastKnown,
      stale: true,
      staleSince: lastKnown.recordedAt,
    };
  }

  // Fallback 2: Use national averages/defaults
  console.error("No market data available, using defaults");
  return getDefaultMarketIndicators(geography);
}
```

**Alerting**:

- Log errors to monitoring system (e.g., Sentry, Datadog)
- Send Slack notification if sync job fails 3 consecutive times
- Track data staleness metric (alert if > 7 days old)

### 5.6 Usage by Agents

#### Researcher Agent

Uses market indicators to provide macroeconomic context:

**Example conversation**:

```
User: "Is now a good time to buy in Sydney?"

Researcher Agent:
1. Calls getMarketIndicators({ geography: 'NSW' })
2. Analyzes:
   - Cash rate: 4.35% (stable)
   - Building approvals: Up 8% (increasing supply)
   - Unemployment: 3.7% (strong economy)
3. Synthesizes: "Market conditions in NSW show stable interest rates,
   increasing supply from strong building approvals, and low unemployment.
   This suggests a balanced market with moderate competition."
```

#### Analyst Agent

Uses market data for risk assessment and growth projections:

**Example**:

```
User: "What's the ROI on this property over 10 years?"

Analyst Agent:
1. Calls calculateROI({ ... })
2. Calls getMarketIndicators({ geography: 'NSW', includeHistorical: true })
3. Adjusts growth rate based on:
   - Historical building approvals trend (supply pressure)
   - Interest rate trajectory (affordability impact)
   - Employment trends (demand fundamentals)
4. Returns adjusted ROI with confidence interval
```

### 5.7 Caching Strategy

**Redis Cache Configuration**:

| Data Type                       | TTL        | Rationale                                     |
| ------------------------------- | ---------- | --------------------------------------------- |
| Market indicators (national)    | 15 minutes | RBA/ABS update monthly, but real-time queries |
| Market indicators (state)       | 15 minutes | Same as national                              |
| Historical trends               | 1 hour     | Less frequently accessed                      |
| Derived metrics (affordability) | 30 minutes | Calculated, not fetched                       |

**Cache invalidation**:

- On successful sync job completion
- Manual invalidation via admin endpoint: `POST /api/admin/cache/invalidate`
- Automatic expiry based on TTL

**Cache key pattern**:

```typescript
const cacheKey = `market:${geography}:${indicators.join(",")}:${includeHistorical}`;
// Example: "market:NSW:cash_rate,unemployment:false"
```

---

## 6. Suburb Scoring Algorithm (PRO-24)

### 6.1 Current Implementation Status

**File**: `/apps/web/inngest/functions/calculate-suburb-metrics.ts`

**Current capabilities** (Basic):

- Median sale price (from Domain + REA listings)
- Median weekly rent (from rental listings)
- Gross yield calculation: `(rent × 52 / price) × 100`

**Limitations**:

- No strategy-specific scoring
- Missing key indicators (vacancy, growth rates, days on market)
- No normalization or percentile ranking

### 6.2 Proposed Comprehensive Scoring Algorithm

The scoring algorithm provides **strategy-specific scores (0-100)** for each suburb, enabling users to find suburbs that match their investment strategy.

#### Cash Flow Strategy Scoring Matrix

**Target**: Suburbs with high rental yield, low vacancy, and strong rental demand

| Indicator               | Weight | Calculation                 | Data Source             | Normalization            |
| ----------------------- | ------ | --------------------------- | ----------------------- | ------------------------ |
| **Gross yield**         | 30%    | (annual rent / price) × 100 | Domain/REA              | Linear: 0%→0, 10%+→100   |
| **Vacancy rate**        | 25%    | % of properties vacant      | SQM Research / Estimate | Inverse: 0%→100, 10%+→0  |
| **Rental growth (YoY)** | 15%    | % change in median rent     | Domain reports          | Linear: -5%→0, 10%+→100  |
| **Days on market**      | 10%    | Avg days to rent            | Domain/REA              | Inverse: 0d→100, 90d+→0  |
| **Stock on market**     | 10%    | Listings / population       | Domain/REA              | Inverse: Low→100, High→0 |
| **Affordability**       | 10%    | Rent / median income        | ABS + Domain            | Lower→better: <20%→100   |

**Formula**:

```python
def calculate_cash_flow_score(suburb):
    indicators = get_cash_flow_indicators(suburb)

    # Normalize each indicator to 0-100
    yield_score = normalize_linear(indicators.gross_yield, min=0, max=10)
    vacancy_score = normalize_inverse(indicators.vacancy_rate, min=0, max=10)
    growth_score = normalize_linear(indicators.rental_growth, min=-5, max=10)
    dom_score = normalize_inverse(indicators.days_on_market, min=0, max=90)
    stock_score = normalize_inverse(indicators.stock_ratio, min=0, max=0.05)
    afford_score = normalize_inverse(indicators.rent_income_ratio, min=0, max=0.4)

    # Weighted average
    raw_score = (
        yield_score * 0.30 +
        vacancy_score * 0.25 +
        growth_score * 0.15 +
        dom_score * 0.10 +
        stock_score * 0.10 +
        afford_score * 0.10
    )

    return clamp(raw_score, 0, 100)
```

#### Capital Growth Strategy Scoring Matrix

**Target**: Suburbs with strong price appreciation potential, infrastructure, and income growth

| Indicator                    | Weight | Calculation                 | Data Source            | Normalization                  |
| ---------------------------- | ------ | --------------------------- | ---------------------- | ------------------------------ |
| **Price growth (3yr CAGR)**  | 25%    | Compound annual growth rate | CoreLogic / Sales data | Linear: -5%→0, 15%+→100        |
| **Income growth**            | 20%    | % change in median income   | ABS census trends      | Linear: 0%→0, 10%+→100         |
| **Infrastructure pipeline**  | 15%    | Qualitative score 1-10      | Manual/API             | Direct: 1→10, 10→100           |
| **Professional workforce %** | 15%    | % in prof occupations       | ABS occupation data    | Linear: 20%→0, 60%+→100        |
| **Proximity to CBD/jobs**    | 10%    | Distance-weighted score     | Google Maps            | Inverse: 0km→100, 50km+→0      |
| **Auction clearance**        | 10%    | % sold at auction           | Domain                 | Higher→better: 50%→0, 90%+→100 |
| **Affordability headroom**   | 5%     | Price/income ratio trend    | ABS + Domain           | Stable→better                  |

**Formula**:

```python
def calculate_capital_growth_score(suburb):
    indicators = get_capital_growth_indicators(suburb)

    # Normalize
    growth_score = normalize_linear(indicators.price_growth_3yr, min=-5, max=15)
    income_score = normalize_linear(indicators.income_growth, min=0, max=10)
    infra_score = normalize_linear(indicators.infrastructure_score, min=1, max=10)
    prof_score = normalize_linear(indicators.professional_pct, min=20, max=60)
    cbd_score = normalize_inverse(indicators.cbd_distance_km, min=0, max=50)
    auction_score = normalize_linear(indicators.auction_clearance, min=50, max=90)
    afford_score = normalize_affordability_headroom(indicators.price_income_ratio)

    # Weighted average
    raw_score = (
        growth_score * 0.25 +
        income_score * 0.20 +
        infra_score * 0.15 +
        prof_score * 0.15 +
        cbd_score * 0.10 +
        auction_score * 0.10 +
        afford_score * 0.05
    )

    return clamp(raw_score, 0, 100)
```

### 6.3 Normalization Methods

#### Linear Normalization

Maps value linearly from min-max range to 0-100:

```typescript
function normalizeLinear(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
}

// Example: Gross yield
// 0% yield → 0 score
// 5% yield → 50 score
// 10%+ yield → 100 score
const yieldScore = normalizeLinear(5.5, 0, 10); // Returns 55
```

#### Inverse Normalization

For "lower is better" indicators:

```typescript
function normalizeInverse(value: number, min: number, max: number): number {
  if (value <= min) return 100;
  if (value >= max) return 0;
  return 100 - ((value - min) / (max - min)) * 100;
}

// Example: Vacancy rate
// 0% vacancy → 100 score
// 5% vacancy → 50 score
// 10%+ vacancy → 0 score
const vacancyScore = normalizeInverse(2.5, 0, 10); // Returns 75
```

#### Percentile Normalization

Compare to national distribution:

```typescript
async function normalizePercentile(
  suburb: string,
  indicator: string,
  value: number,
): Promise<number> {
  // Get all suburbs' values for this indicator
  const allValues = await db.suburb.findMany({
    select: { [indicator]: true },
    where: { [indicator]: { not: null } },
  });

  const sorted = allValues.map((s) => s[indicator]).sort((a, b) => a - b);

  // Find percentile
  const rank = sorted.findIndex((v) => v >= value);
  const percentile = (rank / sorted.length) * 100;

  return percentile;
}

// Example: Price growth
// If suburb's 5% growth is better than 70% of suburbs → 70 score
```

#### Z-Score Normalization

Standard deviations from mean:

```typescript
function normalizeZScore(value: number, mean: number, stdDev: number): number {
  const z = (value - mean) / stdDev;

  // Map z-score (-3 to +3) to 0-100
  // z = -3 → 0, z = 0 → 50, z = +3 → 100
  const normalized = ((z + 3) / 6) * 100;

  return clamp(normalized, 0, 100);
}

// Example: If income growth is 2 std devs above mean → high score
```

### 6.4 Implementation Phases

#### Phase 1: Basic Cash Flow Scoring (MVP - 2 weeks)

**Goal**: Implement cash flow scoring with 4 indicators

**Indicators to implement**:

1. ✅ Gross yield (already calculated)
2. ⭕ Days on market (new - track from Domain/REA)
3. ⭕ Vacancy rate (estimate or integrate SQM)
4. ⭕ Affordability (calculate from ABS income + median price)

**Database schema additions**:

```prisma
model Suburb {
  // ... existing fields

  // Cash flow indicators
  grossYield          Decimal?  @db.Decimal(5, 2)
  daysOnMarket        Int?
  vacancyRate         Decimal?  @db.Decimal(5, 2)
  rentIncomeRatio     Decimal?  @db.Decimal(5, 2)

  // Scores
  cashFlowScore       Int?      // 0-100
  scoreUpdatedAt      DateTime?

  @@index([cashFlowScore])
}
```

**Implementation**:

```typescript
// /apps/web/inngest/functions/calculate-suburb-metrics.ts
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";

export const calculateSuburbMetrics = inngest.createFunction(
  {
    id: "calculate-suburb-metrics",
    name: "Calculate Suburb Metrics",
    retries: 2,
  },
  { event: "suburb-metrics/calculate" },
  async ({ event, step }) => {
    const { suburbId } = event.data;

    // Fetch suburb with properties
    const suburb = await step.run("fetch-suburb", async () => {
      return db.suburb.findUnique({
        where: { id: suburbId },
        include: {
          properties: {
            where: {
              listingStatus: "active",
              updatedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              }, // Last 30 days
            },
          },
          salesRecords: {
            where: {
              saleDate: {
                gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
              }, // Last 12 months
            },
          },
        },
      });
    });

    if (!suburb) {
      throw new Error(`Suburb ${suburbId} not found`);
    }

    // Calculate metrics
    const metrics = await step.run("calculate-metrics", async () => {
      // Separate sale and rental properties
      const saleProperties = suburb.properties.filter(
        (p) => p.listingType === "sale",
      );
      const rentalProperties = suburb.properties.filter(
        (p) => p.listingType === "rent",
      );

      // 1. Median price (from sales)
      const salePrices = suburb.salesRecords.map((s) => s.salePrice);
      const medianPrice = calculateMedian(salePrices);

      // 2. Median rent (from rentals)
      const weeklyRents = rentalProperties
        .map((p) => p.weeklyRent)
        .filter((r) => r != null);
      const medianRent = calculateMedian(weeklyRents);

      // 3. Gross yield
      const grossYield =
        medianRent && medianPrice
          ? ((medianRent * 52) / medianPrice) * 100
          : null;

      // 4. Days on market (average)
      const daysOnMarket = Math.round(
        saleProperties.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) /
          saleProperties.length,
      );

      // 5. Vacancy rate (estimate from listing volume)
      // TODO: Integrate SQM Research API for actual vacancy data
      const totalDwellings = suburb.totalDwellings || 10000; // From ABS
      const activeRentals = rentalProperties.length;
      const estimatedVacancy = (activeRentals / totalDwellings) * 100;
      const vacancyRate = Math.min(estimatedVacancy, 10); // Cap at 10%

      // 6. Affordability (rent/income ratio)
      const medianIncome = suburb.medianWeeklyIncome; // From ABS
      const rentIncomeRatio =
        medianIncome && medianRent ? (medianRent / medianIncome) * 100 : null;

      return {
        medianPrice,
        medianRent,
        grossYield,
        daysOnMarket,
        vacancyRate,
        rentIncomeRatio,
      };
    });

    // Calculate cash flow score
    const cashFlowScore = await step.run(
      "calculate-cash-flow-score",
      async () => {
        if (!metrics.grossYield) return null;

        // Normalize indicators
        const yieldScore = normalizeLinear(metrics.grossYield, 0, 10);
        const vacancyScore = normalizeInverse(metrics.vacancyRate, 0, 10);
        const domScore = normalizeInverse(metrics.daysOnMarket || 45, 0, 90);
        const affordScore = metrics.rentIncomeRatio
          ? normalizeInverse(metrics.rentIncomeRatio, 0, 40)
          : 50; // Default if missing

        // Weighted average (simplified 4-indicator version)
        const score =
          yieldScore * 0.35 + // Increased weight (no rental growth data yet)
          vacancyScore * 0.3 + // Increased weight
          domScore * 0.2 +
          affordScore * 0.15;

        return Math.round(clamp(score, 0, 100));
      },
    );

    // Update suburb record
    await step.run("update-suburb", async () => {
      await db.suburb.update({
        where: { id: suburbId },
        data: {
          medianSalePrice: metrics.medianPrice,
          medianWeeklyRent: metrics.medianRent,
          grossYield: metrics.grossYield,
          daysOnMarket: metrics.daysOnMarket,
          vacancyRate: metrics.vacancyRate,
          rentIncomeRatio: metrics.rentIncomeRatio,
          cashFlowScore,
          scoreUpdatedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      suburbId,
      metrics,
      cashFlowScore,
    };
  },
);

// Helper functions
function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function normalizeLinear(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
}

function normalizeInverse(value: number, min: number, max: number): number {
  if (value <= min) return 100;
  if (value >= max) return 0;
  return 100 - ((value - min) / (max - min)) * 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

#### Phase 2: Capital Growth Scoring (4 weeks)

**Goal**: Add capital growth indicators and scoring

**New indicators to track**:

1. Price growth (3yr CAGR) - requires historical price tracking
2. Income growth - from ABS updates
3. Infrastructure pipeline - manual scoring or API
4. Professional workforce % - from ABS
5. CBD proximity - one-time geocoding calculation
6. Auction clearance - from Domain

**Database schema additions**:

```prisma
model Suburb {
  // ... existing fields

  // Capital growth indicators
  priceGrowth3yr      Decimal?  @db.Decimal(5, 2)  // % CAGR
  incomeGrowth        Decimal?  @db.Decimal(5, 2)  // % YoY
  infrastructureScore Int?                          // 1-10 qualitative
  professionalPct     Decimal?  @db.Decimal(5, 2)  // % of workforce
  cbdDistanceKm       Decimal?  @db.Decimal(5, 2)
  auctionClearance    Decimal?  @db.Decimal(5, 2)  // %

  // Scores
  capitalGrowthScore  Int?      // 0-100
  overallScore        Int?      // Weighted average or user-preference based

  @@index([capitalGrowthScore])
  @@index([overallScore])
}
```

**Price growth calculation** (requires historical tracking):

```typescript
async function calculatePriceGrowth(
  suburbId: string,
  years: number = 3,
): Promise<number | null> {
  // Get median prices for each of the last N years
  const now = new Date();
  const prices: number[] = [];

  for (let i = 0; i <= years; i++) {
    const yearAgo = new Date(now.getFullYear() - i, now.getMonth(), 1);
    const yearEnd = new Date(now.getFullYear() - i, now.getMonth() + 1, 0);

    const sales = await db.saleRecord.findMany({
      where: {
        suburbId,
        saleDate: { gte: yearAgo, lte: yearEnd },
      },
      select: { salePrice: true },
    });

    if (sales.length < 10) continue; // Insufficient data

    const medianPrice = calculateMedian(sales.map((s) => s.salePrice));
    if (medianPrice) prices.push(medianPrice);
  }

  if (prices.length < 2) return null; // Need at least 2 years

  // Calculate CAGR: ((Ending Value / Beginning Value) ^ (1 / Number of Years)) - 1
  const startPrice = prices[prices.length - 1];
  const endPrice = prices[0];
  const cagr = Math.pow(endPrice / startPrice, 1 / years) - 1;

  return cagr * 100; // Return as percentage
}
```

#### Phase 3: Refinement & Backtesting (Ongoing)

**Backtesting strategy**:

1. Apply scoring algorithm to suburbs with known outcomes (past 5 years)
2. Measure correlation: Did high-scoring suburbs actually perform well?
3. Adjust weights based on findings

**A/B testing**:

- Split users: show scores vs no scores
- Measure: engagement, property views, enquiries
- Refine based on user behavior

**Regional adjustments**:

- Metro vs regional: Different weights (e.g., regional=higher yield weight)
- State differences: Account for state-specific trends

### 6.5 Database Schema Summary

```prisma
model Suburb {
  id                  String   @id @default(cuid())
  name                String
  state               String
  postcode            String

  // Location
  latitude            Decimal? @db.Decimal(10, 8)
  longitude           Decimal? @db.Decimal(11, 8)
  cbdDistanceKm       Decimal? @db.Decimal(5, 2)

  // Basic metrics
  medianSalePrice     Decimal? @db.Decimal(12, 2)
  medianWeeklyRent    Decimal? @db.Decimal(8, 2)
  grossYield          Decimal? @db.Decimal(5, 2)

  // Cash flow indicators
  daysOnMarket        Int?
  vacancyRate         Decimal? @db.Decimal(5, 2)
  rentalGrowthYoY     Decimal? @db.Decimal(5, 2)
  stockRatio          Decimal? @db.Decimal(6, 4)
  rentIncomeRatio     Decimal? @db.Decimal(5, 2)

  // Capital growth indicators
  priceGrowth3yr      Decimal? @db.Decimal(5, 2)
  incomeGrowth        Decimal? @db.Decimal(5, 2)
  infrastructureScore Int?
  professionalPct     Decimal? @db.Decimal(5, 2)
  auctionClearance    Decimal? @db.Decimal(5, 2)

  // Demographics (from ABS)
  totalPopulation     Int?
  medianAge           Int?
  medianWeeklyIncome  Decimal? @db.Decimal(8, 2)
  unemploymentRate    Decimal? @db.Decimal(5, 2)
  totalDwellings      Int?

  // Scores
  cashFlowScore       Int?
  capitalGrowthScore  Int?
  overallScore        Int?
  scoreUpdatedAt      DateTime?

  // MVP config
  isMvp               Boolean @default(false)
  priority            Int?

  // Relationships
  properties          Property[]
  salesRecords        SaleRecord[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([name, state, postcode])
  @@index([state])
  @@index([cashFlowScore])
  @@index([capitalGrowthScore])
  @@index([overallScore])
  @@index([isMvp])
}
```

### 6.6 Testing Strategy

**Unit tests** for normalization functions:

```typescript
// /apps/web/inngest/functions/__tests__/suburb-scoring.test.ts
import { describe, it, expect } from "vitest";
import {
  normalizeLinear,
  normalizeInverse,
  clamp,
} from "../calculate-suburb-metrics";

describe("normalizeLinear", () => {
  it("returns 0 for values at or below min", () => {
    expect(normalizeLinear(0, 0, 10)).toBe(0);
    expect(normalizeLinear(-5, 0, 10)).toBe(0);
  });

  it("returns 100 for values at or above max", () => {
    expect(normalizeLinear(10, 0, 10)).toBe(100);
    expect(normalizeLinear(15, 0, 10)).toBe(100);
  });

  it("linearly interpolates values in range", () => {
    expect(normalizeLinear(5, 0, 10)).toBe(50);
    expect(normalizeLinear(2.5, 0, 10)).toBe(25);
  });
});

describe("normalizeInverse", () => {
  it("returns 100 for values at or below min", () => {
    expect(normalizeInverse(0, 0, 10)).toBe(100);
  });

  it("returns 0 for values at or above max", () => {
    expect(normalizeInverse(10, 0, 10)).toBe(0);
  });

  it("inversely interpolates values in range", () => {
    expect(normalizeInverse(5, 0, 10)).toBe(50);
    expect(normalizeInverse(2, 0, 10)).toBe(80);
  });
});
```

**Integration tests** with sample suburbs:

```typescript
describe("calculateCashFlowScore", () => {
  it("scores high-yield suburb correctly", async () => {
    const suburb = await createTestSuburb({
      grossYield: 8.5, // Excellent
      vacancyRate: 1.5, // Low
      daysOnMarket: 14, // Fast
      rentIncomeRatio: 22, // Affordable
    });

    const score = await calculateCashFlowScore(suburb.id);
    expect(score).toBeGreaterThan(75); // Should be high
  });

  it("scores low-yield suburb correctly", async () => {
    const suburb = await createTestSuburb({
      grossYield: 2.5, // Poor
      vacancyRate: 7, // High
      daysOnMarket: 60, // Slow
      rentIncomeRatio: 35, // Expensive
    });

    const score = await calculateCashFlowScore(suburb.id);
    expect(score).toBeLessThan(30); // Should be low
  });
});
```

### 6.7 Monitoring & Alerting

**Score distribution dashboard**:

- Histogram of suburb scores (0-100)
- Ensure healthy distribution (not all bunched at extremes)
- Track score changes over time

**Data quality alerts**:

- Alert if >10% of suburbs have no score
- Alert if score hasn't updated in >14 days
- Alert if median score drastically changes (>10 points)

**Performance tracking**:

- Calculation time per suburb (<5 seconds target)
- Inngest job success rate (>95% target)
- Data freshness (score age <7 days)

---

## 7. Sales Data Retrieval (PRO-15)

### 7.1 Architecture Overview

Sales data flows from Domain and RealEstate.com.au MCPs into the application database, enabling historical analysis, comparable sales, and trend detection.

```
Sales Tools → MCP HTTP Client → Domain/REA MCP Servers → External APIs
                                            ↓
                                      PostgreSQL
                                      ├─ sale_records
                                      ├─ auction_results
                                      └─ price_history
```

### 7.2 Data Retrieval Methods

#### Method 1: Address-Specific Sales History

**Purpose**: Retrieve all historical sales for a specific property address

**Tool**: `getSalesHistory(address, suburb, state)`

**Source**: Domain MCP `get_sales_history` + REA comparable sales

**Use case**: Property detail page, investment analysis, AI agent property evaluation

**Implementation**:

```typescript
// /apps/web/lib/tools/salesTools.ts
import { tool } from "ai";
import { z } from "zod";
import { callMcpTool } from "@/lib/mcp/client";

export const getSalesHistory = tool({
  description: "Get historical sales records for a specific property address",
  parameters: z.object({
    address: z.string().describe("Property street address"),
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code (NSW, VIC, etc.)"),
    yearsBack: z
      .number()
      .default(10)
      .describe("How many years of history to retrieve"),
  }),
  execute: async ({ address, suburb, state, yearsBack }) => {
    try {
      const dateFrom = new Date(
        Date.now() - yearsBack * 365 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const response = await callMcpTool("domain", "get_sales_history", {
        address,
        suburb,
        state,
        dateFrom,
      });

      if (!response.success) {
        return { success: false, error: response.error };
      }

      return {
        success: true,
        address: `${address}, ${suburb} ${state}`,
        salesHistory: response.data.sales || [],
        totalSales: response.data.sales?.length || 0,
      };
    } catch (error) {
      console.error("Sales history retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve sales history",
      };
    }
  },
});
```

**Example response**:

```json
{
  "success": true,
  "address": "123 Main St, Parramatta NSW",
  "salesHistory": [
    {
      "saleDate": "2023-05-15",
      "salePrice": 950000,
      "saleType": "private_treaty",
      "daysOnMarket": 28,
      "source": "DOMAIN"
    },
    {
      "saleDate": "2018-03-20",
      "salePrice": 720000,
      "saleType": "auction",
      "daysOnMarket": 21,
      "source": "DOMAIN"
    },
    {
      "saleDate": "2012-11-10",
      "salePrice": 485000,
      "saleType": "private_treaty",
      "daysOnMarket": 42,
      "source": "DOMAIN"
    }
  ],
  "totalSales": 3
}
```

#### Method 2: Suburb Sold Properties

**Purpose**: Retrieve recently sold properties in a suburb for market analysis

**Tool**: `getSoldProperties(suburb, state, dateFrom, dateTo)`

**Source**: Domain + REA MCP servers

**Use case**: Market trend analysis, comparable sales, suburb reports

**Implementation**:

```typescript
export const getSoldProperties = tool({
  description: "Get recently sold properties in a suburb",
  parameters: z.object({
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code"),
    dateFrom: z
      .string()
      .optional()
      .describe("ISO date (default: 3 months ago)"),
    dateTo: z.string().optional().describe("ISO date (default: today)"),
    propertyTypes: z.array(z.string()).optional().describe("Filter by type"),
    minBedrooms: z.number().optional(),
    maxBedrooms: z.number().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(50).max(100),
  }),
  execute: async (params) => {
    try {
      const {
        suburb,
        state,
        dateFrom = new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        dateTo = new Date().toISOString(),
        propertyTypes,
        minBedrooms,
        maxBedrooms,
        page,
        pageSize,
      } = params;

      // Call Domain MCP
      const domainResponse = await callMcpTool("domain", "search_properties", {
        locations: [{ suburb, state }],
        listingType: "Sold",
        soldDateFrom: dateFrom,
        soldDateTo: dateTo,
        propertyTypes,
        minBedrooms,
        maxBedrooms,
        page,
        pageSize,
      });

      // Also call REA for cross-reference
      const reaResponse = await callMcpTool("realestate", "search_properties", {
        suburb,
        state,
        listingType: "sold",
        soldDateFrom: dateFrom,
        soldDateTo: dateTo,
        page,
        pageSize,
      });

      // Merge results (deduplicate by address)
      const allProperties = [
        ...(domainResponse.data?.listings || []),
        ...(reaResponse.data?.results || []),
      ];

      const deduplicated = deduplicateSales(allProperties);

      return {
        success: true,
        suburb,
        state,
        dateRange: { from: dateFrom, to: dateTo },
        properties: deduplicated,
        totalResults: deduplicated.length,
        sources: ["DOMAIN", "REALESTATE"],
      };
    } catch (error) {
      console.error("Sold properties retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve sold properties",
      };
    }
  },
});

// Helper: Deduplicate sales by address similarity
function deduplicateSales(properties: any[]): any[] {
  const seen = new Map<string, any>();

  for (const property of properties) {
    // Normalize address for matching
    const key = normalizeAddress(
      property.address,
      property.suburb,
      property.state,
    );

    if (!seen.has(key)) {
      seen.set(key, property);
    } else {
      // If duplicate, prefer the one with more complete data
      const existing = seen.get(key);
      if (property.salePrice && !existing.salePrice) {
        seen.set(key, property);
      }
    }
  }

  return Array.from(seen.values());
}

function normalizeAddress(
  address: string,
  suburb: string,
  state: string,
): string {
  // Remove unit numbers, normalize street types
  return `${address} ${suburb} ${state}`
    .toLowerCase()
    .replace(/\bunit\s+\d+\b/g, "")
    .replace(/\bst\b/g, "street")
    .replace(/\brd\b/g, "road")
    .replace(/\bave\b/g, "avenue")
    .replace(/\s+/g, " ")
    .trim();
}
```

#### Method 3: Auction Results

**Purpose**: Retrieve auction results for a suburb on specific dates

**Tool**: `getAuctionResults(suburb, date)`

**Source**: Domain MCP `get_auction_results`

**Use case**: Market sentiment analysis, clearance rate calculation, buyer competition indicators

**Implementation**:

```typescript
export const getAuctionResults = tool({
  description:
    "Get auction results for a suburb on a specific date or date range",
  parameters: z.object({
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code"),
    auctionDate: z
      .string()
      .optional()
      .describe("Specific auction date (ISO format)"),
    dateFrom: z.string().optional().describe("Date range start"),
    dateTo: z.string().optional().describe("Date range end"),
  }),
  execute: async (params) => {
    try {
      const response = await callMcpTool(
        "domain",
        "get_auction_results",
        params,
      );

      if (!response.success) {
        return { success: false, error: response.error };
      }

      const results = response.data.auctions || [];

      // Calculate clearance rate
      const totalAuctions = results.length;
      const soldAtAuction = results.filter(
        (a: any) => a.result === "sold_at_auction",
      ).length;
      const soldBefore = results.filter(
        (a: any) => a.result === "sold_before",
      ).length;
      const passedIn = results.filter(
        (a: any) => a.result === "passed_in",
      ).length;
      const withdrawn = results.filter(
        (a: any) => a.result === "withdrawn",
      ).length;

      const clearanceRate =
        totalAuctions > 0
          ? ((soldAtAuction + soldBefore) / totalAuctions) * 100
          : null;

      return {
        success: true,
        suburb: params.suburb,
        state: params.state,
        dateRange: params.auctionDate
          ? { date: params.auctionDate }
          : { from: params.dateFrom, to: params.dateTo },
        summary: {
          totalAuctions,
          soldAtAuction,
          soldBefore,
          passedIn,
          withdrawn,
          clearanceRate,
        },
        auctions: results,
      };
    } catch (error) {
      console.error("Auction results retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve auction results",
      };
    }
  },
});
```

### 7.3 Database Schema

```prisma
// /packages/db/prisma/schema.prisma

model SaleRecord {
  id              String   @id @default(cuid())

  // Property identification
  address         String
  suburb          String
  state           String
  postcode        String
  propertyId      String?  // Link to Property if exists

  // Sale details
  saleDate        DateTime
  salePrice       Decimal  @db.Decimal(12, 2)
  saleType        String   // 'auction', 'private_treaty', 'tender', 'expression_of_interest'
  daysOnMarket    Int?

  // Property details (captured at sale time)
  propertyType    String?  // 'House', 'Apartment', 'Townhouse', etc.
  bedrooms        Int?
  bathrooms       Int?
  carSpaces       Int?
  landArea        Int?     // sqm

  // Data source
  source          String   // 'DOMAIN', 'REALESTATE', 'CORELOGIC', 'manual'
  externalId      String?  // Source's ID for this sale
  dataQuality     String?  // 'verified', 'estimated', 'scraped'

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relationships
  property        Property? @relation(fields: [propertyId], references: [id])
  suburbRelation  Suburb?   @relation(fields: [suburb, state, postcode], references: [name, state, postcode])

  @@unique([externalId, source])
  @@index([suburb, state])
  @@index([saleDate])
  @@index([propertyId])
}

model AuctionResult {
  id              String   @id @default(cuid())

  // Property
  address         String
  suburb          String
  state           String
  postcode        String

  // Auction details
  auctionDate     DateTime
  result          String   // 'sold_at_auction', 'sold_before', 'sold_after', 'passed_in', 'withdrawn'
  guidePrice      Decimal? @db.Decimal(12, 2)
  soldPrice       Decimal? @db.Decimal(12, 2)
  bidderCount     Int?
  auctioneerName  String?

  // Property details
  propertyType    String?
  bedrooms        Int?
  bathrooms       Int?

  // Source
  source          String
  externalId      String?

  createdAt       DateTime @default(now())

  @@index([suburb, state, auctionDate])
  @@index([auctionDate])
}

model PriceHistory {
  id              String   @id @default(cuid())
  propertyId      String

  price           Decimal  @db.Decimal(12, 2)
  priceType       String   // 'asking', 'sold', 'rent', 'valuation'
  recordedAt      DateTime
  source          String

  metadata        Json?    // Additional context

  property        Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId, recordedAt])
  @@index([recordedAt])
}
```

### 7.4 Background Sync Jobs

#### Job: sync-sales-data

**Purpose**: Daily sync of sold properties for all active suburbs

**Schedule**: Daily at 5 AM AEST

**File**: `/apps/web/inngest/functions/sync-sales-data.ts`

```typescript
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { callMcpTool } from "@/lib/mcp/client";

export const syncSalesData = inngest.createFunction(
  {
    id: "sync-sales-data",
    name: "Sync Sales Data",
    retries: 2,
    concurrency: {
      limit: 5, // Process 5 suburbs concurrently
    },
  },
  { cron: "0 5 * * *" }, // Daily at 5 AM AEST
  async ({ event, step }) => {
    // Get active suburbs (prioritize MVP + user-searched)
    const suburbs = await step.run("fetch-suburbs", async () => {
      return db.suburb.findMany({
        where: {
          OR: [
            { isMvp: true },
            {
              lastSearchedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        orderBy: [{ isMvp: "desc" }, { priority: "asc" }],
      });
    });

    const results = [];

    // Process each suburb
    for (const suburb of suburbs) {
      const result = await step.run(`sync-${suburb.id}`, async () => {
        try {
          // Fetch sold properties from last 7 days
          const dateFrom = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString();

          // Domain
          const domainSales = await callMcpTool("domain", "search_properties", {
            locations: [{ suburb: suburb.name, state: suburb.state }],
            listingType: "Sold",
            soldDateFrom: dateFrom,
            pageSize: 100,
          });

          // REA
          const reaSales = await callMcpTool(
            "realestate",
            "search_properties",
            {
              suburb: suburb.name,
              state: suburb.state,
              listingType: "sold",
              soldDateFrom: dateFrom,
            },
          );

          // Combine and deduplicate
          const allSales = [
            ...(domainSales.data?.listings || []),
            ...(reaSales.data?.results || []),
          ];

          // Upsert to database
          let inserted = 0;
          let updated = 0;

          for (const sale of allSales) {
            const externalId = sale.id || `${sale.address}-${sale.saleDate}`;

            const record = await db.saleRecord.upsert({
              where: {
                externalId_source: {
                  externalId,
                  source: sale.source || "DOMAIN",
                },
              },
              update: {
                salePrice: sale.salePrice,
                saleType: sale.saleType,
                daysOnMarket: sale.daysOnMarket,
                updatedAt: new Date(),
              },
              create: {
                address: sale.address,
                suburb: suburb.name,
                state: suburb.state,
                postcode: suburb.postcode,
                saleDate: new Date(sale.saleDate),
                salePrice: sale.salePrice,
                saleType: sale.saleType || "unknown",
                daysOnMarket: sale.daysOnMarket,
                propertyType: sale.propertyType,
                bedrooms: sale.bedrooms,
                bathrooms: sale.bathrooms,
                carSpaces: sale.carSpaces,
                source: sale.source || "DOMAIN",
                externalId,
                dataQuality: "verified",
              },
            });

            if (record) {
              record.createdAt.getTime() === record.updatedAt.getTime()
                ? inserted++
                : updated++;
            }
          }

          return {
            suburb: suburb.name,
            success: true,
            inserted,
            updated,
            total: inserted + updated,
          };
        } catch (error) {
          console.error(`Sync failed for ${suburb.name}:`, error);
          return {
            suburb: suburb.name,
            success: false,
            error: error.message,
          };
        }
      });

      results.push(result);
    }

    // Trigger recalculation of suburb metrics if new sales were added
    const totalInserted = results.reduce(
      (sum, r) => sum + (r.inserted || 0),
      0,
    );
    if (totalInserted > 0) {
      await step.run("trigger-metric-recalculation", async () => {
        for (const result of results) {
          if (result.inserted > 0) {
            await inngest.send({
              name: "suburb-metrics/calculate",
              data: { suburbId: result.suburb },
            });
          }
        }
      });
    }

    return {
      success: true,
      suburbsProcessed: suburbs.length,
      totalInserted,
      totalUpdated: results.reduce((sum, r) => sum + (r.updated || 0), 0),
      results,
    };
  },
);
```

#### Job: sync-auction-results

**Purpose**: Fetch weekend auction results every Monday

**Schedule**: Monday at 8 AM AEST

**File**: `/apps/web/inngest/functions/sync-auction-results.ts`

```typescript
export const syncAuctionResults = inngest.createFunction(
  {
    id: "sync-auction-results",
    name: "Sync Auction Results",
    retries: 2,
  },
  { cron: "0 8 * * 1" }, // Monday at 8 AM
  async ({ event, step }) => {
    // Get last weekend's date range (Saturday + Sunday)
    const { saturday, sunday } = getLastWeekendDates();

    const suburbs = await step.run("fetch-suburbs", async () => {
      return db.suburb.findMany({ where: { isMvp: true } });
    });

    const results = [];

    for (const suburb of suburbs) {
      const result = await step.run(`sync-auctions-${suburb.id}`, async () => {
        try {
          const response = await callMcpTool("domain", "get_auction_results", {
            suburb: suburb.name,
            state: suburb.state,
            dateFrom: saturday,
            dateTo: sunday,
          });

          if (!response.success || !response.data.auctions) {
            return { suburb: suburb.name, success: true, count: 0 };
          }

          let inserted = 0;

          for (const auction of response.data.auctions) {
            await db.auctionResult.create({
              data: {
                address: auction.address,
                suburb: suburb.name,
                state: suburb.state,
                postcode: suburb.postcode,
                auctionDate: new Date(auction.auctionDate),
                result: auction.result,
                guidePrice: auction.guidePrice,
                soldPrice: auction.soldPrice,
                bidderCount: auction.bidderCount,
                propertyType: auction.propertyType,
                bedrooms: auction.bedrooms,
                bathrooms: auction.bathrooms,
                source: "DOMAIN",
                externalId: auction.id,
              },
            });

            inserted++;
          }

          return {
            suburb: suburb.name,
            success: true,
            count: inserted,
          };
        } catch (error) {
          console.error(`Auction sync failed for ${suburb.name}:`, error);
          return {
            suburb: suburb.name,
            success: false,
            error: error.message,
          };
        }
      });

      results.push(result);
    }

    return {
      success: true,
      weekendDates: { saturday, sunday },
      suburbsProcessed: suburbs.length,
      totalAuctions: results.reduce((sum, r) => sum + (r.count || 0), 0),
      results,
    };
  },
);

function getLastWeekendDates(): { saturday: string; sunday: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Days since last Saturday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const daysSinceSaturday = (dayOfWeek + 1) % 7;

  const lastSaturday = new Date(now);
  lastSaturday.setDate(now.getDate() - daysSinceSaturday - 1);
  lastSaturday.setHours(0, 0, 0, 0);

  const lastSunday = new Date(lastSaturday);
  lastSunday.setDate(lastSaturday.getDate() + 1);

  return {
    saturday: lastSaturday.toISOString(),
    sunday: lastSunday.toISOString(),
  };
}
```

### 7.5 MCP Integration Examples

#### Domain MCP Calls

```typescript
// Get sales history for specific address
const salesHistory = await callMcpTool("domain", "get_sales_history", {
  address: "123 Main St",
  suburb: "Parramatta",
  state: "NSW",
  dateFrom: "2014-01-01",
});

// Search sold properties in suburb
const soldProperties = await callMcpTool("domain", "search_properties", {
  locations: [{ suburb: "Parramatta", state: "NSW" }],
  listingType: "Sold",
  soldDateFrom: "2024-01-01",
  soldDateTo: "2024-01-31",
  pageSize: 50,
});

// Get auction results
const auctions = await callMcpTool("domain", "get_auction_results", {
  suburb: "Parramatta",
  state: "NSW",
  auctionDate: "2024-02-03",
});
```

#### RealEstate MCP Calls

```typescript
// Get comparable sales
const comparables = await callMcpTool("realestate", "get_comparables", {
  address: "123 Main St",
  suburb: "Parramatta",
  state: "NSW",
  radiusKm: 1,
  limit: 10,
  soldDateFrom: "2023-02-01",
});

// Search sold properties
const sold = await callMcpTool("realestate", "search_properties", {
  suburb: "Parramatta",
  state: "NSW",
  listingType: "sold",
  soldDateFrom: "2024-01-01",
});
```

### 7.6 Usage by Agents

#### Researcher Agent

Provides sales context for property and suburb analysis:

```
User: "How's the market in Parramatta?"

Researcher:
1. Calls getSoldProperties('Parramatta', 'NSW', last 3 months)
2. Analyzes: 247 sales, median $980k, avg DOM 26 days
3. Calls getAuctionResults('Parramatta', 'NSW', last weekend)
4. Analyzes: 12 auctions, 75% clearance rate
5. Synthesizes: "Parramatta had 247 sales in the last 3 months with
   a median price of $980k. Properties are selling in 26 days on average,
   and last weekend's auction clearance rate was 75%, indicating strong
   buyer demand."
```

#### Analyst Agent

Uses sales trends for growth projections and risk assessment:

```
User: "Is 123 Main St a good investment?"

Analyst:
1. Calls getSalesHistory('123 Main St', 'Parramatta', 'NSW')
2. Finds: Sold 2018 for $720k, now listed at $1.1M
3. Calculates: 8.8% CAGR over 5 years
4. Calls getSoldProperties('Parramatta', 'NSW') for suburb trend
5. Compares: Property growth (8.8%) vs suburb average (7.2%)
6. Synthesizes: "This property has outperformed the suburb average,
   appreciating at 8.8% p.a. vs 7.2% suburb-wide. Strong historical
   performance suggests continued growth potential."
```

### 7.7 Data Quality & Validation

**Deduplication strategy**:

- Match by address normalization (remove unit numbers, standardize street types)
- Prefer records with more complete data (price, date, property details)
- Flag duplicates for manual review if price differs >10%

**Validation rules**:

- Sale price must be >$50k and <$50M (flag outliers)
- Sale date must be in past
- Days on market must be ≥0 and <1000
- Bedrooms/bathrooms must be >0 and <20

**Completeness tracking**:

```typescript
interface SuburbDataHealth {
  suburb: string;
  salesLast12Months: number;
  medianPrice: number | null;
  dataQuality: "excellent" | "good" | "fair" | "poor";
  lastSyncAt: Date;
  issues: string[];
}

async function assessSuburbDataHealth(
  suburbId: string,
): Promise<SuburbDataHealth> {
  const suburb = await db.suburb.findUnique({
    where: { id: suburbId },
    include: {
      salesRecords: {
        where: {
          saleDate: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
    },
  });

  const issues: string[] = [];
  let quality: "excellent" | "good" | "fair" | "poor";

  const salesCount = suburb.salesRecords.length;

  if (salesCount < 20) issues.push("Insufficient sales data");
  if (!suburb.medianSalePrice) issues.push("No median price calculated");
  if (
    suburb.scoreUpdatedAt &&
    Date.now() - suburb.scoreUpdatedAt.getTime() > 14 * 24 * 60 * 60 * 1000
  ) {
    issues.push("Scores stale");
  }

  if (issues.length === 0 && salesCount >= 50) quality = "excellent";
  else if (issues.length <= 1 && salesCount >= 30) quality = "good";
  else if (issues.length <= 2 && salesCount >= 20) quality = "fair";
  else quality = "poor";

  return {
    suburb: suburb.name,
    salesLast12Months: salesCount,
    medianPrice: suburb.medianSalePrice,
    dataQuality: quality,
    lastSyncAt: suburb.updatedAt,
    issues,
  };
}
```

**Monitoring dashboard**:

- Track sales sync job success rate (>95% target)
- Alert if suburb has <20 sales in last 12 months
- Monitor data freshness (sales should be <7 days old)
- Track MCP API error rates

---

## Appendices

### Appendix A: Quick Reference Table

Complete index of all tools, functions, and files referenced in this guide.

| Component                     | File Location                                              | Purpose                                               | Section  |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- | -------- |
| **ABS Scraper**               | `/packages/mcp-market-data/src/sources/abs-scraper.ts`     | ABS Census demographics (web scraping)                | 1.1, 1.4 |
| **ABS API**                   | `/packages/mcp-market-data/src/sources/abs-api.ts`         | ABS Building Approvals & SA2 geocoding (official API) | 1.2, 5.3 |
| **RBA API**                   | `/packages/mcp-market-data/src/sources/rba-api.ts`         | RBA data integration                                  | 5.3      |
| **Financial Tools**           | `/apps/web/lib/tools/financialTools.ts`                    | Cash flow & ROI calculations                          | 2.1      |
| **Property Search Tools**     | `/apps/web/lib/tools/propertySearchTools.ts`               | Domain/REA property search                            | 3.3      |
| **Sales Tools**               | `/apps/web/lib/tools/salesTools.ts`                        | Sales history & auction data                          | 7.2      |
| **Market Tools**              | `/apps/web/lib/tools/marketTools.ts`                       | Market indicators retrieval                           | 5.2      |
| **MCP Client**                | `/apps/web/lib/mcp/client.ts`                              | MCP HTTP client with retry logic                      | 3.3      |
| **Strategist Agent**          | `/apps/web/lib/agents/strategist.ts`                       | Strategy discovery agent                              | 3.2      |
| **Researcher Agent**          | `/apps/web/lib/agents/researcher.ts`                       | Property search agent                                 | 3.3      |
| **Analyst Agent**             | `/apps/web/lib/agents/analyst.ts`                          | Financial analysis agent                              | 3.4      |
| **Calculate Suburb Metrics**  | `/apps/web/inngest/functions/calculate-suburb-metrics.ts`  | Suburb scoring job                                    | 6.4      |
| **Refresh Market Indicators** | `/apps/web/inngest/functions/refresh-market-indicators.ts` | Market data sync job                                  | 5.2      |
| **Sync Domain Listings**      | `/apps/web/inngest/functions/sync-domain-listings.ts`      | Property listings sync                                | 4.4      |
| **Sync Sales Data**           | `/apps/web/inngest/functions/sync-sales-data.ts`           | Sales records sync                                    | 7.4      |
| **Sync Auction Results**      | `/apps/web/inngest/functions/sync-auction-results.ts`      | Auction data sync                                     | 7.4      |
| **Database Schema**           | `/packages/db/prisma/schema.prisma`                        | PostgreSQL schema definitions                         | Multiple |
| **MVP Suburbs Config**        | `/config/mvp-suburbs.json`                                 | 50 MVP suburbs list                                   | 4.7      |
| **Seed MVP Suburbs Script**   | `/scripts/seed-mvp-suburbs.ts`                             | Database seeding script                               | 4.5      |

### Appendix B: Database Schema Reference

#### Complete Schema for Data Integration

```prisma
// /packages/db/prisma/schema.prisma

// ============================================================================
// CORE MODELS
// ============================================================================

model Suburb {
  id                  String   @id @default(cuid())
  name                String
  state               String
  postcode            String

  // Geographic
  latitude            Decimal? @db.Decimal(10, 8)
  longitude           Decimal? @db.Decimal(11, 8)
  cbdDistanceKm       Decimal? @db.Decimal(5, 2)

  // Basic metrics
  medianSalePrice     Decimal? @db.Decimal(12, 2)
  medianWeeklyRent    Decimal? @db.Decimal(8, 2)
  grossYield          Decimal? @db.Decimal(5, 2)

  // Cash flow indicators
  daysOnMarket        Int?
  vacancyRate         Decimal? @db.Decimal(5, 2)
  rentalGrowthYoY     Decimal? @db.Decimal(5, 2)
  stockRatio          Decimal? @db.Decimal(6, 4)
  rentIncomeRatio     Decimal? @db.Decimal(5, 2)

  // Capital growth indicators
  priceGrowth3yr      Decimal? @db.Decimal(5, 2)
  incomeGrowth        Decimal? @db.Decimal(5, 2)
  infrastructureScore Int?
  professionalPct     Decimal? @db.Decimal(5, 2)
  auctionClearance    Decimal? @db.Decimal(5, 2)

  // Demographics - Basic (from ABS Census)
  totalPopulation     Int?
  medianAge           Int?
  totalDwellings      Int?
  occupiedDwellings   Int?
  unoccupiedDwellings Int?

  // Demographics - Income & Financial
  medianWeeklyPersonalIncome    Decimal? @db.Decimal(8, 2)
  medianWeeklyHouseholdIncome   Decimal? @db.Decimal(8, 2)
  medianWeeklyFamilyIncome      Decimal? @db.Decimal(8, 2)
  medianMonthlyMortgage         Decimal? @db.Decimal(8, 2)
  medianWeeklyIncome            Decimal? @db.Decimal(8, 2)  // Backward compatibility

  // Demographics - Education (percentages)
  educationBachelorDegree       Decimal? @db.Decimal(5, 2)
  educationAdvancedDiploma      Decimal? @db.Decimal(5, 2)
  educationYear12               Decimal? @db.Decimal(5, 2)
  educationNoSchool             Decimal? @db.Decimal(5, 2)

  // Demographics - Cultural (stored as JSON arrays)
  ancestryTop                   Json?  // Array of { ancestry: string, percentage: number }
  religionTop                   Json?  // Array of { religion: string, percentage: number }
  languageAtHomeTop             Json?  // Array of { language: string, percentage: number }
  englishOnlyPercentage         Decimal? @db.Decimal(5, 2)

  // Demographics - Labour Force
  labourForceParticipationRate  Decimal? @db.Decimal(5, 2)
  employmentToPopulationRatio   Decimal? @db.Decimal(5, 2)
  unemploymentRate              Decimal? @db.Decimal(5, 2)
  notInLabourForcePercentage    Decimal? @db.Decimal(5, 2)
  employedFullTime              Decimal? @db.Decimal(5, 2)
  employedPartTime              Decimal? @db.Decimal(5, 2)

  // Demographics - Occupation (percentages)
  occupationTop                 Json?  // Array of { occupation: string, percentage: number }
  professionalPct               Decimal? @db.Decimal(5, 2)
  managersPercentage            Decimal? @db.Decimal(5, 2)
  techniciansPercentage         Decimal? @db.Decimal(5, 2)
  labourersPercentage           Decimal? @db.Decimal(5, 2)

  // Demographics - Family Employment
  coupleBothEmployed            Decimal? @db.Decimal(5, 2)
  coupleOneEmployed             Decimal? @db.Decimal(5, 2)
  coupleNeitherEmployed         Decimal? @db.Decimal(5, 2)

  // Demographics - Dwelling Structure (percentages)
  dwellingSeparateHouse         Decimal? @db.Decimal(5, 2)
  dwellingSemiDetached          Decimal? @db.Decimal(5, 2)
  dwellingApartment             Decimal? @db.Decimal(5, 2)
  dwellingOther                 Decimal? @db.Decimal(5, 2)

  // Demographics - Bedroom Distribution (percentages)
  bedroomNone                   Decimal? @db.Decimal(5, 2)
  bedroomOne                    Decimal? @db.Decimal(5, 2)
  bedroomTwo                    Decimal? @db.Decimal(5, 2)
  bedroomThree                  Decimal? @db.Decimal(5, 2)
  bedroomFourPlus               Decimal? @db.Decimal(5, 2)

  // Demographics - Tenure Type (percentages)
  tenureOwned                   Decimal? @db.Decimal(5, 2)
  tenureMortgaged               Decimal? @db.Decimal(5, 2)
  tenureRented                  Decimal? @db.Decimal(5, 2)
  tenureOther                   Decimal? @db.Decimal(5, 2)
  ownerOccupiedPct              Decimal? @db.Decimal(5, 2)  // Backward compatibility
  rentedPct                     Decimal? @db.Decimal(5, 2)  // Backward compatibility

  // Demographics - Income/Rent/Mortgage Distributions (stored as JSON)
  householdIncomeDistribution   Json?  // Distribution buckets
  rentPaymentDistribution       Json?  // Distribution buckets
  mortgageRepaymentDistribution Json?  // Distribution buckets

  // Census metadata
  censusYear                    Int?      // e.g., 2021
  censusDataUpdatedAt           DateTime?

  // Scores
  cashFlowScore       Int?
  capitalGrowthScore  Int?
  overallScore        Int?
  scoreUpdatedAt      DateTime?

  // MVP config
  isMvp               Boolean @default(false)
  priority            Int?
  strategyFocus       String? // 'cash_flow', 'capital_growth', 'mixed'

  // Tracking
  lastSearchedAt      DateTime?
  viewCount           Int     @default(0)

  // Relationships
  properties          Property[]
  salesRecords        SaleRecord[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([name, state, postcode])
  @@index([state])
  @@index([cashFlowScore])
  @@index([capitalGrowthScore])
  @@index([overallScore])
  @@index([isMvp])
}

model Property {
  id                  String   @id @default(cuid())

  // Location
  address             String
  suburb              String
  state               String
  postcode            String
  suburbId            String?

  // Property details
  propertyType        String   // 'House', 'Apartment', 'Townhouse', etc.
  bedrooms            Int
  bathrooms           Int
  carSpaces           Int?
  landArea            Int?     // sqm
  floorArea           Int?     // sqm

  // Listing
  listingType         String   // 'sale', 'rent'
  listingStatus       String   // 'active', 'sold', 'rented', 'withdrawn'
  price               Decimal? @db.Decimal(12, 2)
  weeklyRent          Decimal? @db.Decimal(8, 2)
  daysOnMarket        Int?

  // External IDs
  domainId            String?
  realestateId        String?

  // Metadata
  description         String?  @db.Text
  features            Json?
  images              Json?

  // Relationships
  suburbRelation      Suburb?        @relation(fields: [suburbId], references: [id])
  salesRecords        SaleRecord[]
  priceHistory        PriceHistory[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([suburb, state])
  @@index([listingType, listingStatus])
  @@index([domainId])
  @@index([realestateId])
}

model SaleRecord {
  id              String   @id @default(cuid())

  // Property identification
  address         String
  suburb          String
  state           String
  postcode        String
  propertyId      String?

  // Sale details
  saleDate        DateTime
  salePrice       Decimal  @db.Decimal(12, 2)
  saleType        String   // 'auction', 'private_treaty', 'tender'
  daysOnMarket    Int?

  // Property details
  propertyType    String?
  bedrooms        Int?
  bathrooms       Int?
  carSpaces       Int?
  landArea        Int?

  // Data source
  source          String
  externalId      String?
  dataQuality     String?  // 'verified', 'estimated', 'scraped'

  // Relationships
  property        Property? @relation(fields: [propertyId], references: [id])
  suburbRelation  Suburb?   @relation(fields: [suburb, state, postcode], references: [name, state, postcode])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([externalId, source])
  @@index([suburb, state])
  @@index([saleDate])
  @@index([propertyId])
}

model AuctionResult {
  id              String   @id @default(cuid())

  // Property
  address         String
  suburb          String
  state           String
  postcode        String

  // Auction details
  auctionDate     DateTime
  result          String   // 'sold_at_auction', 'sold_before', 'passed_in', 'withdrawn'
  guidePrice      Decimal? @db.Decimal(12, 2)
  soldPrice       Decimal? @db.Decimal(12, 2)
  bidderCount     Int?
  auctioneerName  String?

  // Property details
  propertyType    String?
  bedrooms        Int?
  bathrooms       Int?

  // Source
  source          String
  externalId      String?

  createdAt       DateTime @default(now())

  @@index([suburb, state, auctionDate])
  @@index([auctionDate])
}

model PriceHistory {
  id              String   @id @default(cuid())
  propertyId      String

  price           Decimal  @db.Decimal(12, 2)
  priceType       String   // 'asking', 'sold', 'rent', 'valuation'
  recordedAt      DateTime
  source          String

  metadata        Json?

  property        Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId, recordedAt])
  @@index([recordedAt])
}

model MarketIndicator {
  id            String   @id @default(cuid())

  // Indicator identification
  indicatorType String   // 'cash_rate', 'building_approvals', 'unemployment', etc.
  geography     String   // 'national', 'NSW', 'VIC', etc.

  // Value
  value         Float
  unit          String   // '%', 'count', 'AUD', 'index'

  // Metadata
  recordedAt    DateTime
  source        String   // 'RBA', 'ABS', 'calculated'
  metadata      Json?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([indicatorType, geography, recordedAt])
  @@index([indicatorType, geography])
  @@index([recordedAt])
}

// ============================================================================
// USER & STRATEGY MODELS
// ============================================================================

model UserProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique // From Clerk

  // Financial
  budget              Decimal? @db.Decimal(12, 2)
  deposit             Decimal? @db.Decimal(12, 2)

  // Preferences
  timeline            String?  // 'short', 'medium', 'long'
  riskTolerance       String?  // 'low', 'medium', 'high'
  investmentGoal      String?  // 'passive_income', 'wealth_building', etc.
  preferredLocations  String[] // Suburbs or regions
  propertyType        String[] // Property types

  // Current portfolio
  currentPortfolio    Json?

  // Completeness
  profileCompleteness Float   @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
}

model StrategyRecommendation {
  id                  String   @id @default(cuid())
  userId              String

  // Recommendation
  strategyType        String   // 'CASH_FLOW', 'CAPITAL_GROWTH', etc.
  confidence          Float    // 0-1
  reasons             String[] // Human-readable rationale
  alternativeStrategies String[]

  // Metadata
  recommendedAt       DateTime @default(now())
  accepted            Boolean  @default(false)

  @@index([userId])
  @@index([recommendedAt])
}
```

### Appendix C: Glossary of Terms

**ABS (Australian Bureau of Statistics)**

- National statistical agency providing census, demographic, and economic data
- Key data source for population, income, employment indicators
- Updates: Census every 5 years, monthly/quarterly for economic indicators

**CAGR (Compound Annual Growth Rate)**

- Measure of annualized growth rate: ((End Value / Start Value) ^ (1 / Years)) - 1
- Used to calculate property price growth over multi-year periods
- Example: $720k → $950k over 5 years = 5.7% CAGR

**Capital Growth**

- Increase in property value over time (price appreciation)
- Primary goal for wealth-building investment strategies
- Typically measured as 3-year or 5-year CAGR

**Cash Flow**

- Net income from property after all expenses
- Formula: Rental Income - (Interest + Management + Rates + Insurance + Maintenance)
- Positive cash flow = property generates income, Negative = costs exceed income

**CGT (Capital Gains Tax)**

- Tax on profit from property sale
- 50% discount if held > 12 months
- Calculated on profit after selling costs

**Gross Yield**

- Annual rental income as percentage of property price
- Formula: (Weekly Rent × 52 / Purchase Price) × 100
- Example: $600/week rent on $750k property = 4.16% gross yield

**LVR (Loan-to-Value Ratio)**

- Loan amount as percentage of property value
- Formula: (Loan Amount / Property Value) × 100
- Example: $600k loan on $750k property = 80% LVR

**MCP (Model Context Protocol)**

- Protocol for LLMs to access external tools and data sources
- Propure uses MCP servers for Domain, RealEstate, and market data
- Enables AI agents to fetch real-time property and market information

**Negative Gearing**

- Investment property with negative cash flow
- Losses offset against taxable income (tax benefit)
- Common Australian strategy relying on capital growth

**Net Yield**

- Rental yield after expenses (more accurate than gross yield)
- Formula: (Annual Rent - Annual Expenses) / Purchase Price × 100
- Typically 2-3% lower than gross yield

**RBA (Reserve Bank of Australia)**

- Central bank setting official cash rate (interest rate)
- Directly impacts mortgage rates and property affordability
- Meets first Tuesday of each month (except January)

**ROI (Return on Investment)**

- Total profit as percentage of initial investment (deposit)
- Includes both capital growth and cash flow accumulation
- Example: $150k deposit generating $151k profit = 101% ROI (annualized: 7.2% over 10 years)

**SA2 (Statistical Area Level 2)**

- ABS geographic unit representing suburbs or neighborhoods
- Used for census and demographic data aggregation
- Typically covers 3,000-25,000 people

**Vacancy Rate**

- Percentage of rental properties currently vacant
- Low vacancy (<2%) = tenant's market, High vacancy (>5%) = landlord's market
- Key indicator for cash flow strategy

**Vercel AI SDK**

- Framework for building AI applications with LLMs
- Propure uses it for multi-agent orchestration with Gemini
- Provides `tool()` function for agent tool schemas

**Zod**

- TypeScript schema validation library
- Used for defining tool parameters and ensuring type safety
- Enables runtime validation of AI agent tool calls

### Appendix D: Related Documentation

**Internal Propure Documentation**:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full system architecture overview
- [AI-AGENTS.md](./AI-AGENTS.md) - Complete AI agent tool schemas and workflows
- [DATA-INDICATORS.md](./DATA-INDICATORS.md) - National/city/suburb/property data hierarchy
- [STRATEGY.md](./STRATEGY.md) - Product strategy and user journeys
- [TECH-STACK-ANALYSIS.md](./TECH-STACK-ANALYSIS.md) - Technology decision rationale
- [EXISTING-IMPLEMENTATION-ANALYSIS.md](./EXISTING-IMPLEMENTATION-ANALYSIS.md) - Current codebase analysis
- [LINEAR-ISSUE-UPDATES.md](./LINEAR-ISSUE-UPDATES.md) - PRO-17, PRO-18, PRO-19, PRO-24, PRO-25 issue tracking
- [CLAUDE.md](../CLAUDE.md) - Project overview and development guidelines

**External API Documentation**:

- **ABS**: https://www.abs.gov.au/ - Australian Bureau of Statistics
  - Census data: https://www.abs.gov.au/census
  - DataBuilder: https://www.abs.gov.au/statistics/microdata-tablebuilder/tablebuilder
- **RBA**: https://www.rba.gov.au/statistics/ - Reserve Bank of Australia
  - Cash rate history: https://www.rba.gov.au/statistics/cash-rate/
  - Lending indicators: https://www.rba.gov.au/statistics/tables/
- **Domain**: https://developer.domain.com.au/ - Property listings API
  - Search API, property details, sales history
- **RealEstate.com.au**: No public API documentation (access via MCP)
- **CoreLogic**: https://www.corelogic.com.au/ - Property data (commercial)

**Framework Documentation**:

- **Vercel AI SDK**: https://sdk.vercel.ai/docs
  - Agents: https://sdk.vercel.ai/docs/ai-sdk-core/agents
  - Tools: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **Inngest**: https://www.inngest.com/docs
  - Workflows: https://www.inngest.com/docs/guides/multi-step-workflows
  - Scheduling: https://www.inngest.com/docs/guides/scheduled-functions
- **Prisma**: https://www.prisma.io/docs
  - Schema: https://www.prisma.io/docs/concepts/components/prisma-schema
  - Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Zod**: https://zod.dev/
  - Schema validation: https://zod.dev/?id=primitives

**Australian Property Market Resources**:

- **Domain Reports**: https://www.domain.com.au/research/ - Quarterly market reports
- **SQM Research**: https://sqmresearch.com.au/ - Vacancy rates, listings data
- **PropTrack (REA)**: https://www.realestate.com.au/insights/ - Market insights
- **CoreLogic Research**: https://www.corelogic.com.au/research - Property reports

---

## Document Metadata

**Version**: 1.0
**Last Updated**: 2024-02-03
**Author**: Technical Documentation Team
**Status**: Complete

**Change Log**:

- 2024-02-03: Initial comprehensive guide created covering all 7 questions

**Next Steps**:

1. Review with engineering team for technical accuracy
2. Validate code examples against actual implementations
3. Create implementation tickets for Phase 1 (Basic Cash Flow Scoring)
4. Set up monitoring dashboard for data quality tracking
5. Document API rate limits and cost estimates

**Feedback**:
For questions or suggestions about this guide, please:

- Open a Linear issue with tag `documentation`
- Update this document directly via PR
- Discuss in #engineering Slack channel

---

**END OF DOCUMENT**
