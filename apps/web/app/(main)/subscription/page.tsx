import SubscriptionPage from "@/components/subscription-page";
import { currentUser } from "@/lib/clerk/currentUser";
import { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your subscription and billing details",
};

export default function SubscriptionCheckOutPage() {
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
            to manage subscriptions.
          </p>
        </div>
      </main>
    );
  }
  return <SubscriptionPage userId={user?.clerkUserId as string} />;
}
