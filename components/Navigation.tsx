"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLifeOS } from "@/context/LifeOSContext";

export default function Navigation() {
  const pathname = usePathname();
  const { setModalOpen } = useLifeOS();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Daily Log", href: "/daily-log" },
    { label: "Streaks & Heatmap", href: "/streaks-heatmap" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0d12]/90 backdrop-blur-md border-b border-outline-variant/70">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-outline-variant/40">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.65)]" />
              <span className="font-semibold tracking-tight text-on-surface text-base">
                LifeOS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-surface-container-high text-cyan-400 border border-cyan-500/20">
                v2.5
              </span>
            </Link>
            <span className="text-xs text-on-surface-variant hidden md:inline ml-2 pl-3 border-l border-outline-variant/60 font-mono">
              Core Protocol &amp; Personal Ledger
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-container text-xs font-mono text-on-surface-variant border border-outline-variant/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Horizon Pacing:{" "}
                <strong className="text-emerald-400 font-medium">
                  Nominal
                </strong>
              </span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 text-[#002730] font-medium text-xs hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">
                bolt
              </span>
              <span>Quick Check-in</span>
              <kbd className="ml-1 px-1 rounded text-[10px] font-mono bg-cyan-900/40 text-cyan-100">
                ⌘L
              </kbd>
            </button>

            <button
              onClick={() => {
                const amt = prompt("Log quick expense amount in ₹:", "150");
                if (amt) alert(`Expense logged: ₹${amt}`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-medium transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-400">
                payments
              </span>
              <span className="hidden sm:inline">Log Expense</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-md bg-surface-container-high border border-outline-variant flex items-center justify-center text-cyan-400 hover:border-cyan-500/50 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  account_circle
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded bg-surface-container-high border border-outline-variant/80 shadow-2xl py-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-outline-variant/40">
                    <p className="font-medium text-on-surface">Alex Thorne</p>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      operator@lifeos.lan
                    </p>
                  </div>
                  <div className="px-3 py-2 text-on-surface-variant hover:text-on-surface cursor-pointer">
                    Security Protocol
                  </div>
                  <div className="px-3 py-2 text-error cursor-pointer">
                    Lock Terminal
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-8 h-11 overflow-x-auto scrollbar-none text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center h-full border-b-2 px-0.5 tracking-wide transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-cyan-400 border-cyan-400 font-semibold"
                    : "text-on-surface-variant hover:text-on-surface border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
