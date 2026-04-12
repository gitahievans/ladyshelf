"use client";

import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultsPanel from "@/components/search/SearchResultsPanel";
import SearchSuggestionList from "@/components/search/SearchSuggestionList";
import { allProducts } from "@/lib/mock";
import { getSearchResultGroups, searchProducts } from "@/lib/utils/search";
import type { BadgeType, SearchFiltersState, Size, UIStore } from "@/lib/types";
import { useUIStore } from "@/stores/uiStore";

const defaultSearchFilters: SearchFiltersState = {
  category: "all",
  sizes: [],
  colors: [],
  priceRange: [1800, 12500],
  badges: [],
  inStockOnly: false,
};

function getStringArray(values: string | null): string[] {
  if (!values) {
    return [];
  }

  return values.split(",").map((value) => value.trim()).filter(Boolean);
}

function getFiltersFromSearchParams(searchParams: URLSearchParams): SearchFiltersState {
  return {
    category:
      (searchParams.get("category") as SearchFiltersState["category"] | null) ?? "all",
    sizes: getStringArray(searchParams.get("size")) as Size[],
    colors: getStringArray(searchParams.get("color")),
    badges: getStringArray(searchParams.get("badge")) as BadgeType[],
    inStockOnly: searchParams.get("stock") === "in",
    priceRange: defaultSearchFilters.priceRange,
  };
}

function getSortFromSearchParams(searchParams: URLSearchParams): UIStore["sortBy"] {
  const sort = searchParams.get("sort");

  if (
    sort === "newest" ||
    sort === "price-asc" ||
    sort === "price-desc" ||
    sort === "rating" ||
    sort === "bestseller"
  ) {
    return sort;
  }

  return "newest";
}

export default function SearchPageContent(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const [draftQuery, setDraftQuery] = useState<string>(searchParams.get("q") ?? "");

  const query = searchParams.get("q") ?? "";
  const filters = useMemo(
    () => getFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const sortBy = useMemo(
    () => getSortFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const groups = useMemo(() => getSearchResultGroups(allProducts, query), [query]);
  const results = useMemo(
    () => searchProducts(allProducts, query, filters, sortBy),
    [filters, query, sortBy],
  );

  function updateSearchParams(
    nextQuery: string,
    nextFilters: SearchFiltersState,
    nextSortBy: UIStore["sortBy"],
  ): void {
    const nextParams = new URLSearchParams();

    if (nextQuery.trim()) {
      nextParams.set("q", nextQuery.trim());
    }

    if (nextFilters.category !== "all") {
      nextParams.set("category", nextFilters.category);
    }

    if (nextFilters.sizes.length > 0) {
      nextParams.set("size", nextFilters.sizes.join(","));
    }

    if (nextFilters.colors.length > 0) {
      nextParams.set("color", nextFilters.colors.join(","));
    }

    if (nextFilters.badges.length > 0) {
      nextParams.set("badge", nextFilters.badges.join(","));
    }

    if (nextFilters.inStockOnly) {
      nextParams.set("stock", "in");
    }

    if (nextSortBy !== "newest") {
      nextParams.set("sort", nextSortBy);
    }

    const search = nextParams.toString();
    router.replace(search ? `${pathname}?${search}` : pathname);
  }

  function handleSubmit(): void {
    updateSearchParams(draftQuery, filters, sortBy);
  }

  function handleReset(): void {
    setDraftQuery("");
    updateSearchParams("", defaultSearchFilters, "newest");
  }

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-8">
          <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
            <Link className="transition-colors hover:text-obsidian" href="/">
              Home
            </Link>
            <span>/</span>
            <span className="text-obsidian">Search</span>
          </nav>

          <div className="space-y-3">
            <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
              Discovery, tuned for intention
            </p>
            <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
              Search the Collection
            </h1>
            <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
              Search by silhouette, fabric, colour, category, or the mood you are
              dressing for.
            </p>
          </div>

          <SearchBar
            onClear={(): void => {
              setDraftQuery("");
              updateSearchParams("", filters, sortBy);
            }}
            onQueryChange={setDraftQuery}
            onSubmit={handleSubmit}
            query={draftQuery}
          />

          {query ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border-warm bg-cream p-4 md:flex-row md:items-center md:justify-between">
              <p className="font-dm-sans text-body text-obsidian">
                {results.length} {results.length === 1 ? "result" : "results"} for
                {" "}
                <span className="font-medium">"{query}"</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="min-h-11 rounded-full border border-border-warm px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors hover:border-gold hover:text-obsidian"
                  onClick={handleReset}
                  type="button"
                >
                  Clear All
                </button>
                <div className="flex rounded-full border border-border-warm bg-ivory p-1">
                  <button
                    className={`min-h-11 rounded-full px-4 font-dm-sans text-caption uppercase tracking-[0.14em] ${
                      viewMode === "grid"
                        ? "bg-obsidian text-ivory"
                        : "text-text-secondary"
                    }`}
                    onClick={(): void => setViewMode("grid")}
                    type="button"
                  >
                    Grid
                  </button>
                  <button
                    className={`min-h-11 rounded-full px-4 font-dm-sans text-caption uppercase tracking-[0.14em] ${
                      viewMode === "list"
                        ? "bg-obsidian text-ivory"
                        : "text-text-secondary"
                    }`}
                    onClick={(): void => setViewMode("list")}
                    type="button"
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <SearchSuggestionList
              groups={groups}
              onSelect={(value): void => {
                setDraftQuery(value);
                updateSearchParams(value, filters, sortBy);
              }}
            />
          )}

          <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <SearchFilters
              filters={filters}
              onFiltersChange={(nextFilters): void =>
                updateSearchParams(query, nextFilters, sortBy)
              }
              onReset={handleReset}
              onSortChange={(nextSortBy): void =>
                updateSearchParams(query, filters, nextSortBy)
              }
              sortBy={sortBy}
            />

            <SearchResultsPanel products={results} query={query} viewMode={viewMode} />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
