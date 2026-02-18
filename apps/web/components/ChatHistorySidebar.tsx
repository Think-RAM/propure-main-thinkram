"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MessageSquare, Plus, PanelLeft, User } from "lucide-react";
import type { Doc } from "@propure/convex/genereated";
import UserProfileDialog from "./user-profile-dialog";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const { user, loaded } = useClerk();
  const router = useRouter();
  const [showUserProfile, setShowUserProfile] = useState(false);

  if (loading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-[40vw] min-w-[320px] max-w-[420px]",
          "bg-[#1a1f26]/95 backdrop-blur-xl border-r border-white/10",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-[-100%]"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#242b33]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d7377] to-[#095456] flex items-center justify-center font-serif font-bold text-lg text-white">P</div>
            <span className="font-serif text-xl font-semibold text-[#f7f9fc]">Propure</span>
          </div>
          <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
        </div>
        <ScrollArea className="h-full px-4 py-6">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg px-3 py-3 bg-[#242b33] animate-pulse">
                <div className="h-4 w-4 bg-gray-700 rounded" />
                <div className="h-4 flex-1 bg-gray-700 rounded" />
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
      {!open && !activeSessionId && (
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
              <PanelLeft className="h-5 w-5 text-[#0d7377]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open chats</TooltipContent>
        </Tooltip>
      )}

      {/* Sidebar */}
      {open && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-[40vw] min-w-[320px] max-w-[420px]",
            "bg-[#1a1f26]/95 backdrop-blur-xl border-r border-white/10",
            "transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-[-100%]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#242b33]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d7377] to-[#095456] flex items-center justify-center font-serif font-bold text-lg text-white">P</div>
              <span className="font-serif text-xl font-semibold text-[#f7f9fc]">Propure</span>
            </div>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onNewChat}
                    className="hover:bg-[#0d7377]/20"
                  >
                    <Plus className="h-5 w-5 text-[#0d7377]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New chat</TooltipContent>
              </Tooltip>

              {loaded && user ? (
                  <UserProfileDialog
                    user={{
                      name: user?.fullName || "Guest User",
                      email:
                        user?.emailAddresses[0]?.emailAddress ||
                        "guest@example.com",
                      avatar: user?.imageUrl || "/placeholder.svg",
                    }}
                    open={showUserProfile}
                    setOpen={setShowUserProfile}
                  />
                ) : (
                  <Button
                    className={cn(
                      "flex items-center gap-2 h-8 rounded-full px-3 text-white",
                      "bg-gradient-to-br from-[#0d7377] to-[#095456]",
                    )}
                    onClick={() => router.push("/sign-in")}
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                )}
            </div>
          </div>

          {/* Chat list */}
          <ScrollArea className="h-full px-4 py-6">
            <div className="space-y-2">
              {sessions.map((session) => {
                const active = session.sessionId === activeSessionId;
                return (
                  <button
                    key={session.sessionId}
                    onClick={() => onSelect(session.sessionId)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                      active
                        ? "bg-[#0d7377]/20 border border-[#0d7377] text-[#1a9599]"
                        : "bg-[#242b33] border border-white/10 hover:border-[#0d7377] hover:bg-[#0d7377]/10 text-[#f7f9fc]"
                    )}
                  >
                    <MessageSquare className="h-5 w-5 text-[#0d7377] shrink-0" />
                    <span className="truncate text-base font-medium">
                      {session.title || "Untitled chat"}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>
      )}
    </>
  );
}