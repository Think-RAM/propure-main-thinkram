import { currentUser, CurrentUser } from "@/lib/clerk/currentUser";
import { Plan } from "@/types/types";
import { useEffect, useState } from "react";

export function useSubscription(requiredPlans: Plan[]) {
  const [currentSession, setCurrentSession] = useState<CurrentUser | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const callback = async () => {
      const session = await currentUser();
      setCurrentSession(session);
      setLoading(false);
    };
    callback();
  }, []);

  if (!currentSession) {
    // Optionally, you can return loading state here
    return {
      hasAccess: false,
      showCallToAction: false,
      isSubscriptionLoaded: false,
      currentPlan: null,
      isExpired: false,
      subcriptionId: null,
    };
  }

  const hasAccess = requiredPlans.includes(
    currentSession.publicMetadata?.subscriptionPlan as Plan
  );

  return {
    hasAccess,
    showCallToAction: !hasAccess,
    isSubscriptionLoaded: !loading,
    subcriptionId: currentSession.publicMetadata?.subscriptionId ?? null,
    currentPlan: currentSession.publicMetadata?.subscriptionPlan as Plan | null,
    isExpired: currentSession.publicMetadata?.subscriptionEndDate
      ? currentSession.publicMetadata.subscriptionEndDate < Date.now() / 1000
      : false,
  };
}
