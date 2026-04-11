import type { ReactElement } from "react";

import ProductCard from "@/components/shop/ProductCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { allProducts } from "@/lib/mock";
import type { Product } from "@/lib/types";

interface RelatedProductsProps {
  currentProduct: Product;
}

export default function RelatedProducts({
  currentProduct,
}: RelatedProductsProps): ReactElement | null {
  const relatedProducts = allProducts
    .filter(
      (product) =>
        product.categorySlug === currentProduct.categorySlug &&
        product.id !== currentProduct.id,
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-6 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-container space-y-8">
        <SectionHeader title="You May Also Like" />

        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
          {relatedProducts.map((product) => (
            <div
              className="min-w-[80%] snap-start sm:min-w-[48%] lg:min-w-0"
              key={product.id}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
