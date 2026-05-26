"use client";

import React, { useState, useEffect } from "react";
import { Compass, GraduationCap, TrendingUp, Film, Rocket, Cpu, Flame, Zap } from "lucide-react";
import { PersonalityMode } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusFooterProps {
  mode: PersonalityMode;
  chatsCount: number;
}

const MODE_ICONS: Record<PersonalityMode, React.ComponentType<any>> = {
  wild: Compass,
  study_coach: GraduationCap,
  business: TrendingUp,
  director: Film,
  content_creator: Rocket,
  reality_engine: Cpu,
  savage: Flame,
  motivational: Zap,
};

const MODE_COLORS: Record<PersonalityMode, { text: string; bg: string; glow: string }> = {
  wild: { text: "text-fuchsia-400", bg: "bg-fuchsia-500", glow: "shadow-[0_0_12px_rgba(217,70,239,0.5)]" },
  study_coach: { text: "text-indigo-400", bg: "bg-indigo-500", glow: "shadow-[0_0_12px_rgba(99,102,241,0.5)]" },
  business: { text: "text-cyan-400", bg: "bg-cyan-500", glow: "shadow-[0_0_12px_rgba(6,182,212,0.5)]" },
  director: { text: "text-amber-400", bg: "bg-amber-500", glow: "shadow-[0_0_12px_rgba(245,158,11,0.5)]" },
  content_creator: { text: "text-rose-400", bg: "bg-rose-500", glow: "shadow-[0_0_12px_rgba(244,63,94,0.5)]" },
  reality_engine: { text: "text-emerald-400", bg: "bg-emerald-500", glow: "shadow-[0_0_12px_rgba(16,185,129,0.5)]" },
  savage: { text: "text-orange-400", bg: "bg-orange-500", glow: "shadow-[0_0_12px_rgba(249,115,22,0.5)]" },
  motivational: { text: "text-violet-400", bg: "bg-violet-500", glow: "shadow-[0_0_12px_rgba(139,92,246,0.5)]" },
};

export function StatusFooter({ mode, chatsCount }: StatusFooterProps) {
  const [mounted, setMounted] = useState(false);
  const [memoryCount, setMemoryCount] = useState(128);

  useEffect(() => {
    setMounted(true);
    // Load local storage memory context
    if (typeof window !== "undefined") {
      const savedMemory = localStorage.getItem(`liber_memory_${mode}`);
      if (savedMemory) {
        try {
          const parsed = JSON.parse(savedMemory);
          let count = 0;
          if (parsed.relationship) count += parsed.relationship.split(";").length;
          if (parsed.goals) count += parsed.goals.split(";").length;
          if (parsed.projects) count += parsed.projects.split(";").length;
          setMemoryCount(count > 0 ? count * 12 + 8 : 128); // Dynamic mockup based on actual memory count
        } catch (e) {}
      }
    }
  }, [mode]);

  if (!mounted) {
    return <div className="h-10 w-full border-t border-white/5 bg-zinc-950/20" />;
  }

  const ModeIcon = MODE_ICONS[mode] || Compass;
  const colors = MODE_COLORS[mode] || MODE_COLORS.wild;

  return (
    <div className="w-full border-t border-white/5 bg-zinc-950/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 tracking-wider z-20 select-none">
      {/* Left section: Mode indicator + depth wave */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <ModeIcon className={cn("w-3.5 h-3.5", colors.text)} />
          <span className={cn("font-bold uppercase", colors.text)}>{mode.replace("_", " ")} ACTIVE</span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-2">
          <span>Emotional Depth: High</span>
          {/* Heartbeat animated line */}
          <div className="w-16 h-3 flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full stroke-current text-zinc-700" viewBox="0 0 100 20" fill="none">
              <path d="M0 10 h30 l5 -8 l5 16 l5 -12 l5 6 h50" strokeWidth="1.5" />
              <motion.path
                d="M0 10 h30 l5 -8 l5 16 l5 -12 l5 6 h50"
                strokeWidth="1.5"
                className={colors.text}
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: 0.3, pathOffset: [0, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Center: AI Consciousness slider bar */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">AI CONSCIOUSNESS</span>
        <div className="w-48 h-1 bg-zinc-900 rounded-full relative">
          <div className={cn("absolute left-0 top-0 h-full w-[92%] rounded-full opacity-60", colors.bg)} />
          {/* Orb core indicator */}
          <div
            className={cn(
              "absolute left-[92%] -top-1 w-3.5 h-3.5 rounded-full border border-white/20 -translate-x-1/2 flex items-center justify-center",
              colors.bg,
              colors.glow
            )}
          >
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <span className="text-zinc-400">98%</span>
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-4">
        <span>Memory: {memoryCount} items</span>
        <span className="text-zinc-800">•</span>
        <span>Context: Deep</span>
        <span className="text-zinc-800">•</span>
        <span>Adaptation: Active</span>
      </div>
    </div>
  );
}
