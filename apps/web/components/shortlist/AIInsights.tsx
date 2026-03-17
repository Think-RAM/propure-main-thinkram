"use client";

import { Bot } from "lucide-react";
import { Response } from "../elements/response";
import remarkGfm from "remark-gfm";

interface Props {
  strategy: string;
  recommendationSummaryMD: string;
}

export default function AIInsights({
  strategy,
  recommendationSummaryMD,
}: Props) {
  return (
    <section className="rounded-xl border border-teal-700/30 bg-gradient-to-r from-teal-700/20 to-teal-900/20 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        {/* Avatar (important from original design) */}
        <div className="w-12 h-11 rounded-lg bg-white/10 flex items-center justify-center">
          <Bot className="text-white" size={20} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">
            Propure AI Decision Analysis
          </h3>
          <p className="text-sm text-neutral-300">
            Based on your {strategy}
          </p>
        </div>
      </div>

      {/* Content Panel (glass effect like original) */}
      <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5">
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-yellow-300 prose-strong:font-semibold">
          <Response controls={{ table: true }} remarkPlugins={[remarkGfm]}>
            {recommendationSummaryMD}
          </Response>
        </div>
      </div>
    </section>
  );
}