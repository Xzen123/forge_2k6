"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  Cpu,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import AgentApprovalModal from "@/components/agent-approval-modal";
import { sanitizeCitizenPayload } from "@/lib/pii-masker";

interface AgentStep {
  id: number;
  label: string;
  stageKey: "init" | "navigate" | "mapping" | "awaiting_approval" | "receipt";
  status: "pending" | "running" | "done";
  details: string;
}

export default function AgentTerminal() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    "2026-10-31T00:20:00.102Z [WORKER-DAEMON] Agent environment initialized. Sandbox container: chromium-124.0-headless",
    "2026-10-31T00:20:00.245Z [SECURITY] Zero-knowledge PII sanitizer engaged. Sensitive variables will be hashed.",
  ]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const rawCitizenData = {
    "Citizen Name": "Rahul Kumar Verma",
    "Aadhaar Number": "5482 9104 9041",
    "PAN Number": "ABCDE4821A",
    "Phone Number": "+91 98765 48910",
    "Parent Annual Income": "₹2,40,000",
    "Domicile State": "Bihar",
    "College Name": "Patna Science College",
    "Bank Account": "9812498214891",
  };

  const sanitized = sanitizeCitizenPayload(rawCitizenData);

  const STEPS: AgentStep[] = [
    {
      id: 1,
      label: "Session Init & Sandbox Setup",
      stageKey: "init",
      status: currentStepIndex > 0 ? "done" : currentStepIndex === 0 && isRunning ? "running" : "pending",
      details: "Spawning isolated Playwright worker node with TLS 1.3 certificate validation",
    },
    {
      id: 2,
      label: "Legacy Form Navigation",
      stageKey: "navigate",
      status: currentStepIndex > 1 ? "done" : currentStepIndex === 1 ? "running" : "pending",
      details: "Connecting to https://scholarships.gov.in/fresh-application-form.html",
    },
    {
      id: 3,
      label: "DOM Field Mapping & PII Masking",
      stageKey: "mapping",
      status: currentStepIndex > 2 ? "done" : currentStepIndex === 2 ? "running" : "pending",
      details: `Injecting 8 verified attributes. Redacted ${sanitized.totalRedacted} sensitive variables.`,
    },
    {
      id: 4,
      label: "Human-in-the-Loop Sign-Off",
      stageKey: "awaiting_approval",
      status: currentStepIndex > 3 ? "done" : currentStepIndex === 3 ? "running" : "pending",
      details: "Submission locked until citizen provides digital signature / OTP consent.",
    },
    {
      id: 5,
      label: "Official Receipt Sealed",
      stageKey: "receipt",
      status: currentStepIndex > 4 ? "done" : currentStepIndex === 4 ? "running" : "pending",
      details: "Cryptographic acknowledgement receipt generated from statutory portal.",
    },
  ];

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Step runner execution effect
  useEffect(() => {
    if (!isRunning) return;

    if (currentStepIndex === 0) {
      const t1 = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `2026-10-31T00:20:01.042Z [BROWSER] Spawned Chromium container (PID 48102) with anti-detect flags.`,
          `2026-10-31T00:20:01.520Z [SESSION] TLS Handshake verified with official gov server. HTTP/2.0 200 OK.`,
        ]);
        setCurrentStepIndex(1);
      }, 1200);
      return () => clearTimeout(t1);
    }

    if (currentStepIndex === 1) {
      const t2 = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `2026-10-31T00:20:02.115Z [DOM] Navigated to: https://scholarships.gov.in/portal/post-matric-form`,
          `2026-10-31T00:20:02.680Z [DOM] Detected legacy input form. 48 input nodes identified in DOM tree.`,
          `2026-10-31T00:20:02.940Z [OCR-CAPTCHA] Solving distractor captcha using neural OCR... Solved (8491) in 320ms.`,
        ]);
        setCurrentStepIndex(2);
      }, 1500);
      return () => clearTimeout(t2);
    }

    if (currentStepIndex === 2) {
      const t3 = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `2026-10-31T00:20:03.410Z [AUTOFILL] Mapped field input#applicant_name -> "${sanitized.sanitizedPayload["Citizen Name"]}"`,
          `2026-10-31T00:20:03.780Z [PII-SHIELD] Redacted raw Aadhaar [${rawCitizenData["Aadhaar Number"]}] -> Masked as [${sanitized.sanitizedPayload["Aadhaar Number"]}] (Proof Hash: ${sanitized.redactedFields[1]?.hashDigest})`,
          `2026-10-31T00:20:04.102Z [AUTOFILL] Injected bank account, income threshold (<= ₹3L), and college affiliation.`,
          `2026-10-31T00:20:04.420Z [GATEWAY-LOCK] Reached final submission trigger button [button#btn-final-submit].`,
          `2026-10-31T00:20:04.450Z [AWAITING-HUMAN-SIGNOFF] PAUSING RUNNER: Statutory requirement requires human consent.`,
        ]);
        setCurrentStepIndex(3);
        setIsRunning(false);
        setIsApprovalModalOpen(true);
      }, 1800);
      return () => clearTimeout(t3);
    }
  }, [isRunning, currentStepIndex]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    setLogs((prev) => [
      ...prev,
      `2026-10-31T00:20:05.100Z [OPERATOR] Runner paused by user. State persisted in memory.`,
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setSubmissionReceipt(null);
    setLogs([
      "2026-10-31T00:20:00.102Z [WORKER-DAEMON] Agent environment initialized. Sandbox container: chromium-124.0-headless",
      "2026-10-31T00:20:00.245Z [SECURITY] Zero-knowledge PII sanitizer engaged. Sensitive variables will be hashed.",
    ]);
  };

  const handleCitizenApproval = (signature: string) => {
    setLogs((prev) => [
      ...prev,
      `2026-10-31T00:20:07.820Z [HUMAN-SIGNOFF] Verified citizen authorization token [SIG: ${signature.slice(0, 14)}...]`,
      `2026-10-31T00:20:08.310Z [SUBMISSION] Executed DOM click: button#btn-final-submit. Dispatching encrypted payload...`,
      `2026-10-31T00:20:09.102Z [PORTAL-RESPONSE] HTTP 201 Created. Ministry Acknowledgement Ref: NSP/2026/8940219`,
      `2026-10-31T00:20:09.340Z [RECEIPT] Sealed PDF receipt downloaded with SHA-256 digital signature stamp.`,
    ]);
    setCurrentStepIndex(4);
    setSubmissionReceipt("NSP/2026/8940219");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pipeline Status & Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PILLAR 3: HEADLESS BROWSER RUNNER
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                Target: scholarships.gov.in (National Scholarship Portal)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
              Autonomous Bureaucracy Agent with Human Sign-off
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Automates legacy government portal navigation and autofill while locking final submission behind citizen consent.
            </p>
          </div>

          {/* Execution Controls */}
          <div className="flex items-center gap-2">
            {!isRunning && currentStepIndex < 3 && (
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Agent</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {currentStepIndex === 3 && (
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Review & Sign Consent</span>
              </button>
            )}

            <button
              onClick={handleReset}
              aria-label="Reset agent runner"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Step Process Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                step.status === "done"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : step.status === "running"
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 animate-pulse"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-500 dark:text-zinc-500"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span>STEP 0{step.id}</span>
                  {step.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                  {step.label}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2">
                {step.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Terminal Viewport */}
      <div className="rounded-2xl border border-slate-300 dark:border-zinc-800 bg-zinc-950 text-emerald-400 shadow-xl overflow-hidden font-mono text-xs">
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-zinc-400 font-medium ml-2">
              civicpulse-worker-09 :: playwright-chromium-stream (Sandboxed)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TLS 1.3 SECURE</span>
            </span>
            <span>PII Redacted: {sanitized.totalRedacted}</span>
          </div>
        </div>

        {/* Console Log Feed */}
        <div className="p-4 h-64 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-emerald-500 selection:text-black">
          {logs.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-600 select-none">{idx + 1}</span>
              <span
                className={`${
                  line.includes("[PII-SHIELD]")
                    ? "text-cyan-400"
                    : line.includes("[AWAITING-HUMAN-SIGNOFF]")
                    ? "text-amber-400 font-bold"
                    : line.includes("[RECEIPT]")
                    ? "text-emerald-300 font-bold"
                    : line.includes("[ERROR]")
                    ? "text-rose-400"
                    : "text-zinc-300"
                }`}
              >
                {line}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Bottom Status / Receipt acknowledgement */}
        {submissionReceipt && (
          <div className="px-4 py-3 bg-emerald-950/40 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Submission Confirmed! Application Ref: <strong>{submissionReceipt}</strong></span>
            </span>
            <button
              onClick={() => alert(`Official Receipt PDF for Ref ${submissionReceipt} downloaded.`)}
              className="text-[11px] px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Download Sealed Receipt PDF
            </button>
          </div>
        )}
      </div>

      {/* Human-in-the-Loop Consent Modal */}
      <AgentApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onAuthorize={handleCitizenApproval}
        targetPortalName="National Scholarship Portal (NSP 2.0)"
        targetPortalUrl="https://scholarships.gov.in"
        schemeTitle="Post-Matric OBC Welfare Scholarship (Tuition Remission)"
        fields={sanitized.sanitizedPayload}
        governmentFeeInr={0}
      />
    </div>
  );
}

