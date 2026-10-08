"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLifeOS } from "@/context/LifeOSContext";
import { formatLocalDateString } from "@/lib/date-utils";

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
    activeTimer,
    startDeepWorkTimer,
    pauseDeepWorkTimer,
    resumeDeepWorkTimer,
    stopAndLogDeepWorkTimer,
    discardDeepWorkTimer,
    updateTimerTopic,
  } = useLifeOS();

  const pune = state?.puneFund ?? null;
  const [showRecentLedgerModal, setShowRecentLedgerModal] = useState(false);
  const [timerTopicInput, setTimerTopicInput] = useState("Engineering Income Work");
  const [timerDescInput, setTimerDescInput] = useState("");
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

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
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-700"
                      style={{ width: `${Math.min(100, pune.pctCompleted ?? 0)}%` }}
                    />
                  </div>
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

              {/* Task Items List */}
              {todayTasks.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-outline-variant/40">
                  {todayTasks.map((task) => {
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlannerTask(task.id, task.status);
                          }}
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                            isCompleted
                              ? "bg-emerald-400 border-emerald-400 text-surface"
                              : isNoFap
                              ? "border-amber-400/70 hover:border-amber-400"
                              : "border-outline-variant hover:border-cyan-400"
                          }`}
                        >
                          {isCompleted && (
                            <span className="material-symbols-outlined text-[13px] text-[#00271b] font-bold">
                              check
                            </span>
                          )}
                        </button>

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
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 font-semibold">
                                <span className="material-symbols-outlined text-[10px]">bolt</span>
                                NoFap
                              </span>
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
                <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/60 flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">assignment_add</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-on-surface">No tasks planned for today</p>
                    <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                      Schedule your non-negotiables in Day Blueprint.
                    </p>
                  </div>
                  <Link
                    href="/planner"
                    className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium hover:bg-cyan-500/25 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Task</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Execution Bar */}
            <div className="pt-3 border-t border-outline-variant/30 mt-3">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-on-surface-variant text-[11px]">Blueprint Execution</span>
                <span className={`text-[11px] font-bold ${completedTasksCount === totalTasksCount && totalTasksCount > 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                  {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% Done
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* LIFE VECTOR MODULES: UNIFORM 3-COLUMN GRID ARCHITECTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        {/* CARD 1: SADHANA */}
        <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors group h-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-on-surface">
                    Sadhana
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    Sadhana &amp; Physical Protocol
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {workout && (
                  <>
                    <button
                      onClick={() => deleteWorkout(workout.id || "latest")}
                      className="p-1 text-on-surface-variant hover:text-red-400 transition-colors"
                      title="Delete sadhana session"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                    <button
                      onClick={() => openEditModal("workout", workout.id, workout)}
                      className="p-1 text-on-surface-variant hover:text-emerald-400 transition-colors"
                      title="Edit sadhana details"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => openModal("sadhana")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-emerald-400 text-xs font-mono transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{workout ? "Add" : "Log Sadhana"}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {workout ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  {workout.durationMinutes && workout.durationMinutes > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold font-mono text-on-surface">
                        {workout.durationMinutes}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 font-mono">Mins</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[24px]">check_circle</span>
                      <span className="text-lg font-bold font-mono text-emerald-300">Completed</span>
                    </div>
                  )}
                  <span className="text-xs text-on-surface-variant font-mono">Daily Sadhana</span>
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
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Log Sadhana</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className={workout ? "text-emerald-400 flex items-center gap-1" : "text-on-surface-variant"}>
              <span className="material-symbols-outlined text-[15px]">{workout ? "check_circle" : "radio_button_unchecked"}</span>
              {workout ? "Sadhana Quota Met" : "Sadhana Pending"}
            </span>
            <span className="text-on-surface-variant text-[11px]">Zone 3/4 Target</span>
          </div>
        </section>

        {/* CARD 2: SLEEP & RECOVERY (Supports multiple entries per day) */}
        {(() => {
          const totalSleepMinutes = sleep?.totalDayMinutes ?? sleepLogsToday.reduce((sum, s) => sum + s.durationMinutes, 0);

          return (
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors group h-full">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">bedtime</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold tracking-tight text-on-surface">
                        Sleep &amp; Recovery
                      </h2>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                        Circadian Telemetry
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal("sleep")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-cyan-400 text-xs font-mono transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>{sleepLogsToday.length > 0 ? "Add" : "Log Sleep"}</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
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
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                {entry.quality}% Score
                              </span>
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
                            <button
                              onClick={() => openEditModal("sleep", entry.id, entry)}
                              className="p-1 text-on-surface-variant hover:text-cyan-400 transition-colors"
                              title="Edit sleep entry"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              onClick={() => deleteSleep(entry.id || "latest")}
                              className="p-1 text-on-surface-variant hover:text-red-400 transition-colors"
                              title="Delete sleep entry"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
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
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${(sleep?.quality ?? 0) >= 80
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                        {(sleep?.quality ?? 0) >= 80 ? "Optimal Recovery" : "Cadence Rest"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => openModal("sleep")}
                    className="flex flex-col items-center justify-center py-8 text-center gap-2 cursor-pointer hover:bg-surface-container/40 rounded-lg transition-colors border border-dashed border-outline-variant/50 p-4"
                  >
                    <span className="material-symbols-outlined text-[32px] text-cyan-400/40">bedtime</span>
                    <p className="text-xs text-on-surface-variant font-mono">No sleep data for this date</p>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Log Sleep</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                <span className={sleepLogsToday.length > 0 ? "text-cyan-400 flex items-center gap-1" : "text-on-surface-variant"}>
                  <span className="material-symbols-outlined text-[15px]">{sleepLogsToday.length > 0 ? "check_circle" : "radio_button_unchecked"}</span>
                  {sleepLogsToday.length > 0 ? `Logged (${sleepLogsToday.length} ${sleepLogsToday.length === 1 ? "entry" : "entries"})` : "Restorative Audit"}
                </span>
                <span className="text-on-surface-variant text-[11px]">Circadian Gate</span>
              </div>
            </section>
          );
        })()}

        {/* CARD 3: VITALITY (NO FAP) */}
        <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors group h-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-on-surface">
                    Vitality (No Fap)
                  </h2>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                    NoFap Vector
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal("brahmacharya", undefined, brahmacharya)}
                  className="p-1 text-on-surface-variant hover:text-amber-400 transition-colors"
                  title="Edit Vitality State"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                </button>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${brahmacharya?.isCleanToday !== false
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                  : "bg-red-950/60 text-red-300 border-red-500/30"
                  }`}>
                  {brahmacharya?.isCleanToday !== false ? "Tier 3 Active" : "Relapse"}
                </span>
              </div>
            </div>

            {/* Checkbox Toggle */}
            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all mb-3 ${brahmacharya?.isCleanToday !== false
                ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
                }`}
            >
              <input
                type="checkbox"
                checked={brahmacharya?.isCleanToday !== false}
                onChange={(e) => logBrahmacharya(e.target.checked, 0)}
                className="sr-only"
              />
              <span
                className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${brahmacharya?.isCleanToday !== false
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-transparent border-red-500"
                  }`}
              >
                {brahmacharya?.isCleanToday !== false && (
                  <span className="material-symbols-outlined text-[14px] text-white">check</span>
                )}
              </span>
              <div className="flex-1">
                <span className={`text-sm font-semibold ${brahmacharya?.isCleanToday !== false ? "text-emerald-400" : "text-red-400"}`}>
                  {brahmacharya?.isCleanToday !== false ? "Clean Today ✓" : "Relapsed Today"}
                </span>
                <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                  {brahmacharya?.isCleanToday !== false ? "Ojas preserved. Tap to toggle status." : "Tap to mark clean."}
                </p>
              </div>
            </label>

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
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">shield</span>
              Day {brahmacharya?.cleanStreak ?? 0} Clean State
            </span>
            <span className="text-on-surface-variant text-[11px]">Transmuted</span>
          </div>
        </section>

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

          return (
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors group h-full">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
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
                      <h2 className="text-sm font-semibold tracking-tight text-on-surface hover:text-cyan-300 transition-colors truncate">
                        Book Reading
                      </h2>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block truncate ${
                        isBookCompleted ? "text-emerald-400" : "text-cyan-400"
                      }`}>
                        {isBookCompleted ? "Book Completed • 100%" : "Reading Protocol"}
                      </span>
                    </div>
                  </div>

                  {/* Header Actions - Consistent, clean, no delete button, no wrapping */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {reading && (
                      <button
                        onClick={() => openEditModal("reading", reading.id, reading)}
                        className="p-1 text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Edit reading log"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                      isBookCompleted
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                        : bookPagesRead > 0
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                          : "bg-surface-container text-on-surface-variant border-outline-variant/60"
                    }`}>
                      {isBookCompleted ? "Finished" : bookPagesRead > 0 ? "Logged" : "Active"}
                    </span>
                    <button
                      onClick={() => openBookModal(isBookCompleted ? "add_book" : "log_session")}
                      className="p-1 text-on-surface-variant hover:text-cyan-300 hover:bg-surface-container rounded transition-colors cursor-pointer"
                      title={isBookCompleted ? "Add New Book" : "Log Reading"}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                {bookReadingsToday.length > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/50 flex gap-3.5">
                      {/* Book Cover Image Outside on Dashboard */}
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
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  isBookCompleted
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                    : "bg-gradient-to-r from-cyan-500 to-teal-400"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(3, isBookCompleted ? 100 : progressPct))}%` }}
                              />
                            </div>
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
                            <button
                              onClick={() => openBookModal("add_book")}
                              className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/30 flex items-center gap-1 cursor-pointer"
                            >
                              + Start Next Book
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {reading?.insightQuote && (
                      <p className="text-on-surface-variant text-[11px] italic line-clamp-2 pl-2 border-l border-amber-400">
                        &ldquo;{reading.insightQuote}&rdquo;
                      </p>
                    )}
                  </div>
                ) : activeDisplayBook ? (
                  /* Active Book Exists, but no pages logged yet today */
                  <div className="space-y-3">
                    <div className="bg-surface-container p-3.5 rounded-lg border border-outline-variant/50 flex gap-3.5">
                      {/* Active Book Cover */}
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
                              <span className="text-[10px] font-mono text-emerald-400/80">
                                100% Done
                              </span>
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

                        {/* Overall Book Progress Bar */}
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
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  isBookCompleted
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                    : "bg-gradient-to-r from-cyan-500 to-teal-400"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(3, isBookCompleted ? 100 : progressPct))}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          {isBookCompleted ? (
                            <button
                              onClick={() => openBookModal("add_book")}
                              className="px-2.5 py-1 rounded text-xs font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">add</span>
                              <span>+ Start Next Book</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openBookModal("log_session")}
                              className="px-2.5 py-1 rounded text-xs font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                              <span>Log Today's Pages</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No books logged at all yet */
                  <div
                    onClick={() => openBookModal("add_book")}
                    className="flex flex-col items-center justify-center py-8 text-center gap-2 cursor-pointer hover:bg-surface-container/40 rounded-lg transition-colors border border-dashed border-outline-variant/50 p-4"
                  >
                    <span className="material-symbols-outlined text-[32px] text-cyan-400/40">auto_stories</span>
                    <p className="text-xs text-on-surface-variant font-mono">No books in reading vault yet</p>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded text-xs font-mono bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                      <span>Start Reading a Book</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
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
                <Link
                  href="/books"
                  className="text-on-surface-variant hover:text-cyan-400 text-[11px] flex items-center gap-1 transition-colors group/link"
                  title="Open Reading Vault"
                >
                  <span>Vault: {books.length} {books.length === 1 ? "Book" : "Books"}</span>
                  <span className="material-symbols-outlined text-[13px] group-hover/link:translate-x-0.5 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </section>
          );
        })()}

        {/* CARD 5: DEEP WORK & SKILL ARCHITECTURE */}
        <section className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all group h-full ${
          activeTimer?.isRunning
            ? "bg-gradient-to-b from-amber-950/20 via-surface-container-low to-surface-container-low border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
            : "bg-surface-container-low border-outline-variant/70 hover:border-amber-500/40"
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
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
                    <h2 className="text-sm font-semibold tracking-tight text-on-surface">
                      Deep Work
                    </h2>
                    {activeTimer?.isRunning && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                    High Leverage Engineering
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!activeTimer?.isRunning && deepWork && (
                  <>
                    <button
                      onClick={() => deleteDeepWork(deepWork.id || "latest")}
                      className="p-1 text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete focus block"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                    <button
                      onClick={() => openEditModal("deepwork", deepWork.id, deepWork)}
                      className="p-1 text-on-surface-variant hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit focus block"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </>
                )}

                {!activeTimer?.isRunning && (
                  <>
                    <button
                      onClick={() => setIsTimerModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition-all cursor-pointer"
                      type="button"
                      title="Start Live Focus Timer"
                    >
                      <span className="material-symbols-outlined text-[15px]">timer</span>
                      <span>Timer</span>
                    </button>
                    <button
                      onClick={() => openModal("deepwork")}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-mono transition-all cursor-pointer"
                      type="button"
                      title="Manual Log Block"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Log</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* LIVE TIMER CONSOLE (ACTIVE WITH LARGE FONT IN THIS SECTION) */}
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
                    <button
                      onClick={resumeDeepWorkTimer}
                      type="button"
                      className="flex-1 py-2 px-3 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseDeepWorkTimer}
                      type="button"
                      className="flex-1 py-2 px-3 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface font-mono text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">pause</span>
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={() => stopAndLogDeepWorkTimer()}
                    type="button"
                    className="flex-2 py-2 px-3 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                    <span>Stop &amp; Log Session ⏎</span>
                  </button>

                  <button
                    onClick={discardDeepWorkTimer}
                    type="button"
                    title="Discard without saving"
                    className="p-2 rounded-md bg-surface-container hover:bg-red-950/40 border border-outline-variant hover:border-red-500/40 text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
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
                  <span className="text-xs text-emerald-400 font-semibold">Target: 3.0h+</span>
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
              </div>
            ) : (
              /* EMPTY STATE WITH 2 CLEAR ACTIONS */
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2.5 rounded-lg border border-dashed border-outline-variant/50 p-4">
                <span className="material-symbols-outlined text-[32px] text-amber-400/40">architecture</span>
                <div>
                  <p className="text-xs text-on-surface font-medium">No deep work logged for this date</p>
                  <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Start a live timer or enter past block</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsTimerModalOpen(true)}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-amber-400 hover:bg-amber-300 text-black font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Start Timer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal("deepwork")}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Manual Log</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <span className={activeTimer?.isRunning ? "text-amber-300 flex items-center gap-1 font-semibold" : deepWork ? "text-amber-400 flex items-center gap-1" : "text-on-surface-variant"}>
              <span className="material-symbols-outlined text-[15px]">
                {activeTimer?.isRunning ? "hourglass_top" : deepWork ? "check_circle" : "radio_button_unchecked"}
              </span>
              {activeTimer?.isRunning ? "Focus Block In Progress" : deepWork ? "Focus Session Verified" : "Focus Block Pending"}
            </span>
            <span className="text-on-surface-variant text-[11px]">3.0h Minimum</span>
          </div>
        </section>

        {/* CARD 6: FINANCIAL VELOCITY (MONTHLY BUDGET — RESETS EVERY 1ST) */}
        <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors group h-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-on-surface">
                    Financial Velocity
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Monthly Budget (Resets 1st)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-[11px] font-mono text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{finance?.cycleLabel || "Monthly Cycle"}</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
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
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden border border-outline-variant/30">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (finance?.monthlyRemainingInr ?? 2000) < 0
                        ? "bg-rose-500"
                        : (finance?.monthlyPacingPct ?? 0) > 85
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, finance?.monthlyPacingPct ?? 0)}%` }}
                  />
                </div>
              </div>

              {/* Single-Line Action Buttons: Info (Last 10), Add, Spend */}
              <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowRecentLedgerModal(true)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  title="View last 10 entries"
                >
                  <span className="material-symbols-outlined text-[15px]">info</span>
                  <span className="truncate">Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal("add_money")}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  title="Add money / top-up monthly pool"
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  <span className="truncate">Add</span>
                </button>

                <button
                  type="button"
                  onClick={() => openModal("expense")}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant hover:border-rose-500/40 text-on-surface hover:text-rose-300 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  title="Log spend / expense"
                >
                  <span className="material-symbols-outlined text-[15px]">remove</span>
                  <span className="truncate">Spend</span>
                </button>
              </div>

              {/* Recent Ledger Items in this Monthly Cycle */}
              <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                  <span>Monthly Ledger</span>
                  <span>{finance?.transactionsCycle?.length ?? 0} Items</span>
                </div>

                {finance?.transactionsCycle && finance.transactionsCycle.length > 0 ? (
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
                        <button
                          onClick={() => deleteExpense(tx.id)}
                          className="opacity-0 group-hover/tx:opacity-100 text-on-surface-variant hover:text-red-400 transition-opacity cursor-pointer"
                          title="Delete entry"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-[11px] text-on-surface-variant">
                    No transactions logged in this monthly cycle
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer: Renew info */}
          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
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
            <span className="text-on-surface-variant text-[11px]">
              Allowance: ₹{(finance?.monthlyBudgetInr ?? 2000).toLocaleString()}
              {(finance?.monthlyAddedInr ?? 0) > 0 ? ` (+₹${finance?.monthlyAddedInr} added)` : ""}
            </span>
          </div>
        </section>
      </div>

      {/* FULL-WIDTH BOTTOM MODULE: Rate Your Discipline (0-10 Interactive Selector) */}
      <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">tune</span>
            <h2 className="text-sm font-semibold tracking-tight text-on-surface">
              Rate Today&apos;s Discipline Cadence
            </h2>
          </div>
          <div className="font-mono text-xs text-on-surface-variant flex items-center gap-2">
            <span>Current Sealed Score:</span>
            <span className="text-cyan-400 font-bold">
              {disciplineScore !== null && disciplineScore !== undefined
                ? `${disciplineScore} / 10 (${getDisciplineTier(disciplineScore)})`
                : "Not rated yet"}
            </span>
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
              <button
                key={num}
                type="button"
                onClick={() => setDisciplineScore(num)}
                className={`py-2.5 rounded-lg font-mono text-xs font-semibold transition-all ${isSelected
                  ? "bg-cyan-400 text-[#002730] shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40"
                  }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-3 text-[11px] font-mono text-on-surface-variant">
          <span>0: Zero Cadence</span>
          <span>5: Divided Focus</span>
          <span className="text-cyan-400 font-medium">9: Sovereign Execution</span>
          <span>10: Absolute Mastery</span>
        </div>
      </section>

      {/* Bottom Stoic Grounding Quotation */}
      <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-cyan-400 shrink-0" />
          <blockquote className="text-xs text-on-surface italic">
            &ldquo;You have power over your mind - not outside events. Realize this, and you will find strength.&rdquo;
          </blockquote>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-on-surface-variant">
          <span>— Marcus Aurelius, Meditations IV</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-surface-container text-emerald-400 border border-outline-variant">
            Protocol Sealed
          </span>
        </div>
      </section>

      {/* Last 10 Entries Modal */}
      {showRecentLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-low border border-outline-variant/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface tracking-tight">
                    Last 10 Ledger Entries
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono">
                    Recent transactions across monthly allocation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecentLedgerModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Transaction List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 scrollbar-thin scrollbar-thumb-outline-variant/40 font-mono text-xs">
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
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high border border-outline-variant/60 text-on-surface-variant uppercase">
                              {tx.category || "general"}
                            </span>
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
                        <button
                          type="button"
                          onClick={() => deleteExpense(tx.id)}
                          className="opacity-0 group-hover/row:opacity-100 p-1 text-on-surface-variant hover:text-red-400 transition-opacity cursor-pointer"
                          title="Delete entry"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-outline-variant/60 bg-surface-container-lowest/60 flex items-center justify-between text-xs font-mono">
              <Link
                href="/finance"
                onClick={() => setShowRecentLedgerModal(false)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Finance Ledger</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowRecentLedgerModal(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* START DEEP WORK TIMER POPUP MODAL (LARGE READABLE FONTS) */}
      {/* ========================================================================= */}
      {isTimerModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsTimerModalOpen(false)}
        >
          <div 
            className="bg-surface-container-low border-2 border-amber-500/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-outline-variant/60 bg-gradient-to-r from-amber-950/40 via-surface-container to-amber-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                  <span className="material-symbols-outlined text-[26px]">timer</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">
                    Start Deep Work Timer
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    Auto-logs to your daily Deep Work ledger when stopped
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-on-surface block mb-2">
                  What will you focus on?
                </label>
                <input
                  type="text"
                  value={timerTopicInput}
                  onChange={(e) => setTimerTopicInput(e.target.value)}
                  placeholder="e.g. Distributed Systems & Go Concurrency"
                  className="w-full bg-surface-container border-2 border-outline-variant focus:border-amber-400 rounded-xl px-4 py-3.5 text-base text-on-surface font-sans placeholder:text-on-surface-variant/40 focus:outline-none transition-all shadow-inner"
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
                <label className="text-xs font-mono uppercase tracking-wider text-on-surface-variant font-semibold block mb-2">
                  Quick Focus Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Engineering Income Work",
                    "Core Architecture & Systems",
                    "Deep Debugging & Fixes",
                    "Product Feature Development",
                    "Technical Reading & Research",
                    "Algorithm & LeetCode Practice",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTimerTopicInput(preset)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        timerTopicInput === preset
                          ? "bg-amber-400 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                          : "bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/70 text-on-surface hover:border-amber-400/50"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0 mt-0.5">info</span>
                <span>
                  The timer runs continuously in the background across pages. When you click <strong>Stop &amp; Log</strong>, it automatically calculates session duration, records start &amp; end times, and saves to your deep work metrics.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-outline-variant/60 bg-surface-container-lowest/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  startDeepWorkTimer(timerTopicInput.trim() || "Deep Work Session");
                  setIsTimerModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Start Focus Stopwatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
