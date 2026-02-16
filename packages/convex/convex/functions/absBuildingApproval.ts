import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { australianState, dataSource } from "../schema";

const insertShape = v.object({
  sa2Id: v.optional(v.id("sa2Geocodes")),
  sa2Code: v.optional(v.string()),
  month: v.string(), // 'YYYY-MM'
  totalApprovals: v.float64(),
  houseApprovals: v.float64(),
  apartmentApprovals: v.float64(),
  observationValue: v.float64(),
  source: v.optional(dataSource),
  isEstimate: v.optional(v.boolean()),
  scrapedAt: v.optional(v.float64()),
  extra: v.optional(v.any()),
});

const updateShape = v.object({
  id: v.id("absBuildingApprovals"),
  patch: v.object({
    totalApprovals: v.optional(v.float64()),
    houseApprovals: v.optional(v.float64()),
    apartmentApprovals: v.optional(v.float64()),
    observationValue: v.optional(v.float64()),
    isEstimate: v.optional(v.boolean()),
    scrapedAt: v.optional(v.float64()),
    extra: v.optional(v.any()),
  }),
});

function isValidMonth(month: string) {
  return /^\d{4}-\d{2}$/.test(month);
}

async function resolveSa2Id(ctx: any, sa2Id?: any, sa2Code?: string) {
  if (sa2Id) return sa2Id;
  if (!sa2Code) return null;

  const rec = await ctx.db
    .query("sa2Geocodes")
    .withIndex("by_sa2_code", (q: any) => q.eq("sa2Code", sa2Code))
    .first();

  return rec ? rec._id : null;
}

/**
 * Insert a new absBuildingApprovals record.
 *
 * Args (insertShape):
 * - sa2Id?: id("sa2Geocodes") - optional reference to SA2 geocode
 * - sa2Code?: string - optional SA2 code used to resolve sa2Id if missing
 * - month: string - ISO month in 'YYYY-MM'
 * - totalApprovals, houseApprovals, apartmentApprovals, observationValue: numbers
 * - source?: dataSource, isEstimate?: boolean, scrapedAt?: number, extra?: any
 *
 * Behavior:
 * - Validates month format.
 * - Attempts to resolve sa2Id from sa2Code if sa2Id not provided.
 * - If a record already exists for the resolved sa2Id+month, throws an error.
 * - Inserts a new record with createdAt and scrapedAt timestamps.
 *
 * Returns: the inserted record (including Convex `_id`).
 *
 * @author Bidyut Kr. Das
 */
export const insertAbsBuildingApproval = mutation({
  args: insertShape,
  handler: async (ctx, input) => {
    if (!isValidMonth(input.month)) {
      throw new Error("Invalid month format, expected YYYY-MM");
    }

    const now = Date.now();
    const scrapedAt = input.scrapedAt ?? now;

    const sa2Id = await resolveSa2Id(ctx, input.sa2Id, input.sa2Code);

    // If sa2Id resolved, try to detect existing by index
    if (sa2Id) {
      const existing = await ctx.db
        .query("absBuildingApprovals")
        .withIndex("by_sa2_month", (q: any) =>
          q.eq("sa2Id", sa2Id).eq("month", input.month),
        )
        .first();

      if (existing) {
        throw new Error("Record already exists for this sa2/month");
      }
    }

    const record = await ctx.db.insert("absBuildingApprovals", {
      sa2Id: sa2Id ?? undefined,
      month: input.month,
      totalApprovals: input.totalApprovals,
      houseApprovals: input.houseApprovals,
      apartmentApprovals: input.apartmentApprovals,
      observationValue: input.observationValue,
      source: input.source ?? undefined,
      isEstimate: input.isEstimate ?? undefined,
      scrapedAt,
      createdAt: now,
      extra: input.extra ?? undefined,
    });

    return record;
  },
});

/**
 * Upsert (insert or update) an absBuildingApprovals record idempotently.
 *
 * Args (insertShape): same as insertAbsBuildingApproval.
 *
 * Behavior:
 * - Validates month format and resolves sa2Id from sa2Code when possible.
 * - If an existing record for sa2Id+month exists, updates it only when incoming
 *   `scrapedAt` is newer than the existing record's `scrapedAt`.
 * - If no existing record is found, inserts a new one.
 * - If sa2Id cannot be resolved, inserts with sa2Id undefined (requires later backfill).
 *
 * Returns: the inserted or updated record.
 *
 * @author Bidyut Kr. Das
 */
export const upsertAbsBuildingApproval = mutation({
  args: insertShape,
  handler: async (ctx, input) => {
    if (!isValidMonth(input.month)) {
      throw new Error("Invalid month format, expected YYYY-MM");
    }

    const now = Date.now();
    const scrapedAt = input.scrapedAt ?? now;

    const sa2Id = await resolveSa2Id(ctx, input.sa2Id, input.sa2Code);

    // If we have a sa2Id, try to find existing record
    if (sa2Id) {
      const existing = await ctx.db
        .query("absBuildingApprovals")
        .withIndex("by_sa2_month", (q: any) =>
          q.eq("sa2Id", sa2Id).eq("month", input.month),
        )
        .first();

      if (existing) {
        // Compare scrapedAt to decide update
        const existingScraped =
          typeof existing.scrapedAt === "number" ? existing.scrapedAt : 0;
        if (scrapedAt > existingScraped) {
          await ctx.db.patch(existing._id, {
            totalApprovals: input.totalApprovals,
            houseApprovals: input.houseApprovals,
            apartmentApprovals: input.apartmentApprovals,
            observationValue: input.observationValue,
            source: input.source ?? existing.source,
            isEstimate: input.isEstimate ?? existing.isEstimate,
            scrapedAt,
            extra: input.extra ?? existing.extra,
          });

          return ctx.db.get(existing._id);
        }

        return existing;
      }
    }

    // No existing found (or no sa2Id) -> insert new record (sa2Id may be undefined)
    const record = await ctx.db.insert("absBuildingApprovals", {
      sa2Id: sa2Id ?? undefined,
      month: input.month,
      totalApprovals: input.totalApprovals,
      houseApprovals: input.houseApprovals,
      apartmentApprovals: input.apartmentApprovals,
      observationValue: input.observationValue,
      source: input.source ?? undefined,
      isEstimate: input.isEstimate ?? undefined,
      scrapedAt,
      createdAt: now,
      extra: input.extra ?? undefined,
    });

    return record;
  },
});

