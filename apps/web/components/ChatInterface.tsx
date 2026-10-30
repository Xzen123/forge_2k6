"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClaimData,
  FinalAnswerData,
  SSEEvent,
  TraceEventData,
  streamChat,
  transcribeAudio,
} from "@/lib/api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
];

const QUICK_REPLIES = {
  en: [
    "I'm an OBC student from Bihar",
    "Farmer with 2 acres in UP",
    "Senior citizen, 70 years old",
    "Differently-abled person",
  ],
  hi: [
    "मैं बिहार से OBC छात्र हूं",
    "UP में 2 एकड़ का किसान",
    "वरिष्ठ नागरिक, 70 वर्ष",
    "दिव्यांग व्यक्ति",
  ],
  bn: [
    "আমি বিহারের OBC ছাত্র",
    "UP-তে ২ একর জমির কৃষক",
    "প্রবীণ নাগরিক, ৭০ বছর",
    "প্রতিবন্ধী ব্যক্তি",
  ],
};

type Message =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      claims?: ClaimData[];
      trace?: TraceEventData[];
      isFollowup?: boolean;
    }
  | { role: "thinking" };

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTrace, setLiveTrace] = useState<TraceEventData[]>([]);
  const [openCitation, setOpenCitation] = useState<ClaimData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTrace]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");
    setLiveTrace([]);
    setMessages((m) => [...m, { role: "user", content: text }, { role: "thinking" }]);
    setIsStreaming(true);

    let assistantContent = "";
    let finalClaims: ClaimData[] = [];
    const traceEvents: TraceEventData[] = [];

    try {
      for await (const event of streamChat(sessionId, text, language)) {
        if (event.type === "trace_event") {
          traceEvents.push(event.data);
          setLiveTrace([...traceEvents]);
        } else if (event.type === "followup_question") {
          assistantContent = event.data.question;
          setMessages((m) => [
            ...m.slice(0, -1),
            {
              role: "assistant",
              content: assistantContent,
              isFollowup: true,
              trace: [...traceEvents],
            },
          ]);
        } else if (event.type === "final_answer") {
          assistantContent = event.data.text;
          finalClaims = event.data.claims || [];
          if (event.data.audio_url) setAudioUrl(event.data.audio_url);
          setMessages((m) => [
            ...m.slice(0, -1),
            {
              role: "assistant",
              content: assistantContent,
              claims: finalClaims,
              trace: [...traceEvents],
            },
          ]);
        } else if (event.type === "error") {
          setMessages((m) => [
            ...m.slice(0, -1),
            { role: "assistant", content: event.data.message },
          ]);
        }
      }
    } finally {
      setIsStreaming(false);
      setLiveTrace([]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const { transcript, language: detectedLang } = await transcribeAudio(blob);
          if (detectedLang && LANGUAGES.find((l) => l.code === detectedLang)) {
            setLanguage(detectedLang);
          }
          if (transcript) await sendMessage(transcript);
        } catch {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: "Could not understand audio. Please type your question." },
          ]);
        }
      };
      mr.start();
      mediaRef.current = mr;
      setIsRecording(true);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Microphone access denied. Please type your question.",
        },
      ]);
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Language selector */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <span className="text-xs text-slate-400">Language:</span>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            id={`lang-${l.code}`}
            onClick={() => setLanguage(l.code)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              language === l.code
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30">
              🏛️
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Ask about any government scheme</p>
              <p className="text-slate-400 text-sm mt-1">
                Tell me your situation — I'll find schemes you're eligible for.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_REPLIES[language as keyof typeof QUICK_REPLIES]?.map((qr, i) => (
                <button
                  key={i}
                  id={`quick-reply-${i}`}
                  onClick={() => sendMessage(qr)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs text-left transition-all border border-white/10 hover:border-white/20"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onCitationClick={setOpenCitation}
            language={language}
          />
        ))}

        {/* Live trace */}
        {isStreaming && liveTrace.length > 0 && (
          <LiveTrace trace={liveTrace} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Audio player */}
      {audioUrl && (
        <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center gap-2">
          <span className="text-xs text-slate-400">🔊 Audio answer:</span>
          <audio controls src={audioUrl} className="h-8 flex-1" />
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <button
            id="mic-button"
            aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStreaming}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? "bg-rose-600 animate-pulse shadow-lg shadow-rose-500/50"
                : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            }`}
          >
            {isRecording ? "⏹" : "🎤"}
          </button>

          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={
              language === "hi"
                ? "अपनी स्थिति बताएं..."
                : language === "bn"
                ? "আপনার অবস্থা বলুন..."
                : "Describe your situation..."
            }
            disabled={isStreaming || isRecording}
            aria-label="Chat input"
            className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />

          <button
            id="send-button"
            aria-label="Send message"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold disabled:opacity-50 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Citation drawer */}
      {openCitation && (
        <CitationDrawer claim={openCitation} onClose={() => setOpenCitation(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  onCitationClick,
  language,
}: {
  message: Message;
  onCitationClick: (c: ClaimData) => void;
  language: string;
}) {
  const [showTrace, setShowTrace] = useState(false);

  if (message.role === "thinking") {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
          🏛️
        </div>
        <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-lg shadow-indigo-500/20">
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  const claims = message.claims || [];
  const hasTrace = (message.trace || []).length > 0;

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
        🏛️
      </div>
      <div className="flex-1 space-y-2">
        <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed border border-white/10">
          <p className="text-slate-200 whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Claim chips */}
        {claims.length > 0 && (
          <div className="space-y-1">
            {claims.map((claim, i) => (
              <button
                key={i}
                id={`claim-${i}`}
                aria-label={`View citation for claim ${i + 1}`}
                onClick={() => onCitationClick(claim)}
                className="group flex items-start gap-2 w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 transition-all"
              >
                <span className="text-xs bg-indigo-600/80 text-white px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  [{i + 1}]
                </span>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2">
                  {claim.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Trace toggle */}
        {hasTrace && (
          <button
            aria-label="Toggle reasoning trace"
            onClick={() => setShowTrace(!showTrace)}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            {showTrace ? "▲ Hide" : "▼ Show"} reasoning trace ({message.trace!.length} steps)
          </button>
        )}
        {showTrace && message.trace && (
          <div className="space-y-1">
            {message.trace.map((t, i) => (
              <TraceRow key={i} event={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live Trace
// ─────────────────────────────────────────────────────────────────────────────
function LiveTrace({ trace }: { trace: TraceEventData[] }) {
  return (
    <div className="space-y-1 pl-11">
      <p className="text-xs text-slate-500 mb-1">🔄 Live reasoning trace</p>
      {trace.map((t, i) => (
        <TraceRow key={i} event={t} live />
      ))}
    </div>
  );
}

function TraceRow({ event, live }: { event: TraceEventData; live?: boolean }) {
  const stepIcons: Record<string, string> = {
    intake: "👤",
    retrieve: "🔍",
    eligibility: "✅",
    compose: "✍️",
    verify: "🔒",
    respond: "📤",
    ask_followup: "❓",
    no_source: "⚠️",
    fail_safe: "🛡️",
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
        live ? "bg-indigo-950/50 border border-indigo-500/20" : "bg-white/5"
      }`}
    >
      <span>{stepIcons[event.step] || "⚙️"}</span>
      <span className="font-medium text-slate-300 w-24 flex-shrink-0">{event.step}</span>
      <span className="text-slate-500 flex-1 truncate">{event.summary}</span>
      <span className={`flex-shrink-0 ${event.ok ? "text-emerald-400" : "text-rose-400"}`}>
        {event.ok ? "✓" : "✗"}
      </span>
      <span className="text-slate-600 flex-shrink-0">{event.latency_ms}ms</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Citation Drawer
// ─────────────────────────────────────────────────────────────────────────────
function CitationDrawer({ claim, onClose }: { claim: ClaimData; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0d1630] border border-white/10 rounded-t-2xl p-6 space-y-4 max-h-[60vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Citations</h2>
          <button
            id="close-citation"
            aria-label="Close citation drawer"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-indigo-500 pl-3">
          {claim.text}
        </p>

        <div className="space-y-3">
          {claim.citations.map((c, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 space-y-2 border border-white/10">
              <p className="text-xs text-slate-400 italic leading-relaxed">"{c.quote}"</p>
              <div className="flex items-center justify-between">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline truncate max-w-[70%]"
                >
                  {c.url}
                </a>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {new Date(c.fetched_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {claim.citations.length === 0 && (
          <p className="text-xs text-slate-500 italic">No citations available for this claim.</p>
        )}
      </div>
    </div>
  );
}
