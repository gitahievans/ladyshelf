import type { ReactElement } from "react";

import EmptyState from "@/components/shared/EmptyState";

interface SearchEmptyStateProps {
  query: string;
}

export default function SearchEmptyState({
  query,
}: SearchEmptyStateProps): ReactElement {
  return (
    <EmptyState
      ctaHref="/shop"
      ctaLabel="Browse the Collection"
      description={
        query
          ? `Nothing surfaced for "${query}". Try a broader phrase, a colour, or a collection name.`
          : "Start with a silhouette, a fabric, or the kind of moment you are dressing for."
      }
      title={query ? "Nothing found for that search" : "Start your search"}
    />
  );
}
