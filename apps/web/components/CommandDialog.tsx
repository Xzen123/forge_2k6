"use client";

import React, { useEffect, useState } from "react";
import { Search, X, FileText, MapPin, Bot, ShieldAlert, ArrowRight } from "lucide-react";
import { PillarId } from "./layout/Sidebar";

interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: PillarId, query?: string) => void;
}

const SAMPLE_ENTRIES = [
  { id: "1", tab: "policy" as PillarId, title: "Post-Matric Scholarship Scheme for OBC Students (Bihar)", category: "Policy & Rights" },
  { id: "2", tab: "policy" as PillarId, title: "PM-Kisan Samman Nidhi Operational Directives 2026", category: "Policy & Rights" },
  { id: "3", tab: "triage" as PillarId, title: "Hazard #4092: Severe Asphalt Fissure on Outer Ring Road", category: "Civic Triage" },
  { id: "4", tab: "triage" as PillarId, title: "Water Main Burst: Sector 14 Drainage Overflow", category: "Civic Triage" },
  { id: "5", tab: "agent" as PillarId, title: "Autonomous Renewal: Post-Matric Tuition Waiver (48 fields)", category: "Bureaucracy Agent" },
  { id: "6", tab: "truth" as PillarId, title: "Audit Viral Video: Fake Announcement of ₹10,000 Direct Cash Transfer", category: "Forensic Truth" },
  { id: "7", tab: "truth" as PillarId, title: "Cloned Audio Speech: Chief Minister Ration Quota Alteration", category: "Forensic Truth" },
];

export default function CommandDialog({ isOpen, onClose, onSelectAction }: CommandDialogProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SAMPLE_ENTRIES.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a policy, grievance ticket, or forensic audit query..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching civic records found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.tab, item.title);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    {item.category}
                  </span>
                  <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                    {item.title}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <span>Navigate with ↵ Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}

