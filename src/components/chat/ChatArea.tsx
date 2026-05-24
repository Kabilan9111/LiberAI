"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Copy,
  Check,
  BrainCircuit,
  Globe,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  onMenuClick: () => void;
}

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
    <div className="space-y-2.5 text-zinc-200 text-sm md:text-base leading-relaxed break-words">
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
              let renderedLine: React.ReactNode = line;

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

// Parse **bold** tags inline
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

export function ChatArea({ onMenuClick }: ChatAreaProps) {
  const { activeChat, sendMessage, isStreaming, personalityMode, language } = useApp();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isStreaming]);

  // Auto resize input box
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const textToSend = input;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative pt-16">
      {/* Background glow matrix */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[100px] top-1/4 left-1/3" />
        <div className="absolute w-[300px] h-[300px] bg-blue-900/5 rounded-full blur-[90px] bottom-1/4 right-1/3" />
      </div>

      {/* Chat Sub-Navbar (only when chat is selected) */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold font-space text-zinc-200">
              {activeChat ? activeChat.title : "Dialogue Room"}
            </h1>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-[10px] flex items-center gap-1 text-purple-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                {personalityMode}
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] flex items-center gap-1 text-blue-400 font-mono">
                <Globe className="w-3 h-3" />
                {language}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded">
            LATENCY: 0.04ms
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {activeChat && activeChat.messages.length === 0 ? (
            <div className="space-y-10 py-8">
              <div className="text-center space-y-4">
                <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-2">
                  <BrainCircuit className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-space text-zinc-100">Initialize Prompt Grid</h2>
                <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Enter your query below to stream a neural response, configured with your active settings and dialect filter.
                </p>
              </div>
              <SuggestedPrompts onSelect={(val) => setInput(val)} />
            </div>
          ) : (
            activeChat?.messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex gap-4 items-start",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      L
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl p-4 md:p-5 shadow-sm text-sm border",
                      isUser
                        ? "bg-zinc-900 border-zinc-800 rounded-tr-none text-zinc-100"
                        : "bg-zinc-950/40 border-white/5 rounded-tl-none shadow-[0_0_15px_rgba(255,255,255,0.01)] text-zinc-200"
                    )}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap select-text">{msg.content}</div>
                    ) : (
                      <Markdown content={msg.content} />
                    )}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex-shrink-0 flex items-center justify-center text-xs text-zinc-300 font-bold">
                      U
                    </div>
                  )}
                </motion.div>
              );
            })
          )}

          {/* Streaming/Typing Loader */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-start justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse">
                L
              </div>
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Tray */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/60 p-2.5 shadow-2xl backdrop-blur-lg flex flex-col focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all duration-300">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none py-2 px-3 leading-relaxed min-h-[40px] max-h-[180px]"
              placeholder={
                isStreaming
                  ? "Liber is compiling response..."
                  : `Message in ${language} (${personalityMode} mode)...`
              }
              disabled={isStreaming}
            />

            {/* Input Actions Footer */}
            <div className="flex items-center justify-between pt-2 px-2 border-t border-white/5 mt-2">
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-zinc-500 hover:text-purple-400 rounded-lg hover:bg-white/5 transition-all"
                  title="Simulate Speech-to-Text"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-zinc-500 hover:text-blue-400 rounded-lg hover:bg-white/5 transition-all"
                  title="Simulate Image Upload"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
                  input.trim() && !isStreaming
                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105"
                    : "text-zinc-600 bg-white/5 cursor-not-allowed"
                )}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
