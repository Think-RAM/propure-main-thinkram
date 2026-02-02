'use server';
import { Plan } from "@/types/types";
import clerkClient from "../clerk";
import { prisma, StrategyType } from "@propure/db";

export interface UserPreferences {
  primaryGoal: string;
  holdingPeriod: string;
  riskLevel: string;
  totalBudget: string;
  personalSavings: string;
  homeLoan: string;
  borrowingCapacity: string;
  cashflowExpectations: string;
  cashflowAmount: string;
  regions: string[];
  remoteInvesting: string;
  areaPreference: string;
  propertyType: string[];
  bedrooms: string;
  propertyAge: string;
  previousExperience: string;
  involvement: string;
  coInvestment: string;
  areaType: string;
  experienceLevel: string;
}

interface PublicMetadata {
  userPreferences: UserPreferences;
  onboardingComplete: boolean;
  subscriptionPlan: Plan;
  subscriptionEndDate: number;
}

const STRATEGY_TYPES: Record<string, StrategyType> = {
  "Long-term capital appreciation": StrategyType.CAPITAL_GROWTH,
  "Rental income": StrategyType.CASH_FLOW,
  "Flip & sell in short term": StrategyType.RENOVATION_FLIP,
  "Diversify portfolio": StrategyType.DEVELOPMENT,
  "Buy-to-live, but want it to be a good investment": StrategyType.SMSF,
  "cash-flow": StrategyType.CASH_FLOW,
  "growth": StrategyType.CAPITAL_GROWTH,
  "renovation": StrategyType.RENOVATION_FLIP,
  "diversify": StrategyType.DIVERSIFICATION,
  "development": StrategyType.DEVELOPMENT,
  "smsf": StrategyType.SMSF,
};

const updateUserMetadata = async (userId: string, metadata?: PublicMetadata, privateMetadata?: any) => {
  try {
    console.log("Updating user metadata for userId:", userId);
    console.log("Metadata to update:", metadata);
    console.log("Private Metadata to update:", privateMetadata);
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...metadata,
      },
      privateMetadata: {
        ...privateMetadata,
      },
    });
    if (metadata) {
      console.log("Updating application database for userId:", userId);
      const applicationUser = await prisma.user.findUniqueOrThrow({
        where: { clerkUserId: userId },
      });
      console.log("Found application user:", applicationUser);
      await prisma.strategy.create({
        data: {
          userId: applicationUser.id,
          status: "ACTIVE",
          type: STRATEGY_TYPES[metadata.userPreferences.primaryGoal],
          budget: parseFloat(metadata.userPreferences.totalBudget.replace(/[^0-9.-]+/g, "")),
          deposit: parseFloat(metadata.userPreferences.personalSavings.replace(/[^0-9.-]+/g, "")),
          riskTolerance: metadata.userPreferences.riskLevel,
          income: parseFloat(metadata.userPreferences.personalSavings.replace(/[^0-9.-]+/g, "")),
          timeline: metadata.userPreferences.holdingPeriod,
          managementStyle: metadata.userPreferences.involvement,
          params: {
            // regions: metadata.userPreferences.regions,
            // remoteInvesting: metadata.userPreferences.remoteInvesting,
            // areaPreference: metadata.userPreferences.areaPreference,
            // propertyType: metadata.userPreferences.propertyType,
            // bedrooms: metadata.userPreferences.bedrooms,
            // propertyAge: metadata.userPreferences.propertyAge,
            // previousExperience: metadata.userPreferences.previousExperience,
            // coInvestment: metadata.userPreferences.coInvestment,
            // cashflowExpectations: metadata.userPreferences.cashflowExpectations,
            // cashflowAmount: metadata.userPreferences.cashflowAmount,
            regions: metadata.userPreferences.regions,
            areaType: metadata.userPreferences.areaType,
            propertyType: metadata.userPreferences.propertyType,
            minBedrooms: metadata.userPreferences.bedrooms,
            experienceLevel: metadata.userPreferences.experienceLevel,
          }
        }
      })
    }
    console.log("User metadata updated successfully");
  } catch (error) {
    console.error("Error updating user metadata:", error);
  }
};

export default updateUserMetadata;
