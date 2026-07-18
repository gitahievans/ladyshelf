import type { ReactElement } from "react";
import { notFound } from "next/navigation";

import Footer from "@/components/layout/Footer";
import ProductDetailExperience from "@/components/product/ProductDetailExperience";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  fetchCatalogCategories,
  fetchCatalogProductBySlug,
  fetchCatalogProducts,
} from "@/lib/api/catalog";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    fetchCatalogProductBySlug(slug),
    fetchCatalogCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await fetchCatalogProducts({
    category: product.categorySlug,
  }))
    .filter((relatedProduct) => relatedProduct.id !== product.id)
    .slice(0, 4);
  const categoryName =
    categories.find((category) => category.slug === product.categorySlug)?.name ??
    "Collection";

  return (
    <>
      <section className="bg-ivory px-6 py-8 lg:px-8 lg:py-12">
        <ProductDetailExperience categoryName={categoryName} product={product} />
      </section>

      <RelatedProducts products={relatedProducts} />
      <Footer />
    </>
  );
}
