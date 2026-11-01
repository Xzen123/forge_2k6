"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  FileText,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Download,
  Building2,
  Zap,
} from "lucide-react";

interface HeroSectionProps {
  onWatchDemoClick?: () => void;
}

export default function HeroSection({ onWatchDemoClick }: HeroSectionProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Parallax mouse position tracking for floating badges
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 });
  const badge1X = useTransform(springX, [-300, 300], [-15, 15]);
  const badge1Y = useTransform(springY, [-300, 300], [-10, 10]);
  const badge2X = useTransform(springX, [-300, 300], [15, -15]);
  const badge2Y = useTransform(springY, [-300, 300], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="h-screen min-h-screen max-h-screen w-full relative overflow-hidden flex flex-col justify-center items-center px-6 md:px-16 snap-start snap-always select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Parallax Floating Badges */}
      <motion.div
        style={{ x: badge1X, y: badge1Y }}
        className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg text-[11px] font-mono absolute top-28 left-16 z-20 text-emerald-600 dark:text-emerald-400"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Grounded in Official Gazettes</span>
      </motion.div>

      <motion.div
        style={{ x: badge2X, y: badge2Y }}
        className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg text-[11px] font-mono absolute bottom-12 right-16 z-20 text-indigo-600 dark:text-indigo-400"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Deterministic Legal RAG</span>
      </motion.div>

      {/* Strict 100vh Layout Container */}
      <div className="h-full max-h-[92vh] pt-20 pb-4 flex flex-col justify-between w-full max-w-6xl mx-auto z-10">
        
        {/* Top ~35%: Headline & Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center justify-center max-h-[35%]"
        >
          {/* Status Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Deterministic Legal AI &middot; Zero Synthetic Hallucination</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
            Democratizing Public Policy.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
              Automating Citizen Rights.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto line-clamp-2">
            Turn dense government gazettes, complex municipal schemes, and legacy portals
            into plain-language voice explainers and automated service delivery.
          </p>

          {/* Buttons */}
          <div className="mt-3.5 flex items-center justify-center gap-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
            >
              <span>Explore Verified Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#sandpit"
              onClick={onWatchDemoClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-all shadow-xs"
            >
              <Play className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <span>Watch Sandpit Run</span>
            </a>
          </div>
        </motion.div>

        {/* Remaining ~55%: Constrained Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="h-[52vh] max-h-[410px] w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl"
        >
          {/* Top Preview Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                PIPELINE RUN: GAZETTE CIRCULAR &rarr; VERIFIED CITIZEN GRANT
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                GAZETTE: 44/2026/MSME
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                100% CITED
              </span>
            </div>
          </div>

          {/* Split Content Body */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 my-auto items-center">
            
            {/* Left: Dense Gazette Clause (5 cols) */}
            <div className="md:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 p-3.5 text-xs font-mono relative">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-200 dark:border-zinc-800 text-[10px]">
                <span className="text-slate-700 dark:text-zinc-300 font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  MINISTRY CIRCULAR 2026
                </span>
                <span className="text-amber-600 dark:text-amber-400 uppercase font-semibold">
                  Official Gazette
                </span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-4">
                &ldquo;Under Section 9 of the MSMED Act, handicraft artisans registered
                with Udyam Assist whose familial income does not exceed ₹3,00,000/- p.a.
                shall be granted collateral-free enterprise credit up to ₹10,00,000 under
                PM Mudra Scheme 2026 with 100% credit guarantee.&rdquo;
              </p>
              <div className="mt-2 pt-1 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-400">
                <span>pib.gov.in/PressRelease</span>
                <span>SHA-256 Verified</span>
              </div>
            </div>

            {/* Center: Processing Pulse (1 col) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Sparkles className="w-4 h-4 animate-spin [animation-duration:4s]" />
              </div>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 hidden md:block">
                OCR &middot; RAG
              </span>
            </div>

            {/* Right: Resolved Citizen Output (5 cols) */}
            <div className="md:col-span-5 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  Eligible: ₹10 Lakhs Loan
                </span>
                <span className="text-[10px] font-mono text-zinc-400">0 Collateral</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                PM Mudra Scheme 2026: Artisan Capital
              </h4>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2">
                100% government-guaranteed working capital for handicraft micro-enterprises with
                nil margin money.
              </p>

              {/* Quick Stepper Badges */}
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] text-center font-medium">
                <div className="p-1 rounded bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-emerald-500 font-bold block">1</span> Aadhaar
                </div>
                <div className="p-1 rounded bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-emerald-500 font-bold block">2</span> Bank A/c
                </div>
                <div className="p-1 rounded bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60">
                  <span className="text-emerald-500 font-bold block">3</span> 48h Disbursal
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Card Footer with Audio and WhatsApp 1-Pager */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-colors"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3 h-3 text-emerald-400" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>Play Hindi Audio (0:48)</span>
                </>
              )}
              <div className="flex items-center gap-0.5 h-2.5 ml-1">
                <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "animate-audio-bar" : "h-1"}`} />
                <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "animate-audio-bar [animation-delay:0.2s]" : "h-2"}`} />
                <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "animate-audio-bar [animation-delay:0.4s]" : "h-1.5"}`} />
              </div>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors"
            >
              <Download className="w-3 h-3 text-emerald-500" />
              <span>{downloaded ? "Downloaded!" : "Download WhatsApp 1-Pager"}</span>
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
