import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { australianState, dataSource } from "../schema";

const breakdownEntry = v.object({
  label: v.string(),
  count: v.float64(),
  percentage: v.optional(v.float64()),
});

const upsertArgs = v.object({
  census_year: v.int64(), // e.g. 2021
  postcode: v.optional(v.string()),
  suburb: v.optional(v.string()),
  lga: v.optional(v.string()),
  state: v.optional(australianState),

  ownerOccupied: v.optional(v.float64()),
  rented: v.optional(v.float64()),

  totalPopulation: v.optional(v.float64()),
  medianAge: v.optional(v.float64()),
  populationGrowth: v.optional(v.float64()), // YoY %
  malePercentage: v.optional(v.float64()),
  femalePercentage: v.optional(v.float64()),

  people: v.optional(v.array(breakdownEntry)),
  maritalStatus: v.optional(v.array(breakdownEntry)),
  education: v.optional(v.array(breakdownEntry)),
  laborForce: v.optional(v.array(breakdownEntry)),
  employmentStatus: v.optional(v.array(breakdownEntry)),
  occupationTopResponses: v.optional(v.array(breakdownEntry)),
  industryTopResponses: v.optional(v.array(breakdownEntry)),
  medianWeeklyIncomes: v.optional(v.array(breakdownEntry)),
  methodOfTravelToWork: v.optional(v.array(breakdownEntry)),
  familyComposition: v.optional(v.array(breakdownEntry)),
  dwellingStructure: v.optional(v.array(breakdownEntry)),
  numberOfBedrooms: v.optional(v.array(breakdownEntry)),
  tenureType: v.optional(v.array(breakdownEntry)),
  rentWeeklyPayments: v.optional(v.array(breakdownEntry)),
  mortgageMonthlyRepayments: v.optional(v.array(breakdownEntry)),

  marketData: v.optional(v.any()),
  url: v.optional(v.string()),
  referencePath: v.optional(v.string()),
  source: v.optional(dataSource),
  scrapedAt: v.optional(v.float64()),
  extra: v.optional(v.any()),

  medianWeeklyPersonalIncome: v.optional(v.float64()),
  medianWeeklyHouseholdIncome: v.optional(v.float64()),
  medianWeeklyFamilyIncome: v.optional(v.float64()),
  medianMonthlyMortgageRepayment: v.optional(v.float64()),
  medianWeeklyRent: v.optional(v.float64()),
});

