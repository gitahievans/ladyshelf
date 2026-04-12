import { categories } from "@/lib/mock";
import { getFilteredProducts } from "@/lib/utils/filter";
import type {
  Product,
  SearchFiltersState,
  SearchResultGroup,
  UIStore,
} from "@/lib/types";

const EMPTY_QUERY_RESULT_LIMIT = 8;

function getSearchableText(product: Product): string {
  const categoryName =
    categories.find((category) => category.slug === product.categorySlug)?.name ?? "";
  const colors = product.variants.map((variant) => variant.color).join(" ");

  return [
    product.name,
    product.brand,
    product.categorySlug,
    categoryName,
    product.description,
    product.tags.join(" "),
    product.material ?? "",
    product.careInstructions ?? "",
    product.badge ?? "",
    colors,
  ]
    .join(" ")
    .toLowerCase();
}

function getMatchScore(product: Product, query: string): number {
  if (!query) {
    return 0;
  }

  const normalizedName = normalizeSearchQuery(product.name);
  const normalizedBrand = normalizeSearchQuery(product.brand);
  const normalizedTags = product.tags.map((tag) => normalizeSearchQuery(tag));
  const normalizedText = normalizeSearchQuery(getSearchableText(product));
  const tokens = query.split(" ").filter(Boolean);
  let score = 0;

  if (normalizedName === query) {
    score += 140;
  }

  if (normalizedName.includes(query)) {
    score += 100;
  }

  if (normalizedBrand.includes(query)) {
    score += 45;
  }

  if (normalizedTags.some((tag) => tag === query)) {
    score += 60;
  }

  if (normalizedTags.some((tag) => tag.includes(query))) {
    score += 40;
  }

  if (normalizedText.includes(query)) {
    score += 30;
  }

  for (const token of tokens) {
    if (normalizedName.includes(token)) {
      score += 24;
    }

    if (normalizedTags.some((tag) => tag.includes(token))) {
      score += 18;
    }

    if (normalizedText.includes(token)) {
      score += 10;
    }
  }

  return score;
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function scoreProductMatch(product: Product, normalizedQuery: string): number {
  return getMatchScore(product, normalizedQuery);
}

export function getSearchSuggestions(
  products: Product[],
  query: string,
): string[] {
  const normalizedQuery = normalizeSearchQuery(query);
  const suggestionPool = new Set<string>();

  products.forEach((product) => {
    suggestionPool.add(product.name);
    suggestionPool.add(product.categorySlug.replaceAll("-", " "));
    product.tags.forEach((tag) => suggestionPool.add(tag));
  });

  return [...suggestionPool]
    .filter((suggestion) =>
      normalizedQuery
        ? normalizeSearchQuery(suggestion).includes(normalizedQuery)
        : true,
    )
    .sort((first, second) => first.localeCompare(second))
    .slice(0, 8);
}

export function searchProducts(
  products: Product[],
  query: string,
  filters: SearchFiltersState,
  sortBy: UIStore["sortBy"],
): Product[] {
  const normalizedQuery = normalizeSearchQuery(query);
  const filteredProducts = getFilteredProducts(
    products,
    filters.category,
    sortBy,
    filters,
  );

  if (!normalizedQuery) {
    return filteredProducts.slice(0, EMPTY_QUERY_RESULT_LIMIT);
  }

  return filteredProducts
    .map((product) => ({
      product,
      score: scoreProductMatch(product, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return second.product.rating - first.product.rating;
    })
    .map(({ product }) => product);
}

export function getSearchResultGroups(
  products: Product[],
  query: string,
): SearchResultGroup[] {
  return [
    {
      title: "Suggested searches",
      items: getSearchSuggestions(products, query),
    },
    {
      title: "Collections",
      items: categories
        .map((category) => category.name)
        .filter((name) =>
          query ? normalizeSearchQuery(name).includes(normalizeSearchQuery(query)) : true,
        )
        .slice(0, 5),
    },
  ].filter((group) => group.items.length > 0);
}
