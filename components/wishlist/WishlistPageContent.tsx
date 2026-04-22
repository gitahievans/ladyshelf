"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { fetchCatalogProducts } from "@/lib/api/catalog";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";

import WishlistGrid from "./WishlistGrid";
import WishlistHeader from "./WishlistHeader";

export default function WishlistPageContent(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoaded = useWishlistStore((state) => state.isLoaded);
  const productIds = useWishlistStore((state) => state.productIds);
  const syncWishlist = useWishlistStore((state) => state.syncWishlist);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    void fetchCatalogProducts().then((products) => {
      if (!isMounted) {
        return;
      }

      setCatalogProducts(products);
      setIsLoadingCatalog(false);
    }).catch(() => {
      if (!isMounted) {
        return;
      }

      setCatalogProducts([]);
      setIsLoadingCatalog(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    void syncWishlist();
  }, [isAuthenticated, isInitialized, syncWishlist]);

  const products = useMemo(
    () =>
      productIds
        .map((productId) =>
          catalogProducts.find((product) => product.id === productId),
        )
        .filter((product): product is Product => product !== undefined),
    [catalogProducts, productIds],
  );

  if (!isInitialized || (isAuthenticated && !isLoaded) || isLoadingCatalog) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

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
              title={isAuthenticated ? "No saved pieces yet" : "No pieces saved yet"}
            />
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
