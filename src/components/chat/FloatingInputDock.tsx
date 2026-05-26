"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Plus,
  Loader2,
  Compass,
  GraduationCap,
  TrendingUp,
  Film,
  Rocket,
  Cpu,
  Flame,
  Zap,
  Globe,
  Brain,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonalityMode } from "@/types";

interface FloatingInputDockProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isStreaming: boolean;
  personalityMode: PersonalityMode;
  setPersonalityMode: (mode: PersonalityMode) => void;
}

const PERSONALITIES: { id: PersonalityMode; label: string; sub: string; icon: React.ComponentType<any>; glowClass: string; color: string }[] = [
  { id: "wild", label: "Wild Mode", sub: "Emotionally adaptive • Uncensored", icon: Eye, glowClass: "hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5", color: "text-fuchsia-400" },
  { id: "study_coach", label: "Study Coach", sub: "Academic architecture • Recalls", icon: GraduationCap, glowClass: "hover:border-indigo-500/40 hover:bg-indigo-500/5", color: "text-indigo-400" },
  { id: "business", label: "Business Mode", sub: "Strategic analysis • Growth", icon: TrendingUp, glowClass: "hover:border-cyan-500/40 hover:bg-cyan-500/5", color: "text-cyan-400" },
  { id: "director", label: "Director Mode", sub: "Screenplay scripting • Cinema", icon: Film, glowClass: "hover:border-amber-500/40 hover:bg-amber-500/5", color: "text-amber-400" },
  { id: "content_creator", label: "Content Creator", sub: "Viral copywriting • Hooks", icon: Rocket, glowClass: "hover:border-rose-500/40 hover:bg-rose-500/5", color: "text-rose-400" },
  { id: "reality_engine", label: "Reality Engine", sub: "Outcome simulation • Pattern", icon: Cpu, glowClass: "hover:border-emerald-500/40 hover:bg-emerald-500/5", color: "text-emerald-400" },
  { id: "savage", label: "Savage Mode", sub: "Sharp internet roast • Critique", icon: Flame, glowClass: "hover:border-orange-500/40 hover:bg-orange-500/5", color: "text-orange-400" },
  { id: "motivational", label: "Motivational", sub: "CEO mindset • Discipline", icon: Zap, glowClass: "hover:border-violet-500/40 hover:bg-violet-500/5", color: "text-violet-400" },
];

const INPUT_PLACEHOLDERS: Record<PersonalityMode, string> = {
  wild: "Message Liber AI...", // Match mockup exactly
  study_coach: "What topic are we mastering today?",
  business: "Describe your business challenge...",
  director: "Describe the scene unfolding in your mind...",
  content_creator: "Enter the hook or copy concept...",
  reality_engine: "Describe your current trajectory...",
  savage: "Show me your code or query (prepare for roasting)...",
  motivational: "What goal are we executing today?",
};

const MODE_ACCENTS: Record<
  PersonalityMode,
  { border: string; glow: string; text: string }
> = {
  wild: {
    border: "border-fuchsia-500/20 focus-within:border-fuchsia-500/50 focus-within:ring-fuchsia-500/20 focus-within:shadow-[0_0_25px_rgba(217,70,239,0.15)]",
    glow: "text-fuchsia-400",
    text: "text-fuchsia-400",
  },
  study_coach: {
    border: "border-indigo-500/20 focus-within:border-indigo-500/50 focus-within:ring-indigo-500/20 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.15)]",
    glow: "text-indigo-400",
    text: "text-indigo-400",
  },
  business: {
    border: "border-cyan-500/20 focus-within:border-cyan-500/50 focus-within:ring-cyan-500/20 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    glow: "text-cyan-400",
    text: "text-cyan-400",
  },
  director: {
    border: "border-amber-500/20 focus-within:border-amber-500/50 focus-within:ring-amber-500/20 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    glow: "text-amber-400",
    text: "text-amber-400",
  },
  content_creator: {
    border: "border-rose-500/20 focus-within:border-rose-500/50 focus-within:ring-rose-500/20 focus-within:shadow-[0_0_25px_rgba(244,63,94,0.15)]",
    glow: "text-rose-400",
    text: "text-rose-400",
  },
  reality_engine: {
    border: "border-emerald-500/20 focus-within:border-emerald-500/50 focus-within:ring-emerald-500/20 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    glow: "text-emerald-400",
    text: "text-emerald-400",
  },
  savage: {
    border: "border-orange-500/20 focus-within:border-orange-500/50 focus-within:ring-orange-500/20 focus-within:shadow-[0_0_25px_rgba(249,115,22,0.15)]",
    glow: "text-orange-400",
    text: "text-orange-400",
  },
  motivational: {
    border: "border-violet-500/20 focus-within:border-violet-500/50 focus-within:ring-violet-500/20 focus-within:shadow-[0_0_25px_rgba(139,92,246,0.15)]",
    glow: "text-violet-400",
    text: "text-violet-400",
  },
};

