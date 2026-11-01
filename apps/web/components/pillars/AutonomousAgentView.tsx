"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  Pause,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  targetPortal: string;
  portalUrl: string;
  status: "idle" | "running" | "awaiting_otp" | "completed";
  progressStep: number;
  totalFields: number;
  piiMaskedCount: number;
}

const AVAILABLE_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "National Scholarship Renewal & Tuition Remission",
    targetPortal: "National Scholarship Portal (NSP 2.0)",
    portalUrl: "https://scholarships.gov.in",
    status: "awaiting_otp",
    progressStep: 3,
    totalFields: 48,
    piiMaskedCount: 14,
  },
  {
    id: "wf-2",
    name: "PM-Kisan Land Holding Direct Benefit Verification",
    targetPortal: "PM-Kisan Agri-Stack Registry",
    portalUrl: "https://pmkisan.gov.in",
    status: "running",
    progressStep: 2,
    totalFields: 26,
    piiMaskedCount: 8,
  },
  {
    id: "wf-3",
    name: "MSME Udyam Registration & Tax Clearance Filing",
    targetPortal: "Udyam Ministry Portal",
    portalUrl: "https://udyamregistration.gov.in",
    status: "completed",
    progressStep: 4,
    totalFields: 62,
    piiMaskedCount: 22,
  },
];

export default function AutonomousAgentView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(AVAILABLE_WORKFLOWS[0]);
  const [otpInput, setOtpInput] = useState<string>("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState<boolean>(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    "2026-10-31T00:15:02Z [HEADLESS-WORKER-09] Spawning isolated Chromium sandboxed container...",
    "2026-10-31T00:15:03Z [NETWORK] Connected to portal endpoint: scholarships.gov.in/auth/login",
    "2026-10-31T00:15:04Z [SSI-VALIDATION] Verified citizen DID cryptographic signature (ZK-Tier 1)",
    "2026-10-31T00:15:05Z [CAPTCHA-SOLVER] Resolved visual distractor challenge via neural OCR in 410ms",
    "2026-10-31T00:15:06Z [FORM-AUTOFILL] Injecting 48 verified profile attributes into DOM elements...",
    "2026-10-31T00:15:07Z [PII-GUARD] Redacted [AADHAAR_XXXX_1042] and [PAN_XXXXX910A] in audit telemetry",
    "2026-10-31T00:15:08Z [AWAITING-HUMAN-SIGNOFF] Server issued SMS OTP challenge to citizen device",
  ]);

  const steps = [
    { label: "Identity Verified (SSI)", status: "done" },
    { label: "Captcha Solved", status: "done" },
    { label: "Autofilling 48 Fields", status: "done" },
    { label: "Human OTP Sign-off", status: isOtpSubmitted ? "done" : "current" },
    { label: "Final Submission Sealed", status: isOtpSubmitted ? "done" : "pending" },
  ];

  const handleVerifyOtp = () => {
    if (!otpInput) return;
    setIsOtpSubmitted(true);
    setLiveLogs((prev) => [
      ...prev,
      `2026-10-31T00:15:19Z [HUMAN-SIGNOFF] Citizen provided OTP token [****]. Submitting payload...`,
      `2026-10-31T00:15:20Z [SUBMISSION-ACK] Form acknowledged by portal. Ref: NSP/2026/8940219. Sealed.`,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Pillar 3
            </span>
            <span className="text-xs font-mono text-zinc-500">Autonomous Headless Execution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Autonomous Bureaucracy Execution Agent
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Mission control dashboard executing automated form-filling, legacy portal interactions, and ZK-PII masked submissions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full self-start sm:self-center">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Headless Playwright Sandbox: Operational</span>
        </div>
      </div>

      {/* Main Split Layout: Active Workflows + Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: Active Workflows Selector */}
        <div className="space-y-4">
          <div className="civic-panel rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Active Bureaucracy Runs
              </span>
              <span className="text-[10px] font-mono text-zinc-500 font-bold">3 Workflows</span>
            </div>

            <div className="space-y-2.5">
              {AVAILABLE_WORKFLOWS.map((wf) => {
                const isSelected = selectedWorkflow.id === wf.id;
                return (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                      isSelected
                        ? "bg-zinc-800 border-cyan-500/50 shadow-sm"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {wf.targetPortal}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          wf.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : wf.status === "awaiting_otp"
                            ? "bg-amber-500/10 text-amber-400 animate-pulse"
                            : "bg-cyan-500/10 text-cyan-400"
                        }`}
                      >
                        {wf.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">{wf.name}</h4>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                      <span>{wf.totalFields} form fields</span>
                      <span className="text-emerald-400">{wf.piiMaskedCount} ZK-masked</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Virtual Browser Execution Terminal & Stepper */}
        <div className="civic-panel rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Header of Active Workflow */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                TARGET: {selectedWorkflow.targetPortal}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedWorkflow.name}</h3>
            </div>
            <a
              href={selectedWorkflow.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono self-start sm:self-center"
            >
              <span>Verify Portal Target</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Stepper Pipeline */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Autonomous Agent Stepper:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {steps.map((st, i) => (
                <div
                  key={st.label}
                  className={`p-2 rounded-lg border text-center text-xs font-mono transition-all ${
                    st.status === "done"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                      : st.status === "current"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold animate-pulse"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                  }`}
                >
                  <span className="block text-[10px] text-zinc-500">Step {i + 1}</span>
                  <span className="truncate block mt-0.5">{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Virtual Browser Execution Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Virtual Headless Chromium Terminal Log
              </span>
              <span className="text-emerald-400 font-bold">Stream: LIVE 60fps</span>
            </div>

            <div className="h-56 overflow-y-auto p-3.5 rounded-xl bg-black border border-zinc-800/80 font-mono text-[11px] text-zinc-300 space-y-1.5 shadow-inner">
              {liveLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes("PII-GUARD")
                      ? "text-emerald-400"
                      : log.includes("AWAITING")
                      ? "text-amber-400"
                      : log.includes("SUBMISSION")
                      ? "text-cyan-400 font-bold"
                      : "text-zinc-400"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Action Center: Human-in-the-loop Sign-off */}
          {!isOtpSubmitted ? (
            <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Human-in-the-Loop Sign-off Required
                </span>
                <p className="text-[11px] text-zinc-400">
                  Government portal dispatched OTP to citizen's registered mobile ending in <strong className="text-white">...4092</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-36 tracking-widest text-center focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap"
                >
                  Authorize & Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">Autonomous Execution Completed & Receipt Generated (NSP/2026/8940219)</span>
              </div>
              <button className="px-3 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-[11px] hover:bg-zinc-800">
                Download Signed Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

