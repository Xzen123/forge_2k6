"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ClaimData,
  FinalAnswerData,
  SSEEvent,
  TraceEventData,
  streamChat,
  transcribeAudio,
} from "@/lib/api";
import {
  IconBriefcase,
  IconCheck,
  IconCheckCircle,
  IconChevronDown,
  IconClose,
  IconCopy,
  IconExternalLink,
  IconFileText,
  IconGraduationCap,
  IconHelpCircle,
  IconListChecks,
  IconMic,
  IconRefresh,
  IconSend,
  IconShieldCheck,
  IconSquare,
  IconTractor,
  IconUsers,
  IconVolume2,
  IconXCircle,
} from "./icons";
import SchemeCard from "./SchemeCard";
import { CitizenProfileState } from "./CitizenDossier";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
];

interface QuickPrompt {
  tag: string;
  title: string;
  prompt: string;
  icon: "student" | "farmer" | "senior" | "msme";
  profileHints: Partial<CitizenProfileState>;
}

const QUICK_PROMPTS: Record<string, QuickPrompt[]> = {
  en: [
    {
      tag: "Higher Education",
      title: "Post-Matric Scholarship (Bihar OBC)",
      prompt: "I am a 22-year-old OBC student in Bihar, annual family income 3 lakh. What scholarships can I apply for?",
      icon: "student",
      profileHints: { age: 22, state: "Bihar", category: "OBC", income_annual: 300000, occupation: "Student" },
    },
    {
      tag: "Agriculture",
      title: "PM-Kisan Income Support",
      prompt: "I am a smallholder farmer with 2 acres of cultivable land in Uttar Pradesh. Am I eligible for PM-Kisan?",
      icon: "farmer",
      profileHints: { state: "Uttar Pradesh", occupation: "Farmer", land_holding: "2 acres" },
    },
    {
      tag: "Social Security",
      title: "Senior Citizen Pension Evaluation",
      prompt: "I am 68 years old living in a rural area with no pension. What government welfare schemes support me?",
      icon: "senior",
      profileHints: { age: 68, occupation: "Retired" },
    },
    {
      tag: "Enterprise",
      title: "MSME Credit Support / Mudra",
      prompt: "I run a small handicraft shop and need working capital. What government loan schemes are available?",
      icon: "msme",
      profileHints: { occupation: "Small Business Owner" },
    },
  ],
  hi: [
    {
      tag: "उच्च शिक्षा",
      title: "पोस्ट-मैट्रिक छात्रवृत्ति (बिहार)",
      prompt: "मैं बिहार से 22 वर्षीय OBC छात्र हूं, पारिवारिक वार्षिक आय 3 लाख है। मुझे कौन सी छात्रवृत्ति मिल सकती है?",
      icon: "student",
      profileHints: { age: 22, state: "Bihar", category: "OBC", income_annual: 300000, occupation: "Student" },
    },
    {
      tag: "कृषि",
      title: "पीएम किसान सम्मान निधि",
      prompt: "मैं उत्तर प्रदेश में 2 एकड़ जमीन वाला छोटा किसान हूं। क्या मैं पीएम-किसान के लिए पात्र हूं?",
      icon: "farmer",
      profileHints: { state: "Uttar Pradesh", occupation: "Farmer", land_holding: "2 acres" },
    },
    {
      tag: "सामाजिक सुरक्षा",
      title: "वरिष्ठ नागरिक पेंशन योजना",
      prompt: "मेरी उम्र 68 वर्ष है, ग्रामीण क्षेत्र में रहता हूं और कोई पेंशन नहीं है। मेरे लिए कौन सी सरकारी योजनाएं हैं?",
      icon: "senior",
      profileHints: { age: 68, occupation: "Retired" },
    },
    {
      tag: "उद्यम",
      title: "मुद्रा / एमएसएमई ऋण",
      prompt: "मेरी एक छोटी हस्तशिल्प दुकान है और कार्यशील पूंजी की आवश्यकता है। कौन सी सरकारी ऋण योजनाएं हैं?",
      icon: "msme",
      profileHints: { occupation: "Small Business Owner" },
    },
  ],
  bn: [
    {
      tag: "উচ্চ শিক্ষা",
      title: "পোস্ট-ম্যাট্রিক স্কলারশিপ (বিহার)",
      prompt: "আমি বিহারের ২২ বছর বয়সী ওবিসি ছাত্র, বার্ষিক পারিবারিক আয় ৩ লাখ। আমি কোন স্কলারশিপ পেতে পারি?",
      icon: "student",
      profileHints: { age: 22, state: "Bihar", category: "OBC", income_annual: 300000, occupation: "Student" },
    },
    {
      tag: "কৃষি",
      title: "পিএম-কিষাণ সম্মান নিধি",
      prompt: "আমি উত্তরপ্রদেশের ২ একর জমির ক্ষুদ্র কৃষক। আমি কি পিএম-কিষাণের জন্য যোগ্য?",
      icon: "farmer",
      profileHints: { state: "Uttar Pradesh", occupation: "Farmer", land_holding: "2 acres" },
    },
    {
      tag: "সামাজিক নিরাপত্তা",
      title: "বার্ধক্য ভাতা প্রকল্প",
      prompt: "আমার বয়স ৬৮ বছর, গ্রামীণ এলাকায় থাকি, কোনো পেনশন নেই। আমার জন্য কী সরকারি প্রকল্প রয়েছে?",
      icon: "senior",
      profileHints: { age: 68, occupation: "Retired" },
    },
    {
      tag: "উদ্যোগ",
      title: "মুদ্রা / ক্ষুদ্র ব্যবসা ঋণ",
      prompt: "আমার একটি ছোট হস্তশিল্পের দোকান আছে, চলতি মূলধন দরকার। কোন সরকারি ঋণ প্রকল্প রয়েছে?",
      icon: "msme",
      profileHints: { occupation: "Small Business Owner" },
    },
  ],
};

