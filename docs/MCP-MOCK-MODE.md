# MCP Mock Mode Guide

This document explains how to use Mock Mode for testing the MCP (Model Context Protocol) servers without requiring Oxylabs credentials or making real API calls.

## Overview

Mock Mode provides realistic Australian property and market data for:
- **UI Development** - Build and test interfaces without API costs
- **Integration Testing** - Test AI agent workflows end-to-end
- **Demos** - Showcase the platform without live data dependencies
- **CI/CD Pipelines** - Run automated tests without external services

## Enabling Mock Mode

### Option 1: Environment Variable (Recommended for Development)

```bash
# Start the dev server with mock mode
MCP_MOCK_MODE=true pnpm dev
```

### Option 2: Add to `.env.local`

```bash
# .env.local
MCP_MOCK_MODE=true
```

### Option 3: Per-Command

```bash
MCP_MOCK_MODE=true curl -X POST http://localhost:3000/api/mcp/domain ...
```

## Available Mock Data

### Domain MCP (`/api/mcp/domain`)

15 property listings across Australia with varied data:

| Suburb | State | Property Type | Price Range | Features |
|--------|-------|---------------|-------------|----------|
| Bellevue Hill | NSW | House | $8.5-9.2M | Luxury, harbour views, 5 bed |
| Petersham | NSW | House | $1.65-1.75M | Victorian terrace, 4 bed |
| Liverpool | NSW | House | $895K | Investment, 3 bed |
| Fitzroy | VIC | Townhouse | $1.45-1.55M | Inner city, 3 bed |
| Brighton | VIC | House | $4.5-5M | Beachside, 5 bed |
| Brisbane CBD | QLD | Apartment | $720K | River views, 2 bed |
| Springfield | QLD | House | $685K | Growth area, 4 bed |
| Scarborough | WA | House | $1.25-1.35M | Beach lifestyle, 4 bed |
| Unley | SA | House | $1.1-1.2M | Character home, 4 bed |
| Adelaide CBD | SA | Apartment | $340K | Investment, 1 bed |
| Battery Point | TAS | House | $1.75-1.9M | Heritage, 4 bed |
| Forrest | ACT | House | $3.5-4M | Prestigious, 5 bed |
| Fannie Bay | NT | House | $1.45M | Tropical, 4 bed |
| Surfers Paradise | QLD | Apartment | $2.15M | Beachfront, 3 bed |
| Newcastle | NSW | Townhouse | $820-880K | Inner city, 3 bed |

**Additional Mock Data:**
- Suburb statistics for all 15 suburbs (median price, yield, days on market, growth)
- Sales history for select addresses
- Agent information (3 sample agents with ratings)
- Auction results for 5 suburbs

### RealEstate MCP (`/api/mcp/realestate`)

15 different property listings (no overlap with Domain):

| Suburb | State | Property Type | Price Range | Features |
|--------|-------|---------------|-------------|----------|
| Bondi Beach | NSW | Apartment | $1.85-2M | Beach lifestyle, 2 bed |
| St Kilda | VIC | Apartment | $780-820K | Bayside, 2 bed |
| Paddington | NSW | House | $3.2-3.5M | Terrace, 4 bed |
| New Farm | QLD | House | $2.1-2.3M | Queenslander, 4 bed |
| South Yarra | VIC | Townhouse | $1.65-1.8M | Luxury, 3 bed |
| Manly | NSW | House | $4.8-5.2M | Beachside, 5 bed |
| Fremantle | WA | House | $1.35-1.45M | Heritage, 3 bed |
| Glenelg | SA | Apartment | $620-680K | Beachfront, 2 bed |
| Newtown | NSW | House | $1.95-2.1M | Inner west, 3 bed |
| Northcote | VIC | House | $1.55-1.7M | Family home, 4 bed |
| Bulimba | QLD | House | $1.85-2M | Riverfront, 4 bed |
| Coogee | NSW | Unit | $1.1-1.2M | Beach, 2 bed |
| Cottesloe | WA | House | $3.8-4.2M | Premium beach, 4 bed |
| Hawthorn | VIC | House | $2.9-3.2M | Prestigious, 5 bed |
| Burleigh Heads | QLD | Apartment | $1.25-1.4M | Beachfront, 3 bed |

