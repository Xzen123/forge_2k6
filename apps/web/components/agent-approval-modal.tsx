"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  AlertCircle,
  X,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface AgentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: (signature: string) => void;
  targetPortalName?: string;
  targetPortalUrl?: string;
  schemeTitle?: string;
  fields: Record<string, string>;
  governmentFeeInr?: number;
}

export default function AgentApprovalModal({
  isOpen,
  onClose,
  onAuthorize,
  targetPortalName = "National Scholarship Portal (NSP 2.0)",
  targetPortalUrl = "https://scholarships.gov.in",
  schemeTitle = "Post-Matric OBC Welfare Scholarship (Tuition Remission)",
  fields = {
    "Beneficiary Name": "Rahul Kumar Verma",
    "Aadhaar Number": "XXXX-XXXX-9041",
    "PAN Number": "XXXXX4821A",
    "Family Income": "₹2,40,000 (Certified by CO)",
    "College Name": "Patna Science College",
    "Course": "B.Sc Physics (Year II)",
    "Bank Account": "XXXXXXXX4891 (State Bank of India)",
    "IFSC Code": "SBIN0001234",
  },
  governmentFeeInr = 0,
}: AgentApprovalModalProps) {
  const [signatureText, setSignatureText] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      onAuthorize(signatureText || otpCode || "DIGITAL_SIG_AUTHORIZED");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                HUMAN-IN-THE-LOOP CONSENT GATEWAY
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Authorize Automated Portal Submission
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Target & Verification Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500 dark:text-zinc-400">Target Official Registry:</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
              {targetPortalName}
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500 dark:text-zinc-400">Statutory Scheme:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-xs">
              {schemeTitle}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500 dark:text-zinc-400">Mandatory Government Fee:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹{governmentFeeInr} (Free Public Service)
            </span>
          </div>
        </div>

        {/* Side-by-Side Populated Fields Verification Sheet */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-mono mb-2 flex items-center justify-between">
            <span>Populated Form Payload (Zero-Knowledge Masked)</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              8 Fields Verified · PII Redacted
            </span>
          </h4>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {Object.entries(fields).map(([key, val], idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-100/60 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 text-xs"
              >
                <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                  {key}
                </div>
                <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 truncate mt-0.5">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Authorization Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Statutory Declaration Checkbox */}
          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              I declare under Section 199 of the Bharatiya Nyaya Sanhita that all particulars stated above are true to my personal knowledge, and I explicitly authorize the CivicPulse automated agent to submit this statutory application.
            </span>
          </label>

          {/* Signature / OTP Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Type Citizen Full Name (Digital Signature)
              </label>
              <input
                type="text"
                placeholder="Rahul Kumar Verma"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Aadhaar Mobile OTP (Simulated: 4892)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="4892"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono tracking-widest text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 text-xs font-semibold transition-colors"
            >
              Cancel & Abort
            </button>

            <button
              type="submit"
              disabled={!consentChecked || isAuthorizing}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              {isAuthorizing ? (
                <span>Authorizing Submission...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign & Authorize Submission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

