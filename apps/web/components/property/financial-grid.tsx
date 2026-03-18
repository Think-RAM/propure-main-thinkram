
import { FinancialMetric } from "@/lib/property";
import { MetricCard } from "./metric-card";

interface Props {
  metrics: FinancialMetric[];
}

export function FinancialGrid({ metrics }: Props) {
  if (!metrics?.length) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}