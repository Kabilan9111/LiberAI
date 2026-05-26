"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PersonalityMode } from "@/types";
import { cn } from "@/lib/utils";

interface AIConsciousnessOrbProps {
  mode: PersonalityMode;
  isStreaming: boolean;
  isThinking: boolean;
}

const ORB_THEMES: Record<PersonalityMode, { gradient: string; glow: string; shadow: string }> = {
  wild: {
    gradient: "from-fuchsia-600 via-purple-500 to-rose-500",
    glow: "bg-fuchsia-500/30",
    shadow: "shadow-[0_0_35px_rgba(217,70,239,0.45)]",
  },
  study_coach: {
    gradient: "from-indigo-600 via-blue-500 to-sky-500",
    glow: "bg-indigo-500/30",
    shadow: "shadow-[0_0_35px_rgba(99,102,241,0.45)]",
  },
  business: {
    gradient: "from-cyan-600 via-teal-500 to-slate-500",
    glow: "bg-cyan-500/30",
    shadow: "shadow-[0_0_35px_rgba(6,182,212,0.45)]",
  },
  director: {
    gradient: "from-amber-600 via-orange-500 to-red-500",
    glow: "bg-amber-500/30",
    shadow: "shadow-[0_0_35px_rgba(245,158,11,0.45)]",
  },
  content_creator: {
    gradient: "from-rose-600 via-pink-500 to-red-500",
    glow: "bg-rose-500/30",
    shadow: "shadow-[0_0_35px_rgba(244,63,94,0.45)]",
  },
  reality_engine: {
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    glow: "bg-emerald-500/30",
    shadow: "shadow-[0_0_35px_rgba(16,185,129,0.45)]",
  },
  savage: {
    gradient: "from-orange-600 via-red-500 to-red-700",
    glow: "bg-orange-500/30",
    shadow: "shadow-[0_0_35px_rgba(249,115,22,0.45)]",
  },
  motivational: {
    gradient: "from-violet-600 via-purple-500 to-fuchsia-600",
    glow: "bg-violet-500/30",
    shadow: "shadow-[0_0_35px_rgba(139,92,246,0.45)]",
  },
};

export function AIConsciousnessOrb({ mode, isStreaming, isThinking }: AIConsciousnessOrbProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-zinc-800" />;
  }

  const theme = ORB_THEMES[mode] || ORB_THEMES.wild;
  const isActive = isStreaming || isThinking;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* Outer Glow Halo */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.4, 1] : [1, 1.15, 1],
          opacity: isActive ? [0.4, 0.85, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isActive ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn("absolute inset-0 rounded-full blur-[14px]", theme.glow)}
      />

      {/* Orbiting Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: isActive ? 4 : 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-10 h-10 border border-dashed border-white/10 rounded-full"
      />

      {/* Orbiting Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: isActive ? 6 : 14,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-8 h-8 border border-white/5 rounded-full"
      />

      {/* Dynamic Main Core */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.25, 0.9, 1.1, 1] : [1, 1.05, 1],
          borderRadius: isActive 
            ? ["40% 60% 70% 30% / 40% 50% 60% 50%", "70% 30% 52% 48% / 60% 40% 60% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
            : ["50%", "50%"],
        }}
        transition={{
          duration: isActive ? 2.5 : 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "w-6 h-6 bg-gradient-to-tr z-10 border border-white/20",
          theme.gradient,
          theme.shadow
        )}
      />

      {/* Internal Core Dot */}
      <motion.div
        animate={{
          opacity: isActive ? [0.6, 1, 0.6] : 0.8,
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 shadow-[0_0_8px_rgba(255,255,255,1)]"
      />
    </div>
  );
}
