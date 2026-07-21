"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ImageOff } from "lucide-react";

import type { Category } from "@/lib/types";

interface CollectionListItemProps {
  category: Category;
}

export default function CollectionListItem({
  category,
}: CollectionListItemProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const pieceLabel = `${category.productCount} ${category.productCount === 1 ? "piece" : "pieces"}`;
  const hasImage = category.image.trim().length > 0;
  const description = category.description.trim();

  return (
    <motion.article whileHover={reducedMotion ? undefined : { y: -3 }}>
      <Link
        aria-label={`Explore ${category.name}, ${pieceLabel}`}
        className="group flex min-h-40 overflow-hidden rounded-md border border-border-warm bg-cream shadow-card outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory md:min-h-52"
        href={`/shop?category=${category.slug}`}
      >
        <div className="relative w-28 shrink-0 overflow-hidden bg-mahogany sm:w-40 md:w-64 lg:w-80">
          {hasImage ? (
            <motion.div
              className="absolute inset-0"
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reducedMotion ? undefined : { scale: 1.035 }}
            >
              <Image
                alt={`${category.name} collection`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 160px, (max-width: 1024px) 256px, 320px"
                src={category.image}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sand/60">
              <ImageOff aria-hidden="true" className="size-8 md:size-10" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5 md:flex-row md:items-center md:gap-8 md:p-8">
          <div className="min-w-0 max-w-2xl">
            <p className="font-dm-sans text-caption uppercase tracking-[0.18em] text-bark">
              {pieceLabel}
            </p>
            <h2 className="mt-1 font-cormorant text-h4 text-obsidian sm:text-h3 md:mt-2 md:text-h2">
              {category.name}
            </h2>
            {description ? (
              <p className="mt-1 line-clamp-2 font-dm-sans text-caption text-text-secondary sm:text-body-sm md:mt-3 md:line-clamp-3 md:text-body">
                {description}
              </p>
            ) : null}
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 font-dm-sans text-caption font-medium uppercase tracking-[0.12em] text-obsidian md:text-label md:tracking-[0.16em]">
            Explore collection
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 text-bark transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
