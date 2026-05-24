"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { StylePresets } from "@/components/image-studio/StylePresets";
import { ImageGrid } from "@/components/image-studio/ImageGrid";
import { ImageStyle, AspectRatio } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string }[] = [
  { id: "1:1", label: "1:1", desc: "Square (Default)" },
  { id: "16:9", label: "16:9", desc: "Cinematic Landscape" },
  { id: "3:4", label: "Portrait", desc: "Mobile / Poster" },
];

export default function ImageStudioPage() {
  const { generatedImages, generateImage, isGeneratingImage } = useApp();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("cyberpunk");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>("16:9");

  const handleGenerate = async () => {
    if (!prompt.trim() || isGeneratingImage) return;
    await generateImage(prompt, selectedStyle, selectedAspect);
    setPrompt(""); // Clear input on success
  };

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-16 px-6">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-purple-950/10 rounded-full blur-[120px] top-10 left-10" />
        <div className="absolute w-[500px] h-[500px] bg-blue-950/10 rounded-full blur-[120px] bottom-10 right-10" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Title Block */}
        <div className="text-left space-y-2 border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "5s" }} />
            IMAGE_STUDIO_MATRIX_V1
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-space text-white">
            Cinematic Image Studio
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Translate natural text commands into high-fidelity custom visual vectors. Select style templates and canvas boundaries to initiate synthesis.
          </p>
        </div>

        {/* Studio Inputs Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel (left 2 cols) */}
          <div className="lg:col-span-2 space-y-8 bg-zinc-950/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-xl">
            {/* Prompt input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                  SYNTHESIS COMMAND
                </label>
                <button
                  onClick={() => setPrompt("Futuristic neon temple hidden deep in the Himalayas, cybernetic monks meditating, heavy golden lighting, snow falling, 8k cinematic masterpiece")}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3 h-3" /> Auto-fill Example
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none leading-relaxed"
                placeholder="Describe the image you want to generate in rich details..."
                disabled={isGeneratingImage}
              />
            </div>

            {/* Style selector */}
            <StylePresets selectedStyle={selectedStyle} onStyleSelect={setSelectedStyle} />

            {/* Aspect ratios */}
            <div className="space-y-4">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                CANVAS RATIO
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ASPECT_RATIOS.map((item) => {
                  const isSelected = selectedAspect === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedAspect(item.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer",
                        isSelected
                          ? "bg-white/10 border-purple-500/60 text-white shadow-[0_0_10px_rgba(168,85,247,0.05)]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400"
                      )}
                    >
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-[9px] text-zinc-500 mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Trigger */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGeneratingImage}
                className={cn(
                  "w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer shadow-lg",
                  prompt.trim() && !isGeneratingImage
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25 hover:scale-[1.01]"
                    : "bg-white/5 border border-white/5 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Synthesizing Matrix...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Synthesize Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Info Panel (right 1 col) */}
          <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-fit space-y-6">
            <h3 className="text-base font-bold font-space text-zinc-200">Synthesis Parameters</h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">API Pipeline:</span>
                <span className="text-zinc-300 font-mono">DALL-E 3 & Stable Cascade</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Response Speed:</span>
                <span className="text-zinc-300 font-mono">~3.2s / Frame</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Maximum Resolution:</span>
                <span className="text-zinc-300 font-mono">1792 x 1024 px</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Credits Remaining:</span>
                <span className="text-emerald-400 font-semibold font-mono">150 credits</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-[10px] leading-relaxed text-zinc-500 font-mono">
              Note: This is a frontend simulation. Synthesize Image uses premium dynamic image maps to simulate high-fidelity generation.
            </div>
          </div>
        </div>

        {/* Generate Loader Screen */}
        <AnimatePresence>
          {isGeneratingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-purple-500/20 bg-purple-950/5 p-8 flex flex-col items-center justify-center gap-4 text-center overflow-hidden"
            >
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                <Wand2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Matrix Rendering Active</h4>
                <p className="text-xs text-zinc-500 mt-1">Generating high-fidelity pixel matrices matching style: <span className="uppercase text-purple-400 font-semibold">{selectedStyle}</span>...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Grid */}
        <ImageGrid images={generatedImages} />
      </div>
    </div>
  );
}
