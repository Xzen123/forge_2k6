"use client";

import React, { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Camera,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  location: string;
  coordinates: [number, number];
  category: "Road & Asphalt" | "Water Supply" | "Air Quality" | "Public Safety";
  severityScore: number;
  status: "Reported" | "Verified" | "Assigned" | "Acknowledged" | "Resolved";
  routedTo: string;
  reportedAt: string;
  cvDetection: string;
}

const SAMPLE_INCIDENTS: Incident[] = [
  {
    id: "INC-8821",
    title: "Severe Asphalt Fissure & Road Sinkage",
    location: "Ring Road, Sector 8 Underpass",
    coordinates: [28.6139, 77.209],
    category: "Road & Asphalt",
    severityScore: 9.4,
    status: "Assigned",
    routedTo: "PWD Central Ward 8",
    reportedAt: "18 mins ago",
    cvDetection: "[Detected: Severe Asphalt Fracture (Depth ~8cm)]",
  },
  {
    id: "INC-8819",
    title: "High-Pressure Water Main Rupture",
    location: "Subhash Nagar 4th Cross",
    coordinates: [28.632, 77.219],
    category: "Water Supply",
    severityScore: 8.7,
    status: "Acknowledged",
    routedTo: "Jal Board Quick Response Team",
    reportedAt: "45 mins ago",
    cvDetection: "[Detected: Potable Pipeline Leakage (Est. 420L/min)]",
  },
  {
    id: "INC-8814",
    title: "Industrial Air Quality Particulate Spike (PM2.5: 380)",
    location: "Okhla Industrial Area Phase II",
    coordinates: [28.528, 77.275],
    category: "Air Quality",
    severityScore: 7.9,
    status: "Verified",
    routedTo: "Pollution Control Committee",
    reportedAt: "2 hours ago",
    cvDetection: "[Detected: Unscrubbed Boiler Emission Flume]",
  },
  {
    id: "INC-8806",
    title: "Structural Crack on Pedestrian Footbridge",
    location: "Metro Station Gate 3 Footbridge",
    coordinates: [28.589, 77.228],
    category: "Public Safety",
    severityScore: 9.6,
    status: "Reported",
    routedTo: "Municipal Infrastructure Cell",
    reportedAt: "3 hours ago",
    cvDetection: "[Detected: Load-bearing Girder Concrete Spalling]",
  },
];

