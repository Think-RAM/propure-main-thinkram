"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-2xl">
        
        {/* Card Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          
          {/* Icon */}
          <div className="mx-auto w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold mb-2">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="text-zinc-400 text-sm mb-6">
            We couldn’t load this property analysis report.  
            This might be due to a temporary issue or an invalid report ID.
          </p>

          {/* Contextual Hint */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6 text-sm text-zinc-300">
            <p>
              If you accessed this page via a shared link, the report may no longer exist
              or hasn’t been generated yet.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
            <Button
              onClick={() => reset()}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Optional Debug (safe for dev) */}
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-6 text-xs text-red-400 text-left bg-black/40 p-3 rounded overflow-auto">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}