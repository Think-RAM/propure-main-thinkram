'use client'
import LoadingLoginCard from "@/components/loaders/loading-login-card";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="flex justify-center">
      <SignIn
        fallback={<LoadingLoginCard />}
      />
    </section>
  );
}
