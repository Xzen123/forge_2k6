"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatInterface from "@/components/ChatInterface";
import SourcesPanel from "@/components/SourcesPanel";
import Header from "@/components/Header";

export default function Home() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1630] to-[#0a0f1e]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <ChatInterface sessionId={sessionId} />
        <aside className="hidden lg:block">
          <SourcesPanel />
        </aside>
      </div>
      <footer className="text-center text-xs text-slate-500 py-4 px-4">
        ⚠️ Civic Pulse provides <strong>informational guidance only</strong>. Always verify
        eligibility and apply at the <strong>official government portal</strong>. The official
        portal is the final authority.
      </footer>
    </main>
  );
}
