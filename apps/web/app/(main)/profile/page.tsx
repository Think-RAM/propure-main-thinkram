"use client";
import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <main className="min-h-min bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className=" max-w-fit mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6"
        >
          {/* Go Back Button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Your Profile
            </h1>
            <p className="text-gray-500 mt-2">
              Update your personal information, manage account settings, and set preferences.
            </p>
          </div>

          <div className="border-t pt-6">
            <UserProfile />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
