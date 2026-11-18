import { Suspense } from "react";

import ShopPageContent from "@/components/shop/ShopPageContent";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";

// Cached and refreshed every 5 minutes (matches CATALOG_REVALIDATE_SECONDS).
export const revalidate = 300;

export default async function ShopPage() {
  const { categories, products } = await fetchCatalogSnapshot();

  return (
    <Suspense fallback={null}>
      <ShopPageContent
        initialCategories={categories}
        initialProducts={products}
      />
    </Suspense>
  );
}
