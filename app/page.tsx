"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLifeOS } from "@/context/LifeOSContext";
import { formatLocalDateString, formatDayFullWithOrdinal } from "@/lib/date-utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FinancialVelocityChart } from "@/components/charts/FinancialVelocityChart";
import { FocusTelemetryChart } from "@/components/charts/FocusTelemetryChart";

export default function DashboardPage() {
  const {
    state,
    selectedDate,
    openModal,
    openBookModal,
    openEditModal,
    logBrahmacharya,
    setDisciplineScore,
    deleteWorkout,
    deleteDeepWork,
    deleteSleep,
    deleteExpense,
    togglePlannerTask,
    toggleSuryaKriyaDaily,
    updateSuryaKriyaDaily,
    toggleYogasanasDaily,
    activeTimer,
    startDeepWorkTimer,
    pauseDeepWorkTimer,
    resumeDeepWorkTimer,
    stopAndLogDeepWorkTimer,
    discardDeepWorkTimer,
    updateTimerTopic,
  } = useLifeOS();

  const pune = state?.puneFund ?? null;
  const suryaKriya = state?.suryaKriyaChallenge ?? state?.yogasanasChallenge ?? null;
  const [selectedSuryaKriyaCycles, setSelectedSuryaKriyaCycles] = useState<number>(
    suryaKriya?.todayCycles ?? 3
  );
  const [showRecentLedgerModal, setShowRecentLedgerModal] = useState(false);
  const [timerTopicInput, setTimerTopicInput] = useState("");
  const [timerDescInput, setTimerDescInput] = useState("");
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [focusPresets, setFocusPresets] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lifeos_focus_presets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFocusPresets(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load focus presets from localStorage", err);
    }
  }, []);

  const addFocusPreset = (topicToAdd?: string) => {
    const topic = (topicToAdd || timerTopicInput).trim();
    if (!topic) return;
    if (focusPresets.some((p) => p.toLowerCase() === topic.toLowerCase())) return;

    const nextPresets = [...focusPresets, topic];
    setFocusPresets(nextPresets);
    try {
      localStorage.setItem("lifeos_focus_presets", JSON.stringify(nextPresets));
    } catch (err) {
      console.error("Failed to save focus presets", err);
    }
  };

  const removeFocusPreset = (topicToRemove: string) => {
    const nextPresets = focusPresets.filter((p) => p !== topicToRemove);
    setFocusPresets(nextPresets);
    try {
      localStorage.setItem("lifeos_focus_presets", JSON.stringify(nextPresets));
    } catch (err) {
      console.error("Failed to update focus presets", err);
    }
  };

  const [showAllProtocolDays, setShowAllProtocolDays] = useState(false);
  const [financeView, setFinanceView] = useState<"list" | "chart">("list");

  // Live ticking urgency countdown for Pune Relocation & Sovereignty Fund
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: pune?.daysLeft ?? 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (suryaKriya?.todayCycles) {
      setSelectedSuryaKriyaCycles(suryaKriya.todayCycles);
    }
  }, [suryaKriya?.todayCycles]);

  useEffect(() => {
    setMounted(true);
    if (!pune) return;

    const computeTime = () => {
      const targetStr = pune.targetDate || "2027-02-01";
      const targetTime = new Date(targetStr + (targetStr.includes("T") ? "" : "T23:59:59")).getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(computeTime());
    const interval = setInterval(() => {
      setTimeLeft(computeTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [pune?.targetDate, pune?.daysLeft]);

  const remainingFunds = pune?.remaining ?? 0;
  const daysRemaining = timeLeft.days > 0 ? timeLeft.days : (pune?.daysLeft ?? 1);
  const dailyVelocityRequired = daysRemaining > 0 ? (remainingFunds / daysRemaining).toFixed(2) : "0.00";

  const todayTasks = state?.todayTasks ?? [];
  const completedTasksCount = todayTasks.filter((t) => t.status === "completed").length;
  const totalTasksCount = todayTasks.length;
  const brahmacharya = state?.brahmacharya ?? null;
  const workout = state?.workoutToday ?? null;
  const deepWork = state?.deepWorkToday ?? null;
  const sleep = state?.sleepToday ?? null;
  const sleepLogsToday = state?.sleepLogsToday ?? (sleep ? [sleep] : []);
  const reading = state?.readingToday ?? null;
  const readingsToday = state?.readingsToday ?? [];
  const currentBook = state?.currentBook ?? null;
  const books = state?.books ?? [];
  const lastReadingLog = state?.lastReadingLog ?? null;
  const finance = state?.finance ?? null;
  const disciplineScore = state?.disciplineRating ?? 0;

  const getDisciplineTier = (score: number) => {
    if (score >= 10) return "Absolute Mastery";
    if (score >= 9) return "Sovereign Execution";
    if (score >= 7) return "Optimal Focus";
    if (score >= 5) return "Divided Focus";
    if (score > 0) return "Static / Compromised";
    return "Zero Cadence / Relapse";
  };

  return (
    <div className="flex flex-col w-full">
      {/* ========================================================================= */}
      {/* TOP DEEP WORK COMMAND HUD & LIVE FOCUS STOPWATCH */}
      {/* ========================================================================= */}
      {activeTimer?.isRunning ? (
        /* ACTIVE FOCUS CONSOLE WITH FULL BIGGER SIZE MATCHING BOTTOM TIMER */
        <div className="w-full mb-5 bg-gradient-to-r from-amber-950/40 via-surface-container to-amber-950/30 rounded-xl border-2 border-amber-500/60 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              <span className={`material-symbols-outlined text-[32px] ${!activeTimer.isPaused ? "animate-spin-slow" : ""}`}>
                timer
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {activeTimer.isPaused ? "FOCUS PAUSED" : "FLOW STATE ACTIVE"}
                </span>
                <span className="text-xs font-mono text-on-surface-variant">
                  {activeTimer.startTime ? `Started at ${new Date(activeTimer.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Tracking Live"}
                </span>
              </div>

              {/* BIGGER TIMER DISPLAY - MATCHING THE BOTTOM TIMER (5xl - 6xl) */}
              <div className="text-5xl sm:text-6xl font-mono font-bold tracking-wider text-amber-200 drop-shadow-[0_0_16px_rgba(245,158,11,0.4)] my-1">
                {String(Math.floor(activeTimer.elapsedSeconds / 3600)).padStart(2, "0")}:
                {String(Math.floor((activeTimer.elapsedSeconds % 3600) / 60)).padStart(2, "0")}:
                {String(activeTimer.elapsedSeconds % 60).padStart(2, "0")}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-xs text-amber-400 font-mono font-semibold">🎯 GOAL:</span>
                <input
                  type="text"
                  value={activeTimer.topic}
                  onChange={(e) => updateTimerTopic(e.target.value)}
                  placeholder="Focus topic / goal..."
                  className="text-xs sm:text-sm font-semibold text-on-surface font-sans bg-transparent border-b border-outline-variant/60 focus:border-amber-400 focus:outline-none py-0.5 max-w-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {activeTimer.isPaused ? (
              <button
                onClick={resumeDeepWorkTimer}
                type="button"
                className="px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseDeepWorkTimer}
                type="button"
                className="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">pause</span>
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={() => stopAndLogDeepWorkTimer()}
              type="button"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[18px]">stop_circle</span>
              <span>Stop &amp; Log Session ⏎</span>
            </button>

            <button
              onClick={discardDeepWorkTimer}
              type="button"
              title="Discard session without saving"
              className="p-2.5 rounded-lg bg-surface-container hover:bg-red-950/40 border border-outline-variant hover:border-red-500/40 text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      ) : (
        /* IDLE TOP FOCUS BAR: IMMEDIATE TRIGGER UPON PAGE LOAD */
        <div className="w-full mb-5 bg-surface-container-low rounded-xl border border-amber-500/30 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md hover:border-amber-500/50 transition-all">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span className="material-symbols-outlined text-[22px]">architecture</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-on-surface">Deep Work Focus Protocol</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Target: 3.0h+ Daily
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-sans mt-0.5">
                {deepWork
                  ? `${(deepWork.durationMinutes / 60).toFixed(1)} hrs logged today (${deepWork.topic}) • Ready to launch your next focus block?`
                  : "Launch a live deep work session immediately as page loads."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsTimerModalOpen(true)}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Start Deep Work Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* TOP HERO: Pune Relocation Fund & Day Blueprint Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 w-full items-stretch">
        {/* Left Hero: Pune Relocation & Sovereignty Fund */}
        <section className="lg:col-span-7 xl:col-span-7 bg-surface-container-low/90 rounded-xl border border-cyan-500/30 shadow-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors flex flex-col justify-between">
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {pune ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-outline-variant/40">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <span className="material-symbols-outlined text-[22px]">flag</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                          Primary Life Horizon
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                          {pune.pctCompleted || 0}%
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                          Active Allocation
                        </span>
                      </div>
                      <h1 className="text-lg sm:text-xl font-bold tracking-tight text-on-surface">
                        {pune.title}
                      </h1>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Target: ${pune.target.toLocaleString()} Cap</span>
                        <button
                          onClick={() => openEditModal("pune_fund", (pune as any).id || "pune-fund", pune)}
                          className="p-0.5 text-on-surface-variant hover:text-cyan-400 transition-colors"
                          title="Edit Fund Target & Deposit"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                        </button>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openModal("deposit")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-[#002730] font-bold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] active:scale-[0.98] shrink-0 self-start sm:self-center"
                    id="heroAddDepositBtn"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Deposit</span>
                  </button>
                </div>

                {/* HIGH URGENCY LIVE COUNTDOWN HUD */}
                <div className="my-2.5 p-3 rounded-xl bg-gradient-to-br from-amber-500/[0.07] via-surface-container/90 to-cyan-500/[0.04] border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.07)] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1">
                        Urgency Horizon Ticker
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40 font-semibold">
                        NON-RENEWABLE TIME
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-on-surface-variant">Pace Quota:</span>
                      <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shadow-sm">
                        ${dailyVelocityRequired}/day needed
                      </span>
                    </div>
                  </div>

                  {/* 4 Clock Blocks (Days, Hours, Minutes, Seconds) */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-surface-container-highest/60 backdrop-blur-sm p-2 rounded-lg border border-outline-variant/40 hover:border-amber-500/40 transition-colors">
                      <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-on-surface">
                        {mounted ? timeLeft.days : (pune.daysLeft ?? 0)}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-on-surface-variant font-medium tracking-wider">
                        Days Left
                      </div>
                    </div>

                    <div className="bg-surface-container-highest/60 backdrop-blur-sm p-2 rounded-lg border border-outline-variant/40 hover:border-amber-500/40 transition-colors">
                      <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-amber-300">
                        {mounted ? String(timeLeft.hours).padStart(2, "0") : "00"}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-on-surface-variant font-medium tracking-wider">
                        Hours
                      </div>
                    </div>

                    <div className="bg-surface-container-highest/60 backdrop-blur-sm p-2 rounded-lg border border-outline-variant/40 hover:border-amber-500/40 transition-colors">
                      <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-amber-400">
                        {mounted ? String(timeLeft.minutes).padStart(2, "0") : "00"}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-on-surface-variant font-medium tracking-wider">
                        Minutes
                      </div>
                    </div>

                    <div className="bg-surface-container-highest/60 backdrop-blur-sm p-2 rounded-lg border border-amber-500/40 relative overflow-hidden shadow-[inset_0_0_12px_rgba(245,158,11,0.12)]">
                      <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-cyan-300 animate-pulse">
                        {mounted ? String(timeLeft.seconds).padStart(2, "0") : "00"}
                      </div>
                      <div className="text-[9px] font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                        Seconds
                      </div>
                    </div>
                  </div>

                  {/* Motivational Urgency Warning Footnote */}
                  <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono">
                    <span className="text-amber-200/90 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-amber-400">timer</span>
                      <span>Target Date: <strong className="text-on-surface">{pune.targetDate || "Feb 1, 2027"}</strong></span>
                    </span>
                    <span className="text-amber-400/90 font-medium">
                      Every hour lost delays sovereignty. Execute non-negotiables now.
                    </span>
                  </div>
                </div>

                {/* 3 Stat Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
                  <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block mb-0.5">
                      Accumulated
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tracking-tight text-cyan-400 font-mono">
                        ${(pune.accumulated ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                      +${pune.monthlyFlow}/mo flow
                    </span>
                  </div>

                  <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block mb-0.5">
                      Remaining
                    </span>
                    <div className="text-xl font-bold tracking-tight text-on-surface font-mono">
                      ${(pune.remaining ?? 0).toLocaleString()}
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant block mt-0.5">
                      to target cap
                    </span>
                  </div>

                  <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block mb-0.5">
                      Daily Quota Pace
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tracking-tight text-amber-400 font-mono">
                        ${dailyVelocityRequired}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">/day</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">
                      to meet deadline
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-on-surface flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.65)]" />
                      <span>
                        ${pune.accumulated.toLocaleString()} of ${pune.target.toLocaleString()} ({pune.pctCompleted}%)
                      </span>
                    </span>
                    <span className="text-emerald-400 font-semibold text-[11px]">${pune.remaining.toLocaleString()} Left</span>
                  </div>
                  <Progress
                    value={Math.min(100, pune.pctCompleted ?? 0)}
                    className="h-2 bg-surface-container-highest"
                    indicatorClassName="bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  />
                </div>
              </>
            ) : null}
          </div>

          {/* Bottom Strip */}
          <div className="bg-surface-container-lowest px-4 py-2.5 border-t border-outline-variant/40 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">NoFap: </span>
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {brahmacharya?.cleanStreak ?? 0}d
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-outline-variant/40 pt-1.5 sm:pt-0 sm:pl-2">
              <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <span className="material-symbols-outlined text-[13px]">tune</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">Discipline: </span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {disciplineScore > 0 ? disciplineScore : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-outline-variant/40 pt-1.5 sm:pt-0 sm:pl-2">
              <div className="w-5 h-5 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <span className="material-symbols-outlined text-[13px]">speed</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">Pillars: </span>
                <span className="font-mono font-bold text-cyan-400 text-xs">
                  {state?.pillarsMet ?? 0} / 5
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Hero: Day Blueprint & Focus Tasks */}
        <section className="lg:col-span-5 xl:col-span-5 bg-surface-container-low/90 rounded-xl border border-outline-variant/60 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-colors">
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                    <span className="material-symbols-outlined text-[20px]">checklist</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-on-surface tracking-tight flex items-center gap-2">
                      Day Blueprint
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-normal">
                        {completedTasksCount}/{totalTasksCount} Done
                      </span>
                    </h2>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      Today&apos;s Non-Negotiable Blocks
                    </p>
                  </div>
                </div>
                <Link
                  href="/planner"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Open Day Blueprint & Goal Tracker"
                >
                  <span>Planner</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>

              {/* ========================================================================= */}
              {/* DAILY NON-NEGOTIABLE #1: SURYA KRIYA 48-DAY PROTOCOL HERO CARD */}
              {/* ========================================================================= */}
              {(() => {
                const completedCount = suryaKriya?.completedDays ?? 0;
                const daysLeft = Math.max(0, 48 - completedCount);
                const currentDay = suryaKriya?.currentDayNumber ?? 1;
                const isBeforeStart = suryaKriya?.isBeforeStart ?? false;
                const startsTomorrow = suryaKriya?.startsTomorrow ?? false;
                const firstDayFormatted = suryaKriya?.days?.[0]?.formattedDate || "Saturday 10th October 2026";
                const isCompleted = Boolean(suryaKriya?.isCompletedToday);
                const isRestarted = Boolean(suryaKriya?.isRestarted);
                const activeCycles = suryaKriya?.todayCycles ?? selectedSuryaKriyaCycles ?? 3;
                const cycleOptions = [1, 3, 6, 7, 9, 11, 12];

                return (
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-surface-container-high/90 to-orange-950/30 border border-amber-500/40 shadow-sm relative overflow-hidden group/suryakriya hover:border-amber-400/60 transition-all">
                    {/* Top Row: Non-negotiable Badge + Day status + X days left */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isBeforeStart ? (
                          <>
                            <Badge variant="amber" className="gap-1 text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              STARTS TOMORROW
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-950/60">
                              Day 1 of 48 Begins Tomorrow
                            </Badge>
                          </>
                        ) : isRestarted && !isCompleted ? (
                          <>
                            <Badge variant="amber" className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              NON-NEGOTIABLE
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] text-rose-300 border-rose-500/40 bg-rose-950/70 font-semibold gap-1">
                              <span className="material-symbols-outlined text-[12px] text-rose-400">restart_alt</span>
                              Day 1 of 48 • Restarted
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="amber" className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              NON-NEGOTIABLE
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-950/60">
                              Day {currentDay} of 48
                            </Badge>
                          </>
                        )}
                      </div>
                      <Badge variant="amber" className="font-mono text-[11px] font-bold bg-amber-500/15 text-amber-300 border-amber-500/40">
                        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                      </Badge>
                    </div>

                    {/* Main Interactive Row */}
                    <div
                      onClick={() => toggleSuryaKriyaDaily(selectedDate, selectedSuryaKriyaCycles)}
                      className={`p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                        isCompleted
                          ? "bg-amber-950/50 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-surface-container/90 border-outline-variant/60 hover:bg-surface-container-highest hover:border-amber-400/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleSuryaKriyaDaily(selectedDate, selectedSuryaKriyaCycles)}
                            className="h-5 w-5 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400 data-[state=checked]:text-slate-950"
                            title={
                              isCompleted
                                ? "Completed! Click to uncheck"
                                : isBeforeStart
                                ? "Tick to log an early Surya Kriya session for today"
                                : "Click to complete & auto-log as Sadhana in Supabase"
                            }
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-xs font-bold tracking-tight flex items-center gap-1 ${
                                isCompleted
                                  ? "text-amber-300 line-through decoration-amber-500/50"
                                  : "text-on-surface"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px] text-amber-400">wb_sunny</span>
                              Daily Surya Kriya (48 Days)
                            </span>
                            {isCompleted ? (
                              <Badge variant="amber" className="text-[9px] py-0 gap-0.5 bg-amber-500/20 text-amber-300 border-amber-500/40">
                                <span className="material-symbols-outlined text-[10px]">verified</span>
                                {activeCycles} {activeCycles === 1 ? "Cycle" : "Cycles"} Logged
                              </Badge>
                            ) : isBeforeStart ? (
                              <Badge variant="amber" className="text-[9px] py-0 font-semibold">
                                Starts Tomorrow
                              </Badge>
                            ) : isRestarted ? (
                              <Badge variant="amber" className="text-[9px] py-0 font-semibold bg-rose-950/60 text-rose-300 border-rose-500/30">
                                Restarted (Count 1)
                              </Badge>
                            ) : (
                              <Badge variant="amber" className="text-[9px] py-0 font-semibold">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-on-surface-variant truncate">
                            {isCompleted
                              ? `Completed (${activeCycles} cycles) & recorded in Supabase Sadhana ledger.`
                              : isBeforeStart
                              ? `48-Day Protocol starts tomorrow (${firstDayFormatted}) • Tick to auto-log`
                              : isRestarted
                              ? `Missed once — restarted from count 1 for 48 days • Tick to auto-log`
                              : `Sacred Solar Kriya (${selectedSuryaKriyaCycles} cycles) • 48-Day Protocol • Tick to auto-log`}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isCompleted ? (
                          <span className="text-amber-400 flex items-center gap-1 text-[11px] font-mono font-semibold">
                            <span className="material-symbols-outlined text-[15px]">done_all</span>
                            <span className="hidden sm:inline">Done</span>
                          </span>
                        ) : (
                          <Button
                            variant="default"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSuryaKriyaDaily(selectedDate, selectedSuryaKriyaCycles);
                            }}
                            className="gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                          >
                            <span>{isBeforeStart ? "Log Early" : "Log"}</span>
                            <span className="material-symbols-outlined text-[11px]">bolt</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Cycle Selection Row (1, 3, 6, 7, 9, 11, 12) */}
                    <div className="mt-2.5 p-2 rounded-lg bg-surface-container/60 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-400">repeat</span>
                        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                          Select Cycles:
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {cycleOptions.map((cycles) => {
                          const isSelected = selectedSuryaKriyaCycles === cycles;
                          return (
                            <button
                              key={cycles}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSuryaKriyaCycles(cycles);
                                if (isCompleted) {
                                  updateSuryaKriyaDaily(cycles, selectedDate);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-105"
                                  : "bg-surface-container-highest/80 hover:bg-amber-500/20 text-amber-200/90 border border-amber-500/30"
                              }`}
                              title={`Set Surya Kriya to ${cycles} cycles${isCompleted ? " (updates today's session)" : ""}`}
                            >
                              {cycles}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Schedule Accordion & 48-Day List */}
                    <div className="mt-2 pt-1.5 border-t border-amber-500/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                        <button
                          type="button"
                          onClick={() => setShowAllProtocolDays((prev) => !prev)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[13px] text-amber-400">calendar_month</span>
                          <span>48-Day Protocol Schedule</span>
                          <span className="material-symbols-outlined text-[12px]">
                            {showAllProtocolDays ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                        <span className="text-amber-400 font-semibold text-[10px]">
                          {completedCount}/48 Completed
                        </span>
                      </div>

                      {/* Expanded List of all 48 Days in "Monday 1st March 2026" format */}
                      {showAllProtocolDays && (
                        <div className="mt-2 flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/30">
                          {(suryaKriya?.days || []).map((d) => {
                            const formatted = d.formattedDate || formatDayFullWithOrdinal(d.dateStr);
                            return (
                              <div
                                key={d.dayNumber}
                                className={`flex items-center justify-between p-1.5 rounded-md border text-[11px] font-mono transition-all ${
                                  d.isToday
                                    ? "bg-amber-500/10 border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30"
                                    : d.isCompleted
                                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                                    : "bg-surface-container-lowest/60 border-outline-variant/30 text-on-surface-variant"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Badge
                                    variant={d.isCompleted ? "amber" : d.isToday ? "amber" : "secondary"}
                                    className="text-[9px] px-1.5 py-0"
                                  >
                                    Day {d.dayNumber}
                                  </Badge>
                                  <span
                                    className={`truncate font-medium ${
                                      d.isToday
                                        ? "text-amber-200 font-bold"
                                        : d.isCompleted
                                        ? "text-amber-300"
                                        : "text-on-surface"
                                    }`}
                                  >
                                    {formatted}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {d.isToday && (
                                    <Badge variant="amber" className="text-[9px] uppercase px-1 py-0">
                                      Today
                                    </Badge>
                                  )}
                                  {d.isCompleted ? (
                                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                      <span>{d.cycles ? `${d.cycles}c Done` : "Done"}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-on-surface-variant/60">
                                      {d.isPast ? "Past" : "Pending"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Thin Progress Track with shadcn Progress */}
                      <div className="mt-2">
                        <Progress
                          value={suryaKriya?.pctCompleted ?? 0}
                          className="h-1 bg-surface-container-highest/80"
                          indicatorClassName="bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Task Items List (Additional Blueprint Blocks) */}
              {(() => {
                const otherTasks = todayTasks.filter((t) => !t.title.toLowerCase().includes("surya kriya") && !t.title.toLowerCase().includes("surya_kriya") && !t.title.toLowerCase().includes("yogasana"));
                return otherTasks.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-outline-variant/40">
                    {otherTasks.map((task) => {
                      const isCompleted = task.status === "completed";
                      const isNoFap = task.category === "nofap";
                      return (
                        <div
                          key={task.id}
                          onClick={() => togglePlannerTask(task.id, task.status)}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none group/item ${
                            isCompleted
                              ? "bg-surface-container-lowest/60 border-outline-variant/30 opacity-60"
                              : isNoFap
                              ? "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                              : "bg-surface-container border-outline-variant/40 hover:bg-surface-container-high hover:border-cyan-500/30"
                          }`}
                        >
                          <div onClick={(e) => e.stopPropagation()} className="mt-0.5 shrink-0">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => togglePlannerTask(task.id, task.status)}
                              className="h-4 w-4"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-medium truncate ${
                                  isCompleted
                                    ? "line-through text-on-surface-variant"
                                    : isNoFap
                                    ? "text-amber-200 font-semibold"
                                    : "text-on-surface"
                                }`}
                              >
                                {task.title}
                              </span>
                              {isNoFap && (
                                <Badge variant="amber" className="text-[9px] px-1 py-0 gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">bolt</span>
                                  NoFap
                                </Badge>
                              )}
                              {task.timeSlot && (
                                <span className="text-[10px] font-mono text-on-surface-variant/70 shrink-0">
                                  {task.timeSlot}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-3 text-center gap-1.5 bg-surface-container/30 rounded-lg border border-dashed border-outline-variant/40">
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      No additional blueprint tasks scheduled for today.
                    </p>
                    <Link
                      href="/planner"
                      className="mt-0.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px]">add</span>
                      <span>Plan Task in Blueprint</span>
                    </Link>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Execution Bar */}
            <div className="pt-3 border-t border-outline-variant/30 mt-3">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-on-surface-variant text-[11px]">Blueprint Execution</span>
                <span className={`text-[11px] font-bold ${completedTasksCount === totalTasksCount && totalTasksCount > 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                  {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% Done
                </span>
              </div>
              <Progress
                value={totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}
                className="h-1.5"
                indicatorClassName="bg-gradient-to-r from-cyan-500 to-emerald-400"
              />
            </div>
          </div>
        </section>
      </div>

      {/* LIFE VECTOR MODULES: UNIFORM 3-COLUMN GRID ARCHITECTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        {/* CARD 1: SADHANA */}
        <Card className="bg-surface-container-low border-outline-variant/70 hover:border-emerald-500/40 transition-colors group flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-on-surface">
                    Sadhana
                  </CardTitle>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Sadhana &amp; Physical Protocol
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {workout && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteWorkout(workout.id || "latest")}
                      className="h-7 w-7 text-on-surface-variant hover:text-red-400"
                      title="Delete sadhana session"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditModal("workout", workout.id, workout)}
                      className="h-7 w-7 text-on-surface-variant hover:text-emerald-400"
                      title="Edit sadhana details"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={() => openModal("sadhana")}
                  className="h-7 text-xs font-mono"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{workout ? "Add" : "Log Sadhana"}</span>
                </Button>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-5 pt-4 space-y-3">
              {workout ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[22px]">verified</span>
                      <span className="text-xl font-bold font-mono text-emerald-300">Session Completed</span>
                    </div>
                    <Badge variant="emerald" className="text-[10px]">Daily Sadhana</Badge>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {workout.description || "Completed daily sadhana protocol."}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 flex items-center justify-between font-mono">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-amber-400 text-[16px] shrink-0">wb_sunny</span>
                        <span className="text-[11px] text-on-surface-variant truncate">Surya Kriya</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface font-mono shrink-0">
                        {workout.suryaKriyaCycles || workout.cycles || "—"}c
                      </span>
                    </div>

                    <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 flex items-center justify-between font-mono">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0">self_improvement</span>
                        <span className="text-[11px] text-on-surface-variant truncate">Asana Hold</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface font-mono shrink-0">
                        {workout.asanaHoldingCount ? `${workout.asanaHoldingCount}s` : (workout.cycles ? "—" : "Done")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => openModal("sadhana")}
                  className="flex flex-col items-center justify-center py-8 text-center gap-2 cursor-pointer hover:bg-surface-container/40 rounded-lg transition-colors border border-dashed border-outline-variant/50 p-4"
                >
                  <span className="material-symbols-outlined text-[32px] text-emerald-400/40">fitness_center</span>
                  <p className="text-xs text-on-surface-variant font-mono">No sadhana logged for this date</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="emerald"
                    className="font-mono text-xs gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Log Sadhana</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </div>

          <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className={workout ? "text-emerald-400 flex items-center gap-1" : "text-on-surface-variant"}>
              <span className="material-symbols-outlined text-[15px]">{workout ? "check_circle" : "radio_button_unchecked"}</span>
              {workout ? "Sadhana Quota Met" : "Sadhana Pending"}
            </span>
            <Badge variant="secondary" className="text-[10px]">Zone 3/4 Target</Badge>
          </CardFooter>
        </Card>

        {/* CARD 2: SLEEP & RECOVERY (Supports multiple entries per day) */}
        {(() => {
          const totalSleepMinutes = sleep?.totalDayMinutes ?? sleepLogsToday.reduce((sum, s) => sum + s.durationMinutes, 0);

          return (
            <Card className="bg-surface-container-low border-outline-variant/70 hover:border-cyan-500/40 transition-colors group flex flex-col justify-between h-full">
              <div>
                {/* Header */}
                <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">bedtime</span>
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold tracking-tight text-on-surface">
                        Sleep &amp; Recovery
                      </CardTitle>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                        Circadian Telemetry
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal("sleep")}
                      className="h-7 text-xs font-mono text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>{sleepLogsToday.length > 0 ? "Add" : "Log Sleep"}</span>
                    </Button>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-5 pt-4 space-y-3">
                  {sleepLogsToday.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-semibold font-mono text-on-surface">
                            {Math.floor(totalSleepMinutes / 60)}h {totalSleepMinutes % 60}m
                          </span>
                          <span className="text-xs font-mono text-on-surface-variant">
                            ({totalSleepMinutes}m{sleepLogsToday.length > 1 ? ` • ${sleepLogsToday.length} entries` : ""})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-emerald-400 font-mono">
                            {sleep?.avgQuality ?? sleep?.quality ?? "—"}%
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant block">Recovery Score</span>
                        </div>
                      </div>

                      {/* Multiple Sleep Logs List */}
                      <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                        {sleepLogsToday.map((entry, idx) => (
                          <div
                            key={entry.id || idx}
                            className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 flex items-center justify-between font-mono text-xs hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-on-surface">
                                  {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                                </span>
                                <Badge variant="emerald" className="text-[10px] px-1.5 py-0">
                                  {entry.quality}% Score
                                </Badge>
                                {sleepLogsToday.length > 1 && (
                                  <span className="text-[10px] text-zinc-500">#{sleepLogsToday.length - idx}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-on-surface-variant truncate">
                                {entry.startDate ? formatLocalDateString(entry.startDate) : formatLocalDateString(selectedDate)}
                                {entry.endDate && entry.endDate !== entry.startDate ? ` → ${formatLocalDateString(entry.endDate!)}` : ""}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditModal("sleep", entry.id, entry)}
                                className="h-6 w-6 text-on-surface-variant hover:text-cyan-400"
                                title="Edit sleep entry"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteSleep(entry.id || "latest")}
                                className="h-6 w-6 text-on-surface-variant hover:text-red-400"
                                title="Delete sleep entry"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Circadian Restorative Summary */}
                      <div className="p-2.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-on-surface font-medium">Restorative Sleep</span>
                        </div>
                        <Badge
                          variant={(sleep?.quality ?? 0) >= 80 ? "emerald" : "default"}
                          className="text-[10px]"
                        >
                          {(sleep?.quality ?? 0) >= 80 ? "Optimal Recovery" : "Cadence Rest"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => openModal("sleep")}
                      className="flex flex-col items-center justify-center py-8 text-center gap-2 cursor-pointer hover:bg-surface-container/40 rounded-lg transition-colors border border-dashed border-outline-variant/50 p-4"
                    >
                      <span className="material-symbols-outlined text-[32px] text-cyan-400/40">bedtime</span>
                      <p className="text-xs text-on-surface-variant font-mono">No sleep data for this date</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="font-mono text-xs gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Log Sleep</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                <span className={sleepLogsToday.length > 0 ? "text-cyan-400 flex items-center gap-1" : "text-on-surface-variant"}>
                  <span className="material-symbols-outlined text-[15px]">{sleepLogsToday.length > 0 ? "check_circle" : "radio_button_unchecked"}</span>
                  {sleepLogsToday.length > 0 ? `Logged (${sleepLogsToday.length} ${sleepLogsToday.length === 1 ? "entry" : "entries"})` : "Restorative Audit"}
                </span>
                <Badge variant="secondary" className="text-[10px]">Circadian Gate</Badge>
              </CardFooter>
            </Card>
          );
        })()}

        {/* CARD 3: VITALITY (NO FAP) */}
        <Card className="bg-surface-container-low border-outline-variant/70 hover:border-amber-500/40 transition-colors group flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-on-surface">
                    Vitality (No Fap)
                  </CardTitle>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    NoFap Vector
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditModal("brahmacharya", undefined, brahmacharya)}
                  className="h-7 w-7 text-on-surface-variant hover:text-amber-400"
                  title="Edit Vitality State"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                </Button>
                <Badge
                  variant={brahmacharya?.isCleanToday !== false ? "emerald" : "destructive"}
                  className="text-[10px]"
                >
                  {brahmacharya?.isCleanToday !== false ? "Tier 3 Active" : "Relapse"}
                </Badge>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-5 pt-4 space-y-3">
              {/* Checkbox Toggle */}
              <div
                onClick={() => logBrahmacharya(brahmacharya?.isCleanToday === false, 0)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                  brahmacharya?.isCleanToday !== false
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
                }`}
              >
                <Checkbox
                  checked={brahmacharya?.isCleanToday !== false}
                  onCheckedChange={(checked) => logBrahmacharya(!!checked, 0)}
                  className={
                    brahmacharya?.isCleanToday !== false
                      ? "border-emerald-500 data-[state=checked]:bg-emerald-500"
                      : "border-red-500"
                  }
                />
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${brahmacharya?.isCleanToday !== false ? "text-emerald-400" : "text-red-400"}`}>
                    {brahmacharya?.isCleanToday !== false ? "Clean Today ✓" : "Relapsed Today"}
                  </span>
                  <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                    {brahmacharya?.isCleanToday !== false ? "Ojas preserved. Tap to toggle status." : "Tap to mark clean."}
                  </p>
                </div>
              </div>

              {/* Streak Stats */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-surface-container p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    Current Streak
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    {brahmacharya?.cleanStreak ?? 0}d
                  </span>
                </div>
                <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    Max Streak
                  </span>
                  <span className="text-2xl font-bold text-on-surface">
                    {brahmacharya?.longestStreak ?? 0}d
                  </span>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">shield</span>
              Day {brahmacharya?.cleanStreak ?? 0} Clean State
            </span>
            <Badge variant="secondary" className="text-[10px]">Transmuted</Badge>
          </CardFooter>
        </Card>

        {/* CARD 4: BOOK READING */}
        {(() => {
          const activeDisplayBook = currentBook || (books.length > 0 ? books[0] : null);
          const activeCoverImage = reading?.imageUrl || activeDisplayBook?.imageUrl;

          // Readings today filtered specifically for the displayed active book
          const bookReadingsToday = readingsToday.filter((r) => r.bookId === activeDisplayBook?.id);
          const bookPagesRead = bookReadingsToday.reduce((sum, r) => sum + r.pagesRead, 0);
          const bookSessions = bookReadingsToday.length;

          // Overall daily total across all books combined
          const totalPagesRead = reading?.totalDayPages ?? readingsToday.reduce((sum, r) => sum + r.pagesRead, 0);

          const dayStartPage = bookReadingsToday.length > 0
            ? Math.min(...bookReadingsToday.map((r) => r.startPage))
            : (reading?.startPage ?? 0);
          const dayEndPage = bookReadingsToday.length > 0
            ? Math.max(...bookReadingsToday.map((r) => r.endPage))
            : (reading?.endPage ?? 0);

          const isBookCompleted = Boolean(
            activeDisplayBook && (activeDisplayBook.isCompleted || activeDisplayBook.status === "completed")
          );
          const totalPages = activeDisplayBook?.totalPages || 0;
          const curPage = activeDisplayBook?.currentPage ?? (reading?.endPage ?? dayEndPage);
          const progressPct = activeDisplayBook?.pctCompleted ?? (totalPages > 0 ? Math.min(100, Math.round((curPage / totalPages) * 100)) : 0);
          const pagesRemaining = activeDisplayBook?.pagesRemaining ?? (totalPages > 0 ? Math.max(0, totalPages - curPage) : 0);

          // Most recent added or updated book page log entry:
          // 1. Reading today for the displayed active book (reading.lastSession or first in bookReadingsToday)
          // 2. Active book's last recorded reading session
          // 3. Global last reading log across all books
          const latestEntryToday = reading?.lastSession || (bookReadingsToday.length > 0 ? bookReadingsToday[0] : null);
          const latestBookSession = activeDisplayBook?.lastReadingSession || null;
          const latestLogEntry = latestEntryToday || latestBookSession || lastReadingLog;

          const isEntryUpdated = Boolean(
            latestLogEntry?.updatedAt &&
            latestLogEntry?.createdAt &&
            new Date(latestLogEntry.updatedAt).getTime() > new Date(latestLogEntry.createdAt).getTime() + 1000
          );

          const entryToEdit = latestLogEntry || reading;

          return (
            <Card className="bg-surface-container-low border-outline-variant/70 hover:border-cyan-500/40 transition-colors group flex flex-col justify-between h-full">
              <div>
                {/* Header */}
                <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
                  <div
                    onClick={() => openBookModal("currently_reading")}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isBookCompleted
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {isBookCompleted ? "workspace_premium" : "auto_stories"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold tracking-tight text-on-surface hover:text-cyan-300 transition-colors truncate">
                        Book Reading
                      </CardTitle>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block truncate ${
                        isBookCompleted ? "text-emerald-400" : "text-cyan-400"
                      }`}>
                        {isBookCompleted ? "Book Completed • 100%" : "Reading Protocol"}
                      </span>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entryToEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal("reading", entryToEdit.id, entryToEdit)}
                        className="h-7 w-7 text-on-surface-variant hover:text-cyan-400"
                        title={entryToEdit.startPage && entryToEdit.endPage ? `Edit last reading log (pp. ${entryToEdit.startPage}–${entryToEdit.endPage})` : "Edit reading log"}
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </Button>
                    )}
                    <Badge
                      variant={isBookCompleted ? "emerald" : bookPagesRead > 0 ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {isBookCompleted ? "Finished" : bookPagesRead > 0 ? "Logged" : "Active"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openBookModal(isBookCompleted ? "add_book" : "log_session")}
                      className="h-7 w-7 text-on-surface-variant hover:text-cyan-300"
                      title={isBookCompleted ? "Add New Book" : "Log Reading"}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    </Button>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-5 pt-4 space-y-3">
                  {bookReadingsToday.length > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/50 flex gap-3.5">
                        {/* Book Cover Image */}
                        <div
                          onClick={() => openBookModal("currently_reading")}
                          className={`w-16 h-24 rounded-md overflow-hidden bg-zinc-900 border shrink-0 relative shadow-md cursor-pointer transition-colors flex items-center justify-center ${
                            isBookCompleted ? "border-emerald-500/40 hover:border-emerald-400" : "border-white/10 hover:border-cyan-400/60"
                          }`}
                        >
                          {activeCoverImage ? (
                            <img
                              src={activeCoverImage}
                              alt={reading?.bookTitle || "Cover"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-zinc-800 text-zinc-400">
                              <span className={`material-symbols-outlined text-[20px] mb-0.5 ${isBookCompleted ? "text-emerald-400" : "text-cyan-400"}`}>
                                {isBookCompleted ? "workspace_premium" : "menu_book"}
                              </span>
                              <span className="text-[8px] font-mono line-clamp-2 text-zinc-300">
                                {reading?.bookTitle || "Book"}
                              </span>
                            </div>
                          )}
                          {isBookCompleted && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow">
                              <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                            </div>
                          )}
                        </div>

                        {/* Reading Stats & Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5 flex items-center justify-between">
                              <span className={isBookCompleted ? "text-emerald-400 font-semibold" : "text-cyan-400"}>
                                {isBookCompleted ? "Completed Book" : "Currently Digesting"}
                              </span>
                              {bookSessions > 0 && (
                                <span className="text-zinc-400">
                                  {bookSessions} {bookSessions === 1 ? "session" : "sessions"}
                                </span>
                              )}
                            </div>
                            <h3
                              onClick={() => openBookModal("currently_reading")}
                              className="text-sm font-semibold text-on-surface line-clamp-1 cursor-pointer hover:text-cyan-300 transition-colors"
                            >
                              {activeDisplayBook?.title || reading?.bookTitle || "Reading Session"}
                            </h3>
                            {(activeDisplayBook?.author || reading?.author) && (
                              <p className="text-xs text-on-surface-variant line-clamp-1">{activeDisplayBook?.author || reading?.author}</p>
                            )}
                          </div>

                          {/* Overall Book Progress Bar */}
                          {totalPages > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-zinc-400">Book Progress</span>
                                <span className={isBookCompleted ? "text-emerald-400 font-bold" : "text-cyan-300 font-semibold"}>
                                  {isBookCompleted ? "100% Completed" : `${progressPct}% (p. ${curPage}/${totalPages})`}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, Math.max(3, isBookCompleted ? 100 : progressPct))}
                                className="h-1.5"
                                indicatorClassName={isBookCompleted ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-cyan-500 to-teal-400"}
                              />
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between text-xs font-mono">
                            <span className="text-on-surface-variant">
                              {dayStartPage === dayEndPage
                                ? `Today: p. ${dayEndPage}`
                                : `Today: pp. ${dayStartPage} → ${dayEndPage}`}
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              +{bookPagesRead} {bookPagesRead === 1 ? "Page" : "Pages"}
                              {totalPagesRead > bookPagesRead && (
                                <span className="text-zinc-500 text-[10px] ml-1 font-normal" title={`Total across all books today: +${totalPagesRead} pages`}>
                                  ({totalPagesRead}p total)
                                </span>
                              )}
                            </span>
                          </div>

                          {isBookCompleted && (
                            <div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px] font-mono">
                              <span className="text-zinc-400">Ready for next book?</span>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => openBookModal("add_book")}
                                className="h-auto p-0 text-cyan-300 hover:text-cyan-200"
                              >
                                + Start Next Book
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LAST ADDED / UPDATED BOOK PAGE LOG ENTRY */}
                      {latestLogEntry && (
                        <div className="p-3 rounded-xl bg-surface-container-high/60 border border-cyan-500/30 flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                              <span className="font-semibold">Last Page Log Entry</span>
                              <Badge variant={isEntryUpdated ? "outline" : "default"} className="text-[9px] px-1.5 py-0 h-4 border-cyan-500/40 font-mono lowercase">
                                {isEntryUpdated ? "updated" : "added"}
                              </Badge>
                            </div>
                            {(latestLogEntry as any)?.sessionDate && (
                              <span className="text-zinc-400 text-[10px] font-normal lowercase">
                                {(latestLogEntry as any).sessionDate}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">
                                pp. {latestLogEntry.startPage} → {latestLogEntry.endPage}
                              </span>
                              <span className="text-emerald-400 font-bold text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                                +{latestLogEntry.pagesRead} {latestLogEntry.pagesRead === 1 ? "page" : "pages"}
                              </span>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal("reading", latestLogEntry.id, latestLogEntry)}
                              className="h-6 w-6 text-zinc-400 hover:text-cyan-300"
                              title="Edit this log entry"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </Button>
                          </div>

                          {latestLogEntry.insightQuote && (
                            <p className="text-[11px] text-amber-300/85 italic font-sans pl-2 border-l-2 border-amber-400/60 line-clamp-2 mt-0.5">
                              &ldquo;{latestLogEntry.insightQuote}&rdquo;
                            </p>
                          )}
                        </div>
                      )}

                      {!latestLogEntry && reading?.insightQuote && (
                        <p className="text-on-surface-variant text-[11px] italic line-clamp-2 pl-2 border-l border-amber-400">
                          &ldquo;{reading.insightQuote}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : activeDisplayBook ? (
                    <div className="space-y-3">
                      <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/50 flex gap-3.5">
                        <div
                          onClick={() => openBookModal("currently_reading")}
                          className={`w-16 h-24 rounded-md overflow-hidden bg-zinc-900 border shrink-0 relative shadow-md cursor-pointer transition-colors flex items-center justify-center ${
                            isBookCompleted ? "border-emerald-500/40 hover:border-emerald-400" : "border-white/10 hover:border-cyan-400/60"
                          }`}
                        >
                          {activeCoverImage ? (
                            <img
                              src={activeCoverImage}
                              alt={activeDisplayBook.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-zinc-800 text-zinc-400">
                              <span className={`material-symbols-outlined text-[20px] mb-0.5 ${isBookCompleted ? "text-emerald-400" : "text-cyan-400"}`}>
                                {isBookCompleted ? "verified" : "menu_book"}
                              </span>
                              <span className="text-[8px] font-mono line-clamp-2 text-zinc-300">
                                {activeDisplayBook.title}
                              </span>
                            </div>
                          )}
                          {isBookCompleted && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow">
                              <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5 flex items-center justify-between">
                              <span className={isBookCompleted ? "text-emerald-400 font-semibold" : "text-cyan-400"}>
                                {isBookCompleted ? "✨ Book Completed" : "Active Book"}
                              </span>
                              {isBookCompleted && (
                                <Badge variant="emerald" className="text-[10px]">100% Done</Badge>
                              )}
                            </div>
                            <h3
                              onClick={() => openBookModal("currently_reading")}
                              className="text-sm font-semibold text-on-surface line-clamp-1 cursor-pointer hover:text-cyan-300 transition-colors"
                            >
                              {activeDisplayBook.title}
                            </h3>
                            {activeDisplayBook.author && (
                              <p className="text-xs text-on-surface-variant line-clamp-1">
                                {activeDisplayBook.author}
                              </p>
                            )}
                          </div>

                          {totalPages > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-zinc-400">
                                  {isBookCompleted ? "Reading Finished" : `Page ${curPage} of ${totalPages}`}
                                </span>
                                <span className={isBookCompleted ? "text-emerald-400 font-bold" : "text-cyan-300 font-semibold"}>
                                  {isBookCompleted ? `${totalPages}p total` : `${progressPct}% • ${pagesRemaining}p left`}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, Math.max(3, isBookCompleted ? 100 : progressPct))}
                                className="h-1.5"
                                indicatorClassName={isBookCompleted ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-cyan-500 to-teal-400"}
                              />
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            {isBookCompleted ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openBookModal("add_book")}
                                className="h-7 text-xs font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/15"
                              >
                                <span className="material-symbols-outlined text-[15px]">add</span>
                                <span>+ Start Next Book</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openBookModal("log_session")}
                                className="h-7 text-xs font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/15"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                <span>Log Today's Pages</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* LAST ADDED / UPDATED BOOK PAGE LOG ENTRY WHEN NO LOGS TODAY */}
                      {latestLogEntry && (
                        <div className="p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/60 hover:border-cyan-500/30 transition-colors flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px] text-cyan-400">history</span>
                              <span className="font-semibold text-zinc-300">Last Book Page Log Entry</span>
                              <Badge variant={isEntryUpdated ? "outline" : "secondary"} className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-300 font-mono lowercase">
                                {isEntryUpdated ? "updated" : "added"}
                              </Badge>
                            </div>
                            {(latestLogEntry as any)?.sessionDate && (
                              <span className="text-zinc-500 text-[10px] font-normal lowercase">
                                {(latestLogEntry as any).sessionDate}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                pp. {latestLogEntry.startPage} → {latestLogEntry.endPage}
                              </span>
                              <span className="text-emerald-400 font-bold text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                                +{latestLogEntry.pagesRead} {latestLogEntry.pagesRead === 1 ? "page" : "pages"}
                              </span>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal("reading", latestLogEntry.id, latestLogEntry)}
                              className="h-6 w-6 text-zinc-400 hover:text-cyan-300"
                              title="Edit this log entry"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </Button>
                          </div>

                          {latestLogEntry.insightQuote && (
                            <p className="text-[11px] text-amber-300/85 italic font-sans pl-2 border-l-2 border-amber-400/60 line-clamp-2 mt-0.5">
                              &ldquo;{latestLogEntry.insightQuote}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => openBookModal("add_book")}
                      className="flex flex-col items-center justify-center py-8 text-center gap-2 cursor-pointer hover:bg-surface-container/40 rounded-lg transition-colors border border-dashed border-outline-variant/50 p-4"
                    >
                      <span className="material-symbols-outlined text-[32px] text-cyan-400/40">auto_stories</span>
                      <p className="text-xs text-on-surface-variant font-mono">No books in reading vault yet</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="font-mono text-xs gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                        <span>Start Reading a Book</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Footer */}
              <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                {isBookCompleted ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Book Finished • 30p Cadence Met
                  </span>
                ) : (
                  <span className={totalPagesRead >= 30 ? "text-cyan-400 flex items-center gap-1" : totalPagesRead > 0 ? "text-emerald-400 flex items-center gap-1" : "text-on-surface-variant"}>
                    <span className="material-symbols-outlined text-[15px]">
                      {totalPagesRead >= 30 ? "check_circle" : totalPagesRead > 0 ? "pending" : "radio_button_unchecked"}
                    </span>
                    {totalPagesRead >= 30
                      ? "30p Cadence Met"
                      : totalPagesRead > 0
                        ? `${totalPagesRead} / 30p Read Today`
                        : "Reading Pending"}
                  </span>
                )}
                <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-on-surface-variant hover:text-cyan-400">
                  <Link href="/books" className="flex items-center gap-1">
                    <span>Vault: {books.length} {books.length === 1 ? "Book" : "Books"}</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })()}

        {/* CARD 5: DEEP WORK & SKILL ARCHITECTURE */}
        <Card className={`border shadow-sm flex flex-col justify-between transition-all group h-full ${
          activeTimer?.isRunning
            ? "bg-gradient-to-b from-amber-950/20 via-surface-container-low to-surface-container-low border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
            : "bg-surface-container-low border-outline-variant/70 hover:border-amber-500/40"
        }`}>
          <div>
            {/* Header */}
            <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  activeTimer?.isRunning
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                }`}>
                  <span className={`material-symbols-outlined text-[18px] ${activeTimer?.isRunning && !activeTimer?.isPaused ? "animate-spin-slow" : ""}`}>
                    {activeTimer?.isRunning ? "timer" : "architecture"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold tracking-tight text-on-surface">
                      Deep Work
                    </CardTitle>
                    {activeTimer?.isRunning && (
                      <Badge variant="amber" className="text-[10px] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    High Leverage Engineering
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!activeTimer?.isRunning && deepWork && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteDeepWork(deepWork.id || "latest")}
                      className="h-7 w-7 text-on-surface-variant hover:text-red-400"
                      title="Delete focus block"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditModal("deepwork", deepWork.id, deepWork)}
                      className="h-7 w-7 text-on-surface-variant hover:text-amber-400"
                      title="Edit focus block"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </Button>
                  </>
                )}

                {!activeTimer?.isRunning && (
                  <>
                    <Button
                      size="sm"
                      variant="amber"
                      onClick={() => setIsTimerModalOpen(true)}
                      className="h-7 text-xs font-mono"
                      type="button"
                      title="Start Live Focus Timer"
                    >
                      <span className="material-symbols-outlined text-[15px]">timer</span>
                      <span>Timer</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal("deepwork")}
                      className="h-7 text-xs font-mono"
                      type="button"
                      title="Manual Log Block"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Log</span>
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            {/* LIVE TIMER CONSOLE (ACTIVE WITH LARGE FONT IN THIS SECTION) */}
            <CardContent className="p-5 pt-4 space-y-3">
              {activeTimer?.isRunning ? (
                <div className="space-y-3.5">
                  {/* Timer Clock Display */}
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-surface-container-high/80 to-surface-container border border-amber-500/40 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center justify-between w-full mb-1 text-[11px] font-mono text-on-surface-variant">
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase">
                        <span className={`w-2 h-2 rounded-full ${activeTimer.isPaused ? "bg-amber-500" : "bg-amber-400 animate-ping"}`} />
                        {activeTimer.isPaused ? "Paused" : "Flow State Active"}
                      </span>
                      <span>
                        {activeTimer.startTime ? `Started ${new Date(activeTimer.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Tracking live"}
                      </span>
                    </div>

                    {/* LARGE FONT STOPWATCH DISPLAY */}
                    <div className="text-5xl sm:text-6xl font-mono font-bold tracking-wider text-amber-200 my-2 drop-shadow-[0_0_16px_rgba(245,158,11,0.4)]">
                      {String(Math.floor(activeTimer.elapsedSeconds / 3600)).padStart(2, "0")}:
                      {String(Math.floor((activeTimer.elapsedSeconds % 3600) / 60)).padStart(2, "0")}:
                      {String(activeTimer.elapsedSeconds % 60).padStart(2, "0")}
                    </div>

                    {/* Active Topic & Editor */}
                    <div className="mt-1 w-full text-center">
                      <input
                        type="text"
                        value={activeTimer.topic}
                        onChange={(e) => updateTimerTopic(e.target.value)}
                        placeholder="Session topic / focus goal..."
                        className="w-full text-center text-xs sm:text-sm font-semibold text-on-surface font-sans bg-transparent border-b border-outline-variant/60 focus:border-amber-400 focus:outline-none py-1 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Live Controls */}
                  <div className="flex items-center gap-2">
                    {activeTimer.isPaused ? (
                      <Button
                        onClick={resumeDeepWorkTimer}
                        type="button"
                        variant="amber"
                        className="flex-1 font-mono text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>Resume</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseDeepWorkTimer}
                        type="button"
                        variant="outline"
                        className="flex-1 font-mono text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">pause</span>
                        <span>Pause</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => stopAndLogDeepWorkTimer()}
                      type="button"
                      variant="amber"
                      className="flex-2 font-mono text-xs font-bold shadow-md bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black"
                    >
                      <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                      <span>Stop &amp; Log Session ⏎</span>
                    </Button>

                    <Button
                      onClick={discardDeepWorkTimer}
                      type="button"
                      size="icon"
                      variant="outline"
                      title="Discard without saving"
                      className="hover:border-red-500/40 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </Button>
                  </div>
                </div>
              ) : deepWork ? (
                /* LOGGED DEEP WORK DISPLAY */
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between font-mono">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold text-on-surface">
                        {(deepWork.durationMinutes / 60).toFixed(1)}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        hrs logged {deepWork.sessionsCount && deepWork.sessionsCount > 1 ? `(${deepWork.sessionsCount} sessions)` : ""}
                      </span>
                    </div>
                    <Badge variant="emerald" className="text-xs font-semibold">Target: 3.0h+</Badge>
                  </div>

                  <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-0.5">
                      <span>Active Domain</span>
                      {deepWork.startTime && deepWork.endTime && (
                        <span className="text-on-surface-variant">
                          {deepWork.startTime} - {deepWork.endTime}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-on-surface line-clamp-1">{deepWork.topic}</h3>
                    {deepWork.description && (
                      <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                        {deepWork.description}
                      </p>
                    )}
                    {deepWork.keyInsight && (
                      <div className="mt-2 pt-2 border-t border-outline-variant/40 text-[10px] font-mono text-cyan-300">
                        <span className="text-on-surface-variant font-sans">Insight: </span>
                        {deepWork.keyInsight}
                      </div>
                    )}
                  </div>

                  {/* Focus Telemetry Chart */}
                  <div className="p-2.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 font-mono">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-0.5">
                      Weekly Focus Cadence
                    </span>
                    <FocusTelemetryChart data={state?.deepWorkWeeklyCadence} />
                  </div>
                </div>
              ) : (
                /* EMPTY STATE WITH 2 CLEAR ACTIONS */
                <div className="flex flex-col items-center justify-center py-4 text-center gap-2.5 rounded-lg border border-dashed border-outline-variant/50 p-4">
                  <span className="material-symbols-outlined text-[32px] text-amber-400/40">architecture</span>
                  <div>
                    <p className="text-xs text-on-surface font-medium">No deep work logged for this date</p>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Start a live timer or enter past block</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="amber"
                      onClick={() => setIsTimerModalOpen(true)}
                      className="font-mono text-xs gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Start Timer</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openModal("deepwork")}
                      className="font-mono text-xs gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Manual Log</span>
                    </Button>
                  </div>

                  {/* Focus Telemetry Chart */}
                  <div className="w-full mt-2.5 p-2.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 font-mono text-left">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-0.5">
                      Weekly Focus Cadence
                    </span>
                    <FocusTelemetryChart data={state?.deepWorkWeeklyCadence} />
                  </div>
                </div>
              )}
            </CardContent>
          </div>

          <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className={activeTimer?.isRunning ? "text-amber-300 flex items-center gap-1 font-semibold" : deepWork ? "text-amber-400 flex items-center gap-1" : "text-on-surface-variant"}>
              <span className="material-symbols-outlined text-[15px]">
                {activeTimer?.isRunning ? "hourglass_top" : deepWork ? "check_circle" : "radio_button_unchecked"}
              </span>
              {activeTimer?.isRunning ? "Focus Block In Progress" : deepWork ? "Focus Session Verified" : "Focus Block Pending"}
            </span>
            <Badge variant="secondary" className="text-[10px]">3.0h Minimum</Badge>
          </CardFooter>
        </Card>

        {/* CARD 6: FINANCIAL VELOCITY (MONTHLY BUDGET — RESETS EVERY 1ST) */}
        <Card className="bg-surface-container-low border-outline-variant/70 hover:border-emerald-500/40 transition-colors group flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <CardHeader className="p-5 pb-3 border-b border-outline-variant/40 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-on-surface">
                    Financial Velocity
                  </CardTitle>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Monthly Budget (Resets 1st)
                  </span>
                </div>
              </div>

              <Badge variant="secondary" className="text-[11px] gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{finance?.cycleLabel || "Monthly Cycle"}</span>
              </Badge>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-5 pt-4 space-y-3">
              {/* Monthly Budget Breakdown */}
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Spent This Month</span>
                  <span className="text-lg font-bold text-on-surface block mt-0.5">
                    ₹{finance?.monthlySpentInr ?? 0}
                  </span>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5 truncate">
                    of ₹{finance?.totalMonthlyPoolInr ?? finance?.monthlyBudgetInr ?? 2000} pool
                  </span>
                </div>

                <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Remaining</span>
                    {(finance?.monthlyAddedInr ?? 0) > 0 && (
                      <span className="text-[9px] text-emerald-400 font-bold px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        +₹{finance?.monthlyAddedInr}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-lg font-bold block mt-0.5 ${
                      (finance?.monthlyRemainingInr ?? 2000) < 0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    ₹{finance?.monthlyRemainingInr ?? 2000}
                  </span>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">
                    {(finance?.monthlyRemainingInr ?? 2000) < 0 ? "Over monthly limit" : "Safe to spend"}
                  </span>
                </div>
              </div>

              {/* Monthly Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-on-surface-variant">Monthly Allocation</span>
                  <span className="text-emerald-400 font-semibold">
                    {finance?.monthlyPacingPct ?? 0}% Used
                  </span>
                </div>
                <Progress
                  value={Math.min(100, finance?.monthlyPacingPct ?? 0)}
                  className="h-1.5"
                  indicatorClassName={
                    (finance?.monthlyRemainingInr ?? 2000) < 0
                      ? "bg-rose-500"
                      : (finance?.monthlyPacingPct ?? 0) > 85
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }
                />
              </div>

              {/* Single-Line Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono text-xs">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRecentLedgerModal(true)}
                  className="h-8 text-xs font-mono text-cyan-300 hover:text-cyan-200 border-outline-variant hover:border-cyan-500/50"
                  title="View last 10 entries"
                >
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  <span className="truncate">Info</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="emerald"
                  onClick={() => openModal("add_money")}
                  className="h-8 text-xs font-mono"
                  title="Add money / top-up monthly pool"
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  <span className="truncate">Add</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openModal("expense")}
                  className="h-8 text-xs font-mono hover:border-rose-500/40 hover:text-rose-300"
                  title="Log spend / expense"
                >
                  <span className="material-symbols-outlined text-[15px]">remove</span>
                  <span className="truncate">Spend</span>
                </Button>
              </div>

              {/* Recent Ledger Items / Chart Toggle */}
              <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                  <span>{financeView === "chart" ? "Spend Curve" : "Monthly Ledger"}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFinanceView((v) => (v === "chart" ? "list" : "chart"))}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Toggle Chart or List view"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {financeView === "chart" ? "format_list_bulleted" : "show_chart"}
                      </span>
                      <span>{financeView === "chart" ? "List" : "Chart"}</span>
                    </button>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{finance?.transactionsCycle?.length ?? 0} Items</Badge>
                  </div>
                </div>

                {financeView === "chart" ? (
                  <FinancialVelocityChart
                    transactions={finance?.transactionsCycle || []}
                    monthlyBudget={finance?.monthlyBudgetInr}
                  />
                ) : finance?.transactionsCycle && finance.transactionsCycle.length > 0 ? (
                  finance.transactionsCycle.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-0.5 group/tx">
                      <span className="text-on-surface truncate flex items-center gap-1.5 text-[11px]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            tx.amount > 0 ? "bg-emerald-400" : "bg-cyan-400"
                          }`}
                        />
                        <span className="truncate">{tx.title}</span>
                        {tx.date && (
                          <span className="text-[10px] text-on-surface-variant shrink-0">
                            ({tx.date.slice(5)})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`font-semibold ${
                            tx.amount > 0 ? "text-emerald-400" : "text-on-surface"
                          }`}
                        >
                          {tx.amount > 0 ? `+₹${tx.amount}` : `₹${Math.abs(tx.amount)}`}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteExpense(tx.id)}
                          className="h-5 w-5 opacity-0 group-hover/tx:opacity-100 text-on-surface-variant hover:text-red-400"
                          title="Delete entry"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-[11px] text-on-surface-variant">
                    No transactions logged in this monthly cycle
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          {/* Footer: Renew info */}
          <CardFooter className="p-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">event_repeat</span>
              <span>
                Renews on the 1st (
                {(() => {
                  if (finance?.daysUntilReset !== undefined && finance.daysUntilReset >= 0) {
                    return `${finance.daysUntilReset}d left`;
                  }
                  try {
                    const [y, m, d] = (selectedDate || new Date().toISOString().slice(0, 10)).split("-").map(Number);
                    const curr = new Date(y, (m || 1) - 1, d || 1);
                    const target = new Date(y, m || 1, 1);
                    const diff = Math.max(1, Math.ceil((target.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)));
                    return `${diff}d left`;
                  } catch {
                    return "in 1st of month";
                  }
                })()}
                )
              </span>
            </span>
            <Badge variant="secondary" className="text-[10px]">
              Allowance: ₹{(finance?.monthlyBudgetInr ?? 2000).toLocaleString()}
              {(finance?.monthlyAddedInr ?? 0) > 0 ? ` (+₹${finance?.monthlyAddedInr} added)` : ""}
            </Badge>
          </CardFooter>
        </Card>
      </div>

      {/* FULL-WIDTH BOTTOM MODULE: Rate Your Discipline (0-10 Interactive Selector) */}
      <Card className="bg-surface-container-low border-outline-variant/70 shadow-sm mb-6 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">tune</span>
            <h2 className="text-sm font-semibold tracking-tight text-on-surface">
              Rate Today&apos;s Discipline Cadence
            </h2>
          </div>
          <div className="font-mono text-xs text-on-surface-variant flex items-center gap-2">
            <span>Current Sealed Score:</span>
            <Badge variant="default" className="text-cyan-300 font-bold">
              {disciplineScore !== null && disciplineScore !== undefined
                ? `${disciplineScore} / 10 (${getDisciplineTier(disciplineScore)})`
                : "Not rated yet"}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant mb-4 font-mono">
          Clinical self-assessment of daily adherence across deep work, vital energy conservation, reading, and physical vow execution.
        </p>

        {/* Interactive 0-10 Scale Buttons */}
        <div className="grid grid-cols-11 gap-1 sm:gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = disciplineScore === num;
            return (
              <Button
                key={num}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => setDisciplineScore(num)}
                className={`py-2.5 font-mono text-xs font-semibold transition-all ${isSelected
                  ? "bg-cyan-400 text-[#002730] shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105"
                  : ""
                  }`}
              >
                {num}
              </Button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-3 text-[11px] font-mono text-on-surface-variant">
          <span>0: Zero Cadence</span>
          <span>5: Divided Focus</span>
          <span className="text-cyan-400 font-medium">9: Sovereign Execution</span>
          <span>10: Absolute Mastery</span>
        </div>
      </Card>

      {/* Bottom Stoic Grounding Quotation */}
      <Card className="bg-surface-container-lowest border-outline-variant/50 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-cyan-400 shrink-0" />
          <blockquote className="text-xs text-on-surface italic">
            &ldquo;You have power over your mind - not outside events. Realize this, and you will find strength.&rdquo;
          </blockquote>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-on-surface-variant">
          <span>— Marcus Aurelius, Meditations IV</span>
          <Badge variant="emerald" className="text-[10px]">
            Protocol Sealed
          </Badge>
        </div>
      </Card>

      {/* Last 10 Entries Dialog */}
      <Dialog open={showRecentLedgerModal} onOpenChange={setShowRecentLedgerModal}>
        <DialogContent className="max-w-md bg-surface-container-low border-outline-variant/80 p-0 overflow-hidden max-h-[82vh] sm:max-h-[80vh] flex flex-col">
          <DialogHeader className="p-3.5 sm:p-4 border-b border-outline-variant/60 bg-surface-container-lowest/60 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-on-surface tracking-tight">
                  Last 10 Ledger Entries
                </DialogTitle>
                <DialogDescription className="text-[11px] text-on-surface-variant font-mono">
                  Recent transactions across monthly allocation
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Transaction List */}
          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-2.5 font-mono text-xs">
            {/* Visual Spend Burn Curve */}
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 mb-2">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                Monthly Burn Velocity Pacing
              </span>
              <FinancialVelocityChart
                transactions={finance?.transactionsCycle || []}
                monthlyBudget={finance?.monthlyBudgetInr}
              />
            </div>

            {(() => {
              const list =
                finance?.recentTransactions && finance.recentTransactions.length > 0
                  ? finance.recentTransactions
                  : finance?.transactionsCycle || [];
              const top10 = list.slice(0, 10);

              if (top10.length === 0) {
                return (
                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 block mb-2">
                      receipt
                    </span>
                    <span>No transactions recorded yet</span>
                  </div>
                );
              }

              return top10.map((tx, idx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div
                    key={tx.id || idx}
                    className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-between gap-3 hover:border-outline-variant transition-colors group/row"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-surface-container-high text-cyan-400 border border-outline-variant/50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isCredit ? "arrow_downward" : "arrow_upward"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-on-surface truncate">
                            {tx.title}
                          </span>
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase">
                            {tx.category || "general"}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                          <span>{tx.date || "Today"}</span>
                          {tx.isEssential && (
                            <span className="text-emerald-400 font-medium">• Essential</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm font-bold ${
                          isCredit ? "text-emerald-400" : "text-on-surface"
                        }`}
                      >
                        {isCredit ? `+₹${tx.amount}` : `₹${Math.abs(tx.amount)}`}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteExpense(tx.id)}
                        className="h-6 w-6 opacity-0 group-hover/row:opacity-100 text-on-surface-variant hover:text-red-400"
                        title="Delete entry"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-3 sm:p-3.5 border-t border-outline-variant/60 bg-surface-container-lowest/60 flex flex-row items-center justify-between text-xs font-mono sm:justify-between shrink-0">
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-cyan-400 hover:text-cyan-300">
              <Link
                href="/finance"
                onClick={() => setShowRecentLedgerModal(false)}
                className="flex items-center gap-1"
              >
                <span>Full Finance Ledger</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowRecentLedgerModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* START DEEP WORK TIMER POPUP DIALOG */}
      <Dialog open={isTimerModalOpen} onOpenChange={setIsTimerModalOpen}>
        <DialogContent className="max-w-md bg-surface-container-low border-2 border-amber-500/50 p-0 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] max-h-[82vh] sm:max-h-[80vh] flex flex-col">
          <DialogHeader className="p-3.5 sm:p-4 border-b border-outline-variant/60 bg-gradient-to-r from-amber-950/40 via-surface-container to-amber-950/20 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-on-surface tracking-tight">
                  Start Deep Work Timer
                </DialogTitle>
                <DialogDescription className="text-[11px] text-amber-400 font-mono mt-0.5">
                  Auto-logs to your daily Deep Work ledger when stopped
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="p-3.5 sm:p-4 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1.5">
                What will you focus on?
              </label>
              <input
                type="text"
                value={timerTopicInput}
                onChange={(e) => setTimerTopicInput(e.target.value)}
                placeholder="e.g. Distributed Systems & Go Concurrency"
                className="w-full bg-surface-container border border-outline-variant focus:border-amber-400 rounded-lg px-3 py-2 text-sm text-on-surface font-sans placeholder:text-on-surface-variant/40 focus:outline-none transition-all shadow-inner"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    startDeepWorkTimer(timerTopicInput.trim() || "Deep Work Session");
                    setIsTimerModalOpen(false);
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-semibold">
                  Quick Focus Presets
                </label>
                {timerTopicInput.trim().length > 0 &&
                  !focusPresets.some((p) => p.toLowerCase() === timerTopicInput.trim().toLowerCase()) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addFocusPreset(timerTopicInput.trim())}
                      className="text-xs font-mono h-7 px-2.5 gap-1 text-amber-400 border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-400"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Add &quot;{timerTopicInput.trim()}&quot;</span>
                    </Button>
                  )}
              </div>
              {focusPresets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {focusPresets.map((preset) => (
                    <div
                      key={preset}
                      className={`inline-flex items-center rounded-lg border text-xs font-mono transition-all ${
                        timerTopicInput === preset
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:border-amber-500/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setTimerTopicInput(preset)}
                        className="px-2.5 py-1.5 font-medium hover:text-amber-300 transition-colors"
                      >
                        {preset}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFocusPreset(preset);
                        }}
                        title={`Remove "${preset}"`}
                        className="pr-2 pl-0.5 py-1.5 text-on-surface-variant/60 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-mono text-on-surface-variant/70 italic py-1">
                  No presets saved yet. Type above to add your custom focus presets.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-3 sm:p-3.5 border-t border-outline-variant/60 bg-surface-container-lowest/60 flex flex-row items-center justify-end gap-2 sm:justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTimerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="amber"
              size="sm"
              onClick={() => {
                startDeepWorkTimer(timerTopicInput.trim() || "Deep Work Session");
                setIsTimerModalOpen(false);
              }}
              className="gap-1.5 font-bold text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Start Focus Stopwatch</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
