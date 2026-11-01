"use client";

import React from "react";
import {
  Layers,
  ArrowRight,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle,
  Radio,
  FileCheck,
  Globe,
} from "lucide-react";

export default function ArchitectureSection() {
  const layers = [
    {
      step: "01",
      title: "Live Government Ingestion",
      sub: "Official Gazette, PIB, India Code, myScheme",
      details:
        "Headless crawlers and RSS watchers monitor official press releases, circulars, and PDF gazettes with cryptographic hash verification.",
      badge: "HTTPX & Playwright",
    },
    {
      step: "02",
      title: "Deterministic Parsing & Chunking",
      sub: "PyMuPDF, Trafilatura, Pydantic V2",
      details:
        "Documents are parsed into typed SourceDocument instances and chunked with precise section numbers and semantic pgvector embeddings.",
      badge: "Postgres + pgvector",
    },
    {
      step: "03",
      title: "LangGraph Agentic Decision Graph",
      sub: "Rule-by-rule criteria evaluation",
      details:
        "Citizen queries undergo language identification, demographic extraction, deterministic rule matching, and missing-field interrogation.",
      badge: "LangGraph StateGraph",
    },
    {
      step: "04",
      title: "Passage Verification Guardrail",
      sub: "Zero hallucination guarantee",
      details:
        "Every factual claim is cross-verified against a fetched source passage (<= 25 words). Any unbacked statement is strictly dropped.",
      badge: "Strict Citation Guard",
    },
    {
      step: "05",
      title: "Regional Voice & Action Delivery",
      sub: "Sarvam AI STT/TTS & Playwright Runner",
      details:
        "Plain-language responses are synthesized in Hindi, Bengali, Tamil, etc., with one-click WhatsApp infographics or automated form completion.",
      badge: "Sarvam AI + Next.js",
    },
  ];

  return (
    <section id="architecture" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>SYSTEM TOPOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            End-to-End Pipeline Architecture
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            From raw state gazettes to verified citizen grants: how CivicPulse AI eliminates bureaucracy through deterministic intelligence.
          </p>
        </div>

        {/* Horizontal / Stacked Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {layers.map((layer, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    STAGE {layer.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                    {layer.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
                  {layer.title}
                </h3>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-3">
                  {layer.sub}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {layer.details}
                </p>
              </div>

              {index < layers.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 dark:text-zinc-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Standards Box */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Rule Enforcement: Shared Contracts in `/packages/knowledge/schemas.py`</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-zinc-400">
            <span>FastAPI Backend</span>
            <span>&middot;</span>
            <span>Next.js 16 App Router</span>
            <span>&middot;</span>
            <span>LangGraph Multi-Agent</span>
            <span>&middot;</span>
            <span>WCAG AAA Compliant</span>
          </div>
        </div>

      </div>
    </section>
  );
}

