"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LaunchDeploySection() {
  const regions = [
    { name: "National Central Division", status: "Active Live", count: "142 Schemes" },
    { name: "Bihar State Division", status: "Active Live", count: "38 Schemes" },
    { name: "Delhi-NCR Municipal Zone", status: "Active Live", count: "29 Schemes" },
    { name: "Uttar Pradesh State Grid", status: "Active Live", count: "44 Schemes" },
    { name: "Maharashtra Urban Division", status: "Active Live", count: "36 Schemes" },
    { name: "West Bengal Municipal Grid", status: "Active Live", count: "25 Schemes" },
  ];

  return (
    <section
      id="launch"
      className="h-screen min-h-screen max-h-screen w-full relative overflow-hidden flex flex-col justify-center items-center px-6 md:px-16 snap-start snap-always select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Strict 100vh Layout Container */}
      <div className="h-full max-h-[92vh] pt-20 pb-4 flex flex-col justify-between w-full max-w-6xl mx-auto z-10">
        
        {/* Top Header (~25%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center justify-center max-h-[26%]"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1">
            <Globe2 className="w-3.5 h-3.5" />
            <span>REGIONAL COVERAGE &middot; DIGITAL PUBLIC GOODS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Launch Autonomous Citizen Intelligence
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Experience deterministic governance grounded in live official gazettes. Open, transparent, and voice-accessible.
          </p>

          {/* Primary Launch Action */}
          <div className="mt-3">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 transition-all"
            >
              <span>Access Citizen Portal OS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Center: Live Stats & Regional Deployment Grid (~55% of Viewport) */}
        <div className="h-[48vh] max-h-[380px] w-full max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl overflow-hidden">
          
          {/* Top Live Metrics */}
          <div className="grid grid-cols-4 gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800 font-mono text-center">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-[10px] text-zinc-500 uppercase">Passage Grounding</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                12
              </div>
              <div className="text-[10px] text-zinc-500 uppercase">Regional Dialects</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                0ms
              </div>
              <div className="text-[10px] text-zinc-500 uppercase">PII Retention</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                99.98%
              </div>
              <div className="text-[10px] text-zinc-500 uppercase">Gazette Sync</div>
            </div>
          </div>

          {/* Regional Grid */}
          <div className="my-auto py-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400 mb-2 font-bold tracking-wider">
              Active Regional Jurisdictions
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {regions.map((reg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px] truncate">
                      {reg.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">{reg.count}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    LIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Standards & Compliance Bar */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              WCAG AAA Accessible &middot; Open API 3.1
            </span>
            <span>Deterministic Legal Logic</span>
          </div>

        </div>

        {/* Integrated Compact Bottom Footer (~12%) */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 max-h-[14%]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
              CP
            </div>
            <span className="font-medium text-slate-700 dark:text-zinc-400">
              CivicPulse AI &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Official Source Links */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <a
              href="https://pib.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <span>PIB</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://www.indiacode.nic.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <span>India Code</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://www.myscheme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <span>myScheme</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

