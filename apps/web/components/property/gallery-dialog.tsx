"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
}

export function GalleryDialog({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
}: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      {/* Overlay */}
      <DialogOverlay className="bg-transparent backdrop-blur-md" />

      <DialogContent
        className="
          p-0 border-none shadow-none
          bg-transparent
          max-w-none
          flex items-center justify-center
        "
      >
        {/* ✅ Accessibility */}
        <DialogTitle className="sr-only">
          Property image gallery
        </DialogTitle>

        {/* Floating Container */}
        <div className="relative w-[90vw] max-w-6xl h-[85vh] flex flex-col">
          
          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute -top-12 right-0 text-white hover:opacity-70"
          >
            <X size={28} />
          </button>

          {/* 🔥 FIXED IMAGE CONTAINER */}
          <div className="relative flex-1 w-full rounded-xl overflow-hidden">
            
            {/* Important: parent has height now */}
            <Image
              src={images[index].url}
              alt={images[index].alt}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain"
              priority
            />

            {/* Left */}
            <button
              onClick={prev}
              className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full text-white hover:bg-black/80"
            >
              <ChevronLeft />
            </button>

            {/* Right */}
            <button
              onClick={next}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full text-white hover:bg-black/80"
            >
              <ChevronRight />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 right-4 text-white text-sm bg-black/60 px-3 py-1 rounded">
              {index + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => setIndex(i)}
                className={`relative w-24 h-16 rounded-md overflow-hidden cursor-pointer border transition ${
                  i === index
                    ? "border-white"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}