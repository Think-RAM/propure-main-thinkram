import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

function getCentroid(bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
}) {
    return {
        lat: (bounds.minLat + bounds.maxLat) / 2,
        lng: (bounds.minLng + bounds.maxLng) / 2,
    };
}

export const getSuburbMetrics = query({
    args: {
        postcode: v.string(),
    },
    handler: async (ctx, { postcode }) => {
        const metrics = await ctx.db
            .query("suburbMetrics")
            .withIndex("by_postcode", (q) =>
                q.eq("postcode", postcode),
            )
            .first();
        if (!metrics) {
            throw new Error(`Metrics for postcode ${postcode} not found`);
        }
        return metrics;
    }
})

export const upsertSuburbMetricsData = mutation({
    args: {
        postcode: v.string(),
        suburbGeometry: v.object({
            center: v.object({
                lat: v.float64(),
                lng: v.float64(),
            }),
            boundary: v.object({
                northeast: v.object({
                    lat: v.float64(),
                    lng: v.float64(),
                }),
                southwest: v.object({
                    lat: v.float64(),
                    lng: v.float64(),
                }),
            })
        }),
        metrics: v.object({
            typicalValue: v.number(),
            medianValue: v.number(),
            averageDaysOnMarket: v.number(),
            auctionClearanceRate: v.number(),
            renterProportion: v.number(),
            vacancyRate: v.number(),
            netYield: v.number(),
            stockOnMarket: v.number(),
            capitalGrowthScore: v.number(),
            riskScore: v.number(),
            cashFlowScore: v.number(),
            risk: v.object({
                marketRisk: v.number(),
                financialRisk: v.number(),
                liquidityRisk: v.number(),
                concentrationRisk: v.number(),
            }),
            dataCompletenessScore: v.number(),
        }),
    },
    handler: async (ctx, { postcode, metrics, suburbGeometry }) => {
        const existingRecord = await ctx.db
            .query("suburbMetrics")
            .withIndex("by_postcode", (q) =>
                q.eq("postcode", postcode),
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
                postcode,
                metrics,
                centerLat: suburbGeometry.center.lat,
                centerLng: suburbGeometry.center.lng,
                geometry: suburbGeometry,
                recordedAt: Date.now(),
                createdAt: Date.now(),
            });
            return { success: true, message: "Metrics inserted successfully" };
        }
    }
});

export const getSuburbMetricsByType = query({
    args: {
        metricType: v.optional(v.union(
            v.literal("capital_growth_score"),
            v.literal("risk_score"),
            v.literal("cash_flow_score"),
        )),
        limit: v.optional(v.number()),
        bounds: v.optional(v.object({
            minLat: v.float64(),
            minLng: v.float64(),
            maxLat: v.float64(),
            maxLng: v.float64(),
        }))
    },
    handler: async (ctx, { metricType, bounds, limit = 100 }) => {
        if (!metricType || !bounds) return [];

        const metricFieldMap = {
            capital_growth_score: "capitalGrowthScore",
            risk_score: "riskScore",
            cash_flow_score: "cashFlowScore",
        } as const;

        const metricField = metricFieldMap[metricType];
        const centre = getCentroid(bounds);
        console.log(`Center: Lat ${centre.lat}, Lng ${centre.lng}`)

        // 2️⃣ Narrow down latitude window first (index usage)
        // const LAT_WINDOW = 2; // degrees (~200km). Adjust dynamically later.

        const candidates = await ctx.db
            .query("suburbMetrics")
            .withIndex("by_lat_lng", (q) =>
                q.gte("centerLat", centre.lat - 0.1)
                    .lte("centerLat", centre.lat + 0.1)
            )
            .collect();

        // 3️⃣ Compute squared distance (cheaper than haversine)
        const scored = candidates.map((doc) => {
            const dLat = doc.centerLat - centre.lat;
            const dLng = doc.centerLng - centre.lng;

            const distanceScore = dLat * dLat + dLng * dLng;

            return {
                postcode: doc.postcode,
                latitude: doc.centerLat,
                longitude: doc.centerLng,
                value: doc.metrics[metricField] ?? 0,
                distanceScore,
            };
        });

        // 4️⃣ Sort by proximity first
        scored.sort((a, b) => a.distanceScore - b.distanceScore);

        // 5️⃣ Take nearest N
        const nearest = scored.slice(0, limit);

        return nearest.map(({ postcode, latitude, longitude, value }) => ({
            postcode,
            latitude,
            longitude,
            value,
        }));

    }
})