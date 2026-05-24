"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrainCircuit, Sparkles, MessageSquare, Image as ImageIcon } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: BrainCircuit },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Image Studio", href: "/image-studio", icon: ImageIcon },
  { name: "About", href: "/about", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 overflow-hidden">
            <BrainCircuit className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-white/20 blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-space font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            LIBER AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                  isActive ? "text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-4 h-4" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden md:inline-flex text-zinc-300 hover:text-white hover:bg-white/10 rounded-full">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}