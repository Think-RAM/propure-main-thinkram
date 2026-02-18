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
  propertyValueEstimate: v.optional(
    v.object({
      low: v.optional(v.float64()),
      mid: v.optional(v.float64()),
      high: v.optional(v.float64()),
    }),
  ),

  propertyRentEstimate: v.optional(v.float64()),

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
  propertyValueEstimate: v.optional(
    v.object({
      low: v.optional(v.float64()),
      mid: v.optional(v.float64()),
      high: v.optional(v.float64()),
    }),
  ),

  propertyRentEstimate: v.optional(v.float64()),

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

 function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
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

export const fetchProperties = query({
  args: {
    locations: v.array(
      v.object({
        suburb: v.string(),
        state: v.string(),
        postcode: v.optional(v.string()),
      }),
    ),

    listingType: listingType,

    propertyTypes: v.optional(
      v.array(
        propertyType
      ),
    ),

    minPrice: v.optional(v.float64()),
    maxPrice: v.optional(v.float64()),
    minBedrooms: v.optional(v.float64()),
    maxBedrooms: v.optional(v.float64()),
    minBathrooms: v.optional(v.float64()),
    minCarSpaces: v.optional(v.float64()),

    page: v.float64(),
    pageSize: v.float64(),
  },

  handler: async (ctx, args) => {
    const {
      locations,
      listingType,
      propertyTypes,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      minCarSpaces,
      page,
      pageSize,
    } = args;

    const offset = (page - 1) * pageSize;

    // 1️⃣ Fetch base set using indexed fields only
    const baseResults = await ctx.db
      .query("properties")
      .withIndex("by_listing_type", (q) =>
        q.eq("listingType", listingType),
      )
      .collect();

    // 2️⃣ Location filtering (in-memory)
    const locationFiltered = baseResults.filter((property) =>
      locations.some((loc) => {
        if (!property.address) return false;

        const suburbMatch =
          property.address.suburb.toLowerCase() ===
          loc.suburb.toLowerCase();

        const stateMatch =
          property.address.state === loc.state;

        const postcodeMatch = loc.postcode
          ? property.address.postcode === loc.postcode
          : true;

        return suburbMatch && stateMatch && postcodeMatch;
      }),
    );

    // 3️⃣ Feature + price filtering (in-memory)
    const fullyFiltered = locationFiltered.filter((property) => {
      const f = property.features;

      if (propertyTypes && f?.propertyType) {
        if (!propertyTypes.includes(f.propertyType)) return false;
      }

      if (minPrice !== undefined && property.priceValue !== undefined) {
        if (property.priceValue < minPrice) return false;
      }

      if (maxPrice !== undefined && property.priceValue !== undefined) {
        if (property.priceValue > maxPrice) return false;
      }

      if (minBedrooms !== undefined && f?.bedrooms !== undefined) {
        if (f.bedrooms < minBedrooms) return false;
      }

      if (maxBedrooms !== undefined && f?.bedrooms !== undefined) {
        if (f.bedrooms > maxBedrooms) return false;
      }

      if (minBathrooms !== undefined && f?.bathrooms !== undefined) {
        if (f.bathrooms < minBathrooms) return false;
      }

      if (minCarSpaces !== undefined && f?.parkingSpaces !== undefined) {
        if (f.parkingSpaces < minCarSpaces) return false;
      }

      return true;
    });

    // 4️⃣ Pagination
    const paginatedResults = fullyFiltered.slice(
      offset,
      offset + pageSize,
    );

    return {
      data: paginatedResults,
      page,
      pageSize,
      total: fullyFiltered.length,
      totalPages: Math.ceil(fullyFiltered.length / pageSize),
    };
  },
});

export const getPropertyByExternalIdOrAddress = query({
  args: {
    externalId: v.optional(v.string()),
    address: v.optional(v.string()),
    suburb: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, { externalId, address, suburb, state }) => {
    if (externalId) {
      return await ctx.db
        .query("properties")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .first();
    }
    else if (address && suburb && state) {
      return await ctx.db
        .query("properties")
        .withIndex("by_address_suburb", (q) => q.eq("addressSuburb", suburb))
        .filter((q) =>
          q.and(
            q.eq(q.field("address.displayAddress"), address),
            q.eq(q.field("address.state"), state),
          ),
        )
        .first();
    }
  }
})

export const getComparableProperties = query({
  args: {
    address: v.string(),
    suburb: v.string(),
    state: v.string(),
    radiusKm: v.optional(v.float64()),
    limit: v.optional(v.float64()),
    monthsBack: v.optional(v.float64()),
  },

  handler: async (ctx, args) => {
    const {
      suburb,
      state,
      radiusKm = 1,
      limit = 10,
      monthsBack = 12,
    } = args;

    const now = Date.now();
    const cutoffTime =
      now - monthsBack * 30 * 24 * 60 * 60 * 1000;

    // 1️⃣ Fetch candidate properties using index
    const candidates = await ctx.db
      .query("properties")
      .withIndex("by_address_suburb", (q) =>
        q.eq("addressSuburb", suburb),
      )
      .collect();

    // 2️⃣ Filter SOLD + state + recent
    const filtered = candidates.filter((p) => {
      if (p.listingType !== "sold") return false;
      if (p.address.state !== state) return false;
      if (p.createdAt < cutoffTime) return false;
      return true;
    });

    // 3️⃣ Extract reference coordinates (if available)
    const reference = filtered.find(
      (p) =>
        p.address.displayAddress === args.address &&
        p.address.latitude !== undefined &&
        p.address.longitude !== undefined,
    );

    const refLat = reference?.address.latitude;
    const refLng = reference?.address.longitude;

    // 4️⃣ Distance filtering (if we have coordinates)
    const withDistance = filtered
      .map((p) => {
        if (
          refLat === undefined ||
          refLng === undefined ||
          p.address.latitude === undefined ||
          p.address.longitude === undefined
        ) {
          return { property: p, distanceKm: null };
        }

        const distanceKm = haversineKm(
          refLat,
          refLng,
          p.address.latitude,
          p.address.longitude,
        );

        return { property: p, distanceKm };
      })
      .filter((item) =>
        item.distanceKm === null
          ? true
          : item.distanceKm <= radiusKm,
      );

    // 5️⃣ Sort: closest first, fallback to most recent
    withDistance.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.property.createdAt - a.property.createdAt;
    });

    // 6️⃣ Limit results
    return withDistance.slice(0, limit).map((i) => ({
      ...i.property,
      distanceKm: i.distanceKm,
    }));
  },
});
