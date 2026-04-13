import type { ReactElement } from "react";
import { Suspense } from "react";

import SearchPageContent from "@/components/search/SearchPageContent";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

function SearchPageFallback(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function SearchPage(): ReactElement {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
