import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import AdminForbiddenState from "@/components/admin/AdminForbiddenState";
import AdminStaffManager from "@/components/admin/AdminStaffManager";
import { AdminApiError, fetchAdminPermissions } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStaffPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login?next=/admin/staff");
  }

  try {
    const permissions = await fetchAdminPermissions(session.access_token);

    if (!permissions.staff.manage) {
      return <AdminForbiddenState />;
    }

    return <AdminStaffManager />;
  } catch (error) {
    if (
      error instanceof AdminApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return <AdminForbiddenState />;
    }

    throw error;
  }
}
