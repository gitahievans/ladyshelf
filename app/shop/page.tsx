import { Suspense } from "react";

import ShopPageContent from "@/components/shop/ShopPageContent";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";

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
