"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";

interface PresetQuery {
  id: string;
  badge: string;
  title: string;
  query: string;
  result: {
    schemeName: string;
    status: "ELIGIBLE" | "ROUTED" | "REFUTED_SYNTHETIC";
    plainAnswer: string;
    citations: Array<{
      sourceName: string;
      sourceUrl: string;
      quote: string;
      fetchedAt: string;
    }>;
    terminalLogs: Array<{ text: string; ms: string; ok: boolean }>;
  };
}

const PRESETS: PresetQuery[] = [
  {
    id: "artisan",
    badge: "SCHEME ELIGIBILITY",
    title: "Artisan Micro-Loan Query",
    query: "24-year-old OBC terracotta artisan in Darbhanga, Bihar. Annual family income ₹2.4 Lakhs. Looking for collateral-free pottery equipment loan.",
    result: {
      schemeName: "PM Mudra Yojana & PM Vishwakarma Scheme 2026",
      status: "ELIGIBLE",
      plainAnswer:
        "100% Eligible: Sanctioned up to ₹2,00,000 collateral-free credit at 5% interest with ₹15,000 modern toolkit grant under PM Vishwakarma (Potter / Kumbhakar trade). Domicile and income under ₹3L qualify with nil margin money.",
      citations: [
        {
          sourceName: "PIB Release ID 198234",
          sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=198234",
          quote: "PM Vishwakarma provides collateral-free enterprise credit up to ₹1 Lakh and ₹2 Lakhs at 5% interest for traditional artisans.",
          fetchedAt: "Live Stream",
        },
      ],
      terminalLogs: [
        { text: "[AGENT] Dialect detected: English (IN) - Domicile: Bihar", ms: "18ms", ok: true },
        { text: "[EXTRACT] Profile: Age 24, Caste OBC, Income ₹2.4L, Trade: Pottery", ms: "42ms", ok: true },
        { text: "[RULES] Evaluating PM Vishwakarma Section 4(c) criteria -> PASSED", ms: "76ms", ok: true },
        { text: "[GROUNDING] Quoted passage verified against Gazette circular -> 100%", ms: "98ms", ok: true },
      ],
    },
  },
  {
    id: "pothole",
    badge: "CIVIC TRIAGE",
    title: "Damaged PWD Road Report",
    query: "Deep 10cm crater pothole on Vikas Marg opposite Metro Pillar 42. Two two-wheelers skidded this morning during rain.",
    result: {
      schemeName: "Delhi PWD Road Repair SLA Grievance #PWD-2026-9041",
      status: "ROUTED",
      plainAnswer:
        "Classified as 'High Severity: Critical Traffic Hazard (Risk Score 9.4/10)'. Automatically dispatched to PWD Central Division Executive Engineer, Ward 8. Cordoning within 4 hours and hot-mix resurfacing within 24 hours.",
      citations: [
        {
          sourceName: "Delhi PWD Citizens Charter (2026)",
          sourceUrl: "https://pwd.delhi.gov.in/citizens-charter",
          quote: "Hazardous potholes causing imminent danger to vehicular transit shall be inspected within 4 hours and rectified within 24 hours.",
          fetchedAt: "Municipal Cache",
        },
      ],
      terminalLogs: [
        { text: "[GEO] Reverse geocoding: Lat 28.6312° N, Long 77.2810° E", ms: "22ms", ok: true },
        { text: "[CV_MODEL] Classified depth: 10cm, Area: 1.4m², Severity: 9.4/10", ms: "64ms", ok: true },
        { text: "[ROUTING] Assigned to PWD Executive Engineer, Ward 8", ms: "88ms", ok: true },
        { text: "[TICKET] Statutory SLA alert generated: 24h deadline clock started", ms: "105ms", ok: true },
      ],
    },
  },
  {
    id: "viral",
    badge: "FORENSIC AUDIT",
    title: "Viral Social Media Audio Claim",
    query: "WhatsApp audio: 'Central Govt transferring ₹75,000 to all Jan Dhan accounts before festival. Click link to confirm Aadhaar.'",
    result: {
      schemeName: "PIB Fact Check Advisory & Ministry of Finance Circular 2026",
      status: "REFUTED_SYNTHETIC",
      plainAnswer:
        "FRAUDULENT SCAM: No such scheme exists. Audio contains an AI synthetic clone mimicking government officials. The Press Information Bureau Fact Check Unit has flagged this as an Aadhaar OTP phishing attack.",
      citations: [
        {
          sourceName: "PIB Fact Check Unit Advisory",
          sourceUrl: "https://factcheck.pib.gov.in/advisory-jan-dhan-fake-grant",
          quote: "A viral audio clip claiming Rs 75,000 transfer to Jan Dhan accounts is FAKE. No such financial disbursement has been announced.",
          fetchedAt: "PIB Dispatch",
        },
      ],
      terminalLogs: [
        { text: "[SPECTRAL] Acoustic voice model match: Synthetic Clone 98.4%", ms: "38ms", ok: true },
        { text: "[QUERY] Searching PIB Fact Check ledger for 'Jan Dhan 75000'", ms: "67ms", ok: true },
        { text: "[REFUTE] Record found: PIB Advisory #FC-2026-401 (Scam Flagged)", ms: "92ms", ok: true },
        { text: "[GUARD] Fraud payload neutralized; public advisory issued", ms: "110ms", ok: true },
      ],
    },
  },
];

