"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  FileText,
  Clock,
  Bot,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function ClosingLaunchSection() {
  const officialIntegrations = [
    {
      name: "Press Information Bureau (PIB)",
      url: "https://pib.gov.in",
      role: "Official Press Bulletins & Fact Checks",
    },
    {
      name: "India Code Digital Acts",
      url: "https://www.indiacode.nic.in",
      role: "Central & State Statutory Gazettes",
    },
    {
      name: "myScheme Platform",
      url: "https://www.myscheme.gov.in",
      role: "National Unified Welfare Graph",
    },
    {
      name: "Open Government Data (OGD)",
      url: "https://data.gov.in",
      role: "Municipal Datasets & Ward GIS Boundaries",
    },
  ];

  const portalModules = [
    { label: "Policy Explainer", href: "/portal?module=explainer", icon: FileText },
    { label: "Grievance Triage", href: "/portal?module=triage", icon: Clock },
    { label: "Bureaucracy Agent", href: "/portal?module=agent", icon: Bot },
    { label: "Forensic Audit", href: "/portal?module=audit", icon: ShieldAlert },
  ];

  return (
    <section
      id="deploy"
      className="h-screen max-h-screen w-full snap-start snap-always relative overflow-hidden flex flex-col justify-between px-6 md:px-14 py-6 md:py-8 select-none"
    >
      {/* Ambient center background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Center High-Impact Closing Statement */}
      <div className="pt-12 sm:pt-10 my-auto text-center flex flex-col items-center justify-center max-w-4xl mx-auto z-10">
        
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-3"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>PRODUCTION-READY CIVIC INTELLIGENCE</span>
        </motion.div>

        {/* Master Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-zinc-50 tracking-[-0.035em] leading-[1.05]"
        >
          Deterministic Civic Intelligence for{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
            1.4 Billion Citizens.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-3 text-xs sm:text-sm lg:text-base font-sans text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Zero hallucinated schemes. Zero manual bureaucratic runarounds. Live statutory verification in plain regional language.
        </motion.p>

        {/* Primary Interactive Glowing CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 relative group"
        >
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />

          <Link
            href="/portal"
            className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-extrabold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-2xl transition-all duration-200 cursor-pointer group-hover:scale-105 active:scale-95"
          >
            <span>Launch Citizen Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* 4 Quick Module Entry Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs font-mono">
          {portalModules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link
                key={i}
                href={mod.href}
                className="px-3 py-1 rounded-full border border-slate-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                <span>{mod.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Clean Single Horizontal Trust Bar (Replaces 4 duplicate ETL boxes) */}
      <div className="w-full max-w-5xl mx-auto my-2 z-10">
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-3.5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
            {officialIntegrations.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`flex flex-col justify-between group pt-2 md:pt-0 ${
                  idx > 0 ? "md:pl-3" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    {item.role}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer Row */}
      <div className="pt-2.5 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400 z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
            CP
          </div>
          <span className="font-medium text-slate-700 dark:text-zinc-400 text-[11px]">
            CivicPulse AI · Digital Public Goods · Open Source MIT
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            WCAG 2.1 AAA COMPLIANT
          </span>
          <span className="text-slate-400">·</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </div>

    </section>
  );
}
