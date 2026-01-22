import { AnalystAgentTool } from "@/lib/tools/agents/analystAgent";
import { ResearcherAgentTool } from "@/lib/tools/agents/researcherAgent";
import { StrategyAgentTool } from "@/lib/tools/agents/strategistAgent";
// import { calculateCashFlow, calculateROI } from "@/lib/tools/financialTools";
// import { getDemographics, getEconomicIndicators, getPopulationProjections, getRbaRates, getSuburbProfile, getSuburbStats } from "@/lib/tools/marketTools";
// import { searchDomainProperties, searchRealestateProperties } from "@/lib/tools/propertySearchTools";
// import { saveStrategy } from "@/lib/tools/strategyTools";
import { InferUITool, UIDataTypes, UIMessage } from "ai";
import z from "zod";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// // Property Search Tools
// type searchDomainProperties = InferUITool<typeof searchDomainProperties>;
// type searchRealestateProperties = InferUITool<typeof searchRealestateProperties>;

// // Financial Tools
// type calculateCashFlow = InferUITool<typeof calculateCashFlow>;
// type calculateROI = InferUITool<typeof calculateROI>;

// // Market Tools
// type getSuburbStats = InferUITool<typeof getSuburbStats>;
// type getSuburbProfile = InferUITool<typeof getSuburbProfile>;
// type getDemographics = InferUITool<typeof getDemographics>;
// type getPopulationProjections = InferUITool<typeof getPopulationProjections>;
// type getRbaRates = InferUITool<typeof getRbaRates>;
// type getEconomicIndicators = InferUITool<typeof getEconomicIndicators>;

// // Strategy Tools
// type saveStrategy = InferUITool<ReturnType<typeof saveStrategy>>;

// Strategy Agent Tool
type strategist = InferUITool<ReturnType<typeof StrategyAgentTool>>;
type researcher = InferUITool<ReturnType<typeof ResearcherAgentTool>>;
type analyst = InferUITool<ReturnType<typeof AnalystAgentTool>>;

export type ChatTools = {
  // searchDomainProperties: searchDomainProperties;
  // searchRealestateProperties: searchRealestateProperties;
  // calculateCashFlow: calculateCashFlow;
  // calculateROI: calculateROI;
  // getSuburbStats: getSuburbStats;
  // getSuburbProfile: getSuburbProfile;
  // getDemographics: getDemographics;
  // getPopulationProjections: getPopulationProjections;
  // getRbaRates: getRbaRates;
  // getEconomicIndicators: getEconomicIndicators;
  // saveStrategy: saveStrategy;
  strategist: strategist;
  researcher: researcher;
  analyst: analyst;
}


export type ChatMessageAI = UIMessage<
  MessageMetadata,
  UIDataTypes,
  ChatTools
>;