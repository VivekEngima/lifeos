"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { DashboardState, DailyTimeBlock } from "@/lib/lifeos-service";

export interface ActiveDeepWorkTimer {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  topic: string;
  description: string;
}

interface DbStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  dbUrlMasked: string | null;
}

export type ModalType =
  | "daily_2min"
  | "sadhana"
  | "brahmacharya"
  | "sleep"
  | "deepwork"
  | "reading"
  | "expense"
  | "add_money"
  | "income"
  | "deposit"
  | "journal"
  | "db_settings";

export type EditTargetType =
  | "workout"
  | "deepwork"
  | "reading"
  | "sleep"
  | "expense"
  | "custom_goal"
  | "journal"
  | "pune_fund"
  | "brahmacharya"
  | null;

export interface EditModalData {
  type: EditTargetType;
  id?: string;
  data?: any;
}

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "info" | "warning" | "error";
  timestamp: number;
}

interface LifeOSContextType {
  state: DashboardState | null;
  loading: boolean;
  actionLoading: number;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  modalType: ModalType;
  setModalType: (type: ModalType) => void;
  openModal: (type: ModalType) => void;
  dbStatus: DbStatus | null;
  refreshState: () => Promise<void>;
  checkDbStatus: () => Promise<void>;

  // Edit Modal State
  editModal: EditModalData | null;
  openEditModal: (type: EditTargetType, id?: string, data?: any) => void;
  closeEditModal: () => void;

  // Notifications
  notifications: ToastNotification[];
  notify: (
    title: string,
    message?: string,
    type?: "success" | "info" | "warning" | "error"
  ) => void;
  dismissNotification: (id: string) => void;

  // Actions
  toggleHabit: (habitId: string, isCompleted: boolean) => Promise<void>;
  logBrahmacharya: (isClean: boolean, urgesCount: number, notes?: string) => Promise<void>;
  logWorkout: (data: {
    type: string;
    description: string;
    durationMinutes: number;
    cycles?: number;
    suryaKriyaCycles?: number;
    asanaHoldingCount?: number;
    practices?: string[];
    calories?: number;
    peakBpm?: number;
    quality?: string;
  }) => Promise<void>;
  logSleep: (data: {
    startDate?: string;
    endDate?: string;
    durationMinutes: number;
    quality: number;
    deepPct?: number;
    remPct?: number;
    lightPct?: number;
    awakePct?: number;
  }) => Promise<void>;
  logDeepWork: (data: {
    sessionDate?: string;
    topic: string;
    description: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    quality?: string;
    keyInsight?: string;
    referenceLink?: string;
  }) => Promise<void>;

  // Deep Work Live Timer
  activeTimer: ActiveDeepWorkTimer;
  startDeepWorkTimer: (topic?: string, description?: string) => void;
  pauseDeepWorkTimer: () => void;
  resumeDeepWorkTimer: () => void;
  stopAndLogDeepWorkTimer: (customInsight?: string) => Promise<void>;
  discardDeepWorkTimer: () => void;
  updateTimerTopic: (topic: string) => void;

  // Day Time Log
  logDayTimeBlocks: (blocks: DailyTimeBlock[]) => Promise<void>;
  logReading: (data: {
    bookId?: string;
    bookTitle?: string;
    author?: string;
    imageUrl?: string;
    totalPages?: number;
    startPage: number;
    endPage: number;
    durationMinutes?: number;
    insightQuote?: string;
    vaultPath?: string;
  }) => Promise<void>;
  logExpense: (data: {
    title: string;
    amount: number;
    category: string;
    isEssential?: boolean;
  }) => Promise<void>;
  logAddMoney: (data: {
    title: string;
    amount: number;
    category?: string;
    date?: string;
  }) => Promise<void>;
  updateMonthlyBudget: (amount: number) => Promise<void>;
  logIncome: (amountUsd: number) => Promise<void>;
  addDeposit: (amountUsd: number, note?: string) => Promise<void>;
  logJournal: (category: string, content: any) => Promise<void>;
  setDisciplineScore: (score: number) => Promise<void>;
  lockLedger: () => Promise<void>;

