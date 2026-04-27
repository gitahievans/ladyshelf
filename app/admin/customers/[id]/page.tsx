import type { ReactElement } from "react";

import AdminCustomerDetail from "@/components/admin/AdminCustomerDetail";

interface AdminCustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps): Promise<ReactElement> {
  const { id } = await params;

  return <AdminCustomerDetail id={id} />;
}
