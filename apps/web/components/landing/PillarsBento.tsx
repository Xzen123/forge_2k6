"use client";

import React, { useState } from "react";
import {
  FileText,
  MapPin,
  Bot,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Camera,
  Activity,
  Fingerprint,
  FileCheck,
  Cpu,
} from "lucide-react";

export default function PillarsBento() {
  // Card 1: Interactive Eligibility Checker state
  const [income, setIncome] = useState("2.5L");
  const [age, setAge] = useState("22");
  const [category, setCategory] = useState("OBC");

  // Card 3: Autonomous agent simulation step
  const [agentStep, setAgentStep] = useState<number>(2);

  return (
    <section id="pillars" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <span>THE 4 FOUNDATIONAL PILLARS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Engineered for Ground-Truth Public Administration
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            A unified agentic infrastructure transforming raw government data into verified,
            accessible, and actionable citizen outcomes.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* CARD 1: Multilingual Policy & Rights Explainer (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  PILLAR 01 &middot; MULTILINGUAL RAG
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Policy &amp; Rights Explainer
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Translates dense, impenetrable legal clauses into simple, spoken regional
                dialects. Calculates exact monetary eligibility against official gazette rules.
              </p>

              {/* Dual-Pane Legalese vs Plain-Language Diff */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Legalese */}
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="text-[10px] font-mono uppercase text-rose-700 dark:text-rose-400 font-semibold mb-1">
                    Raw Bureaucratic Circular
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 font-mono text-[11px] leading-relaxed line-clamp-3">
                    &ldquo;Pursuant to Section 14(A) r/w Circular 2026/FIN, non-creamy layer
                    domiciles of Schedule II states with aggregate familial returns...&rdquo;
                  </p>
                </div>

                {/* Plain Regional Translation */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                    Plain Hindi &amp; English Citizen Rights
                  </div>
                  <p className="text-slate-800 dark:text-zinc-200 font-medium text-[11px] leading-relaxed">
                    अगर आप OBC छात्र हैं और पारिवारिक आय 3 लाख से कम है, तो आपको 100% हॉस्टल भत्ता और ₹48,000 वार्षिक छात्रवृत्ति मिलेगी।
                  </p>
                </div>
              </div>

              {/* Interactive Eligibility Checker Widget */}
              <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
                <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
                  <span>Interactive Eligibility Test:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                    Status: 100% Eligible (₹48,000/yr)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">
                      Family Income
                    </label>
                    <select
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                    >
                      <option value="1.5L">&lt; ₹2.5 Lakhs</option>
                      <option value="2.5L">₹2.5L - ₹5 Lakhs</option>
                      <option value="8L">&gt; ₹8 Lakhs</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">
                      Social Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                    >
                      <option value="OBC">OBC (Non-Creamy)</option>
                      <option value="SC/ST">SC / ST</option>
                      <option value="General">General / EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">
                      Age Bracket
                    </label>
                    <select
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                    >
                      <option value="18">18 - 25 years</option>
                      <option value="30">26 - 40 years</option>
                      <option value="60">60+ Senior</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-mono">Sarvam AI STT/TTS Integration</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">12 Indian Languages</span>
            </div>
          </div>

          {/* CARD 2: Civic Grievance & Infrastructure Triage (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  PILLAR 02 &middot; COMPUTER VISION
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Civic Triage &amp; Geo-Audit
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Instant computer-vision triage of municipal defects with auto-calculated
                urgency classification and deterministic routing to responsible department wards.
              </p>

              {/* Mock UI: Computer Vision Bounding Box */}
              <div className="mt-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white p-4 relative overflow-hidden">
                <div className="aspect-video w-full rounded-lg bg-zinc-950 relative flex items-center justify-center border border-zinc-800">
                  {/* Mock asphalt/pothole texture */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:8px_8px]" />

                  {/* Bounding box simulation */}
                  <div className="border-2 border-red-500 rounded-md p-2 bg-red-500/10 max-w-[85%] text-left relative">
                    <span className="absolute -top-3 left-2 px-1.5 py-0.2 rounded bg-red-600 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      Severity: High &middot; Risk Score 9.2
                    </span>
                    <p className="text-[10px] font-mono text-zinc-200 mt-1">
                      [Detected: Severe Asphalt Fracture (Depth ~8cm, Span 1.4m)]
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-zinc-400">
                      <span>GPS: 28.6139° N, 77.2090° E</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400">Auto-Routed: PWD Central Ward 12</span>
                  <span className="text-zinc-400">SLA: 24h</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Geo-Spatial Verification</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Deterministic Escalation</span>
            </div>
          </div>

          {/* CARD 3: Autonomous Bureaucracy Execution Agent (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  PILLAR 03 &middot; HEADLESS AUTOMATION
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Autonomous Bureaucracy Agent
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Solves bureaucratic friction through automated form population on legacy
                government portals with user-in-the-loop cryptographic consent.
              </p>

              {/* Visual Stepper */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-emerald-500/30">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Step 1: Citizen Auth &amp; Consent Verified
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      PII encrypted &middot; Zero credential storage
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    COMPLETE
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-cyan-500/40">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold animate-pulse">
                    2
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Step 2: Headless Portal Fields Populated
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      National Scholarship Portal &middot; 18 form parameters filled
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    IN PROGRESS
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Step 3: Official Filing Receipt Generated
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Government Application ID &amp; PDF Ack
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">PENDING</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Playwright Headless Execution</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Human-in-the-Loop Safe</span>
            </div>
          </div>

          {/* CARD 4: Forensic Truth & Deepfake Audit (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  PILLAR 04 &middot; FORENSIC TRUTH
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Forensic Truth &amp; Deepfake Audit
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Spectral voice analysis and cross-verification of viral WhatsApp/social claims
                against official Press Information Bureau releases to neutralize misinformation.
              </p>

              {/* Spectral Analyzer Mock */}
              <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-950 text-white font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400">
                    CLAIM: &ldquo;Free ₹50,000 Diwali grant for all ration card holders&rdquo;
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                    SYNTHETIC VOICE: 98.4% CONFIDENCE
                  </span>
                </div>

                {/* Mock Spectral Waveform bars */}
                <div className="h-14 flex items-end justify-between gap-1 px-1 py-1 bg-zinc-900/80 rounded-md border border-zinc-800">
                  {[40, 65, 80, 20, 95, 30, 85, 45, 60, 90, 70, 35, 100, 50, 25, 75, 40, 85, 60, 30].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-xs ${
                        h > 70 ? "bg-rose-500" : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    PIB FactCheck Refuted: No Such Scheme Exists
                  </span>
                  <span className="text-zinc-500">ID: FACT-2026-89</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Grounded in Official PIB Fact Checks</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Zero Fake Schemes</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

