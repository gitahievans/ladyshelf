"use client";

import type { ReactElement } from "react";
import { motion } from "framer-motion";

import ProductCard from "@/components/shop/ProductCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import type { Product } from "@/lib/types";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({
  products,
}: NewArrivalsProps): ReactElement {
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
          label="Just Landed"
          title="New Arrivals"
          subtitle="Fresh drops for the woman whose wardrobe keeps pace with her momentum."
        />

        <motion.div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden"
          initial="hidden"
          variants={staggerContainer}
          whileInView="visible"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[78%] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>

        <motion.div
          className="hidden grid-cols-4 gap-5 lg:grid"
          initial="hidden"
          variants={staggerContainer}
          whileInView="visible"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
