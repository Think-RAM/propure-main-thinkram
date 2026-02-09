import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { australianState } from "../schema";

const insertShape = v.object({
  suburb: v.string(),
  state: australianState,
  sa2Code: v.string(),
  sa2Name: v.string(),
  longitude: v.optional(v.float64()),
  latitude: v.optional(v.float64()),
});

const updateShape = v.object({
  suburb: v.optional(v.string()),
  state: v.optional(australianState),
  sa2Code: v.optional(v.string()),
  sa2Name: v.optional(v.string()),
  longitude: v.optional(v.float64()),
  latitude: v.optional(v.float64()),
});

type Sa2Record = Doc<"sa2Geocodes">;

function normalizeSuburb(s: string) {
  return s.trim().toLowerCase();
}

export const insertSa2Geocode = mutation({
  args: insertShape,
  handler: async (ctx, input) => {
    const normalizedSuburb = normalizeSuburb(input.suburb);

    // Check existing by suburb+state
    const existing = await ctx.db
      .query("sa2Geocodes")
      .withIndex("by_suburb_state", (q) =>
        q.eq("suburb", normalizedSuburb).eq("state", input.state),
      )
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();

    const record = await ctx.db.insert("sa2Geocodes", {
      suburb: normalizedSuburb,
      state: input.state,
      sa2Code: input.sa2Code,
      sa2Name: input.sa2Name,
      longitude: input.longitude ?? undefined,
      latitude: input.latitude ?? undefined,
      createdAt: now,
    });

    return record;
  },
});

export const updateSa2Geocode = mutation({
  args: { id: v.id("sa2Geocodes"), patch: updateShape },
  handler: async (ctx, { id, patch }) => {
    const current = await ctx.db.get(id);
    if (!current) {
      throw new Error("SA2 Geocode not found");
    }

    // If suburb/state is being updated, ensure we don't create a duplicate
    if (patch.suburb || patch.state) {
      const newSuburb = patch.suburb
        ? normalizeSuburb(patch.suburb)
        : current.suburb;
      const newState = patch.state ?? current.state;

      const conflict = await ctx.db
        .query("sa2Geocodes")
        .withIndex("by_suburb_state", (q) =>
          q.eq("suburb", newSuburb).eq("state", newState),
        )
        .first();

      if (conflict && String(conflict._id) !== String(id)) {
        throw new Error("Conflicting SA2 geocode for suburb/state");
      }

      patch = {
        ...patch,
        suburb: newSuburb,
      } as typeof patch;
    }

    await ctx.db.patch(id, {
      ...patch,
    });

    return ctx.db.get(id);
  },
});

export const getSa2GeocodeBySuburbState = query({
  args: { suburb: v.string(), state: australianState },
  handler: async (ctx, { suburb, state }) => {
    const normalized = normalizeSuburb(suburb);
    const rec = await ctx.db
      .query("sa2Geocodes")
      .withIndex("by_suburb_state", (q) =>
        q.eq("suburb", normalized).eq("state", state),
      )
      .first();

    return rec ?? null;
  },
});

export const getSa2GeocodeBySa2Code = query({
  args: { sa2Code: v.string() },
  handler: async (ctx, { sa2Code }) => {
    const rec = await ctx.db
      .query("sa2Geocodes")
      .withIndex("by_sa2_code", (q) => q.eq("sa2Code", sa2Code))
      .first();

    return rec ?? null;
  },
});
