import { Infer, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import {
  dataSource,
  listingStatus,
  listingType,
  propertyType,
  australianState,
  soldAt,
} from "../schema";

const addressShape = v.object({
  streetNumber: v.optional(v.string()),
  streetName: v.optional(v.string()),
  streetType: v.optional(v.string()),
  suburb: v.string(),
  state: australianState,
  postcode: v.string(),
  displayAddress: v.string(),
  latitude: v.optional(v.float64()),
  longitude: v.optional(v.float64()),
});

const featuresShape = v.object({
  bedrooms: v.optional(v.float64()),
  bathrooms: v.optional(v.float64()),
  parkingSpaces: v.optional(v.float64()), // renamed from carSpaces
  landSize: v.optional(v.float64()),
  buildingSize: v.optional(v.float64()),
  propertyType: v.optional(propertyType),
  features: v.optional(v.array(v.string())),
});

const listingShape = v.object({
  externalId: v.string(),
  address: addressShape,
  features: v.optional(featuresShape),
  source: dataSource,
  sourceUrl: v.optional(v.string()),
  price: v.optional(v.string()), // display price
  priceValue: v.optional(v.float64()),
  priceFrom: v.optional(v.float64()),
  priceTo: v.optional(v.float64()),
  listingType,
  listingStatus: v.optional(listingStatus),
  headline: v.optional(v.string()),
  description: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  inspectionTimes: v.optional(v.array(v.string())),
  listedDate: v.optional(v.string()),
  auctionDate: v.optional(v.string()),
  // sold-related fields (match schema.ts)
  soldDate: v.optional(v.string()),
  soldPrice: v.optional(v.float64()),
  soldAt: v.optional(soldAt),
  daysOnMarket: v.optional(v.int64()),
  // convenience top-level suburb for indexing/searching
  addressSuburb: v.optional(v.string()),
  // Metadata timestamps (DB stores numeric ms)
  createdAt: v.optional(v.float64()),
  updatedAt: v.optional(v.float64()),
  agentName: v.optional(v.string()),
  agentPhone: v.optional(v.string()),
  agencyName: v.optional(v.string()),
  scrapedAt: v.optional(v.string()),
});

const listingPatchShape = v.object({
  externalId: v.optional(v.string()),
  address: v.optional(addressShape),
  features: v.optional(featuresShape),
  source: v.optional(dataSource),
  sourceUrl: v.optional(v.string()),
  price: v.optional(v.string()),
  priceValue: v.optional(v.float64()),
  priceFrom: v.optional(v.float64()),
  priceTo: v.optional(v.float64()),
  listingType: v.optional(listingType),
  listingStatus: v.optional(listingStatus),
  headline: v.optional(v.string()),
  description: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  inspectionTimes: v.optional(v.array(v.string())),
  listedDate: v.optional(v.string()),
  auctionDate: v.optional(v.string()),
  soldDate: v.optional(v.string()),
  soldPrice: v.optional(v.float64()),
  soldAt: v.optional(soldAt),
  daysOnMarket: v.optional(v.int64()),
  addressSuburb: v.optional(v.string()),
  createdAt: v.optional(v.float64()),
  updatedAt: v.optional(v.float64()),
  agentName: v.optional(v.string()),
  agentPhone: v.optional(v.string()),
  agencyName: v.optional(v.string()),
  scrapedAt: v.optional(v.string()),
});

type ListingInput = Infer<typeof listingShape>;

function normalizeListing(listing: ListingInput): any {
  const timestamp = Date.now();
  return {
    ...listing,
    // keep createdAt/updatedAt as numeric timestamps for DB metadata
    // top-level searchable suburb for indexing
    addressSuburb: listing.address?.suburb,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const getPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return ctx.db.get(propertyId);
  },
});

export const listPropertiesBySuburb = query({
  args: { suburb: v.string() },
  handler: async (ctx, { suburb }) => {
    return ctx.db
      .query("properties")
      .withIndex("by_address_suburb", (q) => q.eq("addressSuburb", suburb))
      .collect();
  },
});

export const insertProperty = mutation({
  args: { input: listingShape },
  handler: async (ctx, { input }) => {
    const normalized = normalizeListing(input);
    return ctx.db.insert("properties", normalized);
  },
});

export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    patch: listingPatchShape,
  },
  handler: async (ctx, { propertyId, patch }) => {
    const existing = await ctx.db.get(propertyId);
    if (!existing) {
      throw new Error("Property not found");
    }
    await ctx.db.patch(propertyId, {
      ...patch,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    await ctx.db.delete(propertyId);
  },
});

export const bulkUpsertProperties = mutation({
  args: { listings: v.array(listingShape) },
  handler: async (ctx, { listings }) => {
    let upserted = 0;
    for (const listing of listings) {
      let doc: Doc<"properties"> | null = null;
      if (listing.externalId) {
        doc = await ctx.db
          .query("properties")
          .withIndex("by_external_id", (q) =>
            q.eq("externalId", listing.externalId!),
          )
          .filter((q) => q.eq(q.field("source"), listing.source))
          .first();
      }

      if (doc) {
        await ctx.db.patch(doc._id, {
          ...listing,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("properties", normalizeListing(listing));
      }
      upserted += 1;
    }
    return upserted;
  },
});

export const markPropertiesStale = mutation({
  args: {
    source: dataSource,
    newerThan: v.float64(),
  },
  handler: async (ctx, { source, newerThan }) => {
    const stale = await ctx.db
      .query("properties")
      .withIndex("by_source", (q) => q.eq("source", source))
      .filter((q) => q.lt(q.field("updatedAt"), newerThan))
      .collect();

    for (const property of stale) {
      await ctx.db.patch(property._id, {
        listingStatus: "OFF_MARKET",
        updatedAt: Date.now(),
      });
    }
    return stale.length;
  },
});

export const getPropertiesByExternalIds = query({
  args: { externalIds: v.array(v.string()) },
  handler: async (ctx, { externalIds }) => {
    const results: Doc<"properties">[] = [];
    for (const externalId of externalIds) {
      const match = await ctx.db
        .query("properties")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .first();
      if (match) {
        results.push(match);
      }
    }
    return results;
  },
});
