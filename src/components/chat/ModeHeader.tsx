"use client";

import React from "react";
import { Eye, ChevronDown, Activity, Compass, GraduationCap, TrendingUp, Film, Rocket, Cpu, Flame, Zap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonalityMode } from "@/types";

interface ModeHeaderProps {
  onMenuClick: () => void;
  personalityMode: PersonalityMode;
  isStreaming: boolean;
  thinkingState: string | null;
}

const MODE_ICONS: Record<PersonalityMode, React.ComponentType<any>> = {
  wild: Eye, // Eye icon exactly like mockup
  study_coach: GraduationCap,
  business: TrendingUp,
  director: Film,
  content_creator: Rocket,
  reality_engine: Cpu,
  savage: Flame,
  motivational: Zap,
};

const MODE_TAGLINES: Record<PersonalityMode, string> = {
  wild: "Emotionally adaptive • Uncensored • Real",
  study_coach: "Academic architecture • Active recall • Step-by-step guidance",
  business: "Strategic analysis • Growth intelligence • Market-aware",
  director: "Screenplay scripting • Dramatic pacing • Narrative depth",
  content_creator: "Viral copywriting • Magnetic hook generation • Ad copies",
  reality_engine: "Trajectory simulation • Pattern analysis • Deep forecasting",
  savage: "Sharp internet roast • brutally honest critique • humor-heavy",
  motivational: "Performance architecture • CEO mindset • Discipline coach",
};

const MODE_BADGES: Record<PersonalityMode, string> = {
  wild: "AI is emotionally attuned",
  study_coach: "Academic grid active",
  business: "Market intelligence synced",
  director: "Cinematic focal matrix loaded",
  content_creator: "Creative copywriting active",
  reality_engine: "Trajectory engines operational",
  savage: "Critique nodes active",
  motivational: "CEO routine calibrated",
};

const MODE_ACCENTS: Record<PersonalityMode, { text: string; bg: string; border: string }> = {
  wild: { text: "text-fuchsia-400", bg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", border: "border-fuchsia-500/15" },
  study_coach: { text: "text-indigo-400", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", border: "border-indigo-500/15" },
  business: { text: "text-cyan-400", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", border: "border-cyan-500/15" },
  director: { text: "text-amber-400", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", border: "border-amber-500/15" },
  content_creator: { text: "text-rose-400", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", border: "border-rose-500/15" },
  reality_engine: { text: "text-emerald-400", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", border: "border-emerald-500/15" },
  savage: { text: "text-orange-400", bg: "bg-orange-500/10 text-orange-400 border-orange-500/20", border: "border-orange-500/15" },
  motivational: { text: "text-violet-400", bg: "bg-violet-500/10 text-violet-400 border-violet-500/20", border: "border-violet-500/15" },
};

export function ModeHeader({ onMenuClick, personalityMode, isStreaming, thinkingState }: ModeHeaderProps) {
  const HeaderIcon = MODE_ICONS[personalityMode] || Eye;
  const accent = MODE_ACCENTS[personalityMode] || MODE_ACCENTS.wild;

  return (
    <div className="w-full flex items-center justify-between p-4 bg-zinc-950/20 border-b border-white/5 z-20 select-none">
      {/* Left part: Mode selector info card */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/5 bg-zinc-950/30 backdrop-blur-xl">
          <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center bg-white/[0.02]", accent.border)}>
            <HeaderIcon className={cn("w-4 h-4", accent.text)} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className={cn("text-xs font-space font-bold uppercase tracking-wider", accent.text)}>
                {personalityMode.replace("_", " ")}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <span className="text-[9px] font-mono text-zinc-400 tracking-wide mt-0.5">
              {MODE_TAGLINES[personalityMode] || "Premium Core Companion"}
            </span>
          </div>
        </div>
      </div>

      {/* Right part: Heartbeat active attunement badge */}
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-mono tracking-wider shadow-sm", accent.bg)}>
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>{MODE_BADGES[personalityMode]}</span>
        </div>
      </div>
    </div>
  );
}
