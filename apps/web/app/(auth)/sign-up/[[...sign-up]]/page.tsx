'use client'
import LoadingLoginCard from "@/components/loaders/loading-login-card";
import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Propure account to start managing your property investments and access personalized insights.",
  applicationName: "Propure",
}

export default function Page() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <section className="flex justify-center px-4 py-10">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-md p-8 space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Clerk isn’t configured
          </h1>
          <p className="text-gray-600">
            Set{" "}
            <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
            to enable sign-up.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-center">
      <SignUp
        fallbackRedirectUrl={`/onboarding`}
        fallback={<LoadingLoginCard />}
      />
    </section>
  );
}
