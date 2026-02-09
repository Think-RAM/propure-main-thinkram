import { tool } from "ai";
import z from "zod";
import { client } from "@propure/convex/client";
import type { Doc, Id } from "@propure/convex/genereated";
import { api } from "@propure/convex/genereated";
import { StrategyType } from "@propure/convex";

/**
 * Field enum used for discovery capture.
 * Keep in sync with server-side schema.
 */
const FieldEnum = z.enum([
  "budget",
  "deposit",
  "income",
  "riskTolerance",
  "timeline",
  "managementStyle",
]);

type FieldEnum = z.infer<typeof FieldEnum>;

/**
 * Tool: captureDiscoveryInput
 * Records individual discovery field/value pairs to the user's profile on Convex.
 */
export const captureDiscoveryInput = tool({
  description:
    "Record user's financial situation, investment goals, or preferences during strategy discovery",
  inputSchema: z.object({
    userId: z.string().describe("User ID from authentication"),
    field: FieldEnum.describe("The type of information being captured"),
    paramKey: z.string().optional().describe("Optional key for parametric fields"),
    value: z.union([z.string(), z.number(), z.array(z.string())]).describe("The value to store"),
    context: z.string().optional().describe("Optional notes or free text context"),
  }),
  execute: async ({ userId, field, paramKey, value, context }) => {
    try {
      await client.mutation(api.functions.strategy.updateUserProfile, {
        userId: userId as Id<"users">,
        field: field as FieldEnum,
        paramKey,
        value,
        context: context ?? undefined,
      });

      // Suggest next follow-up hint
      const nextStep = getNextQuestionHint(field);

      return {
        success: true,
        message: `Captured ${field}`,
        nextStep,
      };
    } catch (error) {
      console.error("captureDiscoveryInput failed", error);
      return {
        success: false,
        error: "Failed to save discovery input",
      };
    }
  },
});

/**
 * Tool: clarifyGoal
 * Given ambiguous/missing input, return a single clarifying question and suggested options.
 */
export const clarifyGoal = tool({
  description: "Ask a single follow-up question when user input is ambiguous or incomplete",
  inputSchema: z.object({
    field: z.string().describe("Field that needs clarification"),
    currentValue: z.string().optional().describe("Current ambiguous value"),
    clarificationNeeded: z
      .enum(["too_vague", "out_of_range", "conflicting_info", "missing_detail"])
      .describe("Reason clarification is needed"),
  }),
  execute: async ({ field, currentValue, clarificationNeeded }) => {
    const questions: Record<string, Record<string, string>> = {
      budget: {
        too_vague: "What's your maximum purchase budget in local currency? (Please state a number)",
        out_of_range: "That budget seems uncommon for the market—can you confirm the amount?",
        missing_detail: "Is this your total budget or just deposit/available cash?",
      },
      deposit: {
        too_vague: "How much can you put down as deposit (number or %)?",
        missing_detail: "Do you mean the initial deposit or accessible liquidity for purchase+renovation?",
      },
      timeline: {
        too_vague: "When would you like to invest? Next 6 months, 1 year, or 2+ years?",
        conflicting_info: "Earlier you said short-term; this sounds long-term. Which is correct?",
      },
      riskTolerance: {
        too_vague: "Do you prefer Low (stable), Medium (balanced), or High (aggressive growth)?",
        conflicting_info:
          "Your earlier answers suggest conservative, but you said 'high risk' — which best describes you?",
      },
    };

    const question =
      questions[field]?.[clarificationNeeded] ||
      `Can you provide more detail on ${field}?`;

    return {
      success: true,
      question,
      suggestedOptions: getSuggestedOptions(field),
    };
  },
});

/**
 * Tool: summarizeProfile
 * Fetches the user's profile from Convex and returns a concise summary with completeness score.
 */
export const summarizeProfile = tool({
  description: "Generate a concise summary of the user's captured profile for review and confirmation",
  inputSchema: z.object({
    userId: z.string().describe("User ID"),
  }),
  execute: async ({ userId }) => {
    try {
      const profile = await client.query(api.functions.strategy.GetStrategyByUserId, { userId: userId as Id<"users"> });

      if (!profile) {
        return { success: false, error: "User profile not found" };
      }

      // Build summary with safe guards
      const budget = Number(profile.budget ?? 0);
      const deposit = Number(profile.deposit ?? 0);
      const depositPct = budget > 0 ? Math.round((deposit / budget) * 100) : null;

      const summary = {
        financial: {
          budget: budget || null,
          deposit: deposit || null,
          depositPercentage: depositPct,
        },
        preferences: {
          timeline: profile.timeline ?? null,
          riskTolerance: profile.riskTolerance ?? null,
          goal: profile.type,
        },
        constraints: {
          preferredLocations: profile.params?.regions ?? [],
          propertyType: profile.params?.propertyType ?? [],
        },
        experience: profile.params?.previousExperience ?? [],
        completeness: calculateProfileCompleteness(profile),
      };

      return {
        success: true,
        summary,
        readyForRecommendation: summary.completeness >= 0.75,
      };
    } catch (error) {
      console.error("summarizeProfile failed", error);
      return { success: false, error: "Unable to generate profile summary" };
    }
  },
});

