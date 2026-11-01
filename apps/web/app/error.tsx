"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Civic Pulse Frontend Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-xl font-bold">
          !
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-200">
            System Interface Recovered
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A temporary interface error occurred. Civic Pulse has preserved your session state and live data pipelines.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-950"
          >
            Reload Interface
          </button>
        </div>
      </div>
    </div>
  );
}