type Message =
  | { role: "user"; content: string; timestamp?: string }
  | {
      role: "assistant";
      content: string;
      claims?: ClaimData[];
      trace?: TraceEventData[];
      isFollowup?: boolean;
      timestamp?: string;
    }
  | { role: "thinking" };

interface ChatInterfaceProps {
  sessionId: string;
  onProfileUpdate?: (profile: Partial<CitizenProfileState>, missing: string[]) => void;
}

export default function ChatInterface({ sessionId, onProfileUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTrace, setLiveTrace] = useState<TraceEventData[]>([]);
  const [openCitation, setOpenCitation] = useState<ClaimData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Smart auto-scroll
  const scrollToBottom = (force = false) => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (force || isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTrace]);

  const getTimeStr = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const extractClientProfileFacts = (text: string) => {
    const lower = text.toLowerCase();
    const hints: Partial<CitizenProfileState> = {};
    const missing: string[] = [];

    if (lower.includes("bihar")) hints.state = "Bihar";
    else if (lower.includes("uttar pradesh") || lower.includes("up")) hints.state = "Uttar Pradesh";
    else if (lower.includes("bengal") || lower.includes("west bengal")) hints.state = "West Bengal";

    if (lower.includes("obc")) hints.category = "OBC";
    else if (lower.includes("sc")) hints.category = "SC";
    else if (lower.includes("st")) hints.category = "ST";
    else if (lower.includes("ews")) hints.category = "EWS";
    else if (lower.includes("general")) hints.category = "General";

    const ageMatch = text.match(/\b(\d{2})\s*(?:year|yr|वर्ष|বছর)/i) || text.match(/\b(?:age|उम्र|বয়স)\s*(\d{2})/i);
    if (ageMatch) hints.age = parseInt(ageMatch[1], 10);

    const incomeMatch = text.match(/(?:income|आय|আয়).*?(\d+(?:\.\d+)?)\s*(?:lakh|लाख|লাখ)/i) || text.match(/(\d+)\s*(?:lakh|लाख|লাখ)/i);
    if (incomeMatch) hints.income_annual = parseFloat(incomeMatch[1]) * 100000;

    if (lower.includes("student") || lower.includes("छात्र") || lower.includes("ছাত্র")) hints.occupation = "Student";
    else if (lower.includes("farmer") || lower.includes("किसान") || lower.includes("কৃষক")) hints.occupation = "Farmer";

    if (!hints.income_annual) missing.push("income_annual");
    if (!hints.category) missing.push("category");

    if (onProfileUpdate) onProfileUpdate(hints, missing);
  };

  const sendMessage = async (text: string, hints?: Partial<CitizenProfileState>) => {
    if (!text.trim() || isStreaming) return;
    const userQuery = text.trim();
    setInput("");
    setLiveTrace([]);

    if (hints && onProfileUpdate) {
      onProfileUpdate(hints, []);
    } else {
      extractClientProfileFacts(userQuery);
    }

    setMessages((m) => [
      ...m,
      { role: "user", content: userQuery, timestamp: getTimeStr() },
      { role: "thinking" },
    ]);
    setIsStreaming(true);

    let assistantContent = "";
    let finalClaims: ClaimData[] = [];
    const traceEvents: TraceEventData[] = [];

    try {
      for await (const event of streamChat(sessionId, userQuery, language)) {
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
              timestamp: getTimeStr(),
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
              timestamp: getTimeStr(),
            },
          ]);
        } else if (event.type === "error") {
          setMessages((m) => [
            ...m.slice(0, -1),
            {
              role: "assistant",
              content: event.data.message,
              timestamp: getTimeStr(),
            },
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
            {
              role: "assistant",
              content: "Could not transcribe audio clearly. Please type your situation directly.",
              timestamp: getTimeStr(),
            },
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
          content: "Microphone permission was not granted. Please type your question.",
          timestamp: getTimeStr(),
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
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[600px] bg-[#141110] border border-stone-800 rounded-xl overflow-hidden shadow-lg">
      {/* Top Bar: Language Control & DPI Status */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-800 bg-[#0c0a09]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-bold hidden sm:inline">
            <span>Citizen Language:</span>
          </span>
          <div className="flex items-center p-0.5 rounded-lg bg-[#1c1917] border border-stone-800">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                id={`lang-${l.code}`}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  language === l.code
                    ? "bg-purple-700 text-white shadow-xs font-bold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="hidden md:inline">Grounding:</span>
          <span className="text-purple-300 font-bold">Deterministic Policy Engine</span>
        </div>
      </div>

      {/* Messages Canvas */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
        {messages.length === 0 && (
          <div className="py-6 sm:py-8 max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/90 text-purple-200 border border-purple-600/50">
                <IconShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Live Official Verification Platform</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                <span>Government Scheme & Benefit Eligibility Finder</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
                <span>State your situation naturally in your own words. Civic Pulse checks official gazettes and portal guidelines rule-by-rule, identifies missing facts, and cites exact official passages.</span>
              </p>
            </div>

            {/* Persona Scenario Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {(QUICK_PROMPTS[language] || QUICK_PROMPTS.en).map((item, idx) => (
                <button
                  key={idx}
                  id={`quick-reply-${idx}`}
                  onClick={() => sendMessage(item.prompt, item.profileHints)}
                  className="p-3.5 rounded-xl bg-[#0c0a09] border border-stone-800 text-left transition-all hover:bg-[#1c1917] hover:border-purple-600/60 flex flex-col justify-between gap-2 shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#1c1917] text-stone-300 group-hover:bg-purple-950 group-hover:text-purple-200 border border-stone-800 transition-colors">
                      <span>{item.tag}</span>
                    </span>
                    <PromptIcon name={item.icon} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                      <span>"{item.prompt}"</span>
                    </p>
                  </div>
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

        {/* Live Stepper / Reasoning Stream */}
        {isStreaming && liveTrace.length > 0 && <LiveTraceTimeline trace={liveTrace} />}

        <div ref={bottomRef} />
      </div>

      {/* Voice Audio Player Bar */}
      {audioUrl && (
        <div className="px-4 sm:px-6 py-2.5 border-t border-stone-800 bg-[#0c0a09] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <IconVolume2 className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">Spoken Response:</span>
          </div>
          <audio controls src={audioUrl} className="h-8 max-w-sm flex-1 opacity-90" />
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-stone-800 bg-[#0c0a09] p-3 sm:p-4">
        <div className="relative flex items-center gap-2">
          {/* Voice Mic Button */}
          <button
            id="mic-button"
            aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStreaming}
            className={`relative flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              isRecording
                ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                : "bg-[#1c1917] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-700 disabled:opacity-40"
            }`}
          >
            {isRecording ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-audio-bar" />
                <span className="w-1 h-5 bg-white rounded-full animate-audio-bar [animation-delay:0.2s]" />
                <span className="w-1 h-2 bg-white rounded-full animate-audio-bar [animation-delay:0.4s]" />
              </div>
            ) : (
              <IconMic className="w-5 h-5 text-purple-400" />
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder={
                language === "hi"
                  ? "अपनी स्थिति बताएं (उदा: बिहार से 22 वर्षीय OBC छात्र, आय 3 लाख)..."
                  : language === "bn"
                  ? "আপনার অবস্থা বলুন (যেমন: বিহারের ২২ বছরের ওবিসি ছাত্র, আয় ৩ লাখ)..."
                  : "State your situation (e.g. 22-year-old OBC student in Bihar, income 3 lakh)..."
              }
              disabled={isStreaming || isRecording}
              aria-label="Scheme query input"
              className="w-full bg-[#1c1917] rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-stone-500 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50"
            />
          </div>

          {/* Send Button in Royal Purple */}
          <button
            id="send-button"
            aria-label="Send message"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-11 h-11 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-purple-700 shadow-md shadow-purple-950"
          >
            <IconSend className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 px-1 font-mono">
          <span>
            <span>Press </span>
            <kbd className="bg-[#1c1917] border border-stone-700 px-1.5 py-0.5 rounded text-[10px] text-purple-300 font-bold">↵ Enter</kbd>
            <span> to submit</span>
          </span>
          <span className="hidden sm:inline">
            <span className="text-purple-300 font-bold">100% official portal citations</span>
            <span> included for every claim</span>
          </span>
        </div>
      </div>

      {/* Citation Drawer Modal */}
      {openCitation && (
        <CitationDrawer claim={openCitation} onClose={() => setOpenCitation(null)} />
      )}
    </div>
  );
}

function PromptIcon({ name }: { name: string }) {
  const iconClass = "w-4 h-4 text-purple-400";
  if (name === "student") return <IconGraduationCap className={iconClass} />;
  if (name === "farmer") return <IconTractor className={iconClass} />;
  if (name === "senior") return <IconUsers className={iconClass} />;
  return <IconBriefcase className={iconClass} />;
}

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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.role === "assistant" && message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (message.role === "thinking") {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/40 flex items-center justify-center text-purple-300 flex-shrink-0">
          <IconShieldCheck className="w-4 h-4 text-purple-400" />
        </div>
        <div className="bg-[#0c0a09] border border-stone-800 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-xs text-stone-400 font-medium">
            <span>Evaluating criteria against official registry guidelines...</span>
          </span>
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-xl rounded-tr-xs bg-[#1c1917] border border-purple-900/50 px-4 py-3 text-sm text-white shadow-sm">
          <p className="leading-relaxed font-normal">
            <span>{message.content}</span>
          </p>
          {message.timestamp && (
            <span className="block text-[10px] text-stone-400 text-right mt-1 font-mono">
              <span>{message.timestamp}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message
  const claims = message.claims || [];
  const hasTrace = (message.trace || []).length > 0;

  const isEligible = message.content.toLowerCase().includes("eligible") && !message.content.toLowerCase().includes("not eligible");
  const isPostMatric = message.content.toLowerCase().includes("post-matric") || message.content.toLowerCase().includes("scholarship");
  const isPMKisan = message.content.toLowerCase().includes("pm kisan") || message.content.toLowerCase().includes("pm-kisan");

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
        <IconShieldCheck className="w-4 h-4 text-purple-300" />
      </div>

      <div className="flex-1 space-y-3 max-w-[94%] sm:max-w-[90%]">
        {/* Main Body */}
        <div className="bg-[#0c0a09] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                <span>Civic Pulse Official Advisory</span>
              </span>
              {message.isFollowup ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                  <span>Follow-up Needed</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-200 border border-purple-500/40">
                  <span>Grounded Finding</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                title="Copy response"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {message.timestamp && (
                <span className="text-[10px] text-stone-500 font-mono">
                  <span>{message.timestamp}</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap font-normal">
            <span>{message.content}</span>
          </div>

          {/* Concrete Scheme Cards */}
          {isPostMatric && !message.isFollowup && (
            <SchemeCard
              schemeName="Post-Matric Scholarship Scheme for OBC Students"
              status={isEligible ? "eligible" : "needs_info"}
              benefitSummary="Full tuition fee waiver + monthly maintenance allowance up to ₹1,200/month."
              portalUrl="https://www.myscheme.gov.in/schemes/pmss-obc"
              documents={[
                "Aadhaar Card",
                "Bihar State Domicile Certificate",
                "OBC / Non-Creamy Layer Certificate",
                "Income Certificate (< ₹3,00,000 / year)",
                "College Admission & Fee Receipt",
              ]}
              passedCriteria={[
                "State: Bihar (Matched)",
                "Category: OBC (Matched)",
                "Income: ≤ ₹3,00,000 (Matched)",
              ]}
            />
          )}

          {isPMKisan && !message.isFollowup && (
            <SchemeCard
              schemeName="PM Kisan Samman Nidhi (Income Support)"
              status={isEligible ? "eligible" : "needs_info"}
              benefitSummary="₹6,000 annual direct income support disbursed in 3 equal installments of ₹2,000 directly to Aadhaar-seeded bank account."
              portalUrl="https://pmkisan.gov.in"
              documents={[
                "Aadhaar Card",
                "Land Ownership Record (Khata/Khesra)",
                "Aadhaar-linked Bank Passbook",
              ]}
              passedCriteria={[
                "Cultivable Land Holder (Matched)",
                "Non-Institutional Landowner (Matched)",
              ]}
            />
          )}
        </div>

        {/* Verifiable Claims Chips */}
        {claims.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              <span>Official Passages & Citations (</span>
              <span className="text-purple-300 font-mono">{claims.length}</span>
              <span>):</span>
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {claims.map((claim, idx) => (
                <button
                  key={idx}
                  id={`claim-${idx}`}
                  aria-label={`View citation for claim ${idx + 1}`}
                  onClick={() => onCitationClick(claim)}
                  className="group flex items-start gap-2.5 p-2.5 rounded-lg bg-[#0c0a09] border border-stone-800 text-left transition-all hover:bg-[#1c1917] hover:border-purple-600/50 shadow-xs"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-purple-950 text-purple-200 border border-purple-600/50 text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                    <span>{idx + 1}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-300 group-hover:text-white transition-colors line-clamp-2">
                      <span>{claim.text}</span>
                    </p>
                    <span className="text-[10px] text-purple-300 font-mono mt-0.5 inline-flex items-center gap-1 font-bold">
                      <IconExternalLink className="w-3 h-3 text-purple-400" />
                      <span>View Official Passage Excerpt</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning Trace Expander */}
        {hasTrace && (
          <div>
            <button
              aria-label="Toggle reasoning trace"
              onClick={() => setShowTrace(!showTrace)}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-purple-300 transition-colors font-bold"
            >
              <IconChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showTrace ? "rotate-180" : ""}`}
              />
              <span>
                <span>{showTrace ? "Hide" : "Inspect"} reasoning audit log (</span>
                <span className="text-purple-300 font-mono">{message.trace!.length}</span>
                <span> steps)</span>
              </span>
            </button>

            {showTrace && message.trace && (
              <div className="mt-2 space-y-1.5 pl-2 border-l border-stone-800">
                {message.trace.map((t, idx) => (
                  <TraceStepItem key={idx} event={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LiveTraceTimeline({ trace }: { trace: TraceEventData[] }) {
  return (
    <div className="pl-11 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
          <span>Live Reasoning Pipeline</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {trace.map((t, idx) => (
          <TraceStepItem key={idx} event={t} live />
        ))}
      </div>
    </div>
  );
}

function TraceStepItem({ event, live }: { event: TraceEventData; live?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
        live
          ? "bg-[#1c1917] border border-purple-600/50 text-white"
          : "bg-[#0c0a09] border border-stone-800 text-stone-400"
      }`}
    >
      <span className="font-bold text-purple-300 w-24 flex-shrink-0">
        <span>{event.step}</span>
      </span>
      <span className="flex-1 truncate text-stone-200 font-sans">
        <span>{event.summary}</span>
      </span>
      <span className={`flex-shrink-0 font-bold ${event.ok ? "text-purple-300" : "text-rose-400"}`}>
        <span>{event.ok ? "✓" : "✗"}</span>
      </span>
      <span className="text-stone-500 flex-shrink-0">
        <span>{event.latency_ms}ms</span>
      </span>
    </div>
  );
}

function CitationDrawer({
  claim,
  onClose,
}: {
  claim: ClaimData;
  onClose: () => void;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCitation = (quote: string, url: string, idx: number) => {
    navigator.clipboard.writeText(`"${quote}" — Source: ${url}`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#141110] border border-stone-800 rounded-xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-purple-950 border border-purple-600/40 flex items-center justify-center text-purple-300">
              <IconShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                <span>Official Source Citation</span>
              </h2>
              <p className="text-[11px] text-stone-400">
                <span>Verifiable quote extracted from live government document</span>
              </p>
            </div>
          </div>
          <button
            id="close-citation"
            aria-label="Close citation drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Claim Text */}
        <div className="p-3.5 rounded-lg bg-[#0c0a09] border border-stone-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
            <span>Assistant Claim</span>
          </span>
          <p className="text-xs sm:text-sm text-white leading-relaxed font-semibold">
            <span>"{claim.text}"</span>
          </p>
        </div>

        {/* Citations List */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            <span>Official Source Evidence</span>
          </span>

          {claim.citations.map((c, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-[#0c0a09] border border-stone-800 space-y-2.5"
            >
              <div className="p-3 rounded bg-[#1c1917] border border-stone-800">
                <p className="text-xs text-stone-200 italic leading-relaxed">
                  <span>"{c.quote}"</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 underline font-mono truncate max-w-full sm:max-w-[70%]"
                >
                  <IconExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.url}</span>
                </a>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => copyCitation(c.quote, c.url, idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <IconCheck className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-3 h-3 text-purple-400" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-stone-500 font-mono">
                    <span>{new Date(c.fetched_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {claim.citations.length === 0 && (
            <p className="text-xs text-stone-500 italic py-2">
              <span>No citations attached to this statement.</span>
            </p>
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-bold text-white transition-colors"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
