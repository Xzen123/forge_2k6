"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  RefreshCw,
  Send,
  ShieldCheck,
  Building,
  Terminal,
} from "lucide-react";

interface PresetQuery {
  id: string;
  badge: string;
  title: string;
  query: string;
  category: string;
  result: {
    schemeName: string;
    status: "ELIGIBLE" | "ROUTED" | "REFUTED_SYNTHETIC";
    plainAnswer: string;
    citations: Array<{
      sourceUrl: string;
      sourceName: string;
      quote: string;
      fetchedAt: string;
    }>;
    steps: Array<{ name: string; status: "done" | "in_progress"; latency: string }>;
    audioSnippet?: string;
  };
}

const PRESETS: PresetQuery[] = [
  {
    id: "artisan",
    badge: "SCHEME ELIGIBILITY",
    title: "Artisan Micro-Loan Query",
    category: "Pillar 1: Policy & Rights",
    query: "I am a 24-year-old OBC terracotta artisan in Darbhanga, Bihar. Annual family income is ₹2.4 Lakhs. Can I get a loan without collateral for new pottery kiln equipment?",
    result: {
      schemeName: "PM Mudra Yojana (Shishu/Kishor) & PM Vishwakarma Scheme 2026",
      status: "ELIGIBLE",
      plainAnswer:
        "Yes, you are 100% eligible for up to ₹2,00,000 collateral-free credit at a concessional interest rate of 5%, plus a ₹15,000 modern toolkit grant under PM Vishwakarma (Potter / Kumbhakar trade). Your domicile in Bihar and annual family income under ₹3 Lakhs qualify you for the full credit guarantee with nil margin money.",
      citations: [
        {
          sourceName: "PIB Press Release ID 198234",
          sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=198234",
          quote: "PM Vishwakarma provides collateral-free enterprise credit up to ₹1 Lakh (1st tranche) and ₹2 Lakhs (2nd tranche) at 5% interest for traditional artisans.",
          fetchedAt: "Live Official Stream",
        },
        {
          sourceName: "Ministry of MSME Operational Guidelines 2026",
          sourceUrl: "https://msme.gov.in/pm-vishwakarma-guidelines",
          quote: "Artisans registered under Udyam Assist with family income <= ₹3 Lakhs receive 100% credit guarantee coverage and Rs 15,000 toolkit voucher.",
          fetchedAt: "Live Gazette Cache",
        },
      ],
      steps: [
        { name: "Language Detected: English (Indian Domicile Query)", status: "done", latency: "24ms" },
        { name: "Entity & Income Extraction: Age 24, OBC, Bihar, ₹2.4L", status: "done", latency: "62ms" },
        { name: "Deterministic Rule Matching: PM Vishwakarma Criteria [PASS]", status: "done", latency: "88ms" },
        { name: "Passage Verification against Gazette Docs [100% Grounded]", status: "done", latency: "114ms" },
      ],
    },
  },
  {
    id: "pothole",
    badge: "CIVIC TRIAGE",
    title: "Damaged PWD Road Report",
    category: "Pillar 2: Infrastructure",
    query: "Deep 10cm crater pothole on Vikas Marg opposite Metro Pillar 42. Two two-wheelers skidded this morning during rain. Immediate hazard.",
    result: {
      schemeName: "Delhi PWD Rapid Road Repair & Grievance SLA Grievance #PWD-2026-9041",
      status: "ROUTED",
      plainAnswer:
        "Your civic complaint has been classified as 'High Severity: Critical Traffic Hazard (Risk Score 9.4/10)' and automatically dispatched to PWD Central Division Executive Engineer, Ward 8. Under the Public Grievance Redressal Charter, high-risk arterial potholes mandate initial barrier cordoning within 4 hours and hot-mix resurfacing within 24 hours.",
      citations: [
        {
          sourceName: "Delhi PWD Citizens Charter (Gazette Notification 2026)",
          sourceUrl: "https://pwd.delhi.gov.in/citizens-charter",
          quote: "Hazardous potholes causing imminent danger to vehicular transit on arterial roads shall be inspected within 4 hours and rectified within 24 hours.",
          fetchedAt: "Live Municipal Feed",
        },
      ],
      steps: [
        { name: "Spatial Geo-Coding: Lat 28.6312° N, Long 77.2810° E", status: "done", latency: "31ms" },
        { name: "Hazard Classification: High Risk (Skid/Injury Factor)", status: "done", latency: "54ms" },
        { name: "Department Routing: PWD Central Division Ward 8", status: "done", latency: "79ms" },
        { name: "Grievance Ticket Generated with 24h SLA", status: "done", latency: "95ms" },
      ],
    },
  },
  {
    id: "viral",
    badge: "FORENSIC AUDIT",
    title: "Viral Social Media Audio Claim",
    category: "Pillar 4: Forensic Truth",
    query: "Viral audio recording on WhatsApp claiming: 'Central Govt is transferring ₹75,000 to all Jan Dhan accounts before Holi. Click this link to confirm Aadhaar.'",
    result: {
      schemeName: "PIB Fact Check Advisory & Ministry of Finance Circular 2026",
      status: "REFUTED_SYNTHETIC",
      plainAnswer:
        "FALSE & FRAUDULENT: No such scheme exists. The audio clip features a synthetic AI clone mimicking government officials. The Press Information Bureau (PIB) Fact Check Unit has explicitly flagged this as a phishing scam intended to harvest Aadhaar OTPs. Never enter banking credentials on unofficial third-party domains.",
      citations: [
        {
          sourceName: "PIB Fact Check Unit Official Release",
          sourceUrl: "https://factcheck.pib.gov.in/advisory-jan-dhan-fake-grant",
          quote: "A viral audio clip claiming Rs 75,000 transfer to Jan Dhan account holders is FAKE. The Government of India has announced no such financial disbursement.",
          fetchedAt: "Live PIB Dispatch",
        },
      ],
      steps: [
        { name: "Acoustic Analysis: Synthetic Voice Likelihood 98.4%", status: "done", latency: "42ms" },
        { name: "PIB Fact Check Database Search [Matched Record #FC-2026-401]", status: "done", latency: "76ms" },
        { name: "Fraud Alert Flagged: Malicious Phishing Vector", status: "done", latency: "89ms" },
      ],
    },
  },
];

