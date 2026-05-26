"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { PersonalityMode, Language, AIProvider } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  Brain,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
  Compass,
  GraduationCap,
  TrendingUp,
  Film,
  Rocket,
  Cpu,
  Flame,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const PERSONALITIES: { id: PersonalityMode; label: string; icon: React.ComponentType<any> }[] = [
  { id: "wild", label: "Wild Mode", icon: Compass },
  { id: "study_coach", label: "Study Coach", icon: GraduationCap },
  { id: "business", label: "Business Mode", icon: TrendingUp },
  { id: "director", label: "Director Mode", icon: Film },
  { id: "content_creator", label: "Content Creator", icon: Rocket },
  { id: "reality_engine", label: "Reality Engine", icon: Cpu },
  { id: "savage", label: "Savage Mode", icon: Flame },
  { id: "motivational", label: "Motivational", icon: Zap },
];

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "english", label: "English" },
  { id: "tamil", label: "தமிழ் (Tamil)" },
  { id: "telugu", label: "తెలుగు (Telugu)" },
  { id: "malayalam", label: "മലയാളം (Malayalam)" },
  { id: "kannada", label: "ಕನ್ನಡ (Kannada)" },
  { id: "hindi", label: "हिन्दी (Hindi)" },
  { id: "marathi", label: "मराठी (Marathi)" },
];

const MODE_COLORS: Record<PersonalityMode, { border: string; glow: string; text: string }> = {
  wild: { border: "border-fuchsia-500/30", glow: "shadow-[0_0_15px_rgba(217,70,239,0.15)]", text: "text-fuchsia-400" },
  study_coach: { border: "border-indigo-500/30", glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)]", text: "text-indigo-400" },
  business: { border: "border-cyan-500/30", glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]", text: "text-cyan-400" },
  director: { border: "border-amber-500/30", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]", text: "text-amber-400" },
  content_creator: { border: "border-rose-500/30", glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]", text: "text-rose-400" },
  reality_engine: { border: "border-emerald-500/30", glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]", text: "text-emerald-400" },
  savage: { border: "border-orange-500/30", glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]", text: "text-orange-400" },
  motivational: { border: "border-violet-500/30", glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]", text: "text-violet-400" },
};

