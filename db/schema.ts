import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------
// 1. TAGS
// ---------------------------------------------------------------------
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().unique(),
  colorCode: text("color_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const taggables = pgTable(
  "taggables",
  {
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    taggableType: text("taggable_type").notNull(), // 'book' | 'workout' | 'deep_work_session' | 'journal_entry'
    taggableId: uuid("taggable_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tagId, table.taggableType, table.taggableId] }),
  ]
);

// ---------------------------------------------------------------------
// 2. BOOKS + READINGS (Daily Reading)
// ---------------------------------------------------------------------
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author"),
  imageUrl: text("image_url"),
  totalPages: integer("total_pages"),
  status: text("status").default("reading"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readings = pgTable("readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  sessionDate: date("session_date").notNull().defaultNow(),
  startPage: integer("start_page").notNull(),
  endPage: integer("end_page").notNull(),
  durationMinutes: integer("duration_minutes"),
  insightQuote: text("insight_quote"),
  vaultPath: text("vault_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 3. WORKOUTS (Sadhana = exercise: surya kriya, yogasana, shambhavi, calisthenics)
// ---------------------------------------------------------------------
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionDate: date("session_date").notNull().defaultNow(),
  type: text("type").notNull(), // 'surya_kriya' | 'yogasana' | 'shambhavi' | 'calisthenics' | 'other'
  description: text("description"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  durationMinutes: integer("duration_minutes"),
  cycles: integer("cycles"),
  suryaKriyaCycles: integer("surya_kriya_cycles"),
  asanaHoldingCount: integer("asana_holding_count"),
  practices: text("practices"),
  calories: integer("calories"),
  peakBpm: integer("peak_bpm"),
  quality: text("quality"), // 'Zone 3/4 Physical'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 4. SLEEP
// ---------------------------------------------------------------------
export const sleepLogs = pgTable("sleep_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sleepDate: date("sleep_date").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  bedtime: timestamp("bedtime", { withTimezone: true }),
  wakeTime: timestamp("wake_time", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  quality: integer("quality"), // 0-100 score
  deepPct: numeric("deep_pct", { precision: 5, scale: 2 }),
  remPct: numeric("rem_pct", { precision: 5, scale: 2 }),
  lightPct: numeric("light_pct", { precision: 5, scale: 2 }),
  awakePct: numeric("awake_pct", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 5. BRAHMACHARYA (No Nuts Tracker)
// ---------------------------------------------------------------------
export const brahmacharyaLogs = pgTable("brahmacharya_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  logDate: date("log_date").notNull().unique(),
  isClean: boolean("is_clean").notNull().default(true),
  urgesCount: integer("urges_count").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 6. DEEP WORK
// ---------------------------------------------------------------------
export const deepWorkSessions = pgTable("deep_work_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionDate: date("session_date").notNull().defaultNow(),
  topic: text("topic").notNull(),
  description: text("description"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  durationMinutes: integer("duration_minutes"),
  quality: text("quality"), // 'Session Verified'
  keyInsight: text("key_insight"),
  referenceLink: text("reference_link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 7. FINANCE (day-to-day INR spend & earnings)
// ---------------------------------------------------------------------
export const financeTransactions = pgTable("finance_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionDate: date("transaction_date").notNull().defaultNow(),
  title: text("title").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // INR: negative for spend, positive for income
  isEssential: boolean("is_essential").default(true),
  category: text("category"), // 'food' | 'books' | 'transport' | 'income' | 'deepwork_earn' | ...
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 8. FINANCIAL GOALS (strictly USD — e.g. Pune Relocation & Sovereignty Fund)
// ---------------------------------------------------------------------
export const financialGoals = pgTable("financial_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  targetDate: date("target_date"),
  startedAt: date("started_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goalContributions = pgTable("goal_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => financialGoals.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  note: text("note"),
  contributedAt: date("contributed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 9. CUSTOM GOALS (Skill, Income Rate, Physical)
// ---------------------------------------------------------------------
export const customGoals = pgTable("custom_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: text("category"), // 'skill' | 'income' | 'physical'
  targetValue: numeric("target_value").notNull(),
  currentValue: numeric("current_value").notNull().default("0"),
  unit: text("unit"), // '%' | 'hrs' | 'reps' | 'USD/mo'
  targetDate: date("target_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customGoalUpdates = pgTable("custom_goal_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => customGoals.id, { onDelete: "cascade" }),
  value: numeric("value").notNull(),
  note: text("note"),
  updatedAt: date("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 10. HABITS (Non-Negotiable Vows)
// ---------------------------------------------------------------------
export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull().defaultNow(),
    isCompleted: boolean("is_completed").notNull().default(false),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  }
);

// ---------------------------------------------------------------------
// 11. JOURNAL / THOUGHT CAPTURE
// ---------------------------------------------------------------------
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryDate: date("entry_date").notNull().defaultNow(),
  category: text("category").notNull(), // 'creation' | 'friction_lesson' | 'evening_reflection' | 'three_lines' | 'mood' | 'weekly_review' | 'monthly_review'
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 12. DAILY SUMMARY — Written once or live computed
// ---------------------------------------------------------------------
export const dailySummary = pgTable("daily_summary", {
  id: uuid("id").primaryKey().defaultRandom(),
  summaryDate: date("summary_date").notNull().unique(),
  pillarsMet: integer("pillars_met"),
  pillarsTotal: integer("pillars_total"),
  dayIntegrityScore: numeric("day_integrity_score", { precision: 3, scale: 1 }),
  disciplineRating: integer("discipline_rating"), // 1-10 self-rating
  isLocked: boolean("is_locked").notNull().default(false),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------
export const booksRelations = relations(books, ({ many }) => ({
  readings: many(readings),
}));

export const readingsRelations = relations(readings, ({ one }) => ({
  book: one(books, {
    fields: [readings.bookId],
    references: [books.id],
  }),
}));

export const financialGoalsRelations = relations(financialGoals, ({ many }) => ({
  contributions: many(goalContributions),
}));

export const goalContributionsRelations = relations(goalContributions, ({ one }) => ({
  goal: one(financialGoals, {
    fields: [goalContributions.goalId],
    references: [financialGoals.id],
  }),
}));

export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));

export const customGoalsRelations = relations(customGoals, ({ many }) => ({
  updates: many(customGoalUpdates),
}));

// ---------------------------------------------------------------------
// 13. PLANNER TASKS (Daily Day Planner)
// ---------------------------------------------------------------------
export const plannerTasks = pgTable("planner_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskDate: date("task_date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timeSlot: text("time_slot"), // e.g. '06:00', '09:30' — optional time anchor
  priority: text("priority").notNull().default("medium"), // 'critical' | 'high' | 'medium' | 'low'
  category: text("category"), // 'deep_work' | 'sadhana' | 'reading' | 'personal' | 'health' | 'admin' | 'social'
  status: text("status").notNull().default("pending"), // 'pending' | 'in_progress' | 'completed' | 'skipped'
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 14. PLANNER GOALS (Weekly & Monthly Goal Tracking)
// ---------------------------------------------------------------------
export const plannerGoals = pgTable("planner_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  scope: text("scope").notNull(), // 'weekly' | 'monthly'
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  targetValue: integer("target_value").notNull().default(1), // numeric target (e.g. 5 sessions, 30 pages)
  currentValue: integer("current_value").notNull().default(0),
  unit: text("unit"), // 'sessions' | 'pages' | 'hours' | 'tasks' | custom
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'failed' | 'paused'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------
// 15. DAILY TIME BLOCKS (Whole Day Time Log & Life Coach Optimization)
// ---------------------------------------------------------------------
export const dailyTimeBlocks = pgTable("daily_time_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  logDate: date("log_date").notNull().defaultNow(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  activity: text("activity").notNull(),
  category: text("category").notNull().default("deep_work"), // 'deep_work' | 'sadhana_health' | 'shallow_work' | 'rest_recovery' | 'distraction_leak' | 'social_personal'
  energyLevel: integer("energy_level").default(3), // 1-5
  focusQuality: text("focus_quality").default("deep_flow"), // 'deep_flow' | 'moderate' | 'fractured' | 'distracted'
  shouldHaveDone: text("should_have_done"),
  coachOptimization: text("coach_optimization"),
  leverageScore: integer("leverage_score").default(8), // 1-10
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
