"use client";

import React from "react";
import { motion } from "framer-motion";

interface ViewportIndicatorProps {
  sections: Array<{ id: string; label: string; number: string }>;
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export default function ViewportIndicator({
  sections,
  activeSection,
  onSelectSection,
}: ViewportIndicatorProps) {
  return (
    <aside
      aria-label="Viewport Section Navigation"
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md p-2 rounded-full border border-slate-200/50 dark:border-zinc-800/50 shadow-lg"
    >
      {sections.map((sec, idx) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            aria-label={`Jump to section ${sec.label}`}
            className="group relative flex items-center justify-center w-6 h-6 cursor-pointer"
          >
            {/* Tooltip on hover */}
            <span className="absolute right-8 px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap bg-zinc-900 text-zinc-100 dark:bg-white dark:text-zinc-900 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              {sec.number} · {sec.label}
            </span>

            {/* Indicator Dot */}
            <motion.div
              animate={{
                scale: isActive ? 1.4 : 1,
                opacity: isActive ? 1 : 0.45,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                isActive
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  : "bg-slate-400 dark:bg-zinc-600 group-hover:bg-slate-600 dark:group-hover:bg-zinc-400"
              }`}
            />
          </button>
        );
      })}
    </aside>
  );
}

