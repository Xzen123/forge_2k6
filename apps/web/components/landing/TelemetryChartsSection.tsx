"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Globe2,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";

export default function TelemetryChartsSection() {
  const [counter, setCounter] = useState(0);

  // Counter animation from 0 to 99.4%
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1.8;
      if (current >= 99.4) {
        setCounter(99.4);
        clearInterval(interval);
      } else {
        setCounter(parseFloat(current.toFixed(1)));
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const regionalBars = [
    { lang: "Hindi (हिन्दी)", coverage: "96%", latency: "0.32s" },
    { lang: "Bengali (বাংলা)", coverage: "91%", latency: "0.38s" },
    { lang: "Tamil (தமிழ்)", coverage: "88%", latency: "0.41s" },
    { lang: "Telugu (తెలుగు)", coverage: "86%", latency: "0.44s" },
    { lang: "Marathi (मराठी)", coverage: "84%", latency: "0.45s" },
  ];

  return (
    <section
      id="telemetry"
      className="h-screen max-h-screen w-full snap-start snap-always relative overflow-hidden flex flex-col justify-between px-6 md:px-14 py-6 md:py-8 select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[520px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Top Header (~14% of Viewport) */}
      <div className="pt-12 sm:pt-10 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>STATUTORY BENCHMARKS &amp; LIVE PIPELINE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 dark:text-zinc-50 tracking-[-0.035em]">
          Real-Time Telemetry &amp; Analytical Provenance
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Distributed pipeline parsing official gazettes, streaming native speech, and verifying citizen eligibility under 0.5 seconds.
        </p>
      </div>

      {/* Top Metrics Strip (~12% of Viewport) */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 my-1">
        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-50 font-mono">
              14+
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Indian Languages &amp; Dialects
            </div>
          </div>
          <Globe2 className="w-5 h-5 text-emerald-500/60" />
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              0.38s
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Mean Citation Latency
            </div>
          </div>
          <Zap className="w-5 h-5 text-emerald-500/60" />
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-zinc-50 font-mono">
              72h
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Statutory Grievance SLA
            </div>
          </div>
          <Activity className="w-5 h-5 text-emerald-500/60" />
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              100%
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Official Source Grounded
            </div>
          </div>
          <Shield className="w-5 h-5 text-emerald-500/60" />
        </div>
      </div>

      {/* 3 Animated Charts Grid (~68% of Viewport) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 w-full max-w-6xl mx-auto flex-1 max-h-[460px] my-1">
        
        {/* CHART 1: Ingestion Volume & Latency Curve (40% width / 5 cols) */}
        <div className="md:col-span-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-heading font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 tracking-tight">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Ingestion Throughput &amp; Latency Curve
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                p99 &lt; 420ms
              </span>
            </div>

            {/* Ingestion metric callout */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-black text-slate-900 dark:text-zinc-50 font-mono">
                14,280{" "}
                <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                  clauses/hr
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                PIB &amp; India Code Feeds
              </span>
            </div>

            {/* Animated SVG Chart */}
            <div className="relative w-full h-28 pt-1">
              <svg viewBox="0 0 300 110" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradTelemetry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path
                  d="M 0,95 Q 50,45 100,65 T 200,28 T 300,12 L 300,110 L 0,110 Z"
                  fill="url(#chartGradTelemetry)"
                />

                {/* Animated Stroke Line */}
                <motion.path
                  d="M 0,95 Q 50,45 100,65 T 200,28 T 300,12"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Active Data Marker */}
                <circle cx="300" cy="12" r="4" fill="#10b981" />
                <circle cx="300" cy="12" r="8" fill="#10b981" opacity="0.25" className="animate-ping" />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-2">
                <span>T - 60m</span>
                <span>T - 30m</span>
                <span>T - 15m</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live (0.34s)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Continuous Ingestion</span>
            <span className="text-slate-700 dark:text-zinc-300">Central &amp; State e-Gazettes</span>
          </div>
        </div>

        {/* CHART 2: Statutory Grounding Donut Chart & Concrete Stats (25% width / 3 cols) */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between items-center text-center shadow-sm">
          <div className="w-full pb-2 border-b border-slate-200 dark:border-zinc-800 text-left">
            <span className="text-xs font-heading font-bold text-slate-900 dark:text-zinc-100 block tracking-tight">
              Statutory Grounding
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">
              Clause-by-Clause Verification
            </span>
          </div>

          {/* Animated Circular Progress Ring */}
          <div className="relative w-24 h-24 my-1 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-200 dark:text-zinc-800"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="7"
                strokeDasharray="251.2"
                strokeDashoffset="251.2"
                strokeLinecap="round"
                animate={{ strokeDashoffset: 251.2 * (1 - 0.994) }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            {/* Inner Counter */}
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-black text-slate-900 dark:text-zinc-50 font-mono">
                {counter}%
              </span>
              <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                MATCHED
              </span>
            </div>
          </div>

          {/* Concrete Context Stats Underneath to Fill Vertical Balance */}
          <div className="w-full space-y-1.5 py-1 text-left text-[11px]">
            <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
              <span>Statutory Match Rate</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">99.4%</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
              <span>Hallucination Rate</span>
              <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">0.0%</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-[10px]">
              <span>Verification Rule</span>
              <span className="text-slate-600 dark:text-zinc-300">Quote &amp; Drop</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 w-full flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            <span>Audit Standard</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Strict Proof</span>
          </div>
        </div>

        {/* CHART 3: Regional Language Coverage Bar Chart (35% width / 4 cols) */}
        <div className="md:col-span-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-heading font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 tracking-tight">
                <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                Regional Dialect Pipeline
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Sarvam AI STT/TTS</span>
            </div>

            {/* Horizontal Sliding Bars with Response Times */}
            <div className="space-y-2.5 pt-1">
              {regionalBars.map((bar, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {bar.lang}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
                      {bar.latency}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: bar.coverage }}
                      viewport={{ once: false }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            <span>Speech Model</span>
            <span className="text-slate-700 dark:text-zinc-300">Indian Acoustic Embeddings</span>
          </div>
        </div>

      </div>

    </section>
  );
}
