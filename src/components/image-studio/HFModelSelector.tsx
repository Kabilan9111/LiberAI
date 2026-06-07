"use client";

import { HFModel, HFModelId } from "@/types";
import { cn } from "@/lib/utils";

interface HFModelSelectorProps {
  selectedModel: HFModelId;
  onModelSelect: (modelId: HFModelId) => void;
  disabled?: boolean;
}

const MODEL_CONFIGS: {
  id: HFModelId;
  icon: string;
  badge: string;
  badgeColor: string;
  cardBg: string;
  borderActive: string;
  name: string;
  description: string;
  useCases: string[];
}[] = [
  {
    id: "SG161222/Realistic_Vision_V5.1_noVAE",
    icon: "📷",
    badge: "Realistic",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    cardBg: "from-blue-950/20 to-zinc-900",
    borderActive: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    name: "Realistic Vision V5",
    description: "Photorealistic humans, cinematic portraits & product renders",
    useCases: ["Portraits", "Cinematic shots", "Product renders"],
  },
  {
    id: "Lykon/DreamShaper",
    icon: "🎨",
    badge: "Creative",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cardBg: "from-purple-950/20 to-zinc-900",
    borderActive: "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    name: "DreamShaper",
    description: "Fantasy worlds, concept art, creative posters & illustrations",
    useCases: ["Fantasy art", "Concept art", "Posters"],
  },
  {
    id: "AstraliteHeart/pony-diffusion",
    icon: "🌸",
    badge: "Anime",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    cardBg: "from-pink-950/20 to-zinc-900",
    borderActive: "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
    name: "Pony Diffusion",
    description: "Anime style, stylized characters & manga-inspired artwork",
    useCases: ["Anime", "Stylized chars", "Manga art"],
  },
];

export function HFModelSelector({ selectedModel, onModelSelect, disabled }: HFModelSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          HF GENERATION MODEL
        </label>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
          Powered by Hugging Face
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {MODEL_CONFIGS.map((cfg) => {
          const isSelected = selectedModel === cfg.id;
          return (
            <button
              key={cfg.id}
              onClick={() => onModelSelect(cfg.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-4 text-left p-4 rounded-xl border transition-all duration-300",
                "relative overflow-hidden bg-gradient-to-br cursor-pointer",
                cfg.cardBg,
                isSelected
                  ? `${cfg.borderActive} scale-[1.01]`
                  : "border-white/5 hover:bg-white/5 hover:border-white/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">{cfg.icon}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={cn(
                      "text-sm font-bold font-space",
                      isSelected ? "text-white" : "text-zinc-200"
                    )}
                  >
                    {cfg.name}
                  </h4>
                  <span
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full border font-mono font-semibold",
                      cfg.badgeColor
                    )}
                  >
                    {cfg.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">{cfg.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cfg.useCases.map((uc) => (
                    <span
                      key={uc}
                      className="text-[9px] bg-white/5 border border-white/5 text-zinc-500 px-1.5 py-0.5 rounded"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border-2 border-white/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}

              {/* Active glow line */}
              {isSelected && (
                <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
