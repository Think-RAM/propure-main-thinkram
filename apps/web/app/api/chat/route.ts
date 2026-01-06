import {
  streamText,
  tool,
  createUIMessageStream,
  JsonToSseTransformStream,
  stepCountIs,
  smoothStream,
} from "ai";
import { google } from "@ai-sdk/google"

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@propure/db";
import { searchDomainProperties, searchRealestateProperties } from "@/lib/tools/propertySearchTools";
import { getDemographics, getEconomicIndicators, getPopulationProjections, getRbaRates, getSuburbProfile, getSuburbStats } from "@/lib/tools/marketTools";
import { getAuctionResults, getSalesHistory, getSoldProperties } from "@/lib/tools/salesTools";
import { calculateCashFlow, calculateROI } from "@/lib/tools/financialTools";
import { saveStrategy } from "@/lib/tools/strategyTools";

/* ======================================================================
   SYSTEM PROMPT
   ====================================================================== */

const SYSTEM_PROMPT = `
You are Propure AI, an expert Australian property investment advisor.

Your responsibilities:
1. Discover user investment goals conversationally
2. Recommend appropriate strategies
3. Research suburbs, properties, and markets
4. Analyze financial viability and risks

Rules:
- Ask ONE discovery question at a time
- Use tools whenever real data is needed
- Always cite yield, vacancy, and growth when available
- Use Australian property terminology
- Be conservative, accurate, and transparent
`;

/* ======================================================================
   ROUTE
   ====================================================================== */

export async function POST(req: Request) {
  const stream = createUIMessageStream({
    async execute({ writer: dataStream }) {
      /* ---------------- Auth ---------------- */

      const { userId } = await auth();
      if (!userId) {
        dataStream.write({
          type: "error",
          errorText: "Unauthorized user request.",
        })
        return;
      }

      const { messages, strategyId } = await req.json();

      /* ---------------- User Context ---------------- */

      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          strategies: {
            where: strategyId
              ? { id: strategyId }
              : { status: "ACTIVE" },
            take: 1,
            orderBy: { updatedAt: "desc" },
          },
        },
      });

      const activeStrategy = user?.strategies[0];

      const strategyContext = activeStrategy
        ? `
Current strategy:
- Type: ${activeStrategy.type}
- Budget: ${activeStrategy.budget ?? "Not set"}
- Deposit: ${activeStrategy.deposit ?? "Not set"}
- Risk: ${activeStrategy.riskTolerance ?? "Unknown"}
`
        : "";

      /* ---------------- AI Stream ---------------- */

      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT + strategyContext,
        messages,
        stopWhen: stepCountIs(12),
        experimental_transform: smoothStream({ chunking: "word" }),

        tools: {
          /* ============================================================
             PROPERTY SEARCH
             ============================================================ */

          searchDomainProperties: searchDomainProperties,

          searchRealestateProperties: searchRealestateProperties,

          /* ============================================================
             SUBURB & MARKET DATA
             ============================================================ */

          getSuburbStats: getSuburbStats,

          getSuburbProfile: getSuburbProfile,

          getDemographics: getDemographics,

          getPopulationProjections: getPopulationProjections, 

          getRbaRates: getRbaRates,

          getEconomicIndicators: getEconomicIndicators,

          /* ============================================================
             SALES & AUCTIONS
             ============================================================ */

          getSalesHistory: getSalesHistory,

          getSoldProperties: getSoldProperties,

          getAuctionResults: getAuctionResults,

          /* ============================================================
             FINANCIAL ANALYSIS
             ============================================================ */

          calculateCashFlow: calculateCashFlow,

          calculateROI: calculateROI,

          /* ============================================================
             STRATEGY PERSISTENCE
             ============================================================ */

          saveStrategy: saveStrategy({ user, strategyId }),
        },
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}
