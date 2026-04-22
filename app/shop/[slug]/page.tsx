import type { ReactElement } from "react";
import { notFound } from "next/navigation";

import Footer from "@/components/layout/Footer";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
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
        <div className="mx-auto grid max-w-container gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-3">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          <div className="lg:col-span-2">
            <ProductInfo categoryName={categoryName} product={product} />
          </div>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} />
      <Footer />
    </>
  );
}
