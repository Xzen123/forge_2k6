"use client";

import React from "react";
import { Search, ShieldCheck, Lock, Cpu, Menu, Bell } from "lucide-react";

interface AppHeaderProps {
  onOpenCommand: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AppHeader({ onOpenCommand, onToggleSidebar, isSidebarOpen }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search Bar (Cmd+K) */}
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Search policies, claims, grievance tickets, gazettes...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Worker Nodes & Encrypted Citizen ID */}
      <div className="flex items-center gap-3">
        {/* Worker Nodes Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="radar-dot relative flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-400">Worker Nodes:</span>
          <span className="text-emerald-400 font-bold">42 Active</span>
          <span className="text-zinc-600">|</span>
          <span className="text-cyan-400 font-bold">0.4s Latency</span>
        </div>

        {/* Citizen Profile ID badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800/80 text-xs shadow-xs">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold text-zinc-200 leading-tight">Verified Citizen ID</span>
            <span className="text-[9px] font-mono text-zinc-400 leading-none">PII Redacted · Deterministic Legal RAG</span>
          </div>
        </div>
      </div>
    </header>
  );
}