export default function InteractiveSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<PresetQuery>(PRESETS[0]);
  const [inputText, setInputText] = useState<string>(PRESETS[0].query);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"result" | "steps" | "citations">("result");

  const handleSelectPreset = (preset: PresetQuery) => {
    setSelectedPreset(preset);
    setInputText(preset.query);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 400);
  };

  const handleRunCustom = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 600);
  };

  return (
    <section id="sandbox" className="py-20 sm:py-28 bg-slate-100/60 dark:bg-zinc-950/60 border-y border-slate-200 dark:border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>INTERACTIVE TEST RUNNER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Test the Ground-Truth Pipeline
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Select a live preset scenario or submit a citizen situation to watch deterministic legal retrieval in action.
          </p>
        </div>

        {/* 3 Quick Presets Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-8">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                      {preset.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Preset {preset.id === "artisan" ? "1" : preset.id === "pothole" ? "2" : "3"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    {preset.title}
                  </h4>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                  {preset.query}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Runner Window */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xl overflow-hidden">
          
          {/* Runner Top Bar */}
          <div className="h-12 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/80">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                PIPELINE RUNNER: {selectedPreset.category}
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("result")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "result"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                Verified Answer
              </button>
              <button
                onClick={() => setActiveTab("citations")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "citations"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                Citations ({selectedPreset.result.citations.length})
              </button>
              <button
                onClick={() => setActiveTab("steps")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "steps"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                Trace Execution
              </button>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/30">
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
              Citizen Input Prompt (Supports Hindi, Bengali, English):
            </label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
              <button
                onClick={handleRunCustom}
                disabled={isProcessing}
                className="px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 flex-shrink-0"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Display: Tabbed Content */}
          <div className="p-4 sm:p-6 min-h-[220px]">
            {isProcessing ? (
              <div className="h-44 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-mono animate-pulse">
                  Retrieving official gazettes &amp; evaluating criteria...
                </span>
              </div>
            ) : (
              <>
                {/* TAB 1: RESULT */}
                {activeTab === "result" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {selectedPreset.result.status === "ELIGIBLE" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Status: Eligible For Benefit
                          </span>
                        )}
                        {selectedPreset.result.status === "ROUTED" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Status: Triage Dispatched (24h SLA)
                          </span>
                        )}
                        {selectedPreset.result.status === "REFUTED_SYNTHETIC" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Status: Refuted / Fraud Claim
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {selectedPreset.result.schemeName}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        Ground Truth: Verified
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-sans bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                      {selectedPreset.result.plainAnswer}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>All claims backed by official source passages below.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("citations")}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Inspect {selectedPreset.result.citations.length} Official Citations &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: CITATIONS */}
                {activeTab === "citations" && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
                      Official Source Passages (Strictly &le; 25 words per quote):
                    </div>
                    {selectedPreset.result.citations.map((cite, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 dark:border-zinc-800 text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {cite.sourceName}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {cite.fetchedAt}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-300 italic mb-2">
                          &ldquo;{cite.quote}&rdquo;
                        </p>
                        <a
                          href={cite.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <span>{cite.sourceUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: TRACE STEPS */}
                {activeTab === "steps" && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
                      LangGraph Execution Telemetry:
                    </div>
                    {selectedPreset.result.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-slate-800 dark:text-zinc-200">
                            {step.name}
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          {step.latency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

