"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden select-none">
      {/* Sidebar (Desktop Collapsible & Mobile Drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
      />

      {/* Main chat window container */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        <ChatArea onMenuClick={() => setMobileSidebarOpen(true)} />
      </div>
    </div>
  );
}
