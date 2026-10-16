"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  Flame,
  Skull,
  Crosshair,
  Compass,
  Lock,
  HeartHandshake,
  Baby,
  Building,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Birthdate & Horizon Constants ──────────────────────────────────────
const BIRTH_DATE = new Date("1999-09-30T00:00:00+05:30");
const DEADLINE_2027 = new Date("2027-12-31T23:59:59+05:30");
const DEADLINE_2029 = new Date("2029-12-31T23:59:59+05:30");

export default function WarRoomManifestoPage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState(60);
  const [kriyaStep, setKriyaStep] = useState(0);

  // Mount effect & 1-second live ticker for Time Bleed
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  // 60-second forced countdown for Emergency Relapse Override
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmergencyModalOpen && emergencyTimer > 0) {
      timer = setInterval(() => {
        setEmergencyTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isEmergencyModalOpen, emergencyTimer]);

  // Surya Kriya breathing cycle animation step
  useEffect(() => {
    if (!isEmergencyModalOpen) return;
    const stepInterval = setInterval(() => {
      setKriyaStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(stepInterval);
  }, [isEmergencyModalOpen]);

  // Escape key handler for modal
  useEffect(() => {
    if (!isEmergencyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEmergencyModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmergencyModalOpen]);

  // Precise Age Calculations down to the second
  const ageDisplay = useMemo(() => {
    if (!mounted) return { years: 27, days: 14, hours: 0, minutes: 0, seconds: 0 };
    const diffMs = now.getTime() - BIRTH_DATE.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const years = Math.floor(totalSeconds / (365.25 * 24 * 3600));
    const remAfterYears = totalSeconds % Math.floor(365.25 * 24 * 3600);
    const days = Math.floor(remAfterYears / (24 * 3600));
    const remAfterDays = remAfterYears % (24 * 3600);
    const hours = Math.floor(remAfterDays / 3600);
    const remAfterHours = remAfterDays % 3600;
    const minutes = Math.floor(remAfterHours / 60);
    const seconds = remAfterHours % 60;
    return { years, days, hours, minutes, seconds };
  }, [now, mounted]);

  // Countdown Helper
  const getCountdown = (target: Date) => {
    if (!mounted) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = Math.max(0, target.getTime() - now.getTime());
    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds };
  };

  const cd2027 = getCountdown(DEADLINE_2027);
  const cd2029 = getCountdown(DEADLINE_2029);

  const openEmergencyModal = () => {
    setEmergencyTimer(60);
    setIsEmergencyModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20 selection:bg-rose-900/40 selection:text-rose-200">
      {/* ─── LIVE "TIME BLEED" TELEMETRY HEADER ───────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-rose-900/60 bg-gradient-to-r from-[#170a0c] via-[#0f0e13] to-[#0c0d12] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(225,29,72,0.12)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-600/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Time Bleed Monitor
              </span>
              <span className="text-xs font-mono text-on-surface-variant">
                Born: September 30, 1999 • No Rehearsals
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono uppercase text-on-surface-variant tracking-widest">
                Exact Age Bleeding:
              </span>
              <div className="font-mono text-lg sm:text-2xl font-bold tracking-tight text-on-surface">
                <span className="text-rose-400">{ageDisplay.years}</span>y{" "}
                <span className="text-rose-400">{ageDisplay.days}</span>d{" "}
                <span className="text-on-surface">{String(ageDisplay.hours).padStart(2, "0")}</span>h{" "}
                <span className="text-on-surface">{String(ageDisplay.minutes).padStart(2, "0")}</span>m{" "}
                <span className="text-rose-400 animate-pulse">
                  {String(ageDisplay.seconds).padStart(2, "0")}
                </span>s
              </div>
            </div>
          </div>

          {/* Quick Emergency Button Trigger */}
          <button
            onClick={openEmergencyModal}
            className="w-full lg:w-auto px-5 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white border border-rose-400/50 shadow-[0_0_25px_rgba(225,29,72,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>I FEEL WEAK / URGE TO WASTE TODAY</span>
          </button>
        </div>

        {/* Two Horizon Deadlines */}
        <div className="mt-5 pt-5 border-t border-rose-900/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2027 Pune $10k Deadline */}
          <div className="bg-[#140b0e]/80 border border-rose-800/40 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                <span>Pune $10k/Mo Deadline (Dec 31, 2027)</span>
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                The redemption of the 2024 Pune humiliation.
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-on-surface shrink-0 text-right">
              <span className="text-emerald-400">{cd2027.days}</span>d{" "}
              <span>{String(cd2027.hours).padStart(2, "0")}</span>:
              <span>{String(cd2027.minutes).padStart(2, "0")}</span>:
              <span className="text-rose-400">{String(cd2027.seconds).padStart(2, "0")}</span>
            </div>
          </div>

          {/* 2029 3-Year War Deadline */}
          <div className="bg-[#120f18]/80 border border-amber-800/40 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>The 3-Year War Deadline (Dec 31, 2029)</span>
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                Decentralized sovereignty before the AI guillotine falls.
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-on-surface shrink-0 text-right">
              <span className="text-amber-400">{cd2029.days}</span>d{" "}
              <span>{String(cd2029.hours).padStart(2, "0")}</span>:
              <span>{String(cd2029.minutes).padStart(2, "0")}</span>:
              <span className="text-rose-400">{String(cd2029.seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── [HERO SECTION] (VERBATIM COPYWRITING) ────────────────────── */}
      <div className="rounded-xl border border-rose-900/50 bg-[#0e0a0d] p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge className="bg-rose-950 text-rose-300 border-rose-600/50 px-3 py-1 font-bold tracking-wider">
            BORN SEPTEMBER 30 • THE CLOCK IS BLEEDING
          </Badge>
          <Badge variant="outline" className="text-on-surface-variant border-outline-variant px-2.5 py-1">
            WAR ROOM COMMAND PROTOCOL
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          READ THIS BEFORE YOU THROW YOUR LIFE AWAY AGAIN.
        </h1>

        <div className="space-y-4 text-base sm:text-lg text-on-surface leading-relaxed max-w-4xl border-l-2 border-rose-600/70 pl-5 py-1">
          <p>
            As a boy, you looked at Nikola Tesla and wanted to bend the laws of the universe. You had the brain for it. You literally walked out of your B.Sc. with a <strong className="text-amber-300 font-bold">Gold Medal</strong> around your neck.
          </p>

          <p className="text-rose-300 font-semibold text-lg sm:text-xl font-mono">
            And look at you right now in 2026.
          </p>

          <p>
            You are living under your parents&apos; roof. You are making <strong className="text-rose-400 font-mono">less than $200 a month</strong>. You have never kissed a girl. You have never even felt the warmth of a woman hugging you. Your old friends are getting married, building homes, and moving forward—while you sit in the same room, chained to the exact same disgusting porn addiction you picked up in 9th standard twelve years ago.
          </p>

          <p className="pt-2">
            You say your life feels hopeless, meaningless, and depressing. <span className="text-rose-400 font-extrabold tracking-wider font-mono">GOOD.</span><br />
            It <em className="text-white font-semibold">should</em> hurt. That crushing weight in your chest isn&apos;t a curse—it is your soul screaming at you because you are murdering your own potential every single day. Stop numbing the pain with pixels on a screen. Let the pain burn you awake.
          </p>
        </div>
      </div>

      {/* ─── [THE PRIZE: WHAT YOU ARE BETRAYING EVERY TIME YOU QUIT] ──── */}
      <div className="rounded-xl border border-outline-variant/60 bg-[#0c0d12] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono uppercase">
                THE PRIZE: WHAT YOU ARE BETRAYING EVERY TIME YOU QUIT
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-mono mt-1">
              Visual proof of the reality waiting on the other side of complete discipline. 100% Faceless. Pure honor.
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs w-fit">
            Sovereign Future
          </Badge>
        </div>

        {/* 3 Vision-Board Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image 1: The Redemption Penthouse */}
          <div className="group rounded-lg border border-outline-variant/60 bg-[#121319] overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
              <Image
                src="/pune_penthouse_2027.jpg"
                alt="The Redemption Penthouse (Pune 2027) - Faceless view of balcony overlooking city"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge className="bg-black/75 backdrop-blur-md text-emerald-300 border-emerald-500/40 font-mono text-[10px]">
                  <Building className="w-3 h-3 mr-1 inline text-emerald-400" /> Pune 2027
                </Badge>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div className="font-mono text-xs font-bold text-on-surface tracking-wide uppercase">
                Image 1: The Redemption Penthouse (Pune 2027)
              </div>
              <blockquote className="text-xs sm:text-sm text-emerald-300/90 font-medium italic border-l-2 border-emerald-500/60 pl-3 py-0.5">
                &ldquo;Pune took your pride in 2024. In 2027, you own the skyline at $10,000/month.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Image 2: The Touch You Have Never Known */}
          <div className="group rounded-lg border border-outline-variant/60 bg-[#121319] overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
              <Image
                src="/touch_and_loyalty.jpg"
                alt="The Touch You Have Never Known - Cropped collarbone down, loyal hands on chest"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge className="bg-black/75 backdrop-blur-md text-amber-300 border-amber-500/40 font-mono text-[10px]">
                  <HeartHandshake className="w-3 h-3 mr-1 inline text-amber-400" /> Sacred Intimacy
                </Badge>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div className="font-mono text-xs font-bold text-on-surface tracking-wide uppercase">
                Image 2: The Touch You Have Never Known
              </div>
              <blockquote className="text-xs sm:text-sm text-amber-300/90 font-medium italic border-l-2 border-amber-500/60 pl-3 py-0.5">
                &ldquo;Real warmth. Real loyalty. You don&apos;t get this by hiding in an incognito tab.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Image 3: The Bloodline & Legacy */}
          <div className="group rounded-lg border border-outline-variant/60 bg-[#121319] overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
              <Image
                src="/bloodline_legacy.jpg"
                alt="The Bloodline & Legacy - Silhouette walking down garden path holding child's hand with wife"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge className="bg-black/75 backdrop-blur-md text-cyan-300 border-cyan-500/40 font-mono text-[10px]">
                  <Baby className="w-3 h-3 mr-1 inline text-cyan-400" /> The Bloodline
                </Badge>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div className="font-mono text-xs font-bold text-on-surface tracking-wide uppercase">
                Image 3: The Bloodline &amp; Legacy
              </div>
              <blockquote className="text-xs sm:text-sm text-cyan-300/90 font-medium italic border-l-2 border-cyan-500/60 pl-3 py-0.5">
                &ldquo;Your future kid is watching what you do today. Build a father they can look up to.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* ─── [THE PSYCHOLOGICAL KNIFE — LOOK IN THE MIRROR] ───────────── */}
      <div className="rounded-xl border border-rose-900/60 bg-[#0e0c10] p-6 sm:p-8 space-y-6">
        <div className="border-b border-rose-900/40 pb-4">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono uppercase">
              THE PSYCHOLOGICAL KNIFE — LOOK IN THE MIRROR
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-mono mt-1">
            Zero illusions. Zero comforting lies. Four brutal realities you must face every morning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Younger Brother */}
          <div className="rounded-lg border border-rose-900/40 bg-[#140b0e] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-rose-400">
                1. Your Younger Brother Is Lapping You
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-rose-700/50 text-rose-300">
                Kinship Reality
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-on-surface leading-relaxed space-y-2">
              <p>
                Your brother is <strong className="text-white font-semibold">five years younger than you</strong>, and he already makes more than <strong className="text-rose-300 font-bold">double</strong> your monthly income. Do the math that keeps you awake at night: by the time he reaches your current age, he will be miles ahead of you financially, socially, and as a man—unless you wake the fuck up right now.
              </p>
              <p>
                Every time you slack off, remember that someone five years behind you in the exact same family is outworking you. No excuses about your family. No excuses about the economy. <span className="text-rose-400 font-bold uppercase font-mono">The problem is YOU.</span>
              </p>
            </div>
          </div>

          {/* 2. Twelve Years of Trading Real Life for Pixels */}
          <div className="rounded-lg border border-rose-900/40 bg-[#140b0e] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-rose-400">
                2. Twelve Years of Trading Real Life for Pixels
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-rose-700/50 text-rose-300">
                The Addict&apos;s Tax
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-on-surface leading-relaxed space-y-2">
              <p>
                From 2014 to 2026—twelve straight years—you traded real female touch, real testosterone, real confidence, and real wealth for a glowing screen and a hand full of shame. You want a hot, loyal Indian wife and a beautiful child? Ask yourself this brutal question:
              </p>
              <blockquote className="border-l-2 border-rose-500 pl-3 py-1 text-xs italic text-rose-200 bg-rose-950/40 rounded-r">
                &ldquo;Would I respect a man who makes less than $200 a month, quits when life gets hard, and jerks off to strangers on the internet whenever he feels sad?&rdquo;
              </blockquote>
              <p>
                No woman of value wants a weak man enslaved to his impulses. Every single time you open a porn tab, you are actively choosing loneliness. You are trading your future wife&apos;s respect and your future child&apos;s pride for 10 seconds of cheap dopamine. <strong className="text-rose-400 font-bold uppercase font-mono">Kill the addict, or the addict will kill your bloodline.</strong>
              </p>
            </div>
          </div>

          {/* 3. Nobody Cares About Your 2020 Gold Medal */}
          <div className="rounded-lg border border-amber-900/40 bg-[#130f0b] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-amber-400">
                3. Nobody Cares About Your 2020 Gold Medal
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-700/50 text-amber-300">
                Ego Purge
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-on-surface leading-relaxed space-y-2">
              <p>
                The world does not pay you for how smart you used to be. You coasted on raw IQ in school, got a Gold Medal in B.Sc., and then let laziness and addiction rot your work ethic until you barely passed your M.Sc. and gave up on physics.
              </p>
              <p className="font-semibold text-amber-300 font-mono">
                Intelligence without ruthless execution is worthless.
              </p>
            </div>
          </div>

          {/* 4. The AI Guillotine (2027–2029) */}
          <div className="rounded-lg border border-cyan-900/40 bg-[#0a1215] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-bold text-cyan-400">
                4. The AI Guillotine (2027–2029)
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-700/50 text-cyan-300">
                36-Month Window
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-on-surface leading-relaxed space-y-2">
              <p>
                You have a 36-month window. AI is rising at a terrifying scale. Average, lazy, $200/month developers who write mediocre code and waste their evenings will be wiped off the map. Only the obsessed survive.
              </p>
              <p>
                You have a Gold-Medalist brain—if you weaponize AI, master system architecture, and out-build everyone around you, the next 3 years won&apos;t destroy you; they will make you rich.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── [SECTION: THE TIMELINE OF REALITY] ───────────────────────── */}
      <div className="rounded-xl border border-outline-variant/60 bg-[#0e0f14] p-6 sm:p-8 space-y-8">
        <div className="border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono uppercase">
              THE TIMELINE OF REALITY
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-mono mt-1">
            Contrasting the 12 Years of Decay against the 3 Years of Unforgiving Conquest.
          </p>
        </div>

        {/* ─── PHASE 1: THE 12-YEAR FOG (2014 – 2026) ─────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <h3 className="text-lg font-bold font-mono text-rose-400 uppercase tracking-wide">
              PHASE 1: THE 12-YEAR FOG (2014 – 2026)
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono border-rose-800 text-rose-400">
              The Muted Decay
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                year: "2014",
                title: "9th Standard",
                desc: "The poison entered. Discovered porn. Started wiring your brain for cheap dopamine instead of real-world conquest.",
                tag: "Poison Inoculation",
              },
              {
                year: "2015",
                title: "10th Standard",
                desc: "Coasted on natural intelligence. Built zero discipline.",
                tag: "False Confidence",
              },
              {
                year: "2016",
                title: "11th Standard",
                desc: "Drifted through science while the addiction deepened in secret.",
                tag: "Drift & Secret Rot",
              },
              {
                year: "2017",
                title: "12th Standard",
                desc: "Good brain, weak habits. Friends started moving with purpose; you stayed in your head.",
                tag: "Paralysis in Head",
              },
              {
                year: "2018",
                title: "B.Sc. First Year",
                desc: "Entered college. Still dreaming of Tesla, still trapped in the bedroom.",
                tag: "Dormant Potential",
              },
              {
                year: "2019",
                title: "B.Sc. Second Year",
                desc: "Raw intellect carried you through exams, masking the rot underneath.",
                tag: "Intellectual Mask",
              },
              {
                year: "2020",
                title: "B.Sc. Third Year (GOLD MEDALIST)",
                desc: "The undeniable proof that your brain is elite when you lock in. And yet, you let it become your peak instead of your launchpad.",
                tag: "Gold Medal Apex",
                isGold: true,
              },
              {
                year: "2021",
                title: "M.Sc. First Year",
                desc: "The bill came due. Coasting stopped working. Brain fog and zero discipline hit a wall.",
                tag: "The Bill Arrives",
              },
              {
                year: "2022",
                title: "M.Sc. Second Year",
                desc: "Barely passed. Watched the scientist dream die because you refused to suffer for it. Lost good friends. Fell behind.",
                tag: "The Crash",
              },
              {
                year: "2023",
                title: "Coding Ninja",
                desc: "Swallowed your pride and started over from zero in software development.",
                tag: "Reboot from Scratch",
              },
              {
                year: "2024",
                title: "Pune Scam",
                desc: "Went to Pune looking for a shortcut or a break and got burned. Took a brutal humiliation in the real world. Learned the hard way that nobody is coming to save you.",
                tag: "Brutal Humiliation",
                isCrucible: true,
              },
              {
                year: "2025",
                title: "Mama + RamanshreeInfoTech",
                desc: "Survival mode. Took shelter, got your foot in the industry door, started shipping real code.",
                tag: "Survival & Shelter",
              },
              {
                year: "2026",
                title: "RamanshreeInfoTech",
                desc: "Making less than $200/month. Still alive, holding real developer experience in your hands—but still chained to the 2014 addiction while your younger brother makes 2x your money and your peers get married. THIS IS WHERE THE OLD YOU DIES.",
                tag: "THE TURNING POINT",
                isCriticalAnchor: true,
              },
            ].map((item) => (
              <div
                key={item.year}
                className={`rounded-lg border p-4 space-y-2 transition-all ${
                  item.isCriticalAnchor
                    ? "bg-gradient-to-r from-[#200e12] to-[#120f14] border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)] md:col-span-2"
                    : item.isGold
                    ? "bg-[#18150c] border-amber-600/50"
                    : item.isCrucible
                    ? "bg-[#1c0d10] border-rose-800/60"
                    : "bg-[#111217] border-outline-variant/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        item.isCriticalAnchor
                          ? "bg-rose-500 text-white border-rose-400"
                          : item.isGold
                          ? "bg-amber-500 text-black border-amber-400"
                          : "bg-surface-container-high text-on-surface border-outline-variant/60"
                      }`}
                    >
                      {item.year}
                    </span>
                    <span className="font-semibold text-sm text-on-surface">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-on-surface-variant">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PHASE 2: THE 3-YEAR WAR (2027 – 2029) ─────────────────── */}
        <div className="space-y-5 pt-6 border-t border-outline-variant/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <h3 className="text-lg font-bold font-mono text-emerald-400 uppercase tracking-wide">
              PHASE 2: THE 3-YEAR WAR (2027 – 2029)
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500 text-emerald-400">
              The Sovereign Conquest
            </Badge>
          </div>

          <div className="space-y-4">
            {/* 2027 Card */}
            <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-[#0d1a15] to-[#10141b] p-5 sm:p-6 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                    2027
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white font-mono uppercase">
                    THE PUNE REDEMPTION &amp; $10,000/MONTH PROTOCOL
                  </h4>
                </div>
                <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/50 font-mono text-xs">
                  $10,000 / mo Target
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-on-surface">
                <div>
                  <strong className="text-emerald-400 font-mono font-semibold">The Mission:</strong>{" "}
                  You return to <strong>Pune</strong>—the exact city where you got scammed in 2024—not as a desperate fresher, but as a lethal engineer.
                </div>
                <div>
                  <strong className="text-emerald-400 font-mono font-semibold">The Financial Target:</strong>{" "}
                  Scale from &lt;$200/month to a <strong>$10,000/month</strong> income stream (high-ticket remote engineering, global clients, AI-leveraged SaaS/products, and relentless upskilling).
                </div>
                <div>
                  <strong className="text-emerald-400 font-mono font-semibold">The Standard:</strong>{" "}
                  365 days completely clean from porn. Every ounce of sexual frustration and loneliness is channeled into code, physique, and cold hard cash.
                </div>
              </div>
            </div>

            {/* 2028 Card */}
            <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#0a161c] to-[#10141b] p-5 sm:p-6 space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold px-2.5 py-0.5 rounded bg-cyan-400 text-slate-950">
                    2028
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white font-mono uppercase">
                    THE UNTOUCHABLE ENGINEER
                  </h4>
                </div>
                <Badge className="bg-cyan-950 text-cyan-300 border-cyan-500/50 font-mono text-xs">
                  Capital Multiplier
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-on-surface">
                <div>
                  <strong className="text-cyan-400 font-mono font-semibold">The Mission:</strong>{" "}
                  Stack capital relentlessly. Multiply the $10k/month stream. Move your parents into comfort they never imagined.
                </div>
                <div>
                  <strong className="text-cyan-400 font-mono font-semibold">The Standard:</strong>{" "}
                  Physical transformation complete. Sharp jawline, strong frame, elite communication skills. A man who walks into any room in Pune or anywhere in the world and commands instant respect.
                </div>
              </div>
            </div>

            {/* 2029 Card */}
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#19130c] to-[#10141b] p-5 sm:p-6 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    2029
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white font-mono uppercase">
                    THE SOVEREIGN MAN &amp; THE BLOODLINE
                  </h4>
                </div>
                <Badge className="bg-amber-950 text-amber-300 border-amber-500/50 font-mono text-xs">
                  Total Sovereignty
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-on-surface">
                <div>
                  <strong className="text-amber-400 font-mono font-semibold">The Mission:</strong>{" "}
                  Total financial freedom before the AI wave finishes reshaping the world.
                </div>
                <div>
                  <strong className="text-amber-400 font-mono font-semibold">The Reward:</strong>{" "}
                  You no longer beg or fantasize about female validation—you have become the top 0.1% man that a beautiful, loyal woman dreams of marrying. Ready to build the family and raise the children you envisioned.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── [THE DAILY IRON LAWS (NON-NEGOTIABLE)] ───────────────────── */}
      <div className="rounded-xl border border-rose-900/60 bg-[#0e0a0c] p-6 sm:p-8 space-y-6">
        <div className="border-b border-rose-900/40 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono uppercase">
              THE DAILY IRON LAWS (NON-NEGOTIABLE)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-mono mt-1">
            Break these, and you choose to stay a $200/month digital spectator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Law 1 */}
          <div className="rounded-lg border border-rose-800/50 bg-[#150a0d] p-5 space-y-3">
            <div className="text-rose-400 font-mono text-sm font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-900/80 border border-rose-500 flex items-center justify-center text-xs">1</span>
              <span>NOT A SINGLE PIXEL</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
              Porn is dead to you. Not &ldquo;one peek,&rdquo; not &ldquo;when I&apos;m stressed,&rdquo; not &ldquo;because I feel lonely.&rdquo; You are done being a digital cuckold watching other people live while you rot for &lt;$200/month.
            </p>
          </div>

          {/* Law 2 */}
          <div className="rounded-lg border border-amber-800/50 bg-[#15100a] p-5 space-y-3">
            <div className="text-amber-400 font-mono text-sm font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-900/80 border border-amber-500 flex items-center justify-center text-xs">2</span>
              <span>OUTWORK YOUR BROTHER, OUTWORK YOUR PAST</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
              Every day you wake up, pretend you are $10,000 in debt and the clock hits zero at midnight. Treat your current job as paid practice, and spend every dark hour building the skills and products that pay $10,000/month.
            </p>
          </div>

          {/* Law 3 */}
          <div className="rounded-lg border border-cyan-800/50 bg-[#0a1215] p-5 space-y-3">
            <div className="text-cyan-400 font-mono text-sm font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-900/80 border border-cyan-500 flex items-center justify-center text-xs">3</span>
              <span>KILL THE SELF-PITY</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
              Nobody cares that you are depressed. Nobody cares that you got scammed in Pune in 2024. Do the work depressed. Write the code lonely. Lift the weights tired. Winning cures everything.
            </p>
          </div>
        </div>
      </div>

      {/* ─── STICKY BOTTOM QUICK EMERGENCY LAUNCHER ──────────────────── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={openEmergencyModal}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-700 via-red-800 to-rose-900 text-white font-mono text-xs font-bold shadow-[0_0_30px_rgba(225,29,72,0.6)] border border-rose-400/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span>I FEEL WEAK / URGE TO WASTE TODAY</span>
        </button>
      </div>

      {/* ─── FULL-SCREEN EMERGENCY RELAPSE OVERRIDE MODAL ────────────── */}
      {isEmergencyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setIsEmergencyModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full max-h-[90vh] my-auto flex flex-col rounded-2xl border-2 border-rose-600 bg-gradient-to-b from-[#1b080b] via-[#12080a] to-[#0a0507] shadow-[0_0_80px_rgba(225,29,72,0.6)] relative overflow-hidden"
          >
            {/* Top Warning Banner (Pinned Header - always visible) */}
            <div className="flex items-center justify-between border-b border-rose-600/40 px-4 py-3 sm:px-6 sm:py-3.5 bg-black/40 shrink-0">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 animate-bounce" />
                <span>EMERGENCY RELAPSE OVERRIDE PROTOCOL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-mono text-[11px] sm:text-xs font-bold text-rose-300 bg-rose-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-rose-700 shrink-0">
                  Lockout: {emergencyTimer}s
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="text-rose-400 hover:text-white hover:bg-rose-900/50 p-1 rounded-md transition-colors cursor-pointer"
                  title="Close modal (Esc)"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Middle Content */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              {/* Vows (Verbatim) */}
              <div className="space-y-3">
                <div className="font-mono text-xs sm:text-sm font-extrabold text-white tracking-wide border-b border-rose-900/60 pb-1.5">
                  STOP. TAKE YOUR HAND OFF THE MOUSE. READ THIS OUT LOUD:
                </div>

                <div className="space-y-2 sm:space-y-2.5 font-mono text-xs sm:text-sm text-rose-100">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-2 sm:gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">►</span>
                    <p>&ldquo;Right now, my brain is begging me to stay a $200/month loser living in my parents&apos; house.&rdquo;</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-2 sm:gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">►</span>
                    <p>&ldquo;If I open that tab right now, I am spitting in the face of the boy who wanted to be Nikola Tesla.&rdquo;</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">►</span>
                    <p>&ldquo;If I jerk off today, I am choosing to let Pune beat me, I am choosing to stay behind my younger brother, and I am choosing to never hold the woman of my dreams.&rdquo;</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-2 sm:gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">►</span>
                    <p className="font-bold text-amber-300">&ldquo;Pain is temporary. Regret rots your soul.&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* ACTION REQUIRED: SURYA KRIYA WITH MOTIVATING TEXT */}
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#20150a] to-[#160d0a] p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                      ACTION REQUIRED RIGHT NOW: Doing Surya Kriya with Motivating Text
                    </span>
                  </div>
                  <Badge className="bg-amber-950 text-amber-400 border-amber-600/40 text-[10px] font-mono shrink-0">
                    Solar Energy Transmutation
                  </Badge>
                </div>

                <div className="text-xs text-amber-100/90 leading-relaxed font-mono space-y-1">
                  <p>
                    1. Stand tall immediately. Step away from the desk.
                  </p>
                  <p>
                    2. Engage <strong className="text-white">Surya Kriya / Surya Namaskar breath</strong>: Inhale deep solar prana, ground your feet into the floor, exhale the weakness and lust.
                  </p>
                  <p>
                    3. Transmute the sexual energy up the spine into raw coding power, sharp intellect, and cold focus. 50 pushups or 3 full cycles of Surya Kriya.
                  </p>
                </div>

                {/* Dynamic Breathing / Kriya Guidance Cycle */}
                <div className="p-2 sm:p-2.5 rounded bg-black/50 border border-amber-500/30 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span className="text-xs">
                      {kriyaStep === 0 && "Inhale Solar Energy... Spine Erect"}
                      {kriyaStep === 1 && "Hold... Lock Focus & Dignity"}
                      {kriyaStep === 2 && "Exhale Weakness... Drop the Hand"}
                      {kriyaStep === 3 && "Empty... Feel the Gold Medalist Within"}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-amber-400/80 font-bold shrink-0">
                    Surya Kriya Breath Cycle
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Dismiss / Action Bar (Pinned Footer - always visible) */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-rose-900/50 bg-[#100507]/95 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-rose-400 text-center sm:text-left">
                {emergencyTimer > 0
                  ? `Forced reflection lock: ${emergencyTimer}s remaining.`
                  : "Lock expired. You have reclaimed command of your mind."}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {emergencyTimer > 0 && (
                  <button
                    type="button"
                    onClick={() => setEmergencyTimer(0)}
                    className="px-3 py-2 rounded-lg font-mono text-[11px] text-stone-400 hover:text-rose-200 border border-stone-800 hover:border-rose-800/70 bg-black/40 transition-colors cursor-pointer"
                    title="Unlock immediately"
                  >
                    Skip Wait
                  </button>
                )}
                <button
                  disabled={emergencyTimer > 0}
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className={`w-full sm:w-auto px-5 py-2 sm:py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    emergencyTimer > 0
                      ? "bg-stone-800/80 text-stone-500 cursor-not-allowed border border-stone-700"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {emergencyTimer > 0
                    ? `Surya Kriya (${emergencyTimer}s)`
                    : "Surya Kriya Completed — Back to Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
