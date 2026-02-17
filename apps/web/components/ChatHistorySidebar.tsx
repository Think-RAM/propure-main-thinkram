"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MessageSquare, Plus, PanelLeft } from "lucide-react";
import type { Doc } from "@propure/convex/genereated";

interface ChatSidebarProps {
  open: boolean;
  sessions: Omit<Doc<"chatSessions">, "_id">[];
  activeSessionId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  toggle: () => void;
  loading: boolean;
}

export function ChatSidebar({
  open,
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
  toggle,
  loading,
}: ChatSidebarProps) {
  if (loading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-72",
          // Propure dark panel
          "bg-[#1a1f26]",
          "border-r border-white/10",
          "shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#242b33]">
          <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
        </div>
        <ScrollArea className="h-full px-2 py-3">
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg px-3 py-2">
                <div className="h-4 w-4 bg-white/10 rounded animate-pulse shrink-0" />
                <div className="h-4 flex-1 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    );
  }
  return (
    <>
      {/* Floating toggle */}
      {!open && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              className="
                fixed left-4 top-4 z-30
               bg-[#1a1f26]/90 backdrop-blur-md
               border border-white/10
                shadow-lg
                hover:bg-[#242b33]
              "
            >
              <PanelLeft className="h-4 w-4 text-[#1a9599]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open chats</TooltipContent>
        </Tooltip>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-72",
          // Surface (Propure)
          "bg-[#1a1f26]",
          // Border & separation
          "border-r border-white/10",
          // Motion
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#242b33]">
          <span className="text-sm font-semibold text-[#f7f9fc]">Chats</span>

          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onNewChat}
                  className="hover:bg-white/5"
                >
                  <Plus className="h-4 w-4 text-[#1a9599]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New chat</TooltipContent>
            </Tooltip>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              className="hover:bg-white/5"
            >
              <PanelLeft className="h-4 w-4 rotate-180 text-[#1a9599]" />
            </Button>
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="h-full px-2 py-3">
          <div className="space-y-1">
            {sessions.map((session) => {
              const active = session.sessionId === activeSessionId;

              return (
                <button
                  key={session.sessionId}
                  onClick={() => onSelect(session.sessionId)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                    "transition-colors",
                    active
                      ? "bg-[#0d7377]/20 border border-[#0d7377]/40"
                      : "hover:bg-white/5",
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-[#1a9599] shrink-0" />
                  <span className="truncate text-sm text-[#f7f9fc]">
                    {session.title || "Untitled chat"}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
