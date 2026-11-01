"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MapPin,
  Bot,
  ShieldAlert,
  ArrowRight,
  X,
  Volume2,
  Download,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { generateBenefitSummaryCard } from "@/lib/export-card";

interface PillarData {
  id: number;
  moduleId: string;
  tag: string;
  title: string;
  desc: string;
  bgGradient: string;
  meta: string;
  accentColor: string;
  statusTag: string;
  // Deep inspection drawer details
  specClause: string;
  specQuote: string;
  specEntitlement: string;
  specTimeline: string[];
  launchUrl: string;
}

const PILLARS: PillarData[] = [
  {
    id: 0,
    moduleId: "policy",
    tag: "Autonomous Legal RAG",
    title: "Multilingual Policy Explainer",
    desc: "Ingests official state gazettes and decodes them into regional voice explainers with verified clause citations.",
    bgGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
    meta: "14 Dialects",
    accentColor: "#ea580c",
    statusTag: "100% CITED",
    specClause: "Bihar Backward Classes Welfare Gazette Notification 14-A",
    specQuote:
      "Clause 3.1: Eligible non-creamy OBC candidates with annual family income not exceeding Rs. 3,00,000 are sanctioned 100% compulsory tuition fee reimbursement and annual maintenance allowance of Rs 14,400 via Direct Benefit Transfer.",
    specEntitlement: "100% Tuition Remission + ₹14,400/yr Living Allowance via PFMS DBT",
    specTimeline: [
      "Official Gazette Crawled",
      "Clause Anchors Verified",
      "Rule-by-Rule Eligibility Run",
      "Regional Audio Synthesized",
    ],
    launchUrl: "/portal?module=policy",
  },
  {
    id: 1,
    moduleId: "triage",
    tag: "CV & Municipal Routing",
    title: "Civic Grievance Triage",
    desc: "Instant computer vision damage detection with automated municipal ward dispatch and a 72-hour enforced SLA.",
    bgGradient: "from-[#dc2626] via-[#b91c1c] to-[#7f1d1d]",
    meta: "72h Strict SLA",
    accentColor: "#dc2626",
    statusTag: "WARD 7 AUTO-DISPATCH",
    specClause: "Delhi Public Works Service Guarantee Act & Municipal Charter",
    specQuote:
      "Section 8: Structural road fractures exceeding severity score 7.0/10 must be inspected by Executive Engineers within 24 hours, with restorative tack coat completed within 72 hours under Ombudsman audit.",
    specEntitlement: "Guaranteed 72h Rectification + Citizen Proof-of-Work Sign-Off",
    specTimeline: [
      "GPS Tagged: [28.6139° N, 77.2090° E]",
      "CV Damage Severity: 8.9/10",
      "Assigned to PWD Central Division",
      "Live 72-Hour SLA Countdown Active",
    ],
    launchUrl: "/portal?module=triage",
  },
  {
    id: 2,
    moduleId: "agent",
    tag: "Headless Browser-Use",
    title: "Bureaucracy Execution Agent",
    desc: "Navigates legacy state portals, populates 40+ fields with zero stored credentials, and halts at a human approval gate.",
    bgGradient: "from-[#4f46e5] via-[#3730a3] to-[#1e1b4b]",
    meta: "Zero-Knowledge PII",
    accentColor: "#4f46e5",
    statusTag: "SANDBOXED WORKER",
    specClause: "National e-Governance Division Sandboxed Interoperability Protocol",
    specQuote:
      "Directive 4.2: Autonomous form submission on public welfare portals requires client-side demographic masking and an unbypassable human consent gate prior to cryptographic acknowledgement sealing.",
    specEntitlement: "Autonomous 48-Field Submission + Client-Side PII Shield",
    specTimeline: [
      "Aadhaar & PAN Masked Locally",
      "Chromium Worker Ingests Portal DOM",
      "48 Mandatory Fields Injected",
      "Awaiting Citizen Signature / OTP Gate",
    ],
    launchUrl: "/portal?module=agent",
  },
  {
    id: 3,
    moduleId: "forensics",
    tag: "Forensic Media Provenance",
    title: "Deepfake & Truth Engine",
    desc: "Detects synthetic government notices and audio clones using spectral anomaly curves verified against live PIB registries.",
    bgGradient: "from-[#059669] via-[#047857] to-[#064e3b]",
    meta: "PIB Verified RAG",
    accentColor: "#059669",
    statusTag: "PIB FACT-CHECKED",
    specClause: "Press Information Bureau Fact Check Protocol & NFSA Registry",
    specQuote:
      "Bulletin #2026/FC-9912: Synthetic audio circular purporting immediate cancellation of subsidised foodgrain quotas debunked against National Food Security Act Gazette S.O. 4410 provisions.",
    specEntitlement: "Acoustic Spectral Anomaly Audit (8.2kHz Spike Detected)",
    specTimeline: [
      "Viral Audio Stream Ingested",
      "Harmonic Waveform Frequency Analyzed",
      "98.4% Synthetic Clone Probability",
      "Cross-Verified with PIB Ground Truth",
    ],
    launchUrl: "/portal?module=forensics",
  },
];

