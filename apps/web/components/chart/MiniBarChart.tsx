"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", value: 650 },
  { name: "Feb", value: 620 },
  { name: "Mar", value: 580 },
];

export default function MiniBarChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />

          <Tooltip
            formatter={(v: number) => v}
            labelFormatter={(l) => `Month: ${l}`}
          />

          <Bar dataKey="value" fill="#14b8a6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
