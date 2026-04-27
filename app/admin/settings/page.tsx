import type { ReactElement } from "react";
import { redirect } from "next/navigation";

import AdminForbiddenState from "@/components/admin/AdminForbiddenState";
import AdminSettingsManager from "@/components/admin/AdminSettingsManager";
import { AdminApiError, fetchAdminPermissions } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login?next=/admin/settings");
  }

  try {
    const permissions = await fetchAdminPermissions(session.access_token);

    if (!permissions.settings.manage) {
      return <AdminForbiddenState />;
    }

    return <AdminSettingsManager />;
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
