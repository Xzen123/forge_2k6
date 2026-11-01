"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Globe2,
  Database,
  FileCheck2,
  Workflow,
  Zap,
} from "lucide-react";

export default function FeaturesTrust() {
  const features = [
    {
      icon: Database,
      title: "Grounded in Official Gazettes",
      description:
        "Every policy claim is derived from live gazette notifications, PIB bulletins, and India Code circulars. Zero synthetic data or hallucinations.",
      badge: "LIVE ETL",
    },
    {
      icon: Lock,
      title: "PII Redacted at the Edge",
      description:
        "Aadhaar numbers, biometric data, and personal identifiers are immediately scrubbed prior to any LLM prompt ingestion. Local deterministic tokenization.",
      badge: "ZERO RETENTION",
    },
    {
      icon: Workflow,
      title: "Deterministic Legal RAG",
      description:
        "Criteria rules evaluated one by one: age, domicile, income caps, and category match. Strict citation grounding: claims without exact quotes are dropped.",
      badge: "100% CITED",
    },
    {
      icon: Globe2,
      title: "12+ Regional Voice Dialects",
      description:
        "High-fidelity speech synthesis powered by Sarvam AI. Citizens can speak naturally in Hindi, Bengali, Tamil, Telugu, and more without typing barrier.",
      badge: "VOICE FIRST",
    },
    {
      icon: FileCheck2,
      title: "Open API & Civic Standard",
      description:
        "Built on OpenAPI 3.1 with structured JSON schemas (`SourceDocument`, `EligibilityRule`, `Criterion`, `Claim`). Easily embeddable by state departments.",
      badge: "OPEN STANDARDS",
    },
    {
      icon: Zap,
      title: "Resilient Offline Fallbacks",
      description:
        "Architected with graceful degradation. When upstream government databases lag or disconnect, cached gazette summaries and audit traces continue serving.",
      badge: "99.98% UPTIME",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border border-indigo-500/20 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>CIVIC INFRASTRUCTURE SPECIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            High-Trust Architecture for Public Intelligence
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Engineered to meet the highest standards of digital public goods, government accountability, and citizen privacy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Metric Banner */}
        <div className="mt-16 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
              Tested Against Government Policy Disinformation
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Passed 100% of adversarial factual verification test fixtures without hallucinated figures.
            </p>
          </div>
          <div className="flex items-center gap-6 font-mono text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">
                Passage Grounding
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-zinc-700" />
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                &le; 25
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">
                Words / Quote Cap
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-zinc-700" />
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                0ms
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase">
                PII Retention
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

