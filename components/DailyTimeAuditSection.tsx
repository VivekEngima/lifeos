"use client";

import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import type { DailyTimeBlock } from "@/lib/lifeos-service";

const CATEGORY_CONFIG: Record<
  DailyTimeBlock["category"],
  { label: string; icon: string; color: string; bg: string; border: string; text: string; isHighLeverage: boolean; isLeak: boolean }
> = {
  deep_work: {
    label: "Deep Work & Engineering",
    icon: "code",
    color: "#06b6d4",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    isHighLeverage: true,
    isLeak: false,
  },
  sadhana_health: {
    label: "Sadhana & Vitality",
    icon: "self_improvement",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    isHighLeverage: true,
    isLeak: false,
  },
  shallow_work: {
    label: "Shallow & Administrative",
    icon: "mail",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    isHighLeverage: false,
    isLeak: false,
  },
  rest_recovery: {
    label: "Rest & Renewal",
    icon: "bedtime",
    color: "#818cf8",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    isHighLeverage: true,
    isLeak: false,
  },
  distraction_leak: {
    label: "Time Leak / Mindless Drag",
    icon: "warning",
    color: "#f43f5e",
    bg: "bg-rose-500/10",
    border: "border-rose-500/40",
    text: "text-rose-400",
    isHighLeverage: false,
    isLeak: true,
  },
  social_personal: {
    label: "Social & Family Presence",
    icon: "favorite",
    color: "#c084fc",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    isHighLeverage: true,
    isLeak: false,
  },
};

const ENERGY_LABELS: Record<number, { label: string; icon: string }> = {
  1: { label: "Drained / Foggy", icon: "battery_alert" },
  2: { label: "Low Drag", icon: "battery_2_bar" },
  3: { label: "Steady Baseline", icon: "battery_4_bar" },
  4: { label: "High Cognitive", icon: "battery_5_bar" },
  5: { label: "Peak Vitality", icon: "bolt" },
};

const FOCUS_LABELS: Record<DailyTimeBlock["focusQuality"], { label: string; icon: string }> = {
  deep_flow: { label: "Deep Flow State", icon: "psychology" },
  moderate: { label: "Focused / Intentional", icon: "center_focus_strong" },
  fractured: { label: "Fractured / Multitasking", icon: "grain" },
  distracted: { label: "Checked Out / Distracted", icon: "blur_on" },
};

function calculateMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // Crosses midnight
  return diff;
}

