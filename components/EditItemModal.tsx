"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

export default function EditItemModal() {
  const {
    editModal,
    closeEditModal,
    editWorkout,
    editDeepWork,
    editReading,
    editSleep,
    editExpense,
    editJournal,
    updateCustomGoal,
    updateFundTarget,
    addDeposit,
    logBrahmacharya,
    notify,
  } = useLifeOS();

  // Local state for the editable fields
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editModal && editModal.data) {
      setFormData({ ...editModal.data });
    } else {
      setFormData({});
    }
  }, [editModal]);

  useEffect(() => {
    if (!editModal || !editModal.type) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeEditModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editModal, closeEditModal]);

  if (!editModal || !editModal.type) return null;

  const { type, id } = editModal;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (type === "workout") {
        const activePractices = Array.isArray(formData.practices) && formData.practices.length > 0
          ? formData.practices
          : [formData.type || "surya_kriya"];
        const skCycles = activePractices.includes("surya_kriya") ? Number(formData.suryaKriyaCycles ?? formData.cycles ?? 3) : 0;
        const asanaHold = activePractices.includes("yogasanas") ? Number(formData.asanaHoldingCount ?? 6) : null;

        await editWorkout(id || "latest", {
          type: activePractices.length === 1 ? activePractices[0] : "sadhana_combo",
          description: formData.description || "Sadhana Protocol",
          durationMinutes: Number(formData.durationMinutes) || 45,
          cycles: skCycles,
          suryaKriyaCycles: skCycles,
          asanaHoldingCount: asanaHold,
          practices: activePractices,
          quality: formData.quality || "Zone 3/4 Physical",
        });
      } else if (type === "deepwork") {
        await editDeepWork(id || "latest", {
          topic: formData.topic || "Systems Engineering",
          description: formData.description || "",
          durationMinutes: Number(formData.durationMinutes) || 180,
          quality: formData.quality || "Session Verified",
          keyInsight: formData.keyInsight || "",
          referenceLink: formData.referenceLink || "",
        });
      } else if (type === "reading") {
        await editReading(id || "latest", {
          bookTitle: formData.bookTitle || "Meditations",
          author: formData.author || "Marcus Aurelius",
          startPage: Number(formData.startPage) || 1,
          endPage: Number(formData.endPage) || 30,
          durationMinutes: Number(formData.durationMinutes) || 45,
          insightQuote: formData.insightQuote || "",
          vaultPath: formData.vaultPath || "",
        });
      } else if (type === "sleep") {
        await editSleep(id || "latest", {
          startDate: formData.startDate,
          endDate: formData.endDate,
          durationMinutes: Number(formData.durationMinutes) || 465,
          quality: Number(formData.quality) || 86,
        });
      } else if (type === "expense") {
        await editExpense(id || "latest", {
          title: formData.title || "Expense",
          amount: Number(formData.amount) || 0,
          category: formData.category || "daily",
          isEssential: formData.isEssential ?? true,
        });
      } else if (type === "custom_goal") {
        await updateCustomGoal(id || "", {
          title: formData.title,
          category: formData.category,
          targetValue: Number(formData.targetValue),
          currentValue: Number(formData.currentValue),
          unit: formData.unit,
          targetDate: formData.targetDate,
        });
      } else if (type === "journal") {
        await editJournal(id || "latest", formData.content || "");
      } else if (type === "pune_fund") {
        if (formData.target) {
          await updateFundTarget(Number(formData.target));
        }
        if (formData.depositAmount && Number(formData.depositAmount) > 0) {
          await addDeposit(Number(formData.depositAmount), formData.depositNote || "Direct deposit");
        }
      } else if (type === "brahmacharya") {
        await logBrahmacharya(
          formData.isCleanToday !== false,
          Number(formData.urgesToday) || 0,
          formData.notesToday || "Updated vitality record"
        );
      }
      closeEditModal();
    } catch (err) {
      console.error(err);
      notify("Failed to save changes", "Database request failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "workout":
        return "Edit Sadhana Session";
      case "deepwork":
        return "Edit Deep Work Focus Block";
      case "reading":
        return "Edit Book Reading Session";
      case "sleep":
        return "Edit Sleep & Recovery Telemetry";
      case "expense":
        return "Edit Financial Ledger Entry";
      case "custom_goal":
        return "Edit Tactical Milestone / Goal";
      case "journal":
        return "Edit Thought Capture Reflection";
      case "pune_fund":
        return "Edit Pune Horizon & Sovereignty Fund";
      case "brahmacharya":
        return "Edit Vitality & Brahmacharya State";
      default:
        return "Edit Protocol Entry";
    }
  };

  return (
    <Dialog open={Boolean(editModal?.type)} onOpenChange={(open) => { if (!open) closeEditModal(); }}>
      <DialogContent className={`bg-surface-container-low border border-outline-variant/80 p-0 overflow-hidden max-h-[82vh] sm:max-h-[80vh] flex flex-col ${type === "sleep" ? "max-w-2xl" : "max-w-md"}`}>
        <DialogHeader className="p-3.5 sm:p-4 border-b border-outline-variant/60 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
            <DialogTitle className="text-sm sm:text-base font-bold text-on-surface">{getTitle()}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 text-xs font-mono">
          {/* WORKOUT */}
          {type === "workout" && (() => {
            const currentPractices: string[] = Array.isArray(formData.practices)
              ? formData.practices
              : formData.type === "sadhana_combo"
              ? ["surya_kriya", "yogasanas"]
              : [formData.type || "surya_kriya"];

            const togglePractice = (pId: string) => {
              let updated: string[];
              if (currentPractices.includes(pId)) {
                if (currentPractices.length === 1) return;
                updated = currentPractices.filter((p) => p !== pId);
              } else {
                updated = [...currentPractices, pId];
              }
              handleChange("practices", updated);
            };

            const hasSK = currentPractices.includes("surya_kriya");
            const hasYog = currentPractices.includes("yogasanas");
            const hasSham = currentPractices.includes("shambhavi_mahamudra");

            return (
              <>
                {/* 3 Core Practices Toggle */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-2">
                    Sadhana Practices (Multi-Select)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => togglePractice("surya_kriya")}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        hasSK
                          ? "bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold ring-1 ring-amber-500/30"
                          : "bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                        <span>Surya Kriya</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePractice("yogasanas")}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        hasYog
                          ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-bold ring-1 ring-emerald-500/30"
                          : "bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">self_improvement</span>
                        <span>Yogasanas</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePractice("shambhavi_mahamudra")}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        hasSham
                          ? "bg-cyan-500/15 border-cyan-500/60 text-cyan-300 font-bold ring-1 ring-cyan-500/30"
                          : "bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        <span>Shambhavi</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Conditional Dynamic Inputs */}
                {(hasSK || hasYog) && (
                  <div className={`grid gap-3 ${hasSK && hasYog ? "grid-cols-2" : "grid-cols-1"}`}>
                    {hasSK && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                            Surya Kriya Cycles
                          </label>
                          <span className="text-[11px] font-mono text-amber-400 font-bold">
                            {formData.suryaKriyaCycles ?? formData.cycles ?? 3} cycles
                          </span>
                        </div>
                        {/* Preset Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-amber-300/80 uppercase tracking-wider mr-1">
                            Cycles:
                          </span>
                          {[1, 3, 6, 7, 9, 11, 12].map((cycleVal) => {
                            const currentVal = formData.suryaKriyaCycles ?? formData.cycles ?? 3;
                            return (
                              <button
                                key={cycleVal}
                                type="button"
                                onClick={() => {
                                  handleChange("suryaKriyaCycles", cycleVal);
                                  handleChange("cycles", cycleVal);
                                }}
                                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                                  currentVal === cycleVal
                                    ? "bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                    : "bg-surface-container border border-amber-500/30 text-amber-200 hover:bg-amber-500/20"
                                }`}
                              >
                                {cycleVal}
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={formData.suryaKriyaCycles ?? formData.cycles ?? 3}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleChange("suryaKriyaCycles", val);
                            handleChange("cycles", val);
                          }}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-amber-400 font-bold font-mono"
                        />
                      </div>
                    )}

                    {hasYog && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                          Hold of Each Asana (Seconds)
                        </label>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={formData.asanaHoldingCount ?? 30}
                          onChange={(e) => handleChange("asanaHoldingCount", Number(e.target.value))}
                          className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-400 font-bold"
                          placeholder="30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {hasSham && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-cyan-400">check_circle</span>
                    <span>Shambhavi Mahamudra Kriya (Sacred protocol active)</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    Sadhana Description / Notes
                  </label>
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Surya Kriya (3c) • Yogasanas (30s hold)"
                  />
                </div>
              </>
            );
          })()}

          {/* DEEP WORK */}
          {type === "deepwork" && (
            <>
              <div>
                <label className="text-on-surface-variant block mb-1">Domain / Topic</label>
                <input
                  type="text"
                  value={formData.topic || ""}
                  onChange={(e) => handleChange("topic", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="e.g. Distributed Systems & Go Concurrency"
                  required
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">Session Description / Architecture</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes ?? 210}
                    onChange={(e) => handleChange("durationMinutes", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Quality Benchmark</label>
                  <input
                    type="text"
                    value={formData.quality || "Session Verified"}
                    onChange={(e) => handleChange("quality", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">Key Technical Insight</label>
                <textarea
                  value={formData.keyInsight || ""}
                  onChange={(e) => handleChange("keyInsight", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary resize-none"
                  rows={2}
                  placeholder="Key principle or architectural insight captured..."
                />
              </div>
            </>
          )}

          {/* READING */}
          {type === "reading" && (
            <>
              <div>
                <label className="text-on-surface-variant block mb-1">Book Title</label>
                <input
                  type="text"
                  value={formData.bookTitle || ""}
                  onChange={(e) => handleChange("bookTitle", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">Author / Translation</label>
                <input
                  type="text"
                  value={formData.author || ""}
                  onChange={(e) => handleChange("author", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Start Page</label>
                  <input
                    type="number"
                    value={formData.startPage ?? ""}
                    onChange={(e) => handleChange("startPage", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">End Page</label>
                  <input
                    type="number"
                    value={formData.endPage ?? ""}
                    onChange={(e) => handleChange("endPage", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">Stoic / Philosophical Quotation</label>
                <textarea
                  value={formData.insightQuote || ""}
                  onChange={(e) => handleChange("insightQuote", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary resize-none"
                  rows={2}
                  placeholder="Quotation captured..."
                />
              </div>
            </>
          )}

          {/* SLEEP */}
          {type === "sleep" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">Start Date (Bedtime Date)</label>
                  <DatePicker
                    value={formData.startDate ?? ""}
                    onChange={(val) => handleChange("startDate", val)}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">End Date (Wake Date)</label>
                  <DatePicker
                    value={formData.endDate ?? ""}
                    onChange={(val) => handleChange("endDate", val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">Total Sleep (Minutes)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes ?? ""}
                    onChange={(e) => handleChange("durationMinutes", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 450 (7h 30m)"
                    required
                  />
                  {formData.durationMinutes ? (
                    <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                      = {Math.floor(formData.durationMinutes / 60)}h {formData.durationMinutes % 60}m
                    </span>
                  ) : null}
                </div>
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">Restorative Ratio (%)</label>
                  <input
                    type="number"
                    value={formData.quality ?? ""}
                    onChange={(e) => handleChange("quality", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    min="0"
                    max="100"
                    placeholder="e.g. 85"
                  />
                </div>
              </div>
            </>
          )}

          {/* EXPENSE */}
          {type === "expense" && (
            <>
              <div>
                <label className="text-on-surface-variant block mb-1">Description / Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="e.g. Organic Groceries & Sattvic Fuel"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount ?? ""}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. 550"
                    required
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Category</label>
                  <select
                    value={formData.category || "food"}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="food">Sattvic Food / Fuel</option>
                    <option value="books">Books & Philosophy</option>
                    <option value="tools">Software & Tools</option>
                    <option value="living">Living & Utilities</option>
                    <option value="other">Other / Discretionary</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* CUSTOM GOAL */}
          {type === "custom_goal" && (
            <>
              <div>
                <label className="text-on-surface-variant block mb-1">Milestone / Goal Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="e.g. Master Go & Raft"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Domain Pillar</label>
                  <select
                    value={formData.category || "Engineering Craft"}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Engineering Craft">Engineering Craft</option>
                    <option value="Sovereign Wealth">Sovereign Wealth</option>
                    <option value="Physical Mastery">Physical Mastery</option>
                    <option value="Wisdom">Wisdom</option>
                  </select>
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Target Date</label>
                  <input
                    type="text"
                    value={formData.targetDate || ""}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="e.g. Dec 2026"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Current</label>
                  <input
                    type="number"
                    value={formData.currentValue ?? 65}
                    onChange={(e) => handleChange("currentValue", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Target</label>
                  <input
                    type="number"
                    value={formData.targetValue ?? 100}
                    onChange={(e) => handleChange("targetValue", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit || "%"}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="%, $, days"
                  />
                </div>
              </div>
            </>
          )}

          {/* PUNE FUND */}
          {type === "pune_fund" && (
            <>
              <div>
                <label className="text-on-surface-variant block mb-1">Fund Target Cap ($ USD)</label>
                <input
                  type="number"
                  value={formData.target ?? 5000}
                  onChange={(e) => handleChange("target", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="border-t border-outline-variant/40 pt-3">
                <span className="text-[11px] text-primary block mb-2 font-semibold">Optional: Record New Deposit</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-on-surface-variant block mb-1">Deposit Amount ($ USD)</label>
                    <input
                      type="number"
                      value={formData.depositAmount || ""}
                      onChange={(e) => handleChange("depositAmount", e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. 350"
                    />
                  </div>
                  <div>
                    <label className="text-on-surface-variant block mb-1">Deposit Note</label>
                    <input
                      type="text"
                      value={formData.depositNote || ""}
                      onChange={(e) => handleChange("depositNote", e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                      placeholder="Monthly allocation"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* BRAHMACHARYA */}
          {type === "brahmacharya" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-on-surface-variant block mb-1">Clean Streak (Days)</label>
                  <input
                    type="number"
                    value={formData.cleanStreak ?? 42}
                    onChange={(e) => handleChange("cleanStreak", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-on-surface-variant block mb-1">Urges Surfed Today</label>
                  <input
                    type="number"
                    value={formData.urgesToday ?? 0}
                    onChange={(e) => handleChange("urgesToday", e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">Transmutation State / Notes</label>
                <input
                  type="text"
                  value={formData.notesToday || ""}
                  onChange={(e) => handleChange("notesToday", e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="e.g. Transmuted via cold blast + Pranayama"
                />
              </div>
            </>
          )}

          {/* JOURNAL REFLECTION */}
          {type === "journal" && (
            <div>
              <label className="text-on-surface-variant block mb-1">Reflection Content</label>
              <textarea
                value={typeof formData.content === "string" ? formData.content : JSON.stringify(formData.content || "")}
                onChange={(e) => handleChange("content", e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary resize-none"
                rows={3}
                required
              />
            </div>
          )}

          <div className="sticky bottom-0 bg-surface-container-low/95 backdrop-blur-sm -mx-3.5 -mb-3.5 sm:-mx-4 sm:-mb-4 p-2.5 px-3.5 sm:px-4 border-t border-outline-variant/60 flex justify-end gap-2 shrink-0 z-10">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded bg-primary text-on-primary font-semibold text-xs hover:bg-primary-fixed-dim transition-all shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving && <ButtonSpinner />}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
