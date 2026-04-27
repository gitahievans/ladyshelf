import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import AdminCatalogManager from "@/components/admin/AdminCatalogManager";
import { fetchAdminPermissions } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCatalogPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login?next=/admin/catalog");
  }

  const permissions = await fetchAdminPermissions(session.access_token);

  return <AdminCatalogManager canManage={permissions.catalog.manage} />;
}
