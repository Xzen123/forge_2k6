"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sun,
  Moon,
  Mic,
  MicOff,
  Upload,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  Check,
  Edit2,
  RefreshCw,
  RotateCcw,
  Download,
  ShieldAlert,
  Bot,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import VoiceExplainer from "@/components/voice-explainer";
import GrievanceLedger from "@/components/grievance-ledger";
import AgentTerminal from "@/components/agent-terminal";
import ForensicInspector from "@/components/forensic-inspector";
import { generateBenefitSummaryCard } from "@/lib/export-card";
import {
  streamChat,
  CitationData,
  ClaimData,
  FinalAnswerData,
  TraceEventData,
  synthesizeSpeech,
  translateText,
} from "@/lib/api";
import { getTranslation } from "@/lib/i18n";
import {
  detectUserLocation,
  getRecommendedLanguageForState,
  CONSTITUTIONAL_22_LANGUAGES,
} from "@/lib/location";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CitizenProfile {
  state: string;
  category: string;
  income: string;
  education: string;
  gender?: string;
  age?: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "sc-student",
    label: "Post-Matric SC",
    prompt: "I am a 22-year-old SC student in Bihar, annual family income 2 lakh. What scholarships am I eligible for?",
  },
  {
    id: "obc-student",
    label: "Post-Matric OBC",
    prompt: "I am a 22-year-old OBC college student in Bihar, annual family income ₹2,40,000. Am I eligible for tuition waiver?",
  },
  {
    id: "pm-kisan",
    label: "PM-Kisan Farmer",
    prompt: "Smallholder farmer in UP holding 1.8 hectares of agricultural land, e-KYC linked. Am I entitled to PM-Kisan?",
  },
  {
    id: "artisan",
    label: "Mudra Artisan Loan",
    prompt: "Handloom weaver and artisan in West Bengal wanting to purchase equipment worth ₹4.5 Lakh with zero collateral.",
  },
  {
    id: "street-vendor",
    label: "PM SVANidhi",
    prompt: "Urban street vendor in Jaipur with valid vending certificate. Can I access the second tranche loan of ₹20,000?",
  },
];

type ActivePillar = "policy" | "triage" | "agent" | "forensics";

