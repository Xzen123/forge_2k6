"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Send,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SandboxScenario {
  id: string;
  pill: string;
  pillar: string;
  title: string;
  query: string;
  rawInput: string;
  confidence: number;
  verdict: string;
  verdictType: "success" | "warning" | "danger";
  entitlements: string[];
  requirements: string[];
  citationDocId: string;
  citationAuthority: string;
  citationUrl: string;
  citationQuote: string;
}

const SANDBOX_SCENARIOS: SandboxScenario[] = [
  {
    id: "artisan",
    pill: "Artisan Loan",
    pillar: "Pillar 1: Legal Decoder",
    title: "PM Mudra & Vishwakarma Sovereign Credit",
    query:
      "Handicraft artisan running micro pottery unit in Darbhanga. Need ₹4 Lakhs working capital for kilns without pledging house property.",
    rawInput:
      "MSME Development Act Section 9 r/w Notification 44/2026: Eligible rural artisans engaged in non-mechanized handicrafts registered under Udyam Assist with family income <= ₹3,00,000 are sanctioned credit guarantee up to ₹10,00,000 with nil margin money.",
    confidence: 99.4,
    verdict: "Eligible · Collateral-Free Credit",
    verdictType: "success",
    entitlements: [
      "Up to ₹10,00,000 working capital loan under CGFMU sovereign credit guarantee.",
      "5% capped concessional interest rate with ₹15,000 toolkit e-voucher.",
      "Zero margin money and nil collateral requirement for registered artisans.",
    ],
    requirements: [
      "Udyam Assist registered micro-enterprise certificate.",
      "Family income certificate <= ₹3,00,000 issued by Tehsildar.",
      "Aadhaar-linked DBT savings account in scheduled bank.",
    ],
    citationDocId: "Notification 44/2026 (MSME Act, Sec 9)",
    citationAuthority: "Ministry of MSME & Dept of Financial Services, GoI",
    citationUrl: "https://msme.gov.in",
    citationQuote:
      "Rural artisans registered under Udyam Assist with family income <= Rs 3,00,000 are sanctioned credit guarantee up to Rs 10,00,000 with nil margin money.",
  },
  {
    id: "water_burst",
    pill: "Water Leak Triage",
    pillar: "Pillar 2: Civic SLA Triage",
    title: "High-Pressure Potable Pipeline Rupture (Ward 28)",
    query:
      "High-pressure water main rupture under Subhash Nagar 4th Cross. Potable water flooding sector at est. 380 Liters/min. Road foundation eroding.",
    rawInput:
      "Citizen Geo-Photo: [28.6320° N, 77.2190° E] · Computer Vision Tag: Hydraulic Plume Rupture (Est. 380L/min). Severity Score: 8.8/10. Hazard: Critical Foundation Washout. Ward: Delhi Jal Board - South II.",
    confidence: 98.6,
    verdict: "Triaged · Priority 1 Emergency",
    verdictType: "warning",
    entitlements: [
      "Jal Board Quick Response Team (QRT) dispatched to geo-coordinates.",
      "Statutory 48-hour resolution clock triggered under Citizen Charter.",
      "Auto-escalation to District Ombudsman if unresolved within SLA.",
    ],
    requirements: [
      "GPS Tag: 28.6320° N, 77.2190° E (Ward 28 - South II).",
      "Hazard Classification: Potable water main rupture (>200L/min).",
      "Assigned Officer: Er. Vikramaditya Sen, DJB Infrastructure Cell.",
    ],
    citationDocId: "Delhi Jal Board Citizen Charter (Civic Service Guarantees)",
    citationAuthority: "Delhi Jal Board Infrastructure Cell & MCD Ward 28",
    citationUrl: "https://mcdonline.nic.in",
    citationQuote:
      "Emergency potable water main ruptures exceeding 200L/min must be capped within 48h under statutory civic penalty guidelines.",
  },
  {
    id: "election_audio",
    pill: "Viral Audio Audit",
    pillar: "Pillar 4: Deepfake Audit",
    title: "Synthetic Media & Ration Quota Disinformation",
    query:
      "Viral audio recording on WhatsApp & Telegram: Chief Minister purportedly announcing sudden cancellation of agricultural foodgrain quota.",
    rawInput:
      "Acoustic Audio Waveform Stream: High-frequency phase jitter at 8.2kHz vocoder band. Visual Artifact Score: 94.6%. Origin Cluster: Telegram Bot Network #8819.",
    confidence: 99.2,
    verdict: "Fabricated · 98.4% Synthetic Media",
    verdictType: "danger",
    entitlements: [
      "NFSA foodgrain entitlement remains 100% free; no ration cuts active.",
      "Advisory bulletin issued against Telegram/WhatsApp disinformation cluster.",
      "Multi-dialect audio debunk synthesized in Hindi, Bengali & Marathi.",
    ],
    requirements: [
      "Acoustic Anomaly: Phase jitter in 8.2kHz neural vocoder band.",
      "Origin Cluster: Telegram Bot Network #8819.",
      "Statutory Basis: NFSA 2013 Gazette S.O. 4410 unaltered.",
    ],
    citationDocId: "PIB Fact Check Advisory & NFSA Statutory Schedule",
    citationAuthority: "Press Information Bureau (PIB) Fact Check Unit",
    citationUrl: "https://pib.gov.in",
    citationQuote:
      "PIB Fact Check confirms the viral audio is fake. No changes have been made to NFSA foodgrain allocations. Do not forward synthetic clips.",
  },
];

