"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconCheckCircle,
  IconExternalLink,
  IconFileText,
  IconListChecks,
  IconPrinter,
  IconShieldCheck,
  IconXCircle,
} from "./icons";

export interface SchemeCardProps {
  schemeName: string;
  status: "eligible" | "needs_info" | "not_eligible";
  benefitSummary?: string;
  portalUrl?: string;
  documents?: string[];
  passedCriteria?: string[];
  failedCriteria?: string[];
}

export default function SchemeCard({
  schemeName,
  status,
  benefitSummary,
  portalUrl,
  documents = [],
  passedCriteria = [],
  failedCriteria = [],
}: SchemeCardProps) {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const statusStyles = {
    eligible: {
      badge: "bg-purple-900/60 text-purple-200 border-purple-500/50",
      card: "border-purple-600/40 bg-[#1c1917]",
      label: "Criteria Met (Eligible)",
      icon: <IconCheckCircle className="w-4 h-4 text-purple-400" />,
    },
    needs_info: {
      badge: "bg-amber-950/60 text-amber-300 border-amber-600/50",
      card: "border-amber-700/40 bg-[#1c1917]",
      label: "Additional Information Required",
      icon: <IconShieldCheck className="w-4 h-4 text-amber-400" />,
    },
    not_eligible: {
      badge: "bg-rose-950/60 text-rose-300 border-rose-600/50",
      card: "border-rose-700/40 bg-[#1c1917]",
      label: "Criteria Not Met",
      icon: <IconXCircle className="w-4 h-4 text-rose-400" />,
    },
  }[status];

  return (
    <div className={`mt-3 rounded-xl border ${statusStyles.card} p-4 sm:p-5 space-y-4 shadow-lg`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
            Government Scheme Evaluation
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            <span>{schemeName}</span>
          </h3>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles.badge} self-start sm:self-center`}>
          {statusStyles.icon}
          <span>{statusStyles.label}</span>
        </div>
      </div>

      {/* Benefit summary */}
      {benefitSummary && (
        <div className="p-3 rounded-lg bg-[#0c0a09] border border-stone-800 text-xs sm:text-sm text-stone-200 leading-relaxed">
          <span className="font-bold text-purple-300">
            <span>Assistance / Benefit: </span>
          </span>
          <span className="text-white font-medium">
            {benefitSummary}
          </span>
        </div>
      )}

      {/* Criteria Breakdown */}
      {(passedCriteria.length > 0 || failedCriteria.length > 0) && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            <span>Eligibility Rule Evaluation:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {passedCriteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-purple-950/40 border border-purple-700/30 text-purple-200">
                <IconCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="truncate font-medium">{c}</span>
              </div>
            ))}
            {failedCriteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-rose-950/40 border border-rose-700/30 text-rose-200">
                <IconXCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="truncate font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents Checklist */}
      {documents.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconListChecks className="w-3.5 h-3.5 text-purple-400" />
              <span>Document Preparation Checklist (</span>
              <span className="text-white font-mono">{Object.values(checkedDocs).filter(Boolean).length}</span>/
              <span className="text-white font-mono">{documents.length}</span>
              <span>):</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {documents.map((doc, idx) => {
              const isChecked = !!checkedDocs[doc];
              return (
                <label
                  key={idx}
                  onClick={() => toggleDoc(doc)}
                  className={`flex items-center gap-2.5 p-2 rounded text-xs cursor-pointer border transition-all select-none ${
                    isChecked
                      ? "bg-purple-950/60 border-purple-600/50 text-purple-200 line-through opacity-85"
                      : "bg-[#0c0a09] border-stone-800 text-stone-300 hover:border-purple-800/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 rounded accent-purple-600 pointer-events-none"
                  />
                  <span className="truncate font-medium">{doc}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Portal CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-800">
        <span className="text-[11px] text-stone-400 font-mono">
          <span>Verified with Ministry & myScheme Registries</span>
        </span>

        <div className="flex items-center gap-2">
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-purple-950"
            >
              <span>Apply on Official Portal</span>
              <IconExternalLink className="w-3.5 h-3.5 text-white" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
