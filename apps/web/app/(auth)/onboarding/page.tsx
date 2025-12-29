import InvestmentWizard from "@/components/investment-wizard";
import { currentUser } from "@/lib/clerk/currentUser";
import { use } from "react";

export default function OnboardingPage() {
  const user = use(currentUser());

  if (!user?.clerkUserId) {
    return (
      <main className="min-h-min bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Authentication isn’t configured
          </h1>
          <p className="text-gray-600">
            Set <code className="font-mono">CLERK_SECRET_KEY</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            to access onboarding.
          </p>
        </div>
      </main>
    );
  }

  return <InvestmentWizard userId={user?.clerkUserId as string} />;
}
