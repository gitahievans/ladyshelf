import type { ReactElement, ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminForbiddenState from "@/components/admin/AdminForbiddenState";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminApiError,
  fetchAdminMe,
  fetchAdminPermissions,
} from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login?next=/admin");
  }

  try {
    const [user, permissions] = await Promise.all([
      fetchAdminMe(session.access_token),
      fetchAdminPermissions(session.access_token),
    ]);

    return (
      <AdminShell user={user} permissions={permissions}>
        {children}
      </AdminShell>
    );
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
