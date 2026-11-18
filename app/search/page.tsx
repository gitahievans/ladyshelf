import { Suspense } from "react";

import SearchPageContent from "@/components/search/SearchPageContent";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";

// Cached and refreshed every 5 minutes (matches CATALOG_REVALIDATE_SECONDS).
export const revalidate = 300;

export default async function SearchPage() {
  const { categories, products } = await fetchCatalogSnapshot();

  return (
    <Suspense fallback={null}>
      <SearchPageContent
        initialCategories={categories}
        initialProducts={products}
      />
    </Suspense>
  );
}
