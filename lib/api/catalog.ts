import {
  allProducts as mockProducts,
  categories as mockCategories,
  getProductBySlug as getMockProductBySlug,
} from "@/lib/mock";
import type { Category, CategorySlug, Product, UIStore } from "@/lib/types";
import { getCatalogColors } from "@/lib/utils/catalog";
import { normalizeSearchQuery } from "@/lib/utils/search";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

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

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
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

function fallbackProducts(options: FetchCatalogProductsOptions = {}): Product[] {
  let products = [...mockProducts];

  if (options.category && options.category !== "all") {
    products = products.filter(
      (product) => product.categorySlug === options.category,
    );
  }

  if (options.featured) {
    products = products.filter((product) => product.isFeatured);
  }

  if (options.newArrival) {
    products = products.filter((product) => product.isNewArrival);
  }

  if (options.query?.trim()) {
    const normalizedQuery = normalizeSearchQuery(options.query);
    products = products.filter((product) =>
      normalizeSearchQuery(
        [
          product.name,
          product.description,
          product.categorySlug,
          product.tags.join(" "),
          product.material ?? "",
          product.badge ?? "",
        ].join(" "),
      ).includes(normalizedQuery),
    );
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case "newest":
        products.sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        );
        break;
      case "price-asc":
        products.sort((first, second) => first.price - second.price);
        break;
      case "price-desc":
        products.sort((first, second) => second.price - first.price);
        break;
      case "rating":
        products.sort((first, second) => second.rating - first.rating);
        break;
      case "bestseller":
        products.sort(
          (first, second) => second.reviewCount - first.reviewCount,
        );
        break;
    }
  }

  if (options.limit) {
    return products.slice(0, options.limit);
  }

  return products;
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
    return mockCategories;
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
    return fallbackProducts(options);
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
    return getMockProductBySlug(slug) ?? null;
  }
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
