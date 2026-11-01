"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function InteractiveBackground() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors duration-500">
      {/* 1. Base Ambient Auroras */}
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[140px]" />

      {/* 2. Global Geometric Dot Mesh (Visible across the ENTIRE page) */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#05966922_1px,transparent_1px)] dark:bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* 3. Real-time Cursor Follower Spotlight */}
      <motion.div
        className="absolute inset-0 opacity-100"
        style={{
          background: "radial-gradient(650px circle at var(--x) var(--y), var(--spotlight-color), transparent 80%)",
          ["--x" as any]: springX,
          ["--y" as any]: springY,
        }}
      />

      <style>{`
        :root {
          --spotlight-color: rgba(16, 185, 129, 0.12);
        }
        .dark {
          --spotlight-color: rgba(16, 185, 129, 0.08);
        }
      `}</style>
    </div>
  );
}

export default InteractiveBackground;