export default function DailyTimeAuditSection() {
  const { state, selectedDate, logDayTimeBlocks, notify } = useLifeOS();
  const rawBlocks = state?.journal?.dayTimeLog || [];

  const [blocks, setBlocks] = useState<DailyTimeBlock[]>(rawBlocks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:30");
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState<DailyTimeBlock["category"]>("deep_work");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [focusQuality, setFocusQuality] = useState<DailyTimeBlock["focusQuality"]>("deep_flow");
  const [shouldHaveDone, setShouldHaveDone] = useState("");
  const [coachOptimization, setCoachOptimization] = useState("");
  const [leverageScore, setLeverageScore] = useState<number>(8);
  const [isSaving, setIsSaving] = useState(false);

  // Sync when state updates from backend
  useEffect(() => {
    if (state?.journal?.dayTimeLog) {
      setBlocks(state.journal.dayTimeLog);
    } else {
      setBlocks([]);
    }
  }, [state?.journal?.dayTimeLog, selectedDate]);

  // Sort blocks chronologically
  const sortedBlocks = [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute coach metrics
  const totalMinutesTracked = sortedBlocks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
  const totalHoursTracked = Number((totalMinutesTracked / 60).toFixed(1));

  const highLeverageMinutes = sortedBlocks
    .filter((b) => CATEGORY_CONFIG[b.category]?.isHighLeverage)
    .reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  const leakMinutes = sortedBlocks
    .filter((b) => CATEGORY_CONFIG[b.category]?.isLeak)
    .reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  const deepWorkMinutes = sortedBlocks
    .filter((b) => b.category === "deep_work")
    .reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  const highLeverageRatio = totalMinutesTracked > 0
    ? Math.round((highLeverageMinutes / totalMinutesTracked) * 100)
    : 0;

  const avgEnergy = sortedBlocks.length > 0
    ? (sortedBlocks.reduce((acc, b) => acc + (b.energyLevel || 3), 0) / sortedBlocks.length).toFixed(1)
    : "—";

  const avgLeverage = sortedBlocks.length > 0
    ? (sortedBlocks.reduce((acc, b) => acc + (b.leverageScore || 7), 0) / sortedBlocks.length).toFixed(1)
    : "—";

  // Dynamic life coach verdict
  const getCoachVerdict = () => {
    if (sortedBlocks.length === 0) {
      return {
        type: "neutral",
        title: "Daily Audit Pending",
        message: "No time blocks recorded yet. A day without an audit allows unconscious drift. Add your first time window to initiate your life coach diagnostic.",
      };
    }
    if (leakMinutes >= 90) {
      return {
        type: "warning",
        title: `High Friction Alert: ${(leakMinutes / 60).toFixed(1)}h Lost to Cognitive Drag`,
        message: "Your time audit detected substantial leakage. Review the systemic fixes you recorded below. Willpower does not solve distractions—architectural constraints and environment design do.",
      };
    }
    if (deepWorkMinutes >= 180) {
      return {
        type: "success",
        title: `High-Altitude Execution: ${(deepWorkMinutes / 60).toFixed(1)}h Deep Flow Achieved`,
        message: "You satisfied the 3h+ deep work gold standard. Maintain cognitive sovereignty by protecting tonight's wind-down and sleep architecture.",
      };
    }
    if (highLeverageRatio >= 75) {
      return {
        type: "success",
        title: `Strong Intentionality: ${highLeverageRatio}% High-Leverage Alignment`,
        message: "The majority of your logged hours served high-value creation, vitality, and renewal. Tomorrow's leverage will compound upon today's clarity.",
      };
    }
    return {
      type: "info",
      title: `${totalHoursTracked}h Total Audited`,
      message: "Continuous auditing illuminates the exact moments where energy leaks occur. Implement the coach optimizations before starting tomorrow.",
    };
  };

  const coachVerdict = getCoachVerdict();

  // Open creation modal with smart time defaults
  const handleOpenAdd = () => {
    setEditingId(null);
    let nextStart = "09:00";
    if (sortedBlocks.length > 0) {
      nextStart = sortedBlocks[sortedBlocks.length - 1].endTime;
    }
    const [h, m] = nextStart.split(":").map(Number);
    let endH = (h + 1) % 24;
    const endM = (m + 30) % 60;
    if (m + 30 >= 60) endH = (endH + 1) % 24;
    const nextEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    setStartTime(nextStart);
    setEndTime(nextEnd);
    setActivity("");
    setCategory("deep_work");
    setEnergyLevel(4);
    setFocusQuality("deep_flow");
    setShouldHaveDone("");
    setCoachOptimization("");
    setLeverageScore(8);
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (block: DailyTimeBlock) => {
    setEditingId(block.id);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setActivity(block.activity);
    setCategory(block.category);
    setEnergyLevel(block.energyLevel || 3);
    setFocusQuality(block.focusQuality || "deep_flow");
    setShouldHaveDone(block.shouldHaveDone || "");
    setCoachOptimization(block.coachOptimization || "");
    setLeverageScore(block.leverageScore || 7);
    setIsFormOpen(true);
  };

  // Quick preset loader
  const handleApplyPreset = (
    pStart: string,
    pEnd: string,
    pActivity: string,
    pCat: DailyTimeBlock["category"],
    pEnergy: number,
    pFocus: DailyTimeBlock["focusQuality"],
    pOptimization: string
  ) => {
    setStartTime(pStart);
    setEndTime(pEnd);
    setActivity(pActivity);
    setCategory(pCat);
    setEnergyLevel(pEnergy);
    setFocusQuality(pFocus);
    setCoachOptimization(pOptimization);
  };

  // Save block
  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    setIsSaving(true);
    try {
      const dur = calculateMinutes(startTime, endTime);
      const newBlock: DailyTimeBlock = {
        id: editingId || `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        startTime,
        endTime,
        durationMinutes: dur,
        activity: activity.trim(),
        category,
        energyLevel,
        focusQuality,
        shouldHaveDone: shouldHaveDone.trim() || undefined,
        coachOptimization: coachOptimization.trim() || undefined,
        leverageScore,
      };

      let updatedList: DailyTimeBlock[];
      if (editingId) {
        updatedList = blocks.map((b) => (b.id === editingId ? newBlock : b));
      } else {
        updatedList = [...blocks, newBlock];
      }

      setBlocks(updatedList);
      await logDayTimeBlocks(updatedList);

      notify(
        editingId ? "Time Block Updated" : "Time Block Committed",
        `${startTime} - ${endTime} (${dur}m) logged to daily audit`,
        "success"
      );
      setIsFormOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving time block:", err);
      notify("Save Error", "Could not commit time block to database", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete block
  const handleDeleteBlock = async (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    await logDayTimeBlocks(updated);
    notify("Time Block Deleted", "Block removed from audit", "info");
  };

  // Copy Obsidian markdown summary
  const handleCopyObsidian = () => {
    if (sortedBlocks.length === 0) return;
    const lines = [
      `# Daily 24-Hour Time & Coach Audit — ${selectedDate}`,
      ``,
      `| Time Window | Category | Activity Done | Energy | Leverage | Should Have Done | Coach Optimization |`,
      `|---|---|---|---|---|---|---|`,
    ];
    for (const b of sortedBlocks) {
      const catLabel = CATEGORY_CONFIG[b.category]?.label || b.category;
      lines.push(
        `| ${b.startTime} - ${b.endTime} (${b.durationMinutes}m) | ${catLabel} | ${b.activity.replace(/\|/g, "/")} | ${b.energyLevel}/5 | ${b.leverageScore}/10 | ${(b.shouldHaveDone || "—").replace(/\|/g, "/")} | ${(b.coachOptimization || "—").replace(/\|/g, "/")} |`
      );
    }
    lines.push(``);
    lines.push(`**Daily Coach Summary:**`);
    lines.push(`- **Total Audited Hours:** ${totalHoursTracked} hrs`);
    lines.push(`- **High-Leverage Alignment:** ${highLeverageRatio}%`);
    lines.push(`- **Friction / Leaks:** ${(leakMinutes / 60).toFixed(1)} hrs`);
    lines.push(`- **Coach Diagnostic:** ${coachVerdict.message}`);

    navigator.clipboard.writeText(lines.join("\n"));
    notify("Copied to Clipboard", "Markdown table ready for Obsidian", "success");
  };

  return (
    <section className="bg-[#121215] rounded-[6px] border border-[#1e1e24] p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1e1e24] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-[#f4f4f5]">
                24-Hour Whole Day Time Log &amp; Life Coach Audit
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                Coach Optimization
              </span>
            </div>
            <p className="text-[#a1a1aa] text-xs mt-0.5 font-sans leading-relaxed">
              Clinical accounting of every hour: What you did, what you should have done, and systemic root-cause optimization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sortedBlocks.length > 0 && (
            <button
              type="button"
              onClick={handleCopyObsidian}
              className="px-2.5 py-1.5 rounded-[4px] bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy audit to markdown"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span className="hidden sm:inline">Copy Markdown</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-[4px] bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Add Time Block</span>
          </button>
        </div>
      </div>

      {/* Life Coach Telemetry 4-Card Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Card 1: Total Audited Hours */}
        <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-[#71717a] font-semibold tracking-wider">
            Total Audited
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#f4f4f5]">{totalHoursTracked}</span>
            <span className="text-xs text-[#71717a]">/ 24 hrs</span>
          </div>
          <span className="text-[11px] text-[#06b6d4] mt-1 font-sans">
            {sortedBlocks.length} time {sortedBlocks.length === 1 ? "block" : "blocks"} logged
          </span>
        </div>

        {/* Card 2: High Leverage Ratio */}
        <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-[#71717a] font-semibold tracking-wider">
            High Leverage ROI
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold ${highLeverageRatio >= 70 ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
              {highLeverageRatio}%
            </span>
          </div>
          <span className="text-[11px] text-[#a1a1aa] mt-1 font-sans">
            {(highLeverageMinutes / 60).toFixed(1)}h creative &amp; vitality
          </span>
        </div>

        {/* Card 3: Friction & Leaks */}
        <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-[#71717a] font-semibold tracking-wider">
            Friction &amp; Leaks
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold ${leakMinutes > 0 ? "text-[#f43f5e]" : "text-[#10b981]"}`}>
              {(leakMinutes / 60).toFixed(1)}h
            </span>
          </div>
          <span className="text-[11px] text-[#a1a1aa] mt-1 font-sans">
            {leakMinutes > 0 ? `${leakMinutes}m passive drag detected` : "Zero leak blocks recorded"}
          </span>
        </div>

        {/* Card 4: Energy & Leverage Rating */}
        <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-[#71717a] font-semibold tracking-wider">
            Energy &amp; Leverage
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-amber-300">⚡ {avgEnergy}/5</span>
            <span className="text-xs text-[#71717a]">ROI: {avgLeverage}/10</span>
          </div>
          <span className="text-[11px] text-[#a1a1aa] mt-1 font-sans">
            Average block score
          </span>
        </div>
      </div>

      {/* Life Coach Dynamic Diagnostic Banner */}
      <div className={`p-4 rounded-[4px] border flex items-start gap-3 transition-colors ${
        coachVerdict.type === "warning"
          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
          : coachVerdict.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
          : "bg-[#0e0e11] border-[#27272a] text-[#d4d4d8]"
      }`}>
        <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
          coachVerdict.type === "warning" ? "text-rose-400" : coachVerdict.type === "success" ? "text-emerald-400" : "text-amber-400"
        }`}>
          {coachVerdict.type === "warning" ? "error" : coachVerdict.type === "success" ? "verified" : "tips_and_updates"}
        </span>
        <div className="flex-1">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wide">
            {coachVerdict.title}
          </h3>
          <p className="text-xs font-sans mt-0.5 opacity-90 leading-relaxed">
            {coachVerdict.message}
          </p>
        </div>
      </div>

      {/* Visual Time Distribution Strip */}
      {sortedBlocks.length > 0 && (
        <div className="p-3.5 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71717a]">
            <span>24-Hour Time Distribution Strip</span>
            <span className="text-cyan-400">{totalHoursTracked} hrs logged</span>
          </div>

          {/* Bar */}
          <div className="w-full h-3 rounded-full bg-[#18181b] overflow-hidden flex">
            {sortedBlocks.map((b) => {
              const pct = (b.durationMinutes / (totalMinutesTracked || 1)) * 100;
              const cfg = CATEGORY_CONFIG[b.category];
              return (
                <div
                  key={b.id}
                  style={{ width: `${Math.max(2, pct)}%`, backgroundColor: cfg?.color || "#06b6d4" }}
                  className="h-full border-r border-[#09090b]/40 transition-all hover:opacity-80"
                  title={`${b.startTime}-${b.endTime} (${b.durationMinutes}m): ${b.activity}`}
                />
              );
            })}
          </div>

          {/* Category Legends */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-[#a1a1aa]">
            {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => {
              const catMins = sortedBlocks
                .filter((b) => b.category === k)
                .reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
              if (catMins === 0) return null;
              return (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span>
                    {cfg.label}: {(catMins / 60).toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD / EDIT DRAWER FORM */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveBlock}
          className="p-4 sm:p-5 bg-[#0e0e11] rounded-[4px] border border-amber-500/40 flex flex-col gap-4 text-xs font-mono shadow-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1e1e24]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">
                {editingId ? "edit_calendar" : "add_circle"}
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f4f4f5]">
                {editingId ? "Edit Time Block Audit" : "Add New Time Block Audit"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="text-[#71717a] hover:text-[#f4f4f5] text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Quick Coach Presets */}
          <div>
            <span className="text-[10px] uppercase text-[#71717a] font-semibold block mb-1.5">
              Rapid Time Block Presets (Click to Auto-Fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "🌅 Dawn Sadhana (06:00-07:30)", s: "06:00", e: "07:30", act: "Surya Kriya, Yogasanas & Shambhavi Mahamudra", cat: "sadhana_health" as const, eng: 5, foc: "deep_flow" as const, opt: "Protect empty stomach protocol and dawn stillness." },
                { label: "💻 Deep Work 1 (09:00-12:30)", s: "09:00", e: "12:30", act: "High Leverage Code & Architecture Execution", cat: "deep_work" as const, eng: 5, foc: "deep_flow" as const, opt: "Zero notifications, browser closed, single terminal window." },
                { label: "🥗 Nourish & Walk (12:30-13:30)", s: "12:30", e: "13:30", act: "Clean Vital Meal & Sunlight Walk", cat: "rest_recovery" as const, eng: 4, foc: "moderate" as const, opt: "No phone or YouTube while eating to protect digestion." },
                { label: "💻 Deep Work 2 (14:30-17:30)", s: "14:30", e: "17:30", act: "Complex Problem Solving & Feature Shipping", cat: "deep_work" as const, eng: 4, foc: "deep_flow" as const, opt: "Clear deliverable written down before opening IDE." },
                { label: "📋 Comms & Admin (17:30-18:30)", s: "17:30", e: "18:30", act: "Batch Email, Messages & Organization", cat: "shallow_work" as const, eng: 3, foc: "moderate" as const, opt: "Strict 45-minute timebox so admin does not creep into night." },
                { label: "🌙 Evening Reading (21:00-22:30)", s: "21:00", e: "22:30", act: "Philosophy Reading & Shutdown Protocol", cat: "rest_recovery" as const, eng: 3, foc: "deep_flow" as const, opt: "Blue light filters on, warm lighting, journal committed." },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      preset.s,
                      preset.e,
                      preset.act,
                      preset.cat,
                      preset.eng,
                      preset.foc,
                      preset.opt
                    )
                  }
                  className="px-2 py-1 rounded-[4px] bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Interval & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1">
                Start Time (HH:MM)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1">
                End Time (HH:MM)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1">
                Calculated Duration
              </label>
              <div className="p-2 bg-[#121215] border border-[#27272a] rounded-[4px] text-xs font-bold text-amber-300">
                {calculateMinutes(startTime, endTime)} mins ({((calculateMinutes(startTime, endTime)) / 60).toFixed(1)} hrs)
              </div>
            </div>
          </div>

          {/* Activity Description */}
          <div>
            <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1">
              What Did You Actually Do? (Honest Physical &amp; Mental Reality)
            </label>
            <textarea
              rows={2}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Engineered database migration & Go concurrency worker, or Mindlessly checked Twitter & news tickers..."
              required
              className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2.5 text-xs text-[#f4f4f5] font-sans focus:border-[#06b6d4] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1.5">
              Intentionality Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => {
                const isSelected = category === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCategory(k as DailyTimeBlock["category"])}
                    className={`p-2.5 rounded-[4px] border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? `${cfg.bg} ${cfg.border} ring-1 ring-${cfg.color}/30 text-[#f4f4f5]`
                        : "bg-[#121215] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    <span className="text-[11px] font-sans font-medium truncate">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Level & Focus Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Energy Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase text-[#a1a1aa]">
                  Energy Level (1–5)
                </label>
                <span className="text-[11px] text-amber-300 font-bold">
                  {ENERGY_LABELS[energyLevel]?.label}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-[4px] border text-xs font-bold transition-all cursor-pointer ${
                      energyLevel === lvl
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-[#121215] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Quality */}
            <div>
              <label className="text-[10px] uppercase text-[#a1a1aa] block mb-1">
                Cognitive Focus State
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(FOCUS_LABELS).map(([k, cfg]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFocusQuality(k as DailyTimeBlock["focusQuality"])}
                    className={`py-1.5 px-2 rounded-[4px] border text-[10px] text-left transition-all truncate cursor-pointer ${
                      focusQuality === k
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold"
                        : "bg-[#121215] border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leverage Score (1-10) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase text-[#a1a1aa]">
                Leverage &amp; Alignment Rating (1–10)
              </label>
              <span className="text-xs text-cyan-400 font-bold">{leverageScore} / 10</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLeverageScore(n)}
                  className={`flex-1 py-1 rounded-[4px] text-xs font-mono transition-all cursor-pointer ${
                    leverageScore === n
                      ? "bg-cyan-500 text-black font-bold"
                      : "bg-[#121215] border border-[#27272a] text-[#71717a] hover:text-[#f4f4f5]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* The Coach Diagnostics: Should Have Done & How to Optimize */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[#1e1e24]">
            {/* Should Have Done */}
            <div>
              <label className="text-[10px] uppercase text-[#06b6d4] font-semibold block mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">undo</span>
                What Should I Have Done Instead? (Ideal Alternative)
              </label>
              <textarea
                rows={2}
                value={shouldHaveDone}
                onChange={(e) => setShouldHaveDone(e.target.value)}
                placeholder="e.g. Taken a 10m walk without phone instead of mindless doomscrolling, or scoped the bug to 20m before rabbit-holing..."
                className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2.5 text-xs text-[#f4f4f5] font-sans focus:border-[#06b6d4] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* How to Optimize / Systemic Coach Fix */}
            <div>
              <label className="text-[10px] uppercase text-[#10b981] font-semibold block mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                How To Optimize? (Coach Systemic Fix / Prevent Friction)
              </label>
              <textarea
                rows={2}
                value={coachOptimization}
                onChange={(e) => setCoachOptimization(e.target.value)}
                placeholder="e.g. Put phone in other room before opening laptop, install hard site-blocker, pre-write tomorrow's #1 task..."
                className="w-full bg-[#121215] border border-[#27272a] rounded-[4px] p-2.5 text-xs text-[#f4f4f5] font-sans focus:border-[#10b981] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#1e1e24]">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-[4px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-[4px] bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">done</span>
              <span>{isSaving ? "Saving..." : editingId ? "Update Time Block ⏎" : "Commit Time Block ⏎"}</span>
            </button>
          </div>
        </form>
      )}

      {/* LOGGED TIME BLOCKS STREAM */}
      <div className="flex flex-col gap-3">
        {sortedBlocks.length === 0 ? (
          <div className="py-12 px-4 rounded-[4px] border border-dashed border-[#27272a] bg-[#0e0e11] flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-[36px] text-amber-400/40">history_toggle_off</span>
            <div>
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                No Daily Time Blocks Logged For This Date
              </h3>
              <p className="text-xs text-[#71717a] mt-1 max-w-md font-sans leading-relaxed">
                Log from hour to hour what you did, what you should have done instead, and your life coach optimization fixes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Log Your First Time Block</span>
            </button>
          </div>
        ) : (
          sortedBlocks.map((block) => {
            const cfg = CATEGORY_CONFIG[block.category] || CATEGORY_CONFIG.deep_work;
            const energyCfg = ENERGY_LABELS[block.energyLevel || 3];
            const focusCfg = FOCUS_LABELS[block.focusQuality || "deep_flow"];

            return (
              <div
                key={block.id}
                className={`p-4 rounded-[4px] border transition-colors flex flex-col gap-3 ${
                  cfg.isLeak
                    ? "bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50"
                    : "bg-[#0e0e11] border-[#1e1e24] hover:border-[#27272a]"
                }`}
              >
                {/* Block Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1e1e24]">
                  <div className="flex items-center gap-2.5">
                    {/* Time pill */}
                    <span className="px-2.5 py-1 rounded-[3px] bg-[#18181b] border border-[#27272a] text-xs font-mono font-bold text-[#f4f4f5]">
                      {block.startTime} → {block.endTime}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717a]">
                      {block.durationMinutes} min ({(block.durationMinutes / 60).toFixed(1)}h)
                    </span>

                    {/* Category pill */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] border flex items-center gap-1 uppercase font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                      <span className="material-symbols-outlined text-[13px]">{cfg.icon}</span>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-amber-300 text-[11px] flex items-center gap-1" title={energyCfg?.label}>
                      <span>⚡</span>
                      <span>{block.energyLevel || 3}/5</span>
                    </span>

                    <span className="text-cyan-400 text-[11px] flex items-center gap-0.5" title={focusCfg?.label}>
                      <span>🎯</span>
                      <span>{block.leverageScore || 7}/10 ROI</span>
                    </span>

                    <div className="flex items-center gap-1 ml-2 border-l border-[#27272a] pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(block)}
                        className="p-1 text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                        title="Edit time block"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 text-[#71717a] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete time block"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Description */}
                <div>
                  <h4 className="text-xs font-semibold text-[#f4f4f5] font-sans leading-relaxed">
                    {block.activity}
                  </h4>
                </div>

                {/* Coach Audit 2-Column Grid */}
                {(block.shouldHaveDone || block.coachOptimization) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1e1e24] text-xs">
                    {/* Should Have Done */}
                    {block.shouldHaveDone && (
                      <div className="p-2.5 rounded-[4px] bg-[#121215] border border-[#1e1e24] flex flex-col gap-1">
                        <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">undo</span>
                          What I Should Have Done Instead:
                        </span>
                        <p className="text-[#a1a1aa] font-sans leading-relaxed text-[11px]">
                          {block.shouldHaveDone}
                        </p>
                      </div>
                    )}

                    {/* Coach Optimization */}
                    {block.coachOptimization && (
                      <div className="p-2.5 rounded-[4px] bg-[#121215] border border-[#1e1e24] flex flex-col gap-1">
                        <span className="text-[10px] font-mono uppercase text-[#10b981] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">tune</span>
                          Life Coach Systemic Optimization:
                        </span>
                        <p className="text-[#a1a1aa] font-sans leading-relaxed text-[11px]">
                          {block.coachOptimization}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
