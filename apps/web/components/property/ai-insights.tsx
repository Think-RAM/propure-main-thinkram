"use client";

import { Card } from "@/components/ui/card";
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface Props {
  data: {
    confidence: number;
    confidenceFactors: string[];
    cashFlow: {
      level: "strong" | "moderate" | "weak";
      description: string;
    };
    consideration: {
      title: string;
      description: string;
    };
    growth: {
      title: string;
      description: string;
    };
  };
}

export function AIInsights({ data }: Props) {
  return (
    <div className="rounded-xl p-6 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent border border-emerald-700/40">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              AI Investment Analysis
            </p>
            <p className="text-xs text-zinc-300">
              Powered insights
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {data.confidence}%
          </p>
          <p className="text-xs text-zinc-300">
            Confidence
          </p>
        </div>
      </div>

      {/* Confidence Breakdown */}
      <Card className="bg-white/5 border-white/10 p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-white">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Analysis Confidence Factors
        </div>

        <div className="space-y-2 text-sm">
          {data.confidenceFactors.map((factor, i) => (
            <div key={i} className="flex justify-between text-zinc-300">
              <span>{factor}</span>
              <span className="text-emerald-400 font-semibold">✓</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights List */}
      <div className="space-y-3">
        
        {/* Cash Flow */}
        <InsightItem
          icon={CheckCircle2}
          title={`Cash Flow: ${capitalize(data.cashFlow.level)}`}
          description={data.cashFlow.description}
          type={getCashflowType(data.cashFlow.level)}
        />

        {/* Risk */}
        <InsightItem
          icon={AlertTriangle}
          title={`Consideration: ${data.consideration.title}`}
          description={data.consideration.description}
          type="warning"
        />

        {/* Growth */}
        <InsightItem
          icon={Sparkles}
          title={`Growth Catalyst: ${data.growth.title}`}
          description={data.growth.description}
          type="positive"
        />
      </div>
    </div>
  );
}

function InsightItem({
  icon: Icon,
  title,
  description,
  type,
}: {
  icon: any;
  title: string;
  description: string;
  type: "positive" | "warning" | "neutral";
}) {
  const style = getInsightStyle(type);

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
      
      <div
        className={`w-9 h-9 rounded-md flex items-center justify-center ${style.bg}`}
      >
        <Icon className={`h-4 w-4 ${style.icon}`} />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>
        <p className="text-xs text-zinc-300 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

function getInsightStyle(type: "positive" | "warning" | "neutral") {
  switch (type) {
    case "positive":
      return {
        bg: "bg-emerald-500/20",
        icon: "text-emerald-400",
      };

    case "warning":
      return {
        bg: "bg-amber-500/20",
        icon: "text-amber-400",
      };

    default:
      return {
        bg: "bg-zinc-700/40",
        icon: "text-zinc-300",
      };
  }
}

function getCashflowType(level: "strong" | "moderate" | "weak") {
  if (level === "strong") return "positive";
  if (level === "weak") return "warning";
  return "neutral";
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}