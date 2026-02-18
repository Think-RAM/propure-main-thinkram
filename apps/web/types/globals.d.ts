import type { Id } from "@propure/convex/genereated";
import { Plan, UserPreferences } from "./types";

export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      isAdmin?: boolean;
      userPreferences?: UserPreferences;
    };
  }

  interface UserPrivateMetadata {
    application_id: Id<"users">;
  }

  interface UserPublicMetadata {
    onboardingComplete?: boolean;
    userPreferences?: UserPreferences;
    subscriptionPlan?: Plan;
    subscriptionStatus?: Stripe.Subscription.Status;
    subscriptionId?: string;
    subscriptionEndDate?: number; // Unix timestamp for when the subscription ends
    notifSettings?: {
      all: boolean;
      inApp: boolean;
      email: boolean;
    };
    application_id?: Id<"users">;
  }
  interface OrganizationMembershipPublicMetadata {
    onboardingComplete?: boolean;
    userPreferences?: UserPreferences;
  }
}