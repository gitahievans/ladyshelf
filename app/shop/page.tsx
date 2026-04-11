import type { ReactElement } from "react";
import { Suspense } from "react";

import ShopPageContent from "@/components/shop/ShopPageContent";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

function ShopPageFallback(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function ShopPage(): ReactElement {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  );
}
