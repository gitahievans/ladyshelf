import SearchPageContent from "@/components/search/SearchPageContent";
import { fetchCatalogSnapshot } from "@/lib/api/catalog";

export default async function SearchPage() {
  const { categories, products } = await fetchCatalogSnapshot();

  return (
    <SearchPageContent
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
