"use client";

import type { ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

import EmptyState from "@/components/shared/EmptyState";
import ProductCard from "@/components/shop/ProductCard";
import {
  staggerChildren,
  staggerContainer,
} from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  className?: string;
}

export default function ProductGrid({
  products,
  viewMode,
  className,
}: ProductGridProps): ReactElement {
  const prefersReducedMotion = useReducedMotion();

  if (products.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Showing 0 products
        </p>
        <EmptyState
          description="Try adjusting your filters."
          title="Nothing found"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <p className="font-dm-sans text-body-sm text-text-secondary">
        Showing {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      <motion.div
        animate="visible"
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-3"
            : "flex flex-col gap-4",
        )}
        initial="hidden"
        variants={prefersReducedMotion ? undefined : staggerContainer}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={prefersReducedMotion ? undefined : staggerChildren}
          >
            <ProductCard
              product={product}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