export default function CivicTriageView() {
  const [incidents, setIncidents] = useState<Incident[]>(SAMPLE_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident>(SAMPLE_INCIDENTS[0]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [simulatedDetection, setSimulatedDetection] = useState<boolean>(false);

  const filteredIncidents = incidents.filter(
    (inc) => filterCategory === "All" || inc.category === filterCategory
  );

  const getSeverityBadge = (score: number) => {
    if (score >= 9.0) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
    if (score >= 7.5) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
  };

  const getStatusStage = (status: Incident["status"]) => {
    const stages = ["Reported", "Verified", "Assigned", "Acknowledged", "Resolved"];
    return stages.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Pillar 2
            </span>
            <span className="text-xs font-mono text-zinc-500">Autonomous Public Works Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Civic Triage & Geo-Audit Engine
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time geospatial hazard heatmap, AI computer-vision triage, and public contractor accountability ledger.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-md self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Report Live Incident</span>
        </button>
      </div>

      {/* Main Split Layout: Interactive Map + Incident Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left: Simulated Geospatial Heatmap & Mapbox View */}
        <div className="space-y-4">
          <div className="civic-panel rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Municipal Hazard Heatmap (Ward Grid 7-14)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="radar-dot relative flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-zinc-400 font-mono text-[11px]">Telemetry Active</span>
              </div>
            </div>

            {/* Simulated Interactive Map Canvas */}
            <div className="relative h-80 sm:h-96 w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              {/* Grid Lines */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Geographic River & Highway Paths Mock */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <path d="M0,120 Q180,90 320,180 T680,240" fill="none" stroke="#06b6d4" strokeWidth="6" />
                <path d="M120,0 Q240,160 380,200 T720,380" fill="none" stroke="#71717a" strokeWidth="4" />
              </svg>

              {/* Heatmap Blobs */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-28 h-28 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />

              {/* Incident Pins on Map */}
              {SAMPLE_INCIDENTS.map((inc, i) => {
                const isSelected = selectedIncident.id === inc.id;
                // mock layout positions
                const pos = [
                  { top: "35%", left: "42%" },
                  { top: "60%", left: "68%" },
                  { top: "25%", left: "75%" },
                  { top: "70%", left: "28%" },
                ][i];

                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    style={pos}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all group z-10 ${
                      isSelected
                        ? "bg-rose-500 text-zinc-950 ring-4 ring-rose-500/30 scale-125"
                        : "bg-zinc-900 border border-zinc-700 text-rose-400 hover:scale-110"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                      {inc.title}
                    </span>
                  </button>
                );
              })}

              {/* Map UI Overlay Controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 p-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">WGS84</span>
                <span>Lat: 28.6139° N</span>
                <span>Lon: 77.2090° E</span>
              </div>
            </div>

            {/* Selected Incident Inspector Card */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    SELECTED HAZARD #{selectedIncident.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedIncident.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {selectedIncident.location}
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getSeverityBadge(selectedIncident.severityScore)}`}>
                  AI Severity: {selectedIncident.severityScore}/10
                </div>
              </div>

              {/* CV Detection snippet */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-emerald-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{selectedIncident.cvDetection}</span>
              </div>

              {/* Public Accountability Ledger / Timeline Tracker */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Public Accountability Ledger:
                </span>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                  {["Reported", "Verified", "Assigned", "Acknowledged", "Resolved"].map((step, idx) => {
                    const currentIdx = getStatusStage(selectedIncident.status);
                    const isDone = idx <= currentIdx;
                    return (
                      <div
                        key={step}
                        className={`p-1.5 rounded border transition-colors ${
                          isDone
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-600"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Incident Queue & Dispatch Stream */}
        <div className="civic-panel rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Live Incident Queue ({filteredIncidents.length})
              </h2>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Road & Asphalt", "Water Supply", "Air Quality", "Public Safety"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterCategory === cat
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300 bg-zinc-950 border border-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Incident List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncident.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? "bg-zinc-900 border-amber-500/50 shadow-sm"
                      : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                      {inc.id} · {inc.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(inc.severityScore)}`}>
                      {inc.severityScore}/10
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{inc.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{inc.location}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                    <span className="text-cyan-400 font-bold">{inc.routedTo}</span>
                    <span>{inc.reportedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* "New Incident" Modal with Simulated Computer Vision Bounding Box */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Report Civic Hazard via Computer Vision</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                ✕
              </button>
            </div>

            {/* Image Upload Drag Zone */}
            <div
              onClick={() => setSimulatedDetection(true)}
              className="border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-950/60 space-y-2 relative overflow-hidden"
            >
              {simulatedDetection ? (
                <div className="space-y-3">
                  <div className="relative h-44 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {/* Simulated Camera Photo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-stone-800 to-zinc-900 opacity-60" />

                    {/* Simulated Computer Vision Bounding Box */}
                    <div className="absolute inset-6 border-2 border-emerald-400 rounded bg-emerald-500/10 flex flex-col justify-between p-2 animate-pulse">
                      <span className="text-[10px] font-mono font-bold bg-emerald-500 text-zinc-950 px-1.5 py-0.5 rounded self-start">
                        [Detected: Severe Asphalt Fracture (Depth ~8.2cm)]
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 self-end">
                        Confidence: 98.4%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 font-mono font-bold">
                    ✓ Computer Vision Model Classified & Auto-Tagged
                  </p>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-xs font-bold text-zinc-300">
                    Click to capture or upload street/hazard photo
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Auto-analyzes severity, cracks, leaks, and GPS tags
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-zinc-300">Detected Location / Ward</label>
              <input
                type="text"
                readOnly
                value="Auto-GPS: Lat 28.6144° N, Lon 77.2098° E (Ward 8)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setSimulatedDetection(false);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md"
              >
                Dispatch to PWD Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

