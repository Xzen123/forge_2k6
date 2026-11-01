"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface NavbarProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: "hero", label: "Overview" },
  { id: "pillars", label: "Pillars" },
  { id: "telemetry", label: "Live Telemetry" },
  { id: "sandbox", label: "Interactive Sandpit" },
  { id: "deploy", label: "Deploy" },
];

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिन्दी", name: "Hindi" },
  { code: "bn", label: "বাংলা", name: "Bengali" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
];

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  activeSection,
  onNavigateSection,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl rounded-full border border-slate-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl px-5 py-2.5 shadow-xl flex items-center justify-between transition-colors duration-300"
    >
      {/* Left: Brand mark with pulsing emerald live telemetry pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigateSection("hero")}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            CP
          </div>
          <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-zinc-50 hidden sm:inline-flex items-center gap-1">
            CivicPulse
            <span className="text-[10px] font-mono uppercase px-1 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              AI
            </span>
          </span>
        </button>

        {/* Pulsing live telemetry pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold">Gazette &amp; PIB Feeds: Synced</span>
        </div>
      </div>

      {/* Center: Hover-animated nav links with layoutId sliding highlight */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-100/60 dark:bg-zinc-900/60 p-1 rounded-full border border-slate-200/50 dark:border-zinc-800/50 text-xs font-medium relative">
        {NAV_LINKS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateSection(item.id)}
              onMouseEnter={() => setHoveredLink(item.id)}
              onMouseLeave={() => setHoveredLink(null)}
              className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-200 z-10 cursor-pointer ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              {item.label}

              {/* Sliding Layout Indicator */}
              {(hoveredLink === item.id || (!hoveredLink && isActive)) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-0 rounded-full bg-white dark:bg-zinc-800 shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Theme Switcher, Regional Language Menu, Micro CTA */}
      <div className="flex items-center gap-2">
        {/* Animated 360-degree spring rotating theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-800/60 transition-colors cursor-pointer"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -180, scale: 0.3, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </motion.div>
        </button>

        {/* Regional Language Glass Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {LANGUAGES.find((l) => l.code === currentLanguage)?.label || "EN"}
            </span>
          </button>

          <AnimatePresence>
            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xl py-1 z-50 text-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                        currentLanguage === lang.code
                          ? "font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                          : "text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Micro CTA with glow */}
        <Link
          href="/portal"
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-1.5 text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.header>
  );
}
