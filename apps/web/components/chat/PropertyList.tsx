"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import {
  BedDouble,
  Bath,
  Car,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  DollarSign,
  Percent,
  Heart,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { ListingData, cn } from "@/lib/utils";
import { tr } from "zod/v4/locales";
import { toast } from "sonner";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import { useUserChats } from "@/context/ChatContext";

function formatWebsiteLabel(website: string) {
  try {
    return new URL(website).hostname
      .replace("www.", "")
      .split(".")[0]
      .toUpperCase();
  } catch {
    return website.toUpperCase();
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border",
        accent
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 text-gray-400",
      )}
    >
      <Icon size={14} />
      <span className="uppercase tracking-wider">{label}</span>
      <span className="ml-auto font-semibold text-white">{value}</span>
    </div>
  );
}

function ListingCard({
  listing,
  index,
  shortlisted,
  setShortlisted,
}: {
  chatSessionId: string;
  listing: ListingData;
  index: number;
  shortlisted: boolean;
  setShortlisted: (value: boolean) => void;
}) {
  const hero = listing.images?.[0];
  const source = formatWebsiteLabel(listing.website);

  return (
    <Card
      className="
      relative
      w-[340px]
      flex-shrink-0
      bg-[#1c2229]
      border-white/10
      text-white
      overflow-hidden
      transition-all
      duration-300
      hover:border-emerald-400/40
      hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]
      hover:-translate-y-1
      "
    >
      {/* IMAGE */}
      <div className="relative h-48 w-full">
        {hero ? (
          <Image src={hero} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No Image
          </div>
        )}

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <Badge className="absolute top-3 left-3 bg-black/70 text-emerald-400 border-emerald-400/40">
          {source}
        </Badge>

        <div className="absolute bottom-3 right-3 text-xs font-mono text-gray-400">
          #{String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* TITLE */}
        <div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {listing.title}
          </h3>

          <div className="flex gap-1 text-xs text-gray-400 mt-1">
            <MapPin size={13} className="text-emerald-400" />
            <span>
              {listing.address}
              {listing.suburb && `, ${listing.suburb}`}
              {listing.state && ` ${listing.state}`}
              {listing.postcode && ` ${listing.postcode}`}
            </span>
          </div>
        </div>

        {/* PRICE */}
        {listing.priceText && (
          <div className="border-l-2 border-emerald-400 pl-3">
            <div className="text-xs uppercase tracking-wider text-gray-400">
              Listed Price
            </div>

            <div className="text-lg font-semibold text-white">
              {listing.priceText}
            </div>
          </div>
        )}

        {/* PROPERTY META */}
        <div className="flex gap-2 flex-wrap text-xs">
          {listing.beds && (
            <Badge variant="outline" className="border-white/10 text-gray-300">
              <BedDouble size={14} /> {listing.beds}
            </Badge>
          )}

          {listing.baths && (
            <Badge variant="outline" className="border-white/10 text-gray-300">
              <Bath size={14} /> {listing.baths}
            </Badge>
          )}

          {listing.cars && (
            <Badge variant="outline" className="border-white/10 text-gray-300">
              <Car size={14} /> {listing.cars}
            </Badge>
          )}
        </div>

        {/* STATS */}
        <div className="flex flex-col gap-1">
          {listing.estimatedWeeklyRent && (
            <Stat
              icon={DollarSign}
              label="Rent"
              value={`$${listing.estimatedWeeklyRent}/wk`}
              accent
            />
          )}

          {listing.estimatedGrossYieldPct && (
            <Stat
              icon={Percent}
              label="Yield"
              value={`${listing.estimatedGrossYieldPct.toFixed(2)}%`}
              accent
            />
          )}

          {listing.listedAt && (
            <Stat
              icon={Calendar}
              label="Listed"
              value={formatDate(listing.listedAt)}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 pt-3 border-t border-white/10 mt-auto">
          <Button
            onClick={() => setShortlisted(true)}
            disabled={shortlisted}
            className={cn(
              "flex-1",
              shortlisted
                ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                : "bg-white/5 hover:bg-emerald-500/20 border border-white/10",
            )}
          >
            <Heart size={16} className={cn(shortlisted && "fill-black")} />
            {shortlisted ? "Shortlisted" : "Shortlist"}
          </Button>

          <Button
            asChild
            size="icon"
            variant="ghost"
            className="hover:text-emerald-400"
          >
            <a href={listing.url} target="_blank">
              <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PropertyList({ properties }: { properties: ListingData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const { activeSessionId } = useUserChats();
  // Track newly added IDs since last successful sync
  const pendingIdsRef = useRef<Set<string>>(new Set());

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSync = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const idsToSync = Array.from(pendingIdsRef.current);

      if (idsToSync.length === 0) return;

      try {
        await client.mutation(api.functions.chat.saveShortlistedProperties, {
          chatSessionId: activeSessionId ?? "temp-session-id",
          shortlistedPropertyIds: shortlisted, // send full latest state
        });

        // ✅ success → clear pending
        pendingIdsRef.current.clear();
        toast.success("Shortlisted properties updated");
      } catch (error) {
        console.error("Error shortlisting property:", error);

        // ❌ rollback ONLY newly added IDs
        setShortlisted((prev) =>
          prev.filter((id) => !pendingIdsRef.current.has(id)),
        );

        pendingIdsRef.current.clear();

        toast.error("Failed to shortlist property. Changes reverted.");
      }
    }, 3000);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "right" ? 380 : -380,
      behavior: "smooth",
    });
  };

  // enable horizontal mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;

    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section className="bg-[#242b33] pt-6 pb-4 w-full text-white h-[250px]">
      {/* HEADER */}
      <div className="px-8 mb-4 flex items-center gap-4">
        <h2 className="text-2xl font-bold text-[#0d7377] tracking-tight">
          PROPERTY FEED
        </h2>

        <Badge className="bg-[#095456]/10 text-[#0d7377] border-[#0d7377]/40 hover:bg-[#095456]/20 hover:text-[#0d7377] transition">
          {properties.length} Results
        </Badge>
      </div>

      {/* CAROUSEL */}
      <div className="relative group">
        {/* LEFT GRADIENT */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#242b33] to-transparent z-10" />

        {/* RIGHT GRADIENT */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#242b33] to-transparent z-10" />

        {/* LEFT BUTTON */}
        <Button
          size="icon"
          onClick={() => scroll("left")}
          className="
          absolute
          left-2
          top-1/2
          -translate-y-1/2
          z-20
          opacity-0
          group-hover:opacity-100
          transition
          bg-[#1e252c]/80
          backdrop-blur
          border border-white/10
          hover:border-[#0d7377]
          w-8 h-8
          "
        >
          <ChevronLeft size={16} />
        </Button>

        {/* RIGHT BUTTON */}
        <Button
          size="icon"
          onClick={() => scroll("right")}
          className="
          absolute
          right-8
          top-1/2
          -translate-y-1/2
          z-20
          opacity-0
          group-hover:opacity-100
          transition
          bg-[#1e252c]/80
          backdrop-blur
          border border-white/10
          hover:border-[#0d7377]
          w-8 h-8
          "
        >
          <ChevronRight size={16} />
        </Button>

        {/* SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="
          flex
          gap-6
          overflow-x-auto
          px-8
          pb-4
          scroll-smooth
          snap-x
          snap-mandatory
          no-scrollbar
          "
        >
          {properties.map((listing, i) => (
            <div key={i} className="snap-start">
              <ListingCard
                listing={listing}
                index={i}
                shortlisted={
                  listing.shortlisted ||
                  shortlisted.includes(listing.externalId!)
                }
                chatSessionId={activeSessionId ?? ""}
                setShortlisted={(value) => {
                  setShortlisted((prev) => {
                    let updated;

                    if (value) {
                      updated = [...prev, listing.externalId!];

                      // track newly added
                      pendingIdsRef.current.add(listing.externalId!);
                    } else {
                      updated = prev.filter((id) => id !== listing.externalId);

                      // if user removed before sync → don't send it
                      pendingIdsRef.current.delete(listing.externalId!);
                    }

                    return updated;
                  });

                  // trigger debounce
                  debouncedSync();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
