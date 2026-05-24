"use client";

import { useApp } from "@/context/AppContext";
import { Sliders, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { settings, updateSettings } = useApp();

  const handleSliderChange = (key: "creativity" | "humor" | "formalCasual", value: number) => {
    updateSettings({ [key]: value });
  };

  const handlePresetSelect = (preset: "concise" | "balanced" | "detailed") => {
    updateSettings({ responsePreset: preset });
    // Adjust sliders based on preset as a cool utility
    if (preset === "concise") {
      updateSettings({ creativity: 30, formalCasual: 20 });
    } else if (preset === "balanced") {
      updateSettings({ creativity: 70, formalCasual: 50 });
    } else if (preset === "detailed") {
      updateSettings({ creativity: 95, formalCasual: 80 });
    }
  };

  const handleReset = () => {
    updateSettings({
      creativity: 75,
      humor: 50,
      formalCasual: 60,
      responsePreset: "balanced",
    });
  };

  return (
    <div className="bg-zinc-950/40 border border-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-xl space-y-8 max-w-2xl w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold font-space text-zinc-100">Parameters Core</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> reset
        </button>
      </div>

      {/* Preset selections */}
      <div className="space-y-3">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
          RESPONSE TYPE PRESET
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["concise", "balanced", "detailed"] as const).map((p) => {
            const isSelected = settings.responsePreset === p;
            return (
              <button
                key={p}
                onClick={() => handlePresetSelect(p)}
                className={cn(
                  "py-3 rounded-xl border text-xs font-semibold capitalize transition-all duration-300 cursor-pointer",
                  isSelected
                    ? "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Creativity */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">CREATIVITY LEVEL</span>
            <span className="text-purple-400 font-bold">{settings.creativity}%</span>
          </div>
          <div className="relative group">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.creativity}
              onChange={(e) => handleSliderChange("creativity", parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none bg-zinc-900 accent-purple-500 cursor-pointer outline-none focus:ring-1 focus:ring-purple-500/35"
              style={{
                background: `linear-gradient(to right, rgb(168,85,247) 0%, rgb(168,85,247) ${settings.creativity}%, rgb(24,24,27) ${settings.creativity}%, rgb(24,24,27) 100%)`,
              }}
            />
            {/* Soft Glow */}
            <div className="absolute inset-0 bg-purple-500/5 rounded blur-[4px] pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          </div>
          <p className="text-[10px] text-zinc-500 leading-snug">
            Higher values spark wider vocabulary choices, poetic style structures, and deeper logical reasoning.
          </p>
        </div>

        {/* Humor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">HUMOR THRESHOLD</span>
            <span className="text-blue-400 font-bold">{settings.humor}%</span>
          </div>
          <div className="relative group">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.humor}
              onChange={(e) => handleSliderChange("humor", parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none bg-zinc-900 accent-blue-500 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500/35"
              style={{
                background: `linear-gradient(to right, rgb(59,130,246) 0%, rgb(59,130,246) ${settings.humor}%, rgb(24,24,27) ${settings.humor}%, rgb(24,24,27) 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-blue-500/5 rounded blur-[4px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          </div>
          <p className="text-[10px] text-zinc-500 leading-snug">
            Higher values inject witty analogies, playful remarks, and emojis in responses.
          </p>
        </div>

        {/* Formal / Casual */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">TONAL AXIS (FORMAL ↔ CASUAL)</span>
            <span className="text-zinc-300 font-bold">
              {settings.formalCasual < 40 ? "Formal" : settings.formalCasual > 70 ? "Casual" : "Balanced"} ({settings.formalCasual}%)
            </span>
          </div>
          <div className="relative group">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.formalCasual}
              onChange={(e) => handleSliderChange("formalCasual", parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none bg-zinc-900 accent-zinc-400 cursor-pointer outline-none focus:ring-1 focus:ring-zinc-400/35"
              style={{
                background: `linear-gradient(to right, rgb(212,212,216) 0%, rgb(212,212,216) ${settings.formalCasual}%, rgb(24,24,27) ${settings.formalCasual}%, rgb(24,24,27) 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-zinc-400/5 rounded blur-[4px] pointer-events-none group-hover:bg-zinc-400/10 transition-colors" />
          </div>
          <p className="text-[10px] text-zinc-500 leading-snug">
            Formal tone uses complete sentence syntaxes and clear grammar. Casual introduces slang, tags, and speech shortcuts.
          </p>
        </div>
      </div>

      {/* Info indicator */}
      <div className="flex gap-3 bg-white/5 border border-white/5 rounded-xl p-4 text-[11px] leading-relaxed text-zinc-500 font-mono">
        <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span>
          Updating parameters live syncs with the streaming companion model, causing immediate shifts in conversation syntax structures.
        </span>
      </div>
    </div>
  );
}
