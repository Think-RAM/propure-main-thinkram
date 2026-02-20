"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { SendHorizonalIcon, SlidersHorizontal, User } from "lucide-react";
import { cn } from "../lib/utils";
import FiltersPanel from "./FiltersPanel";
import { CityFilterPills } from "./SuburbFilter";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import UserProfileDialog from "./user-profile-dialog";
import { Textarea } from "./ui/textarea";
import { ChatSidebar } from "./ChatSideBar";
import { useUserChats } from "@/context/ChatContext";
import { LeafletMap } from "./maps/LeafletMap";
import { FloatingNotificationInbox } from "./notification/NotificationBell";

const MAX_HEIGHT = 180; // px ~ ChatGPT clamp

interface DashboardPageProps {
  closeSidebar: () => void;
}

export default function DashboardPage({ closeSidebar }: DashboardPageProps) {
  const [isChatActive, setIsChatActive] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");
  const router = useRouter();
  const { user, loaded } = useClerk();
  const {
    activeSessionId,
    activeChatMessages,
    chatsLoading,
    createNewChatSession,
    toggleHistorySidebar,
  } = useUserChats();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleSubmit = () => {
    if (searchValue && searchValue.length > 0 && !isChatActive) {
      closeSidebar();
      createNewChatSession(searchValue);
      setIsChatActive(true);
    }
  };

  useEffect(() => {
    setIsChatActive(!!activeSessionId);
  }, [activeSessionId]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0f1419] text-[#f7f9fc]">
      {/* Layout wrapper:
          - when chat inactive => map takes full width
          - when chat active   => map 60%, chat 40% */}
      <div
        className={cn(
          "h-full w-full",
          isChatActive ? "flex flex-row" : "relative",
        )}
      >
        {/* CHAT REGION (only in split mode) */}
        {isChatActive && (
          <div className="relative h-full basis-[30%] min-w-0 border-l border-white/10">
            <ChatSidebar
              open={isChatActive}
              send={searchValue ?? undefined}
              initialMessages={activeChatMessages}
              activeSessionId={activeSessionId ?? undefined}
              isLoading={chatsLoading}
              className="h-full"
              onBackToHistory={() => toggleHistorySidebar()}
            />
          </div>
        )}
        {/* MAP REGION */}
        <div
          className={cn(
            isChatActive
              ? "relative h-full basis-[70%] min-w-0"
              : "absolute inset-0",
          )}
        >
          <LeafletMap
            className="absolute inset-0 w-full h-full"
            isBlurred={!isChatActive}
          />
        </div>
      </div>

      <FloatingNotificationInbox align="bottom-right" />

      {/* Search Header - appears when search is active */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 border-white/10 transition-all duration-500 ${
          isChatActive ? "translate-y-0" : "-translate-y-full opacity-0"
        }`}
      >
        <div
          className={cn(
            "flex flex-col p-4",
            // center within the available container
            "mx-auto w-full",
            // when chat is active, keep it narrower so it never reaches the chat seam
            isChatActive ? "max-w-2xl" : "max-w-4xl",
          )}
        >
          {/* Shared dark rounded background (Propure) */}
          <div
            className={cn(
              "relative flex flex-col gap-2 rounded-2xl px-4 py-3",
              "bg-[#242b33]/95 backdrop-blur-md",
              "border border-white/10",
              "shadow-xl",
            )}
          >
            {/* City Filter Pills */}
            <div
              className={cn(
                "relative w-full",
                // reserve space for the two absolute right-side controls
                "pr-20",
              )}
            >
              {/* City Filter Pills Inside White Box */}
              <CityFilterPills
                selected={selectedCity}
                onSelect={(key) => setSelectedCity(key)}
              />
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer">
                <SlidersHorizontal
                  className="h-4 w-4 text-[#1a9599]"
                  onClick={() => setShowFilters((prev) => !prev)}
                />
              </div>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                {loaded && user ? (
                  <UserProfileDialog
                    user={{
                      name: user?.fullName || "Guest User",
                      email:
                        user?.emailAddresses[0]?.emailAddress ||
                        "guest@example.com",
                      avatar: user?.imageUrl || "/placeholder.svg",
                    }}
                    open={showUserProfile && isChatActive}
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
          </div>
        </div>
      </div>

      {/* Hero Section - centered initially */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-700 ${
          isChatActive
            ? "opacity-0 pointer-events-none"
            : "opacity-100 backdrop-blur-[10px] backdrop-saturate-10 bg-black/10"
        }`}
      >
        <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-[#f7f9fc] mb-8 drop-shadow-2xl">
            Find the best investment for your{" "}
            <span className="bg-gradient-to-r from-[#1a9599] to-[#d4af37] bg-clip-text text-transparent">
              real estate portfolio
            </span>
          </h1>

          <div className="relative max-w-lg mx-auto">
            <Textarea
              value={searchValue ?? ""}
              placeholder="Ask about properties, locations, pricing, or investment insights…"
              rows={1}
              onChange={(e) => {
                handleInputChange(e as any);

                // Auto-grow with clamp (ChatGPT-style)
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${Math.min(
                  e.currentTarget.scrollHeight,
                  MAX_HEIGHT,
                )}px`;
              }}
              onKeyDown={(e) => {
                // Enter → submit
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!searchValue?.trim()) return;
                  handleSubmit();
                }

                // Shift+Enter → newline (default behavior)
              }}
              className={cn(
                "resize-none overflow-y-auto",
                "min-h-[56px]",
                "pl-4 pr-14 py-4",
                "text-lg leading-relaxed",
                "rounded-2xl",
                "border border-white/10",
                "bg-[#1a1f26]/90 backdrop-blur-md",
                "text-[#f7f9fc] placeholder:text-white/40",
                "focus:border-[#0d7377] focus:bg-[#1a1f26] focus-visible:ring-0",
              )}
            />

            {/* Send button */}
            <button
              disabled={!searchValue?.trim()}
              onClick={() => handleSubmit()}
              className={cn(
                "absolute bottom-2 right-2",
                "flex h-9 w-9 items-center justify-center rounded-full",
                "transition-all",
                searchValue?.trim()
                  ? "bg-gradient-to-br from-[#0d7377] to-[#095456] text-white shadow-md hover:brightness-110"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              )}
            >
              <SendHorizonalIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="text-cyan-100 text-lg mt-6 drop-shadow-lg">
            Discover high-yield properties and emerging markets with our
            AI-powered analytics
          </p>
        </div>
      </div>

      {/* Results Panel - appears when search is active */}
      {/* <ChatSidebar
        open={isChatActive}
        send={searchValue ?? undefined}
        initialMessages={activeChatMessages}
        activeSessionId={activeSessionId ?? undefined}
        isLoading={chatsLoading}
      /> */}

      <div
        className={`absolute right-6 top-20 bottom-6 w-80 transition-all duration-500 ${
          showFilters
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <FiltersPanel />
      </div>
    </div>
  );
}
