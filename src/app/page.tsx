"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, BrainCircuit, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black">
        <div className="absolute w-[800px] h-[800px] bg-purple-900/20 top-1/4 left-1/4 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute w-[600px] h-[600px] bg-blue-900/20 bottom-1/4 right-1/4 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-zinc-300">
              Welcome to the future of AI companions
            </span>
          </div>

          <h1 className="font-space text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-tight">
            Meet{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
              LIBER AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            Your multilingual intelligent AI companion. Experience seamless conversations, cinematic image generation, and unparalleled creativity.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/chat">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 h-14 px-8 text-base font-semibold gap-2 w-full sm:w-auto">
                <BrainCircuit className="w-5 h-5" />
                Start Chatting <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/image-studio">
              <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-14 px-8 text-base font-semibold gap-2 w-full sm:w-auto backdrop-blur-md">
                <ImageIcon className="w-5 h-5" />
                Image Studio
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating UI Elements Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-5xl mt-24 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl p-4 overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.1)]">
            <div className="flex gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="space-y-4 opacity-70">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 w-3/4 shadow-inner border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-3 w-full pt-1">
                  <div className="h-4 bg-white/10 rounded-md w-1/3" />
                  <div className="h-4 bg-white/10 rounded-md w-full" />
                  <div className="h-4 bg-white/10 rounded-md w-4/5" />
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl w-3/4 ml-auto justify-end">
                <div className="space-y-3 w-full flex flex-col items-end pt-1">
                  <div className="h-4 bg-purple-500/20 rounded-md w-1/4" />
                  <div className="h-4 bg-purple-500/20 rounded-md w-full" />
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 border border-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
