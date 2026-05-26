"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonalityMode } from "@/types";

interface CinematicBackgroundProps {
  mode: PersonalityMode;
}

interface Particle {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  xOffset: number;
}

interface ThemeConfig {
  gradient: string;
  particleColor: string;
  gridOpacity: number;
  ambientGlow: string;
}

const BACKGROUND_ASSETS: Record<PersonalityMode, string> = {
  wild: "/bg_wild.png",
  study_coach: "/bg_study_coach.png",
  business: "/bg_business.png",
  director: "/bg_director.png",
  content_creator: "/bg_content_creator.png",
  reality_engine: "/bg_reality_engine.png",
  savage: "/bg_savage.png",
  motivational: "/bg_motivational.png",
};

const THEME_CONFIGS: Record<PersonalityMode, ThemeConfig> = {
  wild: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(217, 70, 239, 0.25)",
    gridOpacity: 0.015,
    ambientGlow: "rgba(217, 70, 239, 0.03)",
  },
  study_coach: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(99, 102, 241, 0.25)",
    gridOpacity: 0.02,
    ambientGlow: "rgba(99, 102, 241, 0.03)",
  },
  business: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(6, 182, 212, 0.25)",
    gridOpacity: 0.03,
    ambientGlow: "rgba(6, 182, 212, 0.03)",
  },
  director: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
    particleColor: "rgba(245, 158, 11, 0.2)",
    gridOpacity: 0.025,
    ambientGlow: "rgba(245, 158, 11, 0.03)",
  },
  content_creator: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(244, 63, 94, 0.25)",
    gridOpacity: 0.02,
    ambientGlow: "rgba(244, 63, 94, 0.03)",
  },
  reality_engine: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(16, 185, 129, 0.25)",
    gridOpacity: 0.04,
    ambientGlow: "rgba(16, 185, 129, 0.03)",
  },
  savage: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(220, 38, 38, 0.25)",
    gridOpacity: 0.025,
    ambientGlow: "rgba(220, 38, 38, 0.03)",
  },
  motivational: {
    gradient: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
    particleColor: "rgba(139, 92, 246, 0.25)",
    gridOpacity: 0.02,
    ambientGlow: "rgba(139, 92, 246, 0.03)",
  },
};

export function CinematicBackground({ mode }: CinematicBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setMounted(true);
    // Safe client-side particle generation
    const list = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1.2,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      xOffset: (Math.random() - 0.5) * 50,
    }));
    setParticles(list);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-black -z-10" />;
  }

  const currentTheme = THEME_CONFIGS[mode] || THEME_CONFIGS.wild;
  const wallpaperUrl = BACKGROUND_ASSETS[mode] || BACKGROUND_ASSETS.wild;

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-black/60 overflow-hidden pointer-events-none select-none">
      {/* Base Solid Darkness */}
      <div className="absolute inset-0 bg-[#050505]/50" />

      {/* Layer 1: Wallpaper Cross-Fade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          style={{
            backgroundImage: `url(${wallpaperUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </AnimatePresence>

      {/* Layer 2: Atmospheric Nebula Colors */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`nebula-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{ backgroundImage: currentTheme.gradient }}
          className="absolute inset-0 w-full h-full"
        />
      </AnimatePresence>

      {/* Layer 3: Ambient Glow Halo */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          boxShadow: `inset 0 0 100px ${currentTheme.ambientGlow}`,
        }}
      />

      {/* Layer 4: Client Particles */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              backgroundColor: currentTheme.particleColor,
              top: "105%",
              filter: "blur(0.5px)",
            }}
            animate={{
              y: ["0vh", "-115vh"],
              x: ["0px", `${p.xOffset}px`],
              opacity: [0, 0.45, 0.45, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Layer 5: Technical Grid overlay */}
      <motion.div
        animate={{ opacity: currentTheme.gridOpacity }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.92) 100%),
            linear-gradient(rgba(255, 255, 255, 0.005) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.005) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        }}
      />
    </div>
  );
}
