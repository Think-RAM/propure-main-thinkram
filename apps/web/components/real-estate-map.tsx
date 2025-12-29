"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Search, SlidersHorizontal, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GoogleMap } from "./google-map";
import { cn } from "../lib/utils";
import SearchResultsSidebar from "./SearchResultsSidebar";
import FiltersPanel from "./FiltersPanel";
import { CityFilterPills } from "./SuburbFilter";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useClerk, UserProfile } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import UserProfileDialog from "./user-profile-dialog";

export default function DashboardPage() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isSignedIn, user, loaded } = useClerk();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length > 0 && !isSearchActive) {
      setIsSearchActive(true);
    }
  };

  const handleInputFocus = () => {
    if (searchValue.length > 0 && !isSearchActive) {
      setIsSearchActive(true);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Google Map Background */}
      <GoogleMap
        className="absolute inset-0 w-full h-full"
        isBlurred={!isSearchActive}
      />

      {!isSearchActive && (
        <div className=" absolute z-50 top-4 right-4">
          <UserProfileDialog
            user={{
              name: user?.fullName || "Guest User",
              email: user?.emailAddresses[0]?.emailAddress || "guest@example.com",
              avatar: user?.imageUrl || "/placeholder.svg",
            }}
            open={showUserProfile && !isSearchActive}
            setOpen={setShowUserProfile}
          />
        </div>
      )}

      {/* Search Header - appears when search is active */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 border-cyan-200/50 transition-all duration-500 ${
          isSearchActive ? "translate-y-0" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col p-4 max-w-4xl mx-auto">
          {/* Shared white rounded background */}
          <div className="relative flex flex-col gap-2 bg-white/90 backdrop-blur-sm border-2 border-cyan-300 focus-within:border-cyan-500 rounded-2xl px-4 py-3">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-600 h-4 w-4" />
              <Input
                ref={inputRef}
                value={searchValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Search for properties, neighborhoods, or cities..."
                className="pl-8 pr-12 py-2 text-base border-none shadow-none bg-transparent text-gray-800 placeholder:text-cyan-600/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2 cursor-pointer">
                <SlidersHorizontal
                  className="h-4 w-4 text-cyan-600"
                  onClick={() => setShowFilters((prev) => !prev)}
                />
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {loaded && user ? (
                  <UserProfileDialog
                    user={{
                      name: user?.fullName || "Guest User",
                      email:
                        user?.emailAddresses[0]?.emailAddress ||
                        "guest@example.com",
                      avatar: user?.imageUrl || "/placeholder.svg",
                    }}
                    open={showUserProfile && isSearchActive}
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

            {/* City Filter Pills Inside White Box */}
            <CityFilterPills
              selected={selectedCity}
              onSelect={(key) => setSelectedCity(key)}
            />
          </div>
        </div>
      </div>

      {/* Hero Section - centered initially */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-700 ${
          isSearchActive ? "opacity-0 pointer-events-none" : "opacity-100"
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
            <Input
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search for properties, neighborhoods, or cities..."
              className="pl-12 pr-16 py-4 text-lg border-2 border-cyan-300/50 bg-white/80 backdrop-blur-md text-gray-800 placeholder:text-cyan-700/80 focus:border-cyan-400 focus:bg-white/90 rounded-full shadow-xl"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 me-4 text-teal-500" />
            </div>
          </div>

          <p className="text-cyan-100 text-lg mt-6 drop-shadow-lg">
            Discover high-yield properties and emerging markets with our
            AI-powered analytics
          </p>
        </div>
      </div>

      {/* Results Panel - appears when search is active */}
      <SearchResultsSidebar
        isSearchActive={isSearchActive}
        searchValue={searchValue}
        setIsSearchActive={setIsSearchActive}
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
