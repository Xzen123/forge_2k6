"use client";

import React from "react";
import {
  FileText,
  MapPin,
  Bot,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Globe,
  Radio,
  Building,
  Volume2,
  VolumeX,
} from "lucide-react";

export type PillarId = "policy" | "triage" | "agent" | "truth";

interface SidebarProps {
  activeTab: PillarId;
  onSelectTab: (tab: PillarId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  jurisdiction: string;
  onJurisdictionChange: (j: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  audioVoiceEnabled: boolean;
  onToggleVoice: () => void;
}

const JURISDICTIONS = [
  "National Central Division",
  "Bihar State Division",
  "Delhi-NCR Municipal Zone",
  "Uttar Pradesh State Zone",
  "Maharashtra Urban Division",
  "West Bengal Municipal Grid",
];

const DIALECTS = [
  { code: "en", name: "English (National)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "es", name: "Español (International)" },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  jurisdiction,
  onJurisdictionChange,
  language,
  onLanguageChange,
  audioVoiceEnabled,
  onToggleVoice,
}: SidebarProps) {
  const navItems: { id: PillarId; title: string; subtitle: string; icon: any; badge?: string }[] = [
    {
      id: "policy",
      title: "Policy & Rights Explainer",
      subtitle: "Plain-language gazette decoder",
      icon: FileText,
      badge: "LIVE 42",
    },
    {
      id: "triage",
      title: "Civic Triage & Geo-Audit",
      subtitle: "Infrastructure & fault tracking",
      icon: MapPin,
      badge: "14 ACTIVE",
    },
    {
      id: "agent",
      title: "Autonomous Bureaucracy",
      subtitle: "Headless form-filling & status runs",
      icon: Bot,
      badge: "AGENTIC",
    },
    {
      id: "truth",
      title: "Forensic Truth Engine",
      subtitle: "Deepfake & viral claim audit",
      icon: ShieldAlert,
      badge: "CRITICAL 2",
    },
  ];

  return (
    <aside
      className={`h-screen bg-[#0d0d10] border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 z-40 relative select-none ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Top Brand Banner */}
      <div>
        <div className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-zinc-950 font-black shadow-md flex-shrink-0">
              CP
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  CivicPulse OS
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gazette Sync: 99.98%
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 4 Pillars Navigation */}
        <nav className="p-2.5 space-y-1">
          <div className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 ${isCollapsed ? "text-center" : ""}`}>
            {isCollapsed ? "•••" : "Autonomous Pillars"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent"
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-zinc-900 text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 truncate block">
                      {item.subtitle}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Footprint Widget at Bottom */}
      {!isCollapsed && (
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 space-y-3">
          {/* Jurisdiction Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Building className="w-3 h-3 text-cyan-400" />
              Jurisdiction Grid
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => onJurisdictionChange(e.target.value)}
              className="w-full bg-zinc-900 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 border border-zinc-800 focus:outline-none focus:border-zinc-700 cursor-pointer font-sans"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j} className="bg-zinc-900 text-white">
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Regional Dialect Selector + Instant Audio Toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                Regional Dialect (12+)
              </span>
              <button
                onClick={onToggleVoice}
                className="text-zinc-400 hover:text-emerald-400 transition-colors p-0.5"
                title={audioVoiceEnabled ? "Voice Output Active" : "Voice Output Muted"}
              >
                {audioVoiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-zinc-600" />
                )}
              </button>
            </div>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-zinc-900 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 border border-zinc-800 focus:outline-none focus:border-zinc-700 cursor-pointer font-sans"
            >
              {DIALECTS.map((d) => (
                <option key={d.code} value={d.code} className="bg-zinc-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Telemetry Footer */}
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900">
            <span>Core v2.4.0</span>
            <span className="text-emerald-400 font-bold">Mainnet Ready</span>
          </div>
        </div>
      )}
    </aside>
  );
}

