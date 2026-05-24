"use client";

import { ImageStyle } from "@/types";
import { cn } from "@/lib/utils";

interface StylePresetsProps {
  selectedStyle: ImageStyle;
  onStyleSelect: (style: ImageStyle) => void;
}

const PRESETS: { id: ImageStyle; label: string; desc: string; icon: string; bg: string }[] = [
  {
    id: "realistic",
    label: "Realistic",
    desc: "Photorealistic textures and reflections.",
    icon: "📷",
    bg: "from-zinc-900 to-neutral-900",
  },
  {
    id: "anime",
    label: "Anime",
    desc: "Vibrant illustrations and cel shading.",
    icon: "🌸",
    bg: "from-pink-950/20 to-zinc-900",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    desc: "Moody film-like color grading and depth.",
    icon: "🎬",
    bg: "from-blue-950/20 to-zinc-900",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    desc: "Neon highlights, dark rain, city lights.",
    icon: "🌆",
    bg: "from-purple-950/20 to-zinc-900",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    desc: "Ethereal, glowing crystals, mythical scenery.",
    icon: "🏰",
    bg: "from-emerald-950/20 to-zinc-900",
  },
  {
    id: "dark_mode",
    label: "Dark Mode",
    desc: "High contrast shadows and dark mystery.",
    icon: "🕷️",
    bg: "from-red-950/20 to-zinc-900",
  },
];

export function StylePresets({ selectedStyle, onStyleSelect }: StylePresetsProps) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
        NEURAL STYLE PRESET
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const isSelected = selectedStyle === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onStyleSelect(p.id)}
              className={cn(
                "flex flex-col text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden bg-gradient-to-br cursor-pointer",
                p.bg,
                isSelected
                  ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02]"
                  : "border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <h4 className={cn("text-xs font-bold font-space", isSelected ? "text-purple-400" : "text-zinc-200")}>
                {p.label}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
