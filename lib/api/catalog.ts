import type { Category, CategorySlug, Product, UIStore } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getCatalogColors } from "@/lib/utils/catalog";

export interface CatalogSnapshot {
  categories: Category[];
  colors: ReturnType<typeof getCatalogColors>;
  products: Product[];
}

interface FetchCatalogProductsOptions {
  category?: CategorySlug | "all";
  featured?: boolean;
  limit?: number;
  newArrival?: boolean;
  query?: string;
  sortBy?: UIStore["sortBy"];
}

function buildProductsUrl(options: FetchCatalogProductsOptions): string {
  const searchParams = new URLSearchParams();

  if (options.category && options.category !== "all") {
    searchParams.set("category", options.category);
  }

  if (options.featured) {
    searchParams.set("featured", "true");
  }

  if (options.newArrival) {
    searchParams.set("new_arrival", "true");
  }

  if (options.query?.trim()) {
    searchParams.set("q", options.query.trim());
  }

  if (options.limit) {
    searchParams.set("limit", String(options.limit));
  }

  if (options.sortBy) {
    searchParams.set("sort", options.sortBy);
  }

  const queryString = searchParams.toString();

  return `${getApiBaseUrl()}/api/v1/catalog/products${queryString ? `?${queryString}` : ""}`;
}

export async function fetchCatalogCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/catalog/categories`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load categories.");
    }

    return (await response.json()) as Category[];
  } catch {
    return [];
  }
}

export async function fetchCatalogProducts(
  options: FetchCatalogProductsOptions = {},
): Promise<Product[]> {
  try {
    const response = await fetch(buildProductsUrl(options), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    return (await response.json()) as Product[];
  } catch {
    return [];
  }
}

export async function fetchCatalogProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/catalog/products/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Unable to load product.");
    }

    return (await response.json()) as Product;
  } catch {
    return null;
  }
}

export async function fetchCatalogProductVariantAvailability(
  slug: string,
  variantId: string,
): Promise<{
  product: Product;
  variant: Product["variants"][number];
} | null> {
  const product = await fetchCatalogProductBySlug(slug);

  if (!product) {
    return null;
  }

  const variant = product.variants.find((entry) => entry.id === variantId);

  if (!variant) {
    return null;
  }

  return {
    product,
    variant,
  };
}

export async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  const [categories, products] = await Promise.all([
    fetchCatalogCategories(),
    fetchCatalogProducts(),
  ]);

  return {
    categories,
    colors: getCatalogColors(products),
    products,
  };
}