export function Sidebar({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [memoryCount, setMemoryCount] = useState(128);
  const {
    chats,
    activeChatId,
    personalityMode,
    language,
    selectedProvider,
    setSelectedProvider,
    setLanguage,
    startNewChat,
    deleteChat,
    selectChat,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== "undefined") {
      const savedMemory = localStorage.getItem(`liber_memory_${personalityMode}`);
      if (savedMemory) {
        try {
          const parsed = JSON.parse(savedMemory);
          let count = 0;
          if (parsed.relationship) count += parsed.relationship.split(";").length;
          if (parsed.goals) count += parsed.goals.split(";").length;
          if (parsed.projects) count += parsed.projects.split(";").length;
          setMemoryCount(count > 0 ? count * 12 + 8 : 128);
        } catch (e) {}
      }
    }
  }, [personalityMode, mounted]);

  const filteredChats = chats
    .filter((c) => c.personalityMode === personalityMode)
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        startNewChat();
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [startNewChat]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950/20 backdrop-blur-3xl border border-white/10 text-zinc-300 relative shadow-[0_4px_30px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden p-4 space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Sidebar Header: Logo & Hamburger button */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          {/* Hamburger toggle inside header */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-2 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white cursor-pointer hover:bg-white/10 transition-all"
            title="Toggle Sidebar"
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 group">
            <div className="relative flex items-center justify-center w-5.5 h-5.5 rounded bg-gradient-to-tr from-purple-600 to-blue-500 overflow-hidden">
              <Brain className="w-3 h-3 text-white/95" />
            </div>
            <span className="font-space font-bold text-xs tracking-wider text-white">
              LA LIBER AI
            </span>
          </div>
        </div>

        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white md:hidden ml-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Buttons: New Dialogue & Search Bar */}
      <div className="flex flex-col gap-3.5 z-10">
        <motion.button
          whileHover={{ scale: 1.02, y: -0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            startNewChat();
            setSearchQuery("");
          }}
          className="relative flex items-center justify-between py-2.5 px-4 rounded-xl bg-purple-900/20 border border-purple-500/20 hover:border-purple-400/40 text-white font-medium shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-space tracking-wide">New Dialogue</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded select-none">
            ⌘ N
          </span>
        </motion.button>

        <div className="relative group">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dialogues..."
            className="w-full pl-9 pr-14 py-2 text-xs bg-white/5 border border-white/5 focus:border-purple-500/40 rounded-xl outline-none text-zinc-200 placeholder-zinc-500 focus:bg-white/10 transition-all duration-300"
          />
          <span className="absolute right-3.5 top-2 text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded select-none">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-5 z-10 scrollbar-none">
        <div>
          <div className="flex items-center justify-between px-1.5 mb-2.5 text-[9px] font-mono tracking-wider text-zinc-600 uppercase select-none">
            <span>DIALOGUES</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-none">
            <AnimatePresence mode="popLayout">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const ModeIcon = PERSONALITIES.find((p) => p.id === chat.personalityMode)?.icon || MessageSquare;
                const modeStyle = MODE_COLORS[chat.personalityMode] || MODE_COLORS.wild;
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    whileHover={{ scale: 1.01, y: -0.5 }}
                    className={cn(
                      "group flex flex-col p-3 rounded-xl text-xs transition-all duration-200 cursor-pointer relative border",
                      isActive
                        ? cn("bg-purple-950/10", modeStyle.border, modeStyle.glow)
                        : "bg-white/[0.01] border-white/5 hover:border-white/10 text-zinc-400 hover:text-zinc-200"
                    )}
                    onClick={() => {
                      selectChat(chat.id);
                      setIsMobileOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between min-w-0 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-purple-400" : "text-zinc-600")} />
                        <span className={cn("truncate font-medium", isActive ? "text-white" : "text-zinc-300")}>
                          {chat.title}
                        </span>
                      </div>
                      {filteredChats.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity cursor-pointer"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px] text-zinc-500">
                      <span className="font-mono uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <ModeIcon className={cn("w-3 h-3", modeStyle.text)} />
                        <span>{chat.personalityMode.replace("_", " ")}</span>
                      </span>
                      <span className="font-mono select-none">
                        {mounted
                          ? new Date(chat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>

                    {isActive && (
                      <span className={cn("absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse", modeStyle.text.replace("text-", "bg-"))} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredChats.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs font-mono select-none">No dialogues found</div>
            )}
          </div>
        </div>

        {/* Archived list link */}
        <div className="px-1 z-10">
          <button className="flex items-center justify-between w-full text-[10px] text-zinc-600 hover:text-zinc-400 font-mono tracking-wider transition-colors cursor-pointer select-none">
            <span>ARCHIVED (12)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Controls */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          {/* Translation Core */}
          <div>
            <div className="flex items-center gap-2 px-1 mb-1.5 text-[9px] font-mono tracking-wider text-zinc-600 uppercase select-none">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>TRANSLATION CORE</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-zinc-950/20 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-[10px] text-zinc-300 outline-none transition-all cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-950 text-zinc-300">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Selector */}
          <div>
            <div className="flex items-center gap-2 px-1 mb-1.5 text-[9px] font-mono tracking-wider text-zinc-600 uppercase select-none">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>ORCHESTRATION</span>
            </div>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
              className="w-full bg-zinc-950/20 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-[10px] text-zinc-300 outline-none transition-all cursor-pointer"
            >
              <option value="auto" className="bg-zinc-950 text-zinc-300">🤖 Auto Routing</option>
              <option value="gemini" className="bg-zinc-950 text-zinc-300">🧠 Gemini</option>
              <option value="groq" className="bg-zinc-950 text-zinc-300">⚡ Groq</option>
              <option value="openai" className="bg-zinc-950 text-zinc-300">💬 OpenAI</option>
              <option value="openrouter" className="bg-zinc-950 text-zinc-300">🌐 OpenRouter</option>
              <option value="together" className="bg-zinc-950 text-zinc-300">🔥 Together AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Memory Card & Settings */}
      <div className="space-y-4 pt-4 border-t border-white/5 z-10">
        {/* AI Memory Card */}
        <div className="p-3.5 bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/25 rounded-2xl flex items-start gap-3 transition-all duration-300 group shadow-inner">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white font-space">AI Memory</span>
            <span className="text-[9px] text-zinc-500 leading-normal font-mono">
              Liber remembers {memoryCount} things about you
            </span>
          </div>
        </div>

        {/* Sidebar Footer Link */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <Link
            href="/settings"
            className="flex items-center gap-2 hover:text-zinc-200 transition-colors group"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-200 transition-colors" />
            <span>Settings</span>
          </Link>
          <span className="text-[9px] font-mono text-zinc-600 select-none">SECURE_GRID</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Shell */}
      <div
        className={cn(
          "hidden md:block h-full transition-all duration-300 flex-shrink-0 relative z-30",
          isOpen ? "w-[352px]" : "w-0"
        )}
      >
        <div className="absolute top-[88px] bottom-6 left-6 right-2 overflow-hidden w-[320px] h-[calc(100vh-112px)]">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full z-50 md:hidden pt-4 px-4 pb-4"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