  // Books & Reading Vault State
  bookModalOpen: boolean;
  setBookModalOpen: (open: boolean) => void;
  bookModalTab: "currently_reading" | "add_book" | "log_session" | "all_books";
  setBookModalTab: (tab: "currently_reading" | "add_book" | "log_session" | "all_books") => void;
  openBookModal: (initialTab?: "currently_reading" | "add_book" | "log_session" | "all_books") => void;
  addBook: (book: {
    title: string;
    author?: string;
    imageUrl?: string;
    totalPages?: number;
    status?: string;
  }) => Promise<any>;
  updateBook: (
    id: string,
    data: Partial<{
      title: string;
      author: string;
      imageUrl: string;
      totalPages: number;
      status: string;
    }>
  ) => Promise<any>;
  deleteBook: (id: string) => Promise<any>;

  // Deletes & Custom Goals
  deleteWorkout: (id: string) => Promise<void>;
  editWorkout: (id: string, data: any) => Promise<void>;
  deleteDeepWork: (id: string) => Promise<void>;
  editDeepWork: (id: string, data: any) => Promise<void>;
  deleteReading: (id: string) => Promise<void>;
  editReading: (id: string, data: any) => Promise<void>;
  deleteSleep: (id: string) => Promise<void>;
  editSleep: (id: string, data: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteFinanceByDate: (date: string) => Promise<void>;
  editExpense: (id: string, data: any) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  editJournal: (id: string, content: any) => Promise<void>;
  updateFundTarget: (target: number) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addCustomGoal: (goal: {
    title: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    targetDate?: string;
  }) => Promise<void>;
  updateCustomGoal: (id: string, goal: any) => Promise<void>;
  deleteCustomGoal: (id: string) => Promise<void>;
  togglePlannerTask: (taskId: string, currentStatus: string) => Promise<void>;
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

import { getLocalTodayStr, addDaysToDateStr } from "@/lib/date-utils";

export function LifeOSProvider({ children }: { children: React.ReactNode }) {
  // Default to today's local date formatted as YYYY-MM-DD
  const getTodayStr = () => getLocalTodayStr();

  const [selectedDate, setSelectedDate] = useState(getLocalTodayStr());
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Wraps any async action to increment/decrement actionLoading counter
  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setActionLoading((c) => c + 1);
    try {
      return await fn();
    } finally {
      setActionLoading((c) => Math.max(0, c - 1));
    }
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("daily_2min");
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  // Deep Work Focus Live Timer State
  const initialTimerState: ActiveDeepWorkTimer = {
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedSeconds: 0,
    topic: "",
    description: "",
  };
  const [activeTimer, setActiveTimer] = useState<ActiveDeepWorkTimer>(initialTimerState);

  // Restore live timer from localStorage upon mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lifeos_deepwork_timer");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.isRunning) {
            if (!parsed.isPaused && parsed.startTime) {
              const currentElapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
              setActiveTimer({ ...parsed, elapsedSeconds: Math.max(0, currentElapsed) });
            } else {
              setActiveTimer(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Failed to restore timer from localStorage", err);
      }
    }
  }, []);

  // Tick running timer every second
  useEffect(() => {
    if (!activeTimer.isRunning || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev.isRunning || prev.isPaused) return prev;
        const now = Date.now();
        const currentElapsed = prev.startTime
          ? Math.max(0, Math.floor((now - prev.startTime) / 1000))
          : prev.elapsedSeconds + 1;
        const updated = { ...prev, elapsedSeconds: currentElapsed };
        try {
          localStorage.setItem("lifeos_deepwork_timer", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer.isRunning, activeTimer.isPaused]);

  // Dedicated Book Reading Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookModalTab, setBookModalTab] = useState<"currently_reading" | "add_book" | "log_session" | "all_books">("currently_reading");

  const openBookModal = (tab: "currently_reading" | "add_book" | "log_session" | "all_books" = "currently_reading") => {
    setBookModalTab(tab);
    setBookModalOpen(true);
  };

  // Edit Modal State
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const openEditModal = (type: EditTargetType, id?: string, data?: any) => {
    setEditModal({ type, id, data });
  };
  const closeEditModal = () => {
    setEditModal(null);
  };

  // Global Escape key listener for all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editModal) {
          closeEditModal();
        } else if (bookModalOpen) {
          setBookModalOpen(false);
        } else if (modalOpen) {
          setModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editModal, bookModalOpen, modalOpen]);

