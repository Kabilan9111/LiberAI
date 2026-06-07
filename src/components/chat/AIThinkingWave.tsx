"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonalityMode } from "@/types";
import { cn } from "@/lib/utils";

interface AIThinkingWaveProps {
  mode: PersonalityMode;
  isResolved: boolean;
}

const WAVE_THEMES: Record<PersonalityMode, { color: string; glow: string; particle: string }> = {
  wild: { color: "#d946ef", glow: "rgba(217, 70, 239, 0.4)", particle: "bg-fuchsia-400" },
  study_coach: { color: "#6366f1", glow: "rgba(99, 102, 241, 0.4)", particle: "bg-indigo-400" },
  business: { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.4)", particle: "bg-cyan-400" },
  director: { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", particle: "bg-amber-400" },
  content_creator: { color: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)", particle: "bg-rose-400" },
  reality_engine: { color: "#10b981", glow: "rgba(16, 185, 129, 0.4)", particle: "bg-emerald-400" },
  savage: { color: "#dc2626", glow: "rgba(220, 38, 38, 0.4)", particle: "bg-red-500" },
  motivational: { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.4)", particle: "bg-violet-400" },
};

const ECG_PATH = "M 0 25 C 10 25, 15 25, 20 25 L 25 10 L 30 40 L 35 15 L 40 35 L 45 25 C 50 25, 90 25, 100 25";
const FLAT_PATH = "M 0 25 C 10 25, 15 25, 20 25 L 25 25 L 30 25 L 35 25 L 40 25 L 45 25 C 50 25, 90 25, 100 25";

export function AIThinkingWave({ mode, isResolved }: AIThinkingWaveProps) {
  const [mounted, setMounted] = useState(false);
  const theme = WAVE_THEMES[mode] || WAVE_THEMES.wild;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ width: 0, opacity: 0, filter: "blur(8px)", scale: 0.96 }}
      animate={{ width: "12rem", opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ width: 0, opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-10 flex items-center overflow-visible"
    >
      {/* Background ambient glow matching the wave */}
      <motion.div
        animate={{ opacity: isResolved ? 0 : [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 blur-xl pointer-events-none"
        style={{ backgroundColor: theme.glow }}
      />

      {/* The Waveform SVG */}
      <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor={theme.color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={theme.color} stopOpacity="1" />
            <stop offset="80%" stopColor={theme.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id={`glow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base faint line */}
        <motion.path
          d={FLAT_PATH}
          fill="none"
          stroke={theme.color}
          strokeWidth="1"
          strokeOpacity="0.15"
        />

        {/* Animated Neural Pulse */}
        <motion.path
          animate={
            isResolved
              ? { d: FLAT_PATH, strokeOpacity: 0.1 }
              : { d: [ECG_PATH, FLAT_PATH, ECG_PATH], strokeDashoffset: [200, 0] }
          }
          transition={
            isResolved
              ? { duration: 0.8, ease: "easeOut" }
              : {
                  d: { duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                  strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                }
          }
          strokeDasharray="100 100"
          fill="none"
          stroke={`url(#grad-${mode})`}
          strokeWidth="1.5"
          filter={`url(#glow-${mode})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Traveling Neural Particles */}
      <AnimatePresence>
        {!isResolved && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ x: -10, opacity: 0, y: "50%" }}
                animate={{
                  x: 200,
                  opacity: [0, 1, 1, 0],
                  y: ["50%", `${40 + Math.random() * 20}%`, "50%"],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear",
                }}
                className={cn("absolute w-1 h-1 rounded-full blur-[1px]", theme.particle)}
                style={{
                  boxShadow: `0 0 8px ${theme.glow}`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
