"use client";
import { ArrowLeft, Share2, Bookmark, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onBack?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onShortlist?: () => void;
}

export function Header({ onBack, onShare, onSave, onShortlist }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#0f1419]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0f1419]/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="border-zinc-700 text-black hover:text-black hover:border-zinc-500 hover:bg-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="border-zinc-700 text-black hover:text-black hover:border-zinc-500 hover:bg-white"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save
          </Button>

          <Button
            size="sm"
            onClick={onShortlist}
            className="bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Add to Shortlist
          </Button>
        </div>
      </div>
    </header>
  );
}
