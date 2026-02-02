"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Affordability", value: 85 },
  { name: "Schools", value: 72 },
  { name: "Amenities", value: 85 },
  { name: "Transport", value: 91 },
  { name: "Growth", value: 68 },
];

export default function BuyerAffordabilityChart() {
  return (
    <div className="h-[250px] border border-grid-20 p-2.5 relative">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          {/* Grid */}
          <CartesianGrid
            stroke="#e5e7eb"
            vertical={false}
          />

          {/* X Axis */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y Axis */}
          <YAxis
            width={30}
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip />

          {/* Bars */}
          <Bar
            dataKey="value"
            fill="#14b8a6"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
