"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Try to extract chatId if present in message (optional safety)
  const chatIdMatch = error?.message?.match(/chatId[:=]\s*([a-zA-Z0-9-_]+)/i);
  const chatId = chatIdMatch?.[1];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419] text-white px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md p-6 text-center space-y-5">
          
          {/* Icon */}
          <div className="w-12 h-12 mx-auto rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={22} />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold">
            Unable to load shortlist
          </h2>

          {/* Context Message */}
          <p className="text-sm text-neutral-400 leading-relaxed">
            We couldn’t find the shortlist report
            {chatId ? (
              <>
                {" "}for ID{" "}
                <span className="text-neutral-200 font-medium">
                  {chatId}
                </span>
              </>
            ) : null}
            . This may be due to a temporary issue or the report no longer exists.
          </p>

          {/* Secondary hint */}
          <p className="text-xs text-neutral-500">
            Try refreshing or come back later.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Try again
            </Button>

            <Button
              variant="outline"
              className="w-full border-neutral-700 text-black hover:bg-[#f7f9fc]"
              onClick={() => window.location.href = "/"}
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}