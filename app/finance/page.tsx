"use client";

import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { formatDayFullWithOrdinal } from "@/lib/date-utils";

export default function FinancePage() {
  const {
    state,
    selectedDate,
    openModal,
    logExpense,
    logAddMoney,
    logIncome,
    addDeposit,
    deleteExpense,
    deleteFinanceByDate,
  } = useLifeOS();

  const [confirmDeleteDate, setConfirmDeleteDate] = useState(false);
  const [isClearingDate, setIsClearingDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [isEssential, setIsEssential] = useState(true);

  // Quick form toggle: spend vs add money
  const [financeFormTab, setFinanceFormTab] = useState<"spend" | "add_money">("spend");
  const [addMoneyTitle, setAddMoneyTitle] = useState("");
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyCategory, setAddMoneyCategory] = useState("income");

  const [incomeAmount, setIncomeAmount] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("Sovereignty allocation");
  const [showingDeposit, setShowingDeposit] = useState(false);

  const transactions = state?.finance?.transactionsToday || [];
  const totalSpentInr = state?.finance?.totalSpentTodayInr || 0;
  const monthlySpentInr = state?.finance?.monthlySpentInr ?? 0;
  const monthlyAddedInr = state?.finance?.monthlyAddedInr ?? 0;
  const totalMonthlyPoolInr = state?.finance?.totalMonthlyPoolInr ?? (state?.finance?.monthlyBudgetInr ?? 2000);
  const monthlyRemainingInr = state?.finance?.monthlyRemainingInr ?? 2000;
  const monthlyBudgetInr = state?.finance?.monthlyBudgetInr ?? 2000;
  const cycleLabel = state?.finance?.cycleLabel ?? "1st – End of Month";
  const daysUntilReset = state?.finance?.daysUntilReset ?? 0;
  const transactionsCycle = state?.finance?.transactionsCycle ?? transactions;
  const earnedTodayUsd = state?.finance?.earnedTodayUsd || 0;
  const weeklyEarnedUsd = state?.finance?.weeklyEarnedUsd || 0;
  const weeklyTargetUsd = state?.finance?.weeklyTargetUsd || 750;
  const weeklyPct = Math.round((weeklyEarnedUsd / (weeklyTargetUsd || 1)) * 100);

  const pune = state?.puneFund || {
    title: "Pune Relocation & Sovereignty Fund",
    target: 5000,
    accumulated: 0,
    remaining: 5000,
    pctCompleted: 0,
    daysLeft: 742,
    monthlyFlow: 350,
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    setIsSubmitting(true);
    try {
      await logExpense({
        title,
        amount: Math.abs(Number(amount)),
        category,
        isEssential,
      });
      setTitle("");
      setAmount("");
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (incomeAmount === "") return;
    setIsSubmitting(true);
    try {
      await logIncome(Number(incomeAmount));
      setIncomeAmount("");
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
      setShowingDeposit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateLabel = (dStr: string) => {
    try {
      return formatDayFullWithOrdinal(dStr);
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
            Financial Sovereignty &amp; Spending Engine
          </h1>
          <p className="text-[#a1a1aa] text-[11px] mt-0.5">
            Date: {formatDateLabel(selectedDate)} • INR Cashflow &amp; USD Sovereignty
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowingDeposit(!showingDeposit)}
            className="px-3 py-1.5 rounded-[4px] bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] text-xs font-mono transition-colors"
          >
            {showingDeposit ? "Cancel Deposit" : "Add Sovereignty Deposit ($)"}
          </button>
          <button
            onClick={() => openModal("add_money")}
            className="px-3 py-1.5 rounded-[4px] bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add Money (₹)</span>
          </button>
          <button
            onClick={() => openModal("expense")}
            className="px-3 py-1.5 rounded-[4px] bg-[#f4f4f5] text-[#09090b] font-semibold text-xs font-mono hover:bg-[#e4e4e7] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
            <span>Log Spend (₹)</span>
          </button>
        </div>
      </div>

      {/* Deposit Form if active */}
      {showingDeposit && (
        <form onSubmit={handleDepositSubmit} className="p-4 bg-[#121215] border border-[#06b6d4]/40 rounded-[4px] flex flex-col sm:flex-row items-center gap-3 font-mono text-xs">
          <span className="text-[#06b6d4] font-bold">New Sovereignty Deposit:</span>
          <input
            type="number"
            placeholder="Amount in USD ($)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-2 text-xs text-[#10b981] font-bold focus:border-[#06b6d4] focus:outline-none w-40"
          />
          <input
            type="text"
            placeholder="Note (e.g. Monthly allocation)"
            value={depositNote}
            onChange={(e) => setDepositNote(e.target.value)}
            className="flex-1 bg-[#0e0e11] border border-[#27272a] rounded-[4px] p-2 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#f4f4f5] text-[#09090b] font-semibold text-xs rounded-[4px] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting && <ButtonSpinner className="w-3 h-3" />}
            <span>Record in Supabase</span>
          </button>
        </form>
      )}

      {/* Primary Freedom Fund Progress */}
      <div className="bg-[#121215] p-5 sm:p-6 rounded-[4px] border border-[#1e1e24]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1e1e24] gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold tracking-wider">
              Primary Sovereignty Allocation
            </span>
            <h2 className="text-lg font-semibold text-[#f4f4f5] tracking-tight">
              {pune.title}
            </h2>
            <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
              Target: ${pune.target.toLocaleString()} USD Cap • {pune.daysLeft} Days to Horizon
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-xl font-bold text-[#06b6d4]">
              ${pune.accumulated.toLocaleString()}
            </span>
            <span className="text-xs text-[#71717a] block">
              / ${pune.target.toLocaleString()} ({pune.pctCompleted}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="w-full h-2 rounded-[2px] bg-[#0e0e11] overflow-hidden border border-[#1e1e24]">
            <div
              className="h-full bg-gradient-to-r from-[#06b6d4] to-[#10b981] rounded-[2px] transition-all"
              style={{ width: `${pune.pctCompleted}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0e0e11] p-3 rounded-[4px] border border-[#1e1e24]">
            <span className="text-[10px] text-[#71717a] uppercase block">Flow Rate</span>
            <span className="text-[#10b981] font-semibold">+${pune.monthlyFlow} / month</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-[4px] border border-[#1e1e24]">
            <span className="text-[10px] text-[#71717a] uppercase block">Remaining</span>
            <span className="text-[#f4f4f5] font-semibold">${pune.remaining.toLocaleString()} USD</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-[4px] border border-[#1e1e24]">
            <span className="text-[10px] text-[#71717a] uppercase block">Trajectory</span>
            <span className="text-[#10b981] font-semibold">Feb 2027 (Ahead)</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-[4px] border border-[#1e1e24]">
            <span className="text-[10px] text-[#71717a] uppercase block">Days Remaining</span>
            <span className="text-[#06b6d4] font-semibold">{pune.daysLeft} Days</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Weekly Target Pacing & Daily Income Logging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly $750 Target Pacing */}
        <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[#1e1e24]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717a]">
                  Weekly Inflow Pacing
                </span>
                <h3 className="text-sm font-semibold text-[#f4f4f5]">
                  Total Earned vs. $750 Weekly Target
                </h3>
              </div>
              <span className="text-xs font-mono text-[#10b981] font-bold">
                {weeklyPct}% Paced
              </span>
            </div>

            <div className="my-4">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#a1a1aa]">${weeklyEarnedUsd} total earned</span>
                <span className="text-[#10b981]">${weeklyTargetUsd} quota ($3k ÷ 4)</span>
              </div>
              <div className="w-full h-2 rounded-[2px] bg-[#0e0e11] overflow-hidden border border-[#1e1e24]">
                <div
                  className="h-full bg-[#10b981] rounded-[2px]"
                  style={{ width: `${Math.min(100, weeklyPct)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-[#0e0e11] rounded-[4px] border border-[#1e1e24] text-xs font-mono text-[#a1a1aa] space-y-1">
              <div className="flex justify-between">
                <span>Earned for {selectedDate}:</span>
                <strong className="text-[#10b981]">${earnedTodayUsd} USD</strong>
              </div>
              <div className="flex justify-between">
                <span>Distance to Quota:</span>
                <span className="text-[#f4f4f5]">${Math.max(0, weeklyTargetUsd - weeklyEarnedUsd)} USD</span>
              </div>
            </div>
          </div>

          {/* Quick Income Log Form */}
          <form onSubmit={handleIncomeSubmit} className="mt-4 pt-3 border-t border-[#1e1e24] flex items-center gap-2">
            <input
              type="number"
              placeholder={`Log earned $ for ${selectedDate} (even $0)`}
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
              className="flex-1 bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-3 py-1.5 text-xs text-[#f4f4f5] font-mono focus:border-[#06b6d4] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-[#f4f4f5] text-[#09090b] font-semibold text-xs font-mono rounded-[4px] hover:bg-[#e4e4e7] transition-all whitespace-nowrap flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting && <ButtonSpinner className="w-3 h-3" />}
              <span>Log Income $</span>
            </button>
          </form>
        </div>

        {/* Monthly Spend & Inflow Engine (Allowance Resets Every 1st) */}
        <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[#1e1e24]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#06b6d4] font-semibold">
                  Monthly Budget ({cycleLabel})
                </span>
                <h3 className="text-sm font-semibold text-[#f4f4f5]">
                  Allowance: ₹{monthlyBudgetInr.toLocaleString()} (Resets on 1st)
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-lg font-bold text-[#f4f4f5]">
                  ₹{monthlySpentInr.toLocaleString()} Spent
                </span>
                <div className="flex items-center justify-end gap-1.5 text-xs">
                  {monthlyAddedInr > 0 && (
                    <span className="text-emerald-400 font-bold">
                      +₹{monthlyAddedInr.toLocaleString()} Added •
                    </span>
                  )}
                  <span className={`block ${monthlyRemainingInr < 0 ? "text-rose-400" : "text-[#10b981]"}`}>
                    ₹{monthlyRemainingInr.toLocaleString()} Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Budget Progress Bar */}
            <div className="my-3">
              <div className="flex justify-between text-[11px] font-mono mb-1 text-[#a1a1aa]">
                <span>
                  {Math.min(100, Math.round((monthlySpentInr / (totalMonthlyPoolInr || 1)) * 100))}% of ₹{totalMonthlyPoolInr} pool used
                </span>
                <span>Resets in {daysUntilReset} days</span>
              </div>
              <div className="w-full h-1.5 rounded-[2px] bg-[#0e0e11] overflow-hidden border border-[#1e1e24]">
                <div
                  className={`h-full rounded-[2px] transition-all ${
                    monthlyRemainingInr < 0
                      ? "bg-rose-500"
                      : monthlySpentInr / (totalMonthlyPoolInr || 1) > 0.85
                      ? "bg-amber-400"
                      : "bg-[#10b981]"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((monthlySpentInr / (totalMonthlyPoolInr || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Form Tabs: Spend vs Add Money */}
            <div className="flex items-center gap-2 mt-4 mb-2 border-b border-[#1e1e24]/60 pb-2">
              <button
                type="button"
                onClick={() => setFinanceFormTab("spend")}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  financeFormTab === "spend"
                    ? "bg-[#18181b] text-[#f4f4f5] border border-[#27272a] font-bold"
                    : "text-[#71717a] hover:text-[#a1a1aa]"
                }`}
              >
                Log Spend (-₹)
              </button>
              <button
                type="button"
                onClick={() => setFinanceFormTab("add_money")}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  financeFormTab === "add_money"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold"
                    : "text-[#71717a] hover:text-emerald-400"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                <span>Add Money (+₹)</span>
              </button>
            </div>

            {/* Quick Spend Log Form */}
            {financeFormTab === "spend" ? (
              <form onSubmit={handleExpenseSubmit} className="my-2 flex flex-col gap-2.5 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Spend title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="sm:col-span-2 bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2.5 py-1.5 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none font-sans"
                  />
                  <input
                    type="number"
                    placeholder="₹ amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2.5 py-1.5 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2 py-1 text-xs text-[#f4f4f5] focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="food">food (Sattvic &amp; Groceries)</option>
                    <option value="books">books (Reading Logs &amp; Philosophy)</option>
                    <option value="transport">transport &amp; Fuel</option>
                    <option value="utilities">utilities &amp; Gear</option>
                    <option value="general">general</option>
                  </select>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#a1a1aa]">
                    <input
                      type="checkbox"
                      checked={isEssential}
                      onChange={(e) => setIsEssential(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-[2px] accent-[#10b981]"
                    />
                    <span>Essential</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] text-xs font-mono rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting && <ButtonSpinner className="w-3 h-3" />}
                    <span>Log Spend</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Quick Add Money Form */
              <form onSubmit={handleAddMoneySubmit} className="my-2 flex flex-col gap-2.5 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Source / Description (e.g. Monthly Top-up, Freelance)..."
                    value={addMoneyTitle}
                    onChange={(e) => setAddMoneyTitle(e.target.value)}
                    className="sm:col-span-2 bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2.5 py-1.5 text-xs text-[#f4f4f5] focus:border-emerald-500 focus:outline-none font-sans"
                  />
                  <input
                    type="number"
                    placeholder="+₹ amount"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    className="bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={addMoneyCategory}
                    onChange={(e) => setAddMoneyCategory(e.target.value)}
                    className="bg-[#0e0e11] border border-[#27272a] rounded-[4px] px-2 py-1 text-xs text-[#f4f4f5] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="income">Income &amp; Direct Earnings</option>
                    <option value="allowance">Monthly Allowance / Pocket Money</option>
                    <option value="freelance">Freelance &amp; Client Payment</option>
                    <option value="bonus">Bonus &amp; Incentives</option>
                    <option value="gift">Gift / Family Transfer</option>
                    <option value="refund">Reimbursement &amp; Refund</option>
                    <option value="general">General Top-Up</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting && <ButtonSpinner className="w-3 h-3" />}
                    <span>+ Add Money</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-[11px] font-mono text-[#71717a]">
            Monthly allowance resets on the 1st of every month. Base cap: ₹{monthlyBudgetInr.toLocaleString()}.
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table for Current Monthly Cycle */}
      <div className="bg-[#121215] p-5 rounded-[4px] border border-[#1e1e24]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase text-[#f4f4f5] font-semibold tracking-wider">
            Monthly Cycle Transactions ({cycleLabel})
          </h2>
          <span className="text-[11px] font-mono text-[#a1a1aa]">
            Resets on 1st • Base Cap: ₹{monthlyBudgetInr.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {!confirmDeleteDate ? (
              <button
                onClick={() => setConfirmDeleteDate(true)}
                className="px-2.5 py-1 rounded-[4px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                title={`Delete all transactions for ${selectedDate}`}
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                <span>Clear Date</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-rose-400 font-mono">Clear all for {selectedDate}?</span>
                <button
                  disabled={isClearingDate}
                  onClick={async () => {
                    setIsClearingDate(true);
                    try {
                      await deleteFinanceByDate(selectedDate);
                      setConfirmDeleteDate(false);
                    } finally {
                      setIsClearingDate(false);
                    }
                  }}
                  className="px-2 py-0.5 rounded-[3px] bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-mono font-bold hover:bg-rose-500/30 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {isClearingDate && <ButtonSpinner className="w-2.5 h-2.5" />}
                  <span>Yes, Clear</span>
                </button>
                <button
                  onClick={() => setConfirmDeleteDate(false)}
                  className="px-2 py-0.5 rounded-[3px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-[11px] font-mono hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {transactionsCycle.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1e1e24] text-[#71717a]">
                  <th className="pb-2.5 font-normal">Date</th>
                  <th className="pb-2.5 font-normal">Transaction Details</th>
                  <th className="pb-2.5 font-normal">Category</th>
                  <th className="pb-2.5 font-normal">Classification</th>
                  <th className="pb-2.5 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e24]/60">
                {transactionsCycle.map((t) => (
                  <tr key={t.id} className="hover:bg-[#18181b]/50 transition-colors group/tx">
                    <td className="py-3 text-[#71717a] font-mono text-[11px]">
                      {(t as any).date || selectedDate}
                    </td>
                    <td className="py-3 text-[#f4f4f5] font-sans font-medium">{t.title}</td>
                    <td className="py-3 text-[#06b6d4]">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#0e0e11] border border-[#1e1e24] text-[10px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 text-[#a1a1aa]">
                      {t.amount > 0 ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                          <span>Inflow / Added Money</span>
                        </span>
                      ) : t.isEssential ? (
                        <span className="text-[#10b981]">Essential Living</span>
                      ) : (
                        <span className="text-[#f59e0b]">Discretionary</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.amount > 0 ? (
                          <span className="text-emerald-400 font-bold">+₹{t.amount}</span>
                        ) : (
                          <span className="text-[#f4f4f5] font-bold">-₹{Math.abs(t.amount)}</span>
                        )}
                        <button
                          onClick={() => deleteExpense(t.id)}
                          className="opacity-0 group-hover/tx:opacity-100 text-[#71717a] hover:text-red-400 transition-all cursor-pointer"
                          title="Delete transaction"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-[#71717a]">
            No transactions logged for this date. Use the form above to log spend or income.
          </div>
        )}
      </div>
    </div>
  );
}
