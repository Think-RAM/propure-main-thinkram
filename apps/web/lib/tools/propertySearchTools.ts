import { ChatMessageAI } from "@/types/ai";
import { ListingType, PropertyType } from "@propure/convex";
import { client } from "@propure/convex/client";
import { api, Doc } from "@propure/convex/genereated";
import { tool, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { addressToCoordinatesGoogle, GeocodeResult } from "../map/geoEncoding";
import { ListingData } from "../utils";


function calculateMedianPrice(
  comparables: Doc<"properties">[],
): number | null {
  const prices = comparables
    .map((c) => c.priceValue)
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  const mid = Math.floor(prices.length / 2);

  return prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];
}

export const searchProperties = (dataStream: UIMessageStreamWriter<ChatMessageAI>) => tool({
  description:
    "Search for properties on Domain.com.au with filters for location, price, type, etc.",
  inputSchema: z.object({
    locations: z
      .array(
        z.object({
          suburb: z.string(),
          state: z.string(),
          postcode: z.string().optional(),
        }),
      )
      .describe("Suburbs to search"),
    listingType: z.enum(["sale", "rent", "sold"]).default("sale"),
    propertyTypes: z
      .array(z.enum(["house", "apartment", "unit", "townhouse", "villa", "land", "rural", "commercial", "industrial", "other"]))
      .optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBedrooms: z.number().optional(),
    maxBedrooms: z.number().optional(),
    minBathrooms: z.number().optional(),
    minCarSpaces: z.number().optional(),
    page: z.number().default(1),
    pageSize: z.number().max(100).default(20),
  }),
  execute: async (params) => {
    try {
      const properties = await client.query(api.functions.properties.fetchProperties, {
        locations: params.locations,
        listingType: params.listingType as ListingType,
        propertyTypes: params.propertyTypes as PropertyType[] | undefined,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minBedrooms: params.minBedrooms,
        maxBedrooms: params.maxBedrooms,
        minBathrooms: params.minBathrooms,
        minCarSpaces: params.minCarSpaces,
        page: params.page,
        pageSize: params.pageSize,
      });

      // From all the locations calculate the center point to show on the map
      const geocodes = (
        await Promise.all(
          params.locations.map((loc) => {
            const suburb = `${loc.suburb}, ${loc.state} ${loc.postcode ?? ""}`.trim();
            return addressToCoordinatesGoogle(suburb);
          }),
        )
      ).filter((g) => g !== null);

      dataStream.write({
        type: "data-properties-found",
        data: {
          count: properties.total,
          suburb: {
            name: "Center Point",
            latLng: await calculateMapCenter(geocodes),
          },
          listings: properties.data.map((p) => ({
            title: p.headline ?? p.address.displayAddress,
            address: p.address.displayAddress,
            suburb: p.address.suburb,
            state: p.address.state,
            postcode: p.address.postcode,
            latLng: {
              lat: p.address.latitude!,
              lng: p.address.longitude!,
            },
            priceText: p.price ? `$${p.price.toLocaleString()}` : `${p.priceFrom ? `$${p.priceFrom.toLocaleString()}+` : "N/A"}`,
            beds: p.features?.bedrooms,
            baths: p.features?.bathrooms,
            cars: p.features?.parkingSpaces,
            url: p.sourceUrl!,
            website: p.source!,
            listedAt: p.listedDate ? new Date(p.listedDate).toISOString() : undefined,
            externalId: p.externalId,
          } satisfies ListingData)),
        },
      });

      return {
        success: true,
        properties: properties.data,
        totalResults: properties.total,
        page: params.page,
        hasMore: properties.totalPages > params.page,
      };
    } catch (error) {
      console.error("Property search failed:", error);
      return {
        success: false,
        error: "Property search unavailable",
      };
    }
  },
});

export const getPropertyDetails = tool({
  description: "Get detailed information about a specific property",
  inputSchema: z.object({
    propertyId: z.string().optional().describe("Property ID from source"),
    address: z.string().optional().describe("Property address (if ID unknown)"),
    suburb: z.string().optional(),
    state: z.string().optional(),
  }),
  execute: async ({ propertyId, address, suburb, state }) => {
    try {
      if (!propertyId && !address) {
        return {
          success: false,
          error: "Must provide either propertyId or address",
        };
      }

      const propertyDetails = await client.query(api.functions.properties.getPropertyByExternalIdOrAddress, {
        externalId: propertyId ?? undefined,
        address: address ?? undefined,
        suburb: suburb ?? undefined,
        state: state ?? undefined,
      });

      if (!propertyDetails) {
        return {
          success: false,
          error: "Property not found",
        };
      }

      return {
        success: true,
        property: propertyDetails,
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

export const getComparables = tool({
  description:
    "Find comparable properties (recent sales) near a specific address",
  inputSchema: z.object({
    address: z.string().describe("Reference property address"),
    suburb: z.string().describe("Suburb name"),
    state: z.string().describe("State code"),
    radiusKm: z.number().default(1).describe("Search radius in kilometers"),
    limit: z
      .number()
      .max(50)
      .default(10)
      .describe("Maximum comparables to return"),
    monthsBack: z
      .number()
      .default(12)
      .describe("How recent (months) the sales should be"),
  }),
  execute: async ({ address, suburb, state, radiusKm, limit, monthsBack }) => {
    try {
      const comparables = await client.query(api.functions.properties.getComparableProperties, {
        address,
        suburb,
        state,
        radiusKm,
        limit,
        monthsBack,
      });

      return {
        success: true,
        comparables,
        medianPrice: calculateMedianPrice(comparables),
        count: comparables.length,
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

export const getSalesHistory = tool({
  description: "Get historical sales records for a specific property address",
  inputSchema: z.object({
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

    } catch (error) {
      console.error("Sales history retrieval failed:", error);
      return {
        success: false,
        error: "Unable to retrieve sales history",
      };
    }
  },
});

function calculateMapCenter(geocodes: GeocodeResult[]) {
  if (geocodes.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const g of geocodes) {
    if (g.bbounds) {
      minLat = Math.min(minLat, g.bbounds.southwest.lat);
      minLng = Math.min(minLng, g.bbounds.southwest.lng);
      maxLat = Math.max(maxLat, g.bbounds.northeast.lat);
      maxLng = Math.max(maxLng, g.bbounds.northeast.lng);
    } else {
      minLat = Math.min(minLat, g.lat);
      maxLat = Math.max(maxLat, g.lat);
      minLng = Math.min(minLng, g.lng);
      maxLng = Math.max(maxLng, g.lng);
    }
  }

  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };
}