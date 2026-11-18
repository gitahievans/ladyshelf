import type { Category, CategorySlug, Product, UIStore } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import { getCatalogColors } from "@/lib/utils/catalog";

// Server renders reuse catalog responses for a few minutes so product pages can be
// served from Vercel's cache instead of re-rendering (and calling the backend) on
// every visit. Browser calls (cart, checkout, live stock checks) always fetch fresh.
export const CATALOG_REVALIDATE_SECONDS = 300;
export const CATALOG_CACHE_TAG = "catalog";

const isServer = typeof window === "undefined";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

function catalogRequestInit(): RequestInit {
  return isServer
    ? { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] } }
    : { cache: "no-store" };
}

// On the server at runtime, rethrow so a backend blip can't be cached as an empty
// shop or a 404 product: Next keeps serving the last good page instead. During the
// build and in the browser, fall back so the build and the UI still work.
function catalogFallback<T>(error: unknown, fallback: T): T {
  if (isServer && !isBuild) {
    throw error;
  }

  return fallback;
}

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
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/catalog/categories`,
      catalogRequestInit(),
    );

    if (!response.ok) {
      throw new Error("Unable to load categories.");
    }

    return (await response.json()) as Category[];
  } catch (error) {
    return catalogFallback(error, []);
  }
}

export async function fetchCatalogProducts(
  options: FetchCatalogProductsOptions = {},
): Promise<Product[]> {
  try {
    const response = await fetch(buildProductsUrl(options), catalogRequestInit());

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    return (await response.json()) as Product[];
  } catch (error) {
    return catalogFallback(error, []);
  }
}

export async function fetchCatalogProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/catalog/products/${encodeURIComponent(slug)}`,
      catalogRequestInit(),
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Unable to load product.");
    }

    return (await response.json()) as Product;
  } catch (error) {
    return catalogFallback(error, null);
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
