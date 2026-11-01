"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MapPin,
  Bot,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Camera,
  Activity,
} from "lucide-react";

export type PillarTab = "policy" | "triage" | "agent" | "truth";

export default function PillarsSection() {
  const [activeTab, setActiveTab] = useState<PillarTab>("policy");

  // Pillar 1 state
  const [income, setIncome] = useState("2.5L");
  const [category, setCategory] = useState("OBC");

  const pillars = [
    {
      id: "policy" as PillarTab,
      title: "Policy & Rights Explainer",
      short: "Multilingual RAG",
      icon: FileText,
      color: "emerald",
    },
    {
      id: "triage" as PillarTab,
      title: "Civic Grievance & Triage",
      short: "Computer Vision",
      icon: MapPin,
      color: "amber",
    },
    {
      id: "agent" as PillarTab,
      title: "Autonomous Bureaucracy",
      short: "Headless Playwright",
      icon: Bot,
      color: "cyan",
    },
    {
      id: "truth" as PillarTab,
      title: "Forensic Truth Engine",
      short: "Spectral Deepfake Audit",
      icon: ShieldAlert,
      color: "rose",
    },
  ];

  return (
    <section
      id="pillars"
      className="h-screen min-h-screen max-h-screen w-full relative overflow-hidden flex flex-col justify-center items-center px-6 md:px-16 snap-start snap-always select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Strict 100vh Layout Container */}
      <div className="h-full max-h-[92vh] pt-20 pb-4 flex flex-col justify-between w-full max-w-6xl mx-auto z-10">
        
        {/* Top Header (~20%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center justify-center max-h-[22%]"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1">
            <span>GOVERNANCE INFRASTRUCTURE</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            The 4 Governance Pillars
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            High-density civic intelligence: from dense gazette translation to automated form completion and deepfake verification.
          </p>

          {/* Pillar Switcher Pills */}
          <div className="mt-3 flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs">
            {pillars.map((p) => {
              const Icon = p.icon;
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.title}</span>
                  <span className="sm:hidden">{p.short}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Pillar Card (~75% of viewport) */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="h-[62vh] max-h-[500px] w-full max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
        >
          {/* TAB 1: Policy & Rights Explainer */}
          {activeTab === "policy" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      PILLAR 01 &middot; MULTILINGUAL LEGAL RAG
                    </span>
                    <span className="text-xs text-zinc-500">Sarvam AI STT/TTS</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Eligibility: 100% Deterministic
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Legalese Clause */}
                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs">
                    <span className="text-[10px] font-mono uppercase text-rose-700 dark:text-rose-400 font-bold block mb-1">
                      Raw Bureaucratic Circular
                    </span>
                    <p className="text-slate-600 dark:text-zinc-400 font-mono text-[11px] leading-relaxed line-clamp-3">
                      &ldquo;Under Clause 14(A) r/w Circular 2026/FIN, non-creamy layer domiciles
                      with aggregate familial returns &le; ₹2.5L are accorded statutory fee subvention.&rdquo;
                    </p>
                  </div>

                  {/* Plain Hindi & English Rights */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs">
                    <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                      Plain Hindi &amp; English Citizen Rights
                    </span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium text-[11px] leading-relaxed line-clamp-3">
                      अगर आप OBC छात्र हैं और परिवार की आय ₹2.5 लाख से कम है, तो आपको 100% ट्यूशन छूट और ₹48,000 वार्षिक छात्रवृत्ति मिलेगी।
                    </p>
                  </div>
                </div>

                {/* Interactive Eligibility Test */}
                <div className="mt-4 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70">
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2 flex items-center justify-between">
                    <span>Quick Eligibility Matrix:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Eligible: ₹48,000/yr Post-Matric Grant
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Family Income</label>
                      <select
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      >
                        <option value="1.5L">&lt; ₹2.5 Lakhs</option>
                        <option value="2.5L">₹2.5L - ₹5 Lakhs</option>
                        <option value="8L">&gt; ₹8 Lakhs</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      >
                        <option value="OBC">OBC (Non-Creamy)</option>
                        <option value="SC/ST">SC / ST</option>
                        <option value="General">General / EWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Domicile State</label>
                      <select className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                        <option>Bihar</option>
                        <option>Delhi-NCR</option>
                        <option>Uttar Pradesh</option>
                        <option>West Bengal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>12 Indian Languages (STT/TTS Regional Voices)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Source Passage Grounding</span>
              </div>
            </div>
          )}

          {/* TAB 2: Civic Grievance & Infrastructure Triage */}
          {activeTab === "triage" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    PILLAR 02 &middot; COMPUTER VISION AUDIT
                  </span>
                  <span className="text-xs font-mono text-amber-500 font-bold">
                    SLA: 24h Rectification
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white font-mono text-xs relative aspect-video flex items-center justify-center">
                    <div className="border-2 border-red-500 rounded-lg p-2.5 bg-red-500/15 max-w-[90%]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-red-400 mb-1">
                        <span>[SEVERITY: HIGH - RISK SCORE 9.2]</span>
                        <span>DEPTH ~8cm</span>
                      </div>
                      <p className="text-[11px] text-zinc-200">
                        Detected: Severe Arterial Asphalt Fracture
                      </p>
                      <div className="mt-1 text-[9px] text-zinc-400">
                        GPS: 28.6139° N, 77.2090° E &middot; Vikas Marg
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Automated Dispatch Route
                      </span>
                      <p className="font-bold text-slate-800 dark:text-zinc-200">
                        Executive Engineer, PWD Central Ward 12
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Ticket #PWD-2026-8910 generated under Citizens Grievance Charter.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Statutory SLA Guarantee</span>
                      </div>
                      <p className="text-[11px]">
                        Arterial road hazards mandate barrier cordoning within 4h and repair completion within 24h.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Geo-Spatial Computer Vision</span>
                <span className="text-amber-500 font-semibold">Deterministic Ward Escalation</span>
              </div>
            </div>
          )}

          {/* TAB 3: Autonomous Bureaucracy Agent */}
          {activeTab === "agent" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    PILLAR 03 &middot; HEADLESS PLAYWRIGHT RUNNER
                  </span>
                  <span className="text-xs font-mono text-cyan-500 font-bold">
                    Zero Credential Storage
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                          Phase 1: Citizen Auth &amp; Consent Verification
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          PII Redacted &middot; User approved form delegation
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      COMPLETED
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-cyan-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-500 font-bold flex items-center justify-center text-[10px] animate-pulse">
                        2
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                          Phase 2: Headless Browser Form Injection
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Populated 24 fields on National Scholarship Portal with PDF attachments
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                      EXECUTING (1.2s)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 opacity-60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                          Phase 3: Official Filing Receipt &amp; PDF Ack
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Government Application ID Generated
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">
                      QUEUED
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Headless Playwright Navigation</span>
                <span className="text-cyan-500 font-semibold">Human-in-the-Loop Safe</span>
              </div>
            </div>
          )}

          {/* TAB 4: Forensic Truth Engine */}
          {activeTab === "truth" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    PILLAR 04 &middot; FORENSIC TRUTH &amp; DEEPFAKE AUDIT
                  </span>
                  <span className="text-xs font-mono text-rose-500 font-bold">
                    Synthetic Voice: 98.4% Confidence
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-[11px]">
                    <span className="text-zinc-400">
                      AUDIO: &ldquo;Direct ₹75,000 cash grant announced by Central Govt&rdquo;
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                      DEEPFAKE CLONE
                    </span>
                  </div>

                  {/* Spectral Waveform */}
                  <div className="h-12 flex items-end justify-between gap-1 px-1 py-1 bg-zinc-900 rounded border border-zinc-800">
                    {[35, 75, 90, 25, 98, 40, 85, 30, 65, 95, 70, 45, 100, 60, 30, 80, 45, 90, 65, 35].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-xs ${
                            h > 70 ? "bg-rose-500" : "bg-zinc-600"
                          }`}
                        />
                      )
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      PIB FactCheck Refuted: Fraudulent Phishing Scam
                    </span>
                    <span className="text-zinc-500">DOC: PIB-FC-2026-102</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Grounded in Official Press Information Bureau Bulletins</span>
                <span className="text-rose-500 font-semibold">Zero Fake Schemes</span>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}

