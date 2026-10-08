"use client";

import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import DailyTimeAuditSection from "@/components/DailyTimeAuditSection";

export default function JournalPage() {
  const {
    state,
    selectedDate,
    openModal,
    logJournal,
  } = useLifeOS();

  const journal = state?.journal;
  const reading = state?.readingToday;

  // Local state for editing creation & reflection
  const [creationText, setCreationText] = useState("");
  const [frictionText, setFrictionText] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [didText, setDidText] = useState("");
  const [learnedText, setLearnedText] = useState("");
  const [tomorrowText, setTomorrowText] = useState("");

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (journal) {
      setCreationText(journal.creation || "");
      setFrictionText(journal.frictionLesson || "");
      setReflectionText(journal.eveningReflection || "");
      setDidText(journal.threeLines?.did || "");
      setLearnedText(journal.threeLines?.learned || "");
      setTomorrowText(journal.threeLines?.tomorrow || "");
    }
  }, [journal]);

  const handleSaveAll = async () => {
    if (creationText) await logJournal("creation", creationText);
    if (frictionText) await logJournal("friction_lesson", frictionText);
    if (reflectionText) await logJournal("evening_reflection", reflectionText);
    await logJournal("three_lines", {
      did: didText,
      learned: learnedText,
      tomorrow: tomorrowText,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1000);
  };

  const formatDateLabel = (dStr: string) => {
    try {
      const d = new Date(dStr + "T00:00:00Z");
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e1e24] font-mono text-xs gap-3">
        <div>
          <h1 className="text-base text-[#f4f4f5] font-semibold font-sans tracking-tight">
            Journaling, Creation &amp; Reading Vault
          </h1>
          <p className="text-[#a1a1aa] text-[11px] mt-0.5">
            Date: {formatDateLabel(selectedDate)} • Synchronized with Supabase &amp; Obsidian
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-[#10b981] font-mono text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span>
              Vault Updated
            </span>
          )}
          <button
            onClick={() => openModal("reading")}
            className="px-3 py-1.5 rounded-[4px] bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] text-xs font-mono transition-colors"
          >
            Log Reading Session
          </button>
          <button
            onClick={handleSaveAll}
            className="px-3.5 py-1.5 rounded-[4px] bg-[#f4f4f5] text-[#09090b] font-semibold text-xs font-mono hover:bg-[#e4e4e7] transition-all"
          >
            Commit Entries ⏎
          </button>
        </div>
      </div>

      {/* Grid: Creation Today & Reading / Reading Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* What Did I Create Today */}
        <section className="lg:col-span-7 bg-[#121215] p-5 sm:p-6 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">
                  terminal
                </span>
                <h2 className="text-xs font-mono uppercase text-[#f4f4f5] font-semibold tracking-wider">
                  What Did I Create Today? (Creation Output)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#10b981] px-1.5 py-0.5 rounded-[2px] bg-[#10b981]/10 border border-[#10b981]/20">
                Engineering Output
              </span>
            </div>

            <div className="my-4">
              <textarea
                rows={4}
                value={creationText}
                onChange={(e) => setCreationText(e.target.value)}
                placeholder="Log exactly what artifact, code, PR, or architecture you shipped today..."
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>
          </div>

          <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] text-[11px] font-mono text-[#a1a1aa] flex justify-between items-center">
            <span>Obsidian Sync Tag: #creation-log</span>
            <span className="text-[#06b6d4]">Saved in Supabase</span>
          </div>
        </section>

        {/* Reading & Philosophy */}
        <section className="lg:col-span-5 bg-[#121215] p-5 sm:p-6 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">
                  menu_book
                </span>
                <h2 className="text-xs font-mono uppercase text-[#f4f4f5] font-semibold tracking-wider">
                  Book Reading
                </h2>
              </div>
              <button
                onClick={() => openModal("reading")}
                className="text-[10px] font-mono text-[#06b6d4] hover:underline"
              >
                + Update
              </button>
            </div>

            {reading ? (
              <div className="my-3">
                <h3 className="text-sm font-semibold text-[#f4f4f5]">
                  {reading.bookTitle}
                </h3>
                <p className="text-xs text-[#a1a1aa] font-mono">{reading.author}</p>

                <div className="my-3 p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24]">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#71717a]">Progress:</span>
                    <span className="text-[#06b6d4]">
                      Page {reading.endPage} of {reading.totalPages}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#10b981] mt-2">
                    <span>+{reading.pagesRead} pages read on {selectedDate}</span>
                    <span>{reading.durationMinutes} min session</span>
                  </div>
                </div>

                {reading.insightQuote && (
                  <blockquote className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] text-xs text-[#f4f4f5] font-sans italic border-l-2 border-l-[#06b6d4]">
                    &ldquo;{reading.insightQuote}&rdquo;
                  </blockquote>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[#71717a]">
                No reading session logged for {selectedDate}.
                <button
                  onClick={() => openModal("reading")}
                  className="mt-3 block mx-auto px-3 py-1 bg-[#18181b] border border-[#27272a] text-[#06b6d4] rounded"
                >
                  Log Reading
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-[#71717a] truncate">
            Vault Path: {reading?.vaultPath || "/LifeOS/Readings"}
          </div>
        </section>
      </div>
 
      {/* 24-Hour Whole Day Time Log & Life Coach Audit */}
      <DailyTimeAuditSection />

      {/* Daily 3-Line Journal Box */}
      <div className="bg-[#121215] p-5 sm:p-6 rounded-[4px] border border-[#1e1e24]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">
              edit_note
            </span>
            <h2 className="text-xs font-mono uppercase text-[#f4f4f5] font-semibold tracking-wider">
              Daily 3-Line Journal Core
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717a]">
            What I Did • What I Learned • Tomorrow&apos;s #1 Task
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#06b6d4] font-semibold block mb-1">
                Line 1: What I Did Today
              </span>
              <textarea
                rows={3}
                value={didText}
                onChange={(e) => setDidText(e.target.value)}
                placeholder="What did you complete today?"
                className="w-full bg-transparent border-none text-xs text-[#f4f4f5] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#10b981] font-semibold block mb-1">
                Line 2: What I Learned Today
              </span>
              <textarea
                rows={3}
                value={learnedText}
                onChange={(e) => setLearnedText(e.target.value)}
                placeholder="Core insight or technical lesson?"
                className="w-full bg-transparent border-none text-xs text-[#f4f4f5] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#f59e0b] font-semibold block mb-1">
                Line 3: Tomorrow&apos;s #1 Task
              </span>
              <textarea
                rows={3}
                value={tomorrowText}
                onChange={(e) => setTomorrowText(e.target.value)}
                placeholder="Single highest-leverage task for tomorrow?"
                className="w-full bg-transparent border-none text-xs text-[#f4f4f5] focus:outline-none font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Friction Lessons & Evening Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div className="pb-3 border-b border-[#1e1e24] mb-3">
            <span className="text-[10px] font-mono uppercase text-[#f59e0b] font-semibold">
              Friction Lesson
            </span>
            <h3 className="text-sm font-semibold text-[#f4f4f5]">
              Protocol Friction Captured
            </h3>
          </div>
          <textarea
            rows={3}
            value={frictionText}
            onChange={(e) => setFrictionText(e.target.value)}
            placeholder="Record behavioral friction, triggers, or leaks..."
            className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
          />
        </div>

        <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div className="pb-3 border-b border-[#1e1e24] mb-3">
            <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold">
              Evening Reflection
            </span>
            <h3 className="text-sm font-semibold text-[#f4f4f5]">
              Closing Equanimity &amp; Grounding
            </h3>
          </div>
          <textarea
            rows={3}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Evening stillness and closure reflection..."
            className="w-full bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-3 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans leading-relaxed resize-none"
          />
        </div>
      </div>
    </div>
  );
}
