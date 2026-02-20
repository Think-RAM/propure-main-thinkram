import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { australianState } from "../schema";

const baseShape = v.object({
  state: australianState,
  suburb: v.string(),
  postcode: v.string(),
});

const patchShape = v.object({
  state: v.optional(australianState),
  suburb: v.optional(v.string()),
  postcode: v.optional(v.string()),
});

type LocationInput = typeof baseShape.type;

function normalizeLocation(
  input: LocationInput,
): Omit<Doc<"scrapping_locations">, "_id" | "_creationTime"> {
  const timestamp = Date.now();
  return {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("scrapping_locations").collect();
    return records.sort((a, b) => {
      if (a.state === b.state) {
        return a.suburb.localeCompare(b.suburb);
      }
      return a.state.localeCompare(b.state);
    });
  },
});

export const listByState = query({
  args: { state: australianState },
  handler: async (ctx, { state }) => {
    return ctx.db
      .query("scrapping_locations")
      .withIndex("by_state", (q) => q.eq("state", state))
      .collect();
  },
});

export const insert = mutation({
  args: baseShape,
  handler: async (ctx, input) => {
    return ctx.db.insert("scrapping_locations", normalizeLocation(input));
  },
});

export const update = mutation({
  args: {
    locationId: v.id("scrapping_locations"),
    patch: patchShape,
  },
  handler: async (ctx, { locationId, patch }) => {
    const current = await ctx.db.get(locationId);
    if (!current) {
      throw new Error("Scraping location not found");
    }
    await ctx.db.patch(locationId, {
      ...patch,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { locationId: v.id("scrapping_locations") },
  handler: async (ctx, { locationId }) => {
    await ctx.db.delete(locationId);
  },
});

export const bulkUpsert = mutation({
  args: { locations: v.array(baseShape) },
  handler: async (ctx, { locations }) => {
    let upserted = 0;
    for (const location of locations) {
      const existing = await ctx.db
        .query("scrapping_locations")
        .withIndex("by_state_suburb", (q) =>
          q.eq("state", location.state).eq("suburb", location.suburb),
        )
        .filter((q) => q.eq(q.field("postcode"), location.postcode))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          postcode: location.postcode,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("scrapping_locations", normalizeLocation(location));
      }
      upserted += 1;
    }

    return upserted;
  },
});
