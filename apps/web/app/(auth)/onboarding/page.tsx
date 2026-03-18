import OnboardingWizard from "@/components/onboarding-wizard";
import { currentUser } from "@/lib/clerk/currentUser";
import { use } from "react";

export default function OnboardingPage() {
  const user = use(currentUser());

  if (!user?.clerkUserId) {
    return (
      <main className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-[#1a1f26] rounded-2xl border border-white/[0.08] p-8 space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0d7377] to-[#095456] rounded-xl flex items-center justify-center font-serif font-bold text-xl text-white mb-4">
            P
          </div>
          <h1 className="text-2xl font-semibold text-[#f7f9fc]">
            Authentication isn&apos;t configured
          </h1>
          <p className="text-[#9ba3af]">
            Set <code className="font-mono bg-[#242b33] px-1.5 py-0.5 rounded text-[#1a9599]">CLERK_SECRET_KEY</code> and{" "}
            <code className="font-mono bg-[#242b33] px-1.5 py-0.5 rounded text-[#1a9599]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            to access onboarding.
          </p>
        </div>
      </main>
    );
  }

  return <OnboardingWizard userId={user?.clerkUserId as string} />;
}
