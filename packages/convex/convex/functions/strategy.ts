import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  strategyType,
  strategyStatus,
  StrategyType,
  StrategyStatus,
} from "../schema";

export const GetStrategyByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const strategy = await ctx.db
      .query("strategies")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "ACTIVE"))
      .unique();
    return strategy;
  },
});

export const GetStrategyByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return null;
    }
    const strategies = await ctx.db
      .query("strategies")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      ...user,
      strategies,
    };
  },
});

export const CreateUpdateStrategy = mutation({
  args: {
    strategyId: v.optional(v.id("strategies")),
    userId: v.id("users"),
    type: strategyType,
    status: strategyStatus,
    params: v.optional(v.any()),
    budget: v.optional(v.float64()),
    deposit: v.optional(v.float64()),
    income: v.optional(v.float64()),
    riskTolerance: v.optional(v.string()),
    timeline: v.optional(v.string()),
    managementStyle: v.optional(v.string()),
  },
  handler: async (ctx, { strategyId, userId, ...rest }) => {
    const payload: {
      type: StrategyType;
      status: StrategyStatus;
      params?: any;
      budget?: number;
      deposit?: number;
      income?: number;
      riskTolerance?: string;
      timeline?: string;
      managementStyle?: string;
      updatedAt: number;
    } = {
      type: rest.type,
      status: rest.status,
      updatedAt: Date.now(),
    };

    if (rest.params) {
      payload.params = rest.params;
    }
    if (rest.budget) {
      payload.budget = rest.budget;
    }
    if (rest.deposit) {
      payload.deposit = rest.deposit;
    }
    if (rest.income) {
      payload.income = rest.income;
    }
    if (rest.riskTolerance) {
      payload.riskTolerance = rest.riskTolerance;
    }
    if (rest.timeline) {
      payload.timeline = rest.timeline;
    }
    if (rest.managementStyle) {
      payload.managementStyle = rest.managementStyle;
    }

    if (strategyId) {
      const strategy = await ctx.db.get("strategies", strategyId);
      if (strategy) {
        ctx.db.patch("strategies", strategy._id, payload);
        return strategy._id;
      }
    }
    const newStrategy = await ctx.db.insert("strategies", {
      userId,
      ...payload,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newStrategy;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),

    // Either a top-level field OR a params key
    field: v.optional(
      v.union(
        v.literal("budget"),
        v.literal("deposit"),
        v.literal("income"),
        v.literal("riskTolerance"),
        v.literal("timeline"),
        v.literal("managementStyle"),
      ),
    ),

    paramKey: v.optional(v.string()), // e.g. "regions", "bedrooms"
    value: v.any(),

    context: v.optional(v.string()),
  },

  handler: async (ctx, { userId, field, paramKey, value }) => {
    if (!field && !paramKey) {
      throw new Error("Either field or paramKey must be provided");
    }

    // 1️⃣ Always target DISCOVERY strategy
    let strategy = await ctx.db
      .query("strategies")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "DISCOVERY"),
      )
      .first();

    // 2️⃣ Create DISCOVERY if missing
    if (!strategy) {
      const strategyId = await ctx.db.insert("strategies", {
        userId,
        type: "CASH_FLOW", // placeholder until recommendation
        status: "DISCOVERY",
        params: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      strategy = await ctx.db.get("strategies", strategyId);
    }

    if (!strategy) {
      throw new Error("Failed to fetch or create DISCOVERY strategy");
    }

    // 3️⃣ Build patch safely
    const patch: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (field) {
      patch[field] = value;
    }

    if (paramKey) {
      patch.params = {
        ...(strategy.params ?? {}),
        [paramKey]: value,
      };
    }

    await ctx.db.patch(strategy._id, patch);

    return {
      strategyId: strategy._id,
      updatedField: field ?? `params.${paramKey}`,
    };
  },
});


export const saveRecommendation = mutation({
  args: {
    userId: v.id("users"),
    strategyType: strategyType,
    confidence: v.number(),
    reasons: v.array(v.string()),
    alternativeStrategies: v.array(strategyType),
  },
  handler: async (ctx, { userId, strategyType, confidence, reasons, alternativeStrategies }) => {
    // 1. Archive any existing ACTIVE strategy
    const active = await ctx.db
      .query("strategies")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "ACTIVE"),
      )
      .collect();

    for (const s of active) {
      await ctx.db.patch(s._id, {
        status: "ARCHIVED",
        updatedAt: Date.now(),
      });
    }

    // 2. Fetch DISCOVERY strategy
    let strategy = await ctx.db
      .query("strategies")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "DISCOVERY"),
      )
      .first();

    // 3. If none exists, create one
    if (!strategy) {
      const id = await ctx.db.insert("strategies", {
        userId,
        type: strategyType,
        status: "ACTIVE",
        params: {
          confidence,
          reasons,
          alternatives: alternativeStrategies,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return id;
    }

    // 4. Promote DISCOVERY → ACTIVE
    await ctx.db.patch(strategy._id, {
      type: strategyType,
      status: "ACTIVE",
      params: {
        confidence,
        reasons,
        alternatives: alternativeStrategies,
      },
      updatedAt: Date.now(),
    });

    return strategy._id;
  },
});
