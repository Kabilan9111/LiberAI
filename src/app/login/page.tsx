"use client";

import { LoginCard } from "@/components/auth/LoginCard";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden pt-16 px-4">
      {/* Moving background nebula */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black">
        <motion.div
          animate={{
            scale: [1, 1.15, 0.9, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] top-1/3 left-1/3 mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 0.85, 1.1, 1],
            rotate: [0, -20, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[450px] h-[450px] bg-blue-900/10 rounded-full blur-[110px] bottom-1/3 right-1/3 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <LoginCard />
    </div>
  );
}
