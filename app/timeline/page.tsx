"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Code2,
  ShieldAlert,
  Building2,
  Sparkles,
  TrendingUp,
  Target,
  Compass,
  Calendar,
  DollarSign,
  Flame,
  Layers,
  Search,
  Award,
  Zap,
  ArrowRight,
  BookOpen,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Milestone Data Types ──────────────────────────────────────────────
export type MilestoneCategory =
  | "schooling"
  | "undergrad"
  | "postgrad"
  | "tech_pivot"
  | "crucible"
  | "industry"
  | "sovereignty";

export type MilestoneStatus = "completed" | "current" | "horizon";

export interface Milestone {
  year: number;
  title: string;
  subtitle: string;
  category: MilestoneCategory;
  categoryLabel: string;
  status: MilestoneStatus;
  phase: "foundations" | "crucible" | "horizon";
  phaseLabel: string;
  description: string;
  takeaway: string;
  highlightMetric?: string;
  incomeTarget?: string;
  location?: string;
  tags: string[];
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

// ─── Master 16-Year Timeline Dataset ────────────────────────────────────
const TIMELINE_DATA: Milestone[] = [
  {
    year: 2014,
    title: "9th Standard",
    subtitle: "Secondary Education Foundations",
    category: "schooling",
    categoryLabel: "Secondary School",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Academic Grounding",
    description:
      "Formative academic year developing rigorous study routines, fundamental sciences, and mathematical problem-solving habits.",
    takeaway: "Building discipline and curiosity early shapes long-term intellectual endurance.",
    tags: ["Academics", "Science", "Mathematics", "Discipline"],
    icon: BookOpen,
    accentColor: "#a78bfa",
    accentBg: "rgba(167, 139, 250, 0.08)",
    accentBorder: "rgba(167, 139, 250, 0.25)",
  },
  {
    year: 2015,
    title: "10th Standard",
    subtitle: "Secondary School Examination (Matriculation)",
    category: "schooling",
    categoryLabel: "Board Milestone",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Academic Grounding",
    description:
      "Successful completion of 10th standard secondary board examinations, crossing the first major educational threshold.",
    takeaway: "Handling structured, high-stakes milestone examinations under pressure.",
    highlightMetric: "Secondary Board Clear",
    tags: ["Board Exam", "Matriculation", "Milestone", "Focus"],
    icon: Award,
    accentColor: "#a78bfa",
    accentBg: "rgba(167, 139, 250, 0.08)",
    accentBorder: "rgba(167, 139, 250, 0.25)",
  },
  {
    year: 2016,
    title: "11th Standard",
    subtitle: "Higher Secondary Sciences Track",
    category: "schooling",
    categoryLabel: "Higher Secondary",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Academic Grounding",
    description:
      "Stepping into advanced higher secondary coursework in core sciences and analytical disciplines, expanding conceptual depth.",
    takeaway: "Transitioning from basic memorization to first-principles logical reasoning.",
    tags: ["Higher Secondary", "Core Sciences", "Logic", "Analytical"],
    icon: BookOpen,
    accentColor: "#a78bfa",
    accentBg: "rgba(167, 139, 250, 0.08)",
    accentBorder: "rgba(167, 139, 250, 0.25)",
  },
  {
    year: 2017,
    title: "12th Standard",
    subtitle: "Senior Secondary Board Qualification",
    category: "schooling",
    categoryLabel: "Senior Board",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Academic Grounding",
    description:
      "Culmination of school education with senior secondary board examinations, qualifying for collegiate university studies.",
    takeaway: "Completion of foundational school era; preparedness for independent university academia.",
    highlightMetric: "Senior Secondary Clear",
    tags: ["12th Board", "Graduation Prep", "University Entry"],
    icon: Award,
    accentColor: "#a78bfa",
    accentBg: "rgba(167, 139, 250, 0.08)",
    accentBorder: "rgba(167, 139, 250, 0.25)",
  },
  {
    year: 2018,
    title: "B.Sc. First Year",
    subtitle: "Bachelor of Science Commencement",
    category: "undergrad",
    categoryLabel: "Undergraduate Year 1",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Undergraduate Academia",
    description:
      "Entering university for Bachelor of Science. Immersing in higher-level theoretical frameworks and scientific methodology.",
    takeaway: "Embracing self-directed learning beyond guided classroom schooling.",
    tags: ["University", "B.Sc.", "Science", "Higher Education"],
    icon: GraduationCap,
    accentColor: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.08)",
    accentBorder: "rgba(56, 189, 248, 0.25)",
  },
  {
    year: 2019,
    title: "B.Sc. Second Year",
    subtitle: "Undergraduate Core Deepening",
    category: "undergrad",
    categoryLabel: "Undergraduate Year 2",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Undergraduate Academia",
    description:
      "Core subject specialization and laboratory / analytical problem solving during the intermediate collegiate phase.",
    takeaway: "Consistency in mid-degree cycles where long-term focus determines final mastery.",
    tags: ["B.Sc.", "Analytical", "Domain Specialization"],
    icon: GraduationCap,
    accentColor: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.08)",
    accentBorder: "rgba(56, 189, 248, 0.25)",
  },
  {
    year: 2020,
    title: "B.Sc. Third Year",
    subtitle: "Bachelor of Science Degree Attainment",
    category: "undergrad",
    categoryLabel: "Undergraduate Graduation",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Undergraduate Academia",
    description:
      "Completing final undergraduate year and earning Bachelor of Science degree amidst global pandemic disruptions.",
    takeaway: "Navigated 2020 disruptions with adaptability, achieving collegiate degree milestone.",
    highlightMetric: "B.Sc. Degree Completed",
    tags: ["B.Sc. Graduate", "Degree Completed", "2020 Resilience"],
    icon: Award,
    accentColor: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.08)",
    accentBorder: "rgba(56, 189, 248, 0.25)",
  },
  {
    year: 2021,
    title: "M.Sc. First Year",
    subtitle: "Master of Science Postgraduation",
    category: "postgrad",
    categoryLabel: "Postgraduate Year 1",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Master's Specialization",
    description:
      "Commenced advanced postgraduate degree (M.Sc.). Diving into higher-order computational models and advanced concepts.",
    takeaway: "High-level scientific abstraction builds mental models for rapid technical assimilation.",
    tags: ["M.Sc.", "Postgraduate", "Advanced Sciences", "Mastery"],
    icon: GraduationCap,
    accentColor: "#818cf8",
    accentBg: "rgba(129, 140, 248, 0.08)",
    accentBorder: "rgba(129, 140, 248, 0.25)",
  },
  {
    year: 2022,
    title: "M.Sc. Second Year",
    subtitle: "Master of Science Graduation & Apex",
    category: "postgrad",
    categoryLabel: "Master's Completion",
    status: "completed",
    phase: "foundations",
    phaseLabel: "Master's Specialization",
    description:
      "Culmination of formal higher education with M.Sc. degree completion. Ready to transition from academic theory to industry technology.",
    takeaway: "Academic journey concluded at Master's level; primed for intense technological pivot.",
    highlightMetric: "M.Sc. Master's Degree",
    tags: ["M.Sc. Completed", "Postgraduate Master", "Academic Apex"],
    icon: Award,
    accentColor: "#818cf8",
    accentBg: "rgba(129, 140, 248, 0.08)",
    accentBorder: "rgba(129, 140, 248, 0.25)",
  },
  {
    year: 2023,
    title: "Coding Ninja",
    subtitle: "Full-Stack Software Engineering Immersion",
    category: "tech_pivot",
    categoryLabel: "Tech Transformation",
    status: "completed",
    phase: "crucible",
    phaseLabel: "Industry & Crucible",
    description:
      "Rigorous programming bootcamp immersion with Coding Ninjas. Mastery of Data Structures & Algorithms, full-stack web engineering, and modern developer tooling.",
    takeaway: "Deep work & focused technical upskilling can completely pivot a career trajectory in 12 months.",
    highlightMetric: "Full-Stack Tech Fluency",
    tags: ["Coding Ninjas", "DSA", "Full-Stack Web", "Tech Pivot", "Deep Work"],
    icon: Code2,
    accentColor: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.08)",
    accentBorder: "rgba(245, 158, 11, 0.25)",
  },
  {
    year: 2024,
    title: "Pune Scam (The Crucible)",
    subtitle: "Adversity Transformed Into Unshakeable Resolve",
    category: "crucible",
    categoryLabel: "Crucible & Battle Scar",
    status: "completed",
    phase: "crucible",
    phaseLabel: "Industry & Crucible",
    description:
      "A grueling real-world encounter with deceit and financial betrayal in Pune. While intensely testing, it became the decisive catalyst that ignited ruthless discernment, mental armor, and an unquenchable drive for sovereignty.",
    takeaway:
      "Adversity is the greatest master. Pain was forged into armor. Pune will be reconquered with complete financial victory.",
    highlightMetric: "Resilience Forged",
    location: "Pune",
    tags: ["Adversity", "Battle Tested", "Mental Armor", "Turning Point", "Indomitable"],
    icon: ShieldAlert,
    accentColor: "#ef4444",
    accentBg: "rgba(239, 68, 68, 0.08)",
    accentBorder: "rgba(239, 68, 68, 0.25)",
  },
  {
    year: 2025,
    title: "Mama + RamanshreeInfoTech",
    subtitle: "Dual Devotion: Family Anchor & Professional Launch",
    category: "industry",
    categoryLabel: "Career & Family",
    status: "completed",
    phase: "crucible",
    phaseLabel: "Industry & Crucible",
    description:
      "Commenced professional software development at RamanshreeInfoTech while steadfastly supporting Mama and family responsibilities with utmost devotion and honor.",
    takeaway: "True strength lies in executing professional excellence while being an unshakeable pillar for loved ones.",
    highlightMetric: "Professional Engineering Active",
    tags: ["RamanshreeInfoTech", "Family First", "Professional Growth", "Software Dev"],
    icon: Building2,
    accentColor: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.08)",
    accentBorder: "rgba(6, 182, 212, 0.25)",
  },
  {
    year: 2026,
    title: "RamanshreeInfoTech",
    subtitle: "Consolidation, Deep Work & Sovereign War Chest",
    category: "industry",
    categoryLabel: "Active Year Anchor",
    status: "current",
    phase: "crucible",
    phaseLabel: "Industry & Crucible",
    description:
      "Current operational anchor. Driving high-craft software engineering at RamanshreeInfoTech, maintaining unbroken habit streaks in LifeOS, and aggressively stacking capital for the Pune relocation and sovereignty horizon.",
    takeaway:
      "Execution over intention. Every deep work session and saved dollar compounds toward total life sovereignty.",
    highlightMetric: "Current Operational Base",
    tags: ["RamanshreeInfoTech", "LifeOS Active", "Capital Accumulation", "Sprint to 2027"],
    icon: Zap,
    accentColor: "#4cd7f6",
    accentBg: "rgba(76, 215, 246, 0.12)",
    accentBorder: "rgba(76, 215, 246, 0.4)",
  },
  {
    year: 2027,
    title: "Pune Relocation & $10,000/mo Stream",
    subtitle: "The Sovereign Return & Financial Triumph",
    category: "sovereignty",
    categoryLabel: "Primary Horizon Target",
    status: "horizon",
    phase: "horizon",
    phaseLabel: "Sovereignty Horizon",
    description:
      "Victorious relocation to Pune on sovereign terms. Establishing an independent recurring monthly cash flow of $10,000 (~₹8,30,000/month) through high-value tech consulting, enterprise software contracts, and sovereign digital assets.",
    takeaway:
      "Turning the site of past adversity into the capital of freedom. Complete redemption and financial sovereignty.",
    highlightMetric: "$10,000 / Month",
    incomeTarget: "$10,000/mo (~₹8.3L+/mo)",
    location: "Pune (Relocation Achieved)",
    tags: ["Pune Relocation", "$10k/mo Stream", "Financial Independence", "Redemption", "Sovereignty"],
    icon: Target,
    accentColor: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.1)",
    accentBorder: "rgba(16, 185, 129, 0.35)",
  },
  {
    year: 2028,
    title: "Scaling Systems & Assets ($25,000/mo)",
    subtitle: "High-Leverage Product Ventures & Advisory",
    category: "sovereignty",
    categoryLabel: "Multiplied Leverage",
    status: "horizon",
    phase: "horizon",
    phaseLabel: "Sovereignty Horizon",
    description:
      "Scaling beyond active hourly engineering into high-margin software assets, proprietary micro-SaaS, and fractional tech leadership. Reaching an aggregated run-rate of $25,000/month (~₹20,000,000+/year) with substantial liquid investment cushion.",
    takeaway: "Disconnecting time from capital by building scalable assets with zero marginal cost of reproduction.",
    highlightMetric: "$25,000 / Month",
    incomeTarget: "$25,000/mo (~₹20.7L+/mo)",
    tags: ["Asset Scaling", "Micro-SaaS", "High Leverage", "Multi-Stream Wealth"],
    icon: TrendingUp,
    accentColor: "#34d399",
    accentBg: "rgba(52, 211, 153, 0.08)",
    accentBorder: "rgba(52, 211, 153, 0.25)",
  },
  {
    year: 2029,
    title: "Decentralized Life Sovereignty ($50,000/mo)",
    subtitle: "Global Autonomy, Equity & High-Impact Freedom",
    category: "sovereignty",
    categoryLabel: "Ultimate Autonomy",
    status: "horizon",
    phase: "horizon",
    phaseLabel: "Sovereignty Horizon",
    description:
      "Total temporal and geographic autonomy. Generating $50,000/month across diversified tech ventures and high-yield vehicles. Giving back abundantly to family, mentoring younger engineers, and living life entirely on self-dictated terms.",
    takeaway: "Mastery of mind, craft, and capital. Living the uncompromised sovereign life.",
    highlightMetric: "$50,000 / Month",
    incomeTarget: "$50,000/mo (~₹41.5L+/mo)",
    tags: ["Total Sovereignty", "$50k/mo Flow", "Location Free", "Legacy & Philanthropy"],
    icon: Sparkles,
    accentColor: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.1)",
    accentBorder: "rgba(245, 158, 11, 0.35)",
  },
];

