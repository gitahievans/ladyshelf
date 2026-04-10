import type { ReactElement } from "react";

import BrandStory from "@/components/landing/BrandStory";
import CategoryGrid from "@/components/landing/CategoryGrid";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import HeroCarousel from "@/components/landing/HeroCarousel";
import LookbookStrip from "@/components/landing/LookbookStrip";
import NewArrivals from "@/components/landing/NewArrivals";
import Footer from "@/components/layout/Footer";
import { categories, featuredProducts, newArrivals } from "@/lib/mock";

export default function Home(): ReactElement {
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
