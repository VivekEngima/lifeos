import { getDb, schema } from "@/db";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export interface DailyTimeBlock {
  id: string;
  startTime: string; // "HH:MM" e.g. "09:00"
  endTime: string; // "HH:MM" e.g. "11:30"
  durationMinutes: number;
  activity: string;
  category: "deep_work" | "sadhana_health" | "shallow_work" | "rest_recovery" | "distraction_leak" | "social_personal";
  energyLevel: number; // 1-5 (1=Drained, 5=Peak Vitality)
  focusQuality: "deep_flow" | "moderate" | "fractured" | "distracted";
  shouldHaveDone?: string;
  coachOptimization?: string;
  leverageScore?: number; // 1-10
}

export interface DashboardState {
  date: string;
  isDbConnected: boolean;
  dbType: "supabase_postgres";
  countdown3Years: {
    targetName: string;
    targetDate: string;
    totalDaysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    pctCompleted: number;
  };
  puneFund: {
    id?: string;
    title: string;
    target: number;
    accumulated: number;
    currency: string;
    targetDate: string;
    daysLeft: number;
    monthlyFlow: number;
    remaining: number;
    pctCompleted: number;
    trajectory: string;
  };
  customGoals: Array<{
    id: string;
    title: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    targetDate?: string | null;
    pct: number;
  }>;
  brahmacharya: {
    cleanStreak: number;
    longestStreak: number;
    isCleanToday: boolean;
    urgesToday: number;
    notesToday: string;
    transmutationTier: string;
  };
  habits: Array<{
    id: string;
    title: string;
    description?: string | null;
    isCompleted: boolean;
    streak: number;
  }>;
  books: Array<{
    id: string;
    title: string;
    author?: string | null;
    imageUrl?: string | null;
    totalPages?: number | null;
    status?: string | null;
    currentPage?: number;
    pctCompleted?: number;
    isCompleted?: boolean;
    pagesRemaining?: number;
    totalPagesRead?: number;
    totalSessions?: number;
    lastReadDate?: string | null;
    createdAt?: string;
  }>;
  currentBook?: {
    id: string;
    title: string;
    author?: string | null;
    imageUrl?: string | null;
    totalPages?: number | null;
    status?: string | null;
    currentPage?: number;
    pctCompleted?: number;
    isCompleted?: boolean;
    pagesRemaining?: number;
    totalPagesRead?: number;
    totalSessions?: number;
    lastReadDate?: string | null;
    createdAt?: string;
  } | null;
  workoutToday: {
    id?: string;
    type: string;
    description: string;
    durationMinutes: number;
    cycles: number;
    suryaKriyaCycles?: number;
    asanaHoldingCount?: number;
    practices?: string[];
    calories: number;
    peakBpm: number;
    quality: string;
  } | null;
  sleepToday: {
    id?: string;
    startDate?: string | null;
    endDate?: string | null;
    durationMinutes: number;
    totalDayMinutes?: number;
    entriesCount?: number;
    avgQuality?: number;
    quality: number; // 0-100
    deepPct?: number;
    remPct?: number;
    lightPct?: number;
    awakePct?: number;
  } | null;
  sleepLogsToday: Array<{
    id: string;
    startDate?: string | null;
    endDate?: string | null;
    durationMinutes: number;
    quality: number;
    deepPct?: number;
    remPct?: number;
    lightPct?: number;
    awakePct?: number;
    createdAt?: string | null;
  }>;
  deepWorkToday: {
    id?: string;
    topic: string;
    description: string;
    startTime?: string | null;
    endTime?: string | null;
    durationMinutes: number;
    latestSessionMinutes?: number;
    quality: string;
    keyInsight: string;
    referenceLink?: string | null;
    sessionsCount?: number;
  } | null;
  readingToday: {
    id?: string;
    bookId?: string;
    bookTitle: string;
    author: string;
    imageUrl?: string | null;
    startPage: number;
    endPage: number;
    pagesRead: number;
    totalDayPages?: number;
    totalPages: number;
    durationMinutes: number;
    insightQuote: string;
    vaultPath: string;
    sessionsCount?: number;
  } | null;
  readingsToday: Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    author: string;
    imageUrl?: string | null;
    startPage: number;
    endPage: number;
    pagesRead: number;
    totalPages: number;
    durationMinutes: number;
    insightQuote: string;
    vaultPath: string;
    createdAt?: string | null;
  }>;
  finance: {
    monthlyBudgetInr: number;
    monthlySpentInr: number;
    monthlyAddedInr: number;
    totalMonthlyPoolInr: number;
    monthlyRemainingInr: number;
    monthlyPacingPct: number;
    cycleLabel: string;
    cycleStartDate: string;
    cycleEndDate: string;
    nextResetDate: string;
    daysUntilReset: number;
    transactionsCycle: Array<{
      id: string;
      title: string;
      amount: number;
      isEssential: boolean;
      category: string;
      date: string;
    }>;
    recentTransactions?: Array<{
      id: string;
      title: string;
      amount: number;
      isEssential: boolean;
      category: string;
      date: string;
    }>;
    transactionsToday: Array<{
      id: string;
      title: string;
      amount: number;
      isEssential: boolean;
      category: string;
    }>;
    totalSpentTodayInr: number;
    earnedTodayUsd: number;
    weeklyEarnedUsd: number;
    weeklyTargetUsd: number;
    weeklyPacingPct: number;
  };
  journal: {
    creation: string;
    frictionLesson: string;
    threeLines: {
      did: string;
      learned: string;
      tomorrow: string;
    };
    mood: {
      score: number; // 1-10
      note: string;
    };
    eveningReflection: string;
    dayTimeLog?: DailyTimeBlock[];
  };
  reviews: {
    saturdayWeekly: {
      working: string;
      draining: string;
      cuttingNextWeek: string;
      moneyNeedleLesson: string;
      sadhanaStreak: number;
      totalEarned: number;
    };
    monthly: {
      incomeTotal: number;
      sourceBreakdown: string;
      puneFundSaved: number;
      adjustOneThing: string;
      netWorthEstimate: number;
      bodyMetrics: string;
    };
  };
  disciplineRating: number; // 1-10
  dayIntegrityScore: number;
  pillarsMet: number;
  pillarsTotal: number;
  isLocked: boolean;
  todayTasks?: Array<{
    id: string;
    taskDate: string;
    title: string;
    description: string | null;
    timeSlot: string | null;
    priority: string;
    category: string | null;
    status: string;
    sortOrder: number;
  }>;
}

