"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLifeOS } from "@/context/LifeOSContext";
import { formatDayFullWithOrdinal } from "@/lib/date-utils";

interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  imageUrl: string | null;
  totalPages: number | null;
  sessionDate: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  durationMinutes: number;
  insightQuote: string;
  vaultPath?: string;
  createdAt: string | null;
  updatedAt?: string | null;
}

export default function ReadingVaultPage() {
  const {
    state,
    selectedDate,
    openBookModal,
    openEditModal,
    updateBook,
    refreshState,
  } = useLifeOS();

  const [allReadings, setAllReadings] = useState<ReadingSession[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "quotes" | "library">("overview");

  // Fetch all reading history across all dates from API
  const fetchReadings = useCallback(async () => {
    try {
      setLoadingReadings(true);
      const res = await fetch("/api/reading");
      if (res.ok) {
        const data = await res.json();
        setAllReadings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load readings history:", err);
    } finally {
      setLoadingReadings(false);
    }
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings, state?.books, state?.readingToday]);

  const books = state?.books || [];
  const currentlyReading = books.filter((b) => !b.isCompleted && (b.status || "reading") === "reading");
  const completedBooks = books.filter((b) => b.isCompleted || b.status === "completed");

  // All-time Metrics calculation
  const totalPagesRead = useMemo(() => {
    return allReadings.reduce((sum, r) => sum + (r.pagesRead || 0), 0);
  }, [allReadings]);

  const totalSessionsCount = allReadings.length;

  // Reading streak calculation based on unique session dates
  const readingStreak = useMemo(() => {
    if (allReadings.length === 0) return 0;
    const uniqueDates = Array.from(new Set(allReadings.map((r) => r.sessionDate))).sort().reverse();
    const today = new Date().toISOString().split("T")[0];

    let streak = 0;
    let checkDate = new Date();
    // Allow today or yesterday as start of streak
    const firstLog = uniqueDates[0];
    if (firstLog !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      if (firstLog !== yStr) return 0;
      checkDate = yesterday;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const curStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(curStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allReadings]);

  // Filtered readings list
  const filteredReadings = useMemo(() => {
    if (selectedBookFilter === "all") return allReadings;
    return allReadings.filter((r) => r.bookId === selectedBookFilter);
  }, [allReadings, selectedBookFilter]);

  // Quotes collection
  const quotesList = useMemo(() => {
    return allReadings
      .filter((r) => r.insightQuote && r.insightQuote.trim().length > 0)
      .map((r) => ({
        id: r.id,
        quote: r.insightQuote,
        bookTitle: r.bookTitle,
        author: r.author,
        date: r.sessionDate,
      }));
  }, [allReadings]);

  const handleMarkCompleted = async (bookId: string) => {
    await updateBook(bookId, { status: "completed" });
    await refreshState();
    await fetchReadings();
  };

  const handleMarkReading = async (bookId: string) => {
    await updateBook(bookId, { status: "reading" });
    await refreshState();
    await fetchReadings();
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDayFullWithOrdinal(dateStr);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Section */}
      <div className="bg-gradient-to-r from-[#0c1017] via-surface-container-low to-[#0f121a] p-6 sm:p-8 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <span className="material-symbols-outlined text-[22px]">auto_stories</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
                  Reading Vault &amp; Library
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                  Reading Protocol
                </span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant font-mono max-w-2xl">
              Personalized reading telemetry, page cadence, and core philosophical retention.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openBookModal("log_session")}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Log Reading Session</span>
            </button>
            <button
              onClick={() => openBookModal("add_book")}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-cyan-300 font-medium text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">library_add</span>
              <span>+ Add Book</span>
            </button>
          </div>
        </div>

        {/* 2. Key Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-outline-variant/40">
          <div className="bg-surface-container/60 border border-outline-variant/50 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              <span>Currently Reading</span>
            </div>
            <div className="text-xl font-bold text-on-surface font-mono">
              {currentlyReading.length}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {currentlyReading.length === 1 ? "1 active title" : `${currentlyReading.length} active titles`}
            </div>
          </div>

          <div className="bg-surface-container/60 border border-emerald-500/30 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
              <span>Books Completed</span>
            </div>
            <div className="text-xl font-bold text-emerald-300 font-mono">
              {completedBooks.length}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
              Finished &amp; Archived
            </div>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant/50 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history_edu</span>
              <span>Total Pages Read</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {totalPagesRead.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Across all sessions
            </div>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant/50 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>Sessions Logged</span>
            </div>
            <div className="text-xl font-bold text-on-surface font-mono">
              {totalSessionsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Reading logs
            </div>
          </div>

          <div className="bg-surface-container/60 border border-amber-500/30 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              <span>Reading Streak</span>
            </div>
            <div className="text-xl font-bold text-amber-300 font-mono">
              {readingStreak} days
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
              Active consistency
            </div>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant/50 p-3.5 rounded-xl">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">format_quote</span>
              <span>Saved Quotes</span>
            </div>
            <div className="text-xl font-bold text-on-surface font-mono">
              {quotesList.length}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Wisdom takeaways
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "overview"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Overview &amp; Showcase</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "history"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Reading Sessions ({allReadings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quotes")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "quotes"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">format_quote</span>
          <span>Wisdom &amp; Quotes ({quotesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "library"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shelves</span>
          <span>Vault Library ({books.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SHOWCASE */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* SECTION A: CURRENTLY READING SHOWCASE */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-on-surface tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span>Currently Reading</span>
              </h2>
              {currentlyReading.length > 0 && (
                <span className="text-xs font-mono text-cyan-400">
                  {currentlyReading.length} in progress
                </span>
              )}
            </div>

            {currentlyReading.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/60 text-center">
                <span className="material-symbols-outlined text-[42px] text-cyan-400/40 mb-2">auto_stories</span>
                <h3 className="text-sm font-semibold text-on-surface">No Books Currently In Progress</h3>
                <p className="text-xs text-on-surface-variant font-mono max-w-md mx-auto mt-1 mb-4">
                  {completedBooks.length > 0
                    ? "You've finished your books! Select or add a new book to begin your next reading journey."
                    : "Add your first book to begin tracking your reading sessions and retention."}
                </p>
                <button
                  onClick={() => openBookModal("add_book")}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-all inline-flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Start Reading a New Book</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentlyReading.map((book) => {
                  const totalP = book.totalPages || 0;
                  const curP = book.currentPage || 0;
                  const pct = book.pctCompleted ?? (totalP > 0 ? Math.min(100, Math.round((curP / totalP) * 100)) : 0);
                  const rem = book.pagesRemaining ?? (totalP > 0 ? Math.max(0, totalP - curP) : 0);

                  return (
                    <div
                      key={book.id}
                      className="bg-surface-container-low border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Book Cover Image */}
                        <div
                          onClick={() => openBookModal("log_session")}
                          className="w-24 h-36 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 shrink-0 relative shadow-md flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-zinc-800 to-black text-zinc-400">
                              <span className="material-symbols-outlined text-[28px] text-cyan-400 mb-1">
                                auto_stories
                              </span>
                              <span className="text-[9px] font-mono line-clamp-2 text-zinc-300">
                                {book.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-cyan-950/80 text-[9px] font-mono text-cyan-300 border border-cyan-500/40">
                            Active
                          </div>
                        </div>

                        {/* Book Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
                              In Progress
                            </div>
                            <h3 className="text-base font-bold text-on-surface line-clamp-1 group-hover:text-cyan-300 transition-colors">
                              {book.title}
                            </h3>
                            {book.author && (
                              <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                                by {book.author}
                              </p>
                            )}

                            {/* Overall Progress Bar */}
                            {totalP > 0 && (
                              <div className="mt-3 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-zinc-400">
                                    Page {curP} of {totalP}
                                  </span>
                                  <span className="text-cyan-300 font-bold">{pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                                  />
                                </div>
                                <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                                  <span>{rem} pages left</span>
                                  <span>{book.totalSessions || 0} sessions</span>
                                </div>
                              </div>
                            )}

                            {/* Last Added/Updated Page Log for this book */}
                            {book.lastReadingSession && (
                              <div className="mt-3 p-2.5 rounded-lg bg-surface-container/60 border border-cyan-500/25 text-xs font-mono flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="material-symbols-outlined text-[14px] text-cyan-400 shrink-0">history_edu</span>
                                  <div className="truncate">
                                    <span className="text-zinc-400 text-[11px]">Last log: </span>
                                    <span className="text-white font-medium">pp. {book.lastReadingSession.startPage} → {book.lastReadingSession.endPage}</span>
                                    <span className="text-emerald-400 font-semibold ml-1">+{book.lastReadingSession.pagesRead}p</span>
                                  </div>
                                </div>
                                {book.lastReadingSession.sessionDate && (
                                  <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                                    {book.lastReadingSession.sessionDate}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick Card Actions */}
                          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                            <button
                              onClick={() => openBookModal("log_session")}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">add</span>
                              <span>Log Pages</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleMarkCompleted(book.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                                title="Mark as Completed"
                              >
                                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                <span className="hidden sm:inline">Mark Finished</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: COMPLETED BOOKS HALL OF FAME */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-on-surface tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>Completed Books ({completedBooks.length})</span>
              </h2>
              {completedBooks.length > 0 && (
                <span className="text-xs font-mono text-emerald-400">
                  Hall of Fame &amp; Retention
                </span>
              )}
            </div>

            {completedBooks.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/50 text-center">
                <p className="text-xs text-on-surface-variant font-mono">
                  No completed books yet. As you finish reading your active books, they will be archived here in your Hall of Fame.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-surface-container-low border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl p-4 shadow-md flex flex-col justify-between group transition-all"
                  >
                    <div className="flex gap-3.5">
                      <div className="w-16 h-24 rounded-lg overflow-hidden bg-zinc-950 border border-emerald-500/40 shrink-0 relative shadow flex items-center justify-center">
                        {book.imageUrl ? (
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-900 text-zinc-400">
                            <span className="material-symbols-outlined text-[20px] text-emerald-400 mb-0.5">
                              workspace_premium
                            </span>
                            <span className="text-[8px] font-mono line-clamp-2 text-zinc-300">
                              {book.title}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow">
                          <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            <span>Finished</span>
                          </div>
                          <h4 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-emerald-300 transition-colors">
                            {book.title}
                          </h4>
                          {book.author && (
                            <p className="text-xs text-on-surface-variant line-clamp-1">{book.author}</p>
                          )}
                          <div className="mt-1 text-[11px] font-mono text-zinc-400">
                            {book.totalPages ? `${book.totalPages} pages read` : "Completed"}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400 font-bold">100% Complete</span>
                          <button
                            onClick={() => handleMarkReading(book.id)}
                            className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Move back to currently reading"
                          >
                            Re-read
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: READING SESSIONS HISTORY TIMELINE */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-cyan-400">history</span>
              <span className="text-sm font-bold text-on-surface font-mono">
                Session Log ({filteredReadings.length})
              </span>
            </div>

            {/* Filter by Book */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Filter Book:</span>
              <select
                value={selectedBookFilter}
                onChange={(e) => setSelectedBookFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none font-mono cursor-pointer"
              >
                <option value="all">All Books ({allReadings.length})</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingReadings ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-400">
              Loading reading session ledger...
            </div>
          ) : filteredReadings.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-[32px] text-cyan-400/40 mb-1">history_edu</span>
              <p className="text-xs text-on-surface-variant font-mono">No reading sessions found.</p>
              <button
                onClick={() => openBookModal("log_session")}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Log First Session</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReadings.map((session, index) => (
                <div
                  key={session.id}
                  className={`bg-surface-container-low border ${
                    index === 0
                      ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      : "border-outline-variant/60 hover:border-cyan-500/40"
                  } p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-all group`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    {session.imageUrl ? (
                      <img
                        src={session.imageUrl}
                        alt=""
                        className="w-10 h-14 object-cover rounded-md border border-white/10 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center text-cyan-400/70 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface truncate">
                          {session.bookTitle}
                        </span>
                        {session.author && (
                          <span className="text-zinc-400 text-xs truncate">
                            • {session.author}
                          </span>
                        )}
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            {session.updatedAt && session.createdAt && session.updatedAt !== session.createdAt ? "Last Updated Log" : "Last Added Log"}
                          </span>
                        )}
                      </div>

                      <div className="text-zinc-400 flex flex-wrap items-center gap-3">
                        <span className="text-cyan-300 font-semibold">
                          {formatDate(session.sessionDate)}
                        </span>
                        <span>
                          Pages {session.startPage} → {session.endPage}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          +{session.pagesRead} pages
                        </span>
                        {session.durationMinutes > 0 && (
                          <span className="text-zinc-500">
                            ({session.durationMinutes}m duration)
                          </span>
                        )}
                      </div>

                      {session.insightQuote && (
                        <p className="text-[11px] text-amber-300/90 italic font-sans pl-2 border-l-2 border-amber-400/60 line-clamp-2 mt-1">
                          &ldquo;{session.insightQuote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal("reading", session.id, session)}
                      className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded hover:bg-surface-container transition-colors cursor-pointer"
                      title="Edit reading session"
                    >
                      <span className="material-symbols-outlined text-[17px]">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHILOSOPHICAL QUOTES & RETENTION */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
            <div>
              <h3 className="text-sm font-bold text-on-surface font-mono">
                Reading Wisdom Gallery
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Retained insights, reflections, and quotes logged during reading sessions.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              {quotesList.length} Quotes Saved
            </span>
          </div>

          {quotesList.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-[32px] text-amber-400/40 mb-1">format_quote</span>
              <p className="text-xs text-on-surface-variant font-mono">
                No quotes or takeaways saved yet. When logging daily reading, capture key passages in the reflection field!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotesList.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-low border border-outline-variant/60 hover:border-amber-400/40 p-5 rounded-xl shadow flex flex-col justify-between transition-colors relative overflow-hidden group"
                >
                  <div className="absolute top-2 right-2 text-[48px] text-amber-500/10 font-serif leading-none select-none pointer-events-none">
                    &rdquo;
                  </div>

                  <p className="text-sm text-zinc-200 font-serif italic leading-relaxed mb-4 relative z-10">
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="text-cyan-300 font-semibold truncate max-w-[200px]">
                      {item.bookTitle} {item.author ? `— ${item.author}` : ""}
                    </span>
                    <span className="text-[11px] text-zinc-500 shrink-0">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VAULT LIBRARY (ALL BOOKS) */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
            <div>
              <h3 className="text-sm font-bold text-on-surface font-mono">
                Complete Book Library ({books.length})
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Manage titles, cover artwork, and reading statuses.
              </p>
            </div>
            <button
              onClick={() => openBookModal("add_book")}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">library_add</span>
              <span>+ Add Book</span>
            </button>
          </div>

          {books.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/60">
              <span className="material-symbols-outlined text-[32px] text-cyan-400/40 mb-1">auto_stories</span>
              <p className="text-xs text-on-surface-variant font-mono">No books in vault yet.</p>
              <button
                onClick={() => openBookModal("add_book")}
                className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Your First Book</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="bg-surface-container-low border border-outline-variant/60 hover:border-cyan-500/40 p-4 rounded-xl flex flex-col justify-between group transition-all"
                >
                  <div className="flex gap-3.5">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-zinc-950 border border-white/10 shrink-0 relative shadow flex items-center justify-center">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-zinc-900 text-zinc-400">
                          <span className="material-symbols-outlined text-[20px] text-cyan-400 mb-0.5">
                            menu_book
                          </span>
                          <span className="text-[8px] font-mono line-clamp-2 text-zinc-300">
                            {b.title}
                          </span>
                        </div>
                      )}
                      <span className={`absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                        b.isCompleted || b.status === "completed"
                          ? "bg-emerald-500 text-zinc-950"
                          : "bg-cyan-500/80 text-zinc-950"
                      }`}>
                        {b.isCompleted || b.status === "completed" ? "Done" : "Reading"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {b.title}
                        </h4>
                        {b.author && (
                          <p className="text-xs text-on-surface-variant line-clamp-1">{b.author}</p>
                        )}
                        <p className="text-[11px] text-zinc-400 font-mono mt-1">
                          {b.totalPages ? `${b.totalPages} total pages` : "Pages unassigned"}
                        </p>
                        {b.currentPage !== undefined && b.currentPage > 0 && (
                          <p className="text-[10px] text-cyan-300 font-mono">
                            Currently page {b.currentPage} ({b.pctCompleted ?? 0}%)
                          </p>
                        )}
                      </div>

                      {/* Status toggle & delete */}
                      <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                        <button
                          onClick={() => {
                            if (b.isCompleted || b.status === "completed") {
                              handleMarkReading(b.id);
                            } else {
                              handleMarkCompleted(b.id);
                            }
                          }}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            b.isCompleted || b.status === "completed"
                              ? "bg-zinc-800 text-zinc-300 hover:text-white"
                              : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                          }`}
                        >
                          {b.isCompleted || b.status === "completed" ? "Set to Reading" : "Mark Finished"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
