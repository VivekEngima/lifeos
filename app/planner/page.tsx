"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { getLocalTodayStr, addDaysToDateStr, formatLocalDateString } from "@/lib/date-utils";
import ButtonSpinner from "@/components/ButtonSpinner";

// ─── Types ────────────────────────────────────────────────────────────
interface PlannerTask {
  id: string;
  taskDate: string;
  title: string;
  description: string | null;
  timeSlot: string | null;
  priority: string;
  category: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

interface PlannerGoal {
  id: string;
  title: string;
  description: string | null;
  scope: string;
  periodStart: string;
  periodEnd: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  status: string;
  progressPct: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  critical: { label: "Critical", color: "#ff6b6b", bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.25)", icon: "priority_high" },
  high: { label: "High", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "arrow_upward" },
  medium: { label: "Medium", color: "#4cd7f6", bg: "rgba(76,215,246,0.08)", border: "rgba(76,215,246,0.25)", icon: "drag_handle" },
  low: { label: "Low", color: "#71717a", bg: "rgba(113,113,122,0.08)", border: "rgba(113,113,122,0.25)", icon: "arrow_downward" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  nofap: { label: "NoFap / Vitality", icon: "bolt", color: "#f59e0b" },
  deep_work: { label: "Deep Work", icon: "psychology", color: "#4cd7f6" },
  sadhana: { label: "Sadhana", icon: "self_improvement", color: "#f59e0b" },
  reading: { label: "Reading", icon: "menu_book", color: "#10b981" },
  health: { label: "Health", icon: "favorite", color: "#ff6b6b" },
  personal: { label: "Personal", icon: "person", color: "#a78bfa" },
  admin: { label: "Admin", icon: "settings", color: "#71717a" },
  social: { label: "Social", icon: "group", color: "#f472b6" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pending: { label: "Pending", icon: "radio_button_unchecked", color: "#71717a" },
  in_progress: { label: "In Progress", icon: "pending", color: "#f59e0b" },
  completed: { label: "Done", icon: "check_circle", color: "#10b981" },
  skipped: { label: "Skipped", icon: "block", color: "#ff6b6b" },
};

// ─── Helper: get current week/month range ─────────────────────────────
function getWeekRange(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return { start: fmt(monday), end: fmt(sunday) };
}

function getMonthRange(dateStr: string) {
  const [y, m] = dateStr.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${y}-${String(m).padStart(2, "0")}-01`,
    end: `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatShortDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// ─── Main Component ───────────────────────────────────────────────────
export default function PlannerPage() {
  const { notify, selectedDate, refreshState } = useLifeOS();
  const todayStr = getLocalTodayStr();
  const tomorrowStr = addDaysToDateStr(todayStr, 1);

  // Tab state
  type TabType = "today" | "tomorrow" | "weekly" | "monthly";
  const [activeTab, setActiveTab] = useState<TabType>("today");

  // Data
  const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<PlannerTask[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<PlannerGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<PlannerGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Add task form
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    timeSlot: "",
    priority: "medium",
    category: "",
  });

  // Add goal form
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetValue: 1,
    unit: "tasks",
  });

  // Action loading states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalValue, setEditGoalValue] = useState(0);

  // Compute current periods
  const weekRange = getWeekRange(todayStr);
  const monthRange = getMonthRange(todayStr);

  // ─── Data Fetching ────────────────────────────────────────────────
  const fetchTasks = useCallback(async (date: string): Promise<PlannerTask[]> => {
    try {
      const res = await fetch(`/api/planner/tasks?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return [];
    }
  }, []);

  const fetchGoals = useCallback(async (scope: string, date: string): Promise<PlannerGoal[]> => {
    try {
      const res = await fetch(`/api/planner/goals?scope=${scope}&date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    } catch (err) {
      console.error("Error fetching goals:", err);
      return [];
    }
  }, []);

  const refreshAllData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [today, tomorrow, weekly, monthly] = await Promise.all([
        fetchTasks(todayStr),
        fetchTasks(tomorrowStr),
        fetchGoals("weekly", todayStr),
        fetchGoals("monthly", todayStr),
      ]);
      setTodayTasks(today);
      setTomorrowTasks(tomorrow);
      setWeeklyGoals(weekly);
      setMonthlyGoals(monthly);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [todayStr, tomorrowStr, fetchTasks, fetchGoals]);

