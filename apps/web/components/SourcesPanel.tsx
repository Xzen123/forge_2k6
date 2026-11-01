"use client";

import React, { useEffect, useState } from "react";
import { ChangeEvent, SourceInfo, getChanges, getSources } from "@/lib/api";
import {
  IconBuilding2,
  IconExternalLink,
  IconRefresh,
  IconFileText,
  IconShieldCheck,
} from "./icons";

interface SourceMeta {
  label: string;
  domain: string;
  url: string;
  type: string;
}

const SOURCE_METADATA: Record<string, SourceMeta> = {
  myscheme: {
    label: "myScheme National Portal",
    domain: "myscheme.gov.in",
    url: "https://www.myscheme.gov.in",
    type: "Welfare Schemes & Direct Benefits",
  },
  pib: {
    label: "Press Information Bureau (PIB)",
    domain: "pib.gov.in",
    url: "https://pib.gov.in",
    type: "Cabinet Decisions & Press Releases",
  },
  data_gov_in: {
    label: "Open Government Data (OGD)",
    domain: "data.gov.in",
    url: "https://data.gov.in",
    type: "National Datasets & Catalogs",
  },
  india_code: {
    label: "India Code Repository",
    domain: "indiacode.nic.in",
    url: "https://www.indiacode.nic.in",
    type: "Acts, Statutes & Central Rules",
  },
};

export default function SourcesPanel() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const [s, c] = await Promise.all([getSources(), getChanges()]);
      setSources(s);
      setChanges(c);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Live Data Sources Card */}
      <div className="bg-[#141110] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <IconBuilding2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              <span>Live Official Pipelines</span>
            </h2>
          </div>
          <button
            id="refresh-sources"
            aria-label="Refresh sources"
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c1917] hover:bg-stone-800 text-[11px] font-bold text-white border border-stone-700 hover:border-purple-500 transition-all disabled:opacity-50"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-400" : "text-purple-400"}`} />
            <span>Sync</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-[#1c1917] animate-pulse border border-stone-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {sources.map((s) => {
              const meta = SOURCE_METADATA[s.name] || {
                label: s.name,
                domain: "gov.in",
                url: "#",
                type: "Official Source",
              };
              return <SourceItem key={s.name} source={s} meta={meta} />;
            })}

            {sources.length === 0 && (
              <div className="text-center py-6 px-3 rounded-lg bg-[#0c0a09] border border-stone-800 space-y-1">
                <p className="text-xs font-bold text-amber-400">
                  <span>Connecting to Ingestion Backend...</span>
                </p>
                <p className="text-[11px] text-stone-400">
                  <span>Backend service running on </span>
                  <code className="text-purple-300 font-mono font-bold">http://localhost:8000</code>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <span className="flex items-center gap-1.5 text-purple-300 font-bold">
            <IconShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>SHA-256 Verified</span>
          </span>
          <span className="text-white font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-600/40">
            <span>100% Live Ingestion</span>
          </span>
        </div>
      </div>

      {/* Recent Changes & Policy Updates */}
      {changes.length > 0 && (
        <div className="bg-[#141110] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-md">
          <div className="flex items-center gap-2 pb-2.5 border-b border-stone-800">
            <div className="w-6 h-6 rounded-md bg-amber-950/50 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <IconFileText className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              <span>Audited Policy Changes</span>
            </h2>
          </div>

          <div className="space-y-2">
            {changes.slice(0, 4).map((c, i) => {
              const meta = SOURCE_METADATA[c.source];
              return (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#0c0a09] border border-stone-800 hover:border-purple-800/60 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      <span>{meta ? meta.label : c.source}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      <span>
                        {new Date(c.occurred_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                    <span>{c.diff_summary}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceItem({ source, meta }: { source: SourceInfo; meta: SourceMeta }) {
  const lastUpdated = source.last_success_at
    ? new Date(source.last_success_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="bg-[#1c1917] border border-stone-800 hover:border-purple-800/80 rounded-lg p-3 flex flex-col gap-1.5 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              source.stale ? "bg-amber-400 animate-pulse" : "bg-purple-400"
            }`}
          />
          <span className="text-xs font-bold text-white truncate">
            <span>{meta.label}</span>
          </span>
        </div>
        <a
          href={meta.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Visit ${meta.domain}`}
          className="text-stone-400 hover:text-purple-300 transition-colors p-0.5"
        >
          <IconExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-400 pl-4 font-mono">
        <span className="text-purple-200 font-bold">
          <span>{source.document_count}</span> active documents
        </span>
        <span className="text-stone-500">
          <span>{lastUpdated}</span>
        </span>
      </div>
    </div>
  );
}
