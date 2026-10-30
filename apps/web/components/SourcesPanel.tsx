"use client";

import { useEffect, useState } from "react";
import { ChangeEvent, SourceInfo, getChanges, getSources } from "@/lib/api";

export default function SourcesPanel() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [s, c] = await Promise.all([getSources(), getChanges()]);
    setSources(s);
    setChanges(c);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  const sourceNames: Record<string, string> = {
    myscheme: "myScheme Portal",
    pib: "PIB Press Releases",
    data_gov_in: "Data.gov.in",
    india_code: "India Code",
  };

  return (
    <div className="space-y-4">
      {/* Live data status */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Live Data Sources</h2>
          <button
            id="refresh-sources"
            aria-label="Refresh sources"
            onClick={refresh}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((s) => (
              <SourceRow key={s.name} source={s} label={sourceNames[s.name] || s.name} />
            ))}
            {sources.length === 0 && (
              <div className="text-center py-3 space-y-1">
                <p className="text-xs text-amber-400/90 font-medium">
                  Connecting to API...
                </p>
                <p className="text-[11px] text-slate-500">
                  Ensure backend is started on <code className="text-slate-400">http://localhost:8000</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent changes */}
      {changes.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Recent Changes</h2>
          <div className="space-y-2">
            {changes.slice(0, 5).map((c, i) => (
              <div key={i} className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                <p className="text-xs font-medium text-amber-400">
                  {sourceNames[c.source] || c.source}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2">{c.diff_summary}</p>
                <p className="text-xs text-slate-600">
                  {new Date(c.occurred_at).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceRow({ source, label }: { source: SourceInfo; label: string }) {
  const lastUpdated = source.last_success_at
    ? new Date(source.last_success_at).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Never";

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          source.stale ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300 truncate">{label}</p>
        <p className="text-xs text-slate-500">
          {source.document_count} docs · {lastUpdated}
        </p>
      </div>
      {source.stale && (
        <span className="text-xs text-amber-400 flex-shrink-0">stale</span>
      )}
    </div>
  );
}
