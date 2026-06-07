"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicBackground } from "./CinematicBackground";
import { SpatialHotspots } from "./SpatialHotspots";
import { ModeHeader } from "./ModeHeader";
import { MessageViewport } from "./MessageViewport";
import { FloatingInputDock } from "./FloatingInputDock";
import { StatusFooter } from "./StatusFooter";
import { AIConsciousnessOrb } from "./AIConsciousnessOrb";
import { Sparkles, Menu } from "lucide-react";

interface ChatAreaProps {
  onMenuClick: () => void;
}

export function ChatArea({ onMenuClick }: ChatAreaProps) {
  const {
    activeChat,
    chats,
    sendMessage,
    deleteMessageBlock,
    isStreaming,
    isGeneratingAudio,
    thinkingState,
    personalityMode,
    streamingChatId,
    streamingBlockId,
    setPersonalityMode,
    selectChat,
  } = useApp();

  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<"left" | "right">("left");

  const filteredChats = chats.filter((c) => c.personalityMode === personalityMode);
  const activeIndex = filteredChats.findIndex((c) => c.id === activeChat?.id);
  const prevChat = activeIndex > 0 ? filteredChats[activeIndex - 1] : null;
  const nextChat = activeIndex >= 0 && activeIndex < filteredChats.length - 1 ? filteredChats[activeIndex + 1] : null;

  const handleNavigate = (chatId: string, dir: "prev" | "next") => {
    setDirection(dir === "prev" ? "right" : "left");
    selectChat(chatId);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const textToSend = input;
    setInput("");
    await sendMessage(textToSend);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative pt-0 overflow-hidden">
      {/* 3-Layer Spatial Depth Background Wallpaper */}
      <CinematicBackground mode={personalityMode} />

      {/* Spatial Hotspots Cursor Navigation */}
      <SpatialHotspots
        prevChat={prevChat}
        nextChat={nextChat}
        handleNavigate={handleNavigate}
      />

      {/* Top Main Page Header (Center Title + Orb, Right Actions) */}
      <div className="w-full h-16 flex items-center justify-between px-8 z-20 select-none flex-shrink-0 mt-3">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger menu button */}
          <button
            onClick={onMenuClick}
            className="flex md:hidden p-2 rounded-lg border border-white/5 bg-zinc-950/20 text-zinc-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors shadow"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Center Title Logo + Dynamic Consciousness Orb */}
        <div className="flex items-center gap-3.5 bg-zinc-950/10 px-6 py-2 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg select-none">
          <AIConsciousnessOrb mode={personalityMode} isStreaming={isStreaming} isThinking={!!thinkingState} />
          <div className="flex flex-col">
            <span className="font-space font-bold text-sm tracking-widest text-white leading-none">LIBER AI</span>
            <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5 select-none">YOUR INTELLIGENCE. UNLEASHED.</span>
          </div>
        </div>

        {/* Right Action Icons matching mockup */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 border border-white/5 bg-zinc-950/25 rounded-full text-zinc-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors shadow"
            title="Audio Channel"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5v14M7 9v6M22 10v4M2 10v4" />
            </svg>
          </button>
          <button
            className="p-2 border border-white/5 bg-zinc-950/25 rounded-full text-zinc-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors shadow"
            title="Sparkles features"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </button>
          <div className="relative w-7 h-7 rounded-full border border-purple-500/30 overflow-hidden shadow select-none">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="profile" className="object-cover w-full h-full" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950 shadow" />
          </div>
        </div>
      </div>

      {/* Floating Chat Container Box */}
      <div className="flex-1 flex flex-col mx-6 mb-4 border border-white/10 bg-zinc-950/20 backdrop-blur-xl rounded-[28px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.55)] relative min-h-0">
        <ModeHeader
          onMenuClick={onMenuClick}
          personalityMode={personalityMode}
          isStreaming={isStreaming}
          thinkingState={thinkingState}
        />
        <div className="flex-1 flex flex-col min-h-0 relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeChat?.id}
              custom={direction}
              variants={{
                enter: (dir: "left" | "right") => ({ x: dir === "left" ? 120 : -120, opacity: 0, filter: "blur(10px)" }),
                center: { x: 0, opacity: 1, filter: "blur(0px)" },
                exit: (dir: "left" | "right") => ({ x: dir === "left" ? -120 : 120, opacity: 0, filter: "blur(10px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <MessageViewport
                activeChat={activeChat}
                isStreaming={isStreaming}
                isGeneratingAudio={isGeneratingAudio}
                streamingChatId={streamingChatId}
                streamingBlockId={streamingBlockId}
                thinkingState={thinkingState}
                deleteMessageBlock={deleteMessageBlock}
                setInput={setInput}
                personalityMode={personalityMode}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <FloatingInputDock
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isStreaming={isStreaming}
          personalityMode={personalityMode}
          setPersonalityMode={setPersonalityMode}
        />
      </div>

      {/* Status Footer at the bottom */}
      <StatusFooter mode={personalityMode} chatsCount={chats.length} />
    </div>
  );
}
