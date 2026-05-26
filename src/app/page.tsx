"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Image as ImageIcon,
  MessageSquare,
  Volume2,
  Lock,
  Globe,
  Coins,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const PERSONALITIES = [
  {
    mode: "Director Mode",
    desc: "Cinematic writers, screenwriters, and dramatic pacing creators.",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/20 hover:border-amber-500/50",
    textGlow: "text-amber-400",
    bg: "bg-amber-500/5",
    icon: "🎬",
  },
  {
    mode: "Reality Engine",
    desc: "Multi-scenario outcome forecasting and risk percentage simulation.",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/20 hover:border-emerald-500/50",
    textGlow: "text-emerald-400",
    bg: "bg-emerald-500/5",
    icon: "🌀",
  },
  {
    mode: "Business Mode",
    desc: "Corporate strategic advice, VC frameworks, and unit economics.",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)] border-cyan-500/20 hover:border-cyan-500/50",
    textGlow: "text-cyan-400",
    bg: "bg-cyan-500/5",
    icon: "💼",
  },
  {
    mode: "Wild Mode",
    desc: "Emotionally adaptive, mature, and psychologically complex conversation.",
    glow: "shadow-[0_0_20px_rgba(217,70,239,0.15)] border-fuchsia-500/20 hover:border-fuchsia-500/50",
    textGlow: "text-fuchsia-400",
    bg: "bg-fuchsia-500/5",
    icon: "👁️",
  },
];

const SIMULATED_PROMPTS = [
  {
    lang: "Director Mode",
    prompt: "Write a short dramatic confrontation scene in a rainy alleyway.",
    response: "EXT. ALLEYWAY - NIGHT\n\nRain drums against steel bins. LEO raises his hands, water dripping from his chin.\n\nLEO: 'You don't have to do this, Marcus.'\n\nMarcus steps forward, face shrouded by his trench coat.\n\nMARCUS: 'We crossed that line miles ago, Leo.'",
  },
  {
    lang: "Reality Engine",
    prompt: "Should I launch my tech startup tomorrow or wait for VC interest?",
    response: "SIMULATING TRAJECTORIES...\n\n- **Base Path (60%)**: Launching tomorrow builds direct market feedback. Likely trajectory: slow initial signups, but faster product iteration.\n- **Optimistic Path (15%)**: Viral organic reach, early customer revenue.\n- **Pessimistic Path (25%)**: Silent launch with zero acquisition, leading to stagnation. Recommendation: Launch tomorrow.",
  },
  {
    lang: "Business Mode",
    prompt: "Analyze our SaaS unit economics: CAC is $50, ARPU is $15/mo, Churn is 5%.",
    response: "SWOT & METRICS ANALYSIS:\n\n1. **LTV (Lifetime Value)**: $15 / 0.05 = $300.\n2. **LTV:CAC Ratio**: $300 : $50 = 6:1 (Excellent, target is >3:1).\n3. **Payback Period**: $50 / $15 = 3.3 months.\n\nRecommendation: Aggressively scale acquisition channels; your unit economics are highly profitable.",
  },
];