/**
 * Tool: recommendStrategy
 * Reads profile and writes the recommendation back to Convex, returning primary + alternatives + rationale.
 */
export const recommendStrategy = tool({
  description: "Recommend investment strategy based on the user's captured profile",
  inputSchema: z.object({
    userId: z.string().describe("User ID"),
    forceRecalculate: z.boolean().default(false).describe("Force recalculation even if one exists"),
  }),
  execute: async ({ userId, forceRecalculate }) => {
    try {
      const profile = await client.query(api.functions.strategy.GetStrategyByUserId, { userId: userId as Id<"users"> });

      if (!profile) {
        return { success: false, error: "User profile not found" };
      }

      const recommendation = calculateStrategyRecommendation(profile);

      // Save recommendation in Convex
      await client.mutation(api.functions.strategy.saveRecommendation, {
        userId: userId as Id<"users">,
        strategyType: recommendation.strategyType as StrategyType,
        confidence: recommendation.confidence,
        reasons: recommendation.reasons,
        alternativeStrategies: recommendation.alternatives as StrategyType[],
      });

      return {
        success: true,
        recommendation: {
          primaryStrategy: recommendation.strategyType,
          confidence: recommendation.confidence,
          rationale: recommendation.reasons,
          alternatives: recommendation.alternatives,
        },
      };
    } catch (error) {
      console.error("recommendStrategy failed", error);
      return { success: false, error: "Unable to generate recommendation" };
    }
  },
});

/* -----------------------
   Helper functions
   ----------------------- */

function getNextQuestionHint(lastField: string): string {
  const flowMap: Record<string, string> = {
    budget: "Ask about deposit amount (or deposit %)",
    deposit: "Ask about investment timeline",
    timeline: "Ask about risk tolerance",
    riskTolerance: "Ask about primary investment goal",
    investmentGoal: "Consider calling summarizeProfile and recommendStrategy",
  };
  return flowMap[lastField] || "Continue discovery";
}

function getSuggestedOptions(field: string): string[] {
  const optionsMap: Record<string, string[]> = {
    riskTolerance: ["Low - Stable income", "Medium - Balanced", "High - Maximum growth"],
    timeline: ["Short (< 1 year)", "Medium (1-3 years)", "Long (3+ years)"],
    investmentGoal: ["Passive income", "Wealth building", "Retirement planning", "Diversification"],
  };
  return optionsMap[field] ?? [];
}

function calculateProfileCompleteness(profile: Doc<"strategies">): number {
  const required = ["budget", "deposit", "timeline", "riskTolerance", "investmentGoal"];
  const filled = required.filter((f) => profile[f as keyof Doc<"strategies">] != null && profile[f as keyof Doc<"strategies">] !== "");
  return filled.length / required.length;
}

/**
 * Strategy recommendation algorithm (improved rule-based but deterministic)
 * Produces a top strategy, confidence (0..1), reasons[], and alternatives[].
 */
function calculateStrategyRecommendation(profile: Doc<"strategies">) {
  const scores: Record<StrategyType, number> = {
    CASH_FLOW: 0,
    CAPITAL_GROWTH: 0,
    RENOVATION_FLIP: 0,
    DEVELOPMENT: 0,
    SMSF: 0,
    COMMERCIAL: 0,
  };

  // Normalize and guard values
  const timeline = (profile.timeline || "").toLowerCase();
  const goal = (profile.type || "").toLowerCase();
  const risk = (profile.riskTolerance || "").toLowerCase();
  const budget = Number(profile.budget || 0);
  const currentPortfolio = profile.params?.previousExperience || [];

  // Scoring rules (weighted)
  if (goal.includes("passive")) scores.CASH_FLOW += 40;
  if (goal.includes("wealth") || goal.includes("growth")) scores.CAPITAL_GROWTH += 35;
  if (goal.includes("retire")) {
    scores.CASH_FLOW += 25;
    scores.CAPITAL_GROWTH += 25;
  }

  if (risk === "high") {
    scores.RENOVATION_FLIP += 20;
    scores.DEVELOPMENT += 20;
    scores.CAPITAL_GROWTH += 10;
  } else if (risk === "medium") {
    scores.CAPITAL_GROWTH += 10;
    scores.CASH_FLOW += 10;
  } else if (risk === "low") {
    scores.CASH_FLOW += 20;
  }

  if (timeline.includes("short")) {
    scores.RENOVATION_FLIP += 30;
    scores.CASH_FLOW += 10;
  } else if (timeline.includes("long")) {
    scores.CAPITAL_GROWTH += 25;
    scores.DEVELOPMENT += 10;
  }

  if (budget > 500000) {
    scores.DEVELOPMENT += 20;
    scores.COMMERCIAL += 10;
  } else if (budget > 200000) {
    scores.RENOVATION_FLIP += 10;
    scores.CAPITAL_GROWTH += 10;
  }

  if (Array.isArray(currentPortfolio) && currentPortfolio.includes("smsf")) {
    scores.SMSF += 50;
  }

  // pick top
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [StrategyType, number][];
  const [topStrategy, topScore] = sorted[0];
  const alternatives = sorted.slice(1, 3).map(([k]) => k);

  const confidence = Math.min(Math.max(topScore / 100, 0), 0.99);

  const reasons = generateReasons(topStrategy, profile);

  return {
    strategyType: topStrategy,
    confidence,
    reasons,
    alternatives,
  };
}

