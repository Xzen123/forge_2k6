"use client";

import React from "react";
import { IconCheck, IconCheckCircle, IconHelpCircle, IconShieldCheck, IconUsers } from "./icons";

export interface CitizenProfileState {
  age?: number | string | null;
  state?: string | null;
  category?: string | null;
  income_annual?: number | string | null;
  occupation?: string | null;
  education?: string | null;
  gender?: string | null;
  disability?: boolean | string | null;
  land_holding?: string | null;
}

interface CitizenDossierProps {
  profile: CitizenProfileState;
  missingFields: string[];
}

export default function CitizenDossier({ profile, missingFields }: CitizenDossierProps) {
  const fields = [
    { key: "state", label: "State of Residence", value: profile.state },
    { key: "category", label: "Social Category", value: profile.category },
    { key: "age", label: "Citizen Age", value: profile.age ? `${profile.age} yrs` : null },
    {
      key: "income_annual",
      label: "Annual Income",
      value: profile.income_annual
        ? typeof profile.income_annual === "number"
          ? `₹${profile.income_annual.toLocaleString("en-IN")}`
          : `₹${profile.income_annual}`
        : null,
    },
    { key: "occupation", label: "Occupation / Role", value: profile.occupation },
    { key: "education", label: "Education Level", value: profile.education },
  ];

  const identifiedCount = fields.filter((f) => f.value !== null && f.value !== undefined).length;

  return (
    <div className="bg-[#141110] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-md">
      {/* Dossier Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <IconUsers className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            <span>Citizen Profile Dossier</span>
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-600/40">
          <span>{identifiedCount}</span>/<span>6 Verified</span>
        </span>
      </div>

      {/* Grid of Profile Attributes */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {fields.map((f) => {
          const isKnown = f.value !== null && f.value !== undefined && f.value !== "";
          const isMissing = missingFields.includes(f.key);

          return (
            <div
              key={f.key}
              className={`p-2.5 rounded-lg border transition-all ${
                isKnown
                  ? "bg-[#1c1917] border-purple-900/50 text-white"
                  : isMissing
                  ? "bg-amber-950/20 border-amber-600/40 text-amber-200"
                  : "bg-[#0c0a09] border-stone-800/80 text-stone-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 truncate">
                  {f.label}
                </span>
                {isKnown ? (
                  <span className="w-4 h-4 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <IconCheck className="w-2.5 h-2.5" />
                  </span>
                ) : isMissing ? (
                  <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span>Required</span>
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-bold text-xs truncate">
                {isKnown ? (
                  <span className="text-white">{f.value}</span>
                ) : (
                  <span className="italic font-normal text-stone-600">Pending</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Missing Facts Banner */}
      {missingFields.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-600/30 flex items-start gap-2.5 text-xs text-amber-200">
          <IconHelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <p className="text-[11px] leading-relaxed">
            <span>Missing facts required to compute exact scheme eligibility: </span>
            <span className="font-mono font-bold text-white bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/30">
              {missingFields.join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* Footer Info with Span Tags */}
      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
        <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
          <IconShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Zero Guessed Data</span>
        </span>
        <span className="text-stone-500 font-bold uppercase">
          <span>Deterministic</span>
        </span>
      </div>
    </div>
  );
}
