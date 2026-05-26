"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight, Compass, GraduationCap, TrendingUp, Film, Rocket, Cpu, Flame, Zap, Eye, HelpCircle } from "lucide-react";
import { Chat, PersonalityMode } from "@/types";
import { cn } from "@/lib/utils";

interface SpatialHotspotsProps {
  prevChat: Chat | null;
  nextChat: Chat | null;
  handleNavigate: (id: string, dir: "prev" | "next") => void;
}

const MODE_ICONS: Record<PersonalityMode, React.ComponentType<any>> = {
  wild: Eye,
  study_coach: GraduationCap,
  business: TrendingUp,
  director: Film,
  content_creator: Rocket,
  reality_engine: Cpu,
  savage: Flame,
  motivational: Zap,
};

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

const MODE_ACCENTS: Record<PersonalityMode, string> = {
  wild: "border-fuchsia-500/30 text-fuchsia-400",
  study_coach: "border-indigo-500/30 text-indigo-400",
  business: "border-cyan-500/30 text-cyan-400",
  director: "border-amber-500/30 text-amber-400",
  content_creator: "border-rose-500/30 text-rose-400",
  reality_engine: "border-emerald-500/30 text-emerald-400",
  savage: "border-orange-500/30 text-orange-400",
  motivational: "border-violet-500/30 text-violet-400",
};

export function SpatialHotspots({ prevChat, nextChat, handleNavigate }: SpatialHotspotsProps) {
  const [mounted, setMounted] = useState(false);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const leftX = useMotionValue(-300);
  const leftY = useMotionValue(250);
  const leftSpringX = useSpring(leftX, { stiffness: 90, damping: 22 });
  const leftSpringY = useSpring(leftY, { stiffness: 90, damping: 22 });

  const rightX = useMotionValue(-300);
  const rightY = useMotionValue(250);
  const rightSpringX = useSpring(rightX, { stiffness: 90, damping: 22 });
  const rightSpringY = useSpring(rightY, { stiffness: 90, damping: 22 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (leftHovered) {
      leftX.set(24 + mouseX * 0.04);
      leftY.set(Math.max(100, Math.min(mouseY - 140, 420)));
    } else {
      leftX.set(-300);
    }
  }, [leftHovered, mouseY, mouseX, leftX, leftY, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (rightHovered) {
      rightX.set(24 + (48 - mouseX) * 0.04);
      rightY.set(Math.max(100, Math.min(mouseY - 140, 420)));
    } else {
      rightX.set(-300);
    }
  }, [rightHovered, mouseY, mouseX, rightX, rightY, mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Left Hotspot Sensor Zone */}
      {prevChat && (
        <div
          className="absolute left-0 top-0 w-12 h-full z-30 cursor-pointer select-none"
          onMouseEnter={() => setLeftHovered(true)}
          onMouseLeave={() => setLeftHovered(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMouseY(e.clientY - rect.top);
            setMouseX(e.clientX - rect.left);
          }}
          onClick={() => handleNavigate(prevChat.id, "prev")}
        />
      )}

      {/* Right Hotspot Sensor Zone */}
      {nextChat && (
        <div
          className="absolute right-0 top-0 w-12 h-full z-30 cursor-pointer select-none"
          onMouseEnter={() => setRightHovered(true)}
          onMouseLeave={() => setRightHovered(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMouseY(e.clientY - rect.top);
            setMouseX(e.clientX - rect.left);
          }}
          onClick={() => handleNavigate(nextChat.id, "next")}
        />
      )}

      {/* Left Floating Parallax Hover Card */}
      {prevChat && (leftHovered || leftSpringX.get() > -280) && (
        <motion.div
          style={{ left: leftSpringX, y: leftSpringY }}
          className="absolute z-40 w-60 h-72 bg-zinc-950/70 border border-white/10 rounded-[28px] overflow-hidden flex flex-col justify-between pointer-events-none shadow-2xl p-5"
        >
          {/* Card Internal Background Wallpaper */}
          <div
            style={{
              backgroundImage: `url(${BACKGROUND_ASSETS[prevChat.personalityMode] || "/bg_wild.png"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute inset-0 opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-zinc-950/70 to-zinc-950 pointer-events-none" />

          {/* Navigation trigger button inside card */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">PREVIOUS DIALOGUE</span>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold font-mono">&lt;</span>
            </div>
          </div>

          <div className="relative z-10 space-y-2 mt-auto">
            <h4 className="text-sm font-bold text-white font-space leading-snug line-clamp-2">
              {prevChat.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              {React.createElement(MODE_ICONS[prevChat.personalityMode] || Compass, {
                className: cn("w-3.5 h-3.5", MODE_ACCENTS[prevChat.personalityMode] || "text-purple-400")
              })}
              <span>{prevChat.personalityMode.replace("_", " ")}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Right Floating Parallax Hover Card */}
      {nextChat && (rightHovered || rightSpringX.get() > -280) && (
        <motion.div
          style={{ right: rightSpringX, y: rightSpringY }}
          className="absolute z-40 w-60 h-72 bg-zinc-950/70 border border-white/10 rounded-[28px] overflow-hidden flex flex-col justify-between pointer-events-none shadow-2xl p-5"
        >
          {/* Card Internal Background Wallpaper */}
          <div
            style={{
              backgroundImage: `url(${BACKGROUND_ASSETS[nextChat.personalityMode] || "/bg_wild.png"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute inset-0 opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-zinc-950/70 to-zinc-950 pointer-events-none" />

          {/* Navigation trigger button inside card */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">NEXT DIALOGUE</span>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold font-mono">&gt;</span>
            </div>
          </div>

          <div className="relative z-10 space-y-2 mt-auto">
            <h4 className="text-sm font-bold text-white font-space leading-snug line-clamp-2 text-right">
              {nextChat.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider justify-end">
              {React.createElement(MODE_ICONS[nextChat.personalityMode] || Compass, {
                className: cn("w-3.5 h-3.5", MODE_ACCENTS[nextChat.personalityMode] || "text-purple-400")
              })}
              <span>{nextChat.personalityMode.replace("_", " ")}</span>
            </div>
            
            {/* Drag to Navigate helper indicators */}
            <div className="pt-4 border-t border-white/5 flex flex-col items-end gap-1.5 opacity-60">
              <span className="text-[8px] font-mono text-zinc-500 tracking-wider flex items-center gap-1 select-none">
                <span>Drag to navigate</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
