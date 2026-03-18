"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface RiskFactor {
  name: string;
  value: number;
}

interface Props {
  risk: {
    score: number;
    label: string;
    factors: RiskFactor[];
  };
}

export function RiskAnalysis({ risk }: Props) {
  const data = risk.factors.map((f) => ({
    subject: f.name,
    value: f.value,
  }));

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4">
      
      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-2">
        Multi-Factor Risk Analysis
      </h3>

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            
            <PolarGrid stroke="#27272a" />

            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
            />

            <Radar
              name="Risk"
              dataKey="value"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score */}
      <div className="text-center mt-3">
        <p className="text-lg font-semibold text-white">
          {risk.label}
        </p>
        <p className="text-xs text-zinc-400">
          Composite Score: {risk.score}/100 (lower is better)
        </p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
        {risk.factors.map((factor) => (
          <RiskRow key={factor.name} factor={factor} />
        ))}
      </div>
    </Card>
  );
}

function RiskRow({ factor }: { factor: { name: string; value: number } }) {
  const level = getLevel(factor.value);

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400">{factor.name}</span>

      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < level;

          return (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                filled ? getColor(level) : "bg-zinc-700"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function getLevel(value: number) {
  // convert 0–100 → 1–5 scale
  if (value < 20) return 1;
  if (value < 40) return 2;
  if (value < 60) return 3;
  if (value < 80) return 4;
  return 5;
}

function getColor(level: number) {
  if (level <= 2) return "bg-emerald-400";
  if (level === 3) return "bg-amber-400";
  return "bg-red-400";
}