"use client";

import type { ReactElement } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { fadeInVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  variantImage?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  variantImage,
}: ProductImageGalleryProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const displayImages =
    images.length > 0 || variantImage
      ? [
          ...(variantImage ? [variantImage] : []),
          ...images.filter((image) => image !== variantImage),
        ]
      : [];

  if (displayImages.length === 0) {
    return (
      <div className="relative aspect-product overflow-hidden rounded-md bg-cream" />
    );
  }

  function handleMobileScroll(): void {
    const carousel = mobileCarouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);
    setActiveIndex(nextIndex);
  }

  function handleImageSelect(index: number): void {
    setActiveIndex(index);

    const carousel = mobileCarouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollTo({
      left: carousel.clientWidth * index,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="space-y-4">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto rounded-md bg-cream [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
        onScroll={handleMobileScroll}
        ref={mobileCarouselRef}
      >
        {displayImages.map((image, index) => (
          <div
            className="relative aspect-product w-full shrink-0 snap-center overflow-hidden"
            key={`${image}-${index}`}
          >
            <Image
              alt={`${productName} view ${index + 1}`}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="100vw"
              src={image}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 lg:hidden">
        {displayImages.map((image, index) => (
          <button
            aria-label={`Show image ${index + 1}`}
            className={cn(
              "h-2.5 rounded-full transition-all",
              activeIndex === index
                ? "w-8 bg-gold"
                : "w-2.5 bg-border-warm hover:bg-sand",
            )}
            key={`${image}-dot-${index}`}
            onClick={(): void => handleImageSelect(index)}
            type="button"
          />
        ))}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_88px]">
        <div className="relative overflow-hidden rounded-md bg-cream shadow-card">
          <div className="relative aspect-product">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate="visible"
                className="absolute inset-0"
                exit="hidden"
                initial="hidden"
                key={displayImages[activeIndex]}
                variants={
                  reducedMotion
                    ? {
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 },
                      }
                    : fadeInVariant
                }
              >
                <Image
                  alt={`${productName} view ${activeIndex + 1}`}
                  className="object-cover"
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  src={displayImages[activeIndex] ?? displayImages[0]}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {displayImages.map((image, index) => (
            <button
              aria-label={`Preview image ${index + 1}`}
              className={cn(
                "relative overflow-hidden rounded-md border bg-cream transition-colors",
                activeIndex === index
                  ? "border-gold ring-1 ring-gold"
                  : "border-border-warm hover:border-sand",
              )}
              key={`${image}-thumb-${index}`}
              onClick={(): void => setActiveIndex(index)}
              type="button"
            >
              <div className="relative aspect-product w-[88px]">
                <Image
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="88px"
                  src={image}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
