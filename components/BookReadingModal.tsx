"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { formatDayFullWithOrdinal } from "@/lib/date-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BookReadingModal() {
  const {
    state,
    selectedDate,
    bookModalOpen,
    setBookModalOpen,
    bookModalTab,
    setBookModalTab,
    addBook,
    updateBook,
    logReading,
    openEditModal,
  } = useLifeOS();

  // Tab state: "currently_reading" | "log_session" | "add_book" | "all_books"
  const activeTab = bookModalTab;
  const setActiveTab = setBookModalTab;

  // Form: Add Book
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newTotalPages, setNewTotalPages] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("reading");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form: Log Reading Session
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");
  const [insightQuote, setInsightQuote] = useState("");
  const [isLoggingSession, setIsLoggingSession] = useState(false);

  useEffect(() => {
    if (!bookModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBookModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookModalOpen, setBookModalOpen]);

  if (!bookModalOpen) return null;

  const allBooks = state?.books || [];
  const currentlyReadingBooks = allBooks.filter((b) => (b.status || "reading") === "reading");
  const readingsToday = state?.readingsToday || [];
  const totalPagesToday = state?.readingToday?.totalDayPages ?? readingsToday.reduce((sum, r) => sum + r.pagesRead, 0);

  // Handle image upload from file system
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Limit to 4MB for fast in-database storage
    if (file.size > 4 * 1024 * 1024) {
      setImageUploadError("Image file size should be under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setImageUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Submit Add Book
  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAddingBook(true);
    try {
      const added = await addBook({
        title: newTitle.trim(),
        author: newAuthor.trim() || undefined,
        totalPages: newTotalPages ? Number(newTotalPages) : undefined,
        imageUrl: newImageUrl || undefined,
        status: newStatus,
      });

      // Reset form
      setNewTitle("");
      setNewAuthor("");
      setNewTotalPages("");
      setNewImageUrl("");
      setNewStatus("reading");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Close modal on successfully adding book
      setBookModalOpen(false);
    } catch {
      // Error handled by notify toast in context
    } finally {
      setIsAddingBook(false);
    }
  };

  // Quick prep for logging session for a specific book
  const prepLogSessionForBook = (bookId: string) => {
    setSelectedBookId(bookId);
    const book = allBooks.find((b) => b.id === bookId);
    // Find the latest reading for this book across readingsToday or from book's lastReadingSession
    const latestForBook = readingsToday.find((r) => r.bookId === bookId) || book?.lastReadingSession;
    if (latestForBook) {
      setStartPage(String(latestForBook.endPage));
      setEndPage(String(latestForBook.endPage + 15));
    } else if (book?.currentPage) {
      setStartPage(String(book.currentPage));
      setEndPage(String(book.currentPage + 15));
    } else {
      setStartPage("1");
      setEndPage("15");
    }
    setActiveTab("log_session");
  };

  // Submit Log Reading Session (multiple per day supported)
  const handleLogSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sPage = Number(startPage);
    const ePage = Number(endPage);

    if (isNaN(sPage) || isNaN(ePage) || ePage < sPage) {
      alert("Please ensure End Page is greater than or equal to Start Page.");
      return;
    }

    const targetBook = allBooks.find((b) => b.id === selectedBookId) || currentlyReadingBooks[0];
    if (!targetBook) {
      alert("Please select or add a book to log reading.");
      return;
    }

    setIsLoggingSession(true);
    try {
      await logReading({
        bookId: targetBook.id,
        bookTitle: targetBook.title,
        author: targetBook.author || undefined,
        imageUrl: targetBook.imageUrl || undefined,
        totalPages: targetBook.totalPages || undefined,
        startPage: sPage,
        endPage: ePage,
        durationMinutes: 0,
        insightQuote: insightQuote.trim() || undefined,
      });

      // Clear session form fields
      setStartPage(String(ePage));
      setEndPage(String(ePage + 15));
      setInsightQuote("");

      // Close modal on successfully logging reading session
      setBookModalOpen(false);
    } finally {
      setIsLoggingSession(false);
    }
  };

  // Selected book for session
  const activeSessionBook = allBooks.find((b) => b.id === selectedBookId) || currentlyReadingBooks[0] || allBooks[0];

  const pagesDelta = Math.max(0, (Number(endPage) || 0) - (Number(startPage) || 0));

  return (
    <Dialog open={bookModalOpen} onOpenChange={setBookModalOpen}>
      <DialogContent className="max-w-2xl bg-surface-container-low border border-cyan-500/30 rounded-2xl p-0 overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[80vh]">
        {/* Glow Header Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 shrink-0" />

        {/* Modal Header */}
        <DialogHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-outline-variant/30 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-bold text-on-surface tracking-tight">Book Reading Vault</DialogTitle>
                <Badge variant="default" className="text-[9px] uppercase">
                  Reading Protocol
                </Badge>
              </div>
              <DialogDescription className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                Session Date: <span className="text-cyan-300 font-semibold">{formatDayFullWithOrdinal(selectedDate)}</span>
                {readingsToday.length > 0 && (
                  <span className="ml-2 text-emerald-400">
                    • {readingsToday.length} session{readingsToday.length > 1 ? "s" : ""} ({totalPagesToday}p today)
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
          <TabsList className="bg-surface-container-lowest/80 border-b border-outline-variant/30 p-1 flex justify-start rounded-none h-auto gap-1 text-xs font-mono shrink-0">
            <TabsTrigger
              value="currently_reading"
              className="px-2.5 py-1.5 text-xs font-mono gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Currently Reading ({currentlyReadingBooks.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="log_session"
              className="px-2.5 py-1.5 text-xs font-mono gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Log Daily Pages</span>
            </TabsTrigger>

            <TabsTrigger
              value="add_book"
              className="px-2.5 py-1.5 text-xs font-mono gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
            >
              <span className="material-symbols-outlined text-[16px]">library_add</span>
              <span>Add New Book</span>
            </TabsTrigger>

            <TabsTrigger
              value="all_books"
              className="px-2.5 py-1.5 text-xs font-mono gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300"
            >
              <span className="material-symbols-outlined text-[16px]">shelves</span>
              <span>All Books ({allBooks.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Body */}
          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* TAB 1: CURRENTLY READING */}
          {activeTab === "currently_reading" && (
            <div className="space-y-6">
              {/* Daily Progress Ribbon */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-surface-container to-[#13141a] p-4 rounded-xl border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {totalPagesToday}p
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Daily Reading Volume</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {readingsToday.length} entry{readingsToday.length === 1 ? "" : "s"} logged on {formatDayFullWithOrdinal(selectedDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("log_session")}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#051319] font-semibold text-xs transition-all flex items-center gap-1 shadow-md shadow-cyan-500/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Log Pages</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("add_book")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-mono transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">book</span>
                    <span>+ New Book</span>
                  </button>
                </div>
              </div>

              {/* Books List / Empty State */}
              {currentlyReadingBooks.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-xl border border-dashed border-white/15 bg-white/[0.02]">
                  <span className="material-symbols-outlined text-[42px] text-cyan-400/40 mb-2">auto_stories</span>
                  <h3 className="text-sm font-semibold text-white">No Books In Active Reading</h3>
                  <p className="text-xs text-zinc-400 font-mono max-w-sm mx-auto mt-1 mb-4">
                    Add a book you are reading, upload its cover image, and track your daily page cadence.
                  </p>
                  <button
                    onClick={() => setActiveTab("add_book")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-[#051319] font-semibold text-xs hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    <span>Start Reading a Book</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentlyReadingBooks.map((book) => {
                    const bookReadings = readingsToday.filter((r) => r.bookId === book.id);
                    const pagesTodayForBook = bookReadings.reduce((sum, r) => sum + r.pagesRead, 0);

                    return (
                      <div
                        key={book.id}
                        className="bg-[#14151b] border border-white/10 hover:border-cyan-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-sm"
                      >
                        <div className="flex gap-3.5">
                          {/* Book Cover Image */}
                          <div className="w-20 h-28 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0 relative shadow-md flex items-center justify-center group-hover:shadow-cyan-500/10 transition-shadow">
                            {book.imageUrl ? (
                              <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-500">
                                <span className="material-symbols-outlined text-[24px] text-cyan-400/60 mb-1">
                                  auto_stories
                                </span>
                                <span className="text-[9px] font-mono line-clamp-2 text-zinc-300">
                                  {book.title}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[9px] font-mono text-cyan-300">
                              Active
                            </div>
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                              {book.title}
                            </h4>
                            {book.author && (
                              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{book.author}</p>
                            )}

                            {book.totalPages && (
                              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                                Total: {book.totalPages} pages
                              </p>
                            )}

                            {pagesTodayForBook > 0 && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                +{pagesTodayForBook}p read today
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                          <button
                            onClick={() => prepLogSessionForBook(book.id)}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit_note</span>
                            <span>Log Pages</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateBook(book.id, { status: "completed" })}
                              className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                              title="Mark as Completed"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Today's Reading Sessions Logged */}
              {readingsToday.length > 0 ? (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-cyan-400">history_edu</span>
                      Today's Reading Sessions ({readingsToday.length})
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                      Total: {totalPagesToday} pages
                    </span>
                  </div>

                  <div className="space-y-2">
                    {readingsToday.map((r, idx) => (
                      <div
                        key={r.id}
                        className={`border p-3 rounded-lg flex items-center justify-between gap-3 text-xs font-mono transition-all ${
                          idx === 0
                            ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                            : "bg-black/40 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt=""
                              className="w-8 h-11 object-cover rounded border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400">
                              <span className="material-symbols-outlined text-[16px]">book</span>
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-white truncate">{r.bookTitle}</div>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                                  Latest Entry
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400 text-xs">
                              Pages {r.startPage} → {r.endPage}
                              <span className="text-emerald-400 font-semibold ml-2">+{r.pagesRead} pages</span>
                            </div>
                            {r.insightQuote && (
                              <div className="text-[11px] text-amber-300/80 italic truncate max-w-md mt-0.5">
                                &ldquo;{r.insightQuote}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal("reading", r.id, r)}
                            className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="Edit session"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : state?.lastReadingLog ? (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-cyan-400">history</span>
                      Last Book Page Log Entry
                    </h3>
                    {state.lastReadingLog.sessionDate && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        {state.lastReadingLog.sessionDate}
                      </span>
                    )}
                  </div>

                  <div className="bg-surface-container-high/40 border border-cyan-500/30 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-3 min-w-0">
                      {state.lastReadingLog.imageUrl ? (
                        <img
                          src={state.lastReadingLog.imageUrl}
                          alt=""
                          className="w-8 h-11 object-cover rounded border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-11 rounded bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400">
                          <span className="material-symbols-outlined text-[16px]">book</span>
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{state.lastReadingLog.bookTitle}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                            Latest
                          </span>
                        </div>
                        <div className="text-zinc-400 text-xs">
                          Pages {state.lastReadingLog.startPage} → {state.lastReadingLog.endPage}
                          <span className="text-emerald-400 font-semibold ml-2">+{state.lastReadingLog.pagesRead} pages</span>
                        </div>
                        {state.lastReadingLog.insightQuote && (
                          <div className="text-[11px] text-amber-300/80 italic truncate max-w-md mt-0.5">
                            &ldquo;{state.lastReadingLog.insightQuote}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal("reading", state.lastReadingLog!.id, state.lastReadingLog)}
                        className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
                        title="Edit session"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: LOG READING SESSION (Start Page & End Page, Multiple per day) */}
          {activeTab === "log_session" && (
            <form onSubmit={handleLogSessionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT SIDE: Necessary inputs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300">
                      Date: <span className="text-cyan-300 font-bold">{formatDayFullWithOrdinal(selectedDate)}</span>
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      Multiple entries allowed per day
                    </span>
                  </div>

                  {/* Last Added/Updated Page Log for Active Book */}
                  {activeSessionBook?.lastReadingSession && (
                    <div className="p-3 rounded-xl bg-surface-container-high/60 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-cyan-400">history</span>
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Last Added/Updated Log Entry:</div>
                          <div className="text-white font-semibold">
                            pp. {activeSessionBook.lastReadingSession.startPage} → {activeSessionBook.lastReadingSession.endPage}
                            <span className="text-emerald-400 ml-1.5 font-bold">+{activeSessionBook.lastReadingSession.pagesRead}p</span>
                          </div>
                        </div>
                      </div>
                      {activeSessionBook.lastReadingSession.sessionDate && (
                        <span className="text-[11px] text-zinc-400">
                          {activeSessionBook.lastReadingSession.sessionDate}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Book Selection */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center justify-between">
                      <span>Select Book *</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("add_book")}
                        className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono normal-case inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        <span>Add New</span>
                      </button>
                    </label>

                    {allBooks.length === 0 ? (
                      <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-400 flex items-center justify-between">
                        <span>No books in vault yet.</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("add_book")}
                          className="text-cyan-400 hover:underline"
                        >
                          Add a book first
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedBookId || activeSessionBook?.id || ""}
                        onChange={(e) => {
                          const bId = e.target.value;
                          setSelectedBookId(bId);
                          const book = allBooks.find((b) => b.id === bId);
                          const latest = readingsToday.find((r) => r.bookId === bId) || book?.lastReadingSession;
                          if (latest) {
                            setStartPage(String(latest.endPage));
                            setEndPage(String(latest.endPage + 15));
                          } else if (book?.currentPage) {
                            setStartPage(String(book.currentPage));
                            setEndPage(String(book.currentPage + 15));
                          } else {
                            setStartPage("1");
                            setEndPage("15");
                          }
                        }}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none font-mono cursor-pointer"
                      >
                        {allBooks.map((b) => (
                          <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                            {b.title} {b.author ? `— ${b.author}` : ""} {b.status === "completed" ? "(Completed)" : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Start Page & End Page */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Start Page *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 0 or 1"
                        value={startPage}
                        onChange={(e) => setStartPage(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                        End Page *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 25"
                        value={endPage}
                        onChange={(e) => setEndPage(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Real-time Calculation Badge */}
                  {pagesDelta > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>Pages read in this session:</span>
                      </span>
                      <span className="font-bold text-sm">+{pagesDelta} Pages</span>
                    </div>
                  )}

                  {/* Insight Quote */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Core Philosophical Quote / Reflection (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={insightQuote}
                      onChange={(e) => setInsightQuote(e.target.value)}
                      placeholder="Capture key insight, passage or takeaway from this reading..."
                      className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-sans resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("currently_reading")}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-mono transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingSession || allBooks.length === 0}
                      className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#051319] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      {isLoggingSession ? (
                        <ButtonSpinner />
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">save</span>
                      )}
                      <span>{isLoggingSession ? "Saving Entry..." : "Log Reading Session"}</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE: Big picture of book & details */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-[#13151f] to-[#0c0d13] border border-cyan-500/25 rounded-2xl shadow-xl relative overflow-hidden text-center">
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5 self-start">
                    <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    <span>Book Preview</span>
                  </div>

                  {/* Large Book Cover Picture */}
                  <div className="w-44 h-64 sm:w-48 sm:h-72 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 relative group flex items-center justify-center bg-zinc-950 transition-transform hover:scale-[1.02]">
                    {activeSessionBook?.imageUrl ? (
                      <img
                        src={activeSessionBook.imageUrl}
                        alt={activeSessionBook.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-zinc-400 relative">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                          <span className="material-symbols-outlined text-[28px]">auto_stories</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-3 mb-1">
                          {activeSessionBook?.title || "Select a Book"}
                        </h4>
                        {activeSessionBook?.author && (
                          <p className="text-[10px] text-zinc-400 line-clamp-1">{activeSessionBook.author}</p>
                        )}
                        <span className="mt-3 text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                          LifeOS Reading
                        </span>
                      </div>
                    )}

                    {activeSessionBook?.status === "completed" && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                        <span className="material-symbols-outlined text-[13px]">check</span>
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Book Metadata & Progress */}
                  <div className="mt-3.5 w-full">
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {activeSessionBook?.title || "No Book Selected"}
                    </h3>
                    {activeSessionBook?.author && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {activeSessionBook.author}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {activeSessionBook && (activeSessionBook.totalPages ?? 0) > 0 && (
                      <div className="mt-3 bg-black/40 p-2.5 rounded-lg border border-white/10 text-left">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-zinc-400">Total Progress</span>
                          <span className="text-cyan-300 font-semibold">
                            {activeSessionBook.pctCompleted ?? 0}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(3, activeSessionBook.pctCompleted ?? 0))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1.5">
                          <span>Page {activeSessionBook.currentPage || 0} / {activeSessionBook.totalPages}</span>
                          <span>{activeSessionBook.pagesRemaining ?? 0}p left</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: ADD NEW BOOK (With Image Upload) */}
          {activeTab === "add_book" && (
            <form onSubmit={handleAddBookSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Left: Book Cover Image Upload & Preview */}
                <div className="flex flex-col items-center justify-center">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 text-center w-full">
                    Book Cover Image
                  </label>

                  <div className="w-32 h-44 rounded-xl overflow-hidden bg-zinc-900 border-2 border-dashed border-white/20 hover:border-cyan-500/60 relative flex flex-col items-center justify-center group transition-colors shadow-lg">
                    {newImageUrl ? (
                      <>
                        <img
                          src={newImageUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewImageUrl("");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                          title="Remove image"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer p-3 text-center flex flex-col items-center justify-center h-full w-full"
                      >
                        <span className="material-symbols-outlined text-[28px] text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
                          add_photo_alternate
                        </span>
                        <span className="text-[10px] font-mono text-zinc-300">Upload Cover</span>
                        <span className="text-[9px] text-zinc-500 font-mono mt-0.5">PNG, JPG, WebP</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-colors"
                    >
                      Browse File
                    </button>
                  </div>

                  {imageUploadError && (
                    <p className="text-[10px] text-red-400 font-mono mt-1 text-center">
                      {imageUploadError}
                    </p>
                  )}
                </div>

                {/* Right: Book Details Form */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meditations, Antifragile, The Bhagavad Gita"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Marcus Aurelius"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Total Pages
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 320"
                        value={newTotalPages}
                        onChange={(e) => setNewTotalPages(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Reading Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      >
                        <option value="reading">Currently Reading</option>
                        <option value="completed">Completed</option>
                        <option value="paused">On Hold / Paused</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Or Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newImageUrl.startsWith("data:") ? "" : newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full bg-[#0a0b0e] border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("currently_reading")}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-mono transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingBook || !newTitle.trim()}
                      className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#051319] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20"
                    >
                      {isAddingBook ? (
                        <ButtonSpinner />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                      )}
                      <span>{isAddingBook ? "Adding Book..." : "Add Book & Start Reading"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: ALL BOOKS (Library View) */}
          {activeTab === "all_books" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  {allBooks.length} Total Book{allBooks.length === 1 ? "" : "s"} In Library
                </span>
                <button
                  onClick={() => setActiveTab("add_book")}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Book</span>
                </button>
              </div>

              {allBooks.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  No books added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allBooks.map((b) => (
                    <div
                      key={b.id}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div className="flex gap-2.5">
                        <div className="w-14 h-20 rounded bg-zinc-900 border border-white/10 shrink-0 overflow-hidden">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <span className="material-symbols-outlined text-[20px]">book</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                          <p className="text-[11px] text-zinc-400 truncate">{b.author || "Unknown"}</p>
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded capitalize ${
                              b.status === "completed"
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                                : b.status === "paused"
                                ? "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                                : "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                            }`}>
                              {b.status || "reading"}
                            </span>
                            {b.totalPages && (
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {b.totalPages}p
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                        <button
                          onClick={() => prepLogSessionForBook(b.id)}
                          className="text-cyan-400 hover:underline"
                        >
                          Log Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
