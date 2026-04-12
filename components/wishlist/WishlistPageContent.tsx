"use client";

import type { ReactElement } from "react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import { allProducts } from "@/lib/mock";
import { useWishlistStore } from "@/stores/wishlistStore";

import WishlistGrid from "./WishlistGrid";
import WishlistHeader from "./WishlistHeader";

export default function WishlistPageContent(): ReactElement {
  const productIds = useWishlistStore((state) => state.productIds);
  const products = productIds
    .map((productId) => allProducts.find((product) => product.id === productId))
    .filter((product) => product !== undefined);

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-8">
          <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
            <Link className="transition-colors hover:text-obsidian" href="/">
              Home
            </Link>
            <span>/</span>
            <span className="text-obsidian">Wishlist</span>
          </nav>

          <WishlistHeader count={products.length} />

          {products.length > 0 ? (
            <WishlistGrid products={products} />
          ) : (
            <EmptyState
              ctaHref="/shop"
              ctaLabel="Browse the Collection"
              description="Save your favourite looks from the collection and they will wait for you here."
              title="No pieces saved yet"
            />
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
