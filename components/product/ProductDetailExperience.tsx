"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import type { Product, ProductVariant } from "@/lib/types";

interface ProductDetailExperienceProps {
  categoryName: string;
  product: Product;
}

export default function ProductDetailExperience({
  categoryName,
  product,
}: ProductDetailExperienceProps): ReactElement {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const selectedColorImage =
    product.variants.find(
      (variant) => variant.color === selectedVariant?.color && variant.imageUrl,
    )?.imageUrl ?? selectedVariant?.imageUrl;

  return (
    <div className="mx-auto grid max-w-container gap-8 lg:grid-cols-5 lg:gap-10">
      <div className="lg:col-span-3">
        <ProductImageGallery
          key={selectedColorImage ?? "product-gallery"}
          images={product.images}
          productName={product.name}
          variantImage={selectedColorImage}
        />
      </div>

      <div className="lg:col-span-2">
        <ProductInfo
          categoryName={categoryName}
          onVariantChange={setSelectedVariant}
          product={product}
        />
      </div>
    </div>
  );
}
