"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface CinematicAudioPlayerProps {
  src: string;
  accentGlow?: string;
}

export function CinematicAudioPlayer({ src, accentGlow = "rgba(255,255,255,0.2)" }: CinematicAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  
  const animationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext) audioContext.close();
    };
  }, [audioContext]);

  const initAudio = () => {
    if (!audioContext && audioRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      setAudioContext(ctx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (!audioContext) initAudio();
        else if (audioContext.state === 'suspended') audioContext.resume();
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100 || 0);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * (audioRef.current?.duration || 0);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const downloadAudio = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `liber-ai-track-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visualizer Loop
  useEffect(() => {
    if (isPlaying && analyser && dataArray) {
      const renderFrame = () => {
        animationRef.current = requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray as any);
        // Force a re-render to update bars (using state here might be too intensive, but we can do a lightweight ref update if it stutters, for now let's use a simple state trigger if we want to visually bind it)
      };
      renderFrame();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, analyser, dataArray]);

  return (
    <div className="relative group w-80 sm:w-96 rounded-[20px] p-4 bg-[#0a0a0a]/50 backdrop-blur-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 overflow-hidden">
      {/* Background Pulse Glow */}
      <motion.div
        animate={{ opacity: isPlaying ? [0.2, 0.4, 0.2] : 0 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 blur-2xl pointer-events-none -z-10"
        style={{ backgroundColor: accentGlow }}
      />
      
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        crossOrigin="anonymous"
      />

      <div className="flex items-center gap-4">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white fill-current" />
          ) : (
            <Play className="w-5 h-5 text-white fill-current ml-1" />
          )}
        </button>

        {/* Audio Visualizer & Track Info */}
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono font-medium text-zinc-300">Liber AI Soundtrack</span>
            <button onClick={downloadAudio} className="text-zinc-500 hover:text-white transition-colors" title="Download Audio">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar Container */}
          <div className="relative group/progress h-1.5 w-full bg-white/10 rounded-full cursor-pointer mt-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute top-0 left-0 h-full bg-white/80 rounded-full transition-all"
              style={{ width: `${progress}%`, boxShadow: `0 0 10px ${accentGlow}` }}
            />
          </div>

          {/* Timestamps */}
          <div className="flex justify-between mt-1 text-[10px] font-mono text-zinc-500">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