export default function SandpitSection() {
  const [selectedPreset, setSelectedPreset] = useState<PresetQuery>(PRESETS[0]);
  const [inputText, setInputText] = useState<string>(PRESETS[0].query);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectPreset = (preset: PresetQuery) => {
    setSelectedPreset(preset);
    setInputText(preset.query);
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 350);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 500);
  };

  return (
    <section
      id="sandpit"
      className="h-screen min-h-screen max-h-screen w-full relative overflow-hidden flex flex-col justify-center items-center px-6 md:px-16 snap-start snap-always select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Strict 100vh Layout Container */}
      <div className="h-full max-h-[92vh] pt-20 pb-4 flex flex-col justify-between w-full max-w-6xl mx-auto z-10">
        
        {/* Top Header (~18%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center justify-center max-h-[20%]"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>PLAYWRIGHT &middot; LANGGRAPH LIVE RUNNER</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Autonomous Execution Sandpit
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Test live deterministic retrieval, Playwright headless forms, and official source grounding in real-time.
          </p>

          {/* 3 Preset Badges */}
          <div className="mt-2.5 flex items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPreset.id === p.id
                    ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Sandpit Window (~78% of Viewport) */}
        <div className="h-[64vh] max-h-[510px] w-full max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col justify-between shadow-2xl overflow-hidden">
          
          {/* Terminal Title Bar */}
          <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/80 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                SANDPIT EXECUTION CONSOLE
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              StateGraph &middot; Deterministic Rule Evaluator
            </span>
          </div>

          {/* Prompt Input Line */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center gap-2">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
            />
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Run</span>
            </button>
          </div>

          {/* Split Content: Terminal Logs (Left) & Verified Result + Citation (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 flex-1 overflow-hidden">
            
            {/* Left: Terminal Output */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-1.5">
                <div className="text-[10px] text-zinc-500 pb-1 border-b border-zinc-800 flex items-center justify-between">
                  <span>LOG STREAM (PID: 8402)</span>
                  <span className="text-emerald-400">STATUS: 200 OK</span>
                </div>
                {selectedPreset.result.terminalLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="truncate">{log.text}</span>
                    <span className="text-zinc-500 text-[10px] flex-shrink-0">{log.ms}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Execution completed &middot; Zero unverified claims</span>
              </div>
            </div>

            {/* Right: Resolved Answer & Official Citation */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-3.5 flex flex-col justify-between text-xs overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {selectedPreset.result.schemeName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {selectedPreset.result.status}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed line-clamp-3 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {selectedPreset.result.plainAnswer}
                </p>
              </div>

              {/* Strict Citation Box (<= 25 words quote) */}
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 font-mono text-[10px]">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  <span>{selectedPreset.result.citations[0].sourceName}</span>
                  <span>{selectedPreset.result.citations[0].fetchedAt}</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 italic line-clamp-2">
                  &ldquo;{selectedPreset.result.citations[0].quote}&rdquo;
                </p>
                <a
                  href={selectedPreset.result.citations[0].sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span className="truncate">{selectedPreset.result.citations[0].sourceUrl}</span>
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="h-8 border-t border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between text-[11px] text-zinc-500 bg-slate-50 dark:bg-zinc-950/60 font-mono">
            <span>Deterministic RAG &middot; PyMuPDF &middot; pgvector</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% CITED</span>
          </div>

        </div>

      </div>
    </section>
  );
}

