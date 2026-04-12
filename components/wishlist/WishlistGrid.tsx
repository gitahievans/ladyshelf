"use client";

import type { ReactElement } from "react";
import { HeartOff } from "lucide-react";

import ProductGrid from "@/components/shop/ProductGrid";
import type { Product } from "@/lib/types";
import { useWishlistStore } from "@/stores/wishlistStore";

interface WishlistGridProps {
  products: Product[];
}

export default function WishlistGrid({
  products,
}: WishlistGridProps): ReactElement {
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {products.length > 0 ? (
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-warm px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-secondary transition-colors hover:border-gold hover:text-obsidian"
            onClick={clearWishlist}
            type="button"
          >
            <HeartOff className="size-4" />
            Clear Wishlist
          </button>
        ) : null}
      </div>
      <ProductGrid products={products} viewMode="grid" />
    </div>
  );
}
