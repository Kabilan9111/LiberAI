"use client";

import { useState } from "react";
import { GeneratedImage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Maximize2, X, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: GeneratedImage[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    // Simulate direct download or prompt image URL in a new window
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
        <span>GENERATED ARCHIVE</span>
        <span>{images.length} creations</span>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
          <p className="text-sm text-zinc-500">No images generated yet. Type a prompt above to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <motion.div
              key={img.id}
              layoutId={`img-card-${img.id}`}
              className={cn(
                "group relative rounded-xl border border-white/5 bg-zinc-950/30 overflow-hidden cursor-pointer shadow-lg hover:border-purple-500/20 transition-all duration-300",
                img.aspectRatio === "16:9" ? "aspect-video" : img.aspectRatio === "3:4" ? "aspect-[3/4]" : "aspect-square"
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

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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
                    onClick={(e) => handleDownload(e, img.url, `${img.id}.jpg`)}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <span className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/95 z-55"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-y-10 inset-x-4 md:inset-x-12 lg:inset-x-24 z-55 flex flex-col md:flex-row rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl"
            >
              {/* Image Frame */}
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>GENERATED MOCK</span>
                    </div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="hidden md:flex p-1.5 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Prompts</label>
                    <p className="text-sm text-zinc-200 leading-relaxed max-h-[140px] overflow-y-auto select-text bg-white/5 border border-white/5 rounded-lg p-3">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Style Preset</label>
                      <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 inline-block">
                        {selectedImage.style}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block">Aspect Ratio</label>
                      <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block">
                        {selectedImage.aspectRatio}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono border-t border-white/5 pt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                  <button
                    onClick={(e) => handleDownload(e, selectedImage.url, `${selectedImage.id}.jpg`)}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold transition-all duration-300 shadow-md"
                  >
                    <Download className="w-4 h-4" /> Download Artwork
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
