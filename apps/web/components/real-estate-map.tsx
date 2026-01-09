"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  SendHorizonalIcon,
  SlidersHorizontal,
  User,
} from "lucide-react";
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
  const { activeSessionId, activeChatMessages, chatsLoading, createNewChatSession } = useUserChats();

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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Leaflet Map Background */}
      <LeafletMap
        className="absolute inset-0 w-full h-full"
        isBlurred={!isChatActive}
      />

      {!isChatActive && (
        <div className=" absolute z-50 top-4 right-4">
          <UserProfileDialog
            user={{
              name: user?.fullName || "Guest User",
              email:
                user?.emailAddresses[0]?.emailAddress || "guest@example.com",
              avatar: user?.imageUrl || "/placeholder.svg",
            }}
            open={showUserProfile && !isChatActive}
            setOpen={setShowUserProfile}
          />
        </div>
      )}

      {/* Search Header - appears when search is active */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 border-cyan-200/50 transition-all duration-500 ${
          isChatActive ? "translate-y-0" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col p-4 max-w-4xl mx-auto">
          {/* Shared white rounded background */}
          <div className="relative flex flex-col gap-2 bg-white/90 backdrop-blur-sm border-2 border-cyan-300 focus-within:border-cyan-500 rounded-2xl px-4 py-3">
            {/* Search Input */}
            <div className="relative w-full">
              {/* City Filter Pills Inside White Box */}
              <CityFilterPills
                selected={selectedCity}
                onSelect={(key) => setSelectedCity(key)}
              />
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer">
                <SlidersHorizontal
                  className="h-4 w-4 text-cyan-600"
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
                    className="bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center gap-2 h-8 rounded-full px-3"
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
          isChatActive ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-2xl">
            Find the best investment for your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
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
                  MAX_HEIGHT
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
                "border-2 border-cyan-300/50",
                "bg-white/80 backdrop-blur-md",
                "text-gray-800 placeholder:text-cyan-700/80",
                "focus:border-cyan-400 focus:bg-white/90 focus-visible:ring-0",
                "shadow-xl"
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
                  ? "bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-md hover:from-cyan-500 hover:to-teal-600"
                  : "bg-cyan-200/60 text-cyan-500 cursor-not-allowed"
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
      <ChatSidebar 
        open={isChatActive}
        send={searchValue ?? undefined}
        initialMessages={activeChatMessages}
        activeSessionId={activeSessionId ?? undefined} 
        isLoading={chatsLoading}
      />

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
