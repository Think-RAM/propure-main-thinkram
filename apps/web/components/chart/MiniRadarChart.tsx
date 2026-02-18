"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { metric: "Jan", value: 4 },
  { metric: "Feb", value: 5 },
  { metric: "Mar", value: 3 },
  { metric: "Apr", value: 4 },
  { metric: "May", value: 6 },
  { metric: "Jun", value: 5 },
];

export default function MiniRadarChart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8 }} />

          <Radar
            dataKey="value"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
