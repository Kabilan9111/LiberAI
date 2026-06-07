"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Wand2,
  Compass,
  AlertCircle,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HFModelSelector } from "@/components/image-studio/HFModelSelector";
import { HFImageGrid as HFImageViewer } from "@/components/image-studio/HFImageViewer";
import { StylePresets } from "@/components/image-studio/StylePresets";
import { HFModelId, AspectRatio, ImageStyle, GeneratedImage } from "@/types";
import { useApp } from "@/context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string }[] = [
  { id: "1:1", label: "1:1", desc: "Square" },
  { id: "16:9", label: "16:9", desc: "Landscape" },
  { id: "3:4", label: "Portrait", desc: "Mobile/Poster" },
];

const EXAMPLE_PROMPTS: Record<HFModelId, string> = {
  "SG161222/Realistic_Vision_V5.1_noVAE":
    "Professional portrait of a confident woman in a modern office, soft window light, bokeh background, DSLR photograph",
  "Lykon/DreamShaper":
    "Epic fantasy castle on a floating island above the clouds, golden hour, magical aurora sky, concept art",
  "AstraliteHeart/pony-diffusion":
    "Cute anime girl with silver hair and emerald eyes, cherry blossom park, vibrant colors, illustration",
};

// ─────────────────────────────────────────────────────────────────────────────
// Status types
// ─────────────────────────────────────────────────────────────────────────────

type GenerationStatus =
  | "idle"
  | "generating"
  | "success"
  | "error"
  | "loading_model";