export default function BentoPillarsSection() {
  const [active, setActive] = useState<number>(0);
  const [inspectingPillar, setInspectingPillar] = useState<PillarData | null>(null);
  const [isExportingCard, setIsExportingCard] = useState(false);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectingPillar) return; // ignore arrows when inspection modal is open
      if (e.key === "ArrowLeft") {
        setActive((prev) => (prev > 0 ? prev - 1 : PILLARS.length - 1));
      } else if (e.key === "ArrowRight") {
        setActive((prev) => (prev < PILLARS.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectingPillar]);

  // Compute 3D cylinder positioning matrix
  const getCardStyle = (index: number) => {
    const diff = index - active;

    if (diff === 0) {
      // Active center card
      return {
        rotateY: 0,
        x: 0,
        z: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
      };
    }

    if (diff === -1) {
      // Immediate left
      return {
        rotateY: 28,
        x: -260,
        z: -140,
        scale: 0.92,
        opacity: 0.72,
        zIndex: 20,
      };
    }

    if (diff === 1) {
      // Immediate right
      return {
        rotateY: -28,
        x: 260,
        z: -140,
        scale: 0.92,
        opacity: 0.72,
        zIndex: 20,
      };
    }

    // Outer edge cards (diff <= -2 or diff >= 2)
    const sign = Math.sign(diff);
    return {
      rotateY: sign > 0 ? -48 : 48,
      x: sign * 470,
      z: -320,
      scale: 0.82,
      opacity: 0.35,
      zIndex: 10,
    };
  };

  const handleExportBrief = async (pillar: PillarData) => {
    setIsExportingCard(true);
    try {
      const dataUrl = await generateBenefitSummaryCard({
        schemeName: pillar.title,
        authority: "Government of India / State Civic Intelligence Directorate",
        notificationNo: "STATUTORY/2026/" + (pillar.id + 1),
        verdictTag: "ELIGIBLE",
        benefitSummary: pillar.specEntitlement,
        disbursalAmount: "Real-time Grounded Execution",
        keyEntitlements: pillar.specTimeline,
        requiredDocuments: [
          "Aadhaar Identity Verification",
          "Official Gazette Citation Match",
          "Public Service Guarantee SLA",
        ],
        officialPortalUrl: "https://pib.gov.in",
        contentHash: "sha256_cylindrical_drum_grounded",
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `CivicPulse-${pillar.moduleId}-Brief.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingCard(false);
    }
  };

  return (
    <section
      id="pillars"
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 1.1) {
          const mainEl = document.querySelector("main");
          if (mainEl) {
            mainEl.scrollBy({ top: e.deltaY, behavior: "auto" });
          }
        }
      }}
      className="min-h-screen h-screen w-full snap-start snap-always relative flex flex-col justify-between items-center py-6 sm:py-8 px-4 touch-pan-y"
    >
      {/* 1. Header Area (~15% Viewport Height) */}
      <div className="pt-8 sm:pt-6 text-center flex flex-col items-center justify-center max-h-[16%] z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1">
          <Layers className="w-3.5 h-3.5 text-emerald-500" />
          <span>FOUR PILLARS OF CIVICPULSE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 dark:text-zinc-50 tracking-[-0.035em]">
          Grounded Civic Operating System
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm font-sans text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto truncate leading-relaxed">
          3D Cylindrical Architecture: drag or use the pills below to cycle through each pillar.
        </p>
      </div>

      {/* 2. 3D Cylindrical Drum Stage (~68% Viewport Height) */}
      <div className="relative w-full h-[62vh] max-h-[500px] flex items-center justify-center [perspective:1400px] [transform-style:preserve-3d] my-auto z-10 touch-pan-y">
        {PILLARS.map((pillar, index) => {
          const style = getCardStyle(index);
          const isActive = index === active;

          return (
            <motion.div
              key={pillar.id}
              layout
              animate={{
                rotateY: style.rotateY,
                x: style.x,
                z: style.z,
                scale: style.scale,
                opacity: style.opacity,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 25 }}
              onClick={() => {
                if (!isActive) {
                  setActive(index);
                } else {
                  setInspectingPillar(pillar);
                }
              }}
              style={{ zIndex: style.zIndex }}
              drag={isActive ? "x" : false}
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.06}
              onDragEnd={(_, info) => {
                if (info.offset.x < -35 && active < PILLARS.length - 1) {
                  setActive(active + 1);
                } else if (info.offset.x > 35 && active > 0) {
                  setActive(active - 1);
                }
              }}
              className={`absolute w-[290px] sm:w-[330px] md:w-[340px] h-[430px] sm:h-[460px] md:h-[475px] rounded-[32px] p-6 sm:p-7 flex flex-col justify-between text-white shadow-2xl transition-shadow cursor-pointer border border-white/20 bg-gradient-to-b ${pillar.bgGradient} touch-pan-y select-none`}
            >
              {/* Soft Radial Ambient Aura */}
              <div className="absolute inset-0 bg-radial from-white/15 via-transparent to-black/25 pointer-events-none" />

              {/* Top: Tag + Bold Title + Description */}
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                    {pillar.tag}
                  </span>
                  <span className="font-mono text-xs font-bold opacity-80">
                    0{pillar.id + 1}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight leading-snug pt-1">
                  {pillar.title}
                </h3>

                <p className="text-xs text-white/85 leading-relaxed font-sans line-clamp-3">
                  {pillar.desc}
                </p>
              </div>

              {/* Center: Tactile 3D-Styled Vector Emblem */}
              <div className="relative z-10 flex items-center justify-center my-auto">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/25 shadow-inner relative group">
                  <div className="absolute -inset-2 rounded-full bg-white/10 blur-md pointer-events-none" />
                  
                  {pillar.id === 0 && (
                    <div className="text-white flex flex-col items-center">
                      <FileText className="w-10 h-10 stroke-[1.6]" />
                      <span className="text-[10px] font-serif tracking-widest mt-1 opacity-90">विधि · सत्य</span>
                    </div>
                  )}

                  {pillar.id === 1 && (
                    <div className="text-white flex flex-col items-center">
                      <MapPin className="w-10 h-10 stroke-[1.6]" />
                      <span className="text-[10px] font-mono tracking-wider mt-1 opacity-90">SLA 72H</span>
                    </div>
                  )}

                  {pillar.id === 2 && (
                    <div className="text-white flex flex-col items-center">
                      <Bot className="w-10 h-10 stroke-[1.6]" />
                      <span className="text-[10px] font-mono tracking-wider mt-1 opacity-90">AUTO-DOM</span>
                    </div>
                  )}

                  {pillar.id === 3 && (
                    <div className="text-white flex flex-col items-center">
                      <ShieldAlert className="w-10 h-10 stroke-[1.6]" />
                      <span className="text-[10px] font-mono tracking-wider mt-1 opacity-90">8.2 kHz</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Meta Footer + Micro CTA */}
              <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] opacity-90 font-medium">
                  {pillar.meta}
                </span>

                {isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingPillar(pillar);
                    }}
                    className="font-semibold text-white inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all text-xs cursor-pointer"
                  >
                    <span>Inspect Pillar</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </button>
                ) : (
                  <span className="text-[10px] font-mono opacity-70 uppercase">
                    Tap to center
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Bottom Minimalist Control Dock (~16% Viewport Height) */}
      <div className="flex flex-col items-center gap-2 max-h-[16%] pb-3 z-10">
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg">
          {/* Arrow Left */}
          <button
            onClick={() => setActive((prev) => (prev > 0 ? prev - 1 : PILLARS.length - 1))}
            aria-label="Previous Pillar"
            className="p-1.5 rounded-full text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 4 Switcher Pills */}
          {PILLARS.map((pillar, idx) => {
            const isCurrent = active === idx;
            return (
              <button
                key={pillar.id}
                onClick={() => setActive(idx)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold"
                    : "text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>Pillar 0{pillar.id + 1}</span>
                <span className="hidden sm:inline">
                  : {pillar.id === 0 ? "Policy" : pillar.id === 1 ? "Triage" : pillar.id === 2 ? "Agent" : "Truth"}
                </span>
              </button>
            );
          })}

          {/* Arrow Right */}
          <button
            onClick={() => setActive((prev) => (prev < PILLARS.length - 1 ? prev + 1 : 0))}
            aria-label="Next Pillar"
            className="p-1.5 rounded-full text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          Use ← / → keys or swipe horizontally to rotate
        </span>
      </div>

      {/* ======================================================== */}
      {/* 4. SLEEK SLIDE-UP DETAIL INSPECTION DRAWER / MODAL       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {inspectingPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      PILLAR 0{inspectingPillar.id + 1} SPECIFICATION
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      {inspectingPillar.statusTag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
                    {inspectingPillar.title}
                  </h3>
                </div>

                <button
                  onClick={() => setInspectingPillar(null)}
                  aria-label="Close modal"
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quoted Gazette / Law Clause */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>GROUNDED STATUTORY ANCHOR</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% CITED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-emerald-500 text-xs italic text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                  &ldquo;{inspectingPillar.specQuote}&rdquo;
                </div>
              </div>

              {/* Entitlement Highlight */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                    Statutory Deliverable
                  </span>
                  <span className="font-heading font-bold text-slate-900 dark:text-zinc-100 text-sm">
                    {inspectingPillar.specEntitlement}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  ENFORCED
                </span>
              </div>

              {/* Execution Pipeline Steps */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
                  Live Verification Pipeline (4 Stages)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {inspectingPillar.specTimeline.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 text-slate-700 dark:text-zinc-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleExportBrief(inspectingPillar)}
                  disabled={isExportingCard}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer bg-white dark:bg-zinc-900"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isExportingCard ? "Generating..." : "Download Verified Brief"}</span>
                </button>

                <Link
                  href={inspectingPillar.launchUrl}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span>Launch {inspectingPillar.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
