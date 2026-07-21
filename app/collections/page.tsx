import type { Metadata } from "next";
import type { ReactElement } from "react";

import CollectionsPageContent from "@/components/collections/CollectionsPageContent";
import { fetchCatalogCategories } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Collections | Lady Shelf",
  description:
    "Explore Lady Shelf's curated fashion collections for work, weekends, celebrations, and heritage-led dressing.",
};

export default async function CollectionsPage(): Promise<ReactElement> {
  const collections = await fetchCatalogCategories();

  return <CollectionsPageContent collections={collections} />;
}
