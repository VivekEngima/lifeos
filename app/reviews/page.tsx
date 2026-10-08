"use client";

import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";

export default function ReviewsPage() {
  const { state, selectedDate, logJournal } = useLifeOS();
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [weeklyData, setWeeklyData] = useState({
    working: "",
    draining: "",
    cuttingNextWeek: "",
    moneyNeedleLesson: "",
    sadhanaStreak: 7,
    totalEarned: 745,
  });

  const [monthlyData, setMonthlyData] = useState({
    incomeTotal: 0,
    sourceBreakdown: "",
    puneFundSaved: 0,
    adjustOneThing: "",
    netWorthEstimate: 0,
    bodyMetrics: "",
  });

  useEffect(() => {
    if (state?.reviews?.saturdayWeekly) {
      setWeeklyData({
        working: state.reviews.saturdayWeekly.working || "",
        draining: state.reviews.saturdayWeekly.draining || "",
        cuttingNextWeek: state.reviews.saturdayWeekly.cuttingNextWeek || "",
        moneyNeedleLesson: state.reviews.saturdayWeekly.moneyNeedleLesson || "",
        sadhanaStreak: state.reviews.saturdayWeekly.sadhanaStreak || 7,
        totalEarned: state.finance.weeklyEarnedUsd || state.reviews.saturdayWeekly.totalEarned || 745,
      });
    }
    if (state?.reviews?.monthly) {
      setMonthlyData({
        incomeTotal: state.finance.weeklyEarnedUsd || state.reviews.monthly.incomeTotal || 0,
        sourceBreakdown: state.reviews.monthly.sourceBreakdown || "",
        puneFundSaved: state.puneFund.accumulated || state.reviews.monthly.puneFundSaved || 0,
        adjustOneThing: state.reviews.monthly.adjustOneThing || "",
        netWorthEstimate: state.reviews.monthly.netWorthEstimate || 0,
        bodyMetrics: state.reviews.monthly.bodyMetrics || "",
      });
    }
  }, [state]);

  const handleSaveWeekly = async () => {
    await logJournal("weekly_review", weeklyData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1000);
  };

  const handleSaveMonthly = async () => {
    await logJournal("monthly_review", monthlyData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e1e24] font-mono text-xs gap-3">
        <div>
          <h1 className="text-base text-[#f4f4f5] font-semibold font-sans tracking-tight">
            Cadence Reviews &amp; Strategic Audits
          </h1>
          <p className="text-[#a1a1aa] text-[11px] mt-0.5">
            Saturday / Sunday Weekly Retrospectives &amp; Monthly Trajectory Calibrations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121215] border border-[#1e1e24] rounded-[4px]">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3 py-1 rounded-[2px] text-xs font-mono transition-all ${activeTab === "weekly"
                ? "bg-[#f4f4f5] text-[#09090b] font-semibold"
                : "text-[#a1a1aa] hover:text-[#f4f4f5]"
              }`}
          >
            Saturday Weekly Review (15m)
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-3 py-1 rounded-[2px] text-xs font-mono transition-all ${activeTab === "monthly"
                ? "bg-[#f4f4f5] text-[#09090b] font-semibold"
                : "text-[#a1a1aa] hover:text-[#f4f4f5]"
              }`}
          >
            Monthly Review (1st of Mo)
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-[4px] bg-[#10b981]/15 border border-[#10b981]/30 text-xs font-mono text-[#10b981] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Review committed and synchronized with Supabase database.</span>
        </div>
      )}

      {/* Weekly Review Content */}
      {activeTab === "weekly" && (
        <div className="flex flex-col gap-6">
          {/* Key Metric Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                Total Earned vs $750 Target
              </span>
              <div className="text-2xl font-mono font-bold text-[#10b981] mt-1">
                ${weeklyData.totalEarned} / $750
              </div>
              <span className="text-[10px] font-mono text-[#a1a1aa]">
                {Math.round((weeklyData.totalEarned / 750) * 100)}% of weekly freedom target
              </span>
            </div>

            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                Sadhana Movement Streak
              </span>
              <div className="text-2xl font-mono font-bold text-[#06b6d4] mt-1">
                {weeklyData.sadhanaStreak} Days Active
              </div>
              <span className="text-[10px] font-mono text-[#10b981]">
                Morning protocol active
              </span>
            </div>

            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                NoFap / Seminal Chain
              </span>
              <div className="text-2xl font-mono font-bold text-[#f59e0b] mt-1">
                {state?.brahmacharya.cleanStreak ?? 0} Days Clean
              </div>
              <span className="text-[10px] font-mono text-[#f59e0b]">
                {state?.brahmacharya.transmutationTier}
              </span>
            </div>
          </div>

          {/* 4 Core Questions */}
          <div className="bg-[#121215] p-6 rounded-[4px] border border-[#1e1e24] flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#10b981] font-semibold block mb-1">
                1. What&apos;s Working?
              </span>
              <textarea
                rows={3}
                placeholder="What routines, focus blocks, or protocols delivered high output this week?"
                value={weeklyData.working}
                onChange={(e) => setWeeklyData({ ...weeklyData, working: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#f59e0b] font-semibold block mb-1">
                2. What&apos;s Draining You?
              </span>
              <textarea
                rows={3}
                placeholder="What caused energy leaks, distractions, or mental drag?"
                value={weeklyData.draining}
                onChange={(e) => setWeeklyData({ ...weeklyData, draining: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#ef4444] font-semibold block mb-1">
                3. What Gets Cut Next Week?
              </span>
              <textarea
                rows={3}
                placeholder="What non-essential task or habit will you eliminate next week?"
                value={weeklyData.cuttingNextWeek}
                onChange={(e) => setWeeklyData({ ...weeklyData, cuttingNextWeek: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold block mb-1">
                4. ONE Lesson: What Moved the Money Needle?
              </span>
              <textarea
                rows={3}
                placeholder="What single action directly drove income or contracted value?"
                value={weeklyData.moneyNeedleLesson}
                onChange={(e) => setWeeklyData({ ...weeklyData, moneyNeedleLesson: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveWeekly}
                className="px-5 py-2 rounded-[4px] bg-[#f4f4f5] text-[#09090b] font-semibold text-xs font-mono hover:bg-[#e4e4e7] transition-all"
              >
                Seal Saturday Weekly Review ⏎
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Review Content */}
      {activeTab === "monthly" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                Total Monthly Inflow
              </span>
              <div className="text-2xl font-mono font-bold text-[#10b981] mt-1">
                ${monthlyData.incomeTotal} USD
              </div>
              <span className="text-[10px] font-mono text-[#a1a1aa]">
                Target: $3,000 / month
              </span>
            </div>

            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                Pune Sovereignty Fund Saved
              </span>
              <div className="text-2xl font-mono font-bold text-[#06b6d4] mt-1">
                ${monthlyData.puneFundSaved} USD
              </div>
              <span className="text-[10px] font-mono text-[#10b981]">
                Of ${state?.puneFund.target || 5000} target
              </span>
            </div>

            <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
              <span className="text-[10px] font-mono uppercase text-[#71717a] block">
                Estimated Net Worth
              </span>
              <div className="text-2xl font-mono font-bold text-[#f4f4f5] mt-1">
                ${monthlyData.netWorthEstimate.toLocaleString()} USD
              </div>
              <span className="text-[10px] font-mono text-[#10b981]">
                Monthly valuation
              </span>
            </div>
          </div>

          <div className="bg-[#121215] p-6 rounded-[4px] border border-[#1e1e24] flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold block mb-1">
                1. Income Source Breakdown
              </span>
              <input
                type="text"
                placeholder="e.g. Client Engineering ($2,180) • Consulting ($670)"
                value={monthlyData.sourceBreakdown}
                onChange={(e) => setMonthlyData({ ...monthlyData, sourceBreakdown: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#10b981] font-semibold block mb-1">
                2. Body Metrics &amp; Physical Vitals
              </span>
              <input
                type="text"
                placeholder="e.g. 71.2 kg, 13.8% Body Fat, RHR 48 BPM"
                value={monthlyData.bodyMetrics}
                onChange={(e) => setMonthlyData({ ...monthlyData, bodyMetrics: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#f59e0b] font-semibold block mb-1">
                3. Adjust ONE Thing (Monthly Pivot)
              </span>
              <textarea
                rows={3}
                placeholder="Single system adjustment for the upcoming month..."
                value={monthlyData.adjustOneThing}
                onChange={(e) => setMonthlyData({ ...monthlyData, adjustOneThing: e.target.value })}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveMonthly}
                className="px-5 py-2 rounded-[4px] bg-[#f4f4f5] text-[#09090b] font-semibold text-xs font-mono hover:bg-[#e4e4e7] transition-all"
              >
                Seal Monthly Review ⏎
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
