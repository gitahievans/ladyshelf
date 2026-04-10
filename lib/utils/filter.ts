import type {
  CategorySlug,
  FilterState,
  Product,
  UIStore,
} from "@/lib/types";

export function getFilteredProducts(
  products: Product[],
  category: CategorySlug | "all",
  sortBy: UIStore["sortBy"],
  filters: FilterState,
): Product[] {
  let result = [...products];

  if (category !== "all") {
    result = result.filter((product) => product.categorySlug === category);
  }

  if (filters.sizes.length > 0) {
    result = result.filter((product) =>
      product.variants.some(
        (variant) => filters.sizes.includes(variant.size) && variant.stock > 0,
      ),
    );
  }

  if (filters.colors.length > 0) {
    result = result.filter((product) =>
      product.variants.some(
        (variant) =>
          filters.colors.includes(variant.color) && variant.stock > 0,
      ),
    );
  }

  result = result.filter(
    (product) =>
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1],
  );

  if (filters.badges.length > 0) {
    result = result.filter(
      (product) => !!product.badge && filters.badges.includes(product.badge),
    );
  }

  if (filters.inStockOnly) {
    result = result.filter((product) =>
      product.variants.some((variant) => variant.stock > 0),
    );
  }

  switch (sortBy) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "bestseller":
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return result;
}
