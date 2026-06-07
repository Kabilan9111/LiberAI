"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Loader2,
  Copy,
  Check,
  BrainCircuit,
  Compass,
  GraduationCap,
  TrendingUp,
  Film,
  Rocket,
  Cpu,
  Flame,
  Zap,
  RotateCcw,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Star,
  Eye,
} from "lucide-react";
import { Chat, PersonalityMode } from "@/types";
import { cn } from "@/lib/utils";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { AIConsciousnessOrb } from "./AIConsciousnessOrb";
import { AIThinkingWave } from "./AIThinkingWave";
import { CinematicAudioPlayer } from "./CinematicAudioPlayer";

interface MessageViewportProps {
  activeChat: Chat | undefined;
  isStreaming: boolean;
  streamingChatId: string | null;
  streamingBlockId: string | null;
  thinkingState: string | null;
  isGeneratingAudio?: boolean;
  deleteMessageBlock: (id: string) => void;
  setInput: (val: string) => void;
  personalityMode: PersonalityMode;
}

const MODE_COLORS: Record<
  PersonalityMode,
  { text: string; bg: string; border: string; gradient: string; shadowColor: string }
> = {
  wild: {
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-500",
    border: "border-fuchsia-500/30",
    gradient: "from-fuchsia-600 to-rose-500",
    shadowColor: "rgba(217, 70, 239, 0.1)",
  },
  study_coach: {
    text: "text-indigo-400",
    bg: "bg-indigo-500",
    border: "border-indigo-500/30",
    gradient: "from-indigo-600 to-sky-500",
    shadowColor: "rgba(99, 102, 241, 0.1)",
  },
  business: {
    text: "text-cyan-400",
    bg: "bg-cyan-500",
    border: "border-cyan-500/30",
    gradient: "from-cyan-600 to-slate-500",
    shadowColor: "rgba(6, 182, 212, 0.1)",
  },
  director: {
    text: "text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/30",
    gradient: "from-amber-600 to-orange-500",
    shadowColor: "rgba(245, 158, 11, 0.1)",
  },
  content_creator: {
    text: "text-rose-400",
    bg: "bg-rose-500",
    border: "border-rose-500/30",
    gradient: "from-rose-600 to-red-500",
    shadowColor: "rgba(244, 63, 94, 0.1)",
  },
  reality_engine: {
    text: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
    gradient: "from-emerald-600 to-teal-500",
    shadowColor: "rgba(16, 185, 129, 0.1)",
  },
  savage: {
    text: "text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500/30",
    gradient: "from-orange-600 to-red-500",
    shadowColor: "rgba(249, 115, 22, 0.1)",
  },
  motivational: {
    text: "text-violet-400",
    bg: "bg-violet-500",
    border: "border-violet-500/30",
    gradient: "from-violet-600 to-purple-500",
    shadowColor: "rgba(139, 92, 246, 0.1)",
  },
};

