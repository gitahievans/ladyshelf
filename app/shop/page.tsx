"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Footer from "@/components/layout/Footer";
import FilterBottomSheet from "@/components/shop/FilterBottomSheet";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductGrid from "@/components/shop/ProductGrid";
import SortDropdown from "@/components/shop/SortDropdown";
import ViewToggle from "@/components/shop/ViewToggle";
import { allProducts, categories, getAllColors } from "@/lib/mock";
import { getFilteredProducts } from "@/lib/utils/filter";
import { useUIStore } from "@/stores/uiStore";

const defaultPriceRange: [number, number] = [1800, 12500];

export default function ShopPage(): ReactElement {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const sortBy = useUIStore((state) => state.sortBy);
  const viewMode = useUIStore((state) => state.viewMode);
  const filters = useUIStore((state) => state.filters);
  const setCategory = useUIStore((state) => state.setCategory);

  useEffect((): void => {
    const matchingCategory = categories.find(
      (category) => category.slug === categoryParam,
    );

    setCategory(matchingCategory?.slug ?? "all");
  }, [categoryParam, setCategory]);

  const colorOptions = useMemo(() => getAllColors(), []);

  const filteredProducts = useMemo(
    () => getFilteredProducts(allProducts, selectedCategory, sortBy, filters),
    [filters, selectedCategory, sortBy],
  );

  const activeFilterCount = useMemo((): number => {
    let count = 0;

    if (selectedCategory !== "all") {
      count += 1;
    }

    count += filters.sizes.length;
    count += filters.colors.length;
    count += filters.badges.length;

    if (filters.inStockOnly) {
      count += 1;
    }

    if (
      filters.priceRange[0] !== defaultPriceRange[0] ||
      filters.priceRange[1] !== defaultPriceRange[1]
    ) {
      count += 1;
    }

    return count;
  }, [filters, selectedCategory]);

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-10">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <span className="text-obsidian">Shop</span>
            </nav>
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Curated for every chapter
              </p>
              <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
                The Collection
              </h1>
              <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
                Every look, every occasion.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:hidden">
            <FilterBottomSheet
              activeFilterCount={activeFilterCount}
              categories={categories}
              colors={colorOptions}
            />
            <SortDropdown className="flex-1" />
            <ViewToggle />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-4">
            <FilterSidebar categories={categories} colors={colorOptions} />

            <div className="space-y-6 lg:col-span-3">
              <div className="hidden items-center justify-between gap-4 lg:flex">
                <div className="font-dm-sans text-body-sm text-text-secondary">
                  {selectedCategory === "all"
                    ? "All categories"
                    : categories.find((category) => category.slug === selectedCategory)?.name}
                </div>
                <div className="flex items-center gap-3">
                  <SortDropdown />
                  <ViewToggle />
                </div>
              </div>

              <ProductGrid products={filteredProducts} viewMode={viewMode} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