  useEffect(() => {
    refreshAllData(true);
  }, [refreshAllData]);

  // ─── Task CRUD ────────────────────────────────────────────────────
  const addTask = async () => {
    if (!newTask.title.trim() || isAddingTask) return;
    const taskDate = activeTab === "tomorrow" ? tomorrowStr : todayStr;
    setIsAddingTask(true);
    try {
      const res = await fetch("/api/planner/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDate,
          title: newTask.title,
          description: newTask.description || null,
          timeSlot: newTask.timeSlot || null,
          priority: newTask.priority,
          category: newTask.category || null,
          sortOrder: activeTab === "tomorrow" ? tomorrowTasks.length : todayTasks.length,
        }),
      });
      if (res.ok) {
        const created: PlannerTask = await res.json();
        notify("Task Planned", `"${newTask.title}" added to ${activeTab === "tomorrow" ? "tomorrow" : "today"}'s plan`, "success");
        setNewTask({ title: "", description: "", timeSlot: "", priority: "medium", category: "" });
        setShowAddTask(false);
        // Direct state insertion with zero component reload
        if (activeTab === "tomorrow") {
          setTomorrowTasks((prev) => [...prev, created]);
        } else {
          setTodayTasks((prev) => [...prev, created]);
        }
        refreshState?.();
      }
    } catch (err) {
      console.error("Error adding task:", err);
      notify("Failed to Add Task", "Could not save to database", "error");
    } finally {
      setIsAddingTask(false);
    }
  };

  const toggleTaskStatus = async (task: PlannerTask) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    // 1. Optimistic targeted update: only modify this specific task in-place
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    setTomorrowTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    // 2. Persist in background without re-rendering whole component or showing full-page loader
    try {
      const res = await fetch("/api/planner/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      refreshState?.();
    } catch (err) {
      console.error("Error toggling task:", err);
      // Rollback on network failure
      setTodayTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setTomorrowTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      notify("Failed to Update", "Could not save task status", "error");
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    // Optimistic targeted update
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    setTomorrowTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    try {
      const res = await fetch("/api/planner/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      refreshState?.();
    } catch (err) {
      console.error("Error updating task status:", err);
      notify("Failed to Update", "Could not update task status", "error");
    }
  };

  const deleteTask = async (taskId: string) => {
    // Optimistic removal
    setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTomorrowTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`/api/planner/tasks?id=${taskId}`, { method: "DELETE" });
      notify("Task Removed", "Task deleted from plan", "info");
      refreshState?.();
    } catch (err) {
      console.error("Error deleting task:", err);
      // Re-fetch in background if delete failed
      refreshAllData(false);
    }
  };

  // ─── Goal CRUD ────────────────────────────────────────────────────
  const addGoal = async () => {
    if (!newGoal.title.trim() || isAddingGoal) return;
    const scope = activeTab === "weekly" ? "weekly" : "monthly";
    const range = scope === "weekly" ? weekRange : monthRange;
    setIsAddingGoal(true);
    try {
      const res = await fetch("/api/planner/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description || null,
          scope,
          periodStart: range.start,
          periodEnd: range.end,
          targetValue: newGoal.targetValue,
          unit: newGoal.unit || null,
        }),
      });
      if (res.ok) {
        notify("Goal Created", `"${newGoal.title}" tracked for this ${scope === "weekly" ? "week" : "month"}`, "success");
        setNewGoal({ title: "", description: "", targetValue: 1, unit: "tasks" });
        setShowAddGoal(false);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Error adding goal:", err);
      notify("Failed to Create Goal", "Could not save to database", "error");
    } finally {
      setIsAddingGoal(false);
    }
  };

  const updateGoalProgress = async (goalId: string, currentValue: number) => {
    try {
      await fetch("/api/planner/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalId, currentValue }),
      });
      setEditingGoalId(null);
      await refreshAllData();
      notify("Progress Updated", "Goal progress synced", "success");
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const markGoalComplete = async (goalId: string) => {
    try {
      await fetch("/api/planner/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalId, status: "completed" }),
      });
      await refreshAllData();
      notify("Goal Achieved", "Milestone completed!", "success");
    } catch (err) {
      console.error("Error completing goal:", err);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await fetch(`/api/planner/goals?id=${goalId}`, { method: "DELETE" });
      notify("Goal Removed", "Goal deleted", "info");
      await refreshAllData();
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  // ─── Derived stats ────────────────────────────────────────────────
  const currentTasks = activeTab === "tomorrow" ? tomorrowTasks : todayTasks;
  const completedTasks = currentTasks.filter((t) => t.status === "completed").length;
  const totalTasks = currentTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentGoals = activeTab === "weekly" ? weeklyGoals : monthlyGoals;
  const activeGoals = currentGoals.filter((g) => g.status === "active").length;
  const completedGoals = currentGoals.filter((g) => g.status === "completed").length;

  const isDailyView = activeTab === "today" || activeTab === "tomorrow";
  const isGoalView = activeTab === "weekly" || activeTab === "monthly";

  // Tabs config
  const tabs: { id: TabType; label: string; icon: string; sublabel: string }[] = [
    { id: "today", label: "Today", icon: "today", sublabel: formatShortDate(todayStr) },
    { id: "tomorrow", label: "Tomorrow", icon: "event", sublabel: formatShortDate(tomorrowStr) },
    { id: "weekly", label: "This Week", icon: "date_range", sublabel: `${formatShortDate(weekRange.start)} — ${formatShortDate(weekRange.end)}` },
    { id: "monthly", label: "This Month", icon: "calendar_month", sublabel: `${formatShortDate(monthRange.start)} — ${formatShortDate(monthRange.end)}` },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-sm bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.65)]" />
            <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
              Strategic Planner
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
            Day Blueprint & Goal Tracker
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Architect your day before it happens. Track weekly and monthly milestones.
          </p>
        </div>

        {/* Quick Stats */}
        {!loading && (
          <div className="flex gap-3">
            <div className="bg-surface-container border border-outline-variant/60 rounded-md px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-0.5">Today</p>
              <p className="text-label-metric font-label-metric text-on-surface text-lg">{todayTasks.filter((t) => t.status === "completed").length}<span className="text-on-surface-variant">/{todayTasks.length}</span></p>
            </div>
            <div className="bg-surface-container border border-outline-variant/60 rounded-md px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-0.5">Week</p>
              <p className="text-label-metric font-label-metric text-emerald-400 text-lg">{weeklyGoals.filter((g) => g.status === "completed").length}<span className="text-on-surface-variant">/{weeklyGoals.length}</span></p>
            </div>
            <div className="bg-surface-container border border-outline-variant/60 rounded-md px-4 py-2.5 text-center min-w-[100px]">
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-0.5">Month</p>
              <p className="text-label-metric font-label-metric text-amber-400 text-lg">{monthlyGoals.filter((g) => g.status === "completed").length}<span className="text-on-surface-variant">/{monthlyGoals.length}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-0 border-b border-outline-variant/60 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowAddTask(false);
              setShowAddGoal(false);
            }}
            className={`group relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-on-surface-variant hover:text-on-surface border-b-2 border-transparent"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono ml-1 hidden sm:inline ${activeTab === tab.id ? "text-cyan-400/70" : "text-on-surface-variant/60"}`}>
              {tab.sublabel}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <p className="text-sm text-on-surface-variant font-mono">Loading planner data...</p>
          </div>
        </div>
      )}

      {/* ─── DAILY VIEW (Today / Tomorrow) ──────────────────────────── */}
      {!loading && isDailyView && (
        <div className="space-y-4">
          {/* Day Progress Bar */}
          {totalTasks > 0 && (
            <div className="bg-surface-container border border-outline-variant/60 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                  Day Completion
                </span>
                <span className="text-sm font-mono text-on-surface">
                  {completedTasks} / {totalTasks} tasks · <span className={completionPct >= 80 ? "text-emerald-400" : completionPct >= 50 ? "text-amber-400" : "text-on-surface-variant"}>{completionPct}%</span>
                </span>
              </div>
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${completionPct}%`,
                    background: completionPct >= 80
                      ? "linear-gradient(90deg, #10b981, #4edea3)"
                      : completionPct >= 50
                      ? "linear-gradient(90deg, #f59e0b, #ffb95f)"
                      : "linear-gradient(90deg, #4cd7f6, #06b6d4)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-2">
            {currentTasks.map((task) => {
              const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const categoryCfg = task.category ? CATEGORY_CONFIG[task.category] : null;
              const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
              const isCompleted = task.status === "completed";
              const isSkipped = task.status === "skipped";

              return (
                <div
                  key={task.id}
                  className={`group bg-surface-container border rounded-md px-4 py-3 transition-all hover:border-outline/50 ${
                    isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                      : isSkipped
                      ? "border-red-500/20 bg-red-500/[0.03] opacity-60"
                      : "border-outline-variant/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Toggle */}
                    <button
                      onClick={() => {
                        toggleTaskStatus(task);
                      }}
                      className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: statusCfg.color, fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {statusCfg.icon}
                      </span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${isCompleted ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                          {task.title}
                        </span>
                        {/* Priority Badge */}
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: priorityCfg.color, background: priorityCfg.bg, border: `1px solid ${priorityCfg.border}` }}
                        >
                          <span className="material-symbols-outlined text-[11px]">{priorityCfg.icon}</span>
                          {priorityCfg.label}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-on-surface-variant mb-1 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-mono">
                        {task.timeSlot && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {task.timeSlot}
                          </span>
                        )}
                        {categoryCfg && (
                          <span className="flex items-center gap-1" style={{ color: categoryCfg.color }}>
                            <span className="material-symbols-outlined text-[12px]">{categoryCfg.icon}</span>
                            {categoryCfg.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!isCompleted && !isSkipped && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "in_progress")}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-amber-400 transition-colors"
                          title="Mark In Progress"
                        >
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                        </button>
                      )}
                      {!isSkipped && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "skipped")}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-red-400 transition-colors"
                          title="Skip"
                        >
                          <span className="material-symbols-outlined text-[14px]">block</span>
                        </button>
                      )}
                      {(isCompleted || isSkipped) && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "pending")}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-cyan-400 transition-colors"
                          title="Reset to Pending"
                        >
                          <span className="material-symbols-outlined text-[14px]">undo</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {currentTasks.length === 0 && !showAddTask && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">event_note</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface mb-1">
                  {activeTab === "tomorrow" ? "Tomorrow's plan is empty" : "Today's plan is empty"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {activeTab === "tomorrow"
                    ? "Plan tomorrow tonight. Architect your day before it arrives."
                    : "Start by adding your non-negotiable blocks."}
                </p>
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-on-surface text-surface font-medium text-sm hover:bg-on-surface/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Plan {activeTab === "tomorrow" ? "Tomorrow" : "Today"}
              </button>
            </div>
          )}

          {/* Add Task Form */}
          {showAddTask && (
            <div className="bg-surface-container border border-cyan-500/30 rounded-md p-5 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px] text-cyan-400">add_task</span>
                <h3 className="text-sm font-semibold text-on-surface">
                  Add Task — {activeTab === "tomorrow" ? formatShortDate(tomorrowStr) : formatShortDate(todayStr)}
                </h3>
              </div>

              <div className="space-y-3">
                {/* Title */}
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-2 text-sm text-on-surface placeholder:text-[#52525b] focus:border-cyan-400 focus:outline-none transition-colors"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addTask(); } }}
                />

                {/* Description */}
                <input
                  type="text"
                  placeholder="Notes / Details (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-2 text-sm text-on-surface placeholder:text-[#52525b] focus:border-cyan-400 focus:outline-none transition-colors"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Time Slot */}
                  <div>
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1 block">Time</label>
                    <input
                      type="time"
                      value={newTask.timeSlot}
                      onChange={(e) => setNewTask((p) => ({ ...p, timeSlot: e.target.value }))}
                      className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-1.5 text-sm text-on-surface focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1 block">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                      className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-1.5 text-sm text-on-surface focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                      <option value="critical">🔴 Critical</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🔵 Medium</option>
                      <option value="low">⚪ Low</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1 block">Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-1.5 text-sm text-on-surface focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                      <option value="">None</option>
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-outline-variant/40">
                <button
                  onClick={addTask}
                  disabled={!newTask.title.trim() || isAddingTask}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-on-surface text-surface font-medium text-sm hover:bg-on-surface/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingTask ? <ButtonSpinner size="sm" /> : <span className="material-symbols-outlined text-[14px]">add</span>}
                  {isAddingTask ? "Adding..." : "Add Task"}
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  disabled={isAddingTask}
                  className="px-3 py-1.5 rounded-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Task Button (when tasks exist) */}
          {currentTasks.length > 0 && !showAddTask && (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-dashed border-outline-variant/60 text-on-surface-variant hover:text-cyan-400 hover:border-cyan-500/40 text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Task
            </button>
          )}

          {/* Life Coach Tip */}
          {activeTab === "tomorrow" && currentTasks.length === 0 && (
            <div className="bg-surface-container border border-amber-500/20 rounded-md p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-amber-400 mt-0.5">tips_and_updates</span>
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">Life Coach Tip</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Plan tomorrow tonight before bed. Write down your 3 non-negotiable tasks — the ones that, if completed, make the day a win regardless of what else happens. Start with your highest-leverage activity first thing in the morning.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GOAL VIEW (Weekly / Monthly) ────────────────────────────── */}
      {!loading && isGoalView && (
        <div className="space-y-4">
          {/* Overview Card */}
          <div className="bg-surface-container border border-outline-variant/60 rounded-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                  {activeTab === "weekly" ? "Weekly Goals" : "Monthly Goals"} ·{" "}
                  {activeTab === "weekly"
                    ? `${formatShortDate(weekRange.start)} — ${formatShortDate(weekRange.end)}`
                    : `${formatShortDate(monthRange.start)} — ${formatShortDate(monthRange.end)}`}
                </span>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-label-metric font-label-metric text-on-surface text-2xl">{activeGoals}</span>
                  <span className="text-xs text-on-surface-variant">active</span>
                  {completedGoals > 0 && (
                    <>
                      <span className="text-label-metric font-label-metric text-emerald-400 text-2xl">{completedGoals}</span>
                      <span className="text-xs text-emerald-400/80">completed</span>
                    </>
                  )}
                </div>
              </div>
              {currentGoals.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block mb-0.5">Avg Progress</span>
                  <span className="text-lg font-mono text-on-surface">
                    {currentGoals.length > 0
                      ? Math.round(currentGoals.reduce((acc, g) => acc + g.progressPct, 0) / currentGoals.length)
                      : 0}%
                  </span>
                </div>
              )}
            </div>

            {/* Overall progress bar */}
            {currentGoals.length > 0 && (
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${currentGoals.length > 0 ? Math.round(currentGoals.reduce((acc, g) => acc + g.progressPct, 0) / currentGoals.length) : 0}%`,
                    background:
                      activeTab === "weekly"
                        ? "linear-gradient(90deg, #06b6d4, #10b981)"
                        : "linear-gradient(90deg, #f59e0b, #ffb95f)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentGoals.map((goal) => {
              const isActive = goal.status === "active";
              const isComplete = goal.status === "completed";
              const isEditing = editingGoalId === goal.id;
              const progressColor = goal.progressPct >= 100 ? "#10b981" : goal.progressPct >= 60 ? "#f59e0b" : "#4cd7f6";

              return (
                <div
                  key={goal.id}
                  className={`group bg-surface-container border rounded-md p-4 transition-all hover:border-outline/50 ${
                    isComplete
                      ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                      : "border-outline-variant/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ color: isComplete ? "#10b981" : progressColor, fontVariationSettings: isComplete ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {isComplete ? "verified" : "flag"}
                        </span>
                        <h4 className={`text-sm font-medium truncate ${isComplete ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                          {goal.title}
                        </h4>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{goal.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      {isActive && (
                        <button
                          onClick={() => markGoalComplete(goal.id)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-emerald-400 transition-colors"
                          title="Mark Complete"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-red-400 transition-colors"
                        title="Delete Goal"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-on-surface-variant">
                        {goal.currentValue} / {goal.targetValue} {goal.unit || ""}
                      </span>
                      <span style={{ color: progressColor }}>{goal.progressPct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, goal.progressPct)}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Update Progress */}
                  {isActive && (
                    <div className="mt-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={goal.targetValue}
                            value={editGoalValue}
                            onChange={(e) => setEditGoalValue(parseInt(e.target.value) || 0)}
                            className="w-20 bg-[#0d0d10] border border-outline-variant/80 rounded px-2 py-1 text-xs text-on-surface font-mono focus:border-cyan-400 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") updateGoalProgress(goal.id, editGoalValue);
                              if (e.key === "Escape") setEditingGoalId(null);
                            }}
                          />
                          <span className="text-[10px] text-on-surface-variant font-mono">/ {goal.targetValue}</span>
                          <button
                            onClick={() => updateGoalProgress(goal.id, editGoalValue)}
                            className="px-2 py-1 rounded text-[10px] font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingGoalId(null)}
                            className="px-2 py-1 rounded text-[10px] text-on-surface-variant hover:text-on-surface transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateGoalProgress(goal.id, Math.min(goal.targetValue, goal.currentValue + 1))}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:text-cyan-400 border border-outline-variant/60 hover:border-cyan-500/40 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[12px]">add</span>
                            +1
                          </button>
                          <button
                            onClick={() => {
                              setEditingGoalId(goal.id);
                              setEditGoalValue(goal.currentValue);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/60 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                            Set Value
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {currentGoals.length === 0 && !showAddGoal && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                  {activeTab === "weekly" ? "date_range" : "calendar_month"}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface mb-1">
                  No {activeTab === "weekly" ? "weekly" : "monthly"} goals set
                </p>
                <p className="text-xs text-on-surface-variant">
                  {activeTab === "weekly"
                    ? "Set 3-5 measurable weekly targets. Focus on lead indicators — actions, not outcomes."
                    : "Set 2-3 ambitious monthly milestones. These should stretch you toward your 3-year vision."}
                </p>
              </div>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-on-surface text-surface font-medium text-sm hover:bg-on-surface/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Set {activeTab === "weekly" ? "Weekly" : "Monthly"} Goal
              </button>
            </div>
          )}

          {/* Add Goal Form */}
          {showAddGoal && (
            <div className="bg-surface-container border border-cyan-500/30 rounded-md p-5 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px] text-cyan-400">flag</span>
                <h3 className="text-sm font-semibold text-on-surface">
                  Add {activeTab === "weekly" ? "Weekly" : "Monthly"} Goal
                </h3>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={activeTab === "weekly" ? "e.g., Complete 5 deep work sessions" : "e.g., Ship MVP of side project"}
                  value={newGoal.title}
                  onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-2 text-sm text-on-surface placeholder:text-[#52525b] focus:border-cyan-400 focus:outline-none transition-colors"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addGoal(); } }}
                />

                <input
                  type="text"
                  placeholder="Description / Why this matters (optional)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-2 text-sm text-on-surface placeholder:text-[#52525b] focus:border-cyan-400 focus:outline-none transition-colors"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1 block">Target</label>
                    <input
                      type="number"
                      min={1}
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal((p) => ({ ...p, targetValue: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-1.5 text-sm text-on-surface font-mono focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1 block">Unit</label>
                    <select
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal((p) => ({ ...p, unit: e.target.value }))}
                      className="w-full bg-[#0d0d10] border border-outline-variant/80 rounded px-3 py-1.5 text-sm text-on-surface focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                      <option value="tasks">Tasks</option>
                      <option value="sessions">Sessions</option>
                      <option value="hours">Hours</option>
                      <option value="pages">Pages</option>
                      <option value="reps">Reps</option>
                      <option value="times">Times</option>
                      <option value="items">Items</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-outline-variant/40">
                <button
                  onClick={addGoal}
                  disabled={!newGoal.title.trim() || isAddingGoal}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-on-surface text-surface font-medium text-sm hover:bg-on-surface/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingGoal ? <ButtonSpinner size="sm" /> : <span className="material-symbols-outlined text-[14px]">flag</span>}
                  {isAddingGoal ? "Setting..." : "Set Goal"}
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  disabled={isAddingGoal}
                  className="px-3 py-1.5 rounded-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Goal Button (when goals exist) */}
          {currentGoals.length > 0 && !showAddGoal && (
            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-dashed border-outline-variant/60 text-on-surface-variant hover:text-cyan-400 hover:border-cyan-500/40 text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add {activeTab === "weekly" ? "Weekly" : "Monthly"} Goal
            </button>
          )}

          {/* Life Coach Tips */}
          <div className="bg-surface-container border border-amber-500/20 rounded-md p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-amber-400 mt-0.5">tips_and_updates</span>
            <div>
              <p className="text-sm font-medium text-amber-400 mb-1">Life Coach Insight</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {activeTab === "weekly"
                  ? "Weekly goals should be process-oriented, not outcome-oriented. Instead of 'Get 3 clients', aim for 'Make 15 outreach calls'. Control what you can control — the inputs — and the outputs will follow."
                  : "Monthly goals connect your daily actions to your 3-year vision. Ask yourself: 'If I achieve these 2-3 things this month, will I be meaningfully closer to my long-term trajectory?' If not, recalibrate."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
