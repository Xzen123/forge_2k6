"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Share2,
  ExternalLink,
  GitBranch,
  Mic,
  Video,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  auditClaimProvenance,
  ProvenanceAuditResult,
} from "@/lib/provenance-graph";

export default function ForensicInspector() {
  const [claimInput, setClaimInput] = useState<string>(
    "Viral WhatsApp Video: 'Govt deposits ₹10,000 in all Jan Dhan bank accounts without application'"
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<ProvenanceAuditResult | null>(null);

  // Initialize with Jan Dhan audit on mount
  React.useEffect(() => {
    auditClaimProvenance(claimInput).then(setAuditResult);
  }, []);

  const handleRunAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuditing(true);
    setTimeout(() => {
      auditClaimProvenance(claimInput).then((res) => {
        setAuditResult(res);
        setIsAuditing(false);
      });
    }, 700);
  };

  const handleSelectSample = (sample: string) => {
    setClaimInput(sample);
    setIsAuditing(true);
    setTimeout(() => {
      auditClaimProvenance(sample).then((res) => {
        setAuditResult(res);
        setIsAuditing(false);
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Forensic Claim Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                PILLAR 4: FORENSIC TRUTH ENGINE
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                PIB Fact Check Registry + Gazette Cross-Diff
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
              Multimodal Media Analyzer & Disinformation Provenance
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Paste a viral claim, broadcast quote, or video URL to inspect synthetic neural artifacts and track debunking gazettes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full self-start sm:self-center">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Threat Level: HIGH (Deepfake Influx)</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRunAudit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value)}
              placeholder="Paste viral claim, YouTube/WhatsApp video URL, or circular rumor..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs sm:text-sm font-sans text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 pr-28"
            />
            <button
              type="submit"
              disabled={isAuditing}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAuditing ? (
                <span>Auditing...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Audit Claim</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">Quick Test:</span>
            <button
              type="button"
              onClick={() =>
                handleSelectSample(
                  "Viral WhatsApp Video: 'Govt deposits ₹10,000 in all Jan Dhan bank accounts without application'"
                )
              }
              className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-[11px] text-slate-700 dark:text-zinc-300 hover:border-rose-500 transition-colors"
            >
              Jan Dhan ₹10,000 Video Rumor
            </button>
            <button
              type="button"
              onClick={() =>
                handleSelectSample(
                  "Audio Speech Cloned: Chief Minister purportedly announcing sudden cancellation of agricultural ration quota"
                )
              }
              className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-[11px] text-slate-700 dark:text-zinc-300 hover:border-rose-500 transition-colors"
            >
              CM Cloned Voice on Food Quota
            </button>
          </div>
        </form>
      </div>

      {/* Forensic Signal Telemetry & Verdict Grid */}
      {auditResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Verdict Card */}
          <div className="md:col-span-1 rounded-2xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/20 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold uppercase">
                  FORENSIC VERDICT
                </span>
                <span className="text-slate-500 dark:text-zinc-400">{auditResult.claimId}</span>
              </div>

              <div className="flex items-center gap-2">
                <XCircle className="w-7 h-7 text-rose-500" />
                <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {auditResult.verdict}
                </h4>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-400">Risk Score:</span>
                  <span className="font-bold text-rose-500">{auditResult.riskScore} / 10.0</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-400">Neural Synthesis Conf:</span>
                  <span className="font-bold text-rose-500">{auditResult.neuralConfidence}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-rose-500/20 mt-4 text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
              <strong>Official Warning:</strong> High probability of deliberate civic disinformation targeting direct benefit recipients.
            </div>
          </div>

          {/* Forensic Signal Metrics */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono uppercase">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                Multimodal Synthetic Signal Breakdown
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                Spectrogram &amp; GAN Classifier Active
              </span>
            </div>

            {/* Signal 1: Visual Artifact Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 dark:text-zinc-300">Visual Artifact / Lip-Sync Divergence Score</span>
                <span className="font-bold text-rose-500">{auditResult.visualArtifactScore}% (CRITICAL)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${auditResult.visualArtifactScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                GAN boundary blur detected around facial perimeter; eye-blink frequency is non-biological (0.12Hz).
              </p>
            </div>

            {/* Signal 2: Audio Spectral Consistency */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-slate-700 dark:text-zinc-300">Audio Spectral Consistency</span>
                <span className="font-bold text-amber-500">{auditResult.audioSpectralConsistency}% (DEGRADED)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${auditResult.audioSpectralConsistency}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                Zero ambient room reverberation; synthetic vocoder frequency cutoffs identified at 8.2 kHz harmonic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Official Registry Rebuttal & Provenance Node Tree */}
      {auditResult && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 space-y-4 shadow-sm">
          {/* Rebuttal Box */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                OFFICIAL REBUTTAL: {auditResult.officialDebunkSource.authority}
              </span>
              <a
                href={auditResult.officialDebunkSource.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>View Official Gazette</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-sans">
              &ldquo;{auditResult.officialDebunkSource.rebuttalText}&rdquo;
            </p>
            <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 pt-1">
              Bulletin Ref: {auditResult.officialDebunkSource.bulletinId} · Statutory Link: {auditResult.officialDebunkSource.gazetteRef}
            </div>
          </div>

          {/* Visual Provenance Timeline Node Tree */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <span>Disinformation Provenance Timeline (Origin to Official Debunk)</span>
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
              {auditResult.provenanceChain.map((node, idx) => (
                <div key={node.id} className="relative group text-xs">
                  {/* Dot */}
                  <span
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                      node.isDebunk
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-rose-500 bg-white dark:bg-zinc-950"
                    }`}
                  />

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                        {node.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                        {node.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium">
                      Source: {node.sourceName}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {node.details}
                    </p>
                    {node.evidenceUrl && (
                      <a
                        href={node.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono pt-1"
                      >
                        <span>Official Evidence Gazette</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