export default function Home() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [typingState, setTypingState] = useState<"typing-prompt" | "waiting" | "streaming-response" | "done">("typing-prompt");

  // Simulated Typing/Streaming effect for the hero showcase
  useEffect(() => {
    let active = true;
    const item = SIMULATED_PROMPTS[promptIndex];

    if (typingState === "typing-prompt") {
      let charIndex = 0;
      setCurrentResponse("");
      const timer = setInterval(() => {
        if (!active) return;
        if (charIndex <= item.prompt.length) {
          setCurrentPrompt(item.prompt.substring(0, charIndex));
          charIndex++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            if (active) setTypingState("waiting");
          }, 600);
        }
      }, 50);
      return () => {
        active = false;
        clearInterval(timer);
      };
    } else if (typingState === "waiting") {
      const timer = setTimeout(() => {
        if (active) setTypingState("streaming-response");
      }, 800);
      return () => clearTimeout(timer);
    } else if (typingState === "streaming-response") {
      let wordIndex = 0;
      const words = item.response.split(" ");
      const timer = setInterval(() => {
        if (!active) return;
        if (wordIndex < words.length) {
          setCurrentResponse(words.slice(0, wordIndex + 1).join(" "));
          wordIndex++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            if (active) setTypingState("done");
          }, 3000);
        }
      }, 100);
      return () => {
        active = false;
        clearInterval(timer);
      };
    } else if (typingState === "done") {
      const timer = setTimeout(() => {
        if (active) {
          setPromptIndex((prev) => (prev + 1) % SIMULATED_PROMPTS.length);
          setTypingState("typing-prompt");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [promptIndex, typingState]);

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden pt-24 pb-16">
      {/* Cinematic Background Glows */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[600px] h-[600px] bg-purple-600/10 top-[-10%] left-[10%] rounded-full blur-[140px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 40, -50, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[500px] h-[500px] bg-blue-600/10 bottom-[10%] right-[10%] rounded-full blur-[130px] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
        {/* Sparkles Welcome Chip */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.1)]"
        >
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: "3s" }} />
          <span className="text-sm font-medium text-zinc-300 tracking-wide">
            Next Generation Multilingual AI Agent
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-space text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 leading-none"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white">
            LIBER
          </span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500 animate-gradient-x shadow-purple-500/20">
            AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl leading-relaxed"
        >
          Your multilingual intelligent AI companion. Experience sleek, glassmorphic dialogues and cyberpunk image studio generations in 7 major languages.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-24"
        >
          <Link href="/chat" className="w-full sm:w-auto">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white h-14 px-8 text-base font-semibold gap-2 w-full sm:w-auto shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-500/30 transition-all duration-300 hover:scale-105">
              <BrainCircuit className="w-5 h-5" />
              Start Chat <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/image-studio" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-14 px-8 text-base font-semibold gap-2 w-full sm:w-auto backdrop-blur-md transition-all duration-300 hover:scale-105">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              Generate Images
            </Button>
          </Link>
        </motion.div>

        {/* Simulated Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-4xl rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] mb-32"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-xs text-zinc-500 font-mono ml-2">SIMULATOR_CORE_V1.0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] text-zinc-400 font-mono">
              <Globe className="w-3 h-3 text-purple-400" />
              {SIMULATED_PROMPTS[promptIndex].lang}
            </div>
          </div>

          {/* Terminal chat area */}
          <div className="p-6 space-y-6 text-left min-h-[220px]">
            {/* User message */}
            <div className="flex gap-4 items-start max-w-xl">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs text-zinc-300">
                U
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 text-zinc-200 text-sm md:text-base">
                {currentPrompt}
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-purple-400 animate-pulse" />
              </div>
            </div>

            {/* AI message */}
            <AnimatePresence mode="wait">
              {(typingState === "streaming-response" || typingState === "done") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 items-start max-w-xl ml-auto justify-end"
                >
                  <div className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/20 rounded-2xl rounded-tr-none p-4 text-zinc-100 text-sm md:text-base shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                    {currentResponse}
                    {typingState === "streaming-response" && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-xs text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    L
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Personality grid header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-space font-bold tracking-tight mb-4">
            Adaptive Personalities
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose your companion's vibe. Our neural agent morphs its response syntax, humor thresholds, and cultural tone dynamically.
          </p>
        </div>

        {/* Personalities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-32">
          {PERSONALITIES.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-xl border p-6 text-left transition-all duration-300 ${p.glow} ${p.bg}`}
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className={`text-xl font-bold font-space mb-2 ${p.textGlow}`}>{p.mode}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* About Section */}
        <div id="about" className="w-full max-w-5xl mb-32 pt-12 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-400 font-mono">
                <Globe className="w-3.5 h-3.5" /> TRANSLATION_ROUTING_INFO
              </div>
              <h2 className="text-3xl md:text-5xl font-space font-bold tracking-tight text-white leading-tight">
                Breaking Language Barriers Instantly
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Liber AI integrates translation pipelines directly into n-layer chat networks. Experience deep conversational streams in 7 major regional dialects—including Tamil local slang—synthesized with accurate humor thresholds and creativity weights.
              </p>
              <div className="space-y-3 font-mono text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Tamil, Telugu, Malayalam, Kannada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Hindi, Marathi, English</span>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-zinc-950/40 p-8 backdrop-blur-md shadow-inner space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-space">Core Synthesis Nodes</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">STABLE_CASCADE_V2</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                System models run localized parameters weighting creativity index and humors. The conversational outputs adapt syntactically in real time to the selected parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section (satisfying Landing Page pricing requirements) */}
        <div id="pricing" className="w-full max-w-5xl mb-32 pt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-space font-bold tracking-tight mb-4">
              Flexible Credits, Infinite Creation
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Get premium features, high-fidelity generations, and zero-latency stream pipes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-white/5 bg-zinc-950/40 p-8 text-left flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold font-space text-zinc-100 mb-2">Free Vibe</h3>
                <p className="text-zinc-500 text-sm mb-6">Explore the conversational matrix.</p>
                <div className="text-3xl font-bold font-space text-white mb-6">$0 <span className="text-sm text-zinc-500">/ forever</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Access to Study Coach & Savage modes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Standard translation filters
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    10 Image generations / day
                  </li>
                </ul>
              </div>
              <Link href="/chat">
                <Button variant="outline" className="w-full rounded-full border-white/10 text-zinc-300">Start Free</Button>
              </Link>
            </motion.div>

            {/* Pro - Glow */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-purple-500/40 bg-zinc-950/40 p-8 text-left flex flex-col justify-between relative shadow-[0_0_30px_rgba(168,85,247,0.15)]"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-black font-space font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                RECOMMENDED
              </div>
              <div>
                <h3 className="text-xl font-bold font-space text-purple-400 mb-2">Creator Core</h3>
                <p className="text-zinc-500 text-sm mb-6">Unlocked intelligence and styles.</p>
                <div className="text-3xl font-bold font-space text-white mb-6">$15 <span className="text-sm text-zinc-500">/ month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    All 8 premium personality modes
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Ultra-fast response speeds
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Unlimited Image studio creations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Cinematic aspect-ratio unlocks
                  </li>
                </ul>
              </div>
              <Link href="/signup">
                <Button className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white">Upgrade Now</Button>
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-white/5 bg-zinc-950/40 p-8 text-left flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold font-space text-zinc-100 mb-2">Omni Matrix</h3>
                <p className="text-zinc-500 text-sm mb-6">Custom nodes & enterprise sandboxes.</p>
                <div className="text-3xl font-bold font-space text-white mb-6">Custom <span className="text-sm text-zinc-500">/ team</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Custom API nodes & models
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Dedicated GPU cloud access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Unlimited prompt parameters
                  </li>
                </ul>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full rounded-full border-white/10 text-zinc-300">Contact Sales</Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Futuristic CTA block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-blue-950/20 p-12 text-center relative overflow-hidden mb-12 shadow-[0_0_40px_rgba(168,85,247,0.05)]"
        >
          <div className="absolute inset-0 bg-grid-white opacity-5" />
          <h2 className="text-3xl md:text-5xl font-space font-bold tracking-tight mb-4 relative z-10">
            Ready to shape the future?
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8 relative z-10">
            Open the gate, step into the conversational grid, and start creating with Liber AI today.
          </p>
          <Link href="/chat" className="relative z-10 inline-block">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 h-14 px-8 text-base font-semibold gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Initialize Matrix <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 pt-12 mt-12 bg-black/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-[10px] text-white">L</div>
            <span className="font-space font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">LIBER AI</span>
          </div>
          <p className="text-xs text-zinc-600">&copy; 2026 Liber AI Corp. Futuristic Multilingual Interfaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
