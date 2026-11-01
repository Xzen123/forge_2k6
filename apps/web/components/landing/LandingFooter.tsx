"use client";

import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, Heart, Terminal, FileCode, CheckCircle2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                CP
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-zinc-100 tracking-tight">
                CivicPulse AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Autonomous Public Intelligence &amp; Digital Governance Engine for Indian citizens.
              Grounded strictly in live official government gazettes, PIB releases, and legal statutes.
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Dummy Data Policy
              </span>
              <span>&middot;</span>
              <span>WCAG AAA Accessible</span>
            </div>
          </div>

          {/* Column 2: Pillars */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3">
              Core Pillars
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/portal" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Policy &amp; Rights Explainer
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Civic Triage &amp; Geo-Audit
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Autonomous Bureaucracy Agent
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Forensic Truth Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Ground-Truth Sources */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3">
              Live Sources
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <a
                  href="https://pib.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Press Information Bureau (PIB)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.indiacode.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>India Code Digital Acts</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>myScheme Portal (MeitY)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Open Government Data (OGD)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} CivicPulse AI. Open Source Digital Public Goods.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Launch Citizen Portal &rarr;
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

