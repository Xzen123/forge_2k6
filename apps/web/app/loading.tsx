import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 border border-white/[0.08] shadow-2xl">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-200">Loading Civic Pulse...</p>
          <p className="text-xs text-slate-500 font-mono">Syncing live official registries</p>
        </div>
      </div>
    </div>
  );
}

