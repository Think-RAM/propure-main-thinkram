'use server';
import { Plan } from "@/types/types";
import clerkClient from "../clerk";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import { StrategyType } from "@propure/convex";
import type { Id } from "@propure/convex/genereated";

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
  application_id: Id<"users">;
  userPreferences: UserPreferences;
  onboardingComplete: boolean;
  subscriptionPlan: Plan;
  subscriptionEndDate: number;
}

const STRATEGY_TYPES: Record<string, StrategyType> = {
  "Long-term capital appreciation": "CAPITAL_GROWTH",
  "Rental income": "CASH_FLOW",
  "Flip & sell in short term": "RENOVATION_FLIP",
  "Diversify portfolio": "DEVELOPMENT",
  "Buy-to-live, but want it to be a good investment": "SMSF",
  "cash-flow": "CASH_FLOW",
  "growth": "CAPITAL_GROWTH",
  "renovation": "RENOVATION_FLIP",
  "diversify": "DEVELOPMENT",
  "development": "DEVELOPMENT",
  "smsf": "SMSF",
};

const updateUserMetadata = async (userId: string, metadata?: PublicMetadata, privateMetadata?: any) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    console.log("Updating user metadata for userId:", userId);
    console.log("Metadata to update:", metadata);
    console.log("Private Metadata to update:", privateMetadata);
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        application_id: user.publicMetadata?.application_id ?? privateMetadata?.application_id,
        ...metadata,
      },
      privateMetadata: {
        ...privateMetadata,
      },
    });
    if (metadata) {
      const applicationUser = await client.query(
        api.functions.user.GetUserByClerkId,
        { clerkUserId: userId },
      );
      if (!applicationUser) {
        throw new Error("Application user not found");
      }
      await client.mutation(api.functions.strategy.CreateUpdateStrategy, {
        userId: applicationUser._id,
        type: STRATEGY_TYPES[metadata.userPreferences.primaryGoal],
        status: "ACTIVE",
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
        },
      });
    }
    console.log("User metadata updated successfully");
  } catch (error) {
    console.error("Error updating user metadata:", error);
  }
};

export default updateUserMetadata;
