"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ImageOff } from "lucide-react";

import type { CollectionViewMode } from "@/components/collections/CollectionViewToggle";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/types";

interface CollectionCardProps {
  category: Category;
  isFeature: boolean;
  viewMode: CollectionViewMode;
}

export default function CollectionCard({
  category,
  isFeature,
  viewMode,
}: CollectionCardProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const isList = viewMode === "list";
  const pieceLabel = `${category.productCount} ${category.productCount === 1 ? "piece" : "pieces"}`;
  const hasImage = category.image.trim().length > 0;

  return (
    <motion.article whileHover={reducedMotion ? undefined : { y: -4 }}>
      <Link
        aria-label={`Explore ${category.name}, ${pieceLabel}`}
        className={cn(
          "group relative block overflow-hidden rounded-md bg-mahogany shadow-card outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory",
          isList
            ? "h-64 md:h-80"
            : isFeature
              ? "aspect-category md:aspect-auto md:h-96"
              : "aspect-category",
        )}
        href={`/shop?category=${category.slug}`}
      >
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
              sizes={
                isList
                  ? "(max-width: 768px) 100vw, 1280px"
                  : isFeature
                    ? "(max-width: 768px) 100vw, 1280px"
                    : "(max-width: 768px) 100vw, 50vw"
              }
              src={category.image}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-mahogany text-sand/60">
            <ImageOff aria-hidden="true" className="size-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/35 to-obsidian/5" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="font-dm-sans text-caption uppercase tracking-[0.18em] text-gold">
              {pieceLabel}
            </p>
            <h2 className="mt-2 font-cormorant text-h2 text-ivory md:text-h1">
              {category.name}
            </h2>
            {category.description ? (
              <p className="mt-2 line-clamp-2 max-w-xl font-dm-sans text-body-sm text-ivory/80 md:text-body">
                {category.description}
              </p>
            ) : null}
            <span className="mt-5 inline-flex items-center gap-2 font-dm-sans text-label uppercase tracking-[0.16em] text-ivory">
              Explore collection
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 text-gold transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