export default function SandboxSection() {
  const [selectedScenario, setSelectedScenario] = useState<SandboxScenario>(SANDBOX_SCENARIOS[0]);
  const [inputText, setInputText] = useState(SANDBOX_SCENARIOS[0].query);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSelect = (scenario: SandboxScenario) => {
    setSelectedScenario(scenario);
    setInputText(scenario.query);
    setIsEvaluating(true);
    setTimeout(() => setIsEvaluating(false), 300);
  };

  const handleRun = () => {
    setIsEvaluating(true);
    setTimeout(() => setIsEvaluating(false), 400);
  };

  return (
    <section
      id="sandbox"
      className="h-screen max-h-screen w-full snap-start snap-always relative overflow-hidden flex flex-col justify-between px-6 md:px-14 py-6 md:py-8 select-none"
    >
      {/* Top Header (~14% of Viewport) */}
      <div className="pt-12 sm:pt-10 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>INTERACTIVE SANDPIT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 dark:text-zinc-50 tracking-[-0.035em]">
          Test Live Governance Decoders
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Test real-time statutory scheme extraction, computer vision civic triage, and neural deepfake auditing live.
        </p>
      </div>

      {/* Preset Selector Chips (~6% of Viewport) */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-2 sm:gap-3 my-1">
        {SANDBOX_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelect(sc)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedScenario.id === sc.id
                ? "bg-emerald-500/15 border border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            <span>[{sc.pill}]</span>
          </button>
        ))}
      </div>

      {/* Split Interactive Console (~76% of Viewport) */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 flex-1 max-h-[480px] my-1">
        
        {/* LEFT PANE: Input & Grounding Stream (5 cols) */}
        <div className="md:col-span-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-heading font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 tracking-tight">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Citizen Input
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold">
                {selectedScenario.pillar}
              </span>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a notice snippet, grievance description, or claim to audit..."
              className="w-full bg-slate-50/80 dark:bg-zinc-950/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed font-sans"
            />

            {/* Ingest Telemetry Box */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Official Ingestion Stream:
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-mono bg-slate-50/50 dark:bg-zinc-950/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-800/60 line-clamp-3">
                {selectedScenario.rawInput}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              Statutory RAG Pipeline
            </span>
            <button
              onClick={handleRun}
              disabled={isEvaluating}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Evaluate Claim</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANE: Single Elegant Resolution Card (7 cols) */}
        <div className="md:col-span-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            {/* Header Verdict Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedScenario.verdictType === "danger"
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                      : selectedScenario.verdictType === "warning"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {selectedScenario.verdict}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {selectedScenario.confidence}% Match
              </span>
            </div>

            {/* Scheme / Case Title */}
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                {selectedScenario.title}
              </h3>
            </div>

            {/* 2-Column Plain Text Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Left Column: Entitlements / Actions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-zinc-400 block">
                  Entitlements &amp; Resolution
                </span>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {selectedScenario.entitlements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Required Documents / Context */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-zinc-400 block">
                  Required Criteria &amp; Documents
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {selectedScenario.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Official Gazette Citation Quote */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-0.5">
                Statutory Source Passage:
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 italic leading-relaxed">
                “{selectedScenario.citationQuote}”
              </p>
            </div>
          </div>

          {/* Citation Footer */}
          <div className="pt-2.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Authority: {selectedScenario.citationAuthority}
            </span>
            <a
              href={selectedScenario.citationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{selectedScenario.citationDocId}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
}
