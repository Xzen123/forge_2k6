"use client";

import { useState } from "react";
import { CitationData, ClaimData } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
export default function Header() {
  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-lg font-bold shadow-lg">
            🇮🇳
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Civic Pulse</h1>
            <p className="text-xs text-slate-400">Government Scheme Assistant — Live Data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live official data
        </div>
      </div>
    </header>
  );
}
