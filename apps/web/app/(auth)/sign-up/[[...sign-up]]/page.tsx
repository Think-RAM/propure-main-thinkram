'use client'
import LoadingLoginCard from "@/components/loaders/loading-login-card";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="flex justify-center">
      <SignUp
        fallbackRedirectUrl={`/onboarding`}
        fallback={<LoadingLoginCard />}
      />
    </section>
  );
}
