"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryDialog } from "./gallery-dialog";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface HeroGalleryProps {
  images: GalleryImage[];
  badge?: string;
}

export function HeroGallery({ images, badge }: HeroGalleryProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images?.length) return null;

  const mainImage = images[0];
  const thumbnails = images.slice(1, 5);

  const openGallery = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
          
          {/* Main Image */}
          <div
            onClick={() => openGallery(0)}
            className="relative h-[360px] lg:h-[520px] rounded-2xl overflow-hidden cursor-pointer group"
          >
            <Image
              src={mainImage.url}
              alt={mainImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              priority
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Badge */}
            {badge && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-black text-xs px-3 py-1 rounded-md font-medium">
                {badge}
              </span>
            )}

            {/* Counter */}
            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-md">
              1 / {images.length}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-3">
            {thumbnails.map((img, i) => {
              const isLast = i === 3 && images.length > 5;

              return (
                <div
                  key={img.id}
                  onClick={() => openGallery(i + 1)}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />

                  {isLast && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium">
                      +{images.length - 5} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <GalleryDialog
        images={images}
        open={open}
        onOpenChange={setOpen}
        initialIndex={activeIndex}
      />
    </>
  );
}