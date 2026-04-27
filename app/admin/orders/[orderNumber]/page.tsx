import type { ReactElement } from "react";

import AdminOrderDetailManager from "@/components/admin/AdminOrderDetailManager";

interface AdminOrderDetailPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps): Promise<ReactElement> {
  const { orderNumber } = await params;

  return <AdminOrderDetailManager orderNumber={orderNumber} />;
}