// Custom Markdown Parser for a clean, premium code block and rich text render without heavy dependencies
function Markdown({ content }: { content: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-zinc-200 text-sm md:text-base leading-relaxed break-words font-space">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);
          const blockId = `code-${index}`;

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50 text-[10px] font-mono text-zinc-500">
                <span className="uppercase">{lang || "code"}</span>
                <button
                  onClick={() => handleCopy(code, blockId)}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors p-1"
                >
                  {copiedId === blockId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-400/90 leading-normal select-text">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Inline formatting: Bold, Lists, Headers
        return (
          <div key={index} className="space-y-1.5 whitespace-pre-wrap">
            {part.split("\n").map((line, lIdx) => {
              // Headers
              if (line.startsWith("### ")) {
                return (
                  <h3 key={lIdx} className="text-base md:text-lg font-bold font-space text-white mt-4 mb-2">
                    {line.substring(4)}
                  </h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={lIdx} className="text-lg md:text-xl font-bold font-space text-white mt-6 mb-3">
                    {line.substring(3)}
                  </h2>
                );
              }
              if (line.startsWith("# ")) {
                return (
                  <h1 key={lIdx} className="text-xl md:text-2xl font-bold font-space text-white mt-8 mb-4">
                    {line.substring(2)}
                  </h1>
                );
              }

              // Bullet lists
              if (line.startsWith("- ")) {
                return (
                  <li key={lIdx} className="list-disc ml-5 pl-1 my-1 text-zinc-300">
                    {parseInlineBold(line.substring(2))}
                  </li>
                );
              }

              // Plain line with potential bold markdown
              return <p key={lIdx} className="min-h-[1rem]">{parseInlineBold(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function MessageViewport({
  activeChat,
  isStreaming,
  streamingChatId,
  streamingBlockId,
  thinkingState,
  isGeneratingAudio,
  deleteMessageBlock,
  setInput,
  personalityMode,
}: MessageViewportProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
    scrollToBottom();
  }, [activeChat?.messages, isStreaming]);

  const colors = MODE_COLORS[personalityMode] || MODE_COLORS.wild;

  return (
    <div className="flex-1 overflow-y-auto relative scrollbar-none">
      <div className="px-6 py-8 space-y-8 max-w-3xl mx-auto w-full">
        {activeChat && activeChat.messages.length === 0 ? (
          <div className="space-y-10 py-8">
            <div className="text-center space-y-4">
              <div
                className={cn(
                  "inline-flex w-14 h-14 rounded-full bg-gradient-to-tr items-center justify-center mb-2 transition-all duration-500",
                  colors.gradient
                )}
              >
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-space text-zinc-100">Initialize Prompt Grid</h2>
            </div>
            <SuggestedPrompts onSelect={(val) => setInput(val)} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeChat?.messages.map((block) => {
              const isThisBlockStreaming =
                isStreaming && activeChat.id === streamingChatId && block.id === streamingBlockId;
              const showCursor = isThisBlockStreaming && !thinkingState;

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className="relative group space-y-4 p-4"
                >
                  {/* Pair Deletion control */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none group-hover:pointer-events-auto">
                    <button
                      onClick={() => deleteMessageBlock(block.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-zinc-950/70 backdrop-blur-md hover:bg-red-500/10 hover:border-red-500/30 text-zinc-400 text-xs font-mono transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* User message block */}
                  {block.userMessage && (
                    <div className="flex gap-4 items-start justify-end">
                      <div
                        className="max-w-[85%] rounded-2xl p-4 text-sm border-r-2 border-white/10 bg-white/[0.02] backdrop-blur-sm text-zinc-100 flex flex-col items-end gap-1.5"
                      >
                        <div className="whitespace-pre-wrap select-text leading-relaxed">{block.userMessage}</div>
                        <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5 select-none">
                          <span>
                            {mounted
                              ? new Date(block.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </span>
                          <span className="opacity-50 mx-0.5">•</span>
                          {block.isAudio ? "Cinematic Synthesis" : "Neural transmission"}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Assistant Box */}
                <div className="flex flex-col gap-2 relative">
                  {(block.assistantMessage || block.isAudio || isThisBlockStreaming) ? (
                    <div className="flex gap-4.5 items-start justify-start">
                      <div className="z-10 relative">
                        <AIConsciousnessOrb mode={personalityMode} isStreaming={isThisBlockStreaming} isThinking={(!block.assistantMessage && !block.isAudio)} size="sm" />
                      </div>

                      {(block.assistantMessage || block.isAudio) ? (
                        <div className="relative group/message max-w-[85%] z-0">
                          <div
                            className={cn(
                              "relative p-4 text-sm border-l-2 bg-transparent text-zinc-200 transition-all duration-500",
                              colors.border.replace("border-", "border-l-"),
                              "hover:bg-white/[0.02] rounded-r-2xl"
                            )}
                          >
                          <span className={cn("text-[9px] font-mono font-bold tracking-wider mb-2 block uppercase select-none", colors.text)}>
                            Liber AI
                          </span>
                          
                          {block.isAudio && block.audioUrl ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="mb-3"
                            >
                              <CinematicAudioPlayer src={block.audioUrl} accentGlow={colors.shadowColor} />
                            </motion.div>
                          ) : null}

                          {block.assistantMessage ? (
                            <motion.div
                              initial={isThisBlockStreaming ? { opacity: 0 } : { opacity: 1 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                              <Markdown content={block.assistantMessage} />
                            </motion.div>
                          ) : null}
                          
                          {showCursor && (
                            <span className={cn("inline-block ml-1 font-bold animate-pulse text-base", colors.text)}>
                              ▋
                            </span>
                          )}

                          {/* Interactive utilities toolbar */}
                          <div className="flex items-center gap-4.5 mt-4 pt-3.5 border-t border-white/5 text-zinc-500 select-none opacity-0 group-hover/message:opacity-100 transition-opacity duration-300">
                            {block.assistantMessage && (
                              <button
                                onClick={() => navigator.clipboard.writeText(block.assistantMessage)}
                                className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                                title="Copy output"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                              title="Regenerate"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                              title="Voice Speak"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex-1" />
                            <button
                              className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                              title="Like"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                              title="Dislike"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                              title="Add to Favorite"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="-ml-4 mt-1 z-0">
                        <AIThinkingWave mode={personalityMode} isResolved={!isThisBlockStreaming} />
                      </div>
                    )}
                  </div>
                  ) : null}
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