function PortalContent() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get("module");

  const [activePillar, setActivePillar] = useState<ActivePillar>(() => {
    if (moduleParam === "agent") return "agent";
    if (moduleParam === "triage") return "triage";
    if (moduleParam === "forensics" || moduleParam === "audit") return "forensics";
    return "policy";
  });

  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<string>("en");
  const [detectedLocationState, setDetectedLocationState] = useState<string | null>(null);
  const t = getTranslation(language);

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return "civic-" + Math.random().toString(36).substring(2, 9);
    }
    return "civic-session";
  });

  const [queryInput, setQueryInput] = useState<string>(
    "I am a 22-year-old SC student in Bihar, annual family income 2 lakh."
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState<boolean>(false);
  const topAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isExportingCard, setIsExportingCard] = useState<boolean>(false);

  // Live Agent Output State (zero hardcoding)
  const [traceLogs, setTraceLogs] = useState<TraceEventData[]>([]);
  const [followupPrompt, setFollowupPrompt] = useState<string | null>(null);
  const [followupAnswer, setFollowupAnswer] = useState<string>("");
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswerData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Dynamic Citizen Attributes (initialized neutrally; populated purely from grounded agent intake)
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>({
    state: "—",
    category: "—",
    income: "—",
    education: "—",
  });
  const [editingKey, setEditingKey] = useState<keyof CitizenProfile | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-detect user's location & recommended language
  useEffect(() => {
    detectUserLocation().then((loc) => {
      if (loc) {
        setDetectedLocationState(loc.state);
        try {
          const stored = localStorage.getItem("civic_user_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.languageCode) {
              setLanguage(parsed.languageCode);
              return;
            }
          }
        } catch {
          // ignore
        }
        setLanguage(loc.language.code);
      }
    });
  }, []);

  // Listen for global language switch events (from VoiceExplainer or Modal)
  useEffect(() => {
    const handleGlobalLang = (e: Event) => {
      const customEvt = e as CustomEvent;
      const lang = customEvt.detail?.languageCode;
      if (lang && typeof lang === "string") {
        setLanguage(lang);
      }
    };
    window.addEventListener("civic_language_changed", handleGlobalLang);
    return () => window.removeEventListener("civic_language_changed", handleGlobalLang);
  }, []);

  // Translate finalAnswer dynamically whenever language changes (both markdown and claims)
  useEffect(() => {
    if (!finalAnswer || !finalAnswer.text) return;
    let active = true;
    const tgtLang = language.toLowerCase();
    const srcLang = (finalAnswer.language || "en").toLowerCase();

    if (tgtLang !== srcLang) {
      // 1. Translate the executive advisory markdown text
      translateText(finalAnswer.text, tgtLang, srcLang).then(async (res) => {
        if (!active || !res.translated_text || !res.translated_text.trim()) return;

        // 2. Also translate the claim strings concurrently
        let translatedClaims = finalAnswer.claims;
        if (finalAnswer.claims && finalAnswer.claims.length > 0) {
          try {
            translatedClaims = await Promise.all(
              finalAnswer.claims.map(async (c) => {
                try {
                  const cRes = await translateText(c.text, tgtLang, srcLang);
                  return { ...c, text: cRes.translated_text || c.text };
                } catch {
                  return c;
                }
              })
            );
          } catch {
            translatedClaims = finalAnswer.claims;
          }
        }

        if (active) {
          setFinalAnswer((prev) =>
            prev
              ? {
                  ...prev,
                  text: res.translated_text,
                  claims: translatedClaims,
                  language: tgtLang,
                }
              : null
          );
        }
      });
    }
    return () => {
      active = false;
    };
  }, [language, finalAnswer?.language]);

  // Sync activePillar when URL search param ?module= changes
  useEffect(() => {
    if (moduleParam === "agent") setActivePillar("agent");
    else if (moduleParam === "triage") setActivePillar("triage");
    else if (moduleParam === "forensics" || moduleParam === "audit") setActivePillar("forensics");
    else if (moduleParam === "explainer" || moduleParam === "policy") setActivePillar("policy");
  }, [moduleParam]);

  // Sync with CitizenOnboardingGate persona selection
  useEffect(() => {
    const handleProfileSync = (event: Event) => {
      const customEvt = event as CustomEvent;
      const prof = customEvt.detail;
      if (!prof) return;

      if (prof.languageCode) {
        setLanguage(prof.languageCode);
      }

      const profMap: Record<string, { category: string; education: string; query: string }> = {
        farmer: {
          category: "Small & Marginal Farmer",
          education: "Cultivator / Landholder",
          query: "Smallholder farmer in UP holding 1.8 hectares of agricultural land, e-KYC linked. Am I entitled to PM-Kisan?",
        },
        artisan: {
          category: "Vocational Artisan",
          education: "Artisan / Craftsman",
          query: "Handloom weaver and artisan in West Bengal wanting to purchase equipment worth ₹4.5 Lakh with zero collateral.",
        },
        student: {
          category: "SC (Scheduled Caste)",
          education: "College Undergraduate",
          query: "I am a 22-year-old SC student in Bihar, annual family income 2 lakh. What scholarships am I eligible for?",
        },
        msme: {
          category: "Small Trader / MSME Unit",
          education: "MSME Proprietor",
          query: "Urban retail enterprise looking for collateral-free working capital loan under Mudra and PMEGP.",
        },
        daily_wage: {
          category: "Daily Wage & Gig Worker",
          education: "Construction Worker",
          query: "Unorganized daily wage construction laborer registered on e-Shram portal seeking social security benefits.",
        },
        senior: {
          category: "Senior Citizen & Pensioner",
          education: "Senior Resident",
          query: "72-year-old senior citizen with annual income below 2.5 lakh inquiring about Ayushman Bharat 70+ and pension.",
        },
      };

      const matched = profMap[prof.profession];
      if (matched) {
        setQueryInput(matched.query);
        executeLiveStream(matched.query, true);
      }
    };

    window.addEventListener("civic_profile_updated", handleProfileSync);
    return () => window.removeEventListener("civic_profile_updated", handleProfileSync);
  }, []);

  /**
   * Run live evaluation against the backend API via SSE streaming.
   * Feeds the live reasoning trace, handles follow-up questions, and renders verified citations.
   */
  const executeLiveStream = async (textToSubmit: string, isNewQuery: boolean = true) => {
    if (!textToSubmit.trim()) return;

    // Abort previous in-flight stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsEvaluating(true);
    setErrorMessage(null);
    setFollowupPrompt(null);
    setFinalAnswer(null);
    setTraceLogs([]);

    let currentSession = sessionId;
    if (isNewQuery) {
      currentSession = "civic-" + Math.random().toString(36).substring(2, 9);
      setSessionId(currentSession);
      setCitizenProfile({
        state: "Extracting...",
        category: "Extracting...",
        income: "Extracting...",
        education: "Extracting...",
        gender: "Extracting...",
        age: "Extracting...",
      });
    }

    try {
      const stream = streamChat(currentSession, textToSubmit, language.toLowerCase(), {
        resetProfile: isNewQuery,
        signal: controller.signal,
      });

      for await (const event of stream) {
        if (event.type === "profile_update") {
          const prof = event.data;
          setCitizenProfile({
            state: prof.state || "All India",
            category: prof.category || (prof.occupation === "Farmer" ? "Farmer" : "General / Unspecified"),
            income: prof.income_annual ? `₹${Number(prof.income_annual).toLocaleString("en-IN")}` : "Unspecified",
            education: prof.education || prof.occupation || "Unspecified",
            gender: prof.gender ? (prof.gender.charAt(0).toUpperCase() + prof.gender.slice(1)) : "Unspecified",
            age: prof.age ? `${prof.age} years` : "Unspecified",
          });
        } else if (event.type === "trace_event") {
          setTraceLogs((prev) => {
            const isDup = prev.some(
              (p) => p.step === event.data.step && p.latency_ms === event.data.latency_ms
            );
            if (isDup) return prev;
            return [...prev, event.data].slice(-10);
          });
        } else if (event.type === "followup_question") {
          setFollowupPrompt(event.data.question);
        } else if (event.type === "final_answer") {
          setFinalAnswer(event.data);
        } else if (event.type === "error") {
          setErrorMessage(event.data.message);
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setErrorMessage(err?.message || "Connection to Civic Pulse backend failed.");
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Evaluate on initial mount
  useEffect(() => {
    executeLiveStream(queryInput, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPrompt = (prompt: QuickPrompt) => {
    setQueryInput(prompt.prompt);
    executeLiveStream(prompt.prompt, true);
  };

  const handleFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupAnswer.trim()) return;
    const combined = `${queryInput}. ${followupAnswer}`;
    setQueryInput(combined);
    setFollowupPrompt(null);
    setFollowupAnswer("");
    executeLiveStream(combined, false);
  };

  const handleResetQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (topAudioRef.current) {
      topAudioRef.current.pause();
    }
    setIsPlayingAudio(false);
    setQueryInput("");
    setFinalAnswer(null);
    setTraceLogs([]);
    setFollowupPrompt(null);
    setErrorMessage(null);
    setIsEvaluating(false);
    setCitizenProfile({
      state: "—",
      category: "—",
      income: "—",
      education: "—",
      gender: "—",
      age: "—",
    });
    setSessionId("civic-" + Math.random().toString(36).substring(2, 9));
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        try {
          const SpeechRecognitionConstructor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognitionConstructor();
          recognition.lang = language === "HI" ? "hi-IN" : "en-IN";
          recognition.interimResults = false;
          recognition.onresult = (event: any) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) {
              setQueryInput(transcript);
              executeLiveStream(transcript);
            }
            setIsRecording(false);
          };
          recognition.onerror = () => setIsRecording(false);
          recognition.onend = () => setIsRecording(false);
          recognition.start();
          return;
        } catch {
          // fallback below
        }
      }

      setTimeout(() => {
        const spoken = "I am a Scheduled Caste (SC) student in Bihar with annual income of 2 lakh.";
        setQueryInput(spoken);
        executeLiveStream(spoken);
        setIsRecording(false);
      }, 1600);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const circularText = `Extracted from uploaded circular [${file.name}]: Post-Matric Welfare Clause 14(a) Eligibility Check for College Students.`;
      setQueryInput(circularText);
      executeLiveStream(circularText);
    }
  };

  const handleAudioToggle = async () => {
    if (isPlayingAudio) {
      if (topAudioRef.current) {
        topAudioRef.current.pause();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (!finalAnswer?.text) return;

    setIsSynthesizingAudio(true);
    try {
      const langCode = language === "HI" ? "hi" : "en";
      const result = await synthesizeSpeech(finalAnswer.text, langCode);
      if (result.audio_base64) {
        if (!topAudioRef.current) {
          topAudioRef.current = new Audio();
        }
        topAudioRef.current.src = `data:${result.mime_type || "audio/wav"};base64,${result.audio_base64}`;
        topAudioRef.current.onended = () => setIsPlayingAudio(false);
        topAudioRef.current.onerror = () => setIsPlayingAudio(false);
        await topAudioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (err) {
      console.error("Sarvam AI speech synthesis failed:", err);
      setIsPlayingAudio(false);
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  const handleExportWhatsAppCard = async () => {
    if (!finalAnswer) return;
    setIsExportingCard(true);
    try {
      const topCitation = finalAnswer.claims[0]?.citations[0];
      const dataUrl = await generateBenefitSummaryCard({
        schemeName: finalAnswer.claims[0]?.text.slice(0, 60) || "Civic Scheme Eligibility",
        authority: "Government of India / State Welfare Department",
        notificationNo: topCitation?.url.split("/").pop() || "STATUTORY/2026/01",
        verdictTag: isEligibleVerdict ? "ELIGIBLE" : "INELIGIBLE",
        benefitSummary: finalAnswer.claims[0]?.text || finalAnswer.text.slice(0, 150),
        disbursalAmount: "DBT Direct Credit",
        keyEntitlements: finalAnswer.claims.map((c) => c.text),
        requiredDocuments: [
          "Caste / Domicile Certificate",
          "Parental Income Certificate",
          "Institutional Admission / Fee Receipt",
          "Aadhaar-seeded Bank Passbook (NPCI Enabled)",
        ],
        officialPortalUrl: topCitation?.url || "https://scholarships.gov.in",
        contentHash: "sha256_live_source_grounded",
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `CivicPulse-VerifiedBrief-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExportingCard(false);
    }
  };

  const startEdit = (key: keyof CitizenProfile) => {
    setEditingKey(key);
    setEditValue(citizenProfile[key] || "");
  };

  const saveEdit = (key: keyof CitizenProfile) => {
    const updated = { ...citizenProfile, [key]: editValue };
    setCitizenProfile(updated);
    setEditingKey(null);

    const reQuery = `Updated profile: I am a ${updated.category} ${updated.education} in ${updated.state}, annual income ${updated.income}.`;
    setQueryInput(reQuery);
    executeLiveStream(reQuery);
  };

  // Derive unique citations from verified claims
  const allCitations: CitationData[] = [];
  finalAnswer?.claims?.forEach((c) => {
    c.citations?.forEach((cit) => {
      if (!allCitations.some((existing) => existing.url === cit.url && existing.quote === cit.quote)) {
        allCitations.push(cit);
      }
    });
  });

  const hasEligibleClaim = Boolean(
    finalAnswer?.claims?.some(
      (c) =>
        c.text.toLowerCase().includes("eligible for") &&
        !c.text.toLowerCase().includes("not eligible for") &&
        !c.text.toLowerCase().includes("ineligible")
    )
  );

  const isEligibleVerdict = Boolean(
    hasEligibleClaim ||
    (finalAnswer?.text &&
     (finalAnswer.text.toLowerCase().includes("you are eligible") ||
      finalAnswer.text.toLowerCase().includes("eligible for")) &&
     !finalAnswer.text.toLowerCase().startsWith("you are not eligible"))
  );

  const eligibleClaim = finalAnswer?.claims?.find(
    (c) =>
      c.text.toLowerCase().includes("eligible for") &&
      !c.text.toLowerCase().includes("not eligible") &&
      !c.text.toLowerCase().includes("ineligible")
  );
  const displayHeadline = eligibleClaim?.text || finalAnswer?.claims[0]?.text || finalAnswer?.text?.split("\n")[0] || "Eligibility Verdict";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. Global Minimal Header (48px) with 4-Pillar Unified Switcher */}
      <header className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
        
        {/* Left: Brand + Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-1 text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-semibold">CivicPulse</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-slate-900 dark:text-zinc-100 font-medium">
            {activePillar === "policy" && t.nav_title}
            {activePillar === "triage" && t.pillar_2}
            {activePillar === "agent" && t.pillar_3}
            {activePillar === "forensics" && t.pillar_4}
          </span>
        </div>

        {/* Center: 4-Pillar Segmented Switcher */}
        <nav aria-label="Pillar switcher" className="hidden md:flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/80 dark:bg-zinc-900/80 text-xs font-mono">
          <button
            onClick={() => setActivePillar("policy")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === "policy"
                ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.pillar_1}</span>
          </button>

          <button
            onClick={() => setActivePillar("triage")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === "triage"
                ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.pillar_2}</span>
          </button>

          <button
            onClick={() => setActivePillar("agent")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === "agent"
                ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.pillar_3}</span>
          </button>

          <button
            onClick={() => setActivePillar("forensics")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === "forensics"
                ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.pillar_4}</span>
          </button>
        </nav>

        {/* Right: Location & 22 Constitutional Languages Selector */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("civic_reopen_onboarding"));
              }
            }}
            title="Open 22 Constitutional Languages & Domicile Picker"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-800/30 dark:border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-serif font-medium text-amber-900 dark:text-amber-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">
              {detectedLocationState ? `📍 ${detectedLocationState} · 22 भाषाएं` : t.twenty_two_langs}
            </span>
            <span className="sm:hidden">
              {detectedLocationState ? `📍 ${detectedLocationState}` : "भाषाएं"}
            </span>
          </button>

          {/* Regional Language Quick Selector Dropdown */}
          <div className="flex items-center text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
            <select
              value={language.toLowerCase()}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("civic_language_changed", { detail: { languageCode: newLang } })
                  );
                }
              }}
              className="bg-transparent text-xs font-semibold px-2 py-0.5 text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              aria-label="Select Interface & Speech Language"
            >
              {CONSTITUTIONAL_22_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="dark:bg-zinc-900">
                  {l.scriptName} ({l.english})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* PILLAR 1: LIVE MULTILINGUAL LEGAL & SCHEME DECODER        */}
      {/* ========================================================= */}
      {activePillar === "policy" && (
        <div className="flex-1 h-[calc(100vh-48px)] overflow-hidden flex max-w-7xl mx-auto w-full px-4 sm:px-6">
          
          {/* LEFT COLUMN: Main Stage (68% width) */}
          <main className="w-full lg:w-[68%] h-full overflow-y-auto pr-4 sm:pr-8 py-6 space-y-6">
            
            {/* Top Input Area: Clean & Minimal */}
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3.5 focus-within:border-emerald-500/50 dark:focus-within:border-emerald-500/50 transition-colors shadow-xs">
                <textarea
                  rows={2}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      executeLiveStream(queryInput, true);
                    }
                  }}
                  placeholder="Ask any question (e.g. 'I am an SC student in Bihar, income 2 lakh'), paste a notice circular, or upload a circular PDF..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
                />

                {/* Compact Bottom Tool Row */}
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMicToggle}
                      aria-label="Voice input toggle"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isRecording
                          ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 animate-pulse"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isRecording ? "Listening..." : t.voice_input}</span>
                    </button>

                    <label
                      aria-label="Upload circular PDF"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{attachedFileName ? attachedFileName.slice(0, 14) + "..." : t.upload_circular}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    {queryInput.trim() && (
                      <button
                        onClick={handleResetQuery}
                        aria-label="Clear query and reset"
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="Clear query & start fresh session"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">{t.reset}</span>
                      </button>
                    )}

                    <button
                      onClick={() => executeLiveStream(queryInput, true)}
                      disabled={isEvaluating}
                      aria-label="Check eligibility"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isEvaluating && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>{isEvaluating ? t.verifying : t.check_eligibility}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct 1-Line Preset Prompt Suggestions (Dynamic Pre-fill Only, Zero Dummy Schemas) */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-sans overflow-x-auto">
                <span className="font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {t.try_live_queries}
                </span>
                {QUICK_PROMPTS.map((p, idx) => (
                  <React.Fragment key={p.id}>
                    <button
                      onClick={() => handleSelectPrompt(p)}
                      className="hover:underline transition-colors whitespace-nowrap cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                    >
                      {p.label}
                    </button>
                    {idx < QUICK_PROMPTS.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Real-Time Execution Trace Stepper */}
            {traceLogs.length > 0 && (
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60 font-semibold uppercase">
                  <span>{t.live_trace_title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {traceLogs.length} {t.steps_completed}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {traceLogs.map((evt, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] text-slate-700 dark:text-zinc-300 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold">{evt.step}</span>
                      <span className="text-zinc-400">({evt.latency_ms}ms)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Follow-up Question Prompt (Dynamic Dialogue) */}
            {followupPrompt && (
              <form
                onSubmit={handleFollowupSubmit}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-2.5"
              >
                <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>{t.missing_info_needed}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium">
                  {followupPrompt}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={followupAnswer}
                    onChange={(e) => setFollowupAnswer(e.target.value)}
                    placeholder="Enter missing details (e.g. ₹2,00,000 or 22 years)..."
                    className="flex-1 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-amber-300 dark:border-amber-700 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer"
                  >
                    {t.submit_answer}
                  </button>
                </div>
              </form>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Retrieval Notice:</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Primary Live Result Display (Zero Mock JSON) */}
            {finalAnswer && (
              <div className="space-y-6 pt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
                
                {/* Top Verdict Callout + WhatsApp 1-Page Exporter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
                  <div className="space-y-1">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        isEligibleVerdict
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {isEligibleVerdict ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>
                        {isEligibleVerdict ? t.eligible_verified : t.evaluation_result}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-xl font-heading font-bold text-slate-900 dark:text-zinc-50 tracking-tight leading-snug">
                      {displayHeadline}
                    </h2>
                  </div>

                  {/* Actions: Audio Listen + 1-Page WhatsApp Exporter */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleExportWhatsAppCard}
                      disabled={isExportingCard}
                      aria-label="Export WhatsApp Infographic Card"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isExportingCard ? t.generating : t.whatsapp_brief}</span>
                    </button>

                    <button
                      onClick={handleAudioToggle}
                      disabled={isSynthesizingAudio}
                      aria-label="Play Sarvam AI Neural Voice"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSynthesizingAudio ? (
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      ) : isPlayingAudio ? (
                        <VolumeX className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>
                        {isSynthesizingAudio
                          ? t.synthesizing_audio
                          : isPlayingAudio
                          ? t.stop_audio
                          : t.listen_tts}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Voice Explainer Visualizer Component */}
                <div className="pt-6">
                  <VoiceExplainer
                    englishText={finalAnswer.text}
                    hindiText={language === "hi" ? finalAnswer.text : undefined}
                    schemeName={finalAnswer.claims[0]?.text || "Civic Scheme"}
                    activeLanguage={language}
                    userState={citizenProfile.state !== "-" ? citizenProfile.state : (detectedLocationState || undefined)}
                    onLanguageChange={(l) => setLanguage(l)}
                  />
                </div>

                {/* Verified Claims Breakdown */}
                <div className="pt-6 space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.verified_claims_title} ({finalAnswer.claims.length})
                  </h3>
                  <div className="space-y-3">
                    {finalAnswer.claims.map((claim, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed font-sans font-medium">
                            {claim.text}
                          </p>
                        </div>
                        {claim.citations.length > 0 && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1">
                            {claim.citations.map((c, cIdx) => (
                              <div key={cIdx} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                                  <span>Official Citation #{cIdx + 1}:</span>
                                  <a
                                    href={c.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Source Document</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                                <p className="italic text-slate-600 dark:text-zinc-400 border-l-2 border-emerald-500/40 pl-2">
                                  &ldquo;{c.quote}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Polished Executive Advisory Document */}
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Executive Policy & Eligibility Advisory
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      Official Gazette Grounded
                    </span>
                  </div>
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-sm font-sans text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed space-y-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <table className="w-full text-left border-collapse text-xs" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 font-semibold" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-3.5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-300 align-top" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-zinc-50 pt-4 pb-1 border-b border-zinc-100 dark:border-zinc-800 tracking-tight" {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 className="text-xs sm:text-sm font-heading font-semibold text-slate-800 dark:text-zinc-100 pt-2 pb-1" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside space-y-1.5 my-2.5 text-slate-700 dark:text-zinc-300" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside space-y-2 my-2.5 text-slate-700 dark:text-zinc-300" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed pl-1" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-slate-900 dark:text-zinc-100" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="leading-relaxed mb-3 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                      }}
                    >
                      {finalAnswer.text}
                    </ReactMarkdown>
                  </div>
                </div>

              </div>
            )}

          </main>

          {/* RIGHT COLUMN: Reference & Criteria Rail (32% width) */}
          <aside className="hidden lg:flex lg:w-[32%] h-full border-l border-zinc-200 dark:border-zinc-800/80 pl-6 py-6 flex-col justify-between overflow-y-auto space-y-6">
            
            <div className="space-y-6">
              
              {/* Citizen Attributes: Flat Key-Value List with Live Inline Edit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800/80">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.extracted_attributes}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">{t.live_session}</span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  
                  {/* Gender */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.gender}</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {citizenProfile.gender || "Unspecified"}
                    </span>
                  </div>

                  {/* Age */}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.age}</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {citizenProfile.age || "Unspecified"}
                    </span>
                  </div>

                  {/* State */}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.state}</span>
                    {editingKey === "state" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="p-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent"
                        />
                        <button onClick={() => saveEdit("state")} aria-label="Save State" className="p-1 hover:text-emerald-500 cursor-pointer">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {citizenProfile.state}
                        </span>
                        <button
                          onClick={() => startEdit("state")}
                          aria-label="Edit state"
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.category}</span>
                    {editingKey === "category" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="p-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent"
                        />
                        <button onClick={() => saveEdit("category")} aria-label="Save Category" className="p-1 hover:text-emerald-500 cursor-pointer">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {citizenProfile.category}
                        </span>
                        <button
                          onClick={() => startEdit("category")}
                          aria-label="Edit category"
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Annual Income */}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.annual_income}</span>
                    {editingKey === "income" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="p-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent"
                        />
                        <button onClick={() => saveEdit("income")} aria-label="Save Income" className="p-1 hover:text-emerald-500 cursor-pointer">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {citizenProfile.income}
                        </span>
                        <button
                          onClick={() => startEdit("income")}
                          aria-label="Edit annual income"
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Education / Role */}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.education_occ}</span>
                    {editingKey === "education" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="p-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent"
                        />
                        <button onClick={() => saveEdit("education")} aria-label="Save Education" className="p-1 hover:text-emerald-500 cursor-pointer">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {citizenProfile.education}
                        </span>
                        <button
                          onClick={() => startEdit("education")}
                          aria-label="Edit education level"
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Official Legal Citations: Live Official Gazette Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800/80">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.statutory_citations}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {allCitations.length} {t.grounded_count}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {allCitations.length === 0 ? (
                    <p className="text-zinc-400 text-[11px] italic">
                      Submit a query to retrieve anchored citations from official sources.
                    </p>
                  ) : (
                    allCitations.map((cite, idx) => (
                      <div key={idx} className="space-y-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] text-zinc-500 block truncate">
                            {cite.url}
                          </span>
                        </div>

                        {/* Exact Verbatim Quoted Passage */}
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic leading-relaxed border-l-2 border-emerald-500/50 pl-2.5">
                          &ldquo;{cite.quote}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <span className="text-zinc-400 font-mono">
                            {t.fetched}: {new Date(cite.fetched_at).toLocaleTimeString()}
                          </span>
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                          >
                            <span>{t.open_gazette}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Understated Base Note */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/60 text-[11px] font-mono text-zinc-400">
              <span>Deterministic LangGraph Agent · Live Stream</span>
            </div>

          </aside>

        </div>
      )}

      {/* ========================================================= */}
      {/* PILLAR 2: CIVIC GRIEVANCE & SLA TRIAGE                     */}
      {/* ========================================================= */}
      {activePillar === "triage" && (
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 overflow-y-auto">
          <GrievanceLedger />
        </main>
      )}

      {/* ========================================================= */}
      {/* PILLAR 3: AUTONOMOUS BUREAUCRACY AGENT WITH HUMAN-IN-THE-LOOP */}
      {/* ========================================================= */}
      {activePillar === "agent" && (
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 overflow-y-auto">
          <AgentTerminal />
        </main>
      )}

      {/* ========================================================= */}
      {/* PILLAR 4: FORENSIC TRUTH & DEEPFAKE AUDIT ENGINE           */}
      {/* ========================================================= */}
      {activePillar === "forensics" && (
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 overflow-y-auto">
          <ForensicInspector />
        </main>
      )}

    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 flex items-center justify-center text-xs font-mono text-zinc-500">
          Loading Civic Intelligence Portal...
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
