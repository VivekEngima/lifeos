"use client";

import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { formatLocalDateString } from "@/lib/date-utils";
import { ButtonSpinner } from "@/components/ButtonSpinner";

export default function DailyLogPage() {
  const {
    state,
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    toggleHabit,
    deleteHabit,
    openModal,
    openBookModal,
    openEditModal,
    lockLedger,
    logJournal,
    refreshState,
    notify,
    deleteWorkout,
    deleteDeepWork,
    deleteReading,
    deleteExpense,
    deleteSleep,
    deleteFinanceByDate,
    activeTimer,
    startDeepWorkTimer,
    stopAndLogDeepWorkTimer,
  } = useLifeOS();

  const [confirmDeleteFinanceDate, setConfirmDeleteFinanceDate] = useState(false);
  const [isClearingFinance, setIsClearingFinance] = useState(false);
  const [isSavingEvening, setIsSavingEvening] = useState(false);

  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [addingHabit, setAddingHabit] = useState(false);
  const [eveningNotes, setEveningNotes] = useState(state?.journal?.eveningReflection || "");
  const [waterAmount, setWaterAmount] = useState(2.5);

  const habits = state?.habits ?? [];
  const doneCount = habits.filter((h) => h.isCompleted).length;

  const workout = state?.workoutToday;
  const sleep = state?.sleepToday;
  const sleepLogsToday = state?.sleepLogsToday ?? (sleep ? [sleep] : []);
  const deepWork = state?.deepWorkToday;
  const reading = state?.readingToday;
  const finance = state?.finance;
  const brahmacharya = state?.brahmacharya;

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    const titleToCreate = newHabitTitle.trim();
    try {
      const res = await fetch("/api/habits/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleToCreate }),
      });
      if (res.ok) {
        notify("New Vow Created", `"${titleToCreate}" active in Non-Negotiable Vows`, "success");
      }
      setNewHabitTitle("");
      setAddingHabit(false);
      await refreshState();
    } catch (err) {
      console.error(err);
      notify("Failed to Create Vow", "Could not reach database", "error");
    }
  };

  const handleSaveEveningLog = async () => {
    if (!eveningNotes.trim()) {
      notify("Empty Log", "Please draft your reflection before sealing.", "warning");
      return;
    }
    setIsSavingEvening(true);
    try {
      await logJournal("evening_reflection", eveningNotes.trim());
      notify("Evening Log Sealed", "Reflection timestamped into daily ledger", "success");
    } finally {
      setIsSavingEvening(false);
    }
  };

  const disciplineScore = state?.disciplineRating ?? (state?.dayIntegrityScore ? Number(state.dayIntegrityScore) : 0);
  const pillarsCount = state?.pillarsMet ?? 0;

  const getDisciplineLabel = (score: number) => {
    if (score >= 10) return "Absolute Mastery";
    if (score >= 9) return "Sovereign State";
    if (score >= 7) return "Optimal Focus";
    if (score >= 5) return "Divided Focus";
    if (score > 0) return "Static / Compromised";
    return "Zero Cadence";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Sub-bar & Date Switcher */}
      <section className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-container-low p-4 rounded-xl shadow-md border border-outline-variant/60">
          {/* Date Navigation */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={goToPreviousDay}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Prev Day</span>
            </button>

            <div className="px-4 py-1.5 rounded bg-surface-container-highest text-cyan-400 font-semibold flex items-center gap-2 shadow-sm border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-on-surface font-sans text-sm font-semibold">
                {formatLocalDateString(selectedDate)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-on-surface-variant uppercase tracking-wider">
                Cadence
              </span>
            </div>

            <button
              onClick={goToNextDay}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <span>Next Day</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openModal("daily_2min")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-cyan-500 text-[#002730] font-sans text-xs font-semibold hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-sm"
              id="logNewIntervalBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Log Interval / Entry</span>
            </button>

            <button
              onClick={() => lockLedger()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-sans text-xs font-medium transition-colors shadow-sm border border-outline-variant/60"
              id="lockLedgerBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-400">lock</span>
              <span>{state?.isLocked ? "Ledger Sealed" : "Lock Today's Ledger"}</span>
            </button>
          </div>
        </div>

        {/* Daily High-Level Telemetry Chips (6 chips with real data) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Metric 1: Pillars */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              Pillars Met
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-on-surface">
                {pillarsCount} <span className="text-on-surface-variant text-sm font-normal">/ 5</span>
              </span>
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">task_alt</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.round((pillarsCount / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Deep Work */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              Deep Work
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-cyan-400">
                {deepWork ? (deepWork.durationMinutes / 60).toFixed(1) : "0.0"}
                <span className="text-on-surface-variant text-xs font-normal">h</span>
              </span>
              <span className="font-mono text-xs text-cyan-400 font-semibold">
                {deepWork ? `${Math.min(100, Math.round((deepWork.durationMinutes / 180) * 100))}%` : "0%"}
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${deepWork ? Math.min(100, Math.round((deepWork.durationMinutes / 180) * 100)) : 0}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Reading Logs */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              Reading Logs
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-on-surface">
                {reading ? reading.pagesRead : 0} <span className="text-on-surface-variant text-xs font-normal">pg</span>
              </span>
              <span className="material-symbols-outlined text-amber-400 text-[20px]">menu_book</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${reading ? Math.min(100, Math.round((reading.pagesRead / 30) * 100)) : 0}%` }}
              />
            </div>
          </div>

          {/* Metric 4: Workout */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              Workout
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-on-surface">
                {workout ? workout.durationMinutes : 0}
                <span className="text-on-surface-variant text-xs font-normal">m</span>
              </span>
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">fitness_center</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${workout ? Math.min(100, Math.round((workout.durationMinutes / 60) * 100)) : 0}%` }}
              />
            </div>
          </div>

          {/* Metric 5: NoFap / Vitality */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              NoFap / Vitality
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-amber-400">
                D-{brahmacharya?.cleanStreak ?? 0}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${brahmacharya?.isCleanToday !== false
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                {brahmacharya?.isCleanToday !== false ? "INTACT" : "RELAPSE"}
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((brahmacharya?.cleanStreak ?? 0) / 90) * 100))}%` }}
              />
            </div>
          </div>

          {/* Metric 6: Monthly Budget */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm border border-outline-variant/50">
            <span className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
              Monthly Budget ({finance?.cycleLabel ?? "1st–End of Month"})
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-bold text-on-surface">
                ₹{finance?.monthlySpentInr ?? 0}
              </span>
              <span className={`font-mono text-xs font-medium ${(finance?.monthlyRemainingInr ?? 2000) < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                Rem ₹{finance?.monthlyRemainingInr ?? 2000}
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden border border-outline-variant/30">
              <div
                className={`h-full rounded-full transition-all ${(finance?.monthlyRemainingInr ?? 2000) < 0 ? "bg-rose-500" : "bg-emerald-400"}`}
                style={{ width: `${Math.min(100, finance?.monthlyPacingPct ?? 0)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Split Execution Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Chronological Daily Ledger Timeline (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">timelapse</span>
              <h2 className="text-base font-semibold tracking-tight text-on-surface">
                Chronological Ledger
              </h2>
            </div>
            <span className="font-mono text-xs text-on-surface-variant">
              {(workout ? 1 : 0) + (reading ? 1 : 0) + (deepWork ? 1 : 0) + (finance?.transactionsToday?.length ? 1 : 0) + (brahmacharya ? 1 : 0)} LOGGED INTERVALS
            </span>
          </div>

          {/* Stream Container with Visual Track */}
          <div className="relative flex flex-col gap-4 pl-4">
            <div className="absolute top-3 bottom-6 left-[18px] w-0.5 bg-surface-container-highest" />

            {/* Sleep Protocol */}
            <div className="relative flex items-start gap-4 group">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${sleep ? "bg-cyan-500 text-[#002730]" : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                }`}>
                <span className="material-symbols-outlined text-[16px]">bedtime</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                {sleepLogsToday.length > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-400 font-semibold">
                          Sleep &amp; Recovery Protocol
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-medium">
                          {Math.floor((sleep?.totalDayMinutes ?? sleep?.durationMinutes ?? 0) / 60)}h {(sleep?.totalDayMinutes ?? sleep?.durationMinutes ?? 0) % 60}m
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-emerald-400 font-mono">
                          {sleep?.avgQuality ?? sleep?.quality ?? 0}/100 Quality
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {sleepLogsToday.length} Log{sleepLogsToday.length > 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => openModal("sleep")}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-[11px] border border-cyan-500/30 transition-colors flex items-center gap-1"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      {sleepLogsToday.map((entry, idx) => (
                        <div key={entry.id || idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-surface-container-low p-2 rounded border border-outline-variant/30 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface">
                              {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">({entry.quality}% Quality)</span>
                            <span className="text-[10px] text-on-surface-variant truncate">
                              {entry.startDate ? formatLocalDateString(entry.startDate) : formatLocalDateString(selectedDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal("sleep", entry.id, entry)}
                              className="p-1 text-on-surface-variant hover:text-cyan-400 transition-colors"
                              title="Edit sleep details"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              onClick={() => deleteSleep(entry.id || "latest")}
                              className="p-1 text-on-surface-variant hover:text-red-400 transition-colors"
                              title="Delete sleep log"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Sleep &amp; Recovery</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">No sleep duration logged for this date.</p>
                    </div>
                    <button
                      onClick={() => openModal("sleep")}
                      className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs border border-cyan-500/30 transition-colors flex items-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Log Sleep</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Morning Workout Protocol */}
            <div className="relative flex items-start gap-4 group">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${workout ? "bg-emerald-400 text-[#002b1f]" : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                }`}>
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                {workout ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-semibold">
                          Morning Protocol
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-mono">
                          {workout.quality || "Zone 3/4 Physical"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Completed
                        </span>
                        <button
                          onClick={() => openEditModal("workout", workout.id, workout)}
                          className="p-1 text-on-surface-variant hover:text-emerald-400 transition-colors"
                          title="Edit workout details"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {workout.id && (
                          <button
                            onClick={() => deleteWorkout(workout.id!)}
                            className="p-1 text-on-surface-variant hover:text-red-400 transition-colors"
                            title="Delete workout"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-on-surface">
                      Sadhana
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {workout.description || "Completed daily sadhana protocol."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 bg-surface-container-low px-3 py-1.5 rounded-lg font-mono text-xs border border-outline-variant/40">
                      <div className="flex items-center gap-1 text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span>
                        <span>Surya Kriya: <strong className="text-amber-300">{workout.suryaKriyaCycles || workout.cycles || "—"} cycles</strong></span>
                      </div>
                      {workout.asanaHoldingCount ? (
                        <div className="flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-emerald-400">self_improvement</span>
                          <span>Asana Hold: <strong className="text-emerald-300">{workout.asanaHoldingCount}s hold</strong></span>
                        </div>
                      ) : null}
                      {workout.practices && (typeof workout.practices === 'string' ? workout.practices : '').includes('preparatory_asanas') ? (
                        <div className="flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-rose-400">exercise</span>
                          <span>Preparatory: <strong className="text-rose-300">3 warm-ups</strong></span>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Sadhana</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">No sadhana protocol logged for this date.</p>
                    </div>
                    <button
                      onClick={() => openModal("sadhana")}
                      className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Log Sadhana</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reading Protocol */}
            <div className="relative flex items-start gap-4 group">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${reading ? "bg-amber-400 text-[#3d2400]" : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                }`}>
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                {reading ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-semibold">
                          Reading Protocol
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
                          {reading.durationMinutes || 45} min
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-mono">
                          pp. {reading.startPage}-{reading.endPage} ({reading.pagesRead}p)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Logged
                        </span>
                        <button
                          onClick={() => openEditModal("reading", reading.id, reading)}
                          className="p-1 text-on-surface-variant hover:text-amber-400 transition-colors"
                          title="Edit reading session"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {reading.imageUrl && (
                        <img
                          src={reading.imageUrl}
                          alt=""
                          className="w-10 h-14 object-cover rounded border border-white/10 shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-on-surface">
                          Reading: {reading.bookTitle || "Philosophical Text"}
                        </h3>
                        {reading.author && (
                          <p className="text-xs text-on-surface-variant mt-0.5">{reading.author}</p>
                        )}
                      </div>
                    </div>
                    {reading.insightQuote && (
                      <div className="mt-3 p-3 rounded-lg bg-surface-container-lowest text-on-surface font-sans italic relative border-l-2 border-amber-400">
                        <span className="text-on-surface-variant text-xs">
                          &ldquo;{reading.insightQuote}&rdquo;
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Reading Logs (Scriptural Study)</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">No reading session logged for this date.</p>
                    </div>
                    <button
                      onClick={() => openBookModal("log_session")}
                      className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-xs border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Log Reading</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Deep Work Protocol */}
            <div className="relative flex items-start gap-4 group">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${deepWork ? "bg-cyan-500 text-[#002730]" : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                }`}>
                <span className="material-symbols-outlined text-[16px]">code</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                {activeTimer?.isRunning ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          Focus Timer Running
                        </span>
                        <span className="text-sm font-mono font-bold text-amber-200">
                          {String(Math.floor(activeTimer.elapsedSeconds / 3600)).padStart(2, "0")}:
                          {String(Math.floor((activeTimer.elapsedSeconds % 3600) / 60)).padStart(2, "0")}:
                          {String(activeTimer.elapsedSeconds % 60).padStart(2, "0")}
                        </span>
                      </div>
                      <button
                        onClick={() => stopAndLogDeepWorkTimer()}
                        className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">stop_circle</span>
                        <span>Stop &amp; Log Session</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded bg-surface-container-low border border-amber-500/20 text-xs text-on-surface">
                      <span className="text-on-surface-variant font-mono text-[10px] uppercase block mb-0.5">Active Target</span>
                      {activeTimer.topic}
                    </div>
                  </div>
                ) : deepWork ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-400 font-semibold">
                          Deep Work Session
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-medium">
                          {(deepWork.durationMinutes / 60).toFixed(1)} hrs
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-cyan-400 font-mono">
                          {deepWork.quality || "Session Verified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startDeepWorkTimer("Engineering Income Work")}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          type="button"
                          title="Start live timer"
                        >
                          <span className="material-symbols-outlined text-[14px]">timer</span>
                          <span>Start Timer</span>
                        </button>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Verified
                        </span>
                        <button
                          onClick={() => openEditModal("deepwork", deepWork.id, deepWork)}
                          className="p-1 text-on-surface-variant hover:text-cyan-400 transition-colors"
                          title="Edit focus block"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {deepWork.id && (
                          <button
                            onClick={() => deleteDeepWork(deepWork.id!)}
                            className="p-1 text-on-surface-variant hover:text-red-400 transition-colors"
                            title="Delete focus block"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-on-surface">
                      {deepWork.topic}
                    </h3>
                    {deepWork.description && (
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {deepWork.description}
                      </p>
                    )}
                    {deepWork.keyInsight && (
                      <div className="mt-3 p-2.5 rounded-lg bg-surface-container-lowest text-xs text-cyan-300 font-mono border border-outline-variant/40">
                        <span className="text-on-surface-variant font-sans">Insight: </span>
                        {deepWork.keyInsight}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 py-2">
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Deep Work Block</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">No deep work block logged for this date.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startDeepWorkTimer("Engineering Income Work")}
                        className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>Start Timer</span>
                      </button>
                      <button
                        onClick={() => openModal("deepwork")}
                        className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs border border-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Log Manually</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Velocity */}
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-600 text-on-secondary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[16px]">payments</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 font-semibold">
                      Financial Velocity
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-mono">
                      Monthly Cycle ({finance?.cycleLabel ?? "1st – End of Month"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-on-surface font-semibold">
                      Spent: -₹{finance?.monthlySpentInr ?? 0} / ₹{finance?.totalMonthlyPoolInr ?? finance?.monthlyBudgetInr ?? 2000}
                    </span>
                    <button
                      onClick={() => openModal("add_money")}
                      className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center"
                      title="Add money / inflow"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                    </button>
                    <button
                      onClick={() => openModal("expense")}
                      className="p-1 text-on-surface-variant hover:text-rose-400 transition-colors cursor-pointer flex items-center"
                      title="Log spend / expense"
                    >
                      <span className="material-symbols-outlined text-[15px]">remove</span>
                    </button>
                    {/* Delete by Date Button */}
                    {!confirmDeleteFinanceDate ? (
                      <button
                        onClick={() => setConfirmDeleteFinanceDate(true)}
                        className="p-1 text-on-surface-variant hover:text-red-400 transition-colors cursor-pointer flex items-center"
                        title={`Delete all finance logs for ${selectedDate}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 animate-in fade-in">
                        <span className="text-[10px] text-red-400 font-mono">Clear all?</span>
                        <button
                          disabled={isClearingFinance}
                          onClick={async () => {
                            setIsClearingFinance(true);
                            try {
                              await deleteFinanceByDate(selectedDate);
                              setConfirmDeleteFinanceDate(false);
                            } finally {
                              setIsClearingFinance(false);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold hover:bg-red-500/30 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          {isClearingFinance && <ButtonSpinner className="w-2.5 h-2.5" />}
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteFinanceDate(false)}
                          className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono hover:text-on-surface transition-colors cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  {finance?.transactionsCycle && finance.transactionsCycle.length > 0 ? (
                    finance.transactionsCycle.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/40 group/tx"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${tx.amount < 0 ? "bg-emerald-400" : "bg-cyan-400"}`} />
                          <span className="text-xs text-on-surface font-medium">{tx.title}</span>
                          {tx.date && (
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              ({tx.date.slice(5)})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className={tx.amount < 0 ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                            {tx.amount < 0 ? `-₹${Math.abs(tx.amount)}` : `+₹${tx.amount}`}
                          </span>
                          <button
                            onClick={() => openEditModal("expense", tx.id, tx)}
                            className="opacity-0 group-hover/tx:opacity-100 text-on-surface-variant hover:text-cyan-400 transition-opacity cursor-pointer"
                            title="Edit transaction"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button
                            onClick={() => deleteExpense(tx.id)}
                            className="opacity-0 group-hover/tx:opacity-100 text-on-surface-variant hover:text-red-400 transition-opacity cursor-pointer"
                            title="Delete transaction"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-on-surface-variant font-mono text-xs">
                      No financial transactions logged for this monthly cycle.
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/30">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">event_repeat</span>
                    <span>
                      Resets on 1st (
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
                  <span className={`font-semibold ${(finance?.monthlyRemainingInr ?? 2000) < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    Remaining: ₹{finance?.monthlyRemainingInr ?? 2000}
                  </span>
                </div>
              </div>
            </div>

            {/* Vitality Audit */}
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-8 h-8 rounded-full bg-amber-500 text-[#3d2400] flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[16px]">self_improvement</span>
              </div>
              <div className="flex-1 bg-surface-container p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-semibold">Vitality Audit</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
                      NoFap Vector
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-semibold border ${brahmacharya?.isCleanToday !== false
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                      : "bg-red-950/60 text-red-300 border-red-500/30"
                      }`}>
                      {brahmacharya?.isCleanToday !== false ? "Clean State" : "Relapse Recorded"}
                    </span>
                    <button
                      onClick={() => openEditModal("brahmacharya", undefined, brahmacharya)}
                      className="p-1 text-on-surface-variant hover:text-amber-400 transition-colors"
                      title="Edit vitality state"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-on-surface">
                  Vitality &amp; Pranic Transmutation
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {brahmacharya?.notesToday || "Daily energy conserved. Ojas protected through disciplined mental focus."}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs border border-amber-500/20">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  <span>Day {brahmacharya?.cleanStreak ?? 0} Milestone Clean &amp; Unyielding</span>
                </div>
              </div>
            </div>

            {/* Evening Audit Draft Slot */}
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-8 h-8 rounded-full bg-surface-container-highest text-cyan-400 flex items-center justify-center shrink-0 shadow-md border border-outline-variant">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
              </div>
              <div className="flex-1 bg-surface-container-low p-4 sm:p-5 rounded-xl shadow-md border border-outline-variant/60">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-semibold">
                      Evening Cadence
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
                      Reflection
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-on-surface">
                  Evening Audit &amp; Epilogue Thought Capture
                </h3>
                <div className="mt-3">
                  <textarea
                    rows={3}
                    value={eveningNotes}
                    onChange={(e) => setEveningNotes(e.target.value)}
                    placeholder="Record wins, cognitive friction points, and tomorrow's opening sequence here..."
                    className="w-full bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-cyan-400 border border-outline-variant/50 transition-colors resize-none font-sans"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      Stored in Supabase Journal
                    </span>
                    <button
                      disabled={isSavingEvening}
                      onClick={handleSaveEveningLog}
                      className="px-3.5 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-sans text-xs font-medium transition-colors border border-outline-variant/60 flex items-center gap-1.5 disabled:opacity-50"
                      type="button"
                    >
                      {isSavingEvening && <ButtonSpinner className="w-3 h-3" />}
                      <span>{isSavingEvening ? "Sealing..." : "Seal Evening Log"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Daily Audit, Non-Negotiables & Cadence (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Day Integrity Score Bento */}
          <div className="bg-surface-container p-5 rounded-xl shadow-md border border-outline-variant/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Day Integrity Score
              </span>
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">verified</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-sans text-3xl font-bold text-cyan-400">
                {disciplineScore > 0 ? disciplineScore.toFixed(1) : "—"}
              </span>
              <span className="font-mono text-base text-on-surface-variant">/ 10</span>
              <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase">
                {getDisciplineLabel(disciplineScore)}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Execution level calculated across workout, deep work, reading, vitality, and non-negotiable vows in Supabase.
            </p>
            <div className="mt-4 pt-2 border-t border-outline-variant/30">
              <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant mb-1">
                <span>Pillars Fulfilled Today</span>
                <span>{pillarsCount} of 5</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((pillarsCount / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Non-Negotiable Vows Checklist */}
          <div className="bg-surface-container p-5 rounded-xl shadow-md border border-outline-variant/60">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">
                  checklist
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  Non-Negotiable Vows
                </h3>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold" id="vowProgressText">
                {doneCount} / {habits.length} DONE
              </span>
            </div>

            <div className="space-y-2" id="vowsList">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={h.isCompleted}
                      onChange={() => {
                        toggleHabit(h.id, !h.isCompleted);
                      }}
                      className="w-4 h-4 rounded text-emerald-500 bg-surface-container-lowest focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-medium font-sans ${h.isCompleted ? "line-through text-on-surface-variant" : "text-on-surface"
                        }`}
                    >
                      {h.title}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-emerald-400">
                      {h.streak > 0 ? `${h.streak}d streak` : h.description || "Active"}
                    </span>
                    <button
                      onClick={() => deleteHabit(h.id)}
                      className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-red-400 transition-opacity p-0.5"
                      title="Delete vow"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Vow Form */}
            <div className="mt-3 pt-3 border-t border-outline-variant/40">
              {addingHabit ? (
                <form onSubmit={handleCreateHabit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="New Vow Title (e.g. Cold Shower 5m)"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded p-1.5 text-xs text-on-surface focus:outline-none focus:border-cyan-400 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded bg-cyan-500 text-[#002730] font-sans text-xs font-semibold hover:bg-cyan-400"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingHabit(false)}
                    className="px-2 py-1 rounded bg-surface-container text-on-surface-variant text-xs"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingHabit(true)}
                  className="w-full py-1.5 border border-dashed border-outline-variant hover:border-cyan-500/50 rounded text-xs font-mono text-on-surface-variant hover:text-cyan-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Define New Vow</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metric Adders */}
          <div className="bg-surface-container p-5 rounded-xl shadow-md border border-outline-variant/60">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">bolt</span>
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  Quick Metric Adders
                </h3>
              </div>
              <span className="text-xs font-mono text-on-surface-variant">Instant Tally</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => openBookModal("log_session")}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group border border-outline-variant/40 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-amber-400 text-[22px] mb-1 group-hover:scale-110 transition-transform">
                  menu_book
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface">+Pages</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Reading</span>
              </button>

              <button
                onClick={() => openModal("deepwork")}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group border border-outline-variant/40"
                type="button"
              >
                <span className="material-symbols-outlined text-cyan-400 text-[22px] mb-1 group-hover:scale-110 transition-transform">
                  timer
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface">+Focus</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Deep Work</span>
              </button>

              <button
                onClick={() => {
                  setWaterAmount((prev) => prev + 0.5);
                  notify("Hydration Logged", `+500ml logged (${(waterAmount + 0.5).toFixed(1)}L total)`, "info");
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group border border-outline-variant/40"
                type="button"
              >
                <span className="material-symbols-outlined text-emerald-400 text-[22px] mb-1 group-hover:scale-110 transition-transform">
                  water_drop
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface">+500ml</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">
                  {waterAmount.toFixed(1)}L Total
                </span>
              </button>
            </div>
          </div>

          {/* Sovereign Discipline Motto Card */}
          <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-3 border border-outline-variant/50">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                Protocol Creed
              </span>
              <span className="text-xs text-on-surface font-medium leading-snug mt-0.5">
                &ldquo;He who conquers himself is the mightiest warrior.&rdquo;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
