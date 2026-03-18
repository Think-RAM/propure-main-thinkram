"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { CashflowPoint } from "@/lib/property";



interface Props {
  data: {
    "5y": CashflowPoint[];
    "10y": CashflowPoint[];
    "20y": CashflowPoint[];
  };
}

type Range = "5y" | "10y" | "20y";

export function CashflowChart({ data }: Props) {
  const [range, setRange] = useState<Range>("5y");

  const chartData = data[range];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          Cash Flow Projection
        </h3>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["5y", "10y", "20y"] as Range[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              onClick={() => setRange(r)}
              className={`text-xs ${
                range === r
                  ? "bg-emerald-500 text-black hover:bg-emerald-400"
                  : "border-zinc-700 text-black hover:text-black hover:bg-white"
              }`}
            >
              {`${r.replace("y", "")} Years`}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            
            {/* Gradient */}
            <defs>
              <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
            />

            {/* Axes */}
            <XAxis
              dataKey="year"
              stroke="#71717a"
              fontSize={12}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickFormatter={(v) => `$${v / 1000}K`}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />

            {/* Area */}
            <Area
              type="monotone"
              dataKey="cashflow"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#cashflowGradient)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          Cash Flow
        </div>
      </div>
    </div>
  );
}