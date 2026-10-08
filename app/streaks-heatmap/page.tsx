"use client";

import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";

type HeatmapFilter = "all" | "vitality" | "deepwork" | "movement" | "svadhyaya";

export default function StreaksPage() {
  const { state, notify } = useLifeOS();
  const [currentFilter, setCurrentFilter] = useState<HeatmapFilter>("all");
  const [mounted, setMounted] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Restore last selected tab from localStorage cleanly after mount to eliminate SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lifeos_heatmap_filter") as HeatmapFilter | null;
      if (
        saved &&
        ["all", "vitality", "deepwork", "movement", "svadhyaya"].includes(saved)
      ) {
        setCurrentFilter(saved);
      }
    } catch (e) {
      // ignore
    }
    setMounted(true);
  }, []);

  const handleFilterSelect = (filterId: HeatmapFilter) => {
    setCurrentFilter(filterId);
    try {
      localStorage.setItem("lifeos_heatmap_filter", filterId);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    async function loadStreaksData() {
      try {
        setLoading(true);
        const res = await fetch("/api/streaks");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (err) {
        console.error("Failed to load streaks telemetry from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStreaksData();
  }, []);

  const totalCells = telemetry?.totalCells ?? 53 * 7;

  const filterPalettes = {
    all: [
      "bg-surface-container-lowest",
      "bg-surface-container-high",
      "bg-cyan-500/40",
      "bg-cyan-500/75",
      "bg-cyan-400",
    ],
    vitality: [
      "bg-surface-container-lowest",
      "bg-surface-container-high",
      "bg-amber-400/40",
      "bg-amber-400/75",
      "bg-amber-400",
    ],
    deepwork: [
      "bg-surface-container-lowest",
      "bg-surface-container-high",
      "bg-cyan-400/30",
      "bg-cyan-400/70",
      "bg-cyan-500",
    ],
    movement: [
      "bg-surface-container-lowest",
      "bg-surface-container-high",
      "bg-emerald-400/30",
      "bg-emerald-400/70",
      "bg-emerald-400",
    ],
    svadhyaya: [
      "bg-surface-container-lowest",
      "bg-surface-container-high",
      "bg-cyan-300/30",
      "bg-cyan-300/70",
      "bg-cyan-300",
    ],
  };

  const handleExportMatrix = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ telemetry, state }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `LifeOS_Discipline_Matrix_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify("Ledger Dump Exported", "Matrix JSON snapshot generated from Supabase telemetry", "success");
  };

  const activeColors = filterPalettes[currentFilter] || filterPalettes.all;

  // Real-time metric derivations from live Supabase data (zero dummy fallbacks)
  const cleanStreak = telemetry?.brahmacharya?.cleanStreak ?? 0;
  const longestStreak = telemetry?.brahmacharya?.longestStreak ?? cleanStreak;
  const daysTo90 = telemetry?.brahmacharya?.daysTo90 ?? Math.max(0, 90 - cleanStreak);
  const totalCleanDays = telemetry?.brahmacharya?.totalCleanDays ?? 0;
  const masterCadenceStreak = telemetry?.masterCadence?.streak ?? 0;
  const masterCadencePb = telemetry?.masterCadence?.personalBest ?? masterCadenceStreak;
  const adherenceRate = telemetry?.masterCadence?.adherenceRate ?? 0;
  const deepWorkQuotaRate = telemetry?.deepWork?.quotaHitRate ?? 0;
  const deepWorkTotalHrs = telemetry?.deepWork?.totalHrs90d ?? 0;
  const deepWorkStreak = telemetry?.deepWork?.streak ?? 0;
  const deepWorkAvgHours = telemetry?.deepWork?.avgHoursPerDay ?? 0;
  const movementStreak = telemetry?.physical?.movementStreak ?? 0;
  const movementSessionsWk = telemetry?.physical?.sessionsThisWeek ?? 0;
  const totalWorkouts = telemetry?.physical?.totalSessions ?? 0;
  const booksCount = telemetry?.svadhyaya?.booksRead ?? 0;
  const totalPages = telemetry?.svadhyaya?.totalPagesRead ?? 0;
  const readingStreak = telemetry?.svadhyaya?.streak ?? 0;
  const aggregateResilience = telemetry?.aggregateResilience ?? "0.00";

  // Tier classification based on clean streak
  const vitalityTier =
    cleanStreak >= 90
      ? "Tier 4 Transmuted"
      : cleanStreak >= 60
      ? "Tier 3 Solidified"
      : cleanStreak >= 30
      ? "Tier 2 Foundation"
      : "Tier 1 Active";

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Dynamic Atmospheric Glow */}
      <div className="relative w-full">
        <div className="absolute -top-16 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-24 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Discipline Telemetry System</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant">Real-Time Supabase PostgreSQL</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Streaks &amp; Consistency Engine{" "}
              <span className="text-on-surface-variant font-normal">· Year 2026</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded bg-surface-container text-on-surface-variant flex items-center gap-2 border border-outline-variant/60">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">
                verified
              </span>
              Chain Integrity: <strong className="text-on-surface font-semibold">{adherenceRate}%</strong>
            </span>
            <button
              onClick={handleExportMatrix}
              className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-sans text-xs transition-colors flex items-center gap-1.5 active:scale-95 border border-outline-variant/60"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Ledger Dump</span>
            </button>
          </div>
        </div>

        {/* 4 Global Metric Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Master Cadence */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/60 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-mono">
                  Master Cadence
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-[18px]">bolt</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-on-surface">{masterCadenceStreak}</span>
                <span className="text-xs font-mono text-on-surface-variant">Days Active</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">PB: {masterCadencePb} Days</span>
                <span className="text-emerald-400 font-medium">{adherenceRate}% Rate</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{
                    width: `${masterCadencePb > 0 ? Math.min(100, Math.round((masterCadenceStreak / masterCadencePb) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: NoFap / Pure Vitality */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/60 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-400 uppercase tracking-widest font-mono">
                  NoFap / Pure Vitality
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {vitalityTier}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-on-surface">{cleanStreak}</span>
                <span className="text-xs font-mono text-amber-400">Clean Days</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">Transmuted Vector</span>
                <span className="text-amber-400 font-medium">{daysTo90}d to 90-Reboot</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((cleanStreak / 90) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Deep Work Velocity */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/60 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-mono">
                  Deep Work Velocity
                </span>
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">terminal</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-on-surface">{deepWorkQuotaRate}%</span>
                <span className="text-xs font-mono text-emerald-400 font-medium">Quota Hit</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">Last 90 Days</span>
                <span className="text-on-surface">{deepWorkTotalHrs} Total Hrs</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${deepWorkQuotaRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Physical & Reading Logs */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/60 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-mono">
                  Physical &amp; Reading
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-[18px]">menu_book</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-on-surface">{movementSessionsWk} / 6</span>
                <span className="text-xs font-mono text-on-surface-variant">Sessions This Wk</span>
              </div>
            </div>
            <div className="mt-4 pt-2 flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">{booksCount} Books Read</span>
                <span className="text-emerald-400 font-medium">Streak: {movementStreak}d Movement</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((movementSessionsWk / 6) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Master Heatmap Matrix Section */}
      <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 lg:p-7 flex flex-col gap-6 shadow-sm border border-outline-variant/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">
                2026 Year-to-Date Discipline Matrix
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 font-mono">
              Synchronized Monday-to-Sunday lattice (53 weeks · 371 nodes). Multi-vector adherence live from Supabase.
            </p>
          </div>

          {/* Architectural Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" id="heatmapFilterTabs">
            {[
              { id: "all", label: "All Cadence", activeClass: "text-[#002730] bg-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]" },
              { id: "vitality", label: "NoFap / Pure Vitality", activeClass: "text-[#2e1900] bg-amber-400 font-bold shadow-[0_0_10px_rgba(251,191,36,0.35)]" },
              { id: "deepwork", label: "Deep Work (3h+)", activeClass: "text-[#002730] bg-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]" },
              { id: "movement", label: "Movement & Calisthenics", activeClass: "text-[#00271b] bg-emerald-400 font-bold shadow-[0_0_10px_rgba(52,211,153,0.3)]" },
              { id: "svadhyaya", label: "Reading Logs (30p)", activeClass: "text-[#002730] bg-cyan-300 font-bold shadow-[0_0_10px_rgba(103,232,249,0.3)]" },
            ].map((tab) => {
              const isSelected = mounted && currentFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterSelect(tab.id as HeatmapFilter)}
                  type="button"
                  className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-md whitespace-nowrap transition-colors duration-150 ${
                    isSelected
                      ? tab.activeClass
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Separated Month Heatmap Lattice Container */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-outline-variant/30">
          <div className="w-full flex flex-col gap-3 min-w-[980px]">
            {/* Grid with exact Monday-to-Sunday indicator & distinct month blocks */}
            <div className="flex gap-2 sm:gap-2.5 items-start w-full">
              {/* Day of Week Labels: Mon, Wed, Fri, Sun */}
              <div className="flex flex-col pt-[23px] font-mono text-[10px] text-on-surface-variant/70 select-none pr-1 text-right w-[24px] shrink-0">
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

              {/* All 12 Months Clusters spanning edge-to-edge (Jan - Dec fully visible) */}
              <div className="flex items-start justify-between flex-1 gap-1 sm:gap-1.5 md:gap-2 w-full">
                {(telemetry?.months || []).map((m: any) => (
                  <div
                    key={m.name}
                    className="flex flex-col gap-1 items-center shrink-0"
                  >
                    {/* Month Label aligned directly on top of this month's columns */}
                    <div className="font-mono text-[11px] font-bold text-on-surface-variant tracking-wider text-center">
                      {m.name}
                    </div>

                    {/* Month Grid: m.numCols x 7 rows */}
                    <div
                      className="grid grid-flow-col grid-rows-7 gap-[2.5px] p-1 rounded-md bg-surface-container-lowest/60 border border-outline-variant/30 shadow-inner"
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

                        const level = tile[currentFilter] ?? tile.all ?? 0;
                        const isToday = tile.isToday;
                        const hoverText = tile.hoverStatus;

                        return (
                          <div
                            key={idx}
                            title={hoverText}
                            className={`w-[12px] h-[12px] rounded-[2px] transition-all cursor-pointer ${
                              activeColors[level]
                            } ${
                              isToday
                                ? "ring-1 ring-white/90 border border-white/70 shadow-sm"
                                : ""
                            } hover:scale-125 hover:z-20`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend and Meta Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 font-mono text-xs text-on-surface-variant gap-2 border-t border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>
                  12-Month Matrix · First Row: <strong className="text-on-surface">Monday</strong> · Bottom Row:{" "}
                  <strong className="text-on-surface">Sunday</strong> · Integrity:{" "}
                  <strong className="text-emerald-400">{adherenceRate}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-[2.5px] bg-surface-container-lowest border border-outline-variant/20" />
                <div className="w-3.5 h-3.5 rounded-[2.5px] bg-surface-container-high" />
                <div className="w-3.5 h-3.5 rounded-[2.5px] bg-cyan-500/40" />
                <div className="w-3.5 h-3.5 rounded-[2.5px] bg-cyan-500/75" />
                <div className="w-3.5 h-3.5 rounded-[2.5px] bg-cyan-400 shadow-[0_0_8px_rgba(76,215,246,0.7)]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown by Pillar (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: NoFap & Pure Vitality */}
        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/60 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  NoFap &amp; Pure Vitality
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                {cleanStreak}d Streak
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Psychological transmutational vector. {cleanStreak} unbroken clean days recorded in Supabase ledger ({totalCleanDays} clean days all time).
            </p>

            {/* Monthly Consistency Metric Bars from live database */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">Monthly Adherence Density</span>
                <span className="text-amber-400 font-semibold">Live Ledger</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(telemetry?.brahmacharya?.monthlyAdherence || []).map((m: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="h-16 bg-surface-container rounded flex items-end p-1 border border-outline-variant/40">
                      <div
                        className="w-full bg-amber-400 rounded-sm transition-all"
                        style={{
                          height: `${Math.max(4, m.rate)}%`,
                          opacity: m.rate > 0 ? (m.rate > 50 ? 1 : 0.6) : 0.2,
                        }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[11px] text-on-surface-variant">
                      <span>{m.month}</span>
                      <span className="text-on-surface">{m.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Pipeline */}
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="text-on-surface-variant uppercase text-[10px] tracking-wider mb-0.5">
                Horizon Pipeline
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container border border-outline-variant/40">
                <span className="text-on-surface flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      cleanStreak >= 30 ? "text-emerald-400" : "text-outline"
                    }`}
                  >
                    {cleanStreak >= 30 ? "check_circle" : "timelapse"}
                  </span>
                  30 Days Foundation
                </span>
                <span className={cleanStreak >= 30 ? "text-emerald-400 font-semibold" : "text-on-surface-variant"}>
                  {cleanStreak >= 30 ? "Achieved ✓" : `In ${30 - cleanStreak} Days`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container border border-outline-variant/40">
                <span className="text-on-surface flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      cleanStreak >= 45 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {cleanStreak >= 45 ? "check_circle" : "timelapse"}
                  </span>
                  45 Days Clarity Gate
                </span>
                <span className={cleanStreak >= 45 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {cleanStreak >= 45 ? "Achieved ✓" : `In ${45 - cleanStreak} Days`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container border border-outline-variant/40">
                <span className="text-on-surface flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      cleanStreak >= 60 ? "text-emerald-400" : "text-outline"
                    }`}
                  >
                    {cleanStreak >= 60 ? "check_circle" : "lock"}
                  </span>
                  60 Days Personal Best
                </span>
                <span className={cleanStreak >= 60 ? "text-emerald-400 font-semibold" : "text-on-surface-variant"}>
                  {cleanStreak >= 60 ? "Achieved ✓" : `In ${60 - cleanStreak} Days`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container border border-outline-variant/40">
                <span className="text-on-surface flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      cleanStreak >= 90 ? "text-emerald-400" : "text-outline"
                    }`}
                  >
                    {cleanStreak >= 90 ? "check_circle" : "lock"}
                  </span>
                  90 Days Full Reboot
                </span>
                <span className={cleanStreak >= 90 ? "text-emerald-400 font-semibold" : "text-on-surface-variant"}>
                  {cleanStreak >= 90 ? "Achieved ✓" : `In ${90 - cleanStreak} Days`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between font-mono text-xs text-on-surface-variant border-t border-outline-variant/40">
            <span>Personal Best: <strong>{longestStreak} Days</strong></span>
            <span className="text-amber-400">State: {vitalityTier}</span>
          </div>
        </div>

        {/* Pillar 2: Engineering & Deep Work */}
        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/60 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  Engineering &amp; Deep Work
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/30">
                {deepWorkQuotaRate}% Focus Quota
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Threshold benchmark: ≥ 3.0 uninterrupted hours dedicated to high-leverage architectural builds.
            </p>

            {/* Weekly Distribution Curve from real Supabase sessions */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">Weekly Distribution (Mon - Sun)</span>
                <span className="text-cyan-400 font-medium">Avg {deepWorkAvgHours} hrs/day</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg flex flex-col justify-between border border-outline-variant/40">
                <div className="grid grid-cols-7 gap-1.5 h-16 items-end pb-1">
                  {(telemetry?.deepWork?.weeklyDistribution || []).map((dayItem: any, idx: number) => {
                    const maxH = 5;
                    const heightPct = Math.min(100, Math.round((dayItem.hours / maxH) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end">
                        <div
                          title={`${dayItem.day} (${dayItem.date}): ${dayItem.hours}h`}
                          className={`w-full rounded-sm transition-all ${
                            dayItem.hours >= 3
                              ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]"
                              : dayItem.hours > 0
                              ? "bg-cyan-500/60"
                              : "bg-surface-container-highest"
                          }`}
                          style={{ height: `${Math.max(6, heightPct)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="w-full grid grid-cols-7 gap-1.5 font-mono text-[10px] text-on-surface-variant/70 text-center border-t border-outline-variant/20 pt-1">
                  {(telemetry?.deepWork?.weeklyDistribution || []).map((dayItem: any, idx: number) => (
                    <span
                      key={idx}
                      className={dayItem.isToday ? "text-cyan-400 font-semibold" : ""}
                    >
                      {dayItem.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-surface-container flex flex-col border border-outline-variant/40">
                <span className="text-on-surface-variant text-[11px]">Consistency Rate</span>
                <span className="text-lg font-bold text-cyan-400">{deepWorkQuotaRate}%</span>
                <span className="text-on-surface-variant text-[10px] mt-0.5">&gt;3h target met</span>
              </div>
              <div className="p-2.5 rounded bg-surface-container flex flex-col border border-outline-variant/40">
                <span className="text-on-surface-variant text-[11px]">Cumulative 90d</span>
                <span className="text-lg font-bold text-on-surface">{deepWorkTotalHrs}h</span>
                <span className="text-emerald-400 text-[10px] mt-0.5">{telemetry?.deepWork?.totalSessions ?? 0} Sessions</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between font-mono text-xs text-on-surface-variant border-t border-outline-variant/40">
            <span>Current Streak: <strong>{deepWorkStreak} Days</strong></span>
            <span className="text-cyan-400 font-medium">{deepWorkTotalHrs > 0 ? "Active Pipeline" : "Awaiting Logs"}</span>
          </div>
        </div>

        {/* Pillar 3: Physical Mastery & Movement */}
        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/60 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  Physical Mastery &amp; Movement
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-500/30">
                {movementStreak}d Streak
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Surya Kriya dawn sequences and progressive ring calisthenics protocols.
            </p>

            {/* Weekly Protocol Completion from real Supabase workouts */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-on-surface-variant">Weekly Protocol (Mon - Sun)</span>
                <span className="text-emerald-400 font-medium">{movementSessionsWk} / 6 Days Met</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 py-1">
                {(telemetry?.physical?.weeklyProtocol || []).map((dayItem: any, idx: number) => {
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <span
                        className={`font-mono text-[10px] ${
                          dayItem.isToday ? "text-cyan-400 font-bold" : "text-on-surface-variant"
                        }`}
                      >
                        {dayItem.day}
                      </span>
                      {dayItem.hasWorkout ? (
                        <div
                          title={`${dayItem.dayName} (${dayItem.date}): ${dayItem.workoutType}`}
                          className="w-full h-9 rounded bg-emerald-400 flex items-center justify-center text-[#00271b] font-mono text-xs font-semibold shadow-[0_0_8px_rgba(78,222,163,0.3)] cursor-pointer"
                        >
                          ✓
                        </div>
                      ) : dayItem.isToday ? (
                        <div
                          title="Today"
                          className="w-full h-9 rounded bg-surface-container-high border-dashed border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs font-mono"
                        >
                          Today
                        </div>
                      ) : dayItem.isFuture ? (
                        <div
                          title="Upcoming"
                          className="w-full h-9 rounded bg-surface-container flex items-center justify-center text-outline/50 text-xs"
                        >
                          ·
                        </div>
                      ) : (
                        <div
                          title="Rest"
                          className="w-full h-9 rounded bg-surface-container flex items-center justify-center text-outline text-xs"
                        >
                          Rest
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container flex items-center justify-between font-mono text-xs border border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">fitness_center</span>
                <span className="text-on-surface-variant">Latest Practice</span>
              </div>
              <span className="text-on-surface font-semibold truncate max-w-[170px]" title={telemetry?.physical?.latestWorkout?.description || "None"}>
                {telemetry?.physical?.latestWorkout?.description || telemetry?.physical?.latestWorkout?.type || "None Logged"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between font-mono text-xs text-on-surface-variant border-t border-outline-variant/40">
            <span>Total Workouts: <strong>{totalWorkouts} Sessions</strong></span>
            <span className="text-emerald-400 font-medium">Streak: {movementStreak}d</span>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row: Correlation Insights & Historical Records Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Correlation Insight Bento Box */}
        <div className="lg:col-span-4 bg-surface-container-low p-5 rounded-xl border border-outline-variant/60 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-2">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
              <span className="uppercase tracking-wider">Discipline Correlation Engine</span>
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-on-surface mb-3">
              Empirical Multi-Vector Correlation
            </h3>
            <blockquote className="p-3 font-sans text-xs text-on-surface border-l-2 border-emerald-400 pl-3 leading-relaxed mb-4 bg-surface-container-lowest/60 rounded-r">
              &ldquo;
              {cleanStreak > 0
                ? `Currently sustaining a ${cleanStreak}-day unbroken NoFap streak with multi-vector syncing live from Supabase. Active cross-adherence observed between seminal preservation and daily discipline logs.`
                : "Multi-vector telemetry syncing live from Supabase. Log daily sessions to build longitudinal correlation models."}
              &rdquo;
            </blockquote>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs pt-2 border-t border-outline-variant/30">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Telemetry Sample Nodes</span>
              <span className="text-on-surface font-semibold">
                N={telemetry?.correlation?.distinctLoggedDays ?? 0} Logged Days ({telemetry?.correlation?.sampleConfidence ?? "Forming"})
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${Math.min(100, ((telemetry?.correlation?.distinctLoggedDays ?? 0) / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Historical Milestones & Records Ledger */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-5 border border-outline-variant/60 flex flex-col justify-between shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                Historical Milestones &amp; Records Ledger
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Validated chain lengths, verified endurance protocols, and resilience score.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-surface-container text-xs font-mono text-cyan-400 border border-outline-variant/40">
              Audit Status: Live Synced
            </span>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="font-mono text-xs text-on-surface-variant uppercase tracking-wider border-b border-surface-container-highest/40">
                  <th className="pb-2.5 font-medium">Protocol / Habit Vector</th>
                  <th className="pb-2.5 font-medium">Longest Chain</th>
                  <th className="pb-2.5 font-medium">Current</th>
                  <th className="pb-2.5 font-medium">Logged Total</th>
                  <th className="pb-2.5 font-medium text-right">Resilience Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 font-mono text-xs">
                {(telemetry?.historicalLedger || []).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 text-on-surface font-medium flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${row.color || "cyan-400"}`} />
                      {row.protocol}
                    </td>
                    <td className="py-3 text-on-surface-variant">{row.longest}</td>
                    <td className="py-3 text-on-surface font-semibold">{row.current}</td>
                    <td className="py-3 text-on-surface-variant">{row.loggedTotal}</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-400 font-medium">{row.resilience} / 10</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-mono text-xs gap-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-cyan-400">security</span>
              <span>PostgreSQL Connection: <span className="text-emerald-400">Active</span></span>
            </div>
            <div>
              Aggregate Resilience Rating: <strong className="text-emerald-400">{aggregateResilience} / 10</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
