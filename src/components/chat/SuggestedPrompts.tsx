"use client";

import { useApp } from "@/context/AppContext";
import { Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  {
    title: "Business Strategy",
    desc: "Analyze unit economics for a startup.",
    prompt: "Analyze our SaaS unit economics: CAC is $50, ARPU is $15/mo, Churn is 5%.",
  },
  {
    title: "Reality Simulation",
    desc: "Forecast and project risk percentages for a startup launch.",
    prompt: "Should I launch my tech startup tomorrow or wait for VC interest? Simulate the trajectories.",
  },
  {
    title: "Director's Scene",
    desc: "Request a cinematic script scene with screenplay format.",
    prompt: "Write a short dramatic confrontation scene between two rival hackers in a neon-lit server room.",
  },
  {
    title: "Savage Critique",
    desc: "Critique a complex React component in savage roasting style.",
    prompt: "Critique this React component: it uses three separate useEffects to fetch data and sync state. Be brutally honest.",
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
