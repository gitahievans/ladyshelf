import type { ReactElement } from "react";

import BrandStory from "@/components/landing/BrandStory";
import CategoryGrid from "@/components/landing/CategoryGrid";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import HeroCarousel from "@/components/landing/HeroCarousel";
import LookbookStrip from "@/components/landing/LookbookStrip";
import NewArrivals from "@/components/landing/NewArrivals";
import Footer from "@/components/layout/Footer";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";

export default async function Home(): Promise<ReactElement> {
  const { categories, products } = await fetchCatalogSnapshot();
  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 8);
  const newArrivals = products
    .filter((product) => product.isNewArrival)
    .slice(0, 8);

  return (
    <>
      <HeroCarousel />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <BrandStory />
      <NewArrivals products={newArrivals.slice(0, 8)} />
      <LookbookStrip />
      <Footer />
    </>
  );
}
