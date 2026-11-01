"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/landing/Navbar";
import ViewportIndicator from "@/components/landing/ViewportIndicator";
import HeroCarouselSection from "@/components/landing/HeroCarouselSection";
import BentoPillarsSection from "@/components/landing/BentoPillarsSection";
import TelemetryChartsSection from "@/components/landing/TelemetryChartsSection";
import SandboxSection from "@/components/landing/SandboxSection";
import ClosingLaunchSection from "@/components/landing/ClosingLaunchSection";

const SECTIONS = [
  { id: "hero", label: "Overview", number: "01" },
  { id: "pillars", label: "Pillars", number: "02" },
  { id: "telemetry", label: "Live Telemetry", number: "03" },
  { id: "sandbox", label: "Interactive Sandpit", number: "04" },
  { id: "deploy", label: "Deploy", number: "05" },
];

export default function LandingPage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [activeSection, setActiveSection] = useState<string>("hero");
  const mainRef = useRef<HTMLElement>(null);

  // IntersectionObserver to sync activeSection with scroll snap
  useEffect(() => {
    const sectionElements = SECTIONS.map((sec) =>
      document.getElementById(sec.id)
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: mainRef.current,
        threshold: 0.55,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <main
      ref={mainRef}
      className="h-screen w-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-transparent text-slate-900 dark:text-zinc-50 transition-colors duration-500 relative"
    >
      {/* Floating Dynamic Glass Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeSection={activeSection}
        onNavigateSection={scrollToSection}
      />

      {/* Right-Hand Sticky Viewport Dots Indicator */}
      <ViewportIndicator
        sections={SECTIONS}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      {/* SECTION 1: HERO + DUAL-CARD HORIZONTAL CAROUSEL (100dvh) */}
      <HeroCarouselSection onWatchDemoClick={() => scrollToSection("sandbox")} />

      {/* SECTION 2: THE 4 HIGH-IMPACT PILLARS (BENTO SHOWCASE) */}
      <BentoPillarsSection />

      {/* SECTION 3: REAL-TIME TELEMETRY & ANIMATED CHARTS (100dvh) */}
      <TelemetryChartsSection />

      {/* SECTION 4: INTERACTIVE LIVE SANDBOX (TRY BEFORE ACCESS) */}
      <SandboxSection />

      {/* SECTION 5: DEPLOYMENT & CONVERSION FOOTER (100dvh) */}
      <ClosingLaunchSection />
    </main>
  );
}
