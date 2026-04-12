import type { ReactElement } from "react";
import Link from "next/link";

import ProductGrid from "@/components/shop/ProductGrid";
import type { Product } from "@/lib/types";

import SearchEmptyState from "./SearchEmptyState";

interface SearchResultsPanelProps {
  products: Product[];
  query: string;
  resultLabel?: string;
  viewMode?: "grid" | "list";
  compact?: boolean;
}

export default function SearchResultsPanel({
  products,
  query,
  resultLabel,
  viewMode = "grid",
  compact = false,
}: SearchResultsPanelProps): ReactElement {
  if (products.length === 0) {
    return <SearchEmptyState query={query} />;
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-dm-sans text-body-sm text-text-secondary">
            {resultLabel ?? `${products.length} matching pieces`}
          </p>
          {query ? (
            <Link
              className="font-dm-sans text-caption uppercase tracking-[0.16em] text-bark transition-colors hover:text-obsidian"
              href={`/search?q=${encodeURIComponent(query)}`}
            >
              View All Results
            </Link>
          ) : null}
        </div>
        <ProductGrid products={products} viewMode="grid" />
      </div>
    );
  }

  return <ProductGrid products={products} viewMode={viewMode} />;
}
