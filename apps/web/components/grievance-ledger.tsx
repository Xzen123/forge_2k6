"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Camera,
  MapPin,
  Building,
  UserCheck,
  ArrowRight,
  Upload,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  analyzeCivicDamage,
  TriageInferenceResult,
} from "@/lib/triage-engine";

interface GrievanceLedgerProps {
  initialResult?: TriageInferenceResult | null;
}

export default function GrievanceLedger({ initialResult }: GrievanceLedgerProps) {
  const [incident, setIncident] = useState<TriageInferenceResult | null>(initialResult || null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(72 * 3600); // 72 hours SLA
  const [isCounting, setIsCounting] = useState<boolean>(true);
  const [stage, setStage] = useState<
    "Reported" | "Triaged" | "Contractor Dispatched" | "Awaiting Citizen Verification" | "Resolved" | "Escalated to District Ombudsman"
  >("Contractor Dispatched");

  // Post-Fix Dual Photo state
  const [contractorPhotoSubmitted, setContractorPhotoSubmitted] = useState<boolean>(true);
  const [citizenVerified, setCitizenVerified] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Initialize or mock if none passed
  useEffect(() => {
    if (!incident) {
      analyzeCivicDamage("sample_asphalt_fracture.jpg", [28.568, 77.241]).then((res) => {
        setIncident(res);
      });
    }
  }, [incident]);

  // SLA Countdown Engine
  useEffect(() => {
    if (!isCounting || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // AUTO-ESCALATE TRIGGER!
          setStage("Escalated to District Ombudsman");
          setIsCounting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCounting, secondsRemaining]);

  const formatCountdown = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}h : ${minutes
      .toString()
      .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`;
  };

  const triggerFastForwardExpiration = () => {
    setSecondsRemaining(3); // 3 seconds to test live auto-escalation
  };

  const handleApproveRepair = () => {
    setCitizenVerified(true);
    setStage("Resolved");
    setIsCounting(false);
  };

  const handleRejectRepair = () => {
    setStage("Escalated to District Ombudsman");
    setRejectionReason("Citizen noted: Cold bitumen mix washed away under vehicle traffic. Non-compliant with IRC-SP-100.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: SLA Countdown & Dynamic Escalation Status */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          stage === "Escalated to District Ombudsman"
            ? "border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/20"
            : stage === "Resolved"
            ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/20"
            : "border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  stage === "Escalated to District Ombudsman"
                    ? "bg-rose-500 text-white"
                    : stage === "Resolved"
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                {stage === "Escalated to District Ombudsman" ? "STATUTORY BREACH" : "CIVIC SLA TICKER"}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                Ticket: {incident?.incidentId || "INC-8821"} · {incident?.category}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-zinc-50 mt-1 flex items-center gap-2">
              {stage === "Escalated to District Ombudsman" ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-500 animate-bounce" />
                  <span>ESCALATED: District Public Grievance Ombudsman</span>
                </>
              ) : stage === "Resolved" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>RESOLVED & CITIZEN-VERIFIED</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>SLA Countdown: {formatCountdown(secondsRemaining)}</span>
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              {stage === "Escalated to District Ombudsman"
                ? "Statutory 72-hour window lapsed without contractor sign-off. Automated subpoena dispatched to District Magistrate Infrastructure Cell."
                : `Routed to: ${incident?.location.executingAgency} (In-Charge: ${incident?.location.officerInCharge})`}
            </p>
          </div>

          {/* Quick SLA Test / Fast-forward Action */}
          {stage !== "Resolved" && stage !== "Escalated to District Ombudsman" && (
            <div className="flex items-center gap-2">
              <button
                onClick={triggerFastForwardExpiration}
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Test: Trigger SLA Breach</span>
              </button>
            </div>
          )}
        </div>

        {/* 4-Stage Civic Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-5 border-t border-slate-200 dark:border-zinc-800/80 mt-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/50 flex flex-col">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">STAGE 1</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Reported</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">GPS & CV Tagged</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/50 flex flex-col">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">STAGE 2</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Ward Triaged</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{incident?.location.wardId}</span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex flex-col ${
              stage === "Contractor Dispatched" || stage === "Awaiting Citizen Verification"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-100 dark:bg-zinc-800/50"
            }`}
          >
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">STAGE 3</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Contractor Dispatched</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Hot-Mix Asphalt Unit</span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex flex-col ${
              stage === "Resolved"
                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : stage === "Escalated to District Ombudsman"
                ? "bg-rose-500/20 border border-rose-500 text-rose-600 dark:text-rose-400"
                : "bg-slate-100 dark:bg-zinc-800/50"
            }`}
          >
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">STAGE 4</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {stage === "Escalated to District Ombudsman" ? "Ombudsman Subpoena" : "Citizen Sign-off"}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
              {stage === "Resolved" ? "Verified" : "Proof-of-Work Diff"}
            </span>
          </div>
        </div>
      </div>

      {/* Post-Fix Dual-Photo Proof-of-Work Comparison Canvas */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>Post-Fix Proof-of-Work Verification (Before / After Diff)</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Compare the original civic damage photo with the contractor repair submission before releasing contractor payment milestone.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Contractor Sub: COMPLETED
          </span>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Original Fault with CV Bounding Box Overlays */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-rose-500">ORIGINAL FAULT (REPORTED)</span>
              <span className="text-slate-500 dark:text-zinc-400">Timestamp: 2026-10-29 · 11:24</span>
            </div>

            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-zinc-700">
              {/* Simulated asphalt damage visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 via-zinc-900 to-black opacity-90" />
              
              {/* Simulated asphalt crack lines */}
              <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none">
                <path
                  d="M 20,40 Q 80,110 140,80 T 260,150"
                  stroke="#ef4444"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="4 2"
                />
                <circle cx="140" cy="80" r="14" fill="none" stroke="#ef4444" strokeWidth="2" />
              </svg>

              {/* Bounding Box 1 */}
              <div className="absolute top-[20%] left-[20%] w-[55%] h-[50%] border-2 border-dashed border-rose-500 bg-rose-500/10 rounded flex flex-col justify-between p-1.5 pointer-events-none">
                <span className="bg-rose-500 text-white font-mono text-[9px] font-bold px-1 rounded w-fit">
                  CV Score: 9.4 · Asphalt Fracture (~9.5cm)
                </span>
                <span className="text-[9px] font-mono text-rose-300">IRC-SP-100 Standard Breach</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Severity Tier: CRITICAL</span>
              <span>Ward: {incident?.location.wardId}</span>
            </div>
          </div>

          {/* Card 2: Contractor Repair Submission */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-500">CONTRACTOR REPAIR SUBMISSION</span>
              <span className="text-slate-500 dark:text-zinc-400">Timestamp: Today · 14:02</span>
            </div>

            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-zinc-700">
              {/* Fresh bitumen repaired texture */}
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-emerald-950/40 opacity-90" />
              
              <div className="absolute top-[25%] left-[25%] w-[50%] h-[45%] border-2 border-emerald-500 bg-emerald-500/10 rounded flex flex-col justify-between p-1.5 pointer-events-none">
                <span className="bg-emerald-500 text-zinc-950 font-mono text-[9px] font-bold px-1 rounded w-fit">
                  Proof-of-Work: Resurfaced (30mm Tack Coat)
                </span>
                <span className="text-[9px] font-mono text-emerald-300">Contractor Stamp: DEL-PWD-QC</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Bituminous Concrete: Level 0 Diff</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Inspection Ready</span>
            </div>
          </div>
        </div>

        {/* Citizen Verdict Actions */}
        {stage !== "Resolved" && (
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              As the reporting citizen, confirm if the physical site condition matches the contractor photo.
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleRejectRepair}
                className="px-4 py-2 rounded-xl border border-rose-500/40 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all"
              >
                Reject: Shoddy Workmanship
              </button>
              <button
                onClick={handleApproveRepair}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Close Ticket</span>
              </button>
            </div>
          </div>
        )}

        {citizenVerified && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Ticket closed with citizen cryptographic sign-off. Contractor milestone payout authorized.</span>
          </div>
        )}
      </div>
    </div>
  );
}

