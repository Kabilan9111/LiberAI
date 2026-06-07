"use client";

import { useState } from "react";
import { GeneratedImage, HFModelId } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Maximize2,
  X,
  Sparkles,
  Calendar,
  Cpu,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Model display map
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_DISPLAY: Record<
  string,
  { name: string; color: string; badge: string }
> = {
  "SG161222/Realistic_Vision_V5.1_noVAE": {
    name: "Realistic Vision V5",
    color: "text-blue-400",
    badge: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  },
  "Lykon/DreamShaper": {
    name: "DreamShaper",
    color: "text-purple-400",
    badge: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  },
  "AstraliteHeart/pony-diffusion": {
    name: "Pony Diffusion",
    color: "text-pink-400",
    badge: "bg-pink-500/20 border-pink-500/30 text-pink-400",
  },
};

function getModelInfo(modelId?: string) {
  if (!modelId) return null;
  return MODEL_DISPLAY[modelId] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Download helper — works with both data: URLs and remote URLs
// ─────────────────────────────────────────────────────────────────────────────

async function downloadImage(url: string, filename: string) {
  try {
    if (url.startsWith("data:")) {
      // data URL → direct anchor click
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Remote URL → fetch + blob
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
  } catch (err) {
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HFImageGrid component
// ─────────────────────────────────────────────────────────────────────────────

interface HFImageGridProps {
  images: GeneratedImage[];
  /** If provided, only HF-generated images are shown */
  hfOnly?: boolean;
}

export function HFImageGrid({ images, hfOnly = false }: HFImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const displayImages = hfOnly ? images.filter((img) => img.isHFGenerated) : images;

  const handleDownload = async (
    e: React.MouseEvent,
    img: GeneratedImage
  ) => {
    e.stopPropagation();
    setDownloading(img.id);
    const ext = img.url.startsWith("data:image/png") ? "png" : "jpg";
    await downloadImage(img.url, `liber-ai-${img.id}.${ext}`);
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          GENERATED ARCHIVE
        </span>
        <span>{displayImages.length} creations</span>
      </div>

      {displayImages.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
          <Cpu className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">
            No images generated yet. Enter a prompt and click Generate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((img) => {
            const modelInfo = getModelInfo(img.hfModel);
            return (
              <motion.div
                key={img.id}
                layoutId={`hf-img-${img.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group relative rounded-xl border border-white/5 bg-zinc-950/30",
                  "overflow-hidden cursor-pointer shadow-lg",
                  "hover:border-purple-500/20 transition-all duration-300",
                  img.aspectRatio === "16:9"
                    ? "aspect-video"
                    : img.aspectRatio === "3:4"
                    ? "aspect-[3/4]"
                    : "aspect-square"
                )}
                onClick={() => setSelectedImage(img)}
              >
                {/* Image */}
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* HF badge */}
                {img.isHFGenerated && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-mono text-emerald-400">
                    <CheckCircle className="w-2.5 h-2.5" />
                    HF Generated
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {/* Model badge */}
                  {modelInfo && (
                    <span
                      className={cn(
                        "text-[9px] font-mono px-2 py-0.5 rounded border inline-block w-fit mb-1",
                        modelInfo.badge
                      )}
                    >
                      {modelInfo.name}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-[9px] font-mono bg-purple-500 text-black px-2 py-0.5 rounded font-semibold uppercase">
                      {img.style}
                    </span>
                    <span className="text-[9px] font-mono bg-white/10 text-zinc-300 px-2 py-0.5 rounded uppercase">
                      {img.aspectRatio}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed mb-3">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                    <button
                      onClick={(e) => handleDownload(e, img)}
                      disabled={downloading === img.id}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors disabled:opacity-60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloading === img.id ? "Downloading…" : "Download"}
                    </button>
                    <span className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-y-10 inset-x-4 md:inset-x-12 lg:inset-x-24 z-50 flex flex-col md:flex-row rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl"
            >
              {/* Image frame */}
              <div className="flex-1 bg-black flex items-center justify-center p-4 relative min-h-[300px]">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-full object-contain rounded"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side panel */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-zinc-950 p-6 flex flex-col justify-between text-zinc-300">
                <div className="space-y-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      {selectedImage.isHFGenerated ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          HF GENERATED
                        </span>
                      ) : (
                        <span className="text-purple-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          GENERATED
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="hidden md:flex p-1.5 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Model info */}
                  {selectedImage.hfModel && (() => {
                    const info = getModelInfo(selectedImage.hfModel);
                    return info ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase block">
                          HF Model
                        </label>
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded border inline-block",
                            info.badge
                          )}
                        >
                          {info.name}
                        </span>
                        <p className="text-[10px] text-zinc-600 font-mono">
                          {selectedImage.hfModel}
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* Prompt */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">
                      Prompt
                    </label>
                    <p className="text-sm text-zinc-200 leading-relaxed max-h-[120px] overflow-y-auto select-text bg-white/5 border border-white/5 rounded-lg p-3">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Style
                      </label>
                      <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 inline-block">
                        {selectedImage.style}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Ratio
                      </label>
                      <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block">
                        {selectedImage.aspectRatio}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono border-t border-white/5 pt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedImage.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Download button */}
                <div className="pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={(e) => handleDownload(e, selectedImage)}
                    disabled={downloading === selectedImage.id}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 h-11 rounded-xl",
                      "bg-white hover:bg-zinc-200 text-black font-semibold",
                      "transition-all duration-300 shadow-md",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    {downloading === selectedImage.id ? "Downloading…" : "Download Image"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