export function FloatingInputDock({
  input,
  setInput,
  handleSend,
  isStreaming,
  personalityMode,
  setPersonalityMode,
}: FloatingInputDockProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [reasonActive, setReasonActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Click outside to close picker
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const accent = MODE_ACCENTS[personalityMode] || MODE_ACCENTS.wild;
  const ActiveIcon = PERSONALITIES.find((p) => p.id === personalityMode)?.icon || Eye;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/85 to-transparent z-20 select-none flex flex-col gap-2 items-center">
      <div className="w-full max-w-3xl relative">
        <div
          className={cn(
            "relative rounded-2xl border bg-zinc-950/20 backdrop-blur-3xl p-3 shadow-[0_4px_30px_rgba(0,0,0,0.65)] flex flex-col transition-all duration-300",
            accent.border
          )}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none py-2 px-3 leading-relaxed min-h-[40px] max-h-[180px] scrollbar-none font-space"
            placeholder={isStreaming ? "Liber is compiling..." : INPUT_PLACEHOLDERS[personalityMode]}
            disabled={isStreaming}
          />
          
          <div className="flex items-center justify-between pt-2 px-2 border-t border-white/5 mt-2">
            {/* LEFT ACTIONS AREA: Picker + Gallery + Search Toggle + Reason Toggle */}
            <div className="flex items-center gap-2" ref={pickerRef}>
              {/* Mode Picker trigger button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className={cn(
                    "p-2.5 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 flex items-center justify-center cursor-pointer hover:border-purple-500/40 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
                    pickerOpen && "border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  )}
                  title="Select AI Personality Mode"
                >
                  <ActiveIcon className={cn("w-4.5 h-4.5 transition-transform duration-300", accent.glow)} />
                </button>

                {/* Vertical Stagger Mode List Popup */}
                <AnimatePresence>
                  {pickerOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.95 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 180,
                            damping: 16,
                            staggerChildren: 0.04,
                          },
                        },
                      }}
                      className="absolute bottom-14 left-0 w-60 bg-zinc-950/85 border border-white/10 backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-1.5"
                    >
                      <div className="px-2.5 py-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1 select-none">
                        AI PERSONALITY MATRIX
                      </div>
                      {PERSONALITIES.map((p) => {
                        const isSelected = p.id === personalityMode;
                        const ModeIconComp = p.icon;
                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: { opacity: 1, x: 0 },
                            }}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPersonalityMode(p.id);
                              setPickerOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-left border border-transparent transition-all duration-200 cursor-pointer select-none",
                              p.glowClass,
                              isSelected
                                ? "bg-white/5 border-white/10 text-white"
                                : "text-zinc-400 hover:text-zinc-200"
                            )}
                          >
                            <ModeIconComp className={cn("w-4 h-4 flex-shrink-0", p.color)} />
                            <div className="flex flex-col select-none">
                              <span className="text-xs font-semibold font-space">{p.label}</span>
                              <span className="text-[8px] text-zinc-500 font-mono tracking-normal">{p.sub}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Gallery Attachment button '+' as in the mockup */}
              <button
                type="button"
                className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                title="Attach Files"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Web Search toggle */}
              <button
                type="button"
                onClick={() => setSearchActive(!searchActive)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all duration-300 cursor-pointer select-none",
                  searchActive
                    ? "bg-purple-500/10 border-purple-500/30 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
                title="Toggle Web Search"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              {/* Deep Reasoning toggle */}
              <button
                type="button"
                onClick={() => setReasonActive(!reasonActive)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all duration-300 cursor-pointer select-none",
                  reasonActive
                    ? "bg-purple-500/10 border-purple-500/30 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
                title="Toggle Deep Reasoning"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Reason</span>
              </button>
            </div>

            {/* RIGHT ACTIONS: Voice Wave + Send Circle Button */}
            <div className="flex items-center gap-2">
              {/* Mic Icon Button */}
              <button
                type="button"
                className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send circle button with '>' */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500/20",
                  input.trim() && !isStreaming
                    ? "bg-gradient-to-tr from-purple-600 to-fuchsia-600 hover:scale-105 text-white"
                    : "text-zinc-600 bg-white/5 cursor-not-allowed shadow-none border-transparent"
                )}
                title="Transmit prompt"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span className="text-xs font-bold font-mono translate-x-[0.5px] font-space text-white">&gt;</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer under input */}
      <span className="text-[9px] font-mono text-zinc-600 tracking-wider select-none mt-1">
        Liber AI can make mistakes. Check important info.
      </span>
    </div>
  );
}
