"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function InteractiveBackground() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Cinematic weighted drift using spring damping
  const springX = useSpring(mouseX, { damping: 28, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 200 });

  useEffect(() => {
    // Center spotlight initially
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [mouseX, mouseY]);

  // Framer Motion native template string for dynamic radial spotlight without re-rendering React
  const spotlightBackground = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, var(--spotlight-inner) 0%, var(--spotlight-mid) 40%, transparent 80%)`;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none [--spotlight-inner:rgba(16,185,129,0.12)] [--spotlight-mid:rgba(59,130,246,0.06)] dark:[--spotlight-inner:rgba(16,185,129,0.08)] dark:[--spotlight-mid:rgba(6,182,212,0.04)]"
    >
      {/* 1. Ambient Corner Auroras (Static Base Depth) */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
      <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[140px]" />

      {/* 2. Layer 1: Geometric Dot-Grid Pattern with Edge Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(#05966922_1px,transparent_1px)] dark:bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:28px_28px] opacity-60 dark:opacity-70 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* 3. Layer 2: Dynamic Cursor Spotlight (Fluid Spring Following) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: spotlightBackground,
        }}
      />
    </div>
  );
}

