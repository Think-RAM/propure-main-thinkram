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
  return <SubscriptionPage userId={user?.clerkUserId as string} />;
}
