"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Workflow,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Volume2,
  FileCheck2,
  ShieldCheck,
  Building,
} from "lucide-react";

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Ingestion & Document Hierarchy",
    subtitle: "OCR & Gazette Parsing",
    icon: FileText,
    badge: "PyMuPDF · Trafilatura",
    description:
      "Continuous ingestion of official State and Central Gazettes, PIB bulletins, and ministry circulars. Formats parsed into structured DocumentModels with cryptographic hash tracking.",
    highlight: "Scanned PDFs · Gazette URLs · RSS Feeds",
    metrics: "100% Ingest Integrity",
  },
  {
    step: "02",
    title: "Deterministic Policy RAG",
    subtitle: "Clause & Threshold Extraction",
    icon: Workflow,
    badge: "Deterministic Rules",
    description:
      "Precise extraction of statutory welfare criteria: income caps, age brackets, domicile stipulations, and required certification with exact clause passage citations.",
    highlight: "Clause 14(a) · Section 9 MSMED · PM-Kisan",
    metrics: "≤ 25 Words / Quote Cap",
  },
  {
    step: "03",
    title: "Multilingual Voice & Plain Translation",
    subtitle: "Zero-Jargon Citizen Speech",
    icon: Globe2,
    badge: "Sarvam AI STT/TTS",
    description:
      "Transforms impenetrable bureaucratic legalese into clear spoken and written regional dialects. Voice synthesis enables accessible communication across India's language landscape.",
    highlight: "Hindi · Bengali · Tamil · Telugu · Marathi",
    metrics: "12 Regional Dialects",
  },
  {
    step: "04",
    title: "Real-Time Eligibility Matching",
    subtitle: "Citizen Attribute Matrix",
    icon: CheckCircle2,
    badge: "Rule Evaluator",
    description:
      "Matches citizen demographic inputs against statutory rule criteria to produce unambiguous eligibility determinations, exact monetary grant sums, and sequential filing paths.",
    highlight: "Income Check · Domicile Match · Category",
    metrics: "Zero Guessed Data",
  },
];

export default function GazettePipelineSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      id="pipeline"
      className="h-screen max-h-screen w-full snap-start snap-always relative overflow-hidden flex flex-col justify-between px-6 md:px-14 py-8 select-none"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-cyan-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Top Header (~16% of Viewport) */}
      <div className="pt-14 sm:pt-12 text-center flex flex-col items-center justify-center max-h-[18%]">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-1">
          <Workflow className="w-3.5 h-3.5 text-emerald-500" />
          <span>STATUTORY GROUNDING PIPELINE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
          The 4-Step Gazette-to-Citizen Pipeline
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
          An auditable, end-to-end framework transforming dense bureaucratic legal notifications into verified citizen entitlements.
        </p>
      </div>

      {/* 4-Step Responsive Pipeline Cards (~78% of Viewport) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full max-w-6xl mx-auto h-[78%] max-h-[560px] my-auto">
        {PIPELINE_STEPS.map((stepItem, idx) => {
          const Icon = stepItem.icon;
          const isSelected = activeStep === idx;
          return (
            <motion.div
              key={stepItem.step}
              onClick={() => setActiveStep(idx)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-md ${
                isSelected
                  ? "border-emerald-500 bg-white dark:bg-zinc-900 ring-2 ring-emerald-500/20"
                  : "border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                {/* Step Top Meta */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                      {stepItem.subtitle}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                    {stepItem.badge}
                  </span>
                </div>

                {/* Step Title & Icon */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 leading-snug">
                    {stepItem.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-2 line-clamp-4">
                  {stepItem.description}
                </p>

                {/* Highlight Badge */}
                <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {stepItem.highlight}
                </div>
              </div>

              {/* Step Footer Metric */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Verification State</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {stepItem.metrics}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}

