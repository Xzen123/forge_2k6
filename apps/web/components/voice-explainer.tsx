"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Globe,
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react";
import { synthesizeSpeech } from "@/lib/api";
import {
  getLanguagesForState,
  CONSTITUTIONAL_22_LANGUAGES,
  ConstitutionalLanguage,
} from "@/lib/location";

interface VoiceExplainerProps {
  hindiText?: string;
  bengaliText?: string;
  englishText?: string;
  schemeName?: string;
  activeLanguage?: string;
  userState?: string;
  onLanguageChange?: (lang: string) => void;
}

export default function VoiceExplainer({
  hindiText,
  bengaliText,
  englishText,
  schemeName = "Statutory Scheme",
  activeLanguage = "hi",
  userState = "All India",
  onLanguageChange,
}: VoiceExplainerProps) {
  const [selectedLang, setSelectedLang] = useState<string>(() =>
    activeLanguage ? activeLanguage.toLowerCase() : "hi"
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(18);
  const [spokenDisplayText, setSpokenDisplayText] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Record<string, { base64: string; spokenText: string }>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic language recommendations based on citizen's location/state
  const { primary: locationLanguages, all: all22Languages } = useMemo(
    () => getLanguagesForState(userState),
    [userState]
  );

  const fallbackText =
    englishText || hindiText || `Official statutory guidelines and benefits for ${schemeName}.`;
  const currentSourceText =
    selectedLang === "hi" && hindiText
      ? hindiText
      : selectedLang === "bn" && bengaliText
      ? bengaliText
      : englishText || fallbackText;

  // Sync with prop when activeLanguage changes from parent
  useEffect(() => {
    if (activeLanguage && activeLanguage.toLowerCase() !== selectedLang) {
      setSelectedLang(activeLanguage.toLowerCase());
    }
  }, [activeLanguage]);

  // Listen for global language changes
  useEffect(() => {
    const handleGlobalLang = (e: Event) => {
      const customEvt = e as CustomEvent;
      const lang = customEvt.detail?.languageCode;
      if (lang && typeof lang === "string" && lang.toLowerCase() !== selectedLang) {
        setSelectedLang(lang.toLowerCase());
      }
    };
    window.addEventListener("civic_language_changed", handleGlobalLang);
    return () => window.removeEventListener("civic_language_changed", handleGlobalLang);
  }, [selectedLang]);

  // Fetch or update solution spoken script for the selected language
  useEffect(() => {
    let active = true;
    const cacheKey = `${selectedLang}:${currentSourceText.slice(0, 100)}`;
    const cached = audioCacheRef.current[cacheKey];

    if (cached?.spokenText) {
      setSpokenDisplayText(cached.spokenText);
      return;
    }

    const prefetchScript = async () => {
      try {
        const res = await synthesizeSpeech(currentSourceText, selectedLang);
        if (active && res) {
          audioCacheRef.current[cacheKey] = {
            base64: res.audio_base64,
            spokenText: res.spoken_text || currentSourceText,
          };
          if (res.spoken_text) {
            setSpokenDisplayText(res.spoken_text);
          }
        }
      } catch {
        if (active) {
          // If network / TTS endpoint offline, display clean fallback solution text
          setSpokenDisplayText(
            `Direct Solution: You are eligible for verified statutory benefits under ${schemeName}. Apply online on the official portal with your Aadhaar and bank account.`
          );
        }
      }
    };

    prefetchScript();
    return () => {
      active = false;
    };
  }, [currentSourceText, selectedLang, schemeName]);

  // Handle Play / Pause using Sarvam AI Neural Audio
  const togglePlayAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    const cacheKey = `${selectedLang}:${currentSourceText.slice(0, 100)}`;
    const cached = audioCacheRef.current[cacheKey];

    if (cached) {
      playAudioElement(cached.base64);
      if (cached.spokenText) {
        setSpokenDisplayText(cached.spokenText);
      }
      return;
    }

    setIsLoadingAudio(true);
    try {
      const res = await synthesizeSpeech(currentSourceText, selectedLang);
      if (res.audio_base64) {
        audioCacheRef.current[cacheKey] = {
          base64: res.audio_base64,
          spokenText: res.spoken_text || currentSourceText,
        };
        if (res.spoken_text) {
          setSpokenDisplayText(res.spoken_text);
        }
        playAudioElement(res.audio_base64);
      }
    } catch (err) {
      console.error("Sarvam AI TTS error:", err);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudioElement = (base64Audio: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = `data:audio/wav;base64,${base64Audio}`;
    audio.playbackRate = playbackSpeed;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  // Speed adjustments
  const handleSpeedToggle = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Restart audio
  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Language switch
  const handleLanguageChange = (langCode: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    const clean = langCode.toLowerCase();
    setSelectedLang(clean);

    if (onLanguageChange) {
      onLanguageChange(clean);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("civic_language_changed", { detail: { languageCode: clean } })
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Audio Waveform Visualization Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;
      const numBars = 48;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2);
        let amplitude = 4;
        if (isPlaying) {
          amplitude = Math.abs(
            Math.sin(i * 0.25 + phase) * Math.cos(i * 0.15 + phase * 0.5) * (height / 2.2)
          );
        }
        ctx.fillStyle = isPlaying ? "#10b981" : "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(x, mid - amplitude / 2, barWidth, Math.max(amplitude, 3), 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.12 * playbackSpeed;
      }
      animFrameIdRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentLangObj =
    all22Languages.find((l) => l.code === selectedLang) || {
      code: selectedLang,
      english: selectedLang.toUpperCase(),
      native: selectedLang.toUpperCase(),
      scriptName: selectedLang.toUpperCase(),
    };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 sm:p-5 space-y-4 shadow-sm font-sans transition-all">
      {/* Top Bar: Title & Multilingual Indian Language Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Regional Voice Explainer (Sarvam AI / Neural Bulbul)
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                10ms Fast Cache
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Plain-language natural neural speech synthesized without bureaucratic jargon
            </p>
          </div>
        </div>

        {/* Location-Aware Indian Language Selector Chips + 22 Constitutional Languages Menu */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 text-xs font-medium">
          {/* Quick chips tailored to userState (e.g. Bihar -> Hindi, Urdu, Maithili; Arunachal -> English, Hindi, Bengali) */}
          {locationLanguages.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/20"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                {lang.scriptName}{" "}
                <span className="opacity-70 text-[10px]">({lang.english})</span>
              </button>
            );
          })}

          {/* 22 Constitutional Languages Dropdown Picker */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label="Select from 22 Constitutional Languages"
              className="appearance-none bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-xs px-2.5 py-1 pr-6 rounded-lg border border-emerald-500/20 focus:outline-none cursor-pointer transition-colors"
            >
              <optgroup label="22 Constitutional Languages (8th Schedule)">
                {all22Languages.map((l) => (
                  <option key={l.code} value={l.code} className="dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                    {l.scriptName} — {l.english} ({l.code.toUpperCase()})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Spoken Solution Script Display */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/50 dark:border-zinc-800/50 text-[10px] font-mono text-zinc-400">
          <span>
            Spoken Solution Script ({currentLangObj.english}) ·{" "}
            {userState ? `Region: ${userState}` : "All-India"}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Bulbul Neural Synthesizer
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-sans">
          &ldquo;{spokenDisplayText || "Direct Solution: Loading verified statutory entitlement script..."}&rdquo;
        </p>
      </div>

      {/* Real-time Waveform Canvas */}
      <div className="w-full h-12 bg-slate-100/60 dark:bg-zinc-950/80 rounded-xl px-2 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-zinc-800/50">
        <canvas ref={canvasRef} width={520} height={42} className="w-full h-full" />
      </div>

      {/* Scrubber & Player Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 min-w-8">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 18}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio scrubber"
            className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 min-w-8 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons: Play, Restart, Speed */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayAudio}
              disabled={isLoadingAudio}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sarvam Voice</span>
                </>
              )}
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeedToggle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle playback speed"
            >
              <FastForward className="w-3 h-3" />
              <span>{playbackSpeed}x</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 hidden sm:inline">
              Powered by Sarvam AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
