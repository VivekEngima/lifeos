"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface LedgerInterval {
  id: string;
  time: string;
  duration: string;
  category: "physical" | "svadhyaya" | "deepwork" | "finance" | "vitality";
  title: string;
  description: string;
  metric?: string;
}

interface LifeOSContextType {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  cleanStreak: number;
  incrementCleanStreak: () => void;
  disciplineScore: number;
  setDisciplineScore: (score: number) => void;
  savedPages: number;
  addReadingPages: (pages: number) => void;
  ledger: LedgerInterval[];
  addLedgerEntry: (entry: Omit<LedgerInterval, "id">) => void;
}

const defaultLedger: LedgerInterval[] = [
  {
    id: "1",
    time: "06:00 AM — 06:45 AM",
    duration: "45 min",
    category: "physical",
    title: "Morning Protocol & Surya Namaskar",
    description:
      "12 standard cycles Surya Namaskar followed by ring calisthenics foundation: pull-ups (4x10) and diaphragm vacuums.",
    metric: "Peak BPM: 154 • 490 kcal",
  },
  {
    id: "2",
    time: "07:15 AM — 08:00 AM",
    duration: "45 min",
    category: "svadhyaya",
    title: "Svādhyāya: Marcus Aurelius 'Meditations'",
    description:
      "Book 8: The Inner Citadel. Reflecting on the unassailable fortress of the governing mind.",
    metric: "pp. 107-142 (35p)",
  },
  {
    id: "3",
    time: "09:30 AM — 01:00 PM",
    duration: "3.5 hrs",
    category: "deepwork",
    title: "Deep Work: Distributed Systems & Go Concurrency",
    description:
      "Engineered modular payment gateway & RFC queue latency mitigation. Buffered channel backpressure tuning.",
    metric: "p99: 1.42ms • Bench verified",
  },
];

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

export function LifeOSProvider({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cleanStreak, setCleanStreak] = useState(42);
  const [disciplineScore, setDisciplineScore] = useState(9);
  const [savedPages, setSavedPages] = useState(142);
  const [ledger, setLedger] = useState<LedgerInterval[]>(defaultLedger);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const incrementCleanStreak = () => setCleanStreak((prev) => prev + 1);
  const addReadingPages = (pages: number) =>
    setSavedPages((prev) => prev + pages);
  const addLedgerEntry = (entry: Omit<LedgerInterval, "id">) => {
    setLedger((prev) => [{ ...entry, id: Date.now().toString() }, ...prev]);
  };

  return (
    <LifeOSContext.Provider
      value={{
        modalOpen,
        setModalOpen,
        cleanStreak,
        incrementCleanStreak,
        disciplineScore,
        setDisciplineScore,
        savedPages,
        addReadingPages,
        ledger,
        addLedgerEntry,
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
