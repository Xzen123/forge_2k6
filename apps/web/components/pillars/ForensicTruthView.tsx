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
  FileCheck,
} from "lucide-react";

interface MisinfoTicker {
  id: string;
  claim: string;
  verdict: "FABRICATED" | "MISLEADING" | "VERIFIED OFFICIAL";
  riskScore: number;
  sourceOrigin: string;
  detectedAt: string;
}

const LIVE_TICKERS: MisinfoTicker[] = [
  {
    id: "DEEP-902",
    claim: "Viral WhatsApp Video: 'Govt deposits ₹10,000 in all Jan Dhan bank accounts without application'",
    verdict: "FABRICATED",
    riskScore: 9.8,
    sourceOrigin: "WhatsApp Broadcast Cluster (Origin: Telegram Channel)",
    detectedAt: "8 mins ago",
  },
  {
    id: "DEEP-899",
    claim: "Audio Speech Cloned: Chief Minister purportedly announcing sudden cancellation of agricultural ration quota",
    verdict: "FABRICATED",
    riskScore: 9.4,
    sourceOrigin: "X / Twitter Viral Audio Clip",
    detectedAt: "32 mins ago",
  },
  {
    id: "DEEP-891",
    claim: "Circular Claim: Mandatory fee waiver for OBC post-matric students across all state colleges",
    verdict: "VERIFIED OFFICIAL",
    riskScore: 1.2,
    sourceOrigin: "PIB Gazette Release S.O. 1402(E)",
    detectedAt: "1 hour ago",
  },
];

export default function ForensicTruthView() {
  const [claimInput, setClaimInput] = useState<string>(
    "Viral WhatsApp Video: Govt announced ₹10,000 cash transfer for every citizen"
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditComplete, setAuditComplete] = useState<boolean>(true);

  const handleAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Pillar 4
            </span>
            <span className="text-xs font-mono text-zinc-500">Forensic Provenance & Neural Disinformation Audit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Forensic Truth & Deepfake Audit Engine
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Continuous threat ticker across broadcast feeds, neural synthetic artifact scoring, and official gazette cross-verification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-full self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Active Misinfo Level: HIGH (2 Critical Threats)</span>
        </div>
      </div>

      {/* Live Misinformation Threat Ticker */}
      <div className="civic-panel rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
              Live Misinformation Threat Ticker (Ingesting Social & Broadcast Feeds)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Refreshed real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LIVE_TICKERS.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border text-left space-y-2 transition-all ${
                t.verdict === "FABRICATED"
                  ? "bg-rose-950/20 border-rose-500/30"
                  : "bg-emerald-950/20 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">{t.id}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    t.verdict === "FABRICATED"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {t.verdict}
                </span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed">{t.claim}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-900">
                <span className="truncate max-w-[70%]">{t.sourceOrigin}</span>
                <span>{t.detectedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Inspection Terminal */}
      <div className="civic-panel rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Inspect Viral Claim or Deepfake Artifact
          </span>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                placeholder="Paste viral video URL, claim text, or press snippet to audit..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
              />
            </div>
            <button
              onClick={handleAudit}
              disabled={isAuditing}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isAuditing ? "Auditing Neural Signatures..." : "Run Forensic Audit"}</span>
            </button>
          </div>
        </div>

        {/* Forensic Breakdown Cards */}
        {auditComplete && (
          <div className="space-y-6 pt-2 border-t border-zinc-800">
            {/* Top Verdict Banner */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Forensic Verdict: SYNTHETIC DEEPFAKE CLOUD</h3>
                  <p className="text-xs text-rose-300">
                    High-confidence AI clone with zero matching official gazette circular or government press notification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500 text-zinc-950">
                  Risk Score: 9.8 / 10 (Critical)
                </span>
              </div>
            </div>

            {/* 3 Forensic Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Visual Artifact Score */}
              <div className="civic-card rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span>Visual Artifact Score</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">97.2% GAN</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
                  <div className="flex justify-between">
                    <span>Face-Swap Boundary:</span>
                    <span className="text-rose-400">Anomalous (12px seam)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lip Sync Consistency:</span>
                    <span className="text-rose-400">Desynced (-140ms)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blink Rate Frequency:</span>
                    <span className="text-rose-400">0.02 Hz (Unnatural)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Audio Spectral Authenticity */}
              <div className="civic-card rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Audio Spectral Authenticity</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">98.2% Synthetic</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
                  <div className="flex justify-between">
                    <span>Voice Clone Fingerprint:</span>
                    <span className="text-rose-400">ElevenLabs Architecture</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formant Harmonics:</span>
                    <span className="text-rose-400">Phase Incoherence</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Background Room Tone:</span>
                    <span className="text-rose-400">Artificially Silent</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Source Provenance Graph */}
              <div className="civic-card rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span>Source Provenance Graph</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">Cluster: 14 Nodes</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
                  <div className="flex justify-between">
                    <span>First Seen:</span>
                    <span className="text-zinc-200">2026-10-30 22:14 UTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Origin Node:</span>
                    <span className="text-cyan-400">Telegram Bot Farm #8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amplification Velocity:</span>
                    <span className="text-rose-400">1,820 shares / min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Fact Consensus Side-by-Side Badge */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Official Gazette & Press Bureau Consensus
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">PIB Fact Check Link Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <span className="font-bold text-rose-300">Viral Fabricated Claim:</span>
                  <p className="text-zinc-300 font-mono text-[11px]">
                    "Finance Ministry announces instant direct transfer of ₹10,000 to bank accounts under Jan Dhan Yojana."
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-300">Official Government Reality:</span>
                  <p className="text-zinc-300 font-mono text-[11px]">
                    PIB Press Release Ref 2026/0912: No such cash grant has been authorized. The video is a synthetic voice clone. All legitimate welfare transfers occur strictly through Aadhaar Direct Benefit Transfer (DBT).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

