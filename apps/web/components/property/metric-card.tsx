import { Card } from "@/components/ui/card";
import { FinancialMetric } from "@/lib/property";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";


interface Props {
  metric: FinancialMetric;
}

export function MetricCard({ metric }: Props) {
  const state = resolveState(metric);

  return (
    <Card className="p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition">
      
      {/* Label */}
      <p className="text-xs text-zinc-400">{metric.label}</p>

      {/* Value */}
      <p className={`text-xl font-semibold mt-1 ${state.valueColor}`}>
        {metric.value}
      </p>

      {/* Comparison */}
      {metric.comparison && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${state.compColor}`}>
          <state.icon className="h-3.5 w-3.5" />

          <span>
            {metric.comparison.value}
            {metric.comparison.label && (
              <span className="text-zinc-500 ml-1">
                {metric.comparison.label}
              </span>
            )}
          </span>
        </div>
      )}
    </Card>
  );
}

function resolveState(metric: FinancialMetric) {
  const type =
    metric.highlight ||
    metric.comparison?.type ||
    "neutral";

  switch (type) {
    case "positive":
      return {
        valueColor: "text-emerald-400",
        compColor: "text-emerald-400",
        icon: ArrowUpRight,
      };

    case "negative":
      return {
        valueColor: "text-red-400",
        compColor: "text-red-400",
        icon: ArrowDownRight,
      };

    case "warning":
      return {
        valueColor: "text-amber-400",
        compColor: "text-amber-400",
        icon: Minus,
      };

    default:
      return {
        valueColor: "text-white",
        compColor: "text-zinc-400",
        icon: Minus,
      };
  }
}