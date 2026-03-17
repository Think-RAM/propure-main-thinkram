import { ArrowLeft, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  count: number;
}

export default function Header({ count }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-950 bg-[#0f1419]/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-neutral-400 hover:text-white">
              <ArrowLeft size={18} />
              Dashboard
            </button>
          </Link>

          <h1 className="text-lg font-semibold">Your Shortlist</h1>

          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs">
            {count} Properties
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white text-black hover:bg-white/90">
            <Download size={14} /> Export PDF
          </Button>
          <Button variant="outline" size="sm" className="bg-white text-black hover:bg-white/90">
            <Share2 size={14} /> Share ShortList
          </Button>
        </div>
      </div>
    </header>
  );
}