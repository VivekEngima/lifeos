"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FocusPoint {
  day: string;
  hours: number;
  date?: string;
  sessionsCount?: number;
}

interface FocusTelemetryChartProps {
  data?: FocusPoint[];
}

export function FocusTelemetryChart({ data }: FocusTelemetryChartProps) {
  // If no data provided, render truthful 7-day pacing starting at 0 hours (no fake synthetic numbers)
  const chartData = data && data.length > 0
    ? data
    : [
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
      ];

  const maxHours = Math.max(...chartData.map((d) => d.hours || 0), 0);
  const yDomainMax = Math.max(Math.ceil(maxHours) + 1, 4);

  return (
    <div className="w-full h-24 pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 8, left: -25, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            stroke="#71717a"
            fontSize={9}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            domain={[0, yDomainMax]}
            tickFormatter={(val) => `${val}h`}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as FocusPoint;
                return (
                  <div className="bg-zinc-950/95 border border-amber-500/40 p-2 rounded-md shadow-xl text-[10px] font-mono text-zinc-200">
                    <p className="text-zinc-400">{item.day}{item.date ? ` (${item.date})` : ""}</p>
                    <p className="font-bold text-amber-400">
                      {item.hours}h Deep Work
                    </p>
                    {item.sessionsCount !== undefined && item.sessionsCount > 0 && (
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        {item.sessionsCount} session{item.sessionsCount === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="hours"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
