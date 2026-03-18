import { Card } from "@/components/ui/card";
import { Scenario } from "@/lib/property";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";


interface Props {
  scenario: Scenario;
  scenarios: Scenario[];
}

export function ScenarioCard({ scenario, scenarios }: Props) {
  const isBest = isBestScenario(scenario, scenarios);
  const style = getScenarioStyle(scenario.type);

  return (
    <Card
      className={`
        p-5 cursor-pointer transition-all duration-200
        border
        ${isBest ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : "border-zinc-800"}
        ${style.bg}
        hover:border-zinc-600
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg}`}>
          <style.icon className="h-5 w-5 text-black" />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            {scenario.title}
          </p>
          <p className="text-xs text-zinc-400">
            {scenario.subtitle}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <Metric label="Property Value" value={`$${scenario.metrics.propertyValue.toLocaleString()}`} />
        <Metric label="Total Equity" value={`$${scenario.metrics.equity.toLocaleString()}`} />

        <Metric
          label="Total ROI"
          value={`${scenario.metrics.roi}%`}
          highlight
          positive={scenario.metrics.roi > 100}
        />
      </div>

      {/* Recommended Badge */}
      {isBest && (
        <div className="mt-4 text-xs text-emerald-400 font-medium">
          ✓ Best Outcome
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  highlight,
  positive,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-zinc-400">{label}</span>

      <span
        className={`font-semibold ${
          highlight
            ? positive
              ? "text-emerald-400 text-lg"
              : "text-amber-400 text-lg"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function isBestScenario(current: Scenario, all: Scenario[]) {
  if (current.isRecommended) return true;

  const maxROI = Math.max(...all.map((s) => s.metrics.roi));
  return current.metrics.roi === maxROI;
}

function getScenarioStyle(type: Scenario["type"]) {
  switch (type) {
    case "optimistic":
      return {
        bg: "bg-emerald-500/10",
        iconBg: "bg-emerald-400",
        icon: TrendingUp,
      };

    case "base":
      return {
        bg: "bg-zinc-800/40",
        iconBg: "bg-emerald-500",
        icon: Minus,
      };

    case "pessimistic":
      return {
        bg: "bg-amber-500/10",
        iconBg: "bg-amber-400",
        icon: TrendingDown,
      };
    default:
      return {
        bg: "bg-zinc-800",
        iconBg: "bg-zinc-600",
        icon: Minus,
      };
  }
}