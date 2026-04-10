"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { fadeUpVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";

const lookbookImages = [
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    alt: "Editorial fashion portrait one",
    widthClass: "w-[220px] md:w-[280px]",
  },
  {
    src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
    alt: "Editorial fashion portrait two",
    widthClass: "w-[200px] md:w-[250px]",
  },
  {
    src: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
    alt: "Editorial fashion portrait three",
    widthClass: "w-[240px] md:w-[320px]",
  },
  {
    src: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80",
    alt: "Editorial fashion portrait four",
    widthClass: "w-[210px] md:w-[270px]",
  },
  {
    src: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80",
    alt: "Editorial fashion portrait five",
    widthClass: "w-[230px] md:w-[300px]",
  },
  {
    src: "https://images.unsplash.com/photo-1544441452-d1cbe79fe5a7?w=600&q=80",
    alt: "Editorial fashion portrait six",
    widthClass: "w-[200px] md:w-[260px]",
  },
];

export default function LookbookStrip(): ReactElement {
  return (
    <motion.section
      className="overflow-hidden bg-obsidian py-16 md:py-24"
      initial="hidden"
      variants={fadeUpVariant}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="visible"
    >
      <div className="mx-auto flex max-w-container flex-col gap-8 px-0">
        <div className="px-6 md:px-8">
          <p className="font-dm-sans text-label uppercase tracking-[0.2em] text-gold">
            Lookbook
          </p>
          <h2 className="mt-3 max-w-2xl font-cormorant text-h2 text-ivory md:text-h1">
            Stay for the atmosphere. Leave with a new idea of yourself.
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-max items-stretch">
            {lookbookImages.map((image) => (
              <div
                key={image.src}
                className={cn(
                  "group relative h-[280px] shrink-0 overflow-hidden md:h-[400px]",
                  image.widthClass,
                )}
              >
                <Image
                  alt={image.alt}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  fill
                  sizes="(max-width: 768px) 220px, 300px"
                  src={image.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gold/18 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