**Additional Mock Data:**
- Suburb profiles with demographics
- Sold property records
- Agency listings

### Market Data MCP (`/api/mcp/market`)

Real 2024 Australian economic figures:

**RBA Interest Rates:**
```json
{
  "cashRate": {
    "current": 4.35,
    "effectiveDate": "2023-11-07",
    "historical": [/* 19 rate changes back to 2019 */]
  },
  "lendingRates": {
    "standardVariable": 6.27,
    "fixed1Year": 5.89,
    "fixed2Year": 5.69,
    "fixed3Year": 5.79,
    "fixed5Year": 5.99
  }
}
```

**Economic Indicators:**
```json
{
  "gdpGrowth": 1.5,
  "inflation": 3.5,
  "unemployment": 4.1,
  "wageGrowth": 4.2,
  "consumerConfidence": 82.5,
  "businessConfidence": 1.2
}
```

**Demographics** (16 suburbs across 5 cities):
- Sydney: Parramatta, Chatswood, Blacktown, Bondi
- Melbourne: Richmond, Box Hill, Footscray, South Yarra
- Brisbane: Fortitude Valley, Chermside, Indooroopilly, South Brisbane
- Perth: Fremantle, Joondalup
- Adelaide: Glenelg, Norwood

**Building Approvals:**
- Monthly data for all 8 states/territories
- Seasonal variation included
- Total dwellings, houses, and apartments breakdown

**Population Projections:**
- Current population by state
- Projections for 2030 and 2040
- Growth rates

## Testing Examples

### 1. Health Check

```bash
# Check all MCP endpoints are running
curl http://localhost:3000/api/mcp/domain
curl http://localhost:3000/api/mcp/realestate
curl http://localhost:3000/api/mcp/market
```

Expected response:
```json
{
  "server": "propure-domain",
  "version": "1.0.0",
  "status": "healthy",
  "tools": ["search_properties", "get_property_details", ...]
}
```

### 2. Search Properties

**Domain:**
```bash
curl -X POST http://localhost:3000/api/mcp/domain \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_properties",
    "arguments": {
      "suburbs": ["Petersham"],
      "state": "NSW",
      "listingType": "sale",
      "pageSize": 10
    }
  }'
```

**RealEstate:**
```bash
curl -X POST http://localhost:3000/api/mcp/realestate \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_properties",
    "arguments": {
      "suburbs": ["Bondi Beach"],
      "state": "NSW",
      "listingType": "sale"
    }
  }'
```

### 3. Get Suburb Statistics

```bash
curl -X POST http://localhost:3000/api/mcp/domain \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_suburb_stats",
    "arguments": {
      "suburb": "Bellevue Hill",
      "state": "NSW",
      "postcode": "2023"
    }
  }'
```

### 4. Get Market Data

**RBA Rates:**
```bash
curl -X POST http://localhost:3000/api/mcp/market \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_rba_rates",
    "arguments": {
      "includeHistorical": true,
      "includeLendingRates": true
    }
  }'
```

**Economic Indicators:**
```bash
curl -X POST http://localhost:3000/api/mcp/market \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_economic_indicators",
    "arguments": {}
  }'
```

**Demographics:**
```bash
curl -X POST http://localhost:3000/api/mcp/market \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_abs_demographics",
    "arguments": {
      "suburb": "Parramatta",
      "state": "NSW"
    }
  }'
```

### 5. Using the MCP Client (TypeScript)

```typescript
import { domainTools, realestateTools, marketTools } from "@/lib/mcp/client";

async function testMockMode() {
  // Search Domain listings
  const domainListings = await domainTools.searchProperties({
    suburbs: ["Fitzroy"],
    state: "VIC",
    listingType: "sale",
    pageSize: 5,
  });
  console.log("Domain listings:", domainListings);

  // Search RealEstate listings
  const reaListings = await realestateTools.searchProperties({
    suburbs: ["St Kilda"],
    state: "VIC",
    listingType: "sale",
  });
  console.log("REA listings:", reaListings);

  // Get RBA rates
  const rates = await marketTools.getRbaRates(true, true);
  console.log("Cash rate:", rates.cashRate.current);

  // Get demographics
  const demographics = await marketTools.getAbsDemographics(
    "Parramatta",
    undefined,
    "NSW"
  );
  console.log("Population:", demographics.population);
}
```

