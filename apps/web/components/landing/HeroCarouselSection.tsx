"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface HeroCarouselSectionProps {
  onWatchDemoClick: () => void;
}

interface SlideData {
  id: number;
  tabTitle: string;
  badge: string;
  inputHeader: string;
  inputTitle: string;
  inputPassageParts: Array<{ text: string; highlight?: boolean }>;
  inputSource: string;
  outputStatus: string;
  outputGrantNumber: string;
  outputTitle: string;
  outputDesc: string;
  steps: [string, string, string];
  audioLabel: string;
}

const POLICY_SLIDES: SlideData[] = [
  {
    id: 0,
    tabTitle: "01 Legal Decoder",
    badge: "Ministry of MSME · Section 9",
    inputHeader: "PM MUDRA & VISHWAKARMA CREDIT FRAMEWORK",
    inputTitle: "Dept of Financial Services · Gazette Notification 44/2026",
    inputPassageParts: [
      { text: "“Under Section 9 of the MSMED Act, " },
      { text: "registered handicraft artisans", highlight: true },
      { text: " with family income " },
      { text: "≤ ₹3,00,000 p.a.", highlight: true },
      { text: " are granted " },
      { text: "sovereign credit guarantee up to ₹10,00,000", highlight: true },
      { text: " with " },
      { text: "nil margin money & 5% interest cap", highlight: true },
      { text: ".”" },
    ],
    inputSource: "Official Gazette · msme.gov.in",
    outputStatus: "Approved · Zero Collateral",
    outputGrantNumber: "₹10,00,000",
    outputTitle: "MSME Working Capital Grant",
    outputDesc:
      "Zero-collateral working capital credit for traditional artisans backed by Credit Guarantee Fund for Micro Units (CGFMU) with 5% capped interest.",
    steps: ["Udyam Assist", "Bank Matching", "Direct Disbursal"],
    audioLabel: "Listen Hindi Audio (0:42)",
  },
  {
    id: 1,
    tabTitle: "02 Civic Grievance",
    badge: "Municipal PWD · Ward 7",
    inputHeader: "INCIDENT TELEMETRY & DAMAGE ASSESSMENT",
    inputTitle: "Asphalt Spalling & Transverse Fracture · Ring Road Sector 8",
    inputPassageParts: [
      { text: "“Computer Vision tag: " },
      { text: "Asphalt fracture depth ~9.5cm", highlight: true },
      { text: ", 2.4m length. Severity: " },
      { text: "8.9 / 10.0", highlight: true },
      { text: ". GPS: " },
      { text: "28.6139° N, 77.2090° E", highlight: true },
      { text: ". Immediate traffic hazard flagged.”" },
    ],
    inputSource: "Municipal GIS Tag · PWD Central",
    outputStatus: "Triaged · SLA Active",
    outputGrantNumber: "72 Hours",
    outputTitle: "Contractor Auto-Dispatched",
    outputDesc:
      "Assigned to Er. R. K. Sharma (Executive Engineer). Statutory 72h SLA countdown active; auto-escalates to District Ombudsman on breach.",
    steps: ["GPS Triaged", "Bitumen Crew Dispatched", "Proof-of-Work Diff"],
    audioLabel: "Listen Dispatch Audio (0:34)",
  },
  {
    id: 2,
    tabTitle: "03 Deepfake Audit",
    badge: "PIB Fact Check Unit",
    inputHeader: "BROADCAST CLONE AUDIO ANALYSIS",
    inputTitle: "Purported Announcement on Agricultural Ration Quota",
    inputPassageParts: [
      { text: "“Audio clip circulating across WhatsApp broadcast clusters purporting " },
      { text: "withdrawal of NFSA foodgrain subsidy", highlight: true },
      { text: ". Vocoder phase anomaly at " },
      { text: "8.2kHz harmonic band", highlight: true },
      { text: ".”" },
    ],
    inputSource: "PIB Fact Check Advisory #FC-2026-401",
    outputStatus: "Debunked · Synthetic",
    outputGrantNumber: "98.4%",
    outputTitle: "Synthetic Neural Voice Clone",
    outputDesc:
      "Acoustic spectral consistency degraded (18.7%). National Food Security Act Gazette S.O. 4410 confirms 100% subsidized foodgrain entitlements remain active.",
    steps: ["Spectral Scan", "Official Gazette Diff", "Advisory Published"],
    audioLabel: "Listen Anomaly Report (0:38)",
  },
];

