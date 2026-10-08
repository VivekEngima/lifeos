"use client";

import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";

type HeatmapFilter = "all" | "vitality" | "deepwork" | "movement" | "svadhyaya";

export default function HeatmapGrid() {
  const { state } = useLifeOS();
  const [filter, setFilter] = useState<HeatmapFilter>("all");
  const [mounted, setMounted] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{ dayNum: number; status: string; discipline: number } | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lifeos_heatmap_filter") as HeatmapFilter | null;
      if (
        saved &&
        ["all", "vitality", "deepwork", "movement", "svadhyaya"].includes(saved)
      ) {
        setFilter(saved);
      }
    } catch (e) {
      // ignore
    }
    setMounted(true);
  }, []);

  const handleFilterSelect = (filterKey: HeatmapFilter) => {
    setFilter(filterKey);
    try {
      localStorage.setItem("lifeos_heatmap_filter", filterKey);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetch("/api/streaks")
      .then((r) => r.json())
      .then((d) => setTelemetry(d))
      .catch((e) => console.error("Heatmap fetch error:", e));
  }, []);

  const totalDays = telemetry?.totalCells ?? 53 * 7;

  const getCellColor = (i: number) => {
    const tile = telemetry?.tiles?.[i];
    if (tile?.isPadding) return "bg-[#0e0e11] border-[#1e1e24]/20 opacity-30";
    if (tile?.isFuture) return "bg-[#0e0e11] border-[#1e1e24]/40";

    const level = tile ? (tile[filter] ?? tile.all) : 0;
    if (level === 4) {
      if (filter === "vitality") return "bg-[#f59e0b] shadow-[0_0_4px_rgba(245,158,11,0.4)] border-[#f59e0b]";
      if (filter === "movement") return "bg-[#10b981] shadow-[0_0_4px_rgba(16,185,129,0.4)] border-[#10b981]";
      return "bg-[#06b6d4] shadow-[0_0_4px_rgba(6,182,212,0.4)] border-[#06b6d4]";
    }
    if (level === 3) return "bg-[#06b6d4]/80 border-[#06b6d4]/80";
    if (level === 2) return "bg-[#06b6d4]/50 border-[#06b6d4]/50";
    if (level === 1) return "bg-[#06b6d4]/30 border-[#06b6d4]/30";
    return "bg-[#18181b] border-[#27272a]";
  };

  const getHoverStatus = (i: number) => {
    const tile = telemetry?.tiles?.[i];
    if (tile) return tile.hoverStatus;
    return `Day ${i + 1}: Syncing with Supabase...`;
  };

  const cleanStreak = telemetry?.brahmacharya?.cleanStreak ?? 0;

  return (
    <div className="bg-[#121215] rounded-[4px] p-5 border border-[#1e1e24] flex flex-col gap-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#f4f4f5] flex items-center gap-2 font-sans tracking-tight">
            <span className="w-2 h-2 rounded-[2px] bg-[#06b6d4] shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            2026 Year-to-Date Discipline &amp; Consistency Matrix
          </h2>
          <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
            53 weeks · 371 temporal lattice nodes • Current clean chain:{" "}
            <strong className="text-[#f59e0b]">
              {cleanStreak} Days Unbroken
            </strong>
          </p>
        </div>

        {/* Flush Vector Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {(
            [
              { key: "all", label: "All Vectors" },
              { key: "vitality", label: "NoFap / Vitality" },
              { key: "deepwork", label: "Deep Work" },
              { key: "movement", label: "Sadhana" },
              { key: "svadhyaya", label: "Reading" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => handleFilterSelect(item.key)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                mounted && filter === item.key
                  ? "bg-[#f4f4f5] text-[#09090b] font-bold shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  : "bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Separated Month Heatmap Lattice Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#27272a]">
        <div className="w-full flex flex-col gap-3 min-w-[980px]">
          {/* Grid with exact Monday-to-Sunday indicator & distinct month blocks */}
          <div className="flex gap-2 sm:gap-2.5 items-start w-full">
            {/* Day of Week Labels: Mon, Wed, Fri, Sun */}
            <div className="flex flex-col pt-[23px] font-mono text-[10px] text-[#71717a] select-none pr-1 text-right w-[24px] shrink-0">
              <div className="grid grid-rows-7 gap-[2.5px]">
                <span className="h-[12px] leading-[12px]">Mon</span>
                <span className="h-[12px] leading-[12px] opacity-0">Tue</span>
                <span className="h-[12px] leading-[12px]">Wed</span>
                <span className="h-[12px] leading-[12px] opacity-0">Thu</span>
                <span className="h-[12px] leading-[12px]">Fri</span>
                <span className="h-[12px] leading-[12px] opacity-0">Sat</span>
                <span className="h-[12px] leading-[12px]">Sun</span>
              </div>
            </div>

            {/* All 12 Months Clusters spanning edge-to-edge */}
            <div className="flex items-start justify-between flex-1 gap-1 sm:gap-1.5 md:gap-2 w-full">
              {(telemetry?.months || []).map((m: any) => (
                <div key={m.name} className="flex flex-col gap-1 items-center shrink-0">
                  {/* Month Label aligned directly on top of this month's columns */}
                  <div className="font-mono text-[11px] font-bold text-[#a1a1aa] tracking-wider text-center">
                    {m.name}
                  </div>

                  {/* Month Grid: m.numCols x 7 rows */}
                  <div
                    className="grid grid-flow-col grid-rows-7 gap-[2.5px] p-1 rounded-md bg-[#09090b]/60 border border-[#1e1e24] shadow-inner"
                    style={{ gridTemplateColumns: `repeat(${m.numCols}, 12px)` }}
                  >
                    {m.tiles.map((tile: any, idx: number) => {
                      if (tile.isEmpty) {
                        return (
                          <div
                            key={idx}
                            className="w-[12px] h-[12px] rounded-[2px] opacity-0 pointer-events-none"
                          />
                        );
                      }

                      const level = tile[filter] ?? tile.all ?? 0;
                      const isToday = tile.isToday;
                      const isRecentPeak = level === 4 && !tile.isFuture;
                      const hoverText = tile.hoverStatus;

                      let cellBg = "bg-[#18181b] border-[#27272a]";
                      if (tile.isFuture) {
                        cellBg = "bg-[#0e0e11] border-[#1e1e24]/40";
                      } else if (level === 4) {
                        if (filter === "vitality") cellBg = "bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.5)] border-[#f59e0b]";
                        else if (filter === "movement") cellBg = "bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)] border-[#10b981]";
                        else cellBg = "bg-[#06b6d4] shadow-[0_0_6px_rgba(6,182,212,0.5)] border-[#06b6d4]";
                      } else if (level === 3) {
                        cellBg = "bg-[#06b6d4]/80 border-[#06b6d4]/80";
                      } else if (level === 2) {
                        cellBg = "bg-[#06b6d4]/50 border-[#06b6d4]/50";
                      } else if (level === 1) {
                        cellBg = "bg-[#06b6d4]/30 border-[#06b6d4]/30";
                      }

                      return (
                        <div
                          key={idx}
                          title={hoverText}
                          onMouseEnter={() => {
                            setHoveredDay({
                              dayNum: tile.dayNum,
                              status: hoverText,
                              discipline: tile.disciplineScore ?? 0,
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredDay(null);
                          }}
                          className={`heatmap-cell w-[14px] h-[14px] rounded-[2.5px] border transition-all hover:scale-125 hover:z-20 cursor-pointer relative ${cellBg} ${
                            isToday
                              ? "ring-1 ring-white/90 border border-white/70 shadow-sm"
                              : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Hover Status Bar */}
      <div className="flex items-center justify-between font-mono text-xs text-[#a1a1aa] pt-2 border-t border-[#1e1e24]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>
            {hoveredDay ? (
              <span className="text-[#f4f4f5]">
                {hoveredDay.status}
              </span>
            ) : (
              "Hover any node across 2026 to inspect sealed Supabase telemetry"
            )}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Void</span>
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#18181b] border border-[#27272a]" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#06b6d4]/30" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#06b6d4]/60" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#06b6d4]" />
          <span>Mastery</span>
        </div>
      </div>
    </div>
  );
}
