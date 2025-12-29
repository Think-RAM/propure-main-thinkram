import InvestmentWizard from "@/components/investment-wizard";
import { currentUser } from "@/lib/clerk/currentUser";
import { use } from "react";

export default function OnboardingPage() {
  const user = use(currentUser());

  return <InvestmentWizard userId={user?.clerkUserId as string} />;
}