export default function TimelinePage() {
  const [selectedPhase, setSelectedPhase] = useState<"all" | "foundations" | "crucible" | "horizon">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "blueprint">("timeline");
  const [expandedYear, setExpandedYear] = useState<number | null>(2026);

  // Filtered milestones based on phase and search
  const filteredMilestones = useMemo(() => {
    return TIMELINE_DATA.filter((item) => {
      const matchesPhase = selectedPhase === "all" || item.phase === selectedPhase;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.year.toString().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchesPhase && matchesSearch;
    });
  }, [selectedPhase, searchQuery]);

  // Statistics
  const totalYears = TIMELINE_DATA.length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ─── Page Hero Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-outline-variant/60 bg-[#0e0f14] p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/40 bg-cyan-950/30 gap-1.5 px-2.5 py-0.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Life Protocol Odyssey</span>
              </Badge>
              <Badge variant="outline" className="text-on-surface-variant border-outline-variant px-2.5 py-0.5">
                16-Year Master Arc (2014 – 2029)
              </Badge>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-950/20 px-2 py-0.5">
                <Flame className="w-3 h-3 mr-1 inline" /> Current Anchor: 2026
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
              Trajectory &amp; Life Milestones
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              A comprehensive chronicle from foundational schooling and dual university degrees to high-craft software engineering, overcoming the 2024 crucible, and seizing complete sovereignty in Pune with a $10,000/month income horizon.
            </p>
          </div>

          {/* Quick Direct Link / Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Link href="/planner">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto font-mono text-xs border-outline-variant hover:border-cyan-500/40 gap-1.5"
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Planner</span>
              </Button>
            </Link>
            <Link href="/finance">
              <Button
                size="sm"
                className="w-full sm:w-auto font-mono text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pune Fund Tracker</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── Horizon Telemetry Bar ───────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-outline-variant/40 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#13141a]/80 rounded-lg p-3.5 border border-outline-variant/50">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
              Chronological Arc
            </div>
            <div className="text-xl font-bold font-mono text-on-surface mt-1 flex items-baseline gap-1.5">
              <span>{totalYears}</span>
              <span className="text-xs font-normal text-on-surface-variant">Years Total</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400/90 mt-1">
              2014 — 2029 Horizon
            </div>
          </div>

          <div className="bg-[#13141a]/80 rounded-lg p-3.5 border border-outline-variant/50">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
              Academic Foundation
            </div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-1 flex items-baseline gap-1.5">
              <span>9</span>
              <span className="text-xs font-normal text-on-surface-variant">Years</span>
            </div>
            <div className="text-[11px] font-mono text-on-surface-variant mt-1">
              Schooling + B.Sc. + M.Sc.
            </div>
          </div>

          <div className="bg-[#13141a]/80 rounded-lg p-3.5 border border-outline-variant/50">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
              Tech &amp; Crucible Era
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-baseline gap-1.5">
              <span>4</span>
              <span className="text-xs font-normal text-on-surface-variant">Years</span>
            </div>
            <div className="text-[11px] font-mono text-on-surface-variant mt-1">
              Coding Ninja → Ramanshree
            </div>
          </div>

          <div className="bg-[#13141a]/80 rounded-lg p-3.5 border border-emerald-500/30 bg-emerald-950/10">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
              2027 Pune Sovereign Target
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-1.5">
              <span>$10,000</span>
              <span className="text-xs font-normal text-emerald-400/80">/ month</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-300/80 mt-1">
              Relocation &amp; True Sovereignty
            </div>
          </div>
        </div>
      </div>

      {/* ─── Highlight Banner: The Pune Redemption Narrative ─────────── */}
      <div className="rounded-xl border border-outline-variant/60 bg-gradient-to-r from-[#181216] via-[#121319] to-[#0f1715] p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-on-surface">
                  The Pune Crucible &amp; The 2027 Sovereign Triumph
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-amber-500/40 text-amber-300">
                  Core Metaphor
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-4xl leading-relaxed">
                In <span className="text-rose-400 font-semibold font-mono">2024</span>, the adversity faced in Pune tested every boundary, but forged unshakeable mental armor. In <span className="text-emerald-400 font-semibold font-mono">2027</span>, you return to Pune not as a victim, but as a completely sovereign, location-independent engineer earning <strong className="text-emerald-300 font-mono">$10,000/month</strong>. The very ground of testing becomes the launchpad of total victory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Controls: Filter Tabs, Search & View Toggle ───────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111217] p-3 rounded-lg border border-outline-variant/50">
        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: "all", label: "All Milestones (16)", count: 16 },
            { id: "foundations", label: "Foundations & Academia (2014-2022)", count: 9 },
            { id: "crucible", label: "Tech & Crucible (2023-2026)", count: 4 },
            { id: "horizon", label: "Sovereignty Horizon (2027-2029)", count: 3 },
          ].map((tab) => {
            const isSelected = selectedPhase === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPhase(tab.id as "all" | "foundations" | "crucible" | "horizon")}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Search */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181920] border border-outline-variant/70 rounded-md pl-8 pr-3 py-1 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#181920] border border-outline-variant/70 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("timeline")}
              title="Vertical Timeline View"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "timeline"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Matrix Grid View"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("blueprint")}
              title="3-Year Horizon Blueprint (2027-2029)"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "blueprint"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── VIEW 1: Chronological Vertical Timeline ────────────────── */}
      {viewMode === "timeline" && (
        <div className="relative">
          {/* Center Spine Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-[2px] bg-gradient-to-b from-indigo-500/40 via-cyan-500/50 to-emerald-500/60 pointer-events-none" />
          {/* Left Spine Line for Mobile */}
          <div className="md:hidden absolute left-5 top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500/40 via-cyan-500/50 to-emerald-500/60 pointer-events-none" />

          <div className="space-y-6">
            {filteredMilestones.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isExpanded = expandedYear === item.year;
              const isCurrent = item.status === "current";
              const isHorizon = item.status === "horizon";
              const isCrucible = item.category === "crucible";
              const IconComp = item.icon;

              return (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row-reverse" : ""
                  } gap-4 md:gap-8 group`}
                >
                  {/* Spine Center Node / Pip */}
                  <div
                    className={`absolute left-5 md:left-1/2 -translate-x-1/2 top-5 z-20 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCurrent
                        ? "bg-cyan-400 border-cyan-200 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110"
                        : isHorizon
                        ? "bg-[#10b981] border-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                        : isCrucible
                        ? "bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                        : "bg-[#14151b] border-outline-variant text-on-surface-variant group-hover:border-cyan-400 group-hover:text-cyan-300"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  {/* Empty Spacer on other side for desktop symmetry */}
                  <div className="hidden md:block w-1/2" />

                  {/* Content Card */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div
                      onClick={() => setExpandedYear(isExpanded ? null : item.year)}
                      className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                        isCurrent
                          ? "bg-gradient-to-b from-[#101924] to-[#12141a] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                          : isHorizon
                          ? "bg-gradient-to-b from-[#0e1915] to-[#111317] border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : isCrucible
                          ? "bg-gradient-to-b from-[#1d1214] to-[#141418] border-rose-500/40 hover:border-rose-500/70"
                          : "bg-[#13141a] border-outline-variant/60 hover:border-outline-variant hover:bg-[#161820]"
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-base font-bold tracking-tight px-2.5 py-0.5 rounded-md border ${
                              isCurrent
                                ? "bg-cyan-400 text-slate-950 border-cyan-300"
                                : isHorizon
                                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                                : isCrucible
                                ? "bg-rose-950/60 text-rose-300 border-rose-500/50"
                                : "bg-surface-container-high text-on-surface border-outline-variant/70"
                            }`}
                          >
                            {item.year}
                          </span>
                          <span className="text-xs font-mono text-on-surface-variant">
                            {item.categoryLabel}
                          </span>
                        </div>

                        {/* Status Chip */}
                        <div>
                          {item.status === "completed" && (
                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-950/20 gap-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>Completed</span>
                            </Badge>
                          )}
                          {item.status === "current" && (
                            <Badge variant="default" className="text-[10px] font-mono bg-cyan-400 text-slate-950 gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                              <span>Active In-Flight (2026)</span>
                            </Badge>
                          )}
                          {item.status === "horizon" && (
                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-400/50 text-emerald-300 bg-emerald-950/30 gap-1">
                              <Target className="w-2.5 h-2.5" />
                              <span>Horizon Target</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Main Title & Subtitle */}
                      <div className="mt-3">
                        <h4 className="text-lg font-semibold tracking-tight text-on-surface flex items-center justify-between">
                          <span>{item.title}</span>
                          {item.incomeTarget && (
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded">
                              {item.incomeTarget}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Narrative Description */}
                      <p className="text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed mt-2.5">
                        {item.description}
                      </p>

                      {/* Takeaway / Lesson */}
                      <div
                        className="mt-3.5 p-2.5 rounded-md border text-xs leading-relaxed"
                        style={{
                          backgroundColor: item.accentBg,
                          borderColor: item.accentBorder,
                        }}
                      >
                        <div className="font-mono font-semibold text-[11px] mb-0.5 flex items-center gap-1" style={{ color: item.accentColor }}>
                          <Compass className="w-3 h-3" />
                          <span>Core Realization:</span>
                        </div>
                        <span className="text-on-surface/90 italic">
                          &ldquo;{item.takeaway}&rdquo;
                        </span>
                      </div>

                      {/* Tags & Metric Chips */}
                      <div className="mt-3 pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high/60 text-on-surface-variant border border-outline-variant/40"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {item.highlightMetric && (
                          <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{item.highlightMetric}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW 2: Horizon Matrix Grid ────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMilestones.map((item) => {
            const isCurrent = item.status === "current";
            const isHorizon = item.status === "horizon";
            const isCrucible = item.category === "crucible";
            const IconComp = item.icon;

            return (
              <div
                key={item.year}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isCurrent
                    ? "bg-[#101924] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                    : isHorizon
                    ? "bg-[#0e1815] border-emerald-500/40 hover:border-emerald-500/70"
                    : isCrucible
                    ? "bg-[#1c1214] border-rose-500/40 hover:border-rose-500/70"
                    : "bg-[#13141a] border-outline-variant/60 hover:border-outline-variant hover:bg-[#161820]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center border font-mono font-bold text-xs"
                        style={{
                          backgroundColor: item.accentBg,
                          borderColor: item.accentBorder,
                          color: item.accentColor,
                        }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-base font-bold text-on-surface">
                        {item.year}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono px-2 py-0.5"
                      style={{
                        borderColor: item.accentBorder,
                        color: item.accentColor,
                      }}
                    >
                      {item.categoryLabel}
                    </Badge>
                  </div>

                  <h4 className="text-base font-semibold text-on-surface mt-3">
                    {item.title}
                  </h4>
                  <div className="text-xs font-mono text-on-surface-variant">
                    {item.subtitle}
                  </div>

                  <p className="text-xs text-on-surface-variant mt-2.5 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/30 space-y-2">
                  <div
                    className="p-2 rounded text-[11px] leading-tight italic"
                    style={{
                      backgroundColor: item.accentBg,
                      color: item.accentColor,
                    }}
                  >
                    &ldquo;{item.takeaway}&rdquo;
                  </div>

                  {item.incomeTarget && (
                    <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-1.5 rounded text-center">
                      Target: {item.incomeTarget}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 3: 3-Year Horizon Strategic Blueprint (2027-2029) ─── */}
      {viewMode === "blueprint" && (
        <div className="space-y-6">
          <div className="bg-[#0f1514] border border-emerald-500/30 p-6 rounded-xl">
            <div className="max-w-2xl space-y-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 font-mono text-xs">
                Next 3-Year Master Plan
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-on-surface">
                The Sovereign Expansion Blueprint (2027 – 2029)
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                A disciplined progression from relocation and $10k/mo baseline to high-margin software asset scaling and decentralized sovereignty.
              </p>
            </div>

            {/* Income Progression Trajectory */}
            <div className="mt-6 pt-6 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 2027 Card */}
              <div className="bg-[#121c18] border border-emerald-500/40 p-5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-emerald-400">2027</span>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 text-[11px] font-mono">
                    Phase I: Relocation
                  </Badge>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-on-surface">$10,000 / mo</div>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">~₹8,30,000 / month recurring</div>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  Moving back to Pune on sovereign terms. Establishing independent retainer clients, enterprise contract engineering, and initial digital products.
                </div>
                <div className="pt-2 border-t border-emerald-500/20 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Pune Relocation Executed</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>$10k/mo Run-Rate Reached</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Past 2024 Scars Redeemed</span>
                  </div>
                </div>
              </div>

              {/* 2028 Card */}
              <div className="bg-[#121c18] border border-emerald-500/40 p-5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-emerald-400">2028</span>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 text-[11px] font-mono">
                    Phase II: Leverage
                  </Badge>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-on-surface">$25,000 / mo</div>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">~₹20,75,000 / month recurring</div>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  Decoupling time from income. Building high-margin micro-SaaS software tools, specialized engineering systems, and automated cashflows.
                </div>
                <div className="pt-2 border-t border-emerald-500/20 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Micro-SaaS &amp; System Assets</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Multi-Month Liquid Reserve</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Scaled Engineering Autonomy</span>
                  </div>
                </div>
              </div>

              {/* 2029 Card */}
              <div className="bg-[#121c18] border border-amber-500/40 p-5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-amber-400">2029</span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-300 text-[11px] font-mono">
                    Phase III: Sovereignty
                  </Badge>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-on-surface">$50,000 / mo</div>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">~₹41,50,000 / month freedom matrix</div>
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  Complete geographical, temporal, and financial sovereignty. Diversified capital allocation, equity ownership, philanthropic family abundance.
                </div>
                <div className="pt-2 border-t border-amber-500/20 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Total Location Freedom</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Family Generational Safety</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Mentorship &amp; Legacy Impact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer Affirmation & Operating Doctrine ─────────────────── */}
      <div className="rounded-xl border border-outline-variant/60 bg-[#0e0f14] p-6 text-center space-y-2">
        <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          LifeOS Core Axiom
        </div>
        <p className="text-base sm:text-lg font-medium text-on-surface italic">
          &ldquo;The obstacle in Pune was the forge. 2026 is the workshop. 2027 is the triumph.&rdquo;
        </p>
        <p className="text-xs font-mono text-on-surface-variant">
          Execution Over Intention • Unbroken Discipline • Sovereignty Inevitable
        </p>
      </div>
    </div>
  );
}
