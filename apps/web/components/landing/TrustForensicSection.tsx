"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Database,
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Fingerprint,
} from "lucide-react";

export default function TrustForensicSection() {
  const [activeTrustTab, setActiveTrustTab] = useState<"spectral" | "pii" | "provenance">("spectral");

  return (
    <section
      id="trust"
      className="h-screen min-h-screen max-h-screen w-full relative overflow-hidden flex flex-col justify-center items-center px-6 md:px-16 snap-start snap-always select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Strict 100vh Layout Container */}
      <div className="h-full max-h-[92vh] pt-20 pb-4 flex flex-col justify-between w-full max-w-6xl mx-auto z-10">
        
        {/* Top Header (~20%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center justify-center max-h-[22%]"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FORENSIC VERIFICATION &amp; PII INTEGRITY</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Citizen Trust &amp; Verification Provenance
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Neutralizing synthetic disinformation and safeguarding citizen identity at the edge.
          </p>

          {/* Sub-Tabs */}
          <div className="mt-2.5 flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTrustTab("spectral")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeTrustTab === "spectral"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Spectral Voice Audit
            </button>
            <button
              onClick={() => setActiveTrustTab("pii")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeTrustTab === "pii"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Edge PII Redaction
            </button>
            <button
              onClick={() => setActiveTrustTab("provenance")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeTrustTab === "provenance"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Gazette Provenance
            </button>
          </div>
        </motion.div>

        {/* Dynamic Card Body (~76% of Viewport) */}
        <motion.div
          key={activeTrustTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="h-[62vh] max-h-[500px] w-full max-w-5xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
        >
          {/* TAB 1: Spectral Deepfake Audit */}
          {activeTrustTab === "spectral" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-mono text-rose-500 font-bold">
                    ACOUSTIC DEEPFAKE SCANNER &middot; SARVAM / WAV2VEC
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 font-bold">
                    98.4% Synthetic Voice Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Waveform Visualization */}
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs">
                    <span className="text-[10px] text-zinc-400 block mb-2">
                      Spectral Harmonic Anomaly Detection:
                    </span>
                    <div className="h-24 flex items-end justify-between gap-1 px-1 bg-zinc-900/80 rounded border border-zinc-800">
                      {[40, 80, 95, 20, 90, 50, 85, 30, 60, 100, 75, 40, 90, 65, 30, 85, 45, 95, 70, 35].map(
                        (h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-full rounded-xs transition-all ${
                              h > 70 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                        )
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Low Freq: Normal</span>
                      <span className="text-rose-400 font-bold">High Freq: Vocoder Artifacts</span>
                    </div>
                  </div>

                  {/* FactCheck Result */}
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                      <span className="font-bold block text-xs">
                        Refutation Record: PIB Fact Check #FC-2026-401
                      </span>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        Viral audio claiming ₹75,000 festival payout to Jan Dhan accounts is a malicious deepfake vector intended to harvest Aadhaar OTP credentials.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 text-slate-700 dark:text-zinc-300">
                      <span className="font-bold text-[11px] block">Public Safety Directives:</span>
                      <ul className="mt-1 space-y-1 text-[10px] list-disc list-inside text-zinc-500">
                        <li>Do not click SMS or WhatsApp confirmation URLs</li>
                        <li>Government benefits are disbursed solely via DBT PFMS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Real-Time Neural Audio Classification</span>
                <span className="text-emerald-500 font-semibold">Strict Zero Fake Schemes Policy</span>
              </div>
            </div>
          )}

          {/* TAB 2: Edge PII Redaction */}
          {activeTrustTab === "pii" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    EDGE DETERMINISTIC ANONYMIZATION PIPELINE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    0ms Retention
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70">
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">STAGE 1: RAW INGEST</span>
                    <p className="font-mono text-[11px] text-red-500 line-through">
                      &ldquo;Aadhaar: 4920 1823 9012, Phone: 98101XXXXX&rdquo;
                    </p>
                    <p className="mt-2 text-[10px] text-zinc-500">
                      Raw citizen input containing sensitive identifiers intercepted at edge gateway.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                    <span className="text-[10px] font-mono block mb-1 font-bold">STAGE 2: TOKENIZATION</span>
                    <p className="font-mono text-[11px]">
                      &ldquo;[CITIZEN_UID_HASH_A8] [TELECOM_MASK]&rdquo;
                    </p>
                    <p className="mt-2 text-[10px]">
                      Deterministic hashing replaces PII with ephemeral non-reversible session tokens.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                    <span className="text-[10px] font-mono block mb-1 font-bold">STAGE 3: CLEAN PROMPT</span>
                    <p className="font-mono text-[11px]">
                      &ldquo;Eligible student in Bihar, income ₹2.5L&rdquo;
                    </p>
                    <p className="mt-2 text-[10px]">
                      Zero sensitive parameters ever sent to LLM runtime or external servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Compliant with Digital Personal Data Protection (DPDP) Act</span>
                <span className="text-emerald-500 font-semibold">Local Deterministic Scrubbing</span>
              </div>
            </div>
          )}

          {/* TAB 3: Gazette Provenance */}
          {activeTrustTab === "provenance" && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    OFFICIAL DATASET PROVENANCE REGISTRY
                  </span>
                  <span className="text-xs text-zinc-500">SHA-256 Verified Feed</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        Press Information Bureau (PIB)
                      </span>
                      <span className="text-[10px] text-zinc-500">pib.gov.in &middot; RSS / Press Release Crawler</span>
                    </div>
                    <span className="text-emerald-500 text-[11px] font-bold">SYNC: LIVE</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        India Code Digital Acts
                      </span>
                      <span className="text-[10px] text-zinc-500">indiacode.nic.in &middot; Central &amp; State Legislative Circulars</span>
                    </div>
                    <span className="text-emerald-500 text-[11px] font-bold">SYNC: LIVE</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        myScheme National Portal
                      </span>
                      <span className="text-[10px] text-zinc-500">myscheme.gov.in &middot; MeitY Central Repository</span>
                    </div>
                    <span className="text-emerald-500 text-[11px] font-bold">SYNC: LIVE</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Cryptographic Hash Tracking</span>
                <span className="text-indigo-500 font-semibold">Immutable Audit Trail</span>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}

