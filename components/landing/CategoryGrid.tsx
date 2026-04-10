"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import SectionHeader from "@/components/shared/SectionHeader";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({
  categories,
}: CategoryGridProps): ReactElement {
  return (
    <motion.section
      className="px-6 py-16 md:px-8 md:py-24"
      initial="hidden"
      variants={fadeUpVariant}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="visible"
    >
      <div className="mx-auto max-w-container space-y-8">
        <SectionHeader
          label="Shop by Category"
          title="Every Look, Every Occasion"
          subtitle="From tailored confidence to celebration pieces rooted in heritage, every category is curated for the way she actually lives."
        />

        <motion.div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden"
          initial="hidden"
          variants={staggerContainer}
          whileInView="visible"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="min-w-[78%] snap-start"
              variants={fadeUpVariant}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="hidden grid-cols-5 gap-5 lg:grid"
          initial="hidden"
          variants={staggerContainer}
          whileInView="visible"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeUpVariant}>
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps): ReactElement {
  return (
    <Link
      className="group block overflow-hidden rounded-md border border-border-warm bg-cream"
      href={`/shop?category=${category.slug}`}
    >
      <div className="relative aspect-category overflow-hidden">
        <Image
          alt={category.name}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes="(max-width: 1024px) 78vw, 20vw"
          src={category.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent transition-colors duration-300 group-hover:from-obsidian/90" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          <div>
            <h3 className="font-cormorant text-h4 text-ivory">{category.name}</h3>
            <p className="mt-1 font-dm-sans text-caption text-ivory/70">
              {category.productCount} pieces
            </p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 bg-obsidian/20 text-gold">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
