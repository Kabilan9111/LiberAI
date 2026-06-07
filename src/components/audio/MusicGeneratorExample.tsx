"use client";

import React, { useState } from "react";

export default function MusicGeneratorExample() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      // Calls the Next.js API route which proxies to the local Python FastAPI server
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "wild", duration: 8 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate music");
      }

      // The API returns the audio file as a blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl max-w-lg w-full flex flex-col gap-4 text-white">
      <h3 className="text-xl font-semibold">Local MusicGen Test</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/70">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 80s synthwave track with heavy bass"
          className="bg-black/50 border border-white/20 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg font-medium"
      >
        {isGenerating ? "Generating (takes ~10-30s)..." : "Generate Music"}
      </button>

      {error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-green-400 font-medium">Generation Complete!</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}
