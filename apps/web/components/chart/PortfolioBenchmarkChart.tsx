"use client";

import {
      LineChart,
      Line,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      Legend,
      ResponsiveContainer,
} from "recharts";

const data = [
      { month: "Jan", portfolio: 100, benchmark: 95 },
      { month: "Feb", portfolio: 105, benchmark: 98 },
      { month: "Mar", portfolio: 112, benchmark: 102 },
      { month: "Apr", portfolio: 118, benchmark: 105 },
      { month: "May", portfolio: 125, benchmark: 108 },
      { month: "Jun", portfolio: 128, benchmark: 110 },
];

export default function PortfolioBenchmarkChart() {
      return (
            <div className="h-[250px] border border-grid-20 p-2.5 relative">
                  {/* Inner container must fill remaining height */}
                  <div className="w-full h-full">
                        <ResponsiveContainer>
                              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    {/* Grid */}
                                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

                                    {/* Axes */}
                                    <XAxis
                                          dataKey="month"
                                          tick={{ fontSize: 11 }}
                                          axisLine={false}
                                          tickLine={false}
                                    />
                                    <YAxis
                                          width={35}
                                          tick={{ fontSize: 11 }}
                                          axisLine={false}
                                          tickLine={false}
                                          domain={["dataMin - 5", "dataMax + 5"]}
                                    />

                                    {/* Tooltip */}
                                    <Tooltip />

                                    {/* Legend */}
                                    <Legend
                                          verticalAlign="bottom"
                                          align="center"
                                          iconType="rect"
                                          wrapperStyle={{ fontSize: "12px" }}
                                    />

                                    {/* Portfolio */}
                                    <Line
                                          type="monotone"
                                          dataKey="portfolio"
                                          name="Portfolio"
                                          stroke="#14b8a6"
                                          strokeWidth={2.5}
                                          dot={{ r: 3 }}
                                          activeDot={{ r: 5 }}
                                    />

                                    {/* Benchmark */}
                                    <Line
                                          type="monotone"
                                          dataKey="benchmark"
                                          name="Benchmark"
                                          stroke="#0f172a"
                                          strokeWidth={2}
                                          strokeDasharray="6 6"
                                          dot={{ r: 3 }}
                                    />
                              </LineChart>
                        </ResponsiveContainer>
                  </div>
            </div>
      );
}
