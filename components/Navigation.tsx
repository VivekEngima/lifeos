"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLifeOS } from "@/context/LifeOSContext";
import { getLocalTodayStr, formatDayFullWithOrdinal, parseDateString } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Receipt,
  Terminal,
  Activity,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "War Room", href: "/manifesto" },
    { label: "Planner & Goals", href: "/planner" },
    { label: "Timeline", href: "/timeline" },
    { label: "Daily Log", href: "/daily-log" },
    { label: "Reading Vault", href: "/books" },
    { label: "Streaks & Heatmap", href: "/streaks-heatmap" },
    { label: "Finance & Sovereignty", href: "/finance" },
    { label: "Journal & Creation", href: "/journal" },
    { label: "Cadence Reviews", href: "/reviews" },
  ];

  const todayStr = getLocalTodayStr();
  const isToday = selectedDate === todayStr;

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
    setIsCalendarOpen(false);
  };

  const selectedDateObj = selectedDate ? parseDateString(selectedDate) : new Date();

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
                <Badge variant="default" className="text-[11px] font-mono px-1.5 py-0.2">
                  v2.5
                </Badge>
              </div>
              <span className="text-xs text-on-surface-variant hidden md:inline ml-2 pl-3 border-l border-outline-variant/60 font-mono tracking-tight">
                Core Protocol &amp; Personal Ledger
              </span>
            </Link>

            {/* shadcn Date Navigator with Popover Calendar */}
            <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/60 rounded-lg p-0.5 text-xs font-mono shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousDay}
                title="Previous Day"
                className="h-7 w-7 text-on-surface-variant hover:text-cyan-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 font-mono text-xs font-semibold text-on-surface hover:text-cyan-300 hover:bg-surface-container-high gap-1.5"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="whitespace-nowrap">{formatDayFullWithOrdinal(selectedDate)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-outline-variant/70 shadow-2xl bg-[#13141a]" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleSelectDate}
                  />
                  <div className="p-2 border-t border-outline-variant/40 flex justify-between items-center bg-surface-container-lowest text-xs font-mono">
                    <span className="text-on-surface-variant text-[11px] truncate max-w-[180px]">
                      Selected: {formatDayFullWithOrdinal(selectedDate)}
                    </span>
                    <Button
                      variant="link"
                      size="xs"
                      onClick={() => {
                        goToToday();
                        setIsCalendarOpen(false);
                      }}
                      className="text-cyan-400 text-[11px] p-0 h-auto"
                    >
                      Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextDay}
                title="Next Day"
                className="h-7 w-7 text-on-surface-variant hover:text-cyan-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {isToday ? (
                <Badge variant="default" className="ml-1 h-6 px-2 text-[10px] gap-1 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Today
                </Badge>
              ) : (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={goToToday}
                  title="Return to today's date"
                  className="ml-1 text-[10px] font-mono h-6 px-2 gap-1 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Go to Today</span>
                </Button>
              )}
            </div>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2.5">
            {activeTimer?.isRunning && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="font-bold tracking-wider font-mono">
                  {String(Math.floor(activeTimer.elapsedSeconds / 3600)).padStart(2, "0")}:
                  {String(Math.floor((activeTimer.elapsedSeconds % 3600) / 60)).padStart(2, "0")}:
                  {String(activeTimer.elapsedSeconds % 60).padStart(2, "0")}
                </span>
                <span className="text-on-surface-variant max-w-[110px] truncate hidden lg:inline">
                  {activeTimer.topic}
                </span>
                <Button
                  variant="amber"
                  size="xs"
                  onClick={() => stopAndLogDeepWorkTimer()}
                  className="h-6 px-2 text-slate-950 font-bold bg-amber-400 hover:bg-amber-300"
                  title="Stop and automatically log deep work session"
                >
                  Stop &amp; Log
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("expense")}
              id="quickExpenseBtn"
              className="gap-1.5 border-outline-variant hover:border-emerald-500/40"
            >
              <Receipt className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Log Expense</span>
            </Button>

            {/* shadcn Dropdown Menu for DB Status / Settings Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 text-cyan-400 border border-outline-variant hover:border-cyan-500/50"
                  aria-label="Database Status and Settings"
                  title="Database Status and Settings"
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <DropdownMenuLabel className="font-mono text-xs">
                  <div className="text-on-surface font-semibold">Supabase Connection</div>
                  <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1.5 mt-1 font-normal">
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
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openModal("db_settings")}>
                  <Activity className="h-3.5 w-3.5 mr-2 text-cyan-400" />
                  <span>Inspect DB Config</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openModal("daily_2min")}>
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-400" />
                  <span>Quick Check-in (⌘L)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2.5 py-1 text-[10px] font-mono text-on-surface-variant">
                  Execution Over Intention.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Linear / Vercel Style Navigation Tabs */}
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
