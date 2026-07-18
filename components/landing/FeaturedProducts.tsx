"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import ProductCard from "@/components/shop/ProductCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import type { Product } from "@/lib/types";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({
  products,
}: FeaturedProductsProps): ReactElement {
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
          align="center"
          label="Hand-Picked For You"
          title="Featured Collection"
          subtitle="A tight edit of the pieces that define Lady Shelf now: decisive tailoring, soft power, and statement dressing with roots."
        />

        <motion.div
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          initial="hidden"
          variants={staggerContainer}
          whileInView="visible"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        <div className="flex justify-center">
          <Link
            className="flex min-h-11 items-center justify-center rounded-sm border border-gold px-6 py-3 font-dm-sans text-label uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-obsidian"
            href="/shop"
          >
            View All Products
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
