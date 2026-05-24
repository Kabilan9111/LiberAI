import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Liber AI | Your Multilingual Intelligent Companion",
  description:
    "Futuristic, smooth, and intelligent AI platform for chat, image generation, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-black text-white min-h-screen selection:bg-purple-500/30 font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative overflow-x-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
