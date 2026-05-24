"use client";

import { ControlPanel } from "@/components/settings/ControlPanel";
import { useApp } from "@/context/AppContext";
import { Sparkles, Terminal, Sliders } from "lucide-react";

export default function SettingsPage() {
  const { settings, personalityMode, language } = useApp();

  // Simulated live feedback text based on sliders
  const getFeedbackSample = () => {
    const { creativity, humor, formalCasual } = settings;

    let txt = "System ready. Adjust parameters left to inspect shifting reply structures.";
    if (formalCasual < 30) {
      txt = `[Formal Node Active] "Greetings. I have analyzed your system requirements. Creativity parameters are registered at ${creativity}%, resulting in highly precise syntactic responses."`;
    } else if (formalCasual > 70) {
      txt = `[Casual Node Active] "Sup! Checked the config files. Creativity is like at ${creativity}%, so things are gonna be super wild and fun. Let's get it! ${humor > 50 ? "😎🔥" : "✌️"}"`;
    } else {
      txt = `[Balanced Node Active] "Hello! I've loaded the parameters. Creativity is set to ${creativity}% and humor to ${humor}%. Ready to help with your next project!"`;
    }
    return txt;
  };

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-16 px-6">
      {/* Ambient background glows */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-purple-950/10 rounded-full blur-[120px] top-10 right-10" />
        <div className="absolute w-[500px] h-[500px] bg-blue-950/10 rounded-full blur-[120px] bottom-10 left-10" />
      </div>

      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Title Block */}
        <div className="text-left space-y-2 border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-400 font-mono">
            <Sliders className="w-3.5 h-3.5" />
            CONTROL_PANEL_MATRIX_V1
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-space text-white">
            AI Personality Settings
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Configure the default behavior weights, creativity spectrums, and humor levels of the platform core.
          </p>
        </div>

        {/* Panel layouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="md:col-span-2 flex justify-start">
            <ControlPanel />
          </div>

          {/* Live Simulator Preview */}
          <div className="space-y-6">
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-fit space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                  Live Syntax Simulator
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active dialect</span>
                  <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 inline-block">
                    {language}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active persona</span>
                  <span className="text-xs font-semibold text-zinc-300 uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 inline-block">
                    {personalityMode}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block">Simulated Output</label>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-300 leading-normal min-h-[120px] flex items-center select-text">
                  {getFeedbackSample()}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-xs text-zinc-500 leading-relaxed font-mono">
              Tip: Test your modifications! Head back to the{" "}
              <a href="/chat" className="text-purple-400 hover:underline">
                Chat interface
              </a>{" "}
              and write questions mentioning <code className="text-zinc-300 font-semibold">code</code> or{" "}
              <code className="text-zinc-300 font-semibold">weather</code> to see parameters applied.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
