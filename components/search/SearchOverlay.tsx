"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SearchBar from "@/components/search/SearchBar";
import SearchResultsPanel from "@/components/search/SearchResultsPanel";
import SearchSuggestionList from "@/components/search/SearchSuggestionList";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";
import { getSearchResultGroups, searchProducts } from "@/lib/utils/search";
import type { Category, Product, SearchFiltersState } from "@/lib/types";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultSearchFilters: SearchFiltersState = {
  category: "all",
  sizes: [],
  colors: [],
  priceRange: [1800, 12500],
  badges: [],
  inStockOnly: false,
};

const RECENT_SEARCHES_KEY = "wahi-recent-searches";

export default function SearchOverlay({
  open,
  onOpenChange,
}: SearchOverlayProps): ReactElement {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect((): void => {
    if (typeof window === "undefined") {
      return;
    }

    const storedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

    if (!storedSearches) {
      return;
    }

    try {
      const parsedSearches = JSON.parse(storedSearches) as string[];
      setRecentSearches(parsedSearches.slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void fetchCatalogSnapshot().then((snapshot) => {
      if (!isMounted) {
        return;
      }

      setCategories(snapshot.categories);
      setProducts(snapshot.products);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const results = useMemo(
    () =>
      searchProducts(
        products,
        categories,
        query,
        defaultSearchFilters,
        "newest",
      ).slice(0, 4),
    [categories, products, query],
  );
  const groups = useMemo(
    () => getSearchResultGroups(products, categories, query),
    [categories, products, query],
  );

  function persistRecentSearch(nextQuery: string): void {
    if (!nextQuery || typeof window === "undefined") {
      return;
    }

    const nextSearches = [
      nextQuery,
      ...recentSearches.filter((entry) => entry !== nextQuery),
    ].slice(0, 5);

    setRecentSearches(nextSearches);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
  }

  function navigateToSearch(nextQuery: string): void {
    const trimmedQuery = nextQuery.trim();
    persistRecentSearch(trimmedQuery);
    onOpenChange(false);

    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      return;
    }

    router.push("/search");
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="top-[50%] !grid max-h-[85vh] !w-[min(1280px,calc(100vw-5rem))] !max-w-[1280px] gap-6 overflow-y-auto rounded-[20px] border border-border-warm bg-cream p-6 text-obsidian shadow-card sm:!w-[min(1280px,calc(100vw-4rem))] sm:!max-w-[1280px] lg:p-8"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search Wahi Fashion</DialogTitle>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-start">
          <div className="space-y-6">
            <SearchBar
              autoFocus
              onClear={(): void => setQuery("")}
              onQueryChange={setQuery}
              onSubmit={(): void => navigateToSearch(query)}
              placeholder="Search blazers, ankara, silk, gold, or collections"
              query={query}
            />

            {recentSearches.length > 0 ? (
              <section className="space-y-3">
                <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((recentSearch) => (
                    <button
                      className="min-h-11 rounded-full border border-border-warm bg-ivory px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors hover:border-gold hover:text-obsidian"
                      key={recentSearch}
                      onClick={(): void => navigateToSearch(recentSearch)}
                      type="button"
                    >
                      {recentSearch}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <SearchSuggestionList groups={groups} onSelect={navigateToSearch} />
          </div>

          <div className="rounded-2xl border border-border-warm bg-ivory p-4 lg:p-5">
            <SearchResultsPanel
              compact
              products={results}
              query={query}
              resultLabel={query ? `${results.length} instant matches` : "Featured discovery"}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