export const upsertAbsMarketData = mutation({
  args: upsertArgs,
  handler: async (ctx, input) => {
    const now = Date.now();
    const scrapedAt = input.scrapedAt ?? now;

    // Try to find existing by postcode (preferred lookup)
    let existing: any = null;
    if (input.postcode) {
      existing = await ctx.db
        .query("absMarketData")
        .withIndex("by_postcode", (q: any) => q.eq("postcode", input.postcode))
        .first();
    }

    if (existing) {
      const existingScraped =
        typeof existing.scrapedAt === "number" ? existing.scrapedAt : 0;
      if (scrapedAt > existingScraped) {
        await ctx.db.patch(existing._id, {
          postcode: input.postcode ?? existing.postcode,
          suburb: input.suburb ?? existing.suburb,
          lga: input.lga ?? existing.lga,
          state: input.state ?? existing.state,

          // population: input.population ?? existing.population,
          // medianAge: input.medianAge ?? existing.medianAge,

          people: input.people ?? existing.people,
          maritalStatus: input.maritalStatus ?? existing.maritalStatus,
          education: input.education ?? existing.education,
          laborForce: input.laborForce ?? existing.laborForce,
          employmentStatus: input.employmentStatus ?? existing.employmentStatus,
          occupationTopResponses:
            input.occupationTopResponses ?? existing.occupationTopResponses,
          industryTopResponses:
            input.industryTopResponses ?? existing.industryTopResponses,
          medianWeeklyIncomes:
            input.medianWeeklyIncomes ?? existing.medianWeeklyIncomes,
          methodOfTravelToWork:
            input.methodOfTravelToWork ?? existing.methodOfTravelToWork,
          familyComposition:
            input.familyComposition ?? existing.familyComposition,
          dwellingStructure:
            input.dwellingStructure ?? existing.dwellingStructure,
          numberOfBedrooms: input.numberOfBedrooms ?? existing.numberOfBedrooms,
          tenureType: input.tenureType ?? existing.tenureType,
          rentWeeklyPayments:
            input.rentWeeklyPayments ?? existing.rentWeeklyPayments,
          mortgageMonthlyRepayments:
            input.mortgageMonthlyRepayments ??
            existing.mortgageMonthlyRepayments,

          totalPopulation: input.totalPopulation ?? existing.totalPopulation,
          medianAge: input.medianAge ?? existing.medianAge,
          populationGrowth: input.populationGrowth ?? existing.populationGrowth, // YoY %
          malePercentage: input.malePercentage ?? existing.malePercentage,
          femalePercentage: input.femalePercentage ?? existing.femalePercentage,

          marketData: input.marketData ?? existing.marketData,
          url: input.url ?? existing.url,
          referencePath: input.referencePath ?? existing.referencePath,
          source: input.source ?? existing.source,
          scrapedAt,
          extra: input.extra ?? existing.extra,
          ownerOccupied: input.ownerOccupied ?? undefined,
          rented: input.rented ?? undefined,
        });

        return ctx.db.get(existing._id);
      }

      return existing;
    }

    // Insert new record
    const rec = await ctx.db.insert("absMarketData", {
      postcode: input.postcode ?? undefined,
      suburb: input.suburb ?? undefined,
      lga: input.lga ?? undefined,
      state: input.state ?? undefined,

      people: input.people ?? undefined,
      maritalStatus: input.maritalStatus ?? undefined,
      education: input.education ?? undefined,
      laborForce: input.laborForce ?? undefined,
      employmentStatus: input.employmentStatus ?? undefined,
      occupationTopResponses: input.occupationTopResponses ?? undefined,
      industryTopResponses: input.industryTopResponses ?? undefined,
      medianWeeklyIncomes: input.medianWeeklyIncomes ?? undefined,
      methodOfTravelToWork: input.methodOfTravelToWork ?? undefined,
      familyComposition: input.familyComposition ?? undefined,
      dwellingStructure: input.dwellingStructure ?? undefined,
      numberOfBedrooms: input.numberOfBedrooms ?? undefined,
      tenureType: input.tenureType ?? undefined,
      rentWeeklyPayments: input.rentWeeklyPayments ?? undefined,
      mortgageMonthlyRepayments: input.mortgageMonthlyRepayments ?? undefined,

      marketData: input.marketData ?? undefined,
      url: input.url ?? undefined,
      referencePath: input.referencePath ?? undefined,
      source: input.source ?? undefined,
      scrapedAt,
      createdAt: now,
      extra: input.extra ?? undefined,

      totalPopulation: input.totalPopulation ?? undefined,
      medianAge: input.medianAge ?? undefined,
      populationGrowth: input.populationGrowth ?? undefined, // YoY %
      malePercentage: input.malePercentage ?? undefined,
      femalePercentage: input.femalePercentage ?? undefined,
      census_year: input.census_year ?? undefined,
      ownerOccupied: input.ownerOccupied ?? undefined,
      rented: input.rented ?? undefined,
    });

    return rec;
  },
});

export const getAbsMarketDataByPostcode = query({
  args: { postcode: v.string() },
  handler: async (ctx, { postcode }) => {
    const rec = await ctx.db
      .query("absMarketData")
      .withIndex("by_postcode", (q: any) => q.eq("postcode", postcode))
      .collect();

    return rec;
  },
});

export const listAbsMarketDataByState = query({
  args: { state: v.string() },
  handler: async (ctx, { state }) => {
    const rows = await ctx.db
      .query("absMarketData")
      .withIndex("by_state", (q: any) => q.eq("state", state))
      .collect();

    return rows;
  },
});

// SA2-based helpers removed: absMarketData no longer stores sa2Id/sa2Code
