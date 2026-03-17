import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getShortListReport = query({
    args: {
        chatId: v.string(),
    },
    handler: async (ctx, { chatId }) => {
        const report = await ctx.db.query("shortListReports").withIndex("by_chat", (q) => q.eq("chatId", chatId)).first();
        if (!report) {
            throw new Error("Shortlist report not found for chatId: " + chatId);
        }
        return report;
    }
})


export const saveShortListReport = mutation({
    args: {
        userId: v.id("users"),
        strategyId: v.id("strategies"),
        chatId: v.string(),
        property: v.array(v.object({
            id: v.string(),
            title: v.string(),
            location: v.string(),
            images: v.array(v.string()),
            price: v.float64(),
            yield: v.float64(),
            rent: v.float64(),
            cashFlow: v.float64(),
            growth: v.float64(),
            risk: v.string(),
            daysOnMarket: v.float64(),
            score: v.float64(),
            tag: v.optional(v.union(v.literal("recommended"), v.literal("runner-up"))),
        })),
        recommendedProperty: v.object({
            title: v.string(),
            description: v.string(),
            confidence: v.float64(),
        }),
        aiInsights: v.object({
            strategy: v.string(),
            recommendationSummaryMD: v.string(),
        }),
        summary: v.object({
            purchasePrice: v.object({
                value: v.float64(),
                description: v.string(),
            }),
            cashFlow: v.object({
                value: v.float64(),
                description: v.string(),
            }),
            growth: v.object({
                value: v.float64(),
                description: v.string(),
            })
        }),
    },
    handler: async (ctx, { userId, strategyId, chatId, property, recommendedProperty, aiInsights, summary }) => {
        const existingReport = await ctx.db.query("shortListReports").withIndex("by_chat", (q) => q.eq("chatId", chatId)).first();
        const chat = await ctx.db.query("chatSessions").withIndex("by_session_id", (q) => q.eq("sessionId", chatId)).first();
        if (existingReport) {
            await ctx.db.patch("shortListReports", existingReport._id, {
                userId,
                strategyId,
                chatId,
                property,
                recommendedProperty,
                aiInsights,
                summary,
                createdAt: Date.now(),
            });
            await ctx.db.patch("chatSessions", chat!._id, {
                reportGenerated: true,
            });
            return { success: true, message: "Shortlist report updated" };
        }
        await ctx.db.insert("shortListReports", {
            userId,
            strategyId,
            chatId,
            property,
            recommendedProperty,
            aiInsights,
            summary,
            createdAt: Date.now(),
        });
        await ctx.db.patch("chatSessions", chat!._id, {
            reportGenerated: true,
        });
        return { success: true, message: "Shortlist report created" };
    }
})