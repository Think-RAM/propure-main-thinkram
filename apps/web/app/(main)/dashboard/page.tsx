"use client";
import DashboardPage from "@/components/real-estate-map";
import { ChatSession, ChatSidebar } from "@/components/ChatHistorySidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";

const chatSessions: ChatSession[] = [
  {
    id: "1",
    title: "Map Configuration",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Property Analysis",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Market Research",
    createdAt: new Date().toISOString(),
  },
];

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = (close = false) => {
    setIsSidebarOpen(close ? false : !isSidebarOpen);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        {/* Main canvas (map / hero) */}
        <main className="absolute inset-0 z-0">
          <DashboardPage closeSidebar={() => setIsSidebarOpen(false)} />
        </main>

        {/* ChatGPT-style sidebar */}
        <ChatSidebar
          open={isSidebarOpen}
          toggle={() => toggleSidebar()}
          sessions={chatSessions}
          activeSessionId="1"
          onSelect={(id) => console.log("Selected session:", id)}
          onNewChat={() => console.log("New chat initiated")}
        />
      </div>
    </TooltipProvider>
  );
}
