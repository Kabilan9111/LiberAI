"use client";

import { useApp } from "@/context/AppContext";
import { Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  {
    title: "Savage Mode Code",
    desc: "Ask the AI to write javascript code with attitude.",
    prompt: "Write a JavaScript function to run an elite engine in savage mode.",
  },
  {
    title: "Tamil Local Guide",
    desc: "Get study tips in local Tamil dialect.",
    prompt: "Exam-uku padikka oru guide thanga thala.",
  },
  {
    title: "Romantic Poem",
    desc: "Request a sweet poem about code and neon lights.",
    prompt: "Write a romantic poem about coding and purple neon glows.",
  },
  {
    title: "Weather Vibe",
    desc: "Check how the climate feels outside.",
    prompt: "How is the weather outside? Should I study or code?",
  },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Suggested Starting Prompts
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p.prompt)}
            className="flex flex-col text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.03)] transition-all duration-300 group cursor-pointer"
          >
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
              {p.title}
            </span>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 mt-1 leading-relaxed transition-colors">
              {p.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
