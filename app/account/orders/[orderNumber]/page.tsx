import type { ReactElement } from "react";
import { Suspense } from "react";

import AccountOrderDetail from "@/components/account/AccountOrderDetail";

interface AccountOrderDetailPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps): Promise<ReactElement> {
  const { orderNumber } = await params;

  return (
    <Suspense fallback={null}>
      <AccountOrderDetail orderNumber={orderNumber} />
    </Suspense>
  );
}