/**
 * Patch fields on an existing absBuildingApprovals record.
 *
 * Args (updateShape):
 * - id: id("absBuildingApprovals") - target record id
 * - patch: partial fields to update (totalApprovals, houseApprovals, apartmentApprovals,
 *   observationValue, isEstimate, scrapedAt, extra)
 *
 * Behavior:
 * - Validates the record exists and applies a patch using `ctx.db.patch`.
 *
 * Returns: the updated record.
 *
 * @author Bidyut Kr. Das
 */
export const updateAbsBuildingApproval = mutation({
  args: updateShape,
  handler: async (ctx, { id, patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("absBuildingApproval not found");

    await ctx.db.patch(id, {
      ...patch,
    });

    return ctx.db.get(id);
  },
});

/**
 * Fetch a single absBuildingApprovals record by sa2Id and month.
 *
 * Args: { sa2Id: id("sa2Geocodes"), month: string }
 *
 * Behavior:
 * - Validates month format and queries the `by_sa2_month` index.
 *
 * Returns: the matching record or null when not found or invalid month.
 *
 * @author Bidyut Kr. Das
 */
export const getAbsBuildingApprovalBySa2Month = query({
  args: { sa2Id: v.id("sa2Geocodes"), month: v.string() },
  handler: async (ctx, { sa2Id, month }) => {
    if (!isValidMonth(month)) return null;

    const rec = await ctx.db
      .query("absBuildingApprovals")
      .withIndex("by_sa2_month", (q: any) =>
        q.eq("sa2Id", sa2Id).eq("month", month),
      )
      .first();

    return rec ?? null;
  },
});

/**
 * List absBuildingApprovals records for a specific month.
 *
 * Args: { month: string, limit?: number }
 *
 * Behavior:
 * - Validates month format, queries the `by_month` index, and returns up to `limit` rows.
 *
 * Returns: array of matching records (possibly empty).
 *
 * @author Bidyut Kr. Das
 */
export const listAbsBuildingApprovalsByMonth = query({
  args: { month: v.string(), limit: v.optional(v.float64()) },
  handler: async (ctx, { month, limit = 100 }) => {
    if (!isValidMonth(month)) return [];

    const rows = await ctx.db
      .query("absBuildingApprovals")
      .withIndex("by_month", (q: any) => q.eq("month", month))
      .collect();

    return rows.slice(0, Math.max(0, Math.floor(limit)));
  },
});

/**
 * List absBuildingApprovals records for a specific sa2Id, optionally bounded by months.
 *
 * Args: { sa2Id: id("sa2Geocodes"), startMonth?: string, endMonth?: string }
 *
 * Behavior:
 * - Queries `by_sa2_month` index and optionally filters the results by startMonth/endMonth
 *   using lexicographic comparison which works for 'YYYY-MM' formatted months.
 *
 * Returns: array of matching records.
 *
 * @author Bidyut Kr. Das
 */
export const listAbsBuildingApprovalsBySa2 = query({
  args: {
    sa2Id: v.id("sa2Geocodes"),
    startMonth: v.optional(v.string()),
    endMonth: v.optional(v.string()),
  },
  handler: async (ctx, { sa2Id, startMonth, endMonth }) => {
    const rows = await ctx.db
      .query("absBuildingApprovals")
      .withIndex("by_sa2_month", (q: any) => q.eq("sa2Id", sa2Id))
      .collect();

    if (startMonth || endMonth) {
      return rows.filter((r: any) => {
        const m = r.month;
        if (startMonth && m < startMonth) return false;
        if (endMonth && m > endMonth) return false;
        return true;
      });
    }

    return rows;
  },
});

/**
 * Fetch absBuildingApprovals records for a suburb and state by resolving to sa2Id.
 *
 * Args: { suburb: string, state: australianState }
 * 
 * Behavior:
 * - Resolves the suburb+state to an sa2Id using the `sa2Geocodes` table.
 * - If sa2Id is found, queries `absBuildingApprovals` by that sa2Id and returns the records.
 * - If no sa2Id is found, returns null.
 * 
 * Returns: array of absBuildingApprovals records for the suburb or null if suburb not found.
 * 
 * @author Nabeel Wasif
 */
export const getAbsBuildingDataBySuburb = query({
  args: {
    suburb: v.string(),
    state: australianState
  },
  handler: async (ctx, { suburb, state }) => {
    const sa2Id = await ctx.db
      .query("sa2Geocodes")
      .withIndex("by_suburb_state", (q: any) =>
        q.eq("suburb", suburb).eq("state", state),
      )
      .first();

    if (!sa2Id) {
      return null;
    };

    const rec = await ctx.db
      .query("absBuildingApprovals")
      .withIndex("by_sa2_month", (q: any) => q.eq("sa2Id", sa2Id._id))
      .collect();

    return rec;
  }
});