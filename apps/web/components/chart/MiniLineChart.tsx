"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", value: 4.8 },
  { month: "Feb", value: 4.9 },
  { month: "Mar", value: 5.0 },
  { month: "Apr", value: 5.1 },
  { month: "May", value: 5.2 },
  { month: "Jun", value: 5.4 },
];

export default function MiniLineChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 0.2", "dataMax + 0.2"]} />

          <Tooltip
            formatter={(v: number) => v.toFixed(1)}
            labelFormatter={(l) => `Month: ${l}`}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
