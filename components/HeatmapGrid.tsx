"use client";

import React, { useState } from "react";

export default function HeatmapGrid() {
  const [filter, setFilter] = useState<
    "all" | "vitality" | "deepwork" | "movement"
  >("all");
  const totalDays = 52 * 7;
  const currentDay = 265;

  const getCellColor = (i: number) => {
    if (i > currentDay) return "bg-surface-container-lowest";
    if (i >= currentDay - 42) {
      if (filter === "vitality")
        return "bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.4)]";
      if (filter === "movement" && i % 7 === 6)
        return "bg-surface-container-high";
      return "bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.4)]";
    }
    const pseudo = (i * 17) % 5;
    if (pseudo === 4) return "bg-cyan-500/80";
    if (pseudo === 3) return "bg-cyan-600/50";
    if (pseudo === 2) return "bg-cyan-800/30";
    return "bg-surface-container-high";
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            2026 Year-to-Date Discipline Matrix
          </h2>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">
            365 operational temporal lattice nodes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {(["all", "vitality", "deepwork", "movement"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2.5 py-1 rounded transition-all capitalize ${
                filter === key
                  ? "bg-cyan-500 text-[#002b33] font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[900px]">
          <div className="flex justify-between text-[11px] font-mono text-on-surface-variant px-6 mb-2">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
            {Array.from({ length: totalDays }).map((_, i) => (
              <div
                key={i}
                title={`Day ${i + 1}`}
                className={`w-[11px] h-[11px] rounded-[2px] transition-colors cursor-pointer ${getCellColor(i)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
