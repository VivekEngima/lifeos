"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLifeOS } from "@/context/LifeOSContext";

import { getLocalTodayStr, formatLocalDateString, formatDayFullWithOrdinal } from "@/lib/date-utils";

export default function Navigation() {
  const pathname = usePathname();
  const {
    state,
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    openModal,
    dbStatus,
    activeTimer,
    stopAndLogDeepWorkTimer,
  } = useLifeOS();
  const pune = state?.puneFund ?? null;
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Planner & Goals", href: "/planner" },
    { label: "Daily Log", href: "/daily-log" },
    { label: "Reading Vault", href: "/books" },
    { label: "Streaks & Heatmap", href: "/streaks-heatmap" },
    { label: "Finance & Sovereignty", href: "/finance" },
    { label: "Journal & Creation", href: "/journal" },
    { label: "Cadence Reviews", href: "/reviews" },
  ];

  const todayStr = getLocalTodayStr();
  const isToday = selectedDate === todayStr;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0d12]/90 backdrop-blur-md border-b border-outline-variant/70">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Utility Bar */}
        <div className="flex items-center justify-between h-14 border-b border-outline-variant/40">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.65)] group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-on-surface text-base">
                  LifeOS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-container-high text-cyan-400 border border-cyan-500/20">
                  v2.5
                </span>
              </div>
              <span className="text-xs text-on-surface-variant hidden md:inline ml-2 pl-3 border-l border-outline-variant/60 font-mono tracking-tight">
                Core Protocol &amp; Personal Ledger
              </span>
            </Link>

            {/* Date Navigator */}
            <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/60 rounded-md px-2 py-1 text-xs font-mono">
              <button
                onClick={goToPreviousDay}
                title="Previous Day"
                className="w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors cursor-pointer"
              >
                ◀
              </button>
              
              <div className="relative flex items-center cursor-pointer group/date px-1.5 py-0.5 rounded hover:bg-surface-container-high transition-colors">
                <span className="text-on-surface text-xs font-mono font-semibold flex items-center gap-1.5 select-none group-hover/date:text-cyan-300 transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">calendar_today</span>
                  <span className="whitespace-nowrap">{formatDayFullWithOrdinal(selectedDate)}</span>
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    e.target.value && setSelectedDate(e.target.value)
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Click to select date"
                />
              </div>

              <button
                onClick={goToNextDay}
                title="Next Day"
                className="w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors cursor-pointer"
              >
                ▶
              </button>
              {isToday ? (
                <span className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Today
                </span>
              ) : (
                <button
                  onClick={goToToday}
                  title="Return to today's date"
                  className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-cyan-400 bg-surface-container-high hover:bg-surface-container-highest border border-cyan-500/30 hover:border-cyan-500/60 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    replay
                  </span>
                  <span>Go to Today</span>
                </button>
              )}
            </div>
          </div>

          {/* Cadence Status & Horizon Telemetry in Navbar Empty Space */}
          {/* <div className="hidden md:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-on-surface-variant">Cadence:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                {state?.isLocked ? "Locked" : "Active"}
              </span>
            </div>

            {pune && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.7)]" />
                <span className="text-cyan-400 font-bold font-mono">{pune.daysLeft} Days to Pune</span>
              </div>
            )}
          </div> */}

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2.5">
            {activeTimer?.isRunning && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="font-bold tracking-wider font-mono">
                  {String(
                    Math.floor(activeTimer.elapsedSeconds / 3600),
                  ).padStart(2, "0")}
                  :
                  {String(
                    Math.floor((activeTimer.elapsedSeconds % 3600) / 60),
                  ).padStart(2, "0")}
                  :{String(activeTimer.elapsedSeconds % 60).padStart(2, "0")}
                </span>
                <span className="text-on-surface-variant max-w-[110px] truncate hidden lg:inline">
                  {activeTimer.topic}
                </span>
                <button
                  onClick={() => stopAndLogDeepWorkTimer()}
                  className="px-2 py-0.5 rounded bg-amber-400 text-black font-semibold text-[11px] hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
                  title="Stop and automatically log deep work session"
                  type="button"
                >
                  Stop &amp; Log
                </button>
              </div>
            )}

            <button
              onClick={() => openModal("expense")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-medium transition-colors"
              id="quickExpenseBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-400">
                payments
              </span>
              <span className="hidden sm:inline">Log Expense</span>
            </button>

            {/* DB Status / Settings Trigger */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-md bg-surface-container-high border border-outline-variant flex items-center justify-center text-cyan-400 hover:border-cyan-500/50 transition-colors ml-0.5"
                type="button"
                aria-label="Database Status and Settings"
                title="Database Status and Settings"
              >
                <span className="material-symbols-outlined text-[18px]">
                  terminal
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-surface-container-high border border-outline-variant shadow-2xl py-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-outline-variant/60">
                    <p className="font-medium text-on-surface">
                      Supabase Connection
                    </p>
                    <p className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dbStatus === null
                            ? "bg-amber-400 animate-pulse"
                            : dbStatus.connected
                            ? "bg-emerald-400"
                            : "bg-rose-500"
                        }`}
                      />
                      {dbStatus === null
                        ? "Connecting..."
                        : dbStatus.connected
                        ? "PostgreSQL Active"
                        : "Disconnected"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openModal("db_settings");
                    }}
                    className="w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Inspect DB Config
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openModal("daily_2min");
                    }}
                    className="w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Quick Check-in (⌘L)
                  </button>
                  <div className="border-t border-outline-variant/60 my-1" />
                  <div className="px-3 py-1.5 text-[10px] font-mono text-on-surface-variant">
                    Execution Over Intention.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linear / Vercel Style Navigation Tabs with Underline Active Indicator */}
        <nav className="flex items-center gap-8 h-11 overflow-x-auto scrollbar-none text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center h-full transition-colors px-0.5 tracking-wide whitespace-nowrap ${
                  isActive
                    ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                    : "text-on-surface-variant hover:text-on-surface border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
