'use client'
import LoadingLoginCard from "@/components/loaders/loading-login-card";
import { SignIn } from "@clerk/nextjs";

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
            to enable sign-in.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-center">
      <SignIn
        fallback={<LoadingLoginCard />}
      />
    </section>
  );
}
