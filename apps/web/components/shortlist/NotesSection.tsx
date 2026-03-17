"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function NotesSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-neutral-950 pt-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 text-sm text-neutral-400"
      >
        <ChevronRight
          size={14}
          className={open ? "rotate-90 transition" : "transition"}
        />
        Notes
      </button>

      {open && (
        <Textarea
          className="mt-2 bg-[#1b212e] border-neutral-950"
          placeholder="Add notes..."
        />
      )}
    </div>
  );
}