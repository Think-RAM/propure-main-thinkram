import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getSuburbMetrics = query({
    args: {
        suburbId: v.id("suburbs"),
    },
    handler: async (ctx, { suburbId }) => {
        const metrics = await ctx.db
            .query("suburbMetrics")
            .withIndex("by_suburb", (q) =>
                q.eq("suburbId", suburbId),
            )
            .first();
        if (!metrics) {
            throw new Error(`Metrics for suburb ${suburbId} not found`);
        }
        return metrics;
    }
})

export const upsertSuburbMetricsData = mutation({
    args: {
        suburbId: v.id("suburbs"),
        metrics: v.object({
            typicalValue: v.number(),
            medianValue: v.number(),
            averageDaysOnMarket: v.number(),
            auctionClearanceRate: v.number(),
            renterProportion: v.number(),
            vacancyRate: v.number(),
            netYield: v.number(),
            stockOnMarket: v.number(),
            dataCompletenessScore: v.number(),
        }),
    },
    handler: async (ctx, { suburbId, metrics }) => {
        const existingRecord = await ctx.db
            .query("suburbMetrics")
            .withIndex("by_suburb", (q) =>
                q.eq("suburbId", suburbId),
            )
            .first();

        if (existingRecord) {
            await ctx.db.patch("suburbMetrics", existingRecord._id, {
                metrics,
                recordedAt: Date.now(),
            });
            return { success: true, message: "Metrics updated successfully" };
        } else {
            await ctx.db.insert("suburbMetrics", {
                suburbId,
                metrics,
                recordedAt: Date.now(),
                createdAt: Date.now(),
            });
            return { success: true, message: "Metrics inserted successfully" };
        }
    }
});

