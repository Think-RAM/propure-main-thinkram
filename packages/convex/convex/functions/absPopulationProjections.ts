import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { australianState, dataSource } from "../schema";

const projectionArgs = v.object({
  state: australianState,
  year: v.float64(),
  projectedPopulation: v.float64(),
  growthRate: v.float64(),
  source: v.optional(dataSource),
  recordedAt: v.optional(v.float64()),
  extra: v.optional(v.any()),
});

// Upsert a single projection (idempotent by state+year)
export const upsertProjection = mutation({
  args: projectionArgs,
  handler: async (ctx, input) => {
    const now = Date.now();
    const recordedAt = input.recordedAt ?? now;

    // Try to find existing by state+year
    const existing = await ctx.db
      .query("absPopulationProjections")
      .withIndex("by_state_year", (q: any) =>
        q.eq("state", input.state).eq("year", input.year),
      )
      .first();

    if (existing) {
      // If identical, return existing
      if (
        existing.projectedPopulation === input.projectedPopulation &&
        existing.growthRate === input.growthRate
      ) {
        return existing;
      }

      await ctx.db.patch(existing._id, {
        projectedPopulation: input.projectedPopulation,
        growthRate: input.growthRate,
        source: input.source ?? existing.source,
        recordedAt,
        extra: input.extra ?? existing.extra,
      });

      return ctx.db.get(existing._id);
    }

    // Insert new
    const rec = await ctx.db.insert("absPopulationProjections", {
      state: input.state,
      year: input.year,
      projectedPopulation: input.projectedPopulation,
      growthRate: input.growthRate,
      source: input.source ?? undefined,
      recordedAt,
      createdAt: now,
      extra: input.extra ?? undefined,
    });

    return rec;
  },
});

// Read single projection by state+year
export const getProjection = query({
  args: v.object({ state: australianState, year: v.float64() }),
  handler: async (ctx, input) => {
    const rec = await ctx.db
      .query("absPopulationProjections")
      .withIndex("by_state_year", (q: any) =>
        q.eq("state", input.state).eq("year", input.year),
      )
      .first();

    return rec ?? null;
  },
});

// List projections for a state
export const listProjectionsByState = query({
  args: v.object({ state: australianState }),
  handler: async (ctx, { state }) => {
    const rows = await ctx.db
      .query("absPopulationProjections")
      .withIndex("by_state", (q: any) => q.eq("state", state))
      .collect();

    return rows;
  },
});

// List projections for a year across states
export const listProjectionsByYear = query({
  args: v.object({ year: v.float64() }),
  handler: async (ctx, { year }) => {
    const rows = await ctx.db
      .query("absPopulationProjections")
      .withIndex("by_year", (q: any) => q.eq("year", year))
      .collect();

    return rows;
  },
});

export default {
  upsertProjection,
  getProjection,
  listProjectionsByState,
  listProjectionsByYear,
};