interface StatusState {
  status: GenerationStatus;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HFImageGenerator() {
  const { generatedImages, setGeneratedImages } = useApp();

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<HFModelId>(
    "SG161222/Realistic_Vision_V5.1_noVAE"
  );
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("realistic");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>("1:1");
  const [statusState, setStatusState] = useState<StatusState>({
    status: "idle",
    message: "",
  });

  const isGenerating = statusState.status === "generating" || statusState.status === "loading_model";

  // ── Fill example prompt based on selected model ───────────────────────────

  const fillExample = useCallback(() => {
    setPrompt(EXAMPLE_PROMPTS[selectedModel]);
  }, [selectedModel]);

  // ── Main generation handler ───────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setStatusState({ status: "generating", message: "Sending request to Hugging Face…" });

    // After 15s, switch message to "model loading"
    const loadingTimer = setTimeout(() => {
      setStatusState({
        status: "loading_model",
        message: "Model is warming up on Hugging Face servers. This may take up to 60s on first request…",
      });
    }, 15000);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          aspectRatio: selectedAspect,
          style: selectedStyle,
        }),
      });

      clearTimeout(loadingTimer);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Build the GeneratedImage object and prepend to the list
      const newImage: GeneratedImage = {
        id: `hf-${Date.now()}`,
        prompt: prompt.trim(),
        url: data.imageUrl,
        style: selectedStyle,
        aspectRatio: selectedAspect,
        createdAt: new Date(),
        hfModel: selectedModel,
        isHFGenerated: true,
      };

      setGeneratedImages((prev) => {
        const updated = [newImage, ...prev];
        // Persist to localStorage
        try {
          localStorage.setItem("liber_images", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      setStatusState({ status: "success", message: "Image generated successfully!" });
      setPrompt(""); // Clear input

      // Reset to idle after 3s
      setTimeout(() => setStatusState({ status: "idle", message: "" }), 3000);
    } catch (err: unknown) {
      clearTimeout(loadingTimer);
      const msg = err instanceof Error ? err.message : "Generation failed.";
      setStatusState({ status: "error", message: msg });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-16 px-6">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-purple-950/10 rounded-full blur-[120px] top-10 left-10" />
        <div className="absolute w-[500px] h-[500px] bg-blue-950/10 rounded-full blur-[120px] bottom-10 right-10" />
        <div className="absolute w-[300px] h-[300px] bg-pink-950/8 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-12">
        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className="text-left space-y-2 border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-400 font-mono">
            <Cpu className="w-3.5 h-3.5" />
            HUGGING_FACE_IMAGE_STUDIO
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-space text-white">
            AI Image Studio
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Generate stunning images using three specialized Hugging Face models.
            Choose your model, write a detailed prompt, and let AI do the rest.
          </p>
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls panel */}
          <div className="lg:col-span-2 space-y-8 bg-zinc-950/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-xl">
            {/* Model selector */}
            <HFModelSelector
              selectedModel={selectedModel}
              onModelSelect={(id) => {
                setSelectedModel(id);
                // Auto-set a sensible style
                if (id === "SG161222/Realistic_Vision_V5.1_noVAE") setSelectedStyle("realistic");
                else if (id === "Lykon/DreamShaper") setSelectedStyle("fantasy");
                else if (id === "AstraliteHeart/pony-diffusion") setSelectedStyle("anime");
              }}
              disabled={isGenerating}
            />

            {/* Style selector */}
            <StylePresets
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
            />

            {/* Aspect ratio */}
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
                      disabled={isGenerating}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer",
                        isSelected
                          ? "bg-white/10 border-purple-500/60 text-white shadow-[0_0_10px_rgba(168,85,247,0.05)]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400",
                        isGenerating && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-[9px] text-zinc-500 mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                  IMAGE PROMPT
                </label>
                <button
                  onClick={fillExample}
                  disabled={isGenerating}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Compass className="w-3 h-3" />
                  Auto-fill Example
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={isGenerating}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none leading-relaxed disabled:opacity-60"
                placeholder="Describe the image you want to generate in rich detail…"
              />
              <p className="text-[10px] text-zinc-600 font-mono">
                Tip: Be specific. Include lighting, style, mood, and composition details.
              </p>
            </div>

            {/* Generate button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                id="hf-generate-btn"
                className={cn(
                  "w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer shadow-lg",
                  prompt.trim() && !isGenerating
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25 hover:scale-[1.01]"
                    : "bg-white/5 border border-white/5 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-fit space-y-6">
            <h3 className="text-base font-bold font-space text-zinc-200">
              Model Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Pipeline:</span>
                <span className="text-zinc-300 font-mono">HF Inference API</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Steps:</span>
                <span className="text-zinc-300 font-mono">25 (fast)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">CFG Scale:</span>
                <span className="text-zinc-300 font-mono">7.5</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Resolution (1:1):</span>
                <span className="text-zinc-300 font-mono">512 × 512</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Resolution (16:9):</span>
                <span className="text-zinc-300 font-mono">768 × 432</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Token:</span>
                <span className="text-emerald-400 font-mono">HF_TOKEN ✓</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-[10px] leading-relaxed text-zinc-500 font-mono">
              First request may take 30–60s while the model loads on HF servers. Subsequent requests are faster.
            </div>

            {/* Model list */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Available Models</label>
              {[
                { name: "Realistic Vision V5", color: "text-blue-400", dot: "bg-blue-400" },
                { name: "DreamShaper", color: "text-purple-400", dot: "bg-purple-400" },
                { name: "Pony Diffusion", color: "text-pink-400", dot: "bg-pink-400" },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.dot)} />
                  <span className={m.color}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Status / Loading ───────────────────────────────────────────── */}
        <AnimatePresence>
          {statusState.status !== "idle" && (
            <motion.div
              key={statusState.status}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "rounded-2xl border p-6 flex items-start gap-4 overflow-hidden",
                statusState.status === "error"
                  ? "border-red-500/20 bg-red-950/5"
                  : statusState.status === "success"
                  ? "border-emerald-500/20 bg-emerald-950/5"
                  : "border-purple-500/20 bg-purple-950/5"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {statusState.status === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : statusState.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : statusState.status === "loading_model" ? (
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                ) : (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                )}
              </div>

              {/* Message */}
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    statusState.status === "error"
                      ? "text-red-300"
                      : statusState.status === "success"
                      ? "text-emerald-300"
                      : statusState.status === "loading_model"
                      ? "text-amber-300"
                      : "text-zinc-200"
                  )}
                >
                  {statusState.status === "generating" && "Generating Image…"}
                  {statusState.status === "loading_model" && "Model Loading on HF Servers"}
                  {statusState.status === "success" && "Image Generated Successfully!"}
                  {statusState.status === "error" && "Generation Failed"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">{statusState.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Image grid ────────────────────────────────────────────────── */}
        <HFImageViewer
          images={generatedImages}
          hfOnly={false}
        />
      </div>
    </div>
  );
}
