"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { addDaysToDateStr } from "@/lib/date-utils";
import { ButtonSpinner } from "@/components/ButtonSpinner";

export default function QuickAddModal() {
  const {
    state,
    selectedDate,
    modalOpen,
    setModalOpen,
    modalType,
    dbStatus,
    checkDbStatus,
    logWorkout,
    logSleep,
    logDeepWork,
    logReading,
    logExpense,
    logAddMoney,
    logIncome,
    addDeposit,
    logJournal,
    logBrahmacharya,
    setDisciplineScore,
    notify,
    startDeepWorkTimer,
    activeTimer,
  } = useLifeOS();

  // Daily 2-Min Form States
  const [sadhanaDone, setSadhanaDone] = useState(true);
  const [sadhanaType, setSadhanaType] = useState("Surya Kriya & Yogasanas");
  const [sadhanaMins, setSadhanaMins] = useState(45);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(9);
  // Standalone Sleep Form States
  const [sleepStartDate, setSleepStartDate] = useState(addDaysToDateStr(selectedDate, -1));
  const [sleepStartTime, setSleepStartTime] = useState("22:30");
  const [sleepEndDate, setSleepEndDate] = useState(selectedDate);
  const [sleepEndTime, setSleepEndTime] = useState("06:30");
  const [sleepLogHours, setSleepLogHours] = useState(8);
  const [sleepLogMinutes, setSleepLogMinutes] = useState(0);
  const [sleepLogScore, setSleepLogScore] = useState(85);

  useEffect(() => {
    if (selectedDate) {
      setSleepStartDate(addDaysToDateStr(selectedDate, -1));
      setSleepEndDate(selectedDate);
    }
  }, [selectedDate]);
  const [deepWorkHours, setDeepWorkHours] = useState(3.5);
  const [deepWorkTopic, setDeepWorkTopic] = useState("Engineering Income Work");
  const [earnedToday, setEarnedToday] = useState(0);
  const [moodScore, setMoodScore] = useState(9);
  const [moodWhy, setMoodWhy] = useState("Calm and focused execution");
  const [journalDid, setJournalDid] = useState("");
  const [journalLearned, setJournalLearned] = useState("");
  const [journalTomorrow, setJournalTomorrow] = useState("");
  const [createdToday, setCreatedToday] = useState("");
  const [disciplineInput, setDisciplineInput] = useState(9);
  const [brahmacharyaClean, setBrahmacharyaClean] = useState(true);

  // Single vector states
  const [readingBookId, setReadingBookId] = useState<string>("");
  const [readingBookTitle, setReadingBookTitle] = useState("Meditations");
  const [readingAuthor, setReadingAuthor] = useState("Marcus Aurelius");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(30);
  const [readingQuote, setReadingQuote] = useState("");

  useEffect(() => {
    if (modalType === "reading") {
      const activeBook = state?.currentBook || (state?.books && state.books.length > 0 ? state.books[0] : null);
      if (activeBook) {
        setReadingBookId(activeBook.id);
        setReadingBookTitle(activeBook.title);
        setReadingAuthor(activeBook.author || "");
        if (activeBook.currentPage) {
          setStartPage(activeBook.currentPage);
          setEndPage(activeBook.currentPage + 15);
        }
      }
    }
  }, [modalType, state?.currentBook, state?.books]);
  const [sadhanaPractices, setSadhanaPractices] = useState<string[]>(["surya_kriya"]);
  const [suryaKriyaCycles, setSuryaKriyaCycles] = useState<number>(3);
  const [asanaHoldingCount, setAsanaHoldingCount] = useState<number>(30);
  const [sadhanaDurationMins, setSadhanaDurationMins] = useState<number>(20);
  const [sadhanaNotes, setSadhanaNotes] = useState<string>("");

  const toggleSadhanaPractice = (id: string) => {
    setSadhanaPractices((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Maintain at least one selection
        next = prev.filter((p) => p !== id);
      } else {
        next = [...prev, id];
      }
      let suggested = 0;
      if (next.includes("surya_kriya")) suggested += 20;
      if (next.includes("yogasanas")) suggested += 30;
      if (next.includes("shambhavi_mahamudra")) suggested += 21;
      if (next.includes("preparatory_asanas")) suggested += 10;
      setSadhanaDurationMins(suggested);
      return next;
    });
  };

  const [deepTopic, setDeepTopic] = useState("");
  const [deepDesc, setDeepDesc] = useState("");
  const [deepMins, setDeepMins] = useState(0);
  const [deepInsight, setDeepInsight] = useState("");

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("food");
  const [expenseEssential, setExpenseEssential] = useState(true);

  // Add Money Form States
  const [addMoneyTitle, setAddMoneyTitle] = useState("");
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyCategory, setAddMoneyCategory] = useState("income");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("Pune Sovereignty allocation");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, setModalOpen]);

  if (!modalOpen) return null;

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (sadhanaDone) {
        await logWorkout({
          type: "surya_kriya",
          description: `${sadhanaType} (${sadhanaMins}m)`,
          durationMinutes: sadhanaMins,
          cycles: 3,
          calories: 450,
          peakBpm: 150,
          quality: "Zone 3/4 Physical",
        });
      }

      await logSleep({
        durationMinutes: Math.round(sleepHours * 60),
        quality: sleepQuality * 10,
        deepPct: 22,
        remPct: 38,
        lightPct: 32,
        awakePct: 8,
      });

      if (deepWorkHours > 0) {
        await logDeepWork({
          topic: deepWorkTopic,
          description: `Income work session (${deepWorkHours}h)`,
          durationMinutes: Math.round(deepWorkHours * 60),
          quality: "Session Verified",
          keyInsight: journalLearned,
        });
      }

      if (Number(earnedToday) > 0) {
        await logIncome(Number(earnedToday));
      }

      await logJournal("mood", { score: moodScore, note: moodWhy });
      await logJournal("three_lines", {
        did: journalDid,
        learned: journalLearned,
        tomorrow: journalTomorrow,
      });

      if (createdToday) {
        await logJournal("creation", createdToday);
      }

      await logBrahmacharya(brahmacharyaClean, 0, "Daily protocol sealed.");
      await setDisciplineScore(disciplineInput);

      notify(
        "Daily Protocol Sealed",
        "Sadhana, sleep, deep work, and discipline committed to Supabase",
        "success"
      );
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sadhanaPractices.length === 0) return;
    setIsSubmitting(true);
    try {
      const parts: string[] = [];
      if (sadhanaPractices.includes("surya_kriya")) {
        parts.push(`Surya Kriya (${suryaKriyaCycles} cycles)`);
      }
      if (sadhanaPractices.includes("yogasanas")) {
        parts.push(`Yogasanas (${asanaHoldingCount}s hold)`);
      }
      if (sadhanaPractices.includes("shambhavi_mahamudra")) {
        parts.push("Shambhavi Mahamudra Kriya");
      }
      if (sadhanaPractices.includes("preparatory_asanas")) {
        parts.push("Preparatory Asanas (3-Exercise Set)");
      }
      const summary = parts.join(" • ");
      const finalDesc = sadhanaNotes.trim() ? `${summary} — ${sadhanaNotes.trim()}` : summary;

      await logWorkout({
        type: sadhanaPractices.length === 1 ? sadhanaPractices[0] : "sadhana_combo",
        description: finalDesc,
        durationMinutes: 0,
        cycles: sadhanaPractices.includes("surya_kriya") ? Number(suryaKriyaCycles) : 0,
        suryaKriyaCycles: sadhanaPractices.includes("surya_kriya") ? Number(suryaKriyaCycles) : undefined,
        asanaHoldingCount: sadhanaPractices.includes("yogasanas") ? Number(asanaHoldingCount) : undefined,
        practices: sadhanaPractices,
        quality: "Zone 3/4 Physical",
      });
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const totalMinutes = Math.round(Number(sleepLogHours) * 60) + Number(sleepLogMinutes || 0);
      await logSleep({
        startDate: sleepStartDate,
        endDate: sleepEndDate,
        durationMinutes: totalMinutes,
        quality: Number(sleepLogScore),
      });
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeepWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepTopic) return;
    setIsSubmitting(true);
    try {
      await logDeepWork({
        topic: deepTopic,
        description: deepDesc,
        durationMinutes: Number(deepMins),
        keyInsight: deepInsight,
        quality: "Session Verified",
      });
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logReading({
        bookId: readingBookId || undefined,
        bookTitle: readingBookTitle,
        author: readingAuthor,
        startPage: Number(startPage),
        endPage: Number(endPage),
        durationMinutes: 0,
        insightQuote: readingQuote,
        vaultPath: `/LifeOS/Readings/${selectedDate}.md`,
      });
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    setIsSubmitting(true);
    try {
      await logExpense({
        title: expenseTitle,
        amount: Math.abs(Number(expenseAmount)),
        category: expenseCategory,
        isEssential: expenseEssential,
      });
      setExpenseTitle("");
      setExpenseAmount("");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMoneyAmount) return;
    setIsSubmitting(true);
    try {
      await logAddMoney({
        title: addMoneyTitle.trim() || "Added Funds",
        amount: Math.abs(Number(addMoneyAmount)),
        category: addMoneyCategory,
      });
      setAddMoneyTitle("");
      setAddMoneyAmount("");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) return;
    setIsSubmitting(true);
    try {
      await addDeposit(Number(depositAmount), depositNote);
      setDepositAmount("");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setModalOpen(false);
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090b]/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full ${modalType === "reading" ? "max-w-3xl" : modalType === "daily_2min" ? "max-w-xl" : "max-w-lg"} bg-[#121215] rounded-[8px] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.7)] border border-[#27272a] my-auto overflow-hidden`}
      >
        {/* Top Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#06b6d4] via-[#10b981] to-[#f59e0b]" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#1e1e24] bg-[#0e0e11]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f4f4f5] tracking-tight">
                {modalType === "daily_2min" && "DAILY PROTOCOL CHECK-IN (2 min fill)"}
                {modalType === "sadhana" && "LOG SADHANA PRACTICE"}
                {modalType === "sleep" && "LOG SLEEP DURATION & QUALITY"}
                {modalType === "deepwork" && "LOG DEEP WORK (INCOME WORK)"}
                {modalType === "reading" && "LOG BOOK READING"}
                {modalType === "expense" && "LOG ₹ SPEND TRANSACTION"}
                {modalType === "add_money" && "ADD MONEY / INFLOW (₹)"}
                {modalType === "deposit" && "ALLOCATE SOVEREIGNTY DEPOSIT ($)"}
                {modalType === "brahmacharya" && "BRAHMACHARYA & VITALITY LOG"}
                {modalType === "db_settings" && "SUPABASE & DRIZZLE CONFIGURATION"}
              </h2>
              <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">
                Date: <span className="text-[#06b6d4] font-semibold">{selectedDate}</span> • Target Table: Supabase PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(false)}
            className="w-8 h-8 rounded-[6px] bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body: Daily 2min */}
        {modalType === "daily_2min" && (
          <form onSubmit={handleDailySubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            {/* Row 1: Sadhana & Brahmacharya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                    1. Sadhana Practice
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sadhanaDone}
                      onChange={(e) => setSadhanaDone(e.target.checked)}
                      className="w-4 h-4 rounded-[3px] accent-[#10b981]"
                    />
                    <span className="text-xs font-semibold text-[#10b981]">Cleared</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={sadhanaType}
                  onChange={(e) => setSadhanaType(e.target.value)}
                  placeholder="e.g. Surya Kriya / Yogasanas / Shambhavi"
                  className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                />
                <div className="flex justify-between items-center text-xs text-[#a1a1aa]">
                  <span>Duration (mins):</span>
                  <input
                    type="number"
                    value={sadhanaMins}
                    onChange={(e) => setSadhanaMins(Number(e.target.value))}
                    className="w-20 bg-[#121215] border border-[#27272a] rounded p-1.5 text-center text-sm font-bold text-[#06b6d4]"
                  />
                </div>
              </div>

              {/* Brahmacharya */}
              <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                    2. Brahmacharya (Vitality)
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
                    Day {state?.brahmacharya.cleanStreak ?? 0}
                  </span>
                </div>
                <label className="flex items-center gap-2 p-2.5 bg-[#121215] border border-[#27272a] rounded-[4px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brahmacharyaClean}
                    onChange={(e) => setBrahmacharyaClean(e.target.checked)}
                    className="w-4 h-4 rounded-[3px] accent-[#f59e0b]"
                  />
                  <span className="text-sm text-[#f4f4f5] font-medium">
                    Day 100% Clean • Ojas Conserved
                  </span>
                </label>
                <div className="text-xs text-[#71717a]">
                  Transmuted seminal vitality directly to Supabase.
                </div>
              </div>
            </div>

            {/* Row 2: Sleep & Deep Work */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  3. Sleep Duration &amp; Quality
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Hours:</label>
                    <input
                      type="number"
                      step="0.25"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Quality (/10):</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(Number(e.target.value))}
                      className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  4. Deep Work on INCOME Work
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Hours:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={deepWorkHours}
                      onChange={(e) => setDeepWorkHours(Number(e.target.value))}
                      className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Earned $ Today:</label>
                    <input
                      type="number"
                      value={earnedToday}
                      onChange={(e) => setEarnedToday(Number(e.target.value))}
                      className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-sm text-[#10b981] font-bold focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Mood Calm /10 */}
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  5. Mood &amp; Equanimity (Calm /10)
                </span>
                <span className="text-sm text-[#06b6d4] font-bold">
                  {moodScore} / 10
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="w-28 accent-[#06b6d4] cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="One line why you feel this calm / grounded..."
                  value={moodWhy}
                  onChange={(e) => setMoodWhy(e.target.value)}
                  className="flex-1 bg-[#121215] border border-[#27272a] rounded-[4px] px-3 py-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Row 4: 3 Lines Journal */}
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                6. Journal (3 Lines: Did • Learned • Tomorrow #1)
              </span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="1. What I did today..."
                  value={journalDid}
                  onChange={(e) => setJournalDid(e.target.value)}
                  className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] px-3 py-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                />
                <input
                  type="text"
                  placeholder="2. What I learned today..."
                  value={journalLearned}
                  onChange={(e) => setJournalLearned(e.target.value)}
                  className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] px-3 py-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                />
                <input
                  type="text"
                  placeholder="3. Tomorrow's #1 task..."
                  value={journalTomorrow}
                  onChange={(e) => setJournalTomorrow(e.target.value)}
                  className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] px-3 py-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Row 5: What Did I Create Today */}
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                7. What Did I Create Today? (Creation Output)
              </span>
              <input
                type="text"
                placeholder="E.g. Modular payment gateway queue, blog post, PR merge..."
                value={createdToday}
                onChange={(e) => setCreatedToday(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] px-3 py-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
              />
            </div>

            {/* Discipline 0-10 */}
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                Rate Discipline (0–10):
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDisciplineInput(n)}
                    className={`w-7 h-7 rounded-[4px] text-xs font-mono font-semibold transition-all cursor-pointer ${disciplineInput === n
                      ? "bg-[#06b6d4] text-[#09090b] shadow-sm"
                      : "bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a]"
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-sm font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <ButtonSpinner />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                )}
                <span>{isSubmitting ? "Saving to Supabase..." : "Seal & Commit Cadence ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Sadhana Modal */}
        {/* Sadhana Modal */}
        {modalType === "sadhana" && (
          <form onSubmit={handleWorkoutSubmit} className="p-4 sm:p-5 flex flex-col gap-3.5 text-sm font-mono">
            {/* 3 Core Practices: Multi-select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
                  Select Sadhana Practices (Multi-Select)
                </label>
                <span className="text-xs text-[#06b6d4] font-medium">
                  {sadhanaPractices.length} of 4 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Surya Kriya */}
                {(() => {
                  const isSelected = sadhanaPractices.includes("surya_kriya");
                  return (
                    <div
                      key="surya_kriya"
                      onClick={() => toggleSadhanaPractice("surya_kriya")}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30"
                          : "bg-[#0e0e11] border-[#27272a] hover:border-[#3f3f46] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isSelected ? "bg-amber-500/20 text-amber-400" : "bg-[#18181b] text-[#71717a]"}`}>
                          <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? "text-amber-400" : "text-[#3f3f46]"}`}>
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-amber-200" : "text-[#d4d4d8]"}`}>
                          Surya Kriya
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5">
                          Solar Alignment &amp; Vitality
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Yogasanas */}
                {(() => {
                  const isSelected = sadhanaPractices.includes("yogasanas");
                  return (
                    <div
                      key="yogasanas"
                      onClick={() => toggleSadhanaPractice("yogasanas")}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30"
                          : "bg-[#0e0e11] border-[#27272a] hover:border-[#3f3f46] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-[#18181b] text-[#71717a]"}`}>
                          <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? "text-emerald-400" : "text-[#3f3f46]"}`}>
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-emerald-200" : "text-[#d4d4d8]"}`}>
                          Yogasanas
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5">
                          Postural Geometry &amp; Stillness
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Shambhavi Mahamudra */}
                {(() => {
                  const isSelected = sadhanaPractices.includes("shambhavi_mahamudra");
                  return (
                    <div
                      key="shambhavi_mahamudra"
                      onClick={() => toggleSadhanaPractice("shambhavi_mahamudra")}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/30"
                          : "bg-[#0e0e11] border-[#27272a] hover:border-[#3f3f46] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-[#18181b] text-[#71717a]"}`}>
                          <span className="material-symbols-outlined text-[18px]">psychology</span>
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? "text-cyan-400" : "text-[#3f3f46]"}`}>
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-cyan-200" : "text-[#d4d4d8]"}`}>
                          Shambhavi Mahamudra
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5">
                          Inner Energy &amp; 21-Min Kriya
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Preparatory Asanas */}
                {(() => {
                  const isSelected = sadhanaPractices.includes("preparatory_asanas");
                  return (
                    <div
                      key="preparatory_asanas"
                      onClick={() => toggleSadhanaPractice("preparatory_asanas")}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-rose-500/10 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/30"
                          : "bg-[#0e0e11] border-[#27272a] hover:border-[#3f3f46] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isSelected ? "bg-rose-500/20 text-rose-400" : "bg-[#18181b] text-[#71717a]"}`}>
                          <span className="material-symbols-outlined text-[18px]">exercise</span>
                        </div>
                        <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? "text-rose-400" : "text-[#3f3f46]"}`}>
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold tracking-tight ${isSelected ? "text-rose-200" : "text-[#d4d4d8]"}`}>
                          Preparatory Asanas
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5">
                          3-Exercise Warm-Up Set
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* DYNAMIC CONDITIONAL INPUTS: SURYA KRIYA & YOGASANAS */}
            {(sadhanaPractices.includes("surya_kriya") || sadhanaPractices.includes("yogasanas")) && (
              <div className={`grid gap-3 ${sadhanaPractices.includes("surya_kriya") && sadhanaPractices.includes("yogasanas") ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {/* Surya Kriya Count */}
                {sadhanaPractices.includes("surya_kriya") && (
                  <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs font-bold uppercase tracking-wider block text-amber-300 truncate">
                          Surya Kriya
                        </label>
                        <span className="text-[11px] text-[#a1a1aa] block font-mono">
                          {suryaKriyaCycles} {suryaKriyaCycles === 1 ? "cycle" : "cycles"}
                        </span>
                      </div>
                    </div>

                    {/* Compact Number Stepper */}
                    <div className="flex items-center bg-[#0e0e11] rounded-md border border-[#27272a] p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSuryaKriyaCycles(Math.max(1, suryaKriyaCycles - 1))}
                        className="w-7 h-7 rounded bg-[#18181b] hover:bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        aria-label="Decrease cycles"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={suryaKriyaCycles}
                        onChange={(e) => setSuryaKriyaCycles(Math.max(1, Number(e.target.value)))}
                        className="w-12 bg-transparent text-center text-sm text-white font-bold font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSuryaKriyaCycles(suryaKriyaCycles + 1)}
                        className="w-7 h-7 rounded bg-[#18181b] hover:bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        aria-label="Increase cycles"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Yogasanas Holding Count (in Seconds) */}
                {sadhanaPractices.includes("yogasanas") && (
                  <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs font-bold uppercase tracking-wider block text-emerald-300 truncate">
                          Asana Hold
                        </label>
                        <span className="text-[11px] text-[#a1a1aa] block font-mono">
                          {asanaHoldingCount}s per asana
                        </span>
                      </div>
                    </div>

                    {/* Compact Number Stepper */}
                    <div className="flex items-center bg-[#0e0e11] rounded-md border border-[#27272a] p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAsanaHoldingCount(Math.max(5, asanaHoldingCount - 5))}
                        className="w-7 h-7 rounded bg-[#18181b] hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        aria-label="Decrease hold time"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={asanaHoldingCount}
                        onChange={(e) => setAsanaHoldingCount(Math.max(5, Number(e.target.value)))}
                        className="w-14 bg-transparent text-center text-sm text-white font-bold font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setAsanaHoldingCount(asanaHoldingCount + 5)}
                        className="w-7 h-7 rounded bg-[#18181b] hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        aria-label="Increase hold time"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shambhavi Mahamudra Banner */}
            {sadhanaPractices.includes("shambhavi_mahamudra") && (
              <div className="px-3 py-2 bg-cyan-950/20 border border-cyan-500/30 rounded-lg flex items-center gap-2 text-xs text-cyan-300">
                <span className="material-symbols-outlined text-[18px] text-cyan-400 shrink-0">check_circle</span>
                <span>
                  <strong>Shambhavi Mahamudra Kriya:</strong> 21-min protocol active
                </span>
              </div>
            )}

            {/* Preparatory Asanas Banner */}
            {sadhanaPractices.includes("preparatory_asanas") && (
              <div className="px-3 py-2 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col gap-1.5 text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">check_circle</span>
                  <span>
                    <strong>Preparatory Asanas:</strong> 3-exercise warm-up set (~10 min)
                  </span>
                </div>
                <div className="ml-7 space-y-0.5 text-[11px] text-rose-300/70 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    <span>Neck Rotations &amp; Shoulder Rolls</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    <span>Spine Twists &amp; Cat-Cow Stretches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                    <span>Hip Openers &amp; Hamstring Warm-up</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Observations */}
            <div>
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-1">
                Notes &amp; Observations (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Dawn sequence, deep stillness"
                value={sadhanaNotes}
                onChange={(e) => setSadhanaNotes(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-white font-sans focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#1e1e24]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || sadhanaPractices.length === 0}
                className="px-5 py-2 rounded-[6px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <ButtonSpinner />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                )}
                <span>{isSubmitting ? "Saving..." : "Save Sadhana Session ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Sleep & Recovery Modal */}
        {modalType === "sleep" && (
          <form onSubmit={handleSleepSubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            {/* Start Date & End Date Interval */}
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#1e1e24] flex flex-col gap-3">
              <span className="text-xs uppercase text-[#a1a1aa] tracking-wider font-semibold">
                Sleep Interval (Start &amp; End Schedule)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Start Date & Bedtime */}
                <div className="bg-[#121215] p-3 rounded-[6px] border border-[#27272a] flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-[#06b6d4]">
                    <span className="material-symbols-outlined text-[18px]">bedtime</span>
                    <span className="text-xs uppercase font-bold tracking-wider">Start Date &amp; Bedtime</span>
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={sleepStartDate}
                      onChange={(e) => setSleepStartDate(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-[#27272a] rounded p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Bedtime (HH:MM)</label>
                    <input
                      type="time"
                      value={sleepStartTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setSleepStartTime(newTime);
                        if (newTime && sleepEndTime) {
                          const [sh, sm] = newTime.split(":").map(Number);
                          const [eh, em] = sleepEndTime.split(":").map(Number);
                          let diff = (eh * 60 + em) - (sh * 60 + sm);
                          if (diff <= 0) diff += 24 * 60;
                          setSleepLogHours(Math.floor(diff / 60));
                          setSleepLogMinutes(diff % 60);
                        }
                      }}
                      className="w-full bg-[#0a0a0c] border border-[#27272a] rounded p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                </div>

                {/* End Date & Wake Time */}
                <div className="bg-[#121215] p-3 rounded-[6px] border border-[#27272a] flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-[#10b981]">
                    <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                    <span className="text-xs uppercase font-bold tracking-wider">End Date &amp; Wake Time</span>
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">End Date</label>
                    <input
                      type="date"
                      value={sleepEndDate}
                      onChange={(e) => setSleepEndDate(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-[#27272a] rounded p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a1a1aa] block mb-1">Wake Time (HH:MM)</label>
                    <input
                      type="time"
                      value={sleepEndTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setSleepEndTime(newTime);
                        if (sleepStartTime && newTime) {
                          const [sh, sm] = sleepStartTime.split(":").map(Number);
                          const [eh, em] = newTime.split(":").map(Number);
                          let diff = (eh * 60 + em) - (sh * 60 + sm);
                          if (diff <= 0) diff += 24 * 60;
                          setSleepLogHours(Math.floor(diff / 60));
                          setSleepLogMinutes(diff % 60);
                        }
                      }}
                      className="w-full bg-[#0a0a0c] border border-[#27272a] rounded p-2 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#a1a1aa] uppercase font-semibold tracking-wider">
                  Total Sleep Duration
                </label>
                <span className="text-sm text-[#06b6d4] font-bold font-mono">
                  {sleepLogHours}h {sleepLogMinutes}m ({Number(sleepLogHours) * 60 + Number(sleepLogMinutes)} mins)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a1a1aa] block mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="1"
                    value={sleepLogHours}
                    onChange={(e) => setSleepLogHours(Number(e.target.value))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-[#a1a1aa] block mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={sleepLogMinutes}
                    onChange={(e) => setSleepLogMinutes(Number(e.target.value))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                    required
                  />
                </div>
              </div>
              {/* Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-xs text-[#71717a]">Presets:</span>
                {[
                  { label: "6h 0m", h: 6, m: 0 },
                  { label: "7h 0m", h: 7, m: 0 },
                  { label: "7h 30m", h: 7, m: 30 },
                  { label: "8h 0m", h: 8, m: 0 },
                  { label: "8h 30m", h: 8, m: 30 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSleepLogHours(preset.h);
                      setSleepLogMinutes(preset.m);
                    }}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-mono border transition-colors cursor-pointer ${sleepLogHours === preset.h && sleepLogMinutes === preset.m
                      ? "bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4] font-bold"
                      : "bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Restorative Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#a1a1aa] uppercase font-semibold tracking-wider">
                  Restorative Quality Score (0–100)
                </label>
                <span className="text-sm text-[#10b981] font-bold font-mono">
                  {sleepLogScore} / 100
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sleepLogScore}
                  onChange={(e) => setSleepLogScore(Number(e.target.value))}
                  className="flex-1 accent-[#10b981] cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sleepLogScore}
                  onChange={(e) => setSleepLogScore(Number(e.target.value))}
                  className="w-20 bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2 text-center text-sm text-[#10b981] font-bold focus:border-[#06b6d4] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <ButtonSpinner />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">bedtime</span>
                )}
                <span>{isSubmitting ? "Saving..." : "Save Sleep Telemetry ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Deep Work Modal */}
        {modalType === "deepwork" && (
          <form onSubmit={handleDeepWorkSubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            {/* Live Timer Option */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-300 block">Want to track live instead?</span>
                <span className="text-[11px] text-[#a1a1aa] font-sans">Start the focus stopwatch and auto-log when finished.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  startDeepWorkTimer(deepTopic || "Engineering Income Work", deepDesc);
                  setModalOpen(false);
                }}
                className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                <span>Start Live Timer</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">
                Deep Work Topic (Income Work)
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems & Go Concurrency"
                value={deepTopic}
                onChange={(e) => setDeepTopic(e.target.value)}
                required
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">
                Session Scope &amp; Deliverables
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Engineered payment gateway latency mitigation and queue backpressure."
                value={deepDesc}
                onChange={(e) => setDeepDesc(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] font-sans focus:border-[#06b6d4] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={deepMins}
                  onChange={(e) => setDeepMins(Number(e.target.value))}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-1.5">
                  Key Technical Insight
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buffered channels disguise system backpressure..."
                  value={deepInsight}
                  onChange={(e) => setDeepInsight(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] font-sans focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <ButtonSpinner />}
                <span>{isSubmitting ? "Saving..." : "Save Deep Work Session ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Reading Modal */}
        {modalType === "reading" && (() => {
          const selectedBook = state?.books?.find((b) => b.id === readingBookId)
            || state?.books?.find((b) => b.title.toLowerCase() === readingBookTitle.toLowerCase())
            || state?.currentBook;
          const pagesDelta = Number(endPage) === Number(startPage) && Number(endPage) > 0 ? 1 : Math.max(0, Number(endPage) - Number(startPage));

          return (
            <form onSubmit={handleReadingSubmit} className="p-6 text-sm font-mono">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* LEFT SIDE: Necessary inputs */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {/* Book Picker / Title Input */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-1.5 flex items-center justify-between">
                      <span>Book Title *</span>
                      {state?.books && state.books.length > 0 && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {state.books.length} in vault
                        </span>
                      )}
                    </label>

                    {state?.books && state.books.length > 0 ? (
                      <div className="space-y-2">
                        <select
                          value={readingBookId}
                          onChange={(e) => {
                            const bId = e.target.value;
                            setReadingBookId(bId);
                            const b = state?.books?.find((x) => x.id === bId);
                            if (b) {
                              setReadingBookTitle(b.title);
                              setReadingAuthor(b.author || "");
                              if (b.currentPage) {
                                setStartPage(b.currentPage);
                                setEndPage(b.currentPage + 15);
                              }
                            }
                          }}
                          className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans cursor-pointer"
                        >
                          <option value="">Select from library...</option>
                          {state.books.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.title} {b.author ? `— ${b.author}` : ""} {b.isCompleted ? "(Completed)" : ""}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type book title..."
                          value={readingBookTitle}
                          onChange={(e) => {
                            setReadingBookTitle(e.target.value);
                            const match = state?.books?.find((x) => x.title.toLowerCase() === e.target.value.toLowerCase());
                            if (match) {
                              setReadingBookId(match.id);
                              setReadingAuthor(match.author || "");
                            }
                          }}
                          className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        value={readingBookTitle}
                        onChange={(e) => setReadingBookTitle(e.target.value)}
                        className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-1.5">
                      Author
                    </label>
                    <input
                      type="text"
                      value={readingAuthor}
                      onChange={(e) => setReadingAuthor(e.target.value)}
                      className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-1.5">
                        Start Page *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={startPage}
                        onChange={(e) => setStartPage(Number(e.target.value))}
                        className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-1.5">
                        End Page *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={endPage}
                        onChange={(e) => setEndPage(Number(e.target.value))}
                        className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                      />
                    </div>
                  </div>

                  {pagesDelta > 0 && (
                    <div className="p-2.5 rounded-[6px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                      <span>Reading Volume:</span>
                      <span className="font-bold text-sm">+{pagesDelta} Pages</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] block mb-1.5">
                      Core Philosophical Quote / Reflection
                    </label>
                    <textarea
                      rows={2}
                      placeholder="You have power over your mind - not outside events. Realize this, and you will find strength."
                      value={readingQuote}
                      onChange={(e) => setReadingQuote(e.target.value)}
                      className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] font-sans focus:border-[#06b6d4] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting && <ButtonSpinner />}
                      <span>{isSubmitting ? "Saving..." : "Commit Reading ⏎"}</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE: Big picture of book */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-[#0a0a0d] border border-[#27272a] rounded-[8px] text-center relative overflow-hidden">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5 self-start">
                    <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    <span>Book Cover</span>
                  </span>

                  {/* Large Picture */}
                  <div className="w-44 h-64 sm:w-48 sm:h-72 rounded-xl overflow-hidden shadow-2xl border border-white/15 relative flex items-center justify-center bg-zinc-950">
                    {selectedBook?.imageUrl ? (
                      <img
                        src={selectedBook.imageUrl}
                        alt={readingBookTitle || "Book"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 to-black text-zinc-400">
                        <span className="material-symbols-outlined text-[32px] text-cyan-400/70 mb-2">
                          auto_stories
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-3 mb-1">
                          {readingBookTitle || "Reading Session"}
                        </h4>
                        {readingAuthor && (
                          <p className="text-[10px] text-zinc-400 line-clamp-1">{readingAuthor}</p>
                        )}
                      </div>
                    )}

                    {selectedBook?.isCompleted && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                        <span className="material-symbols-outlined text-[13px]">check</span>
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata below picture */}
                  <div className="mt-3 w-full">
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {readingBookTitle || "Book"}
                    </h4>
                    {readingAuthor && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{readingAuthor}</p>
                    )}

                    {selectedBook && (selectedBook.totalPages ?? 0) > 0 && (
                      <div className="mt-3 bg-[#121215] p-2.5 rounded border border-[#27272a] text-left">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-zinc-400">Progress</span>
                          <span className="text-cyan-400 font-semibold">{selectedBook.pctCompleted ?? 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(3, selectedBook.pctCompleted ?? 0))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1.5">
                          <span>Page {selectedBook.currentPage || 0} / {selectedBook.totalPages}</span>
                          <span>{selectedBook.pagesRemaining ?? 0}p left</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          );
        })()}

        {/* Deposit Modal */}
        {modalType === "deposit" && (
          <form onSubmit={handleDepositSubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            <div>
              <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                Deposit Amount ($ USD)
              </label>
              <input
                type="number"
                placeholder="350"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-base text-[#10b981] font-bold focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                Allocation Note
              </label>
              <input
                type="text"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <ButtonSpinner />}
                <span>{isSubmitting ? "Allocating..." : "Record Sovereignty Deposit ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Expense Modal */}
        {modalType === "expense" && (
          <form onSubmit={handleExpenseSubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            <div>
              <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                Expense Title / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Organic Groceries & Sattvic Fuel"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                  Amount in ₹ (INR)
                </label>
                <input
                  type="number"
                  placeholder="550"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                >
                  <option value="food">food (Sattvic &amp; Groceries)</option>
                  <option value="books">books (Philosophy)</option>
                  <option value="transport">transport &amp; Fuel</option>
                  <option value="utilities">utilities &amp; Gear</option>
                  <option value="general">general</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <ButtonSpinner />}
                <span>{isSubmitting ? "Logging..." : "Log ₹ Spend ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Add Money Modal */}
        {modalType === "add_money" && (
          <form onSubmit={handleAddMoneySubmit} className="p-6 flex flex-col gap-4 text-sm font-mono">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider">
                  Amount to Add in ₹ (INR)
                </label>
                <span className="text-xs text-emerald-400 font-bold">
                  {addMoneyAmount ? `+₹${Number(addMoneyAmount).toLocaleString()}` : "Inflow"}
                </span>
              </div>
              <input
                type="number"
                placeholder="500"
                min="1"
                step="any"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-lg font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-xs text-[#71717a]">Quick:</span>
                {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddMoneyAmount(String(amt))}
                    className={`px-2 py-0.5 rounded-[4px] text-xs font-mono border transition-colors cursor-pointer ${
                      addMoneyAmount === String(amt)
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]"
                    }`}
                  >
                    +₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                Source / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Top-Up, Allowance, Freelance Gig, Bonus"
                value={addMoneyTitle}
                onChange={(e) => setAddMoneyTitle(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-emerald-500 focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-[#a1a1aa] tracking-wider block mb-1.5">
                Classification / Category
              </label>
              <select
                value={addMoneyCategory}
                onChange={(e) => setAddMoneyCategory(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[6px] p-2.5 text-sm text-[#f4f4f5] focus:border-emerald-500 focus:outline-none"
              >
                <option value="income">Income &amp; Direct Earnings</option>
                <option value="allowance">Monthly Allowance / Pocket Money</option>
                <option value="freelance">Freelance &amp; Client Payment</option>
                <option value="bonus">Bonus &amp; Incentives</option>
                <option value="gift">Gift / Family Transfer</option>
                <option value="refund">Reimbursement &amp; Refund</option>
                <option value="general">General / Other Top-Up</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-[6px] bg-emerald-500 text-[#09090b] font-bold text-sm hover:bg-emerald-400 transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <ButtonSpinner />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                )}
                <span>{isSubmitting ? "Adding..." : "Add Money to Pool ⏎"}</span>
              </button>
            </div>
          </form>
        )}

        {/* DB Settings */}
        {modalType === "db_settings" && (
          <div className="p-6 flex flex-col gap-4 text-sm font-mono">
            <div className="p-3.5 bg-[#0e0e11] rounded-[6px] border border-[#27272a] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-[#a1a1aa] font-semibold tracking-wider">
                  Supabase &amp; Drizzle Connection Status
                </span>
                <span className="px-2.5 py-0.5 rounded-[4px] text-xs font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-[#d4d4d8] leading-relaxed">
                {dbStatus?.message || "Successfully connected to Supabase PostgreSQL via Drizzle ORM!"}
              </p>
              {dbStatus?.dbUrlMasked && (
                <div className="text-xs text-[#71717a] truncate font-mono">
                  Configured: {dbStatus.dbUrlMasked}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => checkDbStatus()}
                className="px-4 py-2 rounded-[6px] bg-[#18181b] border border-[#27272a] hover:border-[#06b6d4]/50 text-[#06b6d4] text-sm font-semibold transition-colors cursor-pointer"
              >
                Re-test Connection
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-[6px] bg-[#f4f4f5] text-[#09090b] font-bold text-sm hover:bg-white transition-all cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