  // Notification Toast State
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (
      title: string,
      message?: string,
      type: "success" | "info" | "warning" | "error" = "success"
    ) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      const newNotification: ToastNotification = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [...prev.slice(-3), newNotification]);

      // Subtle Web Audio chime for physical feedback
      try {
        if (typeof window !== "undefined") {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === "success") {
              osc.type = "sine";
              osc.frequency.setValueAtTime(587.33, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
              gain.gain.setValueAtTime(0.025, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
              osc.start();
              osc.stop(ctx.currentTime + 0.25);
            }
          }
        }
      } catch {
        // Safe silent fallback
      }
    },
    []
  );

  const openModal = (type: ModalType) => {
    if (type === "reading") {
      openBookModal("currently_reading");
      return;
    }
    setModalType(type);
    setModalOpen(true);
  };

  const goToPreviousDay = () => {
    setSelectedDate(addDaysToDateStr(selectedDate, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDaysToDateStr(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(getLocalTodayStr());
  };

  const refreshState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed to fetch state from Supabase");
      const data: DashboardState = await res.json();
      setState(data);
      setError(null);
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Dashboard fetch error:", e);
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const checkDbStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/db-status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.warn("Failed to check DB status", err);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    checkDbStatus();
  }, [checkDbStatus]);

  // Global keyboard shortcut: Cmd+L or Ctrl+L opens Quick 2-Min Daily Check-in
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        openModal("daily_2min");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleHabit = async (habitId: string, isCompleted: boolean) => {
    // Optimistic update
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        habits: prev.habits.map((h) => (h.id === habitId ? { ...h, isCompleted } : h)),
        pillarsMet: isCompleted ? prev.pillarsMet + 1 : Math.max(0, prev.pillarsMet - 1),
      };
    });

    await withLoading(async () => {
      try {
        const res = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, date: selectedDate, isCompleted }),
        });
        if (res.ok) {
          notify(
            isCompleted ? "Vow Fulfilled" : "Vow Reset",
            "Habit status updated in Supabase",
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Habit toggle error:", err);
        notify("Failed to Update Vow", "Could not reach database", "error");
      }
    });
  };

  const logBrahmacharya = async (isClean: boolean, urgesCount: number, notes?: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/brahmacharya", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate, isClean, urgesCount, notes }),
        });
        if (res.ok) {
          notify(
            "Vitality Ledger Sealed",
            isClean
              ? "Clean transmuted day recorded in Supabase"
              : `${urgesCount} urge(s) surfed and recorded`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Brahmacharya update error:", err);
        notify("Brahmacharya Log Error", "Could not save to Supabase", "error");
      }
    });
  };

  const logWorkout = async (data: {
    type: string;
    description: string;
    durationMinutes: number;
    cycles?: number;
    suryaKriyaCycles?: number;
    asanaHoldingCount?: number;
    practices?: string[];
    calories?: number;
    peakBpm?: number;
    quality?: string;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/workout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionDate: selectedDate, ...data }),
        });
        if (res.ok) {
          notify(
            "Sadhana Session Logged",
            `${data.durationMinutes}m ${data.type.replace(/_/g, " ")} recorded in Supabase`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Workout log error:", err);
        notify("Sadhana Log Error", "Could not record workout", "error");
      }
    });
  };

  const logSleep = async (data: {
    startDate?: string;
    endDate?: string;
    durationMinutes: number;
    quality: number;
    deepPct?: number;
    remPct?: number;
    lightPct?: number;
    awakePct?: number;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/sleep", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sleepDate: data.endDate || selectedDate,
            startDate: data.startDate || selectedDate,
            endDate: data.endDate || selectedDate,
            ...data,
          }),
        });
        if (res.ok) {
          notify(
            "Sleep Telemetry Logged",
            `${Math.floor(data.durationMinutes / 60)}h ${data.durationMinutes % 60}m recorded (Score: ${data.quality}/100)`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Sleep log error:", err);
        notify("Sleep Log Error", "Could not record sleep", "error");
      }
    });
  };

  const logDeepWork = async (data: {
    sessionDate?: string;
    topic: string;
    description: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    quality?: string;
    keyInsight?: string;
    referenceLink?: string;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/deep-work", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionDate: data.sessionDate || selectedDate, ...data }),
        });
        if (res.ok) {
          notify(
            "Deep Work Session Verified",
            `${data.durationMinutes}m focus on "${data.topic}" committed`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Deep work log error:", err);
        notify("Deep Work Log Error", "Could not record session", "error");
      }
    });
  };

  const startDeepWorkTimer = (topic?: string, description?: string) => {
    const defaultTopic = topic?.trim() || "Engineering Income Work";
    const defaultDesc = description?.trim() || "Deep work focus block";
    const now = Date.now();
    const newTimer: ActiveDeepWorkTimer = {
      isRunning: true,
      isPaused: false,
      startTime: now,
      elapsedSeconds: 0,
      topic: defaultTopic,
      description: defaultDesc,
    };
    setActiveTimer(newTimer);
    try {
      localStorage.setItem("lifeos_deepwork_timer", JSON.stringify(newTimer));
    } catch {}
    notify(
      "Deep Work Timer Started",
      `Session tracking started: "${defaultTopic}"`,
      "info"
    );
  };

  const pauseDeepWorkTimer = () => {
    setActiveTimer((prev) => {
      const updated = { ...prev, isPaused: true };
      try {
        localStorage.setItem("lifeos_deepwork_timer", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resumeDeepWorkTimer = () => {
    setActiveTimer((prev) => {
      const now = Date.now();
      const newStartTime = now - prev.elapsedSeconds * 1000;
      const updated = { ...prev, isPaused: false, startTime: newStartTime };
      try {
        localStorage.setItem("lifeos_deepwork_timer", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateTimerTopic = (topic: string) => {
    setActiveTimer((prev) => {
      const updated = { ...prev, topic };
      try {
        localStorage.setItem("lifeos_deepwork_timer", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const stopAndLogDeepWorkTimer = async (customInsight?: string) => {
    if (!activeTimer.isRunning && activeTimer.elapsedSeconds === 0) return;

    const seconds = activeTimer.elapsedSeconds;
    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    const startDate = activeTimer.startTime
      ? new Date(activeTimer.startTime)
      : new Date(Date.now() - seconds * 1000);
    const endDate = new Date();

    const pad = (n: number) => String(n).padStart(2, "0");
    const startTime = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
    const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

    const sessionTopic = activeTimer.topic.trim() || "Deep Work Focus Session";
    const sessionDesc = activeTimer.description.trim() || `Focus timer session (${durationMinutes}m)`;

    // Clear active timer state
    setActiveTimer(initialTimerState);
    try {
      localStorage.removeItem("lifeos_deepwork_timer");
    } catch {}

    await logDeepWork({
      sessionDate: selectedDate || getLocalTodayStr(),
      topic: sessionTopic,
      description: sessionDesc,
      startTime,
      endTime,
      durationMinutes,
      quality: "Session Verified",
      keyInsight: customInsight || "Timer focus block verified & completed.",
    });

    notify(
      "Deep Work Automatically Logged!",
      `${(durationMinutes / 60).toFixed(1)} hrs (${durationMinutes} mins) focus on "${sessionTopic}" committed`,
      "success"
    );
  };

  const discardDeepWorkTimer = () => {
    setActiveTimer(initialTimerState);
    try {
      localStorage.removeItem("lifeos_deepwork_timer");
    } catch {}
    notify("Timer Discarded", "Active focus timer stopped without logging", "info");
  };

  const logDayTimeBlocks = async (blocks: DailyTimeBlock[]) => {
    await logJournal("day_time_log", blocks);
  };

  const logReading = async (data: {
    bookId?: string;
    bookTitle?: string;
    author?: string;
    startPage: number;
    endPage: number;
    durationMinutes?: number;
    insightQuote?: string;
    vaultPath?: string;
    imageUrl?: string;
    totalPages?: number;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionDate: selectedDate, ...data }),
        });
        if (res.ok) {
          notify(
            "Reading Logged",
            `+${Math.max(0, data.endPage - data.startPage)} pages of "${data.bookTitle || "book"}" synced`,
            "success"
          );
        } else {
          const errJson = await res.json();
          throw new Error(errJson.error || "Failed to log reading");
        }
        await refreshState();
      } catch (err: any) {
        console.error("Reading log error:", err);
        notify("Reading Log Error", err?.message || "Could not record reading", "error");
        throw err;
      }
    });
  };

  const addBook = async (bookData: {
    title: string;
    author?: string;
    imageUrl?: string;
    totalPages?: number;
    status?: string;
  }) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add book");
      notify("Book Added", `"${bookData.title}" added to your books vault`, "success");
      await refreshState();
      return data;
    } catch (err: any) {
      console.error("Add book error:", err);
      notify("Error Adding Book", err?.message || "Could not add book", "error");
      throw err;
    }
  };

  const updateBook = async (
    id: string,
    bookData: Partial<{
      title: string;
      author: string;
      imageUrl: string;
      totalPages: number;
      status: string;
    }>
  ) => {
    try {
      const res = await fetch("/api/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...bookData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update book");
      notify("Book Updated", "Book details saved", "success");
      await refreshState();
      return data;
    } catch (err: any) {
      console.error("Update book error:", err);
      notify("Error Updating Book", err?.message || "Could not update book", "error");
      throw err;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const res = await fetch(`/api/books?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete book");
      notify("Book Deleted", "Book and sessions removed", "info");
      await refreshState();
      return data;
    } catch (err: any) {
      console.error("Delete book error:", err);
      notify("Error Deleting Book", err?.message || "Could not delete book", "error");
      throw err;
    }
  };

  const logExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    isEssential?: boolean;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            title: data.title,
            amount: data.amount > 0 ? -data.amount : data.amount,
            category: data.category,
            isEssential: data.isEssential ?? true,
          }),
        });
        if (res.ok) {
          notify(
            "Financial Ledger Updated",
            `₹${Math.abs(data.amount)} recorded (${data.title})`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Expense log error:", err);
        notify("Expense Log Error", "Could not record expense", "error");
      }
    });
  };

  const logAddMoney = async (data: {
    title: string;
    amount: number;
    category?: string;
    date?: string;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: data.date || selectedDate,
            title: data.title || "Added Funds",
            amount: Math.abs(data.amount),
            category: data.category || "income",
            isEssential: true,
          }),
        });
        if (res.ok) {
          notify(
            "Money Added to Financial Velocity",
            `+₹${Math.abs(data.amount).toLocaleString()} added (${data.title || "Funds"})`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Add money error:", err);
        notify("Add Money Error", "Could not record added funds", "error");
      }
    });
  };

  const updateMonthlyBudget = async (amount: number) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "monthly_budget",
            amount: Math.abs(amount),
          }),
        });
        if (res.ok) {
          notify(
            "Monthly Budget Updated",
            `Monthly allowance set to ₹${Math.abs(amount).toLocaleString()}`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Budget update error:", err);
        notify("Budget Update Error", "Could not update monthly allowance", "error");
      }
    });
  };

  const logIncome = async (amountUsd: number) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "income",
            date: selectedDate,
            amount: amountUsd,
          }),
        });
        if (res.ok) {
          notify(
            "Income Inflow Recorded",
            `+$${amountUsd} USD added to weekly pacing target`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Income log error:", err);
        notify("Income Log Error", "Could not record income", "error");
      }
    });
  };

  const addDeposit = async (amountUsd: number, note?: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountUsd, note }),
        });
        if (res.ok) {
          notify(
            "Pune Sovereignty Deposit Added",
            `+$${amountUsd} USD allocated to Pune Relocation Fund`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Deposit log error:", err);
        notify("Deposit Error", "Could not record deposit", "error");
      }
    });
  };

  const logJournal = async (category: string, content: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate, category, content }),
        });
        if (res.ok) {
          notify(
            "Journal Committed",
            `${category.replace(/_/g, " ").toUpperCase()} saved to Supabase`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Journal log error:", err);
        notify("Journal Error", "Could not save entry", "error");
      }
    });
  };

  const setDisciplineScore = async (score: number) => {
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, disciplineRating: score, dayIntegrityScore: score };
    });

    await withLoading(async () => {
      try {
        const res = await fetch("/api/discipline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate, score }),
        });
        if (res.ok) {
          notify(
            "Discipline Rating Sealed",
            `Integrity score set to ${score} / 10 for ${selectedDate}`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Discipline update error:", err);
        notify("Discipline Error", "Could not update rating", "error");
      }
    });
  };

  const lockLedger = async () => {
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, isLocked: true };
    });

    await withLoading(async () => {
      try {
        const res = await fetch("/api/lock-ledger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate }),
        });
        if (res.ok) {
          notify(
            "Daily Ledger Frozen",
            `All telemetry snapshots sealed in Supabase for ${selectedDate}`,
            "success"
          );
        }
        await refreshState();
      } catch (err) {
        console.error("Lock ledger error:", err);
        notify("Lock Error", "Could not lock ledger", "error");
      }
    });
  };

  const deleteWorkout = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/workout?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Workout Deleted", "Sadhana session removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove workout", "error");
      }
    });
  };

  const deleteDeepWork = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/deep-work?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Deep Work Deleted", "Focus block removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove deep work session", "error");
      }
    });
  };

  const deleteReading = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/reading?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Reading Deleted", "Pages log removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove reading session", "error");
      }
    });
  };

  const deleteExpense = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Transaction Deleted", "Ledger entry removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove transaction", "error");
      }
    });
  };

  const deleteFinanceByDate = async (date: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/finance?date=${date}`, { method: "DELETE" });
        if (res.ok) {
          const data = await res.json();
          notify(
            "Finance Logs Cleared",
            `${data.deletedCount || 0} transaction(s) removed for ${date}`,
            "info"
          );
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not clear finance logs for date", "error");
      }
    });
  };

  const deleteHabit = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Vow Removed", "Habit deleted from active vows", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove habit", "error");
      }
    });
  };

  const addCustomGoal = async (goal: {
    title: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    targetDate?: string;
  }) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/custom-goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        });
        if (res.ok) {
          notify("Goal Created", `"${goal.title}" active in tactical milestones`, "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Failed to Create Goal", "Could not reach database", "error");
      }
    });
  };

  const updateCustomGoal = async (id: string, goal: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/custom-goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...goal }),
        });
        if (res.ok) {
          notify("Goal Updated", "Milestone progress synced", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Failed to Update Goal", "Could not reach database", "error");
      }
    });
  };

  const deleteCustomGoal = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/custom-goals?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Goal Deleted", "Milestone removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Failed to Delete Goal", "Could not reach database", "error");
      }
    });
  };

  const editWorkout = async (id: string, data: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/workout", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        if (res.ok) {
          notify("Workout Updated", "Movement session updated", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update workout", "error");
      }
    });
  };

  const editDeepWork = async (id: string, data: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/deep-work", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        if (res.ok) {
          notify("Deep Work Updated", "Focus block session updated", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update focus session", "error");
      }
    });
  };

  const editReading = async (id: string, data: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/reading", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        if (res.ok) {
          notify("Reading Updated", "Book progress updated", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update reading log", "error");
      }
    });
  };

  const deleteSleep = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/sleep?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Sleep Log Deleted", "Recovery metrics cleared", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not remove sleep log", "error");
      }
    });
  };

  const editSleep = async (id: string, data: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/sleep", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        if (res.ok) {
          notify("Sleep Updated", "Rest metrics updated", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update sleep metrics", "error");
      }
    });
  };

  const editExpense = async (id: string, data: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        });
        if (res.ok) {
          notify("Transaction Updated", "Ledger entry updated", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update transaction", "error");
      }
    });
  };

  const deleteJournal = async (id: string) => {
    await withLoading(async () => {
      try {
        const res = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          notify("Reflection Deleted", "Thought entry removed", "info");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Delete Failed", "Could not delete entry", "error");
      }
    });
  };

  const editJournal = async (id: string, content: any) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/journal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, content }),
        });
        if (res.ok) {
          notify("Reflection Updated", "Journal entry sealed", "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update entry", "error");
      }
    });
  };

  const updateFundTarget = async (target: number) => {
    await withLoading(async () => {
      try {
        const res = await fetch("/api/pune-fund", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target }),
        });
        if (res.ok) {
          notify("Target Updated", `Horizon fund target set to $${target}`, "success");
        }
        await refreshState();
      } catch (err) {
        console.error(err);
        notify("Update Failed", "Could not update fund target", "error");
      }
    });
  };

  const togglePlannerTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        todayTasks: (prev.todayTasks || []).map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        ),
      };
    });
    try {
      const res = await fetch("/api/planner/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task status");
    } catch (err) {
      console.error("Error toggling planner task:", err);
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayTasks: (prev.todayTasks || []).map((t) =>
            t.id === taskId ? { ...t, status: currentStatus } : t
          ),
        };
      });
      notify("Failed to Update Task", "Could not sync with database", "error");
    }
  };

  return (
    <LifeOSContext.Provider
      value={{
        state,
        loading,
        actionLoading,
        error,
        selectedDate,
        setSelectedDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        modalOpen,
        setModalOpen,
        modalType,
        setModalType,
        openModal,
        editModal,
        openEditModal,
        closeEditModal,
        dbStatus,
        refreshState,
        checkDbStatus,
        notifications,
        notify,
        dismissNotification,
        toggleHabit,
        logBrahmacharya,
        logWorkout,
        logSleep,
        logDeepWork,
        activeTimer,
        startDeepWorkTimer,
        pauseDeepWorkTimer,
        resumeDeepWorkTimer,
        stopAndLogDeepWorkTimer,
        discardDeepWorkTimer,
        updateTimerTopic,
        logDayTimeBlocks,
        logReading,
        logExpense,
        logAddMoney,
        updateMonthlyBudget,
        logIncome,
        addDeposit,
        logJournal,
        setDisciplineScore,
        lockLedger,
        deleteWorkout,
        editWorkout,
        deleteDeepWork,
        editDeepWork,
        deleteReading,
        editReading,
        deleteSleep,
        editSleep,
        deleteExpense,
        deleteFinanceByDate,
        editExpense,
        deleteJournal,
        editJournal,
        updateFundTarget,
        deleteHabit,
        addCustomGoal,
        updateCustomGoal,
        deleteCustomGoal,
        bookModalOpen,
        setBookModalOpen,
        bookModalTab,
        setBookModalTab,
        openBookModal,
        addBook,
        updateBook,
        deleteBook,
        togglePlannerTask,
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
}

export function useLifeOS() {
  const ctx = useContext(LifeOSContext);
  if (!ctx) throw new Error("useLifeOS must be used within LifeOSProvider");
  return ctx;
}

