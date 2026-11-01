"use client";

import React from "react";
import { IconShieldCheck, IconRefresh } from "./icons";

interface HeaderProps {
  onResetSession?: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export default function Header({ onResetSession, language = "en", onLanguageChange }: HeaderProps) {
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "bn", label: "বাংলা" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0a09]/95 border-b border-stone-800 backdrop-blur-md shadow-md">
      {/* Royal Purple & Warm Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-800 via-purple-500 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 via-purple-900 to-stone-950 border border-purple-500/40 shadow-sm text-white">
            <IconShieldCheck className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Civic Pulse</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-900/60 text-purple-200 border border-purple-500/40">
                Official DPI
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              <span>National Scheme & Policy Intelligence Platform</span> · <span className="text-purple-300 font-semibold">Grounded in Live Gazettes</span>
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          {onLanguageChange && (
            <div className="hidden sm:flex items-center p-1 rounded-lg bg-[#1c1917] border border-stone-800 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    language === l.code
                      ? "bg-purple-700 text-white shadow-sm font-bold"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Live Data Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1c1917] border border-stone-800 text-xs">
            <span className="radar-dot relative flex h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-stone-300 font-medium">Live Registries Active</span>
            <span className="text-purple-300 text-[10px] font-mono font-bold">PIB · myScheme</span>
          </div>

          {/* Reset Session Button */}
          {onResetSession && (
            <button
              onClick={onResetSession}
              title="Start a new consultation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1c1917] hover:bg-stone-800 border border-stone-700 hover:border-purple-500 transition-all shadow-xs"
            >
              <IconRefresh className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">New Consultation</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