type ProfileSignals = {
  horizon: "short" | "medium" | "long" | "unknown";
  risk: "low" | "medium" | "high" | "unknown";
  budgetBand: "low" | "mid" | "high";
  handsOn: boolean;
  experienceLevel: "none" | "some" | "experienced";
  incomeFocus: boolean;
  growthFocus: boolean;
};

function extractSignals(profile: Doc<"strategies">): ProfileSignals {
  const timeline = (profile.timeline || "").toLowerCase();
  const risk = (profile.riskTolerance || "").toLowerCase();
  const budget = Number(profile.budget || 0);
  const experience = profile.params?.previousExperience;

  return {
    horizon: timeline.includes("short")
      ? "short"
      : timeline.includes("long")
      ? "long"
      : timeline
      ? "medium"
      : "unknown",

    risk:
      risk === "high" || risk === "medium" || risk === "low"
        ? (risk as ProfileSignals["risk"])
        : "unknown",

    budgetBand:
      budget > 600_000 ? "high" : budget > 250_000 ? "mid" : "low",

    handsOn:
      profile.managementStyle === "hands_on" ||
      profile.params?.propertyAge === "old",

    experienceLevel:
      Array.isArray(experience) && experience.length > 2
        ? "experienced"
        : Array.isArray(experience) && experience.length > 0
        ? "some"
        : "none",

    incomeFocus:
      profile.params?.cashflowExpectations === "high" ||
      profile.type === "CASH_FLOW",

    growthFocus:
      profile.type === "CAPITAL_GROWTH" ||
      profile.type === "DEVELOPMENT",
  };
}

function generateReasons(
  strategy: StrategyType,
  profile: Doc<"strategies">,
  scoreBreakdown?: Record<StrategyType, number>,
): string[] {
  const s = extractSignals(profile);
  const reasons: string[] = [];

  // --- horizon driven ---
  if (s.horizon === "short") {
    if (strategy === "RENOVATION_FLIP") {
      reasons.push(
        "Your shorter investment horizon favors strategies that can unlock value quickly rather than waiting for long-term appreciation.",
      );
    }
    if (strategy === "CASH_FLOW") {
      reasons.push(
        "A near-term timeline makes immediate rental income more relevant than delayed capital growth.",
      );
    }
  }

  if (s.horizon === "long" && strategy === "CAPITAL_GROWTH") {
    reasons.push(
      "A longer time horizon allows you to ride market cycles and benefit from compounding capital growth.",
    );
  }

  // --- risk alignment ---
  if (s.risk === "high") {
    if (["DEVELOPMENT", "RENOVATION_FLIP"].includes(strategy)) {
      reasons.push(
        "Your higher risk tolerance aligns with value-add strategies that trade certainty for upside potential.",
      );
    }
  }

  if (s.risk === "low" && strategy === "CASH_FLOW") {
    reasons.push(
      "With a lower risk appetite, stable cash-generating assets provide predictability and downside protection.",
    );
  }

  // --- budget implications ---
  if (s.budgetBand === "high") {
    if (strategy === "DEVELOPMENT" || strategy === "COMMERCIAL") {
      reasons.push(
        "Your higher budget opens access to opportunities that require more capital but offer structural advantages.",
      );
    }
  }

  if (s.budgetBand === "mid" && strategy === "RENOVATION_FLIP") {
    reasons.push(
      "A mid-range budget is well suited to targeted renovation strategies where improvements directly translate to value uplift.",
    );
  }

  // --- experience & involvement ---
  if (s.experienceLevel !== "none") {
    if (["DEVELOPMENT", "RENOVATION_FLIP"].includes(strategy)) {
      reasons.push(
        "Your prior experience reduces execution risk in more hands-on investment strategies.",
      );
    }
  }

  if (!s.handsOn && strategy === "CASH_FLOW") {
    reasons.push(
      "A preference for lower involvement aligns with income-focused assets that can be professionally managed.",
    );
  }

  // --- income vs growth intent ---
  if (s.incomeFocus && strategy === "CASH_FLOW") {
    reasons.push(
      "Your cashflow expectations directly align with an income-first investment approach.",
    );
  }

  if (s.growthFocus && strategy === "CAPITAL_GROWTH") {
    reasons.push(
      "Your growth-oriented objectives benefit from assets that prioritise appreciation over short-term yield.",
    );
  }

  // --- fallback (never empty) ---
  if (reasons.length === 0) {
    reasons.push(
      "Based on the combination of your goals, timeline, and risk profile, this strategy offers the most balanced alignment.",
    );
  }

  // Limit verbosity
  return reasons.slice(0, 4);
}