export function getFinancialMonthlyCycle(dateStr: string) {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  const startYear = y;
  const startMonth = m;

  // Last day of current month m (using Date.UTC to prevent timezone rollover)
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
  const endDate = `${startYear}-${String(startMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cycleLabel = `${monthNames[startMonth - 1]} 1 – ${monthNames[startMonth - 1]} ${lastDay}`;
  
  // Next cycle resets on the 1st of the subsequent month
  const nextMonthYear = m === 12 ? y + 1 : y;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextResetDate = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;

  let daysUntilReset = 0;
  try {
    const tCurrent = new Date(dateStr + "T00:00:00Z").getTime();
    const tNext = new Date(nextResetDate + "T00:00:00Z").getTime();
    daysUntilReset = Math.max(0, Math.ceil((tNext - tCurrent) / (1000 * 60 * 60 * 24)));
  } catch {
    daysUntilReset = 0;
  }

  return { startDate, endDate, cycleLabel, nextResetDate, daysUntilReset };
}

export async function getDashboardState(dateStr: string): Promise<DashboardState> {
  const drizzleDb = getDb();
  if (!drizzleDb) {
    throw new Error("Supabase Database connection not available. Verify DATABASE_URL in .env.local.");
  }

  // 3-Year Countdown: Anchor Oct 1 2025 -> Oct 1 2028 (1095 days)
  const target3YrDate = new Date("2028-10-01T00:00:00Z");
  const selectedDate = new Date(dateStr + "T00:00:00Z");
  const diffTime = target3YrDate.getTime() - selectedDate.getTime();
  const totalDaysLeft = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const totalDuration = 3 * 365;
  const daysPassed = totalDuration - totalDaysLeft;
  const pct3Years = Math.min(100, Math.max(0, Math.round((daysPassed / totalDuration) * 100)));

  // Query live Supabase tables simultaneously via Drizzle
  const [
    dbGoals,
    dbCustomGoals,
    dbHabits,
    dbHabitLogs,
    dbWorkouts,
    dbSleep,
    dbDeepWork,
    dbReadings,
    dbBooks,
    allDbReadings,
    dbFinance,
    allFinanceWeekly,
    dbBrahmacharya,
    allBrahmacharyaLogs,
    dbJournal,
    dbSummary,
    allHabitLogs,
    dbPlannerTasks,
  ] = await Promise.all([
    drizzleDb.select().from(schema.financialGoals),
    drizzleDb.select().from(schema.customGoals),
    drizzleDb.select().from(schema.habits).where(eq(schema.habits.isActive, true)),
    drizzleDb.select().from(schema.habitLogs).where(eq(schema.habitLogs.logDate, dateStr)),
    drizzleDb.select().from(schema.workouts).where(eq(schema.workouts.sessionDate, dateStr)).orderBy(desc(schema.workouts.createdAt)).limit(1),
    drizzleDb.select().from(schema.sleepLogs).where(eq(schema.sleepLogs.sleepDate, dateStr)).orderBy(desc(schema.sleepLogs.createdAt)),
    drizzleDb.select().from(schema.deepWorkSessions).where(eq(schema.deepWorkSessions.sessionDate, dateStr)).orderBy(desc(schema.deepWorkSessions.createdAt)),
    drizzleDb.select().from(schema.readings).where(eq(schema.readings.sessionDate, dateStr)).orderBy(desc(schema.readings.createdAt)),
    drizzleDb.select().from(schema.books),
    drizzleDb.select().from(schema.readings).orderBy(desc(schema.readings.sessionDate), desc(schema.readings.createdAt)),
    drizzleDb.select().from(schema.financeTransactions).where(eq(schema.financeTransactions.transactionDate, dateStr)),
    drizzleDb.select().from(schema.financeTransactions).orderBy(desc(schema.financeTransactions.transactionDate), desc(schema.financeTransactions.createdAt)),
    drizzleDb.select().from(schema.brahmacharyaLogs).where(eq(schema.brahmacharyaLogs.logDate, dateStr)).limit(1),
    drizzleDb.select().from(schema.brahmacharyaLogs).orderBy(desc(schema.brahmacharyaLogs.logDate)),
    drizzleDb.select().from(schema.journalEntries).where(eq(schema.journalEntries.entryDate, dateStr)),
    drizzleDb.select().from(schema.dailySummary).where(eq(schema.dailySummary.summaryDate, dateStr)).limit(1),
    drizzleDb.select().from(schema.habitLogs).orderBy(desc(schema.habitLogs.logDate)),
    drizzleDb.select().from(schema.plannerTasks).where(eq(schema.plannerTasks.taskDate, dateStr)).orderBy(asc(schema.plannerTasks.sortOrder), asc(schema.plannerTasks.timeSlot)),
  ]);

  // 1. Primary Horizon (Pune Fund)
  const puneGoal = dbGoals.find((g) => g.title.toLowerCase().includes("pune")) || dbGoals[0] || {
    id: undefined,
    title: "Pune Relocation & Sovereignty Fund",
    targetAmount: "5000",
    currency: "USD",
    targetDate: "2027-02-01",
  };

  let accumulated = 0;
  if (puneGoal.id) {
    const contributions = await drizzleDb
      .select()
      .from(schema.goalContributions)
      .where(eq(schema.goalContributions.goalId, puneGoal.id));
    accumulated = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }

  const targetAmt = Number(puneGoal.targetAmount) || 5000;
  const remaining = Math.max(0, targetAmt - accumulated);
  const puneTargetDate = new Date((puneGoal.targetDate || "2027-02-01") + "T00:00:00Z");
  const puneDaysLeft = Math.max(0, Math.floor((puneTargetDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)));

  // 2. Custom Goals
  const customGoalsMapped = dbCustomGoals.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category || "skill",
    targetValue: Number(g.targetValue),
    currentValue: Number(g.currentValue),
    unit: g.unit || "%",
    targetDate: g.targetDate,
    pct: Math.min(100, Math.round((Number(g.currentValue) / (Number(g.targetValue) || 1)) * 100)),
  }));

  // 3. Habits & Today's Logs
  const completedMap = new Map<string, boolean>();
  for (const log of dbHabitLogs) {
    completedMap.set(log.habitId, log.isCompleted);
  }

  const habitItems = dbHabits.map((h) => {
    const logsForHabit = allHabitLogs.filter((l) => l.habitId === h.id);
    let streak = 0;
    for (const l of logsForHabit) {
      if (l.logDate <= dateStr) {
        if (l.isCompleted) streak++;
        else break;
      }
    }
    return {
      id: h.id,
      title: h.title,
      description: h.description,
      isCompleted: completedMap.get(h.id) ?? false,
      streak,
    };
  });

  // 4. Brahmacharya & Dynamic Streak
  const todayBLog = dbBrahmacharya[0];
  let cleanStreak = 0;
  let longestStreak = 0;
  let currentRun = 0;

  for (let i = 0; i < allBrahmacharyaLogs.length; i++) {
    if (allBrahmacharyaLogs[i].isClean) {
      currentRun++;
      if (currentRun > longestStreak) longestStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }

  for (const b of allBrahmacharyaLogs) {
    if (b.logDate <= dateStr) {
      if (b.isClean) {
        cleanStreak++;
      } else {
        break;
      }
    }
  }

  // 5. Workout Today
  const workout = dbWorkouts[0]
    ? {
        id: dbWorkouts[0].id,
        type: dbWorkouts[0].type,
        description: dbWorkouts[0].description || "",
        durationMinutes: dbWorkouts[0].durationMinutes || 0,
        cycles: dbWorkouts[0].cycles || 0,
        suryaKriyaCycles: dbWorkouts[0].suryaKriyaCycles ?? dbWorkouts[0].cycles ?? 0,
        asanaHoldingCount: dbWorkouts[0].asanaHoldingCount ?? 0,
        practices: (() => {
          if (!dbWorkouts[0].practices) return [dbWorkouts[0].type || "surya_kriya"];
          try {
            const parsed = JSON.parse(dbWorkouts[0].practices);
            return Array.isArray(parsed) ? parsed : [dbWorkouts[0].practices];
          } catch {
            return dbWorkouts[0].practices.split(",").map((s: string) => s.trim());
          }
        })(),
        calories: dbWorkouts[0].calories || 0,
        peakBpm: dbWorkouts[0].peakBpm || 0,
        quality: dbWorkouts[0].quality || "Zone 3/4 Physical",
      }
    : null;

  // 6. Sleep Today (Supports multiple entries per day)
  const sleepLogsToday = dbSleep.map((s) => ({
    id: s.id,
    startDate: s.startDate ? String(s.startDate) : (s.sleepDate ? String(s.sleepDate) : null),
    endDate: s.endDate ? String(s.endDate) : (s.sleepDate ? String(s.sleepDate) : null),
    durationMinutes: s.durationMinutes || 0,
    quality: s.quality || 0,
    deepPct: Number(s.deepPct || 0),
    remPct: Number(s.remPct || 0),
    lightPct: Number(s.lightPct || 0),
    awakePct: Number(s.awakePct || 0),
    createdAt: s.createdAt ? s.createdAt.toISOString() : null,
  }));

  const totalSleepMinutesToday = sleepLogsToday.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgSleepQuality = sleepLogsToday.length > 0
    ? Math.round(sleepLogsToday.reduce((sum, s) => sum + s.quality, 0) / sleepLogsToday.length)
    : 0;

  const sleep = sleepLogsToday[0]
    ? {
        ...sleepLogsToday[0],
        totalDayMinutes: totalSleepMinutesToday,
        entriesCount: sleepLogsToday.length,
        avgQuality: avgSleepQuality,
      }
    : null;

  // 7. Deep Work Today (Supports multiple timer & manual sessions per day)
  const totalDwMinutesToday = dbDeepWork.reduce((sum, d) => sum + (d.durationMinutes || 0), 0);
  const dw = dbDeepWork[0]
    ? {
        id: dbDeepWork[0].id,
        topic: dbDeepWork[0].topic,
        description: dbDeepWork[0].description || "",
        startTime: dbDeepWork[0].startTime || null,
        endTime: dbDeepWork[0].endTime || null,
        durationMinutes: totalDwMinutesToday,
        latestSessionMinutes: dbDeepWork[0].durationMinutes || 0,
        quality: dbDeepWork[0].quality || "Session Verified",
        keyInsight: dbDeepWork[0].keyInsight || "",
        referenceLink: dbDeepWork[0].referenceLink,
        sessionsCount: dbDeepWork.length,
      }
    : null;

  // 8. Reading Today (Supports multiple entries per day)
  const readingsToday = dbReadings.map((r) => {
    const b = dbBooks.find((book) => book.id === r.bookId);
    const calculatedPagesRead = r.endPage === r.startPage && r.endPage > 0 ? 1 : Math.max(0, r.endPage - r.startPage);
    return {
      id: r.id,
      bookId: r.bookId,
      bookTitle: b?.title || "Book Session",
      author: b?.author || "",
      imageUrl: b?.imageUrl || null,
      startPage: r.startPage,
      endPage: r.endPage,
      pagesRead: calculatedPagesRead,
      totalPages: b?.totalPages || Math.max(r.endPage, 250),
      durationMinutes: r.durationMinutes || 0,
      insightQuote: r.insightQuote || "",
      vaultPath: r.vaultPath || "/LifeOS/Readings",
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    };
  });

  const totalPagesReadToday = readingsToday.reduce((sum, r) => sum + r.pagesRead, 0);

  // Map all books with overall progress metrics across all reading sessions
  const mappedBooks = dbBooks.map((b) => {
    const bookReadings = allDbReadings.filter((r) => r.bookId === b.id);
    const highestPage = bookReadings.reduce((max, r) => Math.max(max, r.endPage), 0);
    const totalSessions = bookReadings.length;
    const totalPagesRead = bookReadings.reduce((sum, r) => sum + (r.endPage === r.startPage && r.endPage > 0 ? 1 : Math.max(0, r.endPage - r.startPage)), 0);
    const totalPages = b.totalPages || (highestPage > 0 ? highestPage : 0);
    const isCompleted = (b as any).status === "completed" || (totalPages > 0 && highestPage >= totalPages);
    const pctCompleted = totalPages > 0 ? Math.min(100, Math.round((highestPage / totalPages) * 100)) : 0;
    const pagesRemaining = totalPages > 0 ? Math.max(0, totalPages - highestPage) : 0;
    const lastSession = bookReadings[0];

    return {
      id: b.id,
      title: b.title,
      author: b.author,
      imageUrl: b.imageUrl,
      totalPages,
      status: isCompleted ? "completed" : ((b as any).status || "reading"),
      currentPage: highestPage,
      pctCompleted,
      isCompleted,
      pagesRemaining,
      totalPagesRead,
      totalSessions,
      lastReadDate: lastSession ? String(lastSession.sessionDate) : null,
      createdAt: b.createdAt.toISOString(),
    };
  });

  // Active / current book selection logic:
  // 1. If reading logged today, show that book
  let activeBook = readingsToday.length > 0
    ? mappedBooks.find((b) => b.id === readingsToday[0].bookId)
    : null;

  // 2. If no reading today, find an active book that is currently being read (status === "reading" and !isCompleted)
  if (!activeBook) {
    activeBook = mappedBooks.find((b) => b.status === "reading" && !b.isCompleted) || null;
  }

  // 3. If no active reading book exists (all books are completed or no active book), show the latest completed book
  if (!activeBook && mappedBooks.length > 0) {
    activeBook = mappedBooks.find((b) => b.isCompleted) || mappedBooks[0];
  }

  const currentBook = activeBook || null;

  // Filter today's readings specific to the active book displayed
  const activeBookReadingsToday = readingsToday.filter((r) => r.bookId === currentBook?.id);
  const activeBookPagesReadToday = activeBookReadingsToday.reduce((sum, r) => sum + r.pagesRead, 0);

  const dayStartPage = activeBookReadingsToday.length > 0
    ? Math.min(...activeBookReadingsToday.map((r) => r.startPage))
    : (readingsToday.length > 0 ? readingsToday[0].startPage : 0);
  const dayEndPage = activeBookReadingsToday.length > 0
    ? Math.max(...activeBookReadingsToday.map((r) => r.endPage))
    : (readingsToday.length > 0 ? readingsToday[0].endPage : 0);

  const reading = readingsToday.length > 0
    ? {
        ...(activeBookReadingsToday.length > 0 ? activeBookReadingsToday[0] : readingsToday[0]),
        startPage: dayStartPage,
        endPage: dayEndPage,
        pagesRead: activeBookReadingsToday.length > 0 ? activeBookPagesReadToday : readingsToday[0].pagesRead,
        imageUrl: (activeBookReadingsToday.length > 0 ? activeBookReadingsToday[0].imageUrl : readingsToday[0].imageUrl) || currentBook?.imageUrl || null,
        totalDayPages: totalPagesReadToday,
        sessionsCount: activeBookReadingsToday.length,
        totalDaySessions: readingsToday.length,
      }
    : null;

  // 9. Finance Transactions & Income (Monthly Cycle: 1st of Month to End of Month)
  const cycle = getFinancialMonthlyCycle(dateStr);
  const cycleStartDate = cycle.startDate;
  const cycleEndDate = cycle.endDate;

  const transactions = dbFinance.map((f) => ({
    id: f.id,
    title: f.title,
    amount: Number(f.amount),
    isEssential: Boolean(f.isEssential),
    category: f.category || "general",
  }));

  const totalSpentInr = transactions
    .filter((t) => t.amount < 0 && t.category !== "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const earnedTodayUsd = transactions
    .filter((t) => t.category === "income" || t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter all transactions belonging to the current monthly cycle (1st to end of month)
  const transactionsCycle = allFinanceWeekly
    .filter((f) => {
      const d = f.transactionDate || "";
      return d >= cycleStartDate && d <= cycleEndDate;
    })
    .map((f) => ({
      id: f.id,
      title: f.title,
      amount: Number(f.amount),
      isEssential: Boolean(f.isEssential),
      category: f.category || "general",
      date: f.transactionDate || "",
    }))
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  const recentTransactions = allFinanceWeekly
    .slice(0, 10)
    .map((f) => ({
      id: f.id,
      title: f.title,
      amount: Number(f.amount),
      isEssential: Boolean(f.isEssential),
      category: f.category || "general",
      date: f.transactionDate || "",
    }));

  // Determine base monthly budget (check if user set a custom budget goal)
  const customBudgetGoal = dbCustomGoals.find(
    (g) => g.category === "monthly_budget" || g.category === "budget"
  );
  const monthlyBudgetInr = customBudgetGoal ? Number(customBudgetGoal.targetValue) || 2000 : 2000;

  // Monthly spent (negative amounts)
  const monthlySpentInr = transactionsCycle
    .filter((t) => t.amount < 0 && t.category !== "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Monthly money added / positive inflows (e.g. Added Money, Top-up, Pocket Money, Allowance)
  const monthlyAddedInr = transactionsCycle
    .filter((t) => t.amount > 0 && t.category !== "income_usd")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyPoolInr = monthlyBudgetInr + monthlyAddedInr;
  const monthlyRemainingInr = totalMonthlyPoolInr - monthlySpentInr;
  const monthlyPacingPct = Math.min(100, Math.round((monthlySpentInr / (totalMonthlyPoolInr || 1)) * 100));

  // Weekly income calculation across transactions
  const weeklyEarnedUsd = allFinanceWeekly
    .filter((t) => t.category === "income" || Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 10. Journal Parses
  let creation = "";
  let frictionLesson = "";
  let threeLines = { did: "", learned: "", tomorrow: "" };
  let mood = { score: 0, note: "" };
  let eveningReflection = "";
  let dayTimeLog: DailyTimeBlock[] = [];
  let saturdayWeekly = {
    working: "",
    draining: "",
    cuttingNextWeek: "",
    moneyNeedleLesson: "",
    sadhanaStreak: 0,
    totalEarned: weeklyEarnedUsd,
  };
  let monthly = {
    incomeTotal: weeklyEarnedUsd,
    sourceBreakdown: "",
    puneFundSaved: accumulated,
    adjustOneThing: "",
    netWorthEstimate: 0,
    bodyMetrics: "",
  };

  for (const entry of dbJournal) {
    if (entry.category === "creation") creation = entry.content;
    else if (entry.category === "friction_lesson") frictionLesson = entry.content;
    else if (entry.category === "evening_reflection") eveningReflection = entry.content;
    else if (entry.category === "day_time_log") {
      try {
        dayTimeLog = JSON.parse(entry.content);
      } catch {
        dayTimeLog = [];
      }
    } else if (entry.category === "three_lines") {
      try {
        threeLines = JSON.parse(entry.content);
      } catch {
        threeLines.did = entry.content;
      }
    } else if (entry.category === "mood") {
      try {
        mood = JSON.parse(entry.content);
      } catch {
        mood.note = entry.content;
      }
    } else if (entry.category === "weekly_review") {
      try {
        saturdayWeekly = JSON.parse(entry.content);
      } catch {}
    } else if (entry.category === "monthly_review") {
      try {
        monthly = JSON.parse(entry.content);
      } catch {}
    }
  }

  // 11. Pillars & Discipline Rating
  let pillarsMet = 0;
  if (workout && workout.durationMinutes > 0) pillarsMet++;
  if (reading && reading.pagesRead > 0) pillarsMet++;
  if (dw && dw.durationMinutes >= 180) pillarsMet++;
  if (todayBLog ? todayBLog.isClean : false) pillarsMet++;
  const completedHabitsCount = habitItems.filter((h) => h.isCompleted).length;
  if (completedHabitsCount > 0 && completedHabitsCount >= Math.ceil(habitItems.length * 0.75)) pillarsMet++;
  if (sleep && sleep.quality >= 70) pillarsMet++;

  const summary = dbSummary[0];
  const disciplineRating = summary?.disciplineRating ?? 0;
  const dayIntegrityScore = summary ? Number(summary.dayIntegrityScore) : Number(((pillarsMet / 6) * 10).toFixed(1));

  return {
    date: dateStr,
    isDbConnected: true,
    dbType: "supabase_postgres",
    countdown3Years: {
      targetName: "3-Year Sovereign Freedom Trajectory",
      targetDate: "2028-10-01",
      totalDaysLeft,
      hoursLeft: 14,
      minutesLeft: 22,
      pctCompleted: pct3Years,
    },
    puneFund: {
      id: puneGoal.id,
      title: puneGoal.title,
      target: targetAmt,
      accumulated,
      currency: puneGoal.currency || "USD",
      targetDate: puneGoal.targetDate || "2027-02-01",
      daysLeft: puneDaysLeft,
      monthlyFlow: 350,
      remaining,
      pctCompleted: Math.min(100, Math.round((accumulated / (targetAmt || 1)) * 100)),
      trajectory: "Feb 2027",
    },
    customGoals: customGoalsMapped,
    brahmacharya: {
      cleanStreak,
      longestStreak,
      isCleanToday: todayBLog ? todayBLog.isClean : false,
      urgesToday: todayBLog ? todayBLog.urgesCount : 0,
      notesToday: todayBLog?.notes || "",
      transmutationTier: cleanStreak >= 30 ? "Tier 3 Transmuted" : cleanStreak > 0 ? "Tier 1 Active" : "Unlogged",
    },
    habits: habitItems,
    books: mappedBooks,
    currentBook,
    workoutToday: workout,
    sleepToday: sleep,
    sleepLogsToday,
    deepWorkToday: dw,
    readingToday: reading,
    readingsToday,
    finance: {
      monthlyBudgetInr,
      monthlySpentInr,
      monthlyAddedInr,
      totalMonthlyPoolInr,
      monthlyRemainingInr,
      monthlyPacingPct,
      cycleLabel: cycle.cycleLabel,
      cycleStartDate,
      cycleEndDate,
      nextResetDate: cycle.nextResetDate,
      daysUntilReset: cycle.daysUntilReset,
      transactionsCycle,
      recentTransactions,
      transactionsToday: transactions,
      totalSpentTodayInr: totalSpentInr,
      earnedTodayUsd,
      weeklyEarnedUsd,
      weeklyTargetUsd: 750,
      weeklyPacingPct: Math.round((weeklyEarnedUsd / 750) * 100),
    },
    journal: {
      creation,
      frictionLesson,
      threeLines,
      mood,
      eveningReflection,
      dayTimeLog,
    },
    reviews: {
      saturdayWeekly,
      monthly,
    },
    disciplineRating,
    dayIntegrityScore,
    pillarsMet: summary?.pillarsMet ?? pillarsMet,
    pillarsTotal: 6,
    isLocked: summary?.isLocked ?? false,
    todayTasks: dbPlannerTasks || [],
  };
}

// ---------------------------------------------------------------------
// DIRECT SUPABASE MUTATIONS VIA DRIZZLE ORM
// ---------------------------------------------------------------------

export async function toggleHabitLog(habitId: string, dateStr: string, isCompleted: boolean) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.habitLogs)
    .where(and(eq(schema.habitLogs.habitId, habitId), eq(schema.habitLogs.logDate, dateStr)));

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.habitLogs)
      .set({ isCompleted })
      .where(and(eq(schema.habitLogs.habitId, habitId), eq(schema.habitLogs.logDate, dateStr)));
  } else {
    await drizzleDb.insert(schema.habitLogs).values({
      habitId,
      logDate: dateStr,
      isCompleted,
    });
  }
  return { success: true };
}

export async function logBrahmacharya(dateStr: string, isClean: boolean, urgesCount: number, notes?: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.brahmacharyaLogs)
    .where(eq(schema.brahmacharyaLogs.logDate, dateStr));

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.brahmacharyaLogs)
      .set({ isClean, urgesCount, notes })
      .where(eq(schema.brahmacharyaLogs.logDate, dateStr));
  } else {
    await drizzleDb.insert(schema.brahmacharyaLogs).values({
      logDate: dateStr,
      isClean,
      urgesCount,
      notes: notes || "",
    });
  }
  return { success: true };
}

export async function logWorkout(data: {
  sessionDate: string;
  type: string;
  description: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  cycles?: number;
  suryaKriyaCycles?: number;
  asanaHoldingCount?: number;
  practices?: string[] | string;
  calories?: number;
  peakBpm?: number;
  quality?: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const practicesStr = Array.isArray(data.practices)
    ? JSON.stringify(data.practices)
    : data.practices || JSON.stringify([data.type]);

  const skCycles = data.suryaKriyaCycles !== undefined ? Number(data.suryaKriyaCycles) : Number(data.cycles || 0);

  await drizzleDb.insert(schema.workouts).values({
    sessionDate: data.sessionDate,
    type: data.type,
    description: data.description,
    startTime: data.startTime || "06:00",
    endTime: data.endTime || "06:45",
    durationMinutes: Number(data.durationMinutes),
    cycles: skCycles,
    suryaKriyaCycles: skCycles,
    asanaHoldingCount: data.asanaHoldingCount !== undefined ? Number(data.asanaHoldingCount) : null,
    practices: practicesStr,
    calories: Number(data.calories || 0),
    peakBpm: Number(data.peakBpm || 0),
    quality: data.quality || "Zone 3/4 Physical",
  });
  return { success: true };
}

export async function logSleep(data: {
  sleepDate?: string;
  startDate?: string;
  endDate?: string;
  durationMinutes: number;
  quality: number;
  deepPct?: number;
  remPct?: number;
  lightPct?: number;
  awakePct?: number;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const finalSleepDate = data.sleepDate || data.endDate || data.startDate || new Date().toISOString().split("T")[0];
  const finalStartDate = data.startDate || finalSleepDate;
  const finalEndDate = data.endDate || finalSleepDate;

  await drizzleDb.insert(schema.sleepLogs).values({
    sleepDate: finalSleepDate,
    startDate: finalStartDate,
    endDate: finalEndDate,
    durationMinutes: Number(data.durationMinutes),
    quality: Number(data.quality),
    deepPct: data.deepPct !== undefined ? String(data.deepPct) : null,
    remPct: data.remPct !== undefined ? String(data.remPct) : null,
    lightPct: data.lightPct !== undefined ? String(data.lightPct) : null,
    awakePct: data.awakePct !== undefined ? String(data.awakePct) : null,
  });
  return { success: true };
}

export async function logDeepWork(data: {
  sessionDate: string;
  topic: string;
  description: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  quality?: string;
  keyInsight?: string;
  referenceLink?: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  await drizzleDb.insert(schema.deepWorkSessions).values({
    sessionDate: data.sessionDate,
    topic: data.topic,
    description: data.description,
    startTime: data.startTime || "09:30",
    endTime: data.endTime || "13:00",
    durationMinutes: Number(data.durationMinutes),
    quality: data.quality || "Session Verified",
    keyInsight: data.keyInsight || "",
    referenceLink: data.referenceLink,
  });
  return { success: true };
}

export async function logReading(data: {
  bookId?: string;
  bookTitle?: string;
  author?: string;
  imageUrl?: string;
  totalPages?: number;
  sessionDate: string;
  startPage: number;
  endPage: number;
  durationMinutes?: number;
  insightQuote?: string;
  vaultPath?: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  let bookId = data.bookId;
  if (!bookId && data.bookTitle) {
    const existing = await drizzleDb
      .select()
      .from(schema.books)
      .where(eq(schema.books.title, data.bookTitle.trim()))
      .limit(1);

    if (existing.length > 0) {
      bookId = existing[0].id;
      if (data.imageUrl && !existing[0].imageUrl) {
        await drizzleDb.update(schema.books).set({ imageUrl: data.imageUrl }).where(eq(schema.books.id, bookId));
      }
    } else {
      const inserted = await drizzleDb
        .insert(schema.books)
        .values({
          title: data.bookTitle.trim(),
          author: data.author?.trim() || "",
          imageUrl: data.imageUrl || null,
          totalPages: data.totalPages ? Number(data.totalPages) : Math.max(Number(data.endPage), 100),
          status: "reading",
        })
        .returning();
      bookId = inserted[0].id;
    }
  } else if (!bookId) {
    const activeBooks = await drizzleDb
      .select()
      .from(schema.books)
      .where(eq(schema.books.status, "reading"))
      .limit(1);
    if (activeBooks.length > 0) {
      bookId = activeBooks[0].id;
    } else {
      const anyBook = await drizzleDb.select().from(schema.books).limit(1);
      if (anyBook.length > 0) {
        bookId = anyBook[0].id;
      } else {
        throw new Error("No book selected. Please add a book or provide a book title.");
      }
    }
  }

  const inserted = await drizzleDb.insert(schema.readings).values({
    bookId,
    sessionDate: data.sessionDate,
    startPage: Number(data.startPage),
    endPage: Number(data.endPage),
    durationMinutes: Number(data.durationMinutes || 0),
    insightQuote: data.insightQuote || "",
    vaultPath: data.vaultPath || "/LifeOS/Readings",
  }).returning();

  // If this reading session reaches or exceeds totalPages, auto-mark completed
  const targetBook = await drizzleDb.select().from(schema.books).where(eq(schema.books.id, bookId)).limit(1);
  if (targetBook.length > 0 && targetBook[0].totalPages && Number(data.endPage) >= targetBook[0].totalPages) {
    await drizzleDb.update(schema.books).set({ status: "completed" }).where(eq(schema.books.id, bookId));
  }

  return { success: true, reading: inserted[0] };
}

export async function getAllBooks() {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const [dbBooks, dbReadings] = await Promise.all([
    drizzleDb.select().from(schema.books).orderBy(desc(schema.books.createdAt)),
    drizzleDb.select().from(schema.readings).orderBy(desc(schema.readings.sessionDate), desc(schema.readings.createdAt)),
  ]);

  return dbBooks.map((b) => {
    const bookReadings = dbReadings.filter((r) => r.bookId === b.id);
    const highestPage = bookReadings.reduce((max, r) => Math.max(max, r.endPage), 0);
    const totalSessions = bookReadings.length;
    const totalPagesRead = bookReadings.reduce((sum, r) => sum + (r.endPage === r.startPage && r.endPage > 0 ? 1 : Math.max(0, r.endPage - r.startPage)), 0);
    const totalPages = b.totalPages || (highestPage > 0 ? highestPage : 0);
    const isCompleted = (b as any).status === "completed" || (totalPages > 0 && highestPage >= totalPages);
    const pctCompleted = totalPages > 0 ? Math.min(100, Math.round((highestPage / totalPages) * 100)) : 0;
    const pagesRemaining = totalPages > 0 ? Math.max(0, totalPages - highestPage) : 0;
    const lastSession = bookReadings[0];

    return {
      id: b.id,
      title: b.title,
      author: b.author || "",
      imageUrl: b.imageUrl || null,
      totalPages,
      status: isCompleted ? "completed" : ((b as any).status || "reading"),
      currentPage: highestPage,
      isCompleted,
      pctCompleted,
      pagesRemaining,
      totalSessions,
      totalPagesRead,
      lastReadDate: lastSession ? String(lastSession.sessionDate) : null,
      createdAt: b.createdAt.toISOString(),
    };
  });
}

export async function getAllReadings(bookId?: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const [dbBooks, dbReadings] = await Promise.all([
    drizzleDb.select().from(schema.books),
    bookId
      ? drizzleDb.select().from(schema.readings).where(eq(schema.readings.bookId, bookId)).orderBy(desc(schema.readings.sessionDate), desc(schema.readings.createdAt))
      : drizzleDb.select().from(schema.readings).orderBy(desc(schema.readings.sessionDate), desc(schema.readings.createdAt)),
  ]);

  const bookMap = new Map<string, typeof dbBooks[0]>();
  for (const b of dbBooks) {
    bookMap.set(b.id, b);
  }

  return dbReadings.map((r) => {
    const book = bookMap.get(r.bookId);
    return {
      id: r.id,
      bookId: r.bookId,
      bookTitle: book?.title || "Book Session",
      author: book?.author || "",
      imageUrl: book?.imageUrl || null,
      totalPages: book?.totalPages || null,
      sessionDate: String(r.sessionDate),
      startPage: r.startPage,
      endPage: r.endPage,
      pagesRead: r.endPage === r.startPage && r.endPage > 0 ? 1 : Math.max(0, r.endPage - r.startPage),
      durationMinutes: r.durationMinutes || 0,
      insightQuote: r.insightQuote || "",
      vaultPath: r.vaultPath || "/LifeOS/Readings",
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    };
  });
}

export async function createBook(data: {
  title: string;
  author?: string;
  imageUrl?: string;
  totalPages?: number;
  status?: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  if (!data.title?.trim()) throw new Error("Book title is required");

  const inserted = await drizzleDb
    .insert(schema.books)
    .values({
      title: data.title.trim(),
      author: data.author?.trim() || "",
      imageUrl: data.imageUrl || null,
      totalPages: data.totalPages ? Number(data.totalPages) : null,
      status: data.status || "reading",
    })
    .returning();

  return inserted[0];
}

export async function updateBook(
  id: string,
  data: Partial<{
    title: string;
    author: string;
    imageUrl: string;
    totalPages: number;
    status: string;
  }>
) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const updateData: Record<string, any> = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.author !== undefined) updateData.author = data.author.trim();
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.totalPages !== undefined) updateData.totalPages = Number(data.totalPages);
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await drizzleDb
    .update(schema.books)
    .set(updateData)
    .where(eq(schema.books.id, id))
    .returning();

  return updated[0] || { success: true };
}

export async function deleteBook(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  await drizzleDb.delete(schema.readings).where(eq(schema.readings.bookId, id));
  await drizzleDb.delete(schema.books).where(eq(schema.books.id, id));
  return { success: true };
}

export async function logFinanceTransaction(data: {
  transactionDate?: string;
  date?: string;
  title: string;
  amount: number;
  category?: string;
  isEssential?: boolean;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const txDate = data.transactionDate || data.date || new Date().toISOString().slice(0, 10);
  await drizzleDb.insert(schema.financeTransactions).values({
    transactionDate: txDate,
    title: data.title || (data.amount > 0 ? "Added Funds" : "Expense"),
    amount: String(data.amount),
    category: data.category || (data.amount > 0 ? "income" : "general"),
    isEssential: data.isEssential ?? true,
  });
  return { success: true };
}

export async function updateMonthlyBudget(amountInr: number) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.customGoals)
    .where(eq(schema.customGoals.category, "monthly_budget"))
    .limit(1);

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.customGoals)
      .set({
        targetValue: String(amountInr),
      })
      .where(eq(schema.customGoals.id, existing[0].id));
  } else {
    await drizzleDb.insert(schema.customGoals).values({
      title: "Monthly Spending Allowance",
      category: "monthly_budget",
      targetValue: String(amountInr),
      currentValue: "0",
      unit: "INR",
      status: "active",
    });
  }
  return { success: true };
}

export async function logDailyIncome(dateStr: string, earnedUsd: number) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  await drizzleDb.insert(schema.financeTransactions).values({
    transactionDate: dateStr,
    title: "Daily Engineering Income",
    amount: String(earnedUsd),
    category: "income",
    isEssential: true,
  });
  return { success: true };
}

export async function addPuneContribution(amountUsd: number, note = "Pune fund contribution") {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const goals = await drizzleDb.select().from(schema.financialGoals).limit(1);
  let goalId = goals[0]?.id;
  if (!goalId) {
    const inserted = await drizzleDb
      .insert(schema.financialGoals)
      .values({
        title: "Pune Relocation & Sovereignty Fund",
        targetAmount: "5000",
        currency: "USD",
        targetDate: "2027-02-01",
      })
      .returning();
    goalId = inserted[0].id;
  }

  await drizzleDb.insert(schema.goalContributions).values({
    goalId,
    amount: String(amountUsd),
    note,
    contributedAt: new Date().toISOString().split("T")[0],
  });
  return { success: true };
}

export async function logJournal(data: {
  entryDate: string;
  category: string;
  content: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.journalEntries)
    .where(
      and(
        eq(schema.journalEntries.entryDate, data.entryDate),
        eq(schema.journalEntries.category, data.category)
      )
    );

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.journalEntries)
      .set({ content: data.content })
      .where(eq(schema.journalEntries.id, existing[0].id));
  } else {
    await drizzleDb.insert(schema.journalEntries).values(data);
  }
  return { success: true };
}

export async function updateDisciplineScore(dateStr: string, score: number) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.dailySummary)
    .where(eq(schema.dailySummary.summaryDate, dateStr));

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.dailySummary)
      .set({
        disciplineRating: score,
        dayIntegrityScore: String(score),
      })
      .where(eq(schema.dailySummary.summaryDate, dateStr));
  } else {
    await drizzleDb.insert(schema.dailySummary).values({
      summaryDate: dateStr,
      disciplineRating: score,
      dayIntegrityScore: String(score),
      pillarsMet: 0,
      pillarsTotal: 6,
      isLocked: false,
    });
  }
  return { success: true };
}

export async function lockDailyLedger(dateStr: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const existing = await drizzleDb
    .select()
    .from(schema.dailySummary)
    .where(eq(schema.dailySummary.summaryDate, dateStr));

  if (existing.length > 0) {
    await drizzleDb
      .update(schema.dailySummary)
      .set({
        isLocked: true,
        lockedAt: new Date(),
      })
      .where(eq(schema.dailySummary.summaryDate, dateStr));
  } else {
    await drizzleDb.insert(schema.dailySummary).values({
      summaryDate: dateStr,
      isLocked: true,
      lockedAt: new Date(),
      pillarsMet: 5,
      pillarsTotal: 6,
      dayIntegrityScore: "9.0",
      disciplineRating: 9,
    });
  }
  return { success: true };
}

// ---------------------------------------------------------------------
// DELETE & EDIT SERVICES (Full CRUD)
// ---------------------------------------------------------------------
export async function deleteWorkout(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.workouts).where(eq(schema.workouts.id, id));
  return { success: true };
}

export async function deleteDeepWork(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.deepWorkSessions).where(eq(schema.deepWorkSessions.id, id));
  return { success: true };
}

export async function deleteReading(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.readings).where(eq(schema.readings.id, id));
  return { success: true };
}

export async function deleteSleep(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  if (id === "latest") {
    const latest = await drizzleDb
      .select()
      .from(schema.sleepLogs)
      .orderBy(desc(schema.sleepLogs.createdAt))
      .limit(1);
    if (latest[0]) {
      await drizzleDb.delete(schema.sleepLogs).where(eq(schema.sleepLogs.id, latest[0].id));
    }
  } else {
    await drizzleDb.delete(schema.sleepLogs).where(eq(schema.sleepLogs.id, id));
  }
  return { success: true };
}

export async function deleteFinanceTransaction(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.financeTransactions).where(eq(schema.financeTransactions.id, id));
  return { success: true };
}

export async function deleteFinanceByDate(date: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  const deleted = await drizzleDb
    .delete(schema.financeTransactions)
    .where(eq(schema.financeTransactions.transactionDate, date))
    .returning({ id: schema.financeTransactions.id });
  return { success: true, deletedCount: deleted.length };
}

export async function deleteHabit(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.habitLogs).where(eq(schema.habitLogs.habitId, id));
  await drizzleDb.delete(schema.habits).where(eq(schema.habits.id, id));
  return { success: true };
}

export async function addCustomGoal(goal: {
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
}) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  const inserted = await drizzleDb
    .insert(schema.customGoals)
    .values({
      title: goal.title,
      category: goal.category,
      targetValue: String(goal.targetValue),
      currentValue: String(goal.currentValue),
      unit: goal.unit,
      targetDate: goal.targetDate,
    })
    .returning();
  return inserted[0];
}

export async function deleteCustomGoal(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.customGoals).where(eq(schema.customGoals.id, id));
  return { success: true };
}

export async function updateCustomGoal(
  id: string,
  goal: Partial<{
    title: string;
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    targetDate?: string;
  }>
) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  const updateData: Record<string, string | undefined> = {};
  if (goal.title !== undefined) updateData.title = goal.title;
  if (goal.category !== undefined) updateData.category = goal.category;
  if (goal.targetValue !== undefined) updateData.targetValue = String(goal.targetValue);
  if (goal.currentValue !== undefined) updateData.currentValue = String(goal.currentValue);
  if (goal.unit !== undefined) updateData.unit = goal.unit;
  if (goal.targetDate !== undefined) updateData.targetDate = goal.targetDate;

  await drizzleDb.update(schema.customGoals).set(updateData).where(eq(schema.customGoals.id, id));
  return { success: true };
}

export async function updateWorkout(id: string, data: any) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");

  const practicesStr = Array.isArray(data.practices)
    ? JSON.stringify(data.practices)
    : data.practices !== undefined
    ? String(data.practices)
    : undefined;

  const skCycles = data.suryaKriyaCycles !== undefined ? Number(data.suryaKriyaCycles) : data.cycles !== undefined ? Number(data.cycles) : undefined;

  await drizzleDb.update(schema.workouts).set({
    type: data.type,
    description: data.description,
    durationMinutes: data.durationMinutes !== undefined ? Number(data.durationMinutes) : undefined,
    cycles: skCycles,
    suryaKriyaCycles: skCycles,
    asanaHoldingCount: data.asanaHoldingCount !== undefined ? Number(data.asanaHoldingCount) : undefined,
    ...(practicesStr !== undefined ? { practices: practicesStr } : {}),
    calories: data.calories !== undefined ? Number(data.calories) : undefined,
    peakBpm: data.peakBpm !== undefined ? Number(data.peakBpm) : undefined,
    quality: data.quality,
  }).where(eq(schema.workouts.id, id));
  return { success: true };
}

export async function updateDeepWork(id: string, data: any) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.update(schema.deepWorkSessions).set({
    topic: data.topic,
    description: data.description,
    durationMinutes: data.durationMinutes,
    ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
    ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
    quality: data.quality,
    keyInsight: data.keyInsight,
    referenceLink: data.referenceLink,
  }).where(eq(schema.deepWorkSessions.id, id));
  return { success: true };
}

export const logDailyExpense = logFinanceTransaction;

export async function updateReading(id: string, data: any) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.update(schema.readings).set({
    startPage: Number(data.startPage),
    endPage: Number(data.endPage),
    durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined,
    insightQuote: data.insightQuote,
    vaultPath: data.vaultPath,
  }).where(eq(schema.readings.id, id));
  return { success: true };
}

export async function updateSleep(id: string, data: any) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.update(schema.sleepLogs).set({
    startDate: data.startDate !== undefined ? data.startDate : undefined,
    endDate: data.endDate !== undefined ? data.endDate : undefined,
    durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined,
    quality: data.quality ? Number(data.quality) : undefined,
    deepPct: data.deepPct !== undefined ? String(data.deepPct) : undefined,
    remPct: data.remPct !== undefined ? String(data.remPct) : undefined,
    lightPct: data.lightPct !== undefined ? String(data.lightPct) : undefined,
    awakePct: data.awakePct !== undefined ? String(data.awakePct) : undefined,
  }).where(eq(schema.sleepLogs.id, id));
  return { success: true };
}

export async function updateFinanceTransaction(id: string, data: any) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.update(schema.financeTransactions).set({
    title: data.title,
    amount: String(data.amount),
    category: data.category,
    isEssential: data.isEssential,
  }).where(eq(schema.financeTransactions.id, id));
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.delete(schema.journalEntries).where(eq(schema.journalEntries.id, id));
  return { success: true };
}

export async function updateJournalEntry(id: string, content: string) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  await drizzleDb.update(schema.journalEntries).set({ content }).where(eq(schema.journalEntries.id, id));
  return { success: true };
}

export async function updatePuneGoal(target: number) {
  const drizzleDb = getDb();
  if (!drizzleDb) throw new Error("Database not connected");
  const goals = await drizzleDb.select().from(schema.financialGoals).limit(1);
  if (goals[0]) {
    await drizzleDb.update(schema.financialGoals).set({ targetAmount: String(target) }).where(eq(schema.financialGoals.id, goals[0].id));
  }
  return { success: true };
}

// ---------------------------------------------------------------------
// REAL-TIME STREAKS & HEATMAP TELEMETRY FROM SUPABASE
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// REAL-TIME STREAKS & HEATMAP TELEMETRY FROM SUPABASE
// ---------------------------------------------------------------------
export async function getStreaksAndConsistencyTelemetry() {
  const drizzleDb = getDb();
  if (!drizzleDb) {
    throw new Error("Database not connected");
  }

  const [
    allBrahmacharya,
    allWorkouts,
    allDeepWork,
    allReadings,
    allSleep,
    allSummaries,
    allBooks,
    allHabits,
    allHabitLogs,
  ] = await Promise.all([
    drizzleDb.select().from(schema.brahmacharyaLogs).orderBy(desc(schema.brahmacharyaLogs.logDate)),
    drizzleDb.select().from(schema.workouts).orderBy(desc(schema.workouts.sessionDate)),
    drizzleDb.select().from(schema.deepWorkSessions).orderBy(desc(schema.deepWorkSessions.sessionDate)),
    drizzleDb.select().from(schema.readings).orderBy(desc(schema.readings.sessionDate)),
    drizzleDb.select().from(schema.sleepLogs).orderBy(desc(schema.sleepLogs.sleepDate)),
    drizzleDb.select().from(schema.dailySummary).orderBy(desc(schema.dailySummary.summaryDate)),
    drizzleDb.select().from(schema.books),
    drizzleDb.select().from(schema.habits).where(eq(schema.habits.isActive, true)),
    drizzleDb.select().from(schema.habitLogs).orderBy(desc(schema.habitLogs.logDate)),
  ]);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // Index maps by date string
  const bMap = new Map<string, { isClean: boolean; urges: number; notes?: string }>();
  for (const b of allBrahmacharya) {
    const dStr = typeof b.logDate === "string" ? b.logDate : (b.logDate as any)?.toISOString?.().split("T")[0] || String(b.logDate);
    bMap.set(dStr, { isClean: b.isClean, urges: b.urgesCount, notes: b.notes || "" });
  }

  const wMap = new Map<string, number>();
  const wCountMap = new Map<string, number>();
  const wTypeMap = new Map<string, string>();
  for (const w of allWorkouts) {
    const dStr = typeof w.sessionDate === "string" ? w.sessionDate : (w.sessionDate as any)?.toISOString?.().split("T")[0] || String(w.sessionDate);
    wMap.set(dStr, (wMap.get(dStr) || 0) + (w.durationMinutes || 0));
    wCountMap.set(dStr, (wCountMap.get(dStr) || 0) + 1);
    if (!wTypeMap.has(dStr)) {
      wTypeMap.set(dStr, w.description || w.type || "Workout");
    }
  }

  const dwMap = new Map<string, number>();
  const dwCountMap = new Map<string, number>();
  for (const dw of allDeepWork) {
    const dStr = typeof dw.sessionDate === "string" ? dw.sessionDate : (dw.sessionDate as any)?.toISOString?.().split("T")[0] || String(dw.sessionDate);
    dwMap.set(dStr, (dwMap.get(dStr) || 0) + (dw.durationMinutes || 0));
    dwCountMap.set(dStr, (dwCountMap.get(dStr) || 0) + 1);
  }

  const rMap = new Map<string, number>();
  const rCountMap = new Map<string, number>();
  for (const r of allReadings) {
    const dStr = typeof r.sessionDate === "string" ? r.sessionDate : (r.sessionDate as any)?.toISOString?.().split("T")[0] || String(r.sessionDate);
    const pages = Math.max(0, (r.endPage || 0) - (r.startPage || 0));
    rMap.set(dStr, (rMap.get(dStr) || 0) + pages);
    rCountMap.set(dStr, (rCountMap.get(dStr) || 0) + 1);
  }

  const sMap = new Map<string, number>();
  for (const s of allSummaries) {
    const dStr = typeof s.summaryDate === "string" ? s.summaryDate : (s.summaryDate as any)?.toISOString?.().split("T")[0] || String(s.summaryDate);
    sMap.set(dStr, s.disciplineRating ?? (s.dayIntegrityScore ? Number(s.dayIntegrityScore) : 0));
  }

  const sleepMap = new Map<string, number>();
  for (const sl of allSleep) {
    const dStr = typeof sl.sleepDate === "string" ? sl.sleepDate : (sl.sleepDate as any)?.toISOString?.().split("T")[0] || String(sl.sleepDate);
    const durHours = sl.durationMinutes ? Number(sl.durationMinutes) / 60 : ((sl as any).durationHours ? Number((sl as any).durationHours) : 0);
    sleepMap.set(dStr, durHours);
  }

  // 1. Calculate Brahmacharya Streaks
  let cleanStreak = 0;
  let longestCleanStreak = 0;
  let currentRun = 0;
  const bAsc = [...allBrahmacharya].sort((a, b) => String(a.logDate).localeCompare(String(b.logDate)));
  for (const b of bAsc) {
    if (b.isClean) {
      currentRun++;
      if (currentRun > longestCleanStreak) longestCleanStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }

  // Count current clean streak ending at today (or yesterday if today is not logged yet)
  const curDate = new Date(now);
  let checkedToday = false;
  while (true) {
    const y = curDate.getFullYear();
    const m = String(curDate.getMonth() + 1).padStart(2, "0");
    const d = String(curDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${d}`;
    const entry = bMap.get(dStr);

    if (!checkedToday && !entry) {
      // Today not logged yet, start from yesterday
      checkedToday = true;
      curDate.setDate(curDate.getDate() - 1);
      continue;
    }
    checkedToday = true;

    if (entry && entry.isClean) {
      cleanStreak++;
      curDate.setDate(curDate.getDate() - 1);
    } else {
      break;
    }
  }

  const totalCleanDays = allBrahmacharya.filter((b) => b.isClean).length;
  const totalBrahmacharyaLogs = allBrahmacharya.length;

  // Real monthly adherence for Brahmacharya
  const currentMonthIdx = now.getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const recentMonthIndices = [
    (currentMonthIdx + 10) % 12,
    (currentMonthIdx + 11) % 12,
    currentMonthIdx,
  ];
  const monthlyAdherence = recentMonthIndices.map((mIdx) => {
    const mName = monthNames[mIdx];
    const mStr = String(mIdx + 1).padStart(2, "0");
    const logsInMonth = allBrahmacharya.filter((b) => {
      const d = String(b.logDate);
      return d.startsWith(`2026-${mStr}`);
    });
    const cleanInMonth = logsInMonth.filter((b) => b.isClean).length;
    const rate = logsInMonth.length > 0 ? Math.round((cleanInMonth / logsInMonth.length) * 100) : 0;
    return {
      month: mName,
      monthIndex: mIdx,
      cleanCount: cleanInMonth,
      totalLogs: logsInMonth.length,
      rate,
    };
  });

  // 2. Deep work stats
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];
  let deepWork90dMins = 0;
  let deepWorkQuotaHits = 0;
  let totalTrackedDwDays = 0;
  let totalDeepWorkAllMins = 0;

  for (const [dStr, mins] of dwMap.entries()) {
    totalDeepWorkAllMins += mins;
    if (dStr >= ninetyDaysAgoStr && dStr <= todayStr) {
      deepWork90dMins += mins;
      totalTrackedDwDays++;
      if (mins >= 180) deepWorkQuotaHits++;
    }
  }

  const deepWorkTotalHrs90d = Math.round(deepWork90dMins / 60);
  const deepWorkTotalHrsAllTime = Math.round(totalDeepWorkAllMins / 60);
  const deepWorkQuotaRate = totalTrackedDwDays > 0 ? Math.round((deepWorkQuotaHits / totalTrackedDwDays) * 100) : 0;
  const deepWorkAvgHoursPerDay = totalTrackedDwDays > 0 ? Number((deepWork90dMins / 60 / totalTrackedDwDays).toFixed(1)) : 0;

  // Deep work streak
  let deepWorkStreak = 0;
  let longestDeepWorkStreak = 0;
  let curDwStreak = 0;
  const dwSortedDates = [...dwMap.keys()].sort();
  for (let i = 0; i < dwSortedDates.length; i++) {
    if (i === 0) {
      curDwStreak = 1;
    } else {
      const prev = new Date(dwSortedDates[i - 1]);
      const curr = new Date(dwSortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        curDwStreak++;
      } else {
        curDwStreak = 1;
      }
    }
    if (curDwStreak > longestDeepWorkStreak) longestDeepWorkStreak = curDwStreak;
  }

  const checkDwDate = new Date(now);
  let checkedTodayDw = false;
  while (true) {
    const y = checkDwDate.getFullYear();
    const m = String(checkDwDate.getMonth() + 1).padStart(2, "0");
    const d = String(checkDwDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${d}`;
    const mins = dwMap.get(dStr);
    if (!checkedTodayDw && mins === undefined) {
      checkedTodayDw = true;
      checkDwDate.setDate(checkDwDate.getDate() - 1);
      continue;
    }
    checkedTodayDw = true;
    if (mins && mins > 0) {
      deepWorkStreak++;
      checkDwDate.setDate(checkDwDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Current week deep work distribution (Monday through Sunday)
  const currentMonday = new Date(now);
  const dayOfWeek = currentMonday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentMonday.setDate(currentMonday.getDate() + diffToMonday);

  const weeklyDeepWork = [];
  const dayNamesShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let d = 0; d < 7; d++) {
    const wkDate = new Date(currentMonday);
    wkDate.setDate(currentMonday.getDate() + d);
    const y = wkDate.getFullYear();
    const m = String(wkDate.getMonth() + 1).padStart(2, "0");
    const dt = String(wkDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${dt}`;
    const hours = Number(((dwMap.get(dStr) || 0) / 60).toFixed(1));
    weeklyDeepWork.push({
      day: dayNamesShort[d],
      date: dStr,
      hours,
      isToday: dStr === todayStr,
      isFuture: dStr > todayStr,
    });
  }

  // 3. Movement / Physical Stats
  let movementStreak = 0;
  let longestMovementStreak = 0;
  let curMoveStreak = 0;
  const moveSortedDates = [...new Set([...wMap.keys(), ...wCountMap.keys()])].sort();
  for (let i = 0; i < moveSortedDates.length; i++) {
    if (i === 0) {
      curMoveStreak = 1;
    } else {
      const prev = new Date(moveSortedDates[i - 1]);
      const curr = new Date(moveSortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        curMoveStreak++;
      } else {
        curMoveStreak = 1;
      }
    }
    if (curMoveStreak > longestMovementStreak) longestMovementStreak = curMoveStreak;
  }

  const moveDate = new Date(now);
  let checkedTodayMove = false;
  while (true) {
    const y = moveDate.getFullYear();
    const m = String(moveDate.getMonth() + 1).padStart(2, "0");
    const d = String(moveDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${d}`;
    const count = wCountMap.get(dStr) || (wMap.get(dStr) ? 1 : 0);
    if (!checkedTodayMove && count === 0) {
      checkedTodayMove = true;
      moveDate.setDate(moveDate.getDate() - 1);
      continue;
    }
    checkedTodayMove = true;
    if (count > 0) {
      movementStreak++;
      moveDate.setDate(moveDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Workouts this week (Monday to Sunday)
  let sessionsThisWeek = 0;
  const weeklyProtocol = [];
  const singleDayLetters = ["M", "T", "W", "T", "F", "S", "S"];
  for (let d = 0; d < 7; d++) {
    const wkDate = new Date(currentMonday);
    wkDate.setDate(currentMonday.getDate() + d);
    const y = wkDate.getFullYear();
    const m = String(wkDate.getMonth() + 1).padStart(2, "0");
    const dt = String(wkDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${dt}`;
    const hasWorkout = (wCountMap.get(dStr) || 0) > 0 || (wMap.get(dStr) || 0) > 0;
    if (hasWorkout) sessionsThisWeek++;
    weeklyProtocol.push({
      day: singleDayLetters[d],
      dayName: dayNamesShort[d],
      date: dStr,
      hasWorkout,
      workoutType: wTypeMap.get(dStr) || (hasWorkout ? "Completed" : "Rest"),
      isToday: dStr === todayStr,
      isFuture: dStr > todayStr,
    });
  }

  // 4. Svadhyaya / Reading stats
  let totalPagesRead = 0;
  for (const pages of rMap.values()) {
    totalPagesRead += pages;
  }

  let readingStreak = 0;
  let longestReadingStreak = 0;
  let curReadStreak = 0;
  const readSortedDates = [...rMap.keys()].sort();
  for (let i = 0; i < readSortedDates.length; i++) {
    if (i === 0) {
      curReadStreak = 1;
    } else {
      const prev = new Date(readSortedDates[i - 1]);
      const curr = new Date(readSortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        curReadStreak++;
      } else {
        curReadStreak = 1;
      }
    }
    if (curReadStreak > longestReadingStreak) longestReadingStreak = curReadStreak;
  }

  const readDate = new Date(now);
  let checkedTodayRead = false;
  while (true) {
    const y = readDate.getFullYear();
    const m = String(readDate.getMonth() + 1).padStart(2, "0");
    const d = String(readDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${d}`;
    const pages = rMap.get(dStr);
    if (!checkedTodayRead && pages === undefined) {
      checkedTodayRead = true;
      readDate.setDate(readDate.getDate() - 1);
      continue;
    }
    checkedTodayRead = true;
    if (pages !== undefined && pages >= 0) {
      readingStreak++;
      readDate.setDate(readDate.getDate() - 1);
    } else {
      break;
    }
  }

  // 5. 53 WEEKS x 7 DAYS CALENDAR HEATMAP MATRIX FOR 2026
  // Exact Monday-start week: Dec 29, 2025 is Monday (day index 0).
  // Row 0 = Mon, Row 1 = Tue, Row 2 = Wed, Row 3 = Thu, Row 4 = Fri, Row 5 = Sat, Row 6 = Sun
  const totalCols = 53;
  const totalCells = totalCols * 7; // 371 tiles
  const startDate = new Date(2025, 11, 29); // Mon Dec 29, 2025

  const tiles = [];
  let masterCadenceStreak = 0;
  let masterCadencePb = 0;
  let curCadenceRun = 0;
  let totalActiveDays2026 = 0;
  let totalElapsedDays2026 = 0;

  for (let i = 0; i < totalCells; i++) {
    const tileDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const y = tileDate.getFullYear();
    const m = String(tileDate.getMonth() + 1).padStart(2, "0");
    const d = String(tileDate.getDate()).padStart(2, "0");
    const dStr = `${y}-${m}-${d}`;

    const isPadding = dStr < "2026-01-01" || dStr > "2026-12-31";
    const isFuture = dStr > todayStr;
    const isToday = dStr === todayStr;

    const row = i % 7; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    const col = Math.floor(i / 7);

    let vitalityLevel = 0;
    let deepWorkLevel = 0;
    let movementLevel = 0;
    let svadhyayaLevel = 0;
    let pillarsMet = 0;
    const pillarDetails: string[] = [];

    if (!isFuture && !isPadding) {
      totalElapsedDays2026++;

      // Vitality / NoFap
      const bLog = bMap.get(dStr);
      if (bLog && bLog.isClean) {
        vitalityLevel = 4;
        pillarsMet++;
        pillarDetails.push("NoFap Clean");
      } else if (bLog && !bLog.isClean) {
        vitalityLevel = 1;
        pillarDetails.push("Urge/Relapse Logged");
      }

      // Deep Work
      const dwMins = dwMap.get(dStr) || 0;
      if (dwMins >= 180) {
        deepWorkLevel = 4;
        pillarsMet++;
        pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
      } else if (dwMins >= 120) {
        deepWorkLevel = 3;
        pillarsMet++;
        pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
      } else if (dwMins >= 60) {
        deepWorkLevel = 2;
        pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
      } else if (dwMins > 0) {
        deepWorkLevel = 1;
        pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
      }

      // Movement & Calisthenics
      const wMins = wMap.get(dStr) || 0;
      const wCount = wCountMap.get(dStr) || 0;
      if (wMins >= 60) {
        movementLevel = 4;
        pillarsMet++;
        pillarDetails.push(`Movement: ${wMins}m`);
      } else if (wMins >= 45) {
        movementLevel = 3;
        pillarsMet++;
        pillarDetails.push(`Movement: ${wMins}m`);
      } else if (wMins > 0 || wCount > 0) {
        movementLevel = 3;
        pillarsMet++;
        pillarDetails.push(wTypeMap.get(dStr) || "Movement Session");
      }

      // Reading Logs
      const rPages = rMap.get(dStr) || 0;
      const rCount = rCountMap.get(dStr) || 0;
      if (rPages >= 30) {
        svadhyayaLevel = 4;
        pillarsMet++;
        pillarDetails.push(`Reading: ${rPages}p`);
      } else if (rPages >= 20) {
        svadhyayaLevel = 3;
        pillarsMet++;
        pillarDetails.push(`Reading: ${rPages}p`);
      } else if (rPages >= 10) {
        svadhyayaLevel = 2;
        pillarDetails.push(`Reading: ${rPages}p`);
      } else if (rPages > 0 || rCount > 0) {
        svadhyayaLevel = 1;
        pillarsMet++;
        pillarDetails.push(`Reading Logged`);
      }

      if (pillarsMet >= 1) {
        totalActiveDays2026++;
        curCadenceRun++;
        if (curCadenceRun > masterCadencePb) masterCadencePb = curCadenceRun;
      } else {
        curCadenceRun = 0;
      }
    }

    const discScore =
      sMap.get(dStr) ||
      (pillarsMet >= 4 ? 10 : pillarsMet === 3 ? 8 : pillarsMet === 2 ? 7 : pillarsMet === 1 ? 6 : 0);

    const allLevel =
      isFuture || isPadding
        ? 0
        : pillarsMet >= 4
        ? 4
        : pillarsMet === 3
        ? 3
        : pillarsMet === 2
        ? 2
        : pillarsMet >= 1
        ? 1
        : 0;

    const weekdayShort = tileDate.toLocaleDateString("en-US", { weekday: "short" });
    const dateLabel = tileDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let hoverStatus = "";
    if (isPadding) {
      hoverStatus = `${dateLabel} (Adjacent Year)`;
    } else if (isFuture) {
      hoverStatus = `${dateLabel} • Future Node`;
    } else if (pillarsMet === 0) {
      hoverStatus = `${dateLabel} • No activity logged`;
    } else {
      hoverStatus = `${dateLabel} • Pillars Met: ${pillarsMet}/4 (${pillarDetails.join(", ")}) • Score: ${discScore}/10`;
    }

    tiles.push({
      index: i,
      col,
      row,
      dayOfWeek: weekdayShort,
      date: dStr,
      dateLabel,
      isPadding,
      isFuture,
      isToday,
      all: allLevel,
      vitality: vitalityLevel,
      deepwork: deepWorkLevel,
      movement: movementLevel,
      svadhyaya: svadhyayaLevel,
      pillarsMet,
      disciplineScore: discScore,
      hoverStatus,
    });
  }

  // Calculate master cadence streak ending today (or yesterday if today has no activity yet)
  const todayTile = tiles.find((t) => t.date === todayStr);
  const todayTileIdx = todayTile ? todayTile.index : -1;
  if (todayTileIdx >= 0) {
    let startIdx = todayTileIdx;
    if (tiles[todayTileIdx].pillarsMet === 0) {
      startIdx = todayTileIdx - 1;
    }
    for (let i = startIdx; i >= 0; i--) {
      if (tiles[i].isPadding) continue;
      if (tiles[i].pillarsMet >= 1) {
        masterCadenceStreak++;
      } else {
        break;
      }
    }
  }

  const chainIntegrity =
    totalElapsedDays2026 > 0 ? Number(((totalActiveDays2026 / totalElapsedDays2026) * 100).toFixed(1)) : 0;

  // Month header labels with column alignments for 53 columns
  const monthLabelsMap: { [col: number]: string } = {
    0: "Jan",
    4: "Feb",
    8: "Mar",
    13: "Apr",
    17: "May",
    22: "Jun",
    26: "Jul",
    30: "Aug",
    35: "Sep",
    39: "Oct",
    43: "Nov",
    48: "Dec",
  };

  const monthColumns = Array.from({ length: 53 }, (_, colIdx) => ({
    col: colIdx,
    label: monthLabelsMap[colIdx] || "",
  }));

  // Historical Records Table real data
  const historicalLedger = [
    {
      protocol: "NoFap / Seminal Retention",
      longest: `${longestCleanStreak} Days`,
      current: `${cleanStreak} Days`,
      loggedTotal: `${totalCleanDays} Clean / ${totalBrahmacharyaLogs} Logged`,
      resilience: totalBrahmacharyaLogs > 0 ? (totalCleanDays / totalBrahmacharyaLogs * 10).toFixed(1) : "0.0",
      color: "amber-400",
    },
    {
      protocol: "Engineering Deep Work (≥3h blocks)",
      longest: `${longestDeepWorkStreak} Days`,
      current: `${deepWorkStreak} Days (${deepWorkQuotaRate}% Hits)`,
      loggedTotal: `${deepWorkTotalHrsAllTime} Hours (${allDeepWork.length} Sessions)`,
      resilience: deepWorkQuotaRate > 0 ? (deepWorkQuotaRate / 10).toFixed(1) : "0.0",
      color: "cyan-400",
    },
    {
      protocol: "Dawn Movement & Calisthenics",
      longest: `${longestMovementStreak} Days`,
      current: `${movementStreak} Days`,
      loggedTotal: `${allWorkouts.length} Sessions (${sessionsThisWeek} This Wk)`,
      resilience: allWorkouts.length > 0 ? Math.min(10, Math.max(1, (sessionsThisWeek / 6) * 10)).toFixed(1) : "0.0",
      color: "emerald-400",
    },
    {
      protocol: "Reading Logs (Svadhyaya)",
      longest: `${longestReadingStreak} Days`,
      current: `${readingStreak} Days`,
      loggedTotal: `${totalPagesRead} Pages (${allBooks.length} Books)`,
      resilience: allBooks.length > 0 ? "8.5" : "0.0",
      color: "cyan-300",
    },
    {
      protocol: "Sleep Discipline & Night Recovery",
      longest: `${allSleep.length > 0 ? allSleep.length : 0} Nights`,
      current: allSleep.length > 0 ? (allSleep[0].durationMinutes ? `${(allSleep[0].durationMinutes / 60).toFixed(1)}h` : ((allSleep[0] as any).durationHours ? `${(allSleep[0] as any).durationHours}h` : "Logged")) : "0",
      loggedTotal: `${allSleep.length} Nights Logged`,
      resilience: allSleep.length > 0 ? "8.8" : "0.0",
      color: "outline",
    },
  ];

  const activeResilienceScores = historicalLedger
    .map((r) => Number(r.resilience))
    .filter((s) => s > 0);
  const aggregateResilience =
    activeResilienceScores.length > 0
      ? (activeResilienceScores.reduce((a, b) => a + b, 0) / activeResilienceScores.length).toFixed(2)
      : "0.00";

  // Real correlation telemetry
  const distinctLoggedDays = new Set([
    ...bMap.keys(),
    ...wMap.keys(),
    ...dwMap.keys(),
    ...rMap.keys(),
    ...sleepMap.keys(),
  ]).size;

  const multiPillarDaysCount = tiles.filter((t) => !t.isFuture && !t.isPadding && t.pillarsMet >= 2).length;

  // 6. Generate 12 distinct months with clear separation
  const monthsData = [];
  const allMonthsList = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(2026, m, 1);
    const lastDay = new Date(2026, m + 1, 0);
    const numDays = lastDay.getDate();

    const jsDay = firstDay.getDay(); // 0 is Sun, 1 is Mon...
    const startRow = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Tue=1, ..., Sun=6
    const totalSlots = startRow + numDays;
    const numCols = Math.ceil(totalSlots / 7);
    const totalGridCells = numCols * 7;

    const monthTiles = [];
    for (let slot = 0; slot < totalGridCells; slot++) {
      const dayNum = slot - startRow + 1;
      const row = slot % 7; // Mon=0 .. Sun=6
      const col = Math.floor(slot / 7);

      if (dayNum < 1 || dayNum > numDays) {
        monthTiles.push({
          isEmpty: true,
          row,
          col,
        });
      } else {
        const dStr = `2026-${String(m + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        const dayDate = new Date(2026, m, dayNum);
        const weekdayShort = dayDate.toLocaleDateString("en-US", { weekday: "short" });
        const dateLabel = dayDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const isFuture = dStr > todayStr;
        const isToday = dStr === todayStr;

        let vitalityLevel = 0;
        let deepWorkLevel = 0;
        let movementLevel = 0;
        let svadhyayaLevel = 0;
        let pillarsMet = 0;
        const pillarDetails: string[] = [];

        if (!isFuture) {
          const bLog = bMap.get(dStr);
          if (bLog && bLog.isClean) {
            vitalityLevel = 4;
            pillarsMet++;
            pillarDetails.push("NoFap Clean");
          } else if (bLog && !bLog.isClean) {
            vitalityLevel = 1;
            pillarDetails.push("Urge/Relapse Logged");
          }

          const dwMins = dwMap.get(dStr) || 0;
          if (dwMins >= 180) {
            deepWorkLevel = 4;
            pillarsMet++;
            pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
          } else if (dwMins >= 120) {
            deepWorkLevel = 3;
            pillarsMet++;
            pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
          } else if (dwMins >= 60) {
            deepWorkLevel = 2;
            pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
          } else if (dwMins > 0) {
            deepWorkLevel = 1;
            pillarDetails.push(`Deep Work: ${(dwMins / 60).toFixed(1)}h`);
          }

          const wMins = wMap.get(dStr) || 0;
          const wCount = wCountMap.get(dStr) || 0;
          if (wMins >= 60) {
            movementLevel = 4;
            pillarsMet++;
            pillarDetails.push(`Movement: ${wMins}m`);
          } else if (wMins >= 45) {
            movementLevel = 3;
            pillarsMet++;
            pillarDetails.push(`Movement: ${wMins}m`);
          } else if (wMins > 0 || wCount > 0) {
            movementLevel = 3;
            pillarsMet++;
            pillarDetails.push(wTypeMap.get(dStr) || "Movement Session");
          }

          const rPages = rMap.get(dStr) || 0;
          const rCount = rCountMap.get(dStr) || 0;
          if (rPages >= 30) {
            svadhyayaLevel = 4;
            pillarsMet++;
            pillarDetails.push(`Reading: ${rPages}p`);
          } else if (rPages >= 20) {
            svadhyayaLevel = 3;
            pillarsMet++;
            pillarDetails.push(`Reading: ${rPages}p`);
          } else if (rPages >= 10) {
            svadhyayaLevel = 2;
            pillarDetails.push(`Reading: ${rPages}p`);
          } else if (rPages > 0 || rCount > 0) {
            svadhyayaLevel = 1;
            pillarsMet++;
            pillarDetails.push("Reading Logged");
          }
        }

        const discScore =
          sMap.get(dStr) ||
          (pillarsMet >= 4 ? 10 : pillarsMet === 3 ? 8 : pillarsMet === 2 ? 7 : pillarsMet === 1 ? 6 : 0);

        const allLevel =
          isFuture
            ? 0
            : pillarsMet >= 4
            ? 4
            : pillarsMet === 3
            ? 3
            : pillarsMet === 2
            ? 2
            : pillarsMet >= 1
            ? 1
            : 0;

        let hoverStatus = "";
        if (isFuture) {
          hoverStatus = `${dateLabel} • Future Node`;
        } else if (pillarsMet === 0) {
          hoverStatus = `${dateLabel} • No activity logged`;
        } else {
          hoverStatus = `${dateLabel} • Pillars Met: ${pillarsMet}/4 (${pillarDetails.join(", ")}) • Score: ${discScore}/10`;
        }

        monthTiles.push({
          isEmpty: false,
          dayNum,
          date: dStr,
          dateLabel,
          weekday: weekdayShort,
          row,
          col,
          isFuture,
          isToday,
          all: allLevel,
          vitality: vitalityLevel,
          deepwork: deepWorkLevel,
          movement: movementLevel,
          svadhyaya: svadhyayaLevel,
          pillarsMet,
          disciplineScore: discScore,
          hoverStatus,
        });
      }
    }

    monthsData.push({
      name: allMonthsList[m],
      monthIndex: m,
      year: 2026,
      numDays,
      numCols,
      tiles: monthTiles,
    });
  }

  return {
    masterCadence: {
      streak: masterCadenceStreak,
      personalBest: masterCadencePb,
      adherenceRate: chainIntegrity,
      activeDays: totalActiveDays2026,
      elapsedDays: totalElapsedDays2026,
    },
    brahmacharya: {
      cleanStreak,
      longestStreak: longestCleanStreak,
      daysTo90: Math.max(0, 90 - cleanStreak),
      totalCleanDays,
      totalLoggedDays: totalBrahmacharyaLogs,
      monthlyAdherence,
    },
    deepWork: {
      totalHrs90d: deepWorkTotalHrs90d,
      totalHrsAllTime: deepWorkTotalHrsAllTime,
      quotaHitRate: deepWorkQuotaRate,
      avgHoursPerDay: deepWorkAvgHoursPerDay,
      streak: deepWorkStreak,
      longestStreak: longestDeepWorkStreak,
      weeklyDistribution: weeklyDeepWork,
    },
    physical: {
      movementStreak,
      longestStreak: longestMovementStreak,
      sessionsThisWeek,
      totalSessions: allWorkouts.length,
      weeklyProtocol,
      latestWorkout: allWorkouts.length > 0 ? allWorkouts[0] : null,
    },
    svadhyaya: {
      booksRead: allBooks.length,
      totalPagesRead,
      streak: readingStreak,
      longestStreak: longestReadingStreak,
      totalSessions: allReadings.length,
    },
    historicalLedger,
    aggregateResilience,
    correlation: {
      distinctLoggedDays,
      multiPillarDaysCount,
      sampleConfidence: distinctLoggedDays >= 30 ? "High" : distinctLoggedDays >= 10 ? "Moderate" : "Forming",
      sampleRatio: distinctLoggedDays > 0 ? Math.round((multiPillarDaysCount / distinctLoggedDays) * 100) : 0,
    },
    monthColumns,
    totalCols,
    totalCells,
    tiles,
    months: monthsData,
  };
}
