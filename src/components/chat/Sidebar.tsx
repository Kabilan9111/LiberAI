"use client";

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
  Menu,
  X,
  Star,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const PERSONALITIES: { id: PersonalityMode; label: string; icon: string }[] = [
  { id: "chill", label: "Chill Mode", icon: "☕" },
  { id: "savage", label: "Savage Mode", icon: "🔥" },
  { id: "romantic", label: "Romantic", icon: "💖" },
  { id: "motivational", label: "Motivational", icon: "💪" },
  { id: "study_coach", label: "Study Coach", icon: "📚" },
  { id: "tamil_local", label: "Tamil Local Mode", icon: "🫡" },
  { id: "wild", label: "Wild Mode", icon: "👁️" },
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

export function Sidebar({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const {
    chats,
    activeChatId,
    personalityMode,
    language,
    selectedProvider,
    setSelectedProvider,
    setPersonalityMode,
    setLanguage,
    startNewChat,
    deleteChat,
    selectChat,
  } = useApp();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-white/5 text-zinc-300">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <button
          onClick={startNewChat}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 hover:border-purple-500/60 hover:from-purple-800/40 hover:to-blue-800/40 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] text-sm"
        >
          <Plus className="w-4 h-4 text-purple-400" /> New Dialogue
        </button>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-zinc-400 hover:text-white md:hidden ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2 mb-2 text-xs font-mono tracking-wider text-zinc-500 uppercase">
            <span>DIALOGUE HISTORY</span>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-zinc-400">{chats.length}</span>
          </div>

          <div className="space-y-1">
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer relative overflow-hidden",
                    isActive
                      ? "bg-white/5 text-white border-l-2 border-purple-500 font-medium"
                      : "hover:bg-white/5 hover:text-zinc-200 text-zinc-400"
                  )}
                  onClick={() => {
                    selectChat(chat.id);
                    setIsMobileOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-purple-400" : "text-zinc-600")} />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  {chats.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Personality Modes */}
        <div>
          <div className="flex items-center gap-1 px-2 mb-3 text-xs font-mono tracking-wider text-zinc-500 uppercase">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>PERSONALITY MODES</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {PERSONALITIES.map((p) => {
              const isSelected = personalityMode === p.id;
              const isWild = p.id === "wild";
              return (
                <button
                  key={p.id}
                  onClick={() => setPersonalityMode(p.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 text-xs cursor-pointer",
                    isSelected
                      ? isWild
                        ? "bg-red-500/10 border-red-500/50 text-red-300 font-semibold shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:border-red-500/70"
                        : "bg-purple-500/10 border-purple-500/50 text-purple-300 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:border-purple-500/70"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400"
                  )}
                >
                  <span className="text-lg mb-1">{p.icon}</span>
                  <span className="text-[10px] leading-tight truncate w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <div className="flex items-center gap-1 px-2 mb-2 text-xs font-mono tracking-wider text-zinc-500 uppercase">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>TRANSLATION CORE</span>
          </div>
          <div className="px-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none transition-all cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-950 text-zinc-200">
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Selector */}
        <div>
          <div className="flex items-center gap-1 px-2 mb-2 text-xs font-mono tracking-wider text-zinc-500 uppercase">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>ORCHESTRATION PROVIDER</span>
          </div>
          <div className="px-1">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none transition-all cursor-pointer"
            >
              <option value="auto" className="bg-zinc-950 text-zinc-200">🤖 Auto Routing</option>
              <option value="gemini" className="bg-zinc-950 text-zinc-200">🧠 Gemini</option>
              <option value="groq" className="bg-zinc-950 text-zinc-200">⚡ Groq</option>
              <option value="openai" className="bg-zinc-950 text-zinc-200">💬 OpenAI</option>
              <option value="openrouter" className="bg-zinc-950 text-zinc-200">🌐 OpenRouter</option>
              <option value="together" className="bg-zinc-950 text-zinc-200">🔥 Together AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sidebar Footer settings link */}
      <div className="p-4 border-t border-white/5 bg-zinc-950 flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
          <span>Personality Settings</span>
        </Link>
        <span className="text-[10px] font-mono text-zinc-600 uppercase">SECURE_GRID</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Shell */}
      <div
        className={cn(
          "hidden md:block h-full transition-all duration-300 flex-shrink-0 relative z-30 pt-16",
          isOpen ? "w-80" : "w-0"
        )}
      >
        <div className="absolute inset-0 overflow-hidden w-80 h-full">
          {sidebarContent}
        </div>
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-20 -right-3.5 w-7 h-7 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
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
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full z-50 md:hidden pt-0"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
