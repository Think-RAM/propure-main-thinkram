"use client";
import DashboardPage from "@/components/real-estate-map";
import { ChatSidebar } from "@/components/ChatHistorySidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useUserChats } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

export default function Page() {
  const {
    historySidebarOpen,
    userChatSessions,
    historyLoading,
    activeSessionId,
    setActiveSession,
    toggleHistorySidebar,
  } = useUserChats();

  // const toggleSidebar = (close = false) => {
  //   setIsSidebarOpen(close ? false : !isSidebarOpen);
  //   if( !close ) {
  //     setActiveSession(null);
  //     console.log("Sidebar opened, active session cleared",userChatSessions, activeSessionId, isSidebarOpen,close);
  //   }
  //   console.log("Sidebar toggled:", userChatSessions,isSidebarOpen, close, activeSessionId);
  // };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        <div className={cn(
          "relative h-screen w-screen overflow-hidden",
          "bg-[#0f1419] text-[#f7f9fc] antialiased"
        )}>
          {/* Main canvas (map / hero) */}
          <main className="absolute inset-0 z-0">
            <DashboardPage closeSidebar={() => toggleHistorySidebar()} />
          </main>

          {/* ChatGPT-style sidebar */}
          <ChatSidebar
            open={historySidebarOpen}
            toggle={() => toggleHistorySidebar()}
            sessions={userChatSessions}
            activeSessionId={activeSessionId ?? undefined}
            onSelect={(id) => {
              if (id === activeSessionId) return;
              setActiveSession(id);
              toggleHistorySidebar(true);
            }}
            onNewChat={() => {
              setActiveSession(null);
              toggleHistorySidebar(true);
            }}
            loading={historyLoading}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
