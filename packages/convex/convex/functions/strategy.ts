import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
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
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
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
