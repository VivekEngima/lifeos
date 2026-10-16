"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TransactionPoint {
  date: string;
  amount: number;
  title?: string;
}

interface FinancialVelocityChartProps {
  transactions?: TransactionPoint[];
  monthlyBudget?: number;
}

export function FinancialVelocityChart({
  transactions = [],
  monthlyBudget = 2000,
}: FinancialVelocityChartProps) {
  // Aggregate transactions by date
  const dataMap = new Map<string, number>();

  // If there are transactions, aggregate by day
  transactions.forEach((t) => {
    const d = t.date ? t.date.slice(5) : "Day"; // "MM-DD"
    const current = dataMap.get(d) || 0;
    dataMap.set(d, current + Math.abs(t.amount));
  });

  // Convert to chart array
  const chartData = Array.from(dataMap.entries()).map(([date, spend]) => ({
    date,
    spend,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-24 w-full flex items-center justify-center rounded-lg border border-dashed border-outline-variant/40 bg-surface-container/30 text-[11px] font-mono text-on-surface-variant">
        No transaction telemetry to plot
      </div>
    );
  }

  return (
    <div className="w-full h-28 pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 8, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
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
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-zinc-950/95 border border-emerald-500/40 p-2 rounded-md shadow-xl text-[10px] font-mono text-zinc-200">
                    <p className="text-zinc-400">{data.date}</p>
                    <p className="font-bold text-emerald-400">
                      ₹{data.spend.toLocaleString()} Spent
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
