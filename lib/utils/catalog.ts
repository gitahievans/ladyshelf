import type { Product } from "@/lib/types";

export interface CatalogColorOption {
  hex: string;
  name: string;
}

export function getCatalogColors(products: Product[]): CatalogColorOption[] {
  const seen = new Map<string, CatalogColorOption>();

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      if (!seen.has(variant.color)) {
        seen.set(variant.color, {
          hex: variant.colorHex,
          name: variant.color,
        });
      }
    });
  });

  return [...seen.values()].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}
