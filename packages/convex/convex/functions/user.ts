import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const GetUserByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
    return user;
  },
});

export const CreateUser = mutation({
  args: {
    userJSON: v.any(), // tighten later
  },
  handler: async (ctx, { userJSON }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", userJSON.id))
      .first();
    if (existingUser) {
      await ctx.db.patch("users", existingUser._id, {
        name: `${userJSON.first_name ?? "John"} ${userJSON.last_name ?? "Doe"}`,
        email: userJSON.email_addresses[0].email_address,
      });
      return existingUser._id;
    }
    const newUser = await ctx.db.insert("users", {
      clerkUserId: userJSON.id,
      email: userJSON.email_addresses[0].email_address,
      name: `${userJSON.first_name ?? "John"} ${userJSON.last_name ?? "Doe"}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newUser;
  },
});

export const CreateUserStrategy = mutation({
  args: {
    userId: v.id("users"),
    userPreferences: v.object({
      primaryGoal: v.string(),
      totalBudget: v.string(),
      personalSavings: v.string(),
      riskLevel: v.optional(v.string()),
      holdingPeriod: v.optional(v.string()),
      involvement: v.optional(v.string()),

      regions: v.optional(v.any()),
      remoteInvesting: v.optional(v.boolean()),
      areaPreference: v.optional(v.any()),
      propertyType: v.optional(v.any()),
      bedrooms: v.optional(v.any()),
      propertyAge: v.optional(v.any()),
      previousExperience: v.optional(v.any()),
      coInvestment: v.optional(v.any()),
      cashflowExpectations: v.optional(v.any()),
      cashflowAmount: v.optional(v.any()),
    }),
  },

  handler: async (ctx, { userId, userPreferences }) => {
    const STRATEGY_TYPES: Record<string, any> = {
      CASH_FLOW: "CASH_FLOW",
      CAPITAL_GROWTH: "CAPITAL_GROWTH",
      RENOVATION_FLIP: "RENOVATION_FLIP",
      DEVELOPMENT: "DEVELOPMENT",
      SMSF: "SMSF",
      COMMERCIAL: "COMMERCIAL",
    };

    const parseMoney = (value?: string) =>
      value ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : undefined;

    const strategyId = await ctx.db.insert("strategies", {
      userId,
      status: "ACTIVE",
      type: STRATEGY_TYPES[userPreferences.primaryGoal],
      budget: parseMoney(userPreferences.totalBudget),
      deposit: parseMoney(userPreferences.personalSavings),
      income: parseMoney(userPreferences.personalSavings),
      riskTolerance: userPreferences.riskLevel,
      timeline: userPreferences.holdingPeriod,
      managementStyle: userPreferences.involvement,

      params: {
        regions: userPreferences.regions,
        remoteInvesting: userPreferences.remoteInvesting,
        areaPreference: userPreferences.areaPreference,
        propertyType: userPreferences.propertyType,
        bedrooms: userPreferences.bedrooms,
        propertyAge: userPreferences.propertyAge,
        previousExperience: userPreferences.previousExperience,
        coInvestment: userPreferences.coInvestment,
        cashflowExpectations: userPreferences.cashflowExpectations,
        cashflowAmount: userPreferences.cashflowAmount,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return strategyId;
  },
});
