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
import { ChatSession } from "@prisma/client";

interface ChatSidebarProps {
  open: boolean;
  sessions: ChatSession[];
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
          "bg-white/85 backdrop-blur-xl",
          "border-r border-cyan-200/50",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-200/40">
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
        </div>
        <ScrollArea className="h-full px-2 py-3">
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg px-3 py-2">
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse shrink-0" />
                <div className="h-4 flex-1 bg-gray-300 rounded animate-pulse" />
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
                bg-white/80 backdrop-blur-md
                border border-cyan-200/50
                shadow-lg
                hover:bg-white
              "
            >
              <PanelLeft className="h-4 w-4 text-cyan-700" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open chats</TooltipContent>
        </Tooltip>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-72",
          // Surface
          "bg-white/85 backdrop-blur-xl",
          // Border & separation
          "border-r border-cyan-200/50",
          // Motion
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-200/40">
          <span className="text-sm font-semibold text-gray-800">
            Chats
          </span>

          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onNewChat}
                  className="hover:bg-cyan-100/60"
                >
                  <Plus className="h-4 w-4 text-cyan-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New chat</TooltipContent>
            </Tooltip>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              className="hover:bg-cyan-100/60"
            >
              <PanelLeft className="h-4 w-4 rotate-180 text-cyan-700" />
            </Button>
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="h-full px-2 py-3">
          <div className="space-y-1">
            {sessions.map((session) => {
              const active = session.id === activeSessionId;

              return (
                <button
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                    "transition-colors",
                    active
                      ? "bg-cyan-100/70"
                      : "hover:bg-cyan-50"
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-cyan-600 shrink-0" />
                  <span className="truncate text-sm text-gray-800">
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
