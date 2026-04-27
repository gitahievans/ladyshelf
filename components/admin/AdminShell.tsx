"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { AdminPermissionSet, AdminStaffUser } from "@/lib/types";

interface AdminShellProps {
  children: ReactNode;
  permissions: AdminPermissionSet;
  user: AdminStaffUser;
}

interface AdminNavItem {
  href: string;
  icon: typeof LayoutDashboard;
  isVisible: (permissions: AdminPermissionSet) => boolean;
  label: string;
}

const navItems: AdminNavItem[] = [
  { href: "/admin", icon: LayoutDashboard, isVisible: (permissions) => permissions.dashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingBag, isVisible: (permissions) => permissions.orders.view, label: "Orders" },
  { href: "/admin/payments", icon: Wallet, isVisible: (permissions) => permissions.payments.view, label: "Payments" },
  { href: "/admin/customers", icon: Users, isVisible: (permissions) => permissions.customers.view, label: "Customers" },
  { href: "/admin/catalog", icon: Package, isVisible: (permissions) => permissions.catalog.view, label: "Catalog" },
  { href: "/admin/inventory", icon: Receipt, isVisible: (permissions) => permissions.inventory.view, label: "Inventory" },
  { href: "/admin/settings", icon: Settings, isVisible: (permissions) => permissions.settings.view, label: "Settings" },
  { href: "/admin/staff", icon: ShieldCheck, isVisible: (permissions) => permissions.staff.view, label: "Staff" },
];

function formatRole(role: AdminStaffUser["role"]): string {
  return role === "owner" ? "Owner" : "Attendant";
}

export default function AdminShell({
  children,
  permissions,
  user,
}: AdminShellProps): ReactElement {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <div className="min-h-screen flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-border-warm bg-obsidian px-6 py-6 text-ivory lg:col-span-1 lg:border-r lg:border-b-0 lg:px-8">
          <Link href="/admin" className="inline-flex items-center gap-3">
            <span className="font-cormorant text-h3 tracking-widest text-ivory">
              WAHI
            </span>
            <span className="font-dm-sans text-caption uppercase tracking-[0.18em] text-gold">
              Admin
            </span>
          </Link>
          <nav className="mt-8 flex flex-col gap-2">
            {navItems
              .filter((item) => item.isVisible(permissions))
              .map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 font-dm-sans text-body-sm transition-colors",
                      isActive
                        ? "bg-gold text-obsidian"
                        : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col bg-ivory">
          <header className="border-b border-border-warm px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-dm-sans text-label uppercase text-gold">
                  Staff Workspace
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold bg-gold px-4 py-3 font-dm-sans text-caption font-semibold uppercase tracking-widest text-obsidian transition-colors hover:bg-sand"
                >
                  <Store className="h-4 w-4" />
                  Back to Website
                </Link>
                <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-cream px-4 py-3">
                  <div>
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                      {`${user.firstName} ${user.lastName}`.trim() || user.email}
                    </p>
                    <p className="font-dm-sans text-caption text-text-muted">
                      {user.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-obsidian px-3 py-2 font-dm-sans text-caption uppercase tracking-widest text-ivory">
                    {formatRole(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