export default function HeroCarouselSection({
  onWatchDemoClick,
}: HeroCarouselSectionProps) {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Strict 3-second cycle
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % POLICY_SLIDES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, activeSlide]);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % POLICY_SLIDES.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? POLICY_SLIDES.length - 1 : prev - 1));
  };

  const currentSlide = POLICY_SLIDES[activeSlide];

  return (
    <section
      id="hero"
      className="h-screen max-h-screen w-full snap-start snap-always relative overflow-hidden flex flex-col justify-between px-6 md:px-14 py-6 md:py-7 select-none"
    >
      {/* TOP: Hero Header (~32% of Viewport) */}
      <div className="pt-14 sm:pt-12 flex flex-col items-center text-center justify-center max-h-[34%] z-10">
        
        {/* Status Tag */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 mb-2"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Grounded Public Intelligence · Official Gazette Feeds</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-[-0.035em] text-slate-900 dark:text-zinc-50 leading-[1.05] max-w-4xl"
        >
          Democratizing Public Policy.{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
            Decrypting Citizen Rights.
          </span>
        </motion.h1>

        {/* Subtitle - Unclipped and clearly visible */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed"
        >
          Turn dense gazettes, municipal grievances, and complex administrative bureaucracy into verified, plain-language citizen action.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 flex items-center justify-center gap-3"
        >
          <Link
            href="/portal"
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>Explore Verified Schemes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={onWatchDemoClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>Try Live Sandpit</span>
          </button>
        </motion.div>
      </div>

      {/* BOTTOM: Paced Transformation Deck (~64% of Viewport) */}
      <div
        className="w-full max-w-5xl mx-auto flex flex-col justify-between h-[64%] max-h-[440px] relative z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Outer Frame (Clean, Single Border Container) */}
        <div className="w-full h-full bg-white/75 dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          
          {/* Top Tab Indicators with Smooth Filling Line */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 sm:gap-4">
              {POLICY_SLIDES.map((slide, idx) => {
                const isActive = activeSlide === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`relative pb-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
                    }`}
                  >
                    <span>{slide.tabTitle}</span>

                    {isActive && (
                      <motion.div
                        key={`prog-${activeSlide}-${isPaused}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isPaused ? undefined : 1 }}
                        transition={{
                          duration: 3,
                          ease: "linear",
                        }}
                        className="origin-left h-0.5 bg-emerald-500 absolute bottom-0 left-0 right-0 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>0{activeSlide + 1} / 0{POLICY_SLIDES.length}</span>
            </div>
          </div>

          {/* Crisp Slide Transition Body */}
          <div className="relative flex-1 my-2 overflow-hidden flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center"
              >
                {/* LEFT (The Official Input): Clean Snippet (5 cols) */}
                <div className="md:col-span-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {currentSlide.badge}
                    </span>
                    <span className="uppercase text-[10px] tracking-widest">Official Extract</span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                    {currentSlide.inputTitle}
                  </h3>

                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
                    {currentSlide.inputPassageParts.map((part, i) =>
                      part.highlight ? (
                        <span
                          key={i}
                          className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded"
                        >
                          {part.text}
                        </span>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )}
                  </p>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 pt-1">
                    Source: {currentSlide.inputSource}
                  </div>
                </div>

                {/* CENTER: Minimal SVG Pulse Connector (1 col) */}
                <div className="md:col-span-1 hidden md:flex flex-col items-center justify-center">
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 60 20">
                    <line
                      x1="0"
                      y1="10"
                      x2="60"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-slate-300 dark:text-zinc-700"
                      strokeDasharray="3 3"
                    />
                    <motion.circle
                      cx="10"
                      cy="10"
                      r="3.5"
                      fill="#10b981"
                      animate={{ cx: [4, 56] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Decoded
                  </span>
                </div>

                {/* RIGHT (The Plain Citizen Output): Clean Entitlement (5 cols) */}
                <div className="md:col-span-5 space-y-2 border-l border-slate-200 dark:border-zinc-800 md:pl-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentSlide.outputStatus}</span>
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 font-mono tracking-tight">
                      {currentSlide.outputGrantNumber}
                    </div>
                    <div className="font-heading font-semibold text-xs text-slate-800 dark:text-zinc-200 tracking-tight">
                      {currentSlide.outputTitle}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {currentSlide.outputDesc}
                  </p>

                  {/* 3-Step Action Row */}
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-700 dark:text-zinc-300">
                    {currentSlide.steps.map((st, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Tool Row: Voice Explainer */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              aria-label="Toggle audio explainer"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-[11px] font-medium transition-all cursor-pointer shadow-xs"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentSlide.audioLabel}</span>
                </>
              )}

              <div className="flex items-center gap-0.5 h-3 ml-1">
                {[1, 2, 3, 4, 5].map((b) => (
                  <span
                    key={b}
                    className={`w-0.5 rounded-full bg-emerald-400 transition-all ${
                      isPlayingAudio ? "animate-audio-bar" : "h-1.5"
                    }`}
                    style={{ animationDelay: `${b * 0.15}s` }}
                  />
                ))}
              </div>
            </button>

            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              Live Official Ingestion
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
