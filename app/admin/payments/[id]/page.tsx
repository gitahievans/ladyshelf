import type { ReactElement } from "react";

import AdminPaymentDetail from "@/components/admin/AdminPaymentDetail";

interface AdminPaymentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminPaymentDetailPage({
  params,
}: AdminPaymentDetailPageProps): Promise<ReactElement> {
  const { id } = await params;

  return <AdminPaymentDetail id={id} />;
}