### 6. Testing with JSON-RPC Protocol

```bash
# List available tools
curl -X POST http://localhost:3000/api/mcp/domain \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Call a tool
curl -X POST http://localhost:3000/api/mcp/domain \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_properties",
      "arguments": {
        "state": "NSW",
        "listingType": "sale"
      }
    },
    "id": 2
  }'
```

## Mock Data Structure

### PropertyListing

```typescript
interface PropertyListing {
  externalId: string;           // e.g., "domain-mock-1"
  address: {
    displayAddress: string;     // "123 Example St, Suburb NSW 2000"
    suburb: string;
    state: string;
    postcode: string;
    latitude: number;
    longitude: number;
  };
  listingType: "sale" | "rent" | "sold";
  priceDisplay: string;         // "$1,500,000 - $1,600,000"
  priceValue?: number;          // 1550000
  features: {
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    propertyType: string;       // "house", "apartment", etc.
    landSize?: number;
    buildingSize?: number;
    features?: string[];        // ["Pool", "Air Conditioning", ...]
  };
  description: string;
  images: string[];             // Placeholder image URLs
  sourceUrl: string;
  agent?: {
    name: string;
    phone: string;
    agency: string;
  };
}
```

### SuburbStats

```typescript
interface SuburbStats {
  suburb: string;
  state: string;
  postcode: string;
  medianPrice: number;
  medianRent: number;
  grossYield: number;           // Percentage
  daysOnMarket: number;
  annualGrowth: number;         // Percentage
  fiveYearGrowth: number;       // Percentage
  totalListings: number;
  auctionClearanceRate?: number;
}
```

## Filtering Mock Data

Mock data supports filtering by:

- **suburbs** - Array of suburb names (partial match)
- **state** - Australian state code (NSW, VIC, QLD, etc.)
- **listingType** - sale, rent, or sold
- **minPrice / maxPrice** - Price range
- **minBeds / maxBeds** - Bedroom count
- **propertyTypes** - Array of property types

Example:
```bash
curl -X POST http://localhost:3000/api/mcp/domain \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_properties",
    "arguments": {
      "state": "NSW",
      "minPrice": 1000000,
      "maxPrice": 2000000,
      "minBeds": 3,
      "propertyTypes": ["house", "townhouse"]
    }
  }'
```

## Adding Custom Mock Data

To add more mock data, edit the respective files:

| Package | File |
|---------|------|
| Domain | `packages/mcp-domain/src/scrapers/mock-data.ts` |
| RealEstate | `packages/mcp-realestate/src/scrapers/mock-data.ts` |
| Market Data | `packages/mcp-market-data/src/sources/mock-data.ts` |

Follow the existing patterns for data structure consistency.

## Switching Between Mock and Real Data

| Mode | MCP_MOCK_MODE | OXYLABS_* | Behavior |
|------|---------------|-----------|----------|
| Mock | `true` | Not needed | Returns mock data |
| Real | `false` or unset | Required | Calls Oxylabs API |

**Important:** In production, ensure `MCP_MOCK_MODE` is not set or is `false`.

## Troubleshooting

### Mock data not returning

1. Check `MCP_MOCK_MODE=true` is set correctly
2. Restart the dev server after changing environment variables
3. Check console logs for any errors

### Empty results

Mock data only includes specific suburbs. If searching for a suburb not in the mock data, results will be empty. Check the tables above for available suburbs.

### Type errors

Ensure you're using the correct argument names and types. Refer to the schemas in `packages/mcp-shared/src/schemas/index.ts`.

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [AI-AGENTS.md](./AI-AGENTS.md) - AI agent architecture and tools
- [DATA-INDICATORS.md](./DATA-INDICATORS.md) - Market data definitions
