"use client";

import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";

export default function QuickAddModal() {
  const {
    modalOpen,
    setModalOpen,
    savedPages,
    addReadingPages,
    addLedgerEntry,
  } = useLifeOS();
  const [pagesRead, setPagesRead] = useState(35);
  const [insight, setInsight] = useState(
    "“You have power over your mind - not outside events. Realize this, and you will find strength.”",
  );
  const [selectedBook, setSelectedBook] = useState(
    "Meditations — Marcus Aurelius",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!modalOpen) return null;

  const totalPages = 254;
  const currentTotal = Math.min(savedPages + pagesRead, totalPages);
  const pct = Math.round((currentTotal / totalPages) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addReadingPages(pagesRead);
      addLedgerEntry({
        time: "Just Now",
        duration: "45 min",
        category: "svadhyaya",
        title: `Svādhyāya: ${selectedBook}`,
        description: insight,
        metric: `+${pagesRead} pages (reached p.${currentTotal})`,
      });
      setIsSubmitting(false);
      setModalOpen(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-container-lowest/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-container rounded-xl shadow-2xl overflow-hidden border border-cyan-500/30 my-auto">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="px-6 pt-5 pb-4 flex items-start justify-between bg-surface-container-low border-b border-outline-variant/40">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base text-on-surface font-semibold tracking-tight">
                Quick Log Entry • Protocol v2.5
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Select vector to commit immediate entry into today&apos;s ledger
            </p>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-outline">
              Selected Codex / Treatise
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-lg text-xs font-mono text-on-surface px-3 py-2.5 border border-outline-variant focus:border-cyan-500 focus:outline-none"
            >
              <option value="Meditations — Marcus Aurelius">
                Meditations — Marcus Aurelius (Hays Translation)
              </option>
              <option value="Atomic Habits — James Clear">
                Atomic Habits — James Clear
              </option>
              <option value="The Bhagavad Gita — Eknath Easwaran">
                The Bhagavad Gita — Eknath Easwaran
              </option>
              <option value="Deep Work — Cal Newport">
                Deep Work — Cal Newport
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono uppercase text-outline">
                  Pages Read Today
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  +15 min pace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Number(e.target.value))}
                  className="w-20 bg-surface-container-lowest rounded text-lg font-mono text-on-surface px-2 py-1 text-center border border-outline-variant"
                />
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setPagesRead((p) => p + 5)}
                    className="px-2 py-1 bg-surface-container-high rounded hover:bg-surface-bright"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => setPagesRead((p) => p + 10)}
                    className="px-2 py-1 bg-surface-container-high rounded hover:bg-surface-bright"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono uppercase text-outline">
                  Current Progress
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {pct}% Finished
                </span>
              </div>
              <div className="text-xl font-mono text-on-surface my-1">
                {currentTotal}{" "}
                <span className="text-xs text-outline">/ {totalPages} p.</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-amber-400">
                edit_note
              </span>
              Philosophical Insight (Obsidian Vault Sync)
            </label>
            <textarea
              rows={2}
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface border border-outline-variant focus:border-cyan-500 focus:outline-none resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#002b33] font-semibold text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                done_all
              </span>
              <span>
                {isSubmitting ? "Committing..." : "Commit & Seal Entry ⏎"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
